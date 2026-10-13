export async function shareDemoFile(
  filename: string,
  mime: string,
  bytes: Uint8Array,
) {
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], { type: mime }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function copyDemoText(text: string) {
  await navigator.clipboard.writeText(text);
}
export async function shareOriginalAsset(
  asset: string | number,
  filename: string,
) {
  if (typeof asset !== 'string')
    throw new Error('Documento originale non disponibile');
  const response = await fetch(asset);
  if (!response.ok) throw new Error('Documento originale non disponibile');
  await shareDemoFile(
    filename,
    response.headers.get('content-type') ?? 'application/octet-stream',
    new Uint8Array(await response.arrayBuffer()),
  );
}
