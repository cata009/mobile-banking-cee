import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const [cardDetailSource, cardDetailsSource] = await Promise.all([
  readFile(new URL("../src/app/screens/cards/CardDetailScreen.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/app/screens/cards/CardDetailsInfoScreen.tsx", import.meta.url), "utf8"),
]);

assert.match(cardDetailSource, /FaceIdAnimation/, "SHOW CARD DETAILS must require the shared Face ID overlay");
assert.match(cardDetailSource, /onClick={handleShowCardDetails}/, "The Show Card Details CTA must start the Face ID reveal");
assert.match(cardDetailSource, /onClick: handleShowCardDetails/, "The Card Details quick action must start the Face ID reveal");
assert.match(cardDetailSource, /FaceIdAnimation onComplete={completeCardDetailsFaceId}/, "Face ID completion must gate the route transition");
assert.match(cardDetailSource, /onCardDetailsClick\?\.\(activeCard\)/, "Face ID completion must open the selected card details");
assert.match(cardDetailsSource, /useCopyToClipboard/, "Card details must use the shared clipboard behavior");
assert.match(cardDetailsSource, /CopyToast/, "Card details must display the shared copy toast");
assert.match(cardDetailsSource, /copyToClipboard\(card\.cardNumber, "Card number"\)/, "Card number copy must use the unmasked value");
assert.match(cardDetailsSource, /Card CVV2\/CVC2/, "Card details must display the CVV/CVC field");
assert.match(cardDetailsSource, /Card holder/, "Card details must display the holder field");
assert.match(cardDetailsSource, /Card validity/, "Card details must display the validity field");

console.log("card details flow audit ok");
