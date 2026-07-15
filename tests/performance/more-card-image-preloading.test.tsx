// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "@/app/App";
import {
  MORE_CARD_IMAGE_BY_TYPE,
  preloadMoreCardImages,
} from "@/app/config/moreCardAssets";

const appSource = readFileSync(
  resolve(process.cwd(), "src/app/App.tsx"),
  "utf8",
);
const moreScreenSource = readFileSync(
  resolve(process.cwd(), "src/app/screens/more/MoreScreen.tsx"),
  "utf8",
);

const requestedImageSources: string[] = [];

class ImageStub {
  decoding = "auto";

  set src(value: string) {
    requestedImageSources.push(value);
  }
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal("Image", ImageStub);
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      media: "",
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  cleanup();
  requestedImageSources.length = 0;
  window.history.replaceState({}, "", "/");
});

describe("More card image preload ownership", () => {
  it("keeps App source free of the More-card preload dependency", () => {
    expect(appSource).not.toContain('import { preloadMoreCardImages } from "@/app/config/moreCardAssets"');
    expect(appSource).not.toMatch(/preloadMoreCardImages\s*\(\s*\)/);
  });

  it("keeps contextual ownership in MoreScreen and passes only available cards", () => {
    expect(moreScreenSource).toContain("preloadMoreCardImages(availableCards)");
    expect(moreScreenSource).not.toMatch(/preloadMoreCardImages\s*\(\s*\)/);
  });

  it("requests selected sources only, deduplicates repeats, and ignores missing sources", () => {
    preloadMoreCardImages(["contacts", "documents"]);

    expect(requestedImageSources).toEqual([
      MORE_CARD_IMAGE_BY_TYPE.contacts,
      MORE_CARD_IMAGE_BY_TYPE.documents,
    ]);

    preloadMoreCardImages(["contacts", "contacts", "documents"]);
    expect(requestedImageSources).toHaveLength(2);

    const settingsSource = MORE_CARD_IMAGE_BY_TYPE.settings;
    MORE_CARD_IMAGE_BY_TYPE.settings = "";
    try {
      preloadMoreCardImages(["settings"]);
      expect(requestedImageSources).toHaveLength(2);
    } finally {
      MORE_CARD_IMAGE_BY_TYPE.settings = settingsSource;
    }
  });

  it("preserves the exact existing image path mapped to every card type", () => {
    expect(Object.fromEntries(
      Object.entries(MORE_CARD_IMAGE_BY_TYPE).map(([cardType, source]) => [
        cardType,
        source.split(/[\\/]/).at(-1),
      ]),
    )).toEqual({
      contacts: "4d22afc493e4ab72aca4b5793ce68cd204c58b7f.png",
      documents: "befcf83245a907a033553e7ac7902995e124d730.png",
      settings: "b756062d79e37b43d0eda8eee6125757ce5bb9bf.png",
      "gdpr-consent": "4d7abd397db5234d24f236a294f434a9b45b7d2b.png",
      "third-party-consent": "e017033a83e177f2a0d9a121d8161971ab5db3b5.png",
      "digital-activities": "947d85da595e4eb3e946a83cbab7bb8d8c148da1.png",
      "my-requests": "612ac7960c2d43bfdada538aae6f3cf27be44d99.png",
      tutorial: "fabdcbcfc3ceae62811fed754b790551b42a2f6e.png",
    });
  });

  it("makes no More-card image requests while App boots", () => {
    render(<App />);

    expect(requestedImageSources).toEqual([]);
  });
});
