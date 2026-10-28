import { useEffect, useState } from "react";
import { ToolErrorBoundary } from "@/app/screens/tools/toolsUi";
import type { FlowPreviewId } from "@/app/registry/flowPreviewRegistry";
import FlowDetail from "./components/FlowDetail";
import FlowLibraryIndex from "./components/FlowLibraryIndex";
import { getFlowDefinition } from "./flows";
import { AccountBar } from '@/features/flow-collaboration/AccountBar';
import type { SearchEntry } from '@/features/flow-collaboration/search';

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
  /** Global navigation lands in the index; a direct flow link can open its detail. */
  initialView?: LibraryView;
  /** Controlled selection from the app shell (deep-link / top-bar flow picker). */
  selectedFlowId?: FlowPreviewId;
  onFlowChange?: (flowId: FlowPreviewId) => void;
  onViewChange?: (view: LibraryView) => void;
}

type LibraryView = "index" | "detail";

export default function FlowLibraryScreen({
  initialFlowId = "investments-bulk-approval",
  initialView = "detail",
  selectedFlowId: controlledFlowId,
  onFlowChange,
  onViewChange,
}: FlowLibraryScreenProps) {
  const [internalFlowId, setInternalFlowId] = useState<FlowPreviewId>(initialFlowId);
  const [view, setView] = useState<LibraryView>(initialView);
  const [match, setMatch] = useState<SearchEntry | undefined>();

  const openFlowId = controlledFlowId ?? internalFlowId;
  const flow = getFlowDefinition(openFlowId);

  useEffect(() => {
    setInternalFlowId(initialFlowId);
  }, [initialFlowId]);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const openFlow = (flowId: FlowPreviewId) => {
    setMatch(undefined);
    if (!controlledFlowId) setInternalFlowId(flowId);
    onFlowChange?.(flowId);
    setView("detail");
    onViewChange?.("detail");
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[var(--uc-app-bg)] text-[var(--uc-text)] scrollbar-hide"
      data-flow-library-screen="true"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[24px] px-[40px] py-[32px]">
        <AccountBar flowId={view === 'detail' ? flow.id : undefined} />
        {view === "index" ? (
          <FlowLibraryIndex onOpenFlow={openFlow} onOpenMatch={(id, entry) => { openFlow(id); setMatch(entry); }} />
        ) : (
          <ToolErrorBoundary toolLabel="Flow preview">
            <FlowDetail
              key={`${flow.id}:${match?.id ?? ''}`}
              flow={flow}
              initialMatch={match}
              onBackToIndex={() => {
                setView("index");
                onViewChange?.("index");
              }}
            />
          </ToolErrorBoundary>
        )}
      </div>
    </div>
  );
}
