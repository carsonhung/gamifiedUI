/**
 * Chiptune background music from tiny text scores. One token per eighth note: a note name such as
 * `C5` or `F#3` starts a note, `-` holds it, `.` rests and `|` is a bar line for the reader.
 */
export interface MusicTheme {
    bpm: number;
    /** Square-wave melody. Its length sets the loop. */
    lead: string;
    /** Triangle-wave bass; loops on its own if shorter than the lead. */
    bass?: string;
    /** A hi-hat every n eighth notes; 0 for none. */
    hatEvery?: number;
    /** A kick on every beat. */
    hasKick?: boolean;
}
export interface MusicOptions {
    /** 0 to 1. */
    volume?: number;
    muted?: boolean;
}
export interface Music {
    define(name: string, theme: MusicTheme): void;
    /** Starts or switches to a theme; null stops. Safe to call on every render: the same name keeps playing. */
    play(name: string | null): void;
    muted: boolean;
}
export declare function noteFrequency(name: string): number;
/** Browsers only allow audio after a user gesture, so the audio context is made on the first one. */
export declare function createMusic(options?: MusicOptions): Music;
