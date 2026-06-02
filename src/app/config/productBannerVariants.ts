import imgCommBannerBlue from "../../../screenshots/comm-banner-blue.png";
import imgCommBannerGray from "../../../screenshots/comm-banner-gray.png";
import imgCommBannerGreen from "../../../screenshots/comm-banner-green.png";
import imgCommBannerOrange from "../../../screenshots/comm-banner-orange.png";
import imgCommBannerPink from "../../../screenshots/comm-banner-pink.png";
import imgCommBannerRed from "../../../screenshots/comm-banner-red.png";
import imgCommBannerYellow from "../../../screenshots/comm-banner-yellow.png";

export type ProductBannerColorFamily =
  | "green"
  | "yellow"
  | "orange"
  | "pink"
  | "red"
  | "blue"
  | "grey";

export interface ProductBannerTone {
  id: string;
  family: ProductBannerColorFamily;
  familyLabel: string;
  lightVersion: boolean;
  imageSrc: string;
  backgroundColor: string;
  chevronColor: string;
  textColor: string;
  label: string;
}

const PRODUCT_BANNER_TONE_MAP: Record<
  ProductBannerColorFamily,
  { familyLabel: string; normal: Omit<ProductBannerTone, "id" | "family" | "familyLabel" | "lightVersion" | "label">; light: Omit<ProductBannerTone, "id" | "family" | "familyLabel" | "lightVersion" | "label"> }
> = {
  green: {
    familyLabel: "Green",
    normal: {
      imageSrc: imgCommBannerGreen,
      backgroundColor: "var(--uc-banner-green-1)",
      chevronColor: "var(--uc-banner-green-2)",
      textColor: "var(--uc-static-white)",
    },
    light: {
      imageSrc: imgCommBannerGreen,
      backgroundColor: "var(--uc-banner-green-2)",
      chevronColor: "var(--uc-banner-green-3)",
      textColor: "var(--uc-static-white)",
    },
  },
  yellow: {
    familyLabel: "Yellow",
    normal: {
      imageSrc: imgCommBannerYellow,
      backgroundColor: "var(--uc-banner-yellow-1)",
      chevronColor: "var(--uc-banner-yellow-2)",
      textColor: "var(--uc-static-black)",
    },
    light: {
      imageSrc: imgCommBannerYellow,
      backgroundColor: "var(--uc-banner-yellow-2)",
      chevronColor: "var(--uc-banner-yellow-3)",
      textColor: "var(--uc-static-black)",
    },
  },
  orange: {
    familyLabel: "Orange",
    normal: {
      imageSrc: imgCommBannerOrange,
      backgroundColor: "var(--uc-banner-orange-1)",
      chevronColor: "var(--uc-banner-orange-2)",
      textColor: "var(--uc-static-white)",
    },
    light: {
      imageSrc: imgCommBannerOrange,
      backgroundColor: "var(--uc-banner-orange-2)",
      chevronColor: "var(--uc-banner-orange-3)",
      textColor: "var(--uc-static-white)",
    },
  },
  pink: {
    familyLabel: "Pink",
    normal: {
      imageSrc: imgCommBannerPink,
      backgroundColor: "var(--uc-banner-pink-1)",
      chevronColor: "var(--uc-banner-pink-2)",
      textColor: "var(--uc-static-black)",
    },
    light: {
      imageSrc: imgCommBannerPink,
      backgroundColor: "var(--uc-banner-pink-2)",
      chevronColor: "var(--uc-banner-pink-3)",
      textColor: "var(--uc-static-black)",
    },
  },
  red: {
    familyLabel: "Red",
    normal: {
      imageSrc: imgCommBannerRed,
      backgroundColor: "var(--uc-banner-red-1)",
      chevronColor: "var(--uc-banner-red-2)",
      textColor: "var(--uc-static-white)",
    },
    light: {
      imageSrc: imgCommBannerRed,
      backgroundColor: "var(--uc-banner-red-2)",
      chevronColor: "var(--uc-banner-red-3)",
      textColor: "var(--uc-static-white)",
    },
  },
  blue: {
    familyLabel: "Blue",
    normal: {
      imageSrc: imgCommBannerBlue,
      backgroundColor: "var(--uc-banner-blue-1)",
      chevronColor: "var(--uc-banner-blue-2)",
      textColor: "var(--uc-static-white)",
    },
    light: {
      imageSrc: imgCommBannerBlue,
      backgroundColor: "var(--uc-banner-blue-2)",
      chevronColor: "var(--uc-banner-blue-3)",
      textColor: "var(--uc-static-white)",
    },
  },
  grey: {
    familyLabel: "Grey",
    normal: {
      imageSrc: imgCommBannerGray,
      backgroundColor: "var(--uc-banner-grey-2)",
      chevronColor: "var(--uc-banner-grey-3)",
      textColor: "var(--uc-static-white)",
    },
    light: {
      imageSrc: imgCommBannerGray,
      backgroundColor: "var(--uc-banner-grey-1)",
      chevronColor: "var(--uc-banner-grey-2)",
      textColor: "var(--uc-static-black)",
    },
  },
};

export const PRODUCT_BANNER_TONE_OPTIONS: readonly ProductBannerTone[] = ([
  "green",
  "yellow",
  "orange",
  "pink",
  "red",
  "blue",
  "grey",
] as const).flatMap((family) => {
  const toneFamily = PRODUCT_BANNER_TONE_MAP[family];
  return [
    {
      id: `${family}-normal`,
      family,
      familyLabel: toneFamily.familyLabel,
      lightVersion: false,
      label: `${toneFamily.familyLabel} / Normal`,
      ...toneFamily.normal,
    },
    {
      id: `${family}-light`,
      family,
      familyLabel: toneFamily.familyLabel,
      lightVersion: true,
      label: `${toneFamily.familyLabel} / Light`,
      ...toneFamily.light,
    },
  ];
});

export function getProductBannerTone(
  family: ProductBannerColorFamily,
  lightVersion: boolean,
): ProductBannerTone {
  const toneFamily = PRODUCT_BANNER_TONE_MAP[family];
  const tone = lightVersion ? toneFamily.light : toneFamily.normal;
  return {
    id: `${family}-${lightVersion ? "light" : "normal"}`,
    family,
    familyLabel: toneFamily.familyLabel,
    lightVersion,
    label: `${toneFamily.familyLabel} / ${lightVersion ? "Light" : "Normal"}`,
    ...tone,
  };
}
