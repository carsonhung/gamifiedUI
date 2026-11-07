/** Each wave at about the same loudness: a triangle sounds much quieter than a square at equal gain. */
const LEAD_GAIN = { square: 0.06, sawtooth: 0.05, triangle: 0.18, sine: 0.14, custom: 0.06 };
const BASS_GAIN = { square: 0.035, sawtooth: 0.035, triangle: 0.1, sine: 0.1, custom: 0.035 };
const HAT_GAIN = 0.03;
const SNARE_GAIN = 0.07;
const KICK_GAIN = 0.18;
/** How far ahead notes are queued; timers stutter, the audio clock does not. */
const LOOKAHEAD_S = 0.2;
const TICK_MS = 50;
/** Notes stop a touch early so repeated pitches stay distinct. */
const NOTE_GAP = 0.9;
const DEFAULT_FADE_S = 0.4;
const NOISE_S = 0.2;
const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const clamp01 = (n) => Math.min(1, Math.max(0, n));
export function noteFrequency(name) {
    const match = /^([A-G])([#b]?)(\d)$/.exec(name);
    if (!match)
        throw new Error(`[gamifiedui-sfx] bad note ${name}`);
    const shift = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
    const midi = 12 * (Number(match[3]) + 1) + NOTE_INDEX[match[1]] + shift;
    return 440 * 2 ** ((midi - 69) / 12);
}
const tokens = (score) => score.split(/\s+/).filter((token) => token && token !== '|');
function parse(score) {
    const steps = tokens(score);
    const slots = steps.map(() => null);
    let held = null;
    steps.forEach((token, i) => {
        if (token === '-') {
            if (held)
                held.steps++;
            return;
        }
        held = token === '.' ? null : { freq: noteFrequency(token), steps: 1 };
        slots[i] = held;
    });
    return slots;
}
function parseDrums(score) {
    return tokens(score).map((token) => {
        if (token === 'k' || token === 's' || token === 'h')
            return token;
        if (token === '.')
            return null;
        throw new Error(`[gamifiedui-sfx] bad drum ${token}`);
    });
}
/** Browsers only allow audio after a user gesture, so the audio context is made on the first one. */
export function createMusic(options = {}) {
    const themes = new Map();
    const fade = Math.max(0, options.fade ?? DEFAULT_FADE_S);
    let ctx = null;
    let master = null;
    let bus = null;
    let noise = null;
    let timer = 0;
    let playing = null;
    let wanted = null;
    let muted = options.muted ?? false;
    let volume = clamp01(options.volume ?? 0.5);
    let step = 0;
    let nextTime = 0;
    let isFinished = false;
    const tone = (type, freq, at, length, gain) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(gain, at + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, at + length);
        osc.connect(env).connect(bus);
        osc.start(at);
        osc.stop(at + length + 0.02);
    };
    const hiss = (at, length, gain, type, cutoff) => {
        const source = ctx.createBufferSource();
        source.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = cutoff;
        const env = ctx.createGain();
        env.gain.setValueAtTime(gain, at);
        env.gain.exponentialRampToValueAtTime(0.0001, at + length);
        source.connect(filter).connect(env).connect(bus);
        source.start(at);
        source.stop(at + length + 0.01);
    };
    const kick = (at) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.frequency.setValueAtTime(130, at);
        osc.frequency.exponentialRampToValueAtTime(40, at + 0.12);
        env.gain.setValueAtTime(KICK_GAIN, at);
        env.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
        osc.connect(env).connect(bus);
        osc.start(at);
        osc.stop(at + 0.15);
    };
    const drum = (kind, at) => {
        if (kind === 'k')
            kick(at);
        else if (kind === 's')
            hiss(at, 0.12, SNARE_GAIN, 'bandpass', 1800);
        else
            hiss(at, 0.04, HAT_GAIN, 'highpass', 7000);
    };
    const tick = () => {
        const score = playing ? themes.get(playing) : undefined;
        if (!ctx || !score || score.lead.length === 0 || isFinished)
            return;
        const { bpm, hatEvery = 0, hasKick = false, leadWave = 'square', bassWave = 'triangle', isLoop = true } = score.theme;
        const stepLength = 60 / bpm / 2;
        while (nextTime < ctx.currentTime + LOOKAHEAD_S) {
            const lead = score.lead[step];
            const bass = score.bass.length ? score.bass[step % score.bass.length] : null;
            if (lead)
                tone(leadWave, lead.freq, nextTime, lead.steps * stepLength * NOTE_GAP, LEAD_GAIN[leadWave]);
            if (bass)
                tone(bassWave, bass.freq, nextTime, bass.steps * stepLength * NOTE_GAP, BASS_GAIN[bassWave]);
            if (score.drums.length) {
                const hit = score.drums[step % score.drums.length];
                if (hit)
                    drum(hit, nextTime);
            }
            else {
                if (hatEvery && step % hatEvery === hatEvery - 1)
                    drum('h', nextTime);
                if (hasKick && step % 4 === 0)
                    kick(nextTime);
            }
            nextTime += stepLength;
            step++;
            if (step < score.lead.length)
                continue;
            step = 0;
            if (!isLoop) {
                isFinished = true;
                window.clearInterval(timer);
                return;
            }
        }
    };
    /** Fades the current theme out on its own bus, so the next one starts clean underneath. */
    const release = () => {
        if (!ctx || !bus)
            return;
        const old = bus;
        const now = ctx.currentTime;
        old.gain.cancelScheduledValues(now);
        old.gain.setValueAtTime(old.gain.value, now);
        old.gain.linearRampToValueAtTime(0, now + fade);
        window.setTimeout(() => old.disconnect(), fade * 1000 + 100);
        bus = null;
    };
    const sync = () => {
        window.clearInterval(timer);
        if (!ctx || !master || muted || !wanted || document.hidden || !themes.has(wanted)) {
            release();
            playing = null;
            return;
        }
        if (playing !== wanted || !bus) {
            release();
            bus = ctx.createGain();
            bus.connect(master);
            playing = wanted;
            step = 0;
            isFinished = false;
            nextTime = ctx.currentTime + 0.05;
        }
        if (isFinished)
            return;
        timer = window.setInterval(tick, TICK_MS);
        tick();
    };
    const unlock = () => {
        if (ctx || typeof AudioContext === 'undefined')
            return;
        ctx = new AudioContext();
        master = ctx.createGain();
        master.gain.value = volume;
        master.connect(ctx.destination);
        noise = ctx.createBuffer(1, ctx.sampleRate * NOISE_S, ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++)
            data[i] = Math.random() * 2 - 1;
        sync();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    document.addEventListener('visibilitychange', sync);
    return {
        define(name, theme) {
            themes.set(name, { theme, lead: parse(theme.lead), bass: parse(theme.bass ?? ''), drums: parseDrums(theme.drums ?? '') });
        },
        play(name) {
            if (wanted === name)
                return;
            wanted = name;
            sync();
        },
        get muted() {
            return muted;
        },
        set muted(next) {
            muted = next;
            sync();
        },
        get volume() {
            return volume;
        },
        set volume(next) {
            volume = clamp01(next);
            if (master && ctx)
                master.gain.setValueAtTime(volume, ctx.currentTime);
        },
    };
}
