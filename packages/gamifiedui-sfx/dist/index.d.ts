import { SOUNDS, type SoundName, type SoundSpec } from './sounds.js';
export { SOUNDS };
export type { SoundName, SoundSpec, Tone, Wave } from './sounds.js';
export { createMusic, noteFrequency, type Music, type MusicOptions, type MusicTheme } from './music.js';
export { createVoice, type SayOptions, type Voice, type VoiceStyle } from './voice.js';
export interface PlayOptions {
    /** 0 to 1, multiplied with the master volume. */
    volume?: number;
    /** Frequency multiplier, e.g. 1.5 for higher. Handy for varying typewriter blips. */
    pitch?: number;
    /** Seconds to wait, e.g. to let a sizzle finish before the result chime. */
    delay?: number;
}
export interface SfxOptions {
    volume?: number;
    muted?: boolean;
    /** localStorage key that remembers volume and mute between visits. Off by default. */
    storageKey?: string;
}
export interface Sfx {
    play(sound: SoundName | (string & {}) | SoundSpec, options?: PlayOptions): void;
    define(name: string, spec: SoundSpec): void;
    volume: number;
    muted: boolean;
    /** Plays `data-gx-sfx` on click and `data-gx-sfx-hover` on pointer enter, inside `root`. Returns an unbind function. */
    bind(root?: ParentNode): () => void;
}
export declare function createSfx(options?: SfxOptions): Sfx;
