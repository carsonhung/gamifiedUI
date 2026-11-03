/**
 * Character voices. `say` reads a line with the browser's speech in the given language, pitched
 * per character; with no voice installed for that language it falls back to chiptune talk blips.
 */
export interface VoiceStyle {
  /** Speech pitch, 0 to 2. */
  pitch?: number;
  /** Speech rate, 0.1 to 10; also paces the blips. */
  rate?: number;
  /** Talk-blip base frequency in Hz. */
  blipHz?: number;
}

export interface SayOptions extends VoiceStyle {
  /** BCP 47 language, e.g. `zh-HK`, `zh-CN`, `en`. */
  lang?: string;
  /** Skip speech and always blip, for a retro feel. */
  isBlipOnly?: boolean;
}

export interface Voice {
  say(text: string, options?: SayOptions): void;
  blips(text: string, style?: VoiceStyle): void;
  cancel(): void;
  muted: boolean;
}

const BLIP_MS = 70;
const BLIP_GAIN = 0.05;
const DEFAULT_BLIP_HZ = 560;
/** Spaces and punctuation, Western and CJK, pause instead of blipping. */
const PAUSE = /[\s，。、！？…：；,.!?:;「」『』（）()—-]/u;

function findVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const want = lang.toLowerCase();
  const voices = speechSynthesis.getVoices();
  const norm = (v: SpeechSynthesisVoice): string => v.lang.toLowerCase().replace('_', '-');
  return voices.find((v) => norm(v) === want) ?? voices.find((v) => norm(v).startsWith(want.slice(0, 2))) ?? null;
}

export function createVoice(options: { muted?: boolean } = {}): Voice {
  let muted = options.muted ?? false;
  let ctx: AudioContext | null = null;
  // Chrome fills the voice list asynchronously; asking early has it ready by the first click.
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.getVoices();

  const voice: Voice = {
    blips(text, { rate = 1, blipHz = DEFAULT_BLIP_HZ } = {}) {
      if (muted || typeof AudioContext === 'undefined') return;
      ctx ??= new AudioContext();
      const audio = ctx;
      let at = audio.currentTime + 0.02;
      [...text].forEach((ch, i) => {
        if (PAUSE.test(ch)) {
          at += BLIP_MS / 1000;
          return;
        }
        const osc = audio.createOscillator();
        const env = audio.createGain();
        osc.type = 'square';
        osc.frequency.value = blipHz * (1 + ((i * 7) % 5) * 0.04);
        env.gain.setValueAtTime(BLIP_GAIN, at);
        env.gain.exponentialRampToValueAtTime(0.0001, at + (BLIP_MS * 0.8) / 1000);
        osc.connect(env).connect(audio.destination);
        osc.start(at);
        osc.stop(at + BLIP_MS / 1000);
        at += BLIP_MS / 1000 / rate;
      });
    },
    say(text, { lang = 'en', pitch = 1, rate = 1, blipHz, isBlipOnly = false } = {}) {
      if (muted) return;
      const found = isBlipOnly ? null : findVoice(lang);
      if (!found) return voice.blips(text, { rate, blipHz });
      speechSynthesis.cancel();
      const line = new SpeechSynthesisUtterance(text);
      line.voice = found;
      line.lang = found.lang;
      line.pitch = pitch;
      line.rate = rate;
      speechSynthesis.speak(line);
    },
    cancel() {
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    },
    get muted() {
      return muted;
    },
    set muted(next) {
      muted = next;
      if (next) voice.cancel();
    },
  };
  return voice;
}
