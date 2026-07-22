/**
 * Types for the phone screenshot exporter and its Figma-ready JSON payload.
 *
 * Extracted verbatim from phoneScreenshot.ts.
 */

export type PhoneScreenshotMode = "visible" | "full";

export type PhoneFigmaLayerType = "group" | "shape" | "text" | "image" | "vector";

export type FigmaReadyLayerType = "container" | "shape" | "text" | "ellipse" | "line" | "vector" | "image";

export type FigmaReadyBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FigmaReadyPaint = {
  type: "SOLID";
  color: {
    hex: string;
  };
  opacity?: number;
};

export type FigmaReadyEffect = {
  type: "DROP_SHADOW";
  color: {
    rgba: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  };
  offset: {
    x: number;
    y: number;
  };
  radius: number;
  spread: number;
  visible: boolean;
  blendMode: "NORMAL";
};

export type FigmaReadyStyles = {
  fills?: FigmaReadyPaint[];
  strokes?: FigmaReadyPaint[];
  strokeWeight?: number;
  cornerRadius?: number;
  effects?: FigmaReadyEffect[];
  opacity?: number;
};

export type FigmaReadyLayout = {
  mode: "VERTICAL" | "HORIZONTAL";
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  gap: number;
  primaryAxisSizingMode: "FIXED" | "AUTO";
  counterAxisSizingMode: "FIXED" | "AUTO";
  primaryAxisAlignItems: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems: "MIN" | "CENTER" | "MAX";
};

export type FigmaReadyAutoLayoutChild = {
  layoutPositioning: "AUTO" | "ABSOLUTE";
  layoutGrow?: number;
  layoutAlign?: "INHERIT";
};

export type FigmaReadyLayer = {
  type: FigmaReadyLayerType;
  name: string;
  bounds: FigmaReadyBounds;
  layout?: FigmaReadyLayout;
  autoLayoutChild?: FigmaReadyAutoLayoutChild;
  assetRef?: string;
  text?: {
    characters: string;
    fontName: {
      family: "Inter";
      style: "Regular" | "Medium" | "Semi Bold" | "Bold";
    };
    fontSize: number;
    lineHeight: {
      unit: "PIXELS";
      value: number;
    };
      letterSpacing: {
        unit: "PIXELS";
        value: number;
      };
      textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT";
      textAlignVertical: "TOP";
      allowWrap?: boolean;
    };
  styles?: FigmaReadyStyles;
  children?: FigmaReadyLayer[];
};

export type FigmaReadyText = NonNullable<FigmaReadyLayer["text"]>;

export type FigmaReadyAsset = {
  id: string;
  kind: "svg" | "image";
  mimeType: "image/png" | "image/svg+xml" | "image/jpeg" | "image/webp";
  encoding: "plain" | "base64";
  content: string;
};

export type PhoneFigmaLayerAsset = {
  mimeType: "image/png" | "image/svg+xml" | "image/jpeg" | "image/webp";
  dataUrl: string;
};

export type PhoneFigmaLayer = {
  id: string;
  type: PhoneFigmaLayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  asset?: PhoneFigmaLayerAsset;
  styles: Record<string, string>;
  children?: PhoneFigmaLayer[];
};

export type PhoneFigmaJsonPayload = {
  schema: "build-ui.screen.v1";
  frame: {
    width: number;
    height: number;
    background: string;
  };
  root: FigmaReadyLayer & { type: "container"; children: FigmaReadyLayer[] };
  assets: FigmaReadyAsset[];
  warnings?: string[];
  source?: {
    generator: "phone-screenshot";
    mode: PhoneScreenshotMode;
  };
};

export type FigmaJsonQualityReport = {
  errors: string[];
  warnings: string[];
  stats: {
    layerCount: number;
    textLayerCount: number;
    assetCount: number;
    maxDepth: number;
  };
};

export type DownloadPhoneScreenshotOptions = {
  screenElement: HTMLElement;
  mode: PhoneScreenshotMode;
  filenamePrefix?: string;
};

export type CreatePhoneScreenshotBlobOptions = {
  screenElement: HTMLElement;
  mode: PhoneScreenshotMode;
};

export type CreatePhoneFigmaJsonOptions = {
  screenElement: HTMLElement;
  mode?: PhoneScreenshotMode;
};

export type ElementPair = {
  source: Element;
  clone: Element;
  computedStyle: CSSStyleDeclaration;
};

export type ScrollablePair = ElementPair & {
  clientHeight: number;
  extraHeight: number;
  scrollHeight: number;
  scrollTop: number;
};

export type HorizontalScrollablePair = ElementPair & {
  clientWidth: number;
  extraWidth: number;
  scrollWidth: number;
  scrollLeft: number;
};
