import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const [cardDetailSource, cardDetailsSource, sensitiveCardDetailsSource] = await Promise.all([
  readFile(new URL("../src/app/screens/cards/CardDetailScreen.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/app/screens/cards/CardDetailsInfoScreen.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/app/screens/cards/CardSensitiveDetailsScreen.tsx", import.meta.url), "utf8"),
]);

assert.match(cardDetailSource, /FaceIdAnimation/, "SHOW CARD DETAILS must require the shared Face ID overlay");
assert.match(cardDetailSource, /onClick={handleShowCardDetails}/, "The Show Card Details CTA must start the Face ID reveal");
assert.match(cardDetailSource, /onClick: \(\) => onCardDetailsClick\?\.\(activeCard\)/, "The Card Details quick action must open its non-sensitive route directly");
assert.match(cardDetailSource, /FaceIdAnimation onComplete={completeCardDetailsFaceId}/, "Face ID completion must gate the route transition");
assert.match(cardDetailSource, /setIsSensitiveCardDetailsVisible\(true\)/, "Face ID completion must reveal the sensitive card-details surface");
assert.match(cardDetailSource, /data-card-carousel/, "The card carousel must expose its visual regression boundary");
assert.match(cardDetailSource, /z-10 -mb-\[20px\].*pb-\[20px\]/, "The card carousel must reserve a raised 20px shadow lane");
assert.match(cardDetailsSource, /Card product/, "Direct Card Details must describe the card product");
assert.match(cardDetailsSource, /Card status/, "Direct Card Details must expose the non-sensitive status");
assert.doesNotMatch(cardDetailsSource, /Card CVV2\/CVC2/, "Direct Card Details must not expose the CVV/CVC field");
assert.match(sensitiveCardDetailsSource, /useCopyToClipboard/, "Sensitive card details must use the shared clipboard behavior");
assert.match(sensitiveCardDetailsSource, /CopyToast/, "Sensitive card details must display the shared copy toast");
assert.match(sensitiveCardDetailsSource, /copyToClipboard\(card\.cardNumber, "Card number"\)/, "Card number copy must use the unmasked value");
assert.match(sensitiveCardDetailsSource, /Card CVV2\/CVC2/, "Sensitive card details must display the CVV/CVC field");
assert.match(sensitiveCardDetailsSource, /Card holder/, "Sensitive card details must display the holder field");
assert.match(sensitiveCardDetailsSource, /Card validity/, "Sensitive card details must display the validity field");

console.log("card details flow audit ok");
