
import { CANVAS_SCALE, SCREEN_HEIGHT_FALLBACK, SCREEN_WIDTH_FALLBACK } from "./phoneScreenshot/constants";
import { blobToDataUrl, inlineComputedStyles, canvasToBlob, copyFormState, createTimestamp, downloadBlob, expandScrollableContent, findPrimaryScrollableElement, getDirectElementText, getImageMimeType, getLayerName, inferFigmaLayerType, isRectOutsideFrame, loadImage, pickSerializableStyles, prepareRootClone, preserveVisibleScrollOffsets, round, toScrollablePair, waitForLayoutFrame } from "./phoneScreenshot/domCapture";
import { createFixedRootLayout, getFigmaReadyRootBackground, toFigmaReadyLayer } from "./phoneScreenshot/figmaLayers";
import { validateGeneratedFigmaPayload } from "./phoneScreenshot/figmaValidation";
import type { ElementPair, ScrollablePair, CreatePhoneFigmaJsonOptions, CreatePhoneScreenshotBlobOptions, DownloadPhoneScreenshotOptions, FigmaReadyAsset, FigmaReadyLayer, PhoneFigmaJsonPayload, PhoneFigmaLayer, PhoneScreenshotMode } from "./phoneScreenshot/figmaTypes";
export type { PhoneScreenshotMode, PhoneFigmaJsonPayload, PhoneFigmaLayer, FigmaReadyLayer, FigmaJsonQualityReport } from "./phoneScreenshot/figmaTypes";
export async function downloadPhoneScreenshot({
  screenElement,
  mode,
  filenamePrefix = "unicredit-phone",
}: DownloadPhoneScreenshotOptions) {
  const { blob } = await createPhoneScreenshotBlob({ screenElement, mode });
  downloadBlob(blob, `${filenamePrefix}-${mode}-${createTimestamp()}.png`);
}

export async function createPhoneScreenshotBlob({
  screenElement,
  mode,
}: CreatePhoneScreenshotBlobOptions) {
  const capture = await createPhoneCaptureClone(screenElement, mode);
  const blob = await renderElementToPng(capture.clone, capture.width, capture.height);

  return {
    blob,
    width: capture.width,
    height: capture.height,
  };
}

export async function createPhoneFigmaJson({
  screenElement,
  mode = "visible",
}: CreatePhoneFigmaJsonOptions) {
  const figmaSource = await createPhoneCaptureClone(screenElement, mode);
  const sourceElement = figmaSource.clone;
  const width = figmaSource.width;
  const height = figmaSource.height;
  const layers = await extractFigmaLayersFromCaptureClone(figmaSource.clone);
  const assets: FigmaReadyAsset[] = [];
  const rootChildren = layers
    .map((layer) => toFigmaReadyLayer(layer, assets, width))
    .filter((layer): layer is FigmaReadyLayer => Boolean(layer))
    .map((layer) => ({
      ...layer,
      autoLayoutChild: { layoutPositioning: "ABSOLUTE" as const },
    }));
  const rootBackground = getFigmaReadyRootBackground(sourceElement, rootChildren, width, height);
  const payload: PhoneFigmaJsonPayload = {
    schema: "build-ui.screen.v1",
    frame: {
      width,
      height,
      background: rootBackground,
    },
    root: {
      type: "container",
      name: "Screen",
      bounds: { x: 0, y: 0, width, height },
      layout: createFixedRootLayout(),
      styles: {
        fills: [{ type: "SOLID", color: { hex: rootBackground } }],
        effects: [],
      },
      children: rootChildren,
    },
    assets,
    source: {
      generator: "phone-screenshot",
      mode,
    },
  };
  const quality = validateGeneratedFigmaPayload(payload);
  if (quality.errors.length > 0) {
    throw new Error(`Generated Figma JSON failed validation: ${quality.errors.slice(0, 3).join(" ")}`);
  }
  if (quality.warnings.length > 0) {
    payload.warnings = quality.warnings;
  }

  return JSON.stringify(payload, null, 2);
}

async function createPhoneCaptureClone(screenElement: HTMLElement, mode: PhoneScreenshotMode) {
  const clone = screenElement.cloneNode(true) as HTMLElement;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  const sourceElements = [screenElement, ...Array.from(screenElement.querySelectorAll("*"))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll("*"))];
  const pairs = sourceElements
    .map((source, index): ElementPair | null => {
      const cloneElement = cloneElements[index];
      if (!cloneElement) return null;
      return {
        source,
        clone: cloneElement,
        computedStyle: window.getComputedStyle(source),
      };
    })
    .filter((pair): pair is ElementPair => Boolean(pair));

  const scrollablePairs = pairs
    .map(toScrollablePair)
    .filter((pair): pair is ScrollablePair => Boolean(pair))
    .sort((a, b) => b.extraHeight - a.extraHeight);

  inlineComputedStyles(pairs);
  copyFormState(pairs);

  const width = screenElement.clientWidth || SCREEN_WIDTH_FALLBACK;
  const visibleHeight = screenElement.clientHeight || SCREEN_HEIGHT_FALLBACK;
  const fullExtraHeight = scrollablePairs[0]?.extraHeight ?? 0;
  const height = mode === "full" ? Math.max(visibleHeight, visibleHeight + fullExtraHeight) : visibleHeight;

  prepareRootClone(clone, width, height);

  if (mode === "full") {
    expandScrollableContent(scrollablePairs, pairs, screenElement, clone, height);
  } else {
    preserveVisibleScrollOffsets(scrollablePairs);
  }

  await inlineImageSources(pairs);
  await inlineBackgroundImages(pairs);

  return { clone, width, height };
}

async function extractFigmaLayers(screenElement: HTMLElement, mode: PhoneScreenshotMode) {
  const rootRect = screenElement.getBoundingClientRect();
  const scrollableElement = findPrimaryScrollableElement(screenElement);
  const children = mode === "visible"
    ? Array.from(screenElement.children)
    : Array.from((scrollableElement ?? screenElement).children);

  const layers = await Promise.all(
    children.map((child, index) => createFigmaLayer(child, rootRect, `${index + 1}`)),
  );

  return layers.filter((layer): layer is PhoneFigmaLayer => Boolean(layer));
}

async function extractFigmaLayersFromCaptureClone(clone: HTMLElement) {
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-10000px";
  mount.style.top = "0";
  mount.style.width = clone.style.width || `${SCREEN_WIDTH_FALLBACK}px`;
  mount.style.pointerEvents = "none";
  mount.style.zIndex = "-1";
  document.body.appendChild(mount);
  mount.appendChild(clone);

  try {
    await waitForLayoutFrame();
    return await extractFigmaLayers(clone, "visible");
  } finally {
    mount.remove();
  }
}

async function createFigmaLayer(
  element: Element,
  rootRect: DOMRect,
  id: string,
): Promise<PhoneFigmaLayer | null> {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) return null;

  const computedStyle = window.getComputedStyle(element);
  if (
    computedStyle.display === "none" ||
    computedStyle.visibility === "hidden" ||
    Number(computedStyle.opacity) === 0
  ) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0.5 || rect.height <= 0.5) return null;
  if (isRectOutsideFrame(rect, rootRect)) return null;

  const children = await Promise.all(
    Array.from(element.children).map((child, index) => (
      createFigmaLayer(child, rootRect, `${id}.${index + 1}`)
    )),
  );
  const visibleChildren = children.filter((layer): layer is PhoneFigmaLayer => Boolean(layer));
  const text = getDirectElementText(element);
  const type = inferFigmaLayerType(element, computedStyle, text, visibleChildren);
  const asset = await getLayerAsset(element, computedStyle);

  if (type === "group" && visibleChildren.length === 0) return null;

  return {
    id,
    type,
    name: getLayerName(element, type, text),
    x: round(rect.left - rootRect.left),
    y: round(rect.top - rootRect.top),
    width: round(rect.width),
    height: round(rect.height),
    ...(text ? { text } : {}),
    ...(asset ? { asset } : {}),
    styles: pickSerializableStyles(computedStyle),
    ...(visibleChildren.length > 0 ? { children: visibleChildren } : {}),
  };
}

async function getLayerAsset(element: Element, computedStyle: CSSStyleDeclaration) {
  if (element instanceof HTMLImageElement) {
    const sourceUrl = element.currentSrc || element.src;
    const dataUrl = await resourceToDataUrl(sourceUrl);
    return dataUrl ? { mimeType: getImageMimeType(dataUrl), dataUrl } : undefined;
  }

  if (element instanceof SVGElement && element.tagName.toLowerCase() === "svg") {
    const serializedSvg = new XMLSerializer().serializeToString(element);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`;
    return { mimeType: "image/svg+xml" as const, dataUrl };
  }

  const backgroundImage = computedStyle.backgroundImage;
  if (!backgroundImage || backgroundImage === "none") return undefined;

  const urlMatch = backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
  if (!urlMatch) return undefined;

  const backgroundUrl = urlMatch[1];
  if (!backgroundUrl) return undefined;
  const dataUrl = await resourceToDataUrl(backgroundUrl);
  return dataUrl ? { mimeType: getImageMimeType(dataUrl), dataUrl } : undefined;
}

async function inlineImageSources(pairs: ElementPair[]) {
  await Promise.all(
    pairs.map(async ({ source, clone }) => {
      if (!(source instanceof HTMLImageElement) || !(clone instanceof HTMLImageElement)) return;

      const sourceUrl = source.currentSrc || source.src;
      const dataUrl = await resourceToDataUrl(sourceUrl);
      if (!dataUrl) return;

      clone.setAttribute("src", dataUrl);
      clone.removeAttribute("srcset");
      clone.removeAttribute("loading");
    }),
  );
}

async function inlineBackgroundImages(pairs: ElementPair[]) {
  await Promise.all(
    pairs.map(async ({ clone }) => {
      if (!(clone instanceof HTMLElement)) return;

      const backgroundImage = clone.style.backgroundImage;
      if (!backgroundImage || backgroundImage === "none") return;

      const urls = Array.from(backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g));
      if (urls.length === 0) return;

      let nextBackgroundImage = backgroundImage;
      for (const match of urls) {
        const backgroundUrl = match[1];
        if (!backgroundUrl) continue;
        const dataUrl = await resourceToDataUrl(backgroundUrl);
        if (dataUrl) {
          nextBackgroundImage = nextBackgroundImage.replace(backgroundUrl, dataUrl);
        }
      }

      clone.style.backgroundImage = nextBackgroundImage;
    }),
  );
}

async function resourceToDataUrl(rawUrl: string) {
  if (!rawUrl || rawUrl.startsWith("data:")) return rawUrl;

  try {
    const absoluteUrl = new URL(rawUrl, window.location.href).href;
    const response = await fetch(absoluteUrl, { cache: "force-cache" });
    if (!response.ok) return null;

    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

async function renderElementToPng(element: HTMLElement, width: number, height: number) {
  const serializedElement = new XMLSerializer().serializeToString(element);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<foreignObject width="100%" height="100%">${serializedElement}</foreignObject>`,
    "</svg>",
  ].join("");
  const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * CANVAS_SCALE);
  canvas.height = Math.ceil(height * CANVAS_SCALE);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create screenshot canvas context.");
  }

  context.scale(CANVAS_SCALE, CANVAS_SCALE);
  context.drawImage(image, 0, 0, width, height);

  return await canvasToBlob(canvas);
}
