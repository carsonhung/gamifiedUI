/**
 * Chiptune background music from tiny text scores. One token per eighth note: a note name such as
 * `C5`, `F#3` or `Bb2` starts a note, `-` holds it, `.` rests and `|` is a bar line for the reader.
 * A drum score uses `k` (kick), `s` (snare) and `h` (hi-hat) in place of notes.
 */
export interface MusicTheme {
    bpm: number;
    /** The melody. Its length sets the loop. */
    lead: string;
    /** The bass; loops on its own if shorter than the lead. */
    bass?: string;
    /** Wave for the melody; `square` by default. */
    leadWave?: OscillatorType;
    /** Wave for the bass; `triangle` by default. */
    bassWave?: OscillatorType;
    /** A drum score; loops on its own if shorter than the lead. Replaces `hatEvery` and `hasKick`. */
    drums?: string;
    /** A hi-hat every n eighth notes; 0 for none. */
    hatEvery?: number;
    /** A kick on every beat. */
    hasKick?: boolean;
    /** False plays the theme once, as for a fanfare, and then stays quiet. True by default. */
    isLoop?: boolean;
}
export interface MusicOptions {
    /** 0 to 1. */
    volume?: number;
    muted?: boolean;
    /** Seconds a theme takes to fade out when another takes over; 0 cuts. */
    fade?: number;
}
export interface Music {
    define(name: string, theme: MusicTheme): void;
    /** Starts or switches to a theme; null stops. Safe to call on every render: the same name keeps playing. */
    play(name: string | null): void;
    muted: boolean;
    /** 0 to 1. */
    volume: number;
}
export declare function noteFrequency(name: string): number;
/** Browsers only allow audio after a user gesture, so the audio context is made on the first one. */
export declare function createMusic(options?: MusicOptions): Music;
