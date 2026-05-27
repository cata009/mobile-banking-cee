/// <reference types="vite/client" />

// Figma Make custom module types
declare module "figma:asset/*" {
  const src: string;
  export default src;
}

// SVG imports from /src/imports/
declare module "@/imports/svg-*" {
  const svgPaths: Record<string, string>;
  export default svgPaths;
}

// TypeScript type augmentation for custom imports
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}
