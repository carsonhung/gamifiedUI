/**
 * Wires a gx-sound group to one or more targets. The first target is the source of truth (give it
 * the storageKey), and the others are brought in line with it at once. Moving the slider unmutes.
 */
export function soundControl(root, targets, { onChange } = {}) {
    const toggle = root.querySelector('.gx-sound-toggle');
    const slider = root.querySelector('.gx-sound-volume');
    const lead = targets[0];
    if (!toggle || !slider)
        throw new Error('[soundControl] missing .gx-sound-toggle or .gx-sound-volume inside the root');
    if (!lead)
        throw new Error('[soundControl] needs at least one target');
    const min = Number(slider.min || 0);
    const max = Number(slider.max || 1);
    const set = (muted, volume) => {
        targets.forEach((target) => {
            target.volume = volume;
            target.muted = muted;
        });
        sync();
        onChange?.({ muted, volume });
    };
    const sync = () => {
        toggle.setAttribute('aria-pressed', String(lead.muted));
        slider.value = String(min + lead.volume * (max - min));
        slider.style.setProperty('--gx-value', lead.volume.toFixed(3));
    };
    const onToggle = () => set(!lead.muted, lead.volume);
    const onInput = () => set(false, (Number(slider.value) - min) / (max - min));
    toggle.addEventListener('click', onToggle);
    slider.addEventListener('input', onInput);
    targets.slice(1).forEach((target) => {
        target.volume = lead.volume;
        target.muted = lead.muted;
    });
    sync();
    return {
        sync,
        destroy() {
            toggle.removeEventListener('click', onToggle);
            slider.removeEventListener('input', onInput);
        },
    };
}
