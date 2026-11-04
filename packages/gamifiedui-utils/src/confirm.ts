export type ConfirmTone = 'primary' | 'danger' | 'success' | 'warning';

export interface ConfirmOptions {
  message: string;
  /** Heading above the message; also names the dialog for screen readers. */
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /** Shown above the message in a gx-dialog-scene, e.g. a portrait beside a gx-textbox. */
  scene?: Node;
  /** Extra classes on the <dialog>, for per-game tweaks. */
  className?: string;
}

let nextId = 0;

/**
 * Asks a yes/no question in a gx-dialog instead of window.confirm, which embeds such as
 * itch.io iframes can block. Resolves true only for the confirm button; Escape, the cancel
 * button and closing the dialog any other way resolve false. Cancel has focus first, so a
 * stray Enter never confirms something destructive.
 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const id = `gx-confirm-${nextId++}`;
    const dialog = document.createElement('dialog');
    dialog.className = options.className ? `gx-dialog ${options.className}` : 'gx-dialog';
    dialog.setAttribute('aria-describedby', `${id}-message`);

    if (options.title) {
      const title = document.createElement('h2');
      title.id = `${id}-title`;
      title.className = 'gx-panel-title';
      title.textContent = options.title;
      dialog.setAttribute('aria-labelledby', title.id);
      dialog.append(title);
    }
    if (options.scene) {
      const scene = document.createElement('div');
      scene.className = 'gx-dialog-scene';
      scene.append(options.scene);
      dialog.append(scene);
    }

    const message = document.createElement('p');
    message.id = `${id}-message`;
    message.className = 'gx-dialog-text';
    message.textContent = options.message;

    const actions = document.createElement('form');
    actions.method = 'dialog';
    actions.className = 'gx-dialog-actions';
    const cancel = document.createElement('button');
    cancel.className = 'gx-btn gx-btn-ghost';
    cancel.value = 'cancel';
    cancel.textContent = options.cancelLabel ?? 'Cancel';
    const confirm = document.createElement('button');
    confirm.className = `gx-btn gx-btn-${options.tone ?? 'primary'}`;
    confirm.value = 'confirm';
    confirm.textContent = options.confirmLabel ?? 'OK';
    actions.append(cancel, confirm);

    dialog.append(message, actions);
    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve(dialog.returnValue === 'confirm');
    });
    document.body.append(dialog);
    dialog.showModal();
    cancel.focus();
  });
}
