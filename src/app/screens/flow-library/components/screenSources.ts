/**
 * The screens as built, as text.
 *
 * The Implementation tab hands developers the exact source that renders what
 * they see in the phone — not a description of it. Vite's `?raw` import gives
 * the module text at build time, so the code shown, copied and zipped is always
 * the code that ran. One entry per flow whose screens are worth taking as-is.
 */

import type { FlowPreviewId } from "../flows/types";
import investmentsBulkApprovalSource from "./investmentsBulkApprovalPreviews.tsx?raw";

export interface FlowScreenSource {
  /** Repo-relative path, for the package README and the copy header. */
  file: string;
  source: string;
}

export const FLOW_SCREEN_SOURCES: Partial<Record<FlowPreviewId, FlowScreenSource>> = {
  "investments-bulk-approval": {
    file: "src/app/screens/flow-library/components/investmentsBulkApprovalPreviews.tsx",
    source: investmentsBulkApprovalSource,
  },
};
