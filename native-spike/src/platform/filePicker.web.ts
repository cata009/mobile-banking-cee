import type { PickedDemoFile } from './filePicker';
export function pickLocalDocument(
  imagesOnly = false,
): Promise<PickedDemoFile | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = imagesOnly
      ? 'image/png,image/jpeg,image/webp'
      : '.pdf,.png,.jpg,.jpeg';
    input.addEventListener(
      'change',
      () => {
        const file = input.files?.[0];
        resolve(
          file
            ? {
                uri: URL.createObjectURL(file),
                name: file.name,
                mime: file.type,
                size: file.size,
              }
            : null,
        );
      },
      { once: true },
    );
    input.addEventListener('cancel', () => resolve(null), { once: true });
    input.click();
  });
}
