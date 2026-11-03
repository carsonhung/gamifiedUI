const LEAD_GAIN = 0.06;
const BASS_GAIN = 0.1;
const HAT_GAIN = 0.03;
const KICK_GAIN = 0.18;
/** How far ahead notes are queued; timers stutter, the audio clock does not. */
const LOOKAHEAD_S = 0.2;
const TICK_MS = 50;
/** Notes stop a touch early so repeated pitches stay distinct. */
const NOTE_GAP = 0.9;
const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function noteFrequency(name) {
    const match = /^([A-G])(#?)(\d)$/.exec(name);
    if (!match)
        throw new Error(`[gamifiedui-sfx] bad note ${name}`);
    const midi = 12 * (Number(match[3]) + 1) + NOTE_INDEX[match[1]] + (match[2] ? 1 : 0);
    return 440 * 2 ** ((midi - 69) / 12);
}
function parse(score) {
    const tokens = score.split(/\s+/).filter((token) => token && token !== '|');
    const slots = tokens.map(() => null);
    let held = null;
    tokens.forEach((token, i) => {
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
/** Browsers only allow audio after a user gesture, so the audio context is made on the first one. */
export function createMusic(options = {}) {
    const themes = new Map();
    let ctx = null;
    let master = null;
    let noise = null;
    let timer = 0;
    let playing = null;
    let wanted = null;
    let muted = options.muted ?? false;
    let step = 0;
    let nextTime = 0;
    const tone = (type, freq, at, length, gain) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(gain, at + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, at + length);
        osc.connect(env).connect(master);
        osc.start(at);
        osc.stop(at + length + 0.02);
    };
    const hat = (at) => {
        const source = ctx.createBufferSource();
        source.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const env = ctx.createGain();
        env.gain.setValueAtTime(HAT_GAIN, at);
        env.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
        source.connect(filter).connect(env).connect(master);
        source.start(at);
        source.stop(at + 0.05);
    };
    const kick = (at) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.frequency.setValueAtTime(130, at);
        osc.frequency.exponentialRampToValueAtTime(40, at + 0.12);
        env.gain.setValueAtTime(KICK_GAIN, at);
        env.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
        osc.connect(env).connect(master);
        osc.start(at);
        osc.stop(at + 0.15);
    };
    const tick = () => {
        const score = playing ? themes.get(playing) : undefined;
        if (!ctx || !score || score.lead.length === 0)
            return;
        const { bpm, hatEvery = 0, hasKick = false } = score.theme;
        const stepLength = 60 / bpm / 2;
        while (nextTime < ctx.currentTime + LOOKAHEAD_S) {
            const lead = score.lead[step];
            const bass = score.bass.length ? score.bass[step % score.bass.length] : null;
            if (lead)
                tone('square', lead.freq, nextTime, lead.steps * stepLength * NOTE_GAP, LEAD_GAIN);
            if (bass)
                tone('triangle', bass.freq, nextTime, bass.steps * stepLength * NOTE_GAP, BASS_GAIN);
            if (hatEvery && step % hatEvery === hatEvery - 1)
                hat(nextTime);
            if (hasKick && step % 4 === 0)
                kick(nextTime);
            step = (step + 1) % score.lead.length;
            nextTime += stepLength;
        }
    };
    const sync = () => {
        window.clearInterval(timer);
        if (!ctx || muted || !wanted || document.hidden || !themes.has(wanted)) {
            playing = null;
            return;
        }
        if (playing !== wanted) {
            playing = wanted;
            step = 0;
            nextTime = ctx.currentTime + 0.05;
        }
        timer = window.setInterval(tick, TICK_MS);
        tick();
    };
    const unlock = () => {
        if (ctx || typeof AudioContext === 'undefined')
            return;
        ctx = new AudioContext();
        master = ctx.createGain();
        master.gain.value = Math.min(1, Math.max(0, options.volume ?? 0.5));
        master.connect(ctx.destination);
        noise = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
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
            themes.set(name, { theme, lead: parse(theme.lead), bass: parse(theme.bass ?? '') });
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
    };
}
