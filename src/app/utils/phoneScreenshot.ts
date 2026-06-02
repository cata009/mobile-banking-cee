export type PhoneScreenshotMode = "visible" | "full";

type DownloadPhoneScreenshotOptions = {
  screenElement: HTMLElement;
  mode: PhoneScreenshotMode;
  filenamePrefix?: string;
};

type CreatePhoneScreenshotBlobOptions = {
  screenElement: HTMLElement;
  mode: PhoneScreenshotMode;
};

type ElementPair = {
  source: Element;
  clone: Element;
  computedStyle: CSSStyleDeclaration;
};

type ScrollablePair = ElementPair & {
  clientHeight: number;
  extraHeight: number;
  scrollHeight: number;
  scrollTop: number;
};

const SCREEN_WIDTH_FALLBACK = 375;
const SCREEN_HEIGHT_FALLBACK = 812;
const CANVAS_SCALE = 1;
const BOTTOM_NAVIGATION_SELECTOR = "[data-phone-bottom-navigation='true']";

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

  await inlineComputedStyles(pairs);
  copyFormState(pairs);

  const width = screenElement.clientWidth || SCREEN_WIDTH_FALLBACK;
  const visibleHeight = screenElement.clientHeight || SCREEN_HEIGHT_FALLBACK;
  const fullExtraHeight = scrollablePairs[0]?.extraHeight ?? 0;
  const height = mode === "full" ? Math.max(visibleHeight, visibleHeight + fullExtraHeight) : visibleHeight;

  prepareRootClone(clone, width, height);

  if (mode === "full") {
    expandScrollableContent(scrollablePairs, screenElement, clone, height);
  } else {
    preserveVisibleScrollOffsets(scrollablePairs);
  }

  await inlineImageSources(pairs);
  await inlineBackgroundImages(pairs);

  return { clone, width, height };
}

function toScrollablePair(pair: ElementPair): ScrollablePair | null {
  if (!(pair.source instanceof HTMLElement)) return null;

  const overflowY = pair.computedStyle.overflowY;
  const canScroll = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
  const extraHeight = pair.source.scrollHeight - pair.source.clientHeight;

  if (!canScroll || extraHeight <= 1) return null;

  return {
    ...pair,
    clientHeight: pair.source.clientHeight,
    extraHeight,
    scrollHeight: pair.source.scrollHeight,
    scrollTop: pair.source.scrollTop,
  };
}

async function inlineComputedStyles(pairs: ElementPair[]) {
  for (const { source, clone, computedStyle } of pairs) {
    if (!(clone instanceof HTMLElement || clone instanceof SVGElement)) continue;

    let cssText = "";
    for (let index = 0; index < computedStyle.length; index += 1) {
      const propertyName = computedStyle[index];
      const propertyValue = computedStyle.getPropertyValue(propertyName);
      const propertyPriority = computedStyle.getPropertyPriority(propertyName);
      cssText += `${propertyName}:${propertyValue}${propertyPriority ? ` !${propertyPriority}` : ""};`;
    }

    const existingStyle = clone.getAttribute("style");
    clone.setAttribute("style", existingStyle ? `${existingStyle};${cssText}` : cssText);

    if (source instanceof HTMLElement && clone instanceof HTMLElement) {
      clone.style.transform = computedStyle.transform === "none" ? "" : computedStyle.transform;
      clone.style.transformOrigin = computedStyle.transformOrigin;
    }
  }
}

function copyFormState(pairs: ElementPair[]) {
  for (const { source, clone } of pairs) {
    if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
      clone.value = source.value;
      if (source.checked) clone.setAttribute("checked", "checked");
      continue;
    }

    if (source instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
      clone.value = source.value;
      clone.textContent = source.value;
      continue;
    }

    if (source instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
      clone.value = source.value;
      Array.from(clone.options).forEach((option) => {
        if (option.value === source.value) {
          option.setAttribute("selected", "selected");
        } else {
          option.removeAttribute("selected");
        }
      });
    }
  }
}

function prepareRootClone(clone: HTMLElement, width: number, height: number) {
  clone.style.width = `${width}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.maxHeight = `${height}px`;
  clone.style.borderRadius = "0";
  clone.style.overflow = "hidden";
  clone.style.transform = "none";
  clone.style.position = "relative";
}

function expandScrollableContent(
  scrollablePairs: ScrollablePair[],
  screenElement: HTMLElement,
  screenClone: HTMLElement,
  outputHeight: number,
) {
  const primaryScrollable = scrollablePairs[0];
  const cloneBySource = new Map<Element, Element>();
  const sourceElements = [screenElement, ...Array.from(screenElement.querySelectorAll("*"))];
  const cloneElements = [screenClone, ...Array.from(screenClone.querySelectorAll("*"))];
  sourceElements.forEach((source, index) => {
    cloneBySource.set(source, cloneElements[index]);
  });

  for (const pair of scrollablePairs) {
    if (!(pair.clone instanceof HTMLElement)) continue;

    pair.clone.style.overflow = "visible";
    pair.clone.style.overflowY = "visible";
    pair.clone.style.height = `${pair.scrollHeight}px`;
    pair.clone.style.minHeight = `${pair.scrollHeight}px`;
    pair.clone.style.maxHeight = "none";
    pair.clone.style.scrollBehavior = "auto";

    if (pair.computedStyle.position === "absolute") {
      pair.clone.style.bottom = "auto";
    }
  }

  if (primaryScrollable) {
    let ancestor = primaryScrollable.source.parentElement;
    while (ancestor && ancestor !== screenElement.parentElement) {
      const cloneAncestor = cloneBySource.get(ancestor);
      if (cloneAncestor instanceof HTMLElement) {
        cloneAncestor.style.height = `${outputHeight}px`;
        cloneAncestor.style.minHeight = `${outputHeight}px`;
        cloneAncestor.style.maxHeight = "none";
        if (window.getComputedStyle(ancestor).position === "absolute") {
          cloneAncestor.style.bottom = "auto";
        }
      }

      if (ancestor === screenElement) break;
      ancestor = ancestor.parentElement;
    }
  }

  anchorBottomNavigationAtCaptureEnd(cloneBySource, screenElement, screenClone, outputHeight);
}

function anchorBottomNavigationAtCaptureEnd(
  cloneBySource: Map<Element, Element>,
  screenElement: HTMLElement,
  screenClone: HTMLElement,
  outputHeight: number,
) {
  const bottomNavigation = screenElement.querySelector(BOTTOM_NAVIGATION_SELECTOR);
  if (!(bottomNavigation instanceof HTMLElement)) return;

  const bottomNavigationWrapper = findBottomNavigationWrapper(bottomNavigation);
  const cloneWrapper = cloneBySource.get(bottomNavigationWrapper);
  if (!(cloneWrapper instanceof HTMLElement)) return;

  const wrapperHeight =
    bottomNavigationWrapper.getBoundingClientRect().height ||
    bottomNavigation.getBoundingClientRect().height ||
    54;

  screenClone.appendChild(cloneWrapper);
  cloneWrapper.style.position = "absolute";
  cloneWrapper.style.left = "0";
  cloneWrapper.style.right = "0";
  cloneWrapper.style.top = `${Math.max(0, outputHeight - wrapperHeight)}px`;
  cloneWrapper.style.bottom = "auto";
  cloneWrapper.style.width = `${screenElement.clientWidth || SCREEN_WIDTH_FALLBACK}px`;
  cloneWrapper.style.height = `${wrapperHeight}px`;
  cloneWrapper.style.minHeight = `${wrapperHeight}px`;
  cloneWrapper.style.maxHeight = `${wrapperHeight}px`;
  cloneWrapper.style.overflow = "visible";
  cloneWrapper.style.transform = "none";
  cloneWrapper.style.zIndex = "200";
}

function findBottomNavigationWrapper(bottomNavigation: HTMLElement) {
  let current = bottomNavigation.parentElement;

  while (current) {
    const computedStyle = window.getComputedStyle(current);
    const className = typeof current.className === "string" ? current.className : "";
    const isAnchoredWrapper =
      (computedStyle.position === "absolute" ||
        computedStyle.position === "fixed" ||
        computedStyle.position === "sticky") &&
      (computedStyle.bottom === "0px" || className.includes("bottom-0"));

    if (isAnchoredWrapper) return current;
    if (current.hasAttribute("data-phone-screen")) break;

    current = current.parentElement;
  }

  return bottomNavigation.parentElement ?? bottomNavigation;
}

function preserveVisibleScrollOffsets(scrollablePairs: ScrollablePair[]) {
  for (const pair of scrollablePairs) {
    if (!(pair.source instanceof HTMLElement) || !(pair.clone instanceof HTMLElement)) continue;
    if (pair.scrollTop <= 0) continue;

    pair.clone.style.overflow = "hidden";
    pair.clone.style.overflowY = "hidden";

    const cloneChildren = Array.from(pair.clone.childNodes);
    const sourceChildren = Array.from(pair.source.childNodes);
    const shiftedWrapper = document.createElement("div");
    shiftedWrapper.style.transform = `translateY(-${pair.scrollTop}px)`;
    shiftedWrapper.style.transformOrigin = "top left";
    shiftedWrapper.style.width = "100%";

    cloneChildren.forEach((child, index) => {
      const sourceChild = sourceChildren[index];
      const shouldStayPinned =
        sourceChild instanceof Element &&
        (window.getComputedStyle(sourceChild).position === "sticky" ||
          window.getComputedStyle(sourceChild).position === "fixed");

      if (!shouldStayPinned) {
        shiftedWrapper.appendChild(child);
      }
    });

    pair.clone.appendChild(shiftedWrapper);
  }
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
        const dataUrl = await resourceToDataUrl(match[1]);
        if (dataUrl) {
          nextBackgroundImage = nextBackgroundImage.replace(match[1], dataUrl);
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

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render screenshot image."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not export screenshot PNG."));
        }
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
