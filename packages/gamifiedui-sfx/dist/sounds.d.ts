export type Wave = OscillatorType | 'noise';
/** One voice. `freq` slides to `to` over `dur` seconds; `at` delays the start. For noise, `freq` is the filter cutoff. */
export interface Tone {
    wave?: Wave;
    freq: number;
    to?: number;
    at?: number;
    dur: number;
    gain?: number;
    /** Filter for noise; `lowpass` by default. `bandpass` gives a hiss or a cash-drawer rattle, `highpass` a hat. */
    filter?: BiquadFilterType;
}
export type SoundSpec = readonly Tone[];
export declare const SOUNDS: {
    click: {
        wave: "square";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    }[];
    hover: {
        wave: "triangle";
        freq: number;
        dur: number;
        gain: number;
    }[];
    select: Tone[];
    confirm: Tone[];
    cancel: Tone[];
    success: Tone[];
    error: ({
        wave: "sawtooth";
        freq: number;
        dur: number;
        gain: number;
        at?: undefined;
    } | {
        wave: "sawtooth";
        freq: number;
        at: number;
        dur: number;
        gain: number;
    })[];
    blip: {
        wave: "square";
        freq: number;
        dur: number;
        gain: number;
    }[];
    notify: Tone[];
    coin: Tone[];
    pickup: {
        wave: "square";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    }[];
    open: Tone[];
    gift: ({
        wave: "noise";
        freq: number;
        dur: number;
        gain: number;
        at?: undefined;
        to?: undefined;
    } | {
        wave: "noise";
        freq: number;
        at: number;
        dur: number;
        gain: number;
        to?: undefined;
    } | {
        wave: "sine";
        freq: number;
        to: number;
        at: number;
        dur: number;
        gain: number;
    })[];
    flip: ({
        wave: "noise";
        freq: number;
        to: number;
        dur: number;
        gain: number;
        at?: undefined;
    } | {
        wave: "triangle";
        freq: number;
        at: number;
        dur: number;
        gain: number;
        to?: undefined;
    })[];
    jump: {
        wave: "square";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    }[];
    step: {
        wave: "noise";
        freq: number;
        dur: number;
        gain: number;
    }[];
    hit: ({
        wave: "noise";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    } | {
        wave: "square";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    })[];
    hurt: {
        wave: "square";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    }[];
    laser: {
        wave: "sawtooth";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    }[];
    explosion: ({
        wave: "noise";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    } | {
        wave: "sine";
        freq: number;
        to: number;
        dur: number;
        gain: number;
    })[];
    heal: ({
        wave: "triangle";
        freq: number;
        to: number;
        dur: number;
        gain: number;
        at?: undefined;
    } | {
        wave: "sine";
        freq: number;
        at: number;
        dur: number;
        gain: number;
        to?: undefined;
    })[];
    powerUp: Tone[];
    levelUp: Tone[];
    achievement: Tone[];
    gameOver: Tone[];
    heartUp: Tone[];
    heartFade: ({
        wave: "sine";
        freq: number;
        to: number;
        dur: number;
        gain: number;
        at?: undefined;
    } | {
        wave: "sine";
        freq: number;
        to: number;
        at: number;
        dur: number;
        gain: number;
    })[];
};
export type SoundName = keyof typeof SOUNDS;
