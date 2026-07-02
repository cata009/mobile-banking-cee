import imgContacts from "figma:asset/4d22afc493e4ab72aca4b5793ce68cd204c58b7f.png";
import imgDocuments from "figma:asset/befcf83245a907a033553e7ac7902995e124d730.png";
import imgSettings from "figma:asset/b756062d79e37b43d0eda8eee6125757ce5bb9bf.png";
import imgGdprConsent from "figma:asset/4d7abd397db5234d24f236a294f434a9b45b7d2b.png";
import imgThirdPartyConsent from "figma:asset/e017033a83e177f2a0d9a121d8161971ab5db3b5.png";
import imgDigitalActivities from "figma:asset/947d85da595e4eb3e946a83cbab7bb8d8c148da1.png";
import imgMyRequests from "figma:asset/612ac7960c2d43bfdada538aae6f3cf27be44d99.png";
import imgTutorial from "figma:asset/fabdcbcfc3ceae62811fed754b790551b42a2f6e.png";

import type { MoreCardType } from "@/app/config/moreCardsConfig";

export const MORE_CARD_IMAGE_BY_TYPE: Record<MoreCardType, string> = {
  contacts: imgContacts,
  documents: imgDocuments,
  settings: imgSettings,
  "gdpr-consent": imgGdprConsent,
  "third-party-consent": imgThirdPartyConsent,
  "digital-activities": imgDigitalActivities,
  "my-requests": imgMyRequests,
  tutorial: imgTutorial,
};

const preloadedMoreCardImages = new Set<string>();

export function preloadMoreCardImages(cardTypes?: readonly MoreCardType[]) {
  const imageSources = (cardTypes ?? Object.keys(MORE_CARD_IMAGE_BY_TYPE)).map(
    (cardType) => MORE_CARD_IMAGE_BY_TYPE[cardType as MoreCardType],
  );

  imageSources.forEach((src) => {
    if (!src || preloadedMoreCardImages.has(src)) return;

    preloadedMoreCardImages.add(src);

    const image = new Image();
    image.decoding = "async";
    image.src = src;
  });
}
