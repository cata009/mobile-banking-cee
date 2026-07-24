import { useEffect, useState } from "react";
import { ToolErrorBoundary } from "@/app/screens/tools/toolsUi";
import type { FlowPreviewId } from "@/app/registry/flowPreviewRegistry";
import FlowDetail from "./components/FlowDetail";
import FlowLibraryIndex from "./components/FlowLibraryIndex";
import { getFlowDefinition } from "./flows";

/**
 * Flow Library — a spec-grade library of future, not-yet-baseline flows.
 *
 * Thin shell: a two-level index → detail surface. All content lives in the flow
 * definitions (`./flows`), previews are composed from real DS components
 * (`./components/flowPreviews`), and the structured spec + export are rendered by
 * `./components/FlowDetail`.
 */

interface FlowLibraryScreenProps {
  initialFlowId?: FlowPreviewId;
  /** Controlled selection from the app shell (deep-link / top-bar flow picker). */
  selectedFlowId?: FlowPreviewId;
  onFlowChange?: (flowId: FlowPreviewId) => void;
}

type LibraryView = "index" | "detail";

export default function FlowLibraryScreen({
  initialFlowId = "ro-round-up",
  selectedFlowId: controlledFlowId,
  onFlowChange,
}: FlowLibraryScreenProps) {
  const [internalFlowId, setInternalFlowId] = useState<FlowPreviewId>(initialFlowId);
  const [view, setView] = useState<LibraryView>("detail");

  const openFlowId = controlledFlowId ?? internalFlowId;
  const flow = getFlowDefinition(openFlowId);

  useEffect(() => {
    setInternalFlowId(initialFlowId);
  }, [initialFlowId]);

  const openFlow = (flowId: FlowPreviewId) => {
    if (!controlledFlowId) setInternalFlowId(flowId);
    onFlowChange?.(flowId);
    setView("detail");
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[var(--uc-app-bg)] text-[var(--uc-text)] scrollbar-hide"
      data-flow-library-screen="true"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[24px] px-[40px] py-[32px]">
        {view === "index" ? (
          <FlowLibraryIndex onOpenFlow={openFlow} />
        ) : (
          <ToolErrorBoundary toolLabel="Flow preview">
            <FlowDetail key={flow.id} flow={flow} onBackToIndex={() => setView("index")} />
          </ToolErrorBoundary>
        )}
      </div>
    </div>
  );
}
