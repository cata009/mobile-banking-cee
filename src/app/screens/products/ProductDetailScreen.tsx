import { getProductDetailImageKey, getProductDetailContent, getProductApplyLabel, type ProductDetailImageKey } from '@/features/products/evoProductDetail';
export { getProductDetailContent } from '@/features/products/evoProductDetail';
import { useMemo, useState } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import activateAccountImage from "@/assets/products/detail/img_illustration_activateaccount.png";
import activateTokenImage from "@/assets/products/detail/img_illustration_activatetoken.png";
import blockingImage from "@/assets/products/detail/img_illustration_blocking.png";
import documentsImage from "@/assets/products/detail/img_illustration_documents.png";
import forgottenCredentialsImage from "@/assets/products/detail/img_illustration_forgottencredentials.png";
import homeInsuranceImage from "@/assets/products/detail/img_illustration_homeinsurance_RS.png";
import huMissingSecondaryIdentifierImage from "@/assets/products/detail/img_illustration_hu_missing_secondary_identifier.png";
import scanQrCodeImage from "@/assets/products/detail/img_illustration_scanqrcode.png";
import touchFaceIdImage from "@/assets/products/detail/img_illustration_touchfaceid.png";
import travelInsuranceImage from "@/assets/products/detail/img_illustration_travelinsurance_RS.png";

const PRODUCT_DETAIL_IMAGES: Record<ProductDetailImageKey, string> = {
  "activate-account": activateAccountImage,
  "activate-token": activateTokenImage,
  blocking: blockingImage,
  documents: documentsImage,
  "forgotten-credentials": forgottenCredentialsImage,
  "home-insurance": homeInsuranceImage,
  "hu-missing-secondary-identifier": huMissingSecondaryIdentifierImage,
  "scan-qr-code": scanQrCodeImage,
  "touch-face-id": touchFaceIdImage,
  "travel-insurance": travelInsuranceImage,
};

export interface ProductDetailScreenProps {
  title: string;
  cardId?: string | null;
  optionId?: string | null;
  onBack: () => void;
  actionLabel?: string;
  includeSafeArea?: boolean;
  onActionClick?: () => void;
  /** Photo and promise carried over from the Evo 2027 shelf card that was tapped. */
  heroImage?: string;
  heroImagePosition?: string;
  headline?: string;
  intro?: string;
}

export function getProductDetailImageSrc(optionId?: string | null, cardId?: string | null) {
  const imageKey = getProductDetailImageKey(optionId, cardId);

  return PRODUCT_DETAIL_IMAGES[imageKey];
}

export default function ProductDetailScreen({
  title,
  cardId,
  optionId,
  onBack,
  actionLabel,
  includeSafeArea = true,
  onActionClick,
  heroImage,
  heroImagePosition,
  headline,
  intro,
}: ProductDetailScreenProps) {
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);
  const imageSrc = useMemo(() => getProductDetailImageSrc(optionId, cardId), [cardId, optionId]);
  const content = useMemo(() => getProductDetailContent(optionId, cardId, title), [cardId, optionId, title]);
  /**
   * Without this the primary button was a dead end: the chain has to finish in
   * an action, so the CTA runs the shared sign + success steps in place.
   */
  const [applyStep, setApplyStep] = useState<"none" | "sign" | "success">("none");
  const resolvedActionLabel = actionLabel ?? getProductApplyLabel(cardId);

  if (applyStep === "sign") {
    return (
      <StandardSignScreen
        title={`Apply for ${title}`}
        pinLabel="Mobile banking PIN"
        pinHelper="Confirm you want to send this request."
        actionLabel="Send request"
        onBack={() => setApplyStep("none")}
        onSign={() => setApplyStep("success")}
      />
    );
  }

  if (applyStep === "success") {
    return (
      <StandardSuccessScreen
        title="Request sent"
        body={`We received your request for ${title}. You can follow it in My applications.`}
        actionLabel="Back to products"
        onDone={() => {
          setApplyStep("none");
          onBack();
        }}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-product-detail-screen="true"
      data-product-detail-option={optionId ?? ""}
    >
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={title}
          onBack={onBack}
          collapsedTitleProgress={headerProgress}
          includeSafeArea={includeSafeArea}
        />

        <main className="mx-auto w-full max-w-[560px] px-[24px] pb-[24px] pt-[16px]">
          {/*
            Same 12:5 ratio as the shelf card's photo (240x100). With a fixed
            height the box changed ratio with the screen width, so one crop value
            framed the card correctly and the detail page differently — heads cut
            at the edge on wider layouts. Tying the ratio to the card's makes a
            single `imagePosition` correct in both places at any width.
          */}
          <div className="grid aspect-[12/5] w-full place-items-center overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)]">
            <img
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              draggable={false}
              src={heroImage ?? imageSrc}
              style={heroImage ? { objectPosition: heroImagePosition ?? "center" } : undefined}
            />
          </div>

          {/* When the customer arrived from a shelf card, repeat that card's
              promise first so the page reads as a continuation, then the longer
              product copy. */}
          <h2 className="mt-[25px] text-[20px] font-bold leading-[25px] tracking-[-0.01em] text-[var(--uc-text)]">
            {headline ?? content.heading}
          </h2>

          {intro ? (
            <p className="mt-[10px] text-[16px] leading-[21px] text-[var(--uc-text-muted)]">{intro}</p>
          ) : null}

          {headline && content.heading !== headline ? (
            <h3 className="mt-[26px] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
              {content.heading}
            </h3>
          ) : null}

          <div className="mt-[24px] space-y-[22px] text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text)]">
            {content.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </main>
      </div>

      <div className="px-[24px] pb-[42px]">
        <PrimaryButton className="w-full" onClick={onActionClick ?? (() => setApplyStep("sign"))}>
          {resolvedActionLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}
