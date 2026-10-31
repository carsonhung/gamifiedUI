import { burst, dropzone, formatBytes, type FileRejection } from 'gamifiedui-utils';

import { byId, locale, t } from './core';

const MAX_BYTES = 2 * 1024 * 1024;
const UPLOAD_STEPS = 10;
const STEP_MS = 180;

function iconFor(file: File): string {
  if (file.type.startsWith('image/')) return 'gx-i-image';
  return 'gx-i-file';
}

export function setupUpload(): void {
  const list = byId('file-list');
  const empty = byId('files-empty');
  const status = byId('upload-status');
  const syncEmpty = (): void => {
    empty.hidden = list.children.length > 0;
  };

  const addFile = (file: File, rejection?: FileRejection): void => {
    const item = document.createElement('li');
    item.className = 'gx-file';
    item.dataset.state = rejection ? 'error' : 'uploading';

    const icon = document.createElement('span');
    icon.className = `gx-icon gx-icon-sm ${iconFor(file)}`;
    icon.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.className = 'gx-file-name';
    name.textContent = file.name;
    name.title = file.name;
    const size = document.createElement('span');
    size.className = 'gx-file-size';
    size.textContent = formatBytes(file.size, locale);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'gx-file-remove';
    remove.textContent = 'x';
    remove.setAttribute('aria-label', t('removeFile', { n: file.name }));
    item.append(icon, name, size, remove);

    let timer: number | null = null;
    remove.addEventListener('click', () => {
      if (timer !== null) window.clearInterval(timer);
      const next = (item.nextElementSibling ?? item.previousElementSibling)?.querySelector<HTMLElement>('.gx-file-remove');
      item.remove();
      syncEmpty();
      (next ?? byId('dropzone').querySelector('input'))?.focus();
    });

    if (rejection) {
      const message = document.createElement('p');
      message.className = 'gx-file-status';
      message.textContent = t(rejection === 'size' ? 'rejectSize' : 'rejectType');
      item.append(message);
      status.textContent = `${file.name}: ${message.textContent}`;
    } else {
      const bar = document.createElement('div');
      bar.className = 'gx-bar gx-bar-xp gx-file-progress';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-label', t('uploading', { n: file.name }));
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.style.setProperty('--gx-value', '0');
      item.append(bar);
      let step = 0;
      timer = window.setInterval(() => {
        step++;
        bar.style.setProperty('--gx-value', String(step / UPLOAD_STEPS));
        bar.setAttribute('aria-valuenow', String((step / UPLOAD_STEPS) * 100));
        if (step < UPLOAD_STEPS) return;
        if (timer !== null) window.clearInterval(timer);
        item.dataset.state = 'done';
        status.textContent = t('uploaded', { n: file.name });
        burst(item, { kind: 'xp', count: 10, spread: [1.5, 3] });
      }, STEP_MS);
    }
    list.append(item);
    syncEmpty();
  };

  dropzone(byId('dropzone'), {
    maxSize: MAX_BYTES,
    onFiles: (files) => files.forEach((file) => addFile(file)),
    onReject: (file, reason) => addFile(file, reason),
  });

  const avatar = byId<HTMLInputElement>('avatar-input');
  const avatarName = byId('avatar-name');
  avatar.addEventListener('change', () => {
    const file = avatar.files?.[0];
    avatarName.textContent = file ? `${file.name} (${formatBytes(file.size, locale)})` : t('noFile');
  });
  syncEmpty();
}
