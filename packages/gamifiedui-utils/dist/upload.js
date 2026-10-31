/** 1536 -> "1.5 KB". Uses the locale's number format. */
export function formatBytes(bytes, locale) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    const digits = unit === 0 || value >= 10 ? 0 : 1;
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}
/** True when the file matches an accept list such as "image/*,.json,application/pdf". */
export function matchesAccept(file, accept) {
    const rules = accept.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
    if (!rules.length)
        return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return rules.some((rule) => rule.startsWith('.') ? name.endsWith(rule)
        : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1))
            : type === rule);
}
/**
 * Adds drag and drop to a .gx-dropzone. data-dragging is set while files hover it and
 * data-invalid briefly after a rejected drop. Files from the picker go through the same checks.
 */
export function dropzone(zone, options) {
    const input = options.input ?? zone.querySelector('input[type="file"]');
    const accept = options.accept ?? input?.accept ?? '';
    const multiple = options.multiple ?? input?.multiple ?? false;
    let depth = 0;
    let invalidTimer = null;
    const hasFiles = (e) => Array.from(e.dataTransfer?.types ?? []).includes('Files');
    const isDisabled = () => input?.disabled ?? false;
    const flagInvalid = () => {
        zone.dataset.invalid = '';
        if (invalidTimer !== null)
            window.clearTimeout(invalidTimer);
        invalidTimer = window.setTimeout(() => delete zone.dataset.invalid, 1500);
    };
    const take = (list) => {
        const accepted = [];
        for (const file of Array.from(list)) {
            if (!multiple && accepted.length)
                options.onReject?.(file, 'count');
            else if (accept && !matchesAccept(file, accept))
                options.onReject?.(file, 'type');
            else if (options.maxSize !== undefined && file.size > options.maxSize)
                options.onReject?.(file, 'size');
            else
                accepted.push(file);
        }
        if (accepted.length < Array.from(list).length)
            flagInvalid();
        if (accepted.length)
            options.onFiles(accepted);
    };
    const onEnter = (e) => {
        if (!hasFiles(e) || isDisabled())
            return;
        e.preventDefault();
        if (depth++ === 0)
            zone.dataset.dragging = '';
    };
    const onOver = (e) => {
        if (!hasFiles(e) || isDisabled())
            return;
        e.preventDefault();
        if (e.dataTransfer)
            e.dataTransfer.dropEffect = 'copy';
    };
    const onLeave = (e) => {
        if (!hasFiles(e))
            return;
        depth = Math.max(0, depth - 1);
        if (depth === 0)
            delete zone.dataset.dragging;
    };
    const onDrop = (e) => {
        if (!hasFiles(e) || isDisabled())
            return;
        e.preventDefault();
        depth = 0;
        delete zone.dataset.dragging;
        if (e.dataTransfer)
            take(e.dataTransfer.files);
    };
    const onChange = () => {
        if (input?.files?.length)
            take(input.files);
        if (input)
            input.value = '';
    };
    zone.addEventListener('dragenter', onEnter);
    zone.addEventListener('dragover', onOver);
    zone.addEventListener('dragleave', onLeave);
    zone.addEventListener('drop', onDrop);
    input?.addEventListener('change', onChange);
    return {
        destroy() {
            zone.removeEventListener('dragenter', onEnter);
            zone.removeEventListener('dragover', onOver);
            zone.removeEventListener('dragleave', onLeave);
            zone.removeEventListener('drop', onDrop);
            input?.removeEventListener('change', onChange);
            if (invalidTimer !== null)
                window.clearTimeout(invalidTimer);
        },
    };
}
