import { useEffect, useMemo, useRef, useState } from "react";

import { AppIcon } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import CopyToast, { type CopyToastState } from "@/app/components/accounts/CopyToast";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { useProducts } from "@/hooks/useProducts";
import { useDemo } from "@/app/state/demoStore";
import {
  MY_BANKER_CLIENTS,
  MY_BANKER_PEERS,
  MY_BANKER_RM,
  type MyBankerClientAttributes,
  type MyBankerProductKey,
} from "@/data/myBankerCore";
import MyBankerHero from "@/app/screens/my-banker/MyBankerHero";
import MyBankerProductCard, { type MyBankerRequestContext } from "@/app/screens/my-banker/MyBankerProductCard";
import MyBankerRequestSheet from "@/app/screens/my-banker/MyBankerRequestSheet";
import { sendMyBankerRequestToRm } from "@/app/screens/my-banker/myBankerRmNotification";
import {
  analyzeMyBanker,
  getCoverage,
  getLeadRecommendation,
  recordMyBankerEvent,
  type MyBankerAnalysis,
  type MyBankerEventType,
  type MyBankerRecommendation,
} from "@/app/screens/my-banker/myBankerState";

interface MyBankerScreenProps {
  onBack: () => void;
}

/** How long the peer analysis narrates itself before results appear. */
const ANALYSIS_DURATION_MS = 1_500;
const TOAST_DURATION_MS = 3_600;

function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-[12px]" aria-hidden="true">
      <div className="rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
        <span className="block h-[16px] w-[70%] animate-pulse rounded-full bg-[var(--uc-surface-muted)]" />
        <span className="mt-[14px] block h-[6px] w-full animate-pulse rounded-full bg-[var(--uc-surface-muted)]" />
        <span className="mt-[14px] block h-[12px] w-[55%] animate-pulse rounded-full bg-[var(--uc-surface-muted)]" />
      </div>
      {[0, 1].map((row) => (
        <div key={row} className="rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
          <div className="flex items-center gap-[12px]">
            <span className="h-[28px] w-[28px] shrink-0 animate-pulse rounded-full bg-[var(--uc-surface-muted)]" />
            <span className="flex-1">
              <span className="block h-[12px] w-[45%] animate-pulse rounded-full bg-[var(--uc-surface-muted)]" />
              <span className="mt-[8px] block h-[10px] w-[65%] animate-pulse rounded-full bg-[var(--uc-surface-muted)]" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The analysis narrates itself while it runs. The three steps are the actual
 * order of the work — read the profile, match the band, count the products —
 * so the wait explains the concept instead of spending it on a spinner.
 */
function AnalysisProgress({ step }: { step: number }) {
  const { t } = useLanguage();
  const steps = [
    t("runtime.myBanker.loading.step1", "Reading your profile"),
    t("runtime.myBanker.loading.step2", "Finding clients like you"),
    t("runtime.myBanker.loading.step3", "Counting the products they use"),
  ];

  return (
    <section
      className="rounded-[8px] bg-[var(--uc-surface)] p-[16px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="uc-type-n4-strong text-[var(--uc-text)]">
        {t("runtime.myBanker.loading.title", "Comparing you with similar clients")}
      </p>
      <ul className="mt-[12px] flex flex-col gap-[10px]">
        {steps.map((label, index) => {
          const done = index < step;
          const active = index === step;

          return (
            <li key={label} className="flex items-center gap-[10px]">
              {done ? (
                <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--uc-green-success)]">
                  <AppIcon name="check" size={10} color="var(--uc-static-white)" />
                </span>
              ) : active ? (
                <span className="h-[16px] w-[16px] shrink-0 animate-spin rounded-full border-[2px] border-[var(--uc-border-muted)] border-t-[var(--uc-action)]" />
              ) : (
                <span className="h-[16px] w-[16px] shrink-0 rounded-full border-[2px] border-[var(--uc-border-muted)]" />
              )}
              <span
                className={`uc-type-n5 ${done || active ? "text-[var(--uc-text)]" : "text-[var(--uc-text-subtle)]"}`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline gap-[8px] px-[4px] pt-[6px]">
      <h2 className="uc-type-n4-strong text-[var(--uc-text)]">{title}</h2>
      <span className="uc-type-n5 text-[var(--uc-text-muted)]">{count}</span>
    </div>
  );
}

function AnalysisUnavailable({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center px-[8px] py-[48px] text-center">
      <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[var(--uc-surface-muted)]">
        <AppIcon name="info-circle" size={24} color="var(--uc-text-muted)" />
      </span>
      <p className="mt-[16px] uc-type-h2 text-[var(--uc-text)]">
        {t("runtime.myBanker.error.title", "Comparison not available")}
      </p>
      <p className="mt-[8px] uc-type-n5 text-[var(--uc-text-muted)]">
        {t("runtime.myBanker.error.body", "We could not build your comparison group right now.")}
      </p>
      <div className="mt-[24px] w-full max-w-[240px]">
        <PrimaryButton variant="surface" onClick={onRetry}>
          {t("runtime.myBanker.error.retry", "Try again")}
        </PrimaryButton>
      </div>
    </div>
  );
}

/**
 * My Banker — peer-based product recommendations for individuals.
 *
 * The screen opens on where the client stands against the catalogue similar
 * clients draw on, argues for the single product most of them have and the
 * client does not, and keeps everything else — other recommendations, products
 * already held — one tap away underneath.
 */
export default function MyBankerScreen({ onBack }: MyBankerScreenProps) {
  const { t } = useLanguage();
  const { bankingScenario } = useDemo();
  const { categories } = useProducts();
  const { progress: headerProgress, onScroll } = useCollapsingHeader(48);

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisRun, setAnalysisRun] = useState(0);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<MyBankerRequestContext | null>(null);
  const [sentRequests, setSentRequests] = useState<MyBankerProductKey[]>([]);
  const [toast, setToast] = useState<CopyToastState | null>(null);
  const viewedRunRef = useRef(-1);

  /**
   * The prospect scenario carries a client whose band holds fewer than the
   * minimum number of peers, which is how the "no info" presentation is
   * reachable without special-casing the screen.
   */
  const client: MyBankerClientAttributes =
    bankingScenario === "retail-prospect" ? MY_BANKER_CLIENTS.prospect : MY_BANKER_CLIENTS.established;

  const heldProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);

  const analysis: MyBankerAnalysis = useMemo(
    () =>
      analyzeMyBanker({
        client,
        peers: MY_BANKER_PEERS,
        heldProducts,
        today: new Date(),
      }),
    [client, heldProducts],
  );

  // Entry runs the analysis; the same steps replay when the client retries.
  useEffect(() => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    const stepTimers = [1, 2].map((step) =>
      window.setTimeout(() => setAnalysisStep(step), (ANALYSIS_DURATION_MS / 3) * step),
    );
    const doneTimer = window.setTimeout(() => setIsAnalyzing(false), ANALYSIS_DURATION_MS);
    return () => {
      stepTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(doneTimer);
    };
  }, [analysisRun]);

  const track = (type: MyBankerEventType, productKey: string, detail?: Record<string, string | number>) => {
    recordMyBankerEvent({
      type,
      clientId: client.clientId,
      productKey: productKey as MyBankerProductKey,
      timestamp: new Date().toISOString(),
      detail,
    });
  };

  // Each product shown on a completed analysis counts as one card view.
  useEffect(() => {
    if (isAnalyzing || analysis.state !== "ready" || viewedRunRef.current === analysisRun) return;
    viewedRunRef.current = analysisRun;
    analysis.recommendations.forEach((recommendation) => {
      track("card_view", recommendation.product.key, {
        adoption: recommendation.adoptionPercent ?? "no-info",
        status: recommendation.status,
      });
    });
    // `track` closes over the client id only, which changes with the analysis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, analysisRun, isAnalyzing]);

  useEffect(() => {
    if (!toast?.visible) return;
    const timer = window.setTimeout(
      () => setToast((current) => (current ? { ...current, visible: false } : null)),
      TOAST_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleToggle = (productKey: string) => {
    const next = expandedKey === productKey ? null : productKey;
    setExpandedKey(next);
    if (next) track("card_expand", productKey);
  };

  const handleSubmitRequest = async (message: string) => {
    const request = pendingRequest;
    if (!request) return;

    setPendingRequest(null);
    setSentRequests((current) =>
      current.includes(request.productKey) ? current : [...current, request.productKey],
    );
    track("send_request", request.productKey, {
      amount: request.amount,
      currency: request.currency,
      term: request.termMonths ?? "n/a",
      rate: request.ratePercent ?? "n/a",
      simulated: request.simulated ? "yes" : "no",
      messageLength: message.length,
    });

    // The client's confirmation never waits on delivery, and never depends on
    // it: a failed e-mail is recorded, not surfaced as a failed request.
    setToast({
      message: t("runtime.myBanker.request.success", "Request sent to {name}").replace("{name}", MY_BANKER_RM.name),
      visible: true,
    });

    const delivery = await sendMyBankerRequestToRm({
      clientId: client.clientId,
      productKey: request.productKey,
      productName: request.productName,
      amount: request.amount,
      currency: request.currency,
      termMonths: request.termMonths,
      ratePercent: request.ratePercent,
      message,
    });

    if (!delivery.delivered) {
      track("send_request", request.productKey, {
        delivery: "failed",
        recipient: delivery.recipient,
        reason: delivery.reason ?? "unknown",
      });
    }
  };

  const renderCard = (
    recommendation: MyBankerRecommendation,
    variant: "lead" | "row",
    peerGroupSize: number,
  ) => (
    <MyBankerProductCard
      key={recommendation.product.key}
      recommendation={recommendation}
      variant={variant}
      expanded={variant === "lead" || expandedKey === recommendation.product.key}
      peerGroupSize={peerGroupSize}
      requestSent={sentRequests.includes(recommendation.product.key)}
      advisorName={MY_BANKER_RM.name}
      onToggle={() => handleToggle(recommendation.product.key)}
      onSimulationRun={(context) =>
        track("simulation_run", context.productKey, {
          amount: context.amount,
          currency: context.currency,
          term: context.termMonths ?? "n/a",
          rate: context.ratePercent ?? "no-rate",
        })
      }
      onSendRequest={(context) => setPendingRequest(context)}
    />
  );

  const ready = !isAnalyzing && analysis.state === "ready" ? analysis : null;
  const lead = ready ? getLeadRecommendation(ready.recommendations) : null;
  const coverage = ready ? getCoverage(ready.recommendations) : null;
  const otherRecommendations =
    ready?.recommendations.filter(
      (row) => row.status === "recommended" && row.product.key !== lead?.product.key,
    ) ?? [];
  const owned = ready?.recommendations.filter((row) => row.status === "in-use") ?? [];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="h-full w-full overflow-y-auto scrollbar-hide" onScroll={onScroll}>
        <PageHeader
          title={t("runtime.myBanker.title", "My Banker")}
          onBack={onBack}
          showHelp={false}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          variant="gray"
        />

        <div className="flex flex-col gap-[12px] px-[16px] pb-[40px] pt-[8px]">
          {isAnalyzing ? (
            <>
              <AnalysisProgress step={analysisStep} />
              <AnalysisSkeleton />
            </>
          ) : !ready || !coverage ? (
            <AnalysisUnavailable onRetry={() => setAnalysisRun((run) => run + 1)} />
          ) : (
            <>
              <MyBankerHero
                peerGroup={ready.peerGroup}
                coverage={coverage}
                advisorName={MY_BANKER_RM.name}
              />

              {lead && renderCard(lead, "lead", ready.peerGroup.size)}

              {otherRecommendations.length > 0 && (
                <>
                  <SectionHeading
                    title={t("runtime.myBanker.sections.more", "More for people like you")}
                    count={otherRecommendations.length}
                  />
                  {otherRecommendations.map((recommendation) =>
                    renderCard(recommendation, "row", ready.peerGroup.size),
                  )}
                </>
              )}

              {owned.length > 0 && (
                <>
                  <SectionHeading
                    title={t("runtime.myBanker.sections.owned", "Already yours")}
                    count={owned.length}
                  />
                  {owned.map((recommendation) => renderCard(recommendation, "row", ready.peerGroup.size))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <CopyToast toast={toast} />

      {pendingRequest && (
        <MyBankerRequestSheet
          request={pendingRequest}
          onCancel={() => setPendingRequest(null)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
}
