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
export declare function createVoice(options?: {
    muted?: boolean;
}): Voice;
