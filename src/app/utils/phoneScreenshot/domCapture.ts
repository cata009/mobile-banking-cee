/**
 * DOM-side capture helpers: scroll handling, clone preparation, style inlining, and blob/image plumbing.
 *
 * Extracted verbatim from phoneScreenshot.ts.
 */

import { BOTTOM_NAVIGATION_SELECTOR, SCREEN_WIDTH_FALLBACK } from "./constants";
import type { ElementPair, PhoneFigmaLayer, PhoneFigmaLayerAsset, PhoneFigmaLayerType, ScrollablePair } from "./figmaTypes";
export function waitForLayoutFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

export function findPrimaryScrollableElement(screenElement: HTMLElement) {
  const candidates = [screenElement, ...Array.from(screenElement.querySelectorAll("*"))]
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .map((element) => ({
      element,
      extraHeight: element.scrollHeight - element.clientHeight,
      computedStyle: window.getComputedStyle(element),
    }))
    .filter(({ extraHeight, computedStyle }) => {
      const canScroll =
        computedStyle.overflowY === "auto" ||
        computedStyle.overflowY === "scroll" ||
        computedStyle.overflowY === "overlay";

      return canScroll && extraHeight > 1;
    })
    .sort((a, b) => b.extraHeight - a.extraHeight);

  return candidates[0]?.element ?? null;
}

export function isRectOutsideFrame(rect: DOMRect, frameRect: DOMRect) {
  return (
    rect.right < frameRect.left ||
    rect.left > frameRect.right ||
    rect.bottom < frameRect.top ||
    rect.top > frameRect.bottom
  );
}

export function inferFigmaLayerType(
  element: Element,
  computedStyle: CSSStyleDeclaration,
  text: string,
  children: PhoneFigmaLayer[],
): PhoneFigmaLayerType {
  const tagName = element.tagName.toLowerCase();

  if (element instanceof HTMLImageElement) return "image";
  if (element instanceof SVGElement || tagName === "svg") return "vector";
  if (text && children.length === 0) return "text";
  if (
    computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)" ||
    computedStyle.backgroundImage !== "none" ||
    computedStyle.borderTopWidth !== "0px" ||
    computedStyle.boxShadow !== "none"
  ) {
    return "shape";
  }

  return "group";
}

export function getDirectElementText(element: Element) {
  const text = Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text) return text;
  if (element.children.length > 0) return "";

  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function getLayerName(element: Element, type: PhoneFigmaLayerType, text: string) {
  const explicitName =
    element.getAttribute("data-ds-label") ||
    element.getAttribute("data-name") ||
    element.getAttribute("aria-label");

  if (explicitName) return explicitName;
  if (text) return text.slice(0, 48);

  return `${type}:${element.tagName.toLowerCase()}`;
}

export function getImageMimeType(dataUrl: string): PhoneFigmaLayerAsset["mimeType"] {
  if (dataUrl.startsWith("data:image/jpeg")) return "image/jpeg";
  if (dataUrl.startsWith("data:image/webp")) return "image/webp";
  if (dataUrl.startsWith("data:image/svg+xml")) return "image/svg+xml";
  return "image/png";
}

export function pickSerializableStyles(computedStyle: CSSStyleDeclaration) {
  return {
    display: computedStyle.display,
    position: computedStyle.position,
    backgroundColor: computedStyle.backgroundColor,
    backgroundImage: computedStyle.backgroundImage,
    color: computedStyle.color,
    opacity: computedStyle.opacity,
    fontFamily: computedStyle.fontFamily,
    fontSize: computedStyle.fontSize,
    fontWeight: computedStyle.fontWeight,
    lineHeight: computedStyle.lineHeight,
    letterSpacing: computedStyle.letterSpacing,
    textAlign: computedStyle.textAlign,
    whiteSpace: computedStyle.whiteSpace,
    borderRadius: computedStyle.borderRadius,
    borderColor: computedStyle.borderTopColor,
    borderWidth: computedStyle.borderTopWidth,
    boxShadow: computedStyle.boxShadow,
    overflow: computedStyle.overflow,
    transform: computedStyle.transform,
  };
}

export function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function toScrollablePair(pair: ElementPair): ScrollablePair | null {
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

export function inlineComputedStyles(pairs: ElementPair[]) {
  for (const { source, clone, computedStyle } of pairs) {
    if (!(clone instanceof HTMLElement || clone instanceof SVGElement)) continue;

    let cssText = "";
    for (let index = 0; index < computedStyle.length; index += 1) {
      const propertyName = computedStyle.item(index);
      if (!propertyName) continue;
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

export function copyFormState(pairs: ElementPair[]) {
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

export function prepareRootClone(clone: HTMLElement, width: number, height: number) {
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

export function expandScrollableContent(
  scrollablePairs: ScrollablePair[],
  pairs: ElementPair[],
  screenElement: HTMLElement,
  screenClone: HTMLElement,
  outputHeight: number,
) {
  const primaryScrollable = scrollablePairs[0];
  const cloneBySource = new Map<Element, Element>(
    pairs.map(({ source, clone }) => [source, clone]),
  );

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

export function anchorBottomNavigationAtCaptureEnd(
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

export function findBottomNavigationWrapper(bottomNavigation: HTMLElement) {
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

export function preserveVisibleScrollOffsets(scrollablePairs: ScrollablePair[]) {
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

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render screenshot image."));
    image.src = src;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
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

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
