// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DemoProvider } from "@/app/state/demoStore";
import { COUNTRIES } from "@/app/registry/demoConfig";
import { getCountryCurrency } from "@/data/exchangeRates";
import FlowLibraryScreen from "@/app/screens/flow-library/FlowLibraryScreen";
import { renderFlowPreview } from "@/app/screens/flow-library/components/flowPreviews";
import type { FlowScreenKind } from "@/app/screens/flow-library/flows/types";

afterEach(cleanup);

function renderBulkPrototype() {
  return render(
    <DemoProvider initialState={{ country: "RO", product: "PI" }}>
      {renderFlowPreview("investments-bulk-prototype" as FlowScreenKind)}
    </DemoProvider>,
  );
}

function selectDrafts(count = 3) {
  screen.getAllByRole("checkbox").filter((checkbox) => !checkbox.hasAttribute("disabled")).slice(0, count).forEach((checkbox) => {
    fireEvent.click(checkbox);
  });
}

function selectNamedDrafts(...names: string[]) {
  names.forEach((name) => {
    fireEvent.click(screen.getByRole("checkbox", { name: `Select ${name}` }));
  });
}

function startReviewWithSelectedDrafts(count = 3) {
  selectDrafts(count);
  fireEvent.click(screen.getByRole("button", { name: "Sign orders" }));
}

function nextOrderFromBottom() {
  fireEvent.click(screen.getByRole("button", { name: "Next draft" }));
}

function openSummaryFromBottom() {
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

function scrollReviewContentToBottom() {
  const content = screen.getByTestId("bulk-review-content");
  Object.defineProperties(content, {
    clientHeight: { configurable: true, value: 400 },
    scrollHeight: { configurable: true, value: 800 },
    scrollTop: { configurable: true, value: 396 },
  });
  fireEvent.scroll(content);
}

describe("Investments bulk approval Flow Library prototype", () => {
  it("opens the registered all-country flow from the Flow Library", () => {
    render(
      <DemoProvider initialState={{ country: "RO", product: "PI" }}>
        <FlowLibraryScreen initialFlowId="investments-bulk-approval" />
      </DemoProvider>,
    );

    expect(screen.getByTestId("flow-detail-header")).toHaveTextContent("Bulk approval of investment orders");
    fireEvent.click(screen.getByRole("tab", { name: "Prototype" }));
    expect(screen.getAllByRole("heading", { name: "Orders to approve" })).not.toHaveLength(0);
  });

  it("keeps the Flow Library step navigator centered and content-sized", () => {
    render(
      <DemoProvider initialState={{ country: "RO", product: "PI" }}>
        <FlowLibraryScreen initialFlowId="investments-bulk-approval" />
      </DemoProvider>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Prototype" }));

    expect(screen.getByTestId("flow-prototype-step-rail")).toHaveClass("justify-center");
    expect(screen.getByTestId("flow-prototype-step-control-group")).toHaveClass("w-fit");
    expect(screen.getByTestId("flow-prototype-steps")).toHaveClass("w-max");
  });

  it("shows the Figma none-selected state with no Reject action and a disabled Sign orders CTA", () => {
    renderBulkPrototype();

    expect(screen.getAllByRole("heading", { name: "Orders to approve" })).not.toHaveLength(0);
    expect(screen.getByText("These investment order drafts were prepared by your advisor and are awaiting for your approval. Once approved, the orders will be processed.")).toBeInTheDocument();
    expect(screen.getByTestId("bulk-selected-count")).toHaveTextContent("Selected 0");
    expect(screen.getByRole("button", { name: "Sign orders" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "REJECT" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")[0]).toHaveAttribute("data-flow-bulk-checkbox", "true");
  });

  it("supports one or many Figma-style selected rows with Reject and enabled Sign orders", () => {
    renderBulkPrototype();

    selectDrafts(2);

    expect(screen.getByTestId("bulk-selected-count")).toHaveTextContent("Selected 2");
    expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "REJECT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REJECT" })).toHaveAttribute("data-flow-bulk-reject-action", "true");
    expect(screen.getByRole("button", { name: "Sign orders" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Sign orders" }));

    expect(screen.getByTestId("bulk-review-progress")).toHaveTextContent("Order 1 of");
    expect(screen.getByRole("button", { name: /Ex-Ante cost information/i })).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps the exact named draft identities through selection, review, summary, rejection and deselection", () => {
    renderBulkPrototype();

    selectNamedDrafts("UniCredit Balanced Income Fund", "onemarkets Climate Focus Fund", "Sustainable Future Mixed Fund");
    fireEvent.click(screen.getByRole("button", { name: "Sign orders" }));
    expect(screen.getByTestId("bulk-review-current-draft-row")).toHaveTextContent("UniCredit Balanced Income Fund");
    fireEvent.click(screen.getByRole("button", { name: "View summary" }));

    ["UniCredit Balanced Income Fund", "onemarkets Climate Focus Fund", "Sustainable Future Mixed Fund"].forEach((name) => {
      expect(screen.getByTestId(`bulk-summary-draft-draft-${name === "UniCredit Balanced Income Fund" ? "01" : name === "onemarkets Climate Focus Fund" ? "02" : "03"}`)).toHaveTextContent("Marked to sign");
    });
    expect(screen.getByTestId("bulk-summary-status-marker-draft-02")).toHaveClass("bg-[var(--uc-green-olive)]");
    expect(screen.getByTestId("bulk-summary-draft-draft-04")).toHaveTextContent("Not selected to be signed");

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Selected: UniCredit Balanced Income Fund. Activate to deselect." }));
    fireEvent.click(screen.getByRole("button", { name: "View summary" }));
    expect(screen.getByTestId("bulk-summary-draft-draft-01")).toHaveTextContent("Not selected to be signed");
    expect(screen.getByTestId("bulk-summary-draft-draft-02")).toHaveTextContent("Marked to sign");
  });

  it("keeps exact rejected draft identities after batch reject", () => {
    renderBulkPrototype();

    selectNamedDrafts("UniCredit Balanced Income Fund", "onemarkets Climate Focus Fund");
    fireEvent.click(screen.getByRole("button", { name: "REJECT" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, reject the orders" }));
    selectNamedDrafts("Sustainable Future Mixed Fund");
    fireEvent.click(screen.getByRole("button", { name: "Sign orders" }));
    fireEvent.click(screen.getByRole("button", { name: "View summary" }));

    expect(screen.getByTestId("bulk-summary-draft-draft-01")).toHaveTextContent("Not selected to be signed");
    expect(screen.getByTestId("bulk-summary-draft-draft-02")).toHaveTextContent("Not selected to be signed");
    expect(screen.getByTestId("bulk-summary-draft-draft-03")).toHaveTextContent("Marked to sign");
    expect(screen.getByTestId("bulk-summary-draft-draft-04")).toHaveTextContent("Not selected to be signed");
  });

  it("renders the Figma row logo in a 32px slot", () => {
    renderBulkPrototype();

    const logo = screen.getByRole("img", { name: "UniCredit Balanced Income Fund product" });
    expect(logo).toHaveStyle({ width: "32px", height: "32px" });
  });

  it("uses the exact selection checkmark and leaves group-ending rows without a trailing divider", () => {
    renderBulkPrototype();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select UniCredit Balanced Income Fund" }));
    expect(screen.getByTestId("flow-bulk-selection-checkmark")).toHaveAttribute("width", "14");
    expect(screen.getByRole("button", { name: "REJECT" })).toContainElement(screen.getByTestId("flow-bulk-reject-icon"));

    const lastAdvisoryRow = screen.getByText("CEE Government Bond Fund").closest("div.flex");
    const lastOrderRow = screen.getByText("Balanced Allocation Fund").closest("div.flex");
    expect(lastAdvisoryRow).not.toHaveClass("border-b");
    expect(lastOrderRow).not.toHaveClass("border-b");
  });

  it("selects every current selectable draft from the Select all control", () => {
    renderBulkPrototype();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all orders" }));

    expect(screen.getByTestId("bulk-selected-count")).toHaveTextContent("Selected 10");
    expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(11);
    expect(screen.getByRole("button", { name: "Sign orders" })).toBeEnabled();
  });

  it("confirms plural rejection before removing the selected orders from the list", () => {
    renderBulkPrototype();
    selectDrafts(2);

    fireEvent.click(screen.getByRole("button", { name: "REJECT" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Are you sure you want to reject the orders?");
    expect(screen.getByRole("dialog")).toHaveTextContent("By rejecting the orders, they will be canceled and cannot be retrieved afterwards.");
    expect(screen.getByRole("button", { name: "Yes, reject the orders" })).toBeInTheDocument();
    expect(screen.getByText("UniCredit Balanced Income Fund")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "No, I changed my mind" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("bulk-selected-count")).toHaveTextContent("Selected 2");

    fireEvent.click(screen.getByRole("button", { name: "REJECT" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, reject the orders" }));

    expect(screen.getByTestId("bulk-selected-count")).toHaveTextContent("Selected 0");
    expect(screen.getByText(/Total orders:/)).toHaveTextContent("Total orders: 8");
    expect(screen.queryByText("UniCredit Balanced Income Fund")).not.toBeInTheDocument();
    expect(screen.queryByText("onemarkets Climate Focus Fund")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "REJECT" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign orders" })).toBeDisabled();
  });

  it("uses singular rejection copy when one order is selected", () => {
    renderBulkPrototype();
    selectDrafts(1);

    fireEvent.click(screen.getByRole("button", { name: "REJECT" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Are you sure you want to reject the order?");
    expect(screen.getByRole("dialog")).toHaveTextContent("By rejecting the order, it will be canceled and cannot be retrieved afterwards.");
    expect(screen.getByRole("button", { name: "Yes, reject the order" })).toBeInTheDocument();
  });

  it("uses the fixed circular Figma navigator without duplicate order controls", () => {
    renderBulkPrototype();

    startReviewWithSelectedDrafts();

    expect(screen.getByRole("button", { name: "View summary" })).toHaveClass("h-[40px]", "w-[40px]");
    expect(screen.getByRole("button", { name: "View summary" })).toHaveAttribute("title", "View summary");
    expect(screen.getByTestId("bulk-review-summary-icon")).toHaveAttribute("width", "24");
    expect(screen.getByTestId("bulk-review-summary-icon")).toHaveAttribute("height", "24");
    expect(screen.getByTestId("bulk-review-summary-icon-slot")).toHaveClass("self-center");
    expect(screen.queryByRole("button", { name: "Next section: Ex-Ante Costs" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reveal Ex-Ante Costs" })).not.toBeInTheDocument();
    expect(screen.getByTestId("bulk-review-bottom-navigation")).toHaveClass("shrink-0");
    expect(screen.getByTestId("bulk-review-bottom-navigation")).toHaveClass("border-t");
    expect(screen.getByTestId("bulk-review-read-status")).toHaveTextContent("Scroll down for all the details");
    expect(screen.getByTestId("bulk-review-read-status")).not.toHaveClass("border-t", "bg-[var(--uc-surface-muted)]");
    expect(screen.getByTestId("bulk-review-read-status")).toHaveClass("pt-0", "pb-[8px]");
    expect(screen.getByTestId("bulk-review-bottom-navigation").compareDocumentPosition(screen.getByTestId("bulk-review-read-status")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Previous draft" })).not.toBeInTheDocument();
    expect(screen.getByTestId("bulk-review-back-spacer")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Next draft" })).toBeEnabled();
    expect(screen.getByTestId("bulk-review-progress")).toHaveTextContent("Order 1 of 3");
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next order" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Swipe left or right is shown as a design intent/i)).not.toBeInTheDocument();
    const currentDraftRow = screen.getByTestId("bulk-review-current-draft-row");
    expect(currentDraftRow).toHaveTextContent("UniCredit Balanced Income Fund");
    expect(currentDraftRow).toHaveClass("py-[12px]");
    expect(screen.getByRole("checkbox", { name: "Selected: UniCredit Balanced Income Fund. Activate to deselect." })).toBeChecked();
    expect(screen.queryByRole("switch", { name: /Accept terms/i })).not.toBeInTheDocument();

    nextOrderFromBottom();
    expect(screen.getByTestId("bulk-review-progress")).toHaveTextContent("Order 2 of 3");
    expect(screen.getByRole("button", { name: "Previous draft" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next draft" })).toBeEnabled();
    nextOrderFromBottom();

    expect(screen.getByTestId("bulk-review-progress")).toHaveTextContent("Order 3 of 3");
    expect(screen.getByRole("switch", { name: /Accept terms/i })).toBeInTheDocument();
    expect(screen.getByTestId("bulk-review-read-status")).toHaveTextContent("Scroll down for all the details");
    const termsRow = screen.getByTestId("bulk-review-terms-row");
    expect(termsRow).toHaveTextContent("I have read and accept the terms and conditions");
    expect(termsRow).toHaveClass("border-t");
    expect(termsRow).toHaveClass("py-[12px]");
    expect(screen.getByTestId("bulk-review-fixed-bottom-area")).toHaveClass("shadow-[0_-2px_8px_rgba(38,38,38,0.12)]");
    expect(screen.getByTestId("bulk-review-bottom-navigation")).not.toHaveClass("border-t");
    expect(termsRow.compareDocumentPosition(screen.getByTestId("bulk-review-bottom-navigation")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous draft" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Next draft" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass("bg-[var(--uc-action)]", "!h-[32px]");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByTestId("bulk-review-progress")).toHaveTextContent("Order 3 of 3");
    fireEvent.click(screen.getByRole("switch", { name: /Accept terms/i }));
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("uses the shared Investments disclosure presentation with Ex-Ante open and the other sections closed", () => {
    renderBulkPrototype();
    startReviewWithSelectedDrafts(1);

    expect(screen.getByRole("button", { name: /Ex-Ante cost information/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Product documents/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Important information/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Investment disclaimer/i })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows every pending draft in a complete, non-truncated read-only summary card", () => {
    renderBulkPrototype();

    startReviewWithSelectedDrafts(1);
    fireEvent.click(screen.getByRole("button", { name: "View summary" }));

    const markedCard = screen.getByTestId("bulk-summary-draft-draft-01");
    expect(markedCard).toHaveTextContent("Marked to sign");
    expect(markedCard).toHaveTextContent("UniCredit Balanced Income Fund");
    expect(markedCard).toHaveTextContent("BUY · LU0243534567");
    expect(markedCard).toHaveTextContent(/5[.,]000,00 RON/);
    expect(screen.getByRole("img", { name: "UniCredit Balanced Income Fund product" })).toBeInTheDocument();
    expect(markedCard.querySelector(".truncate")).toBeNull();
    expect(markedCard.className).not.toContain("hover:");
    expect(markedCard).not.toHaveTextContent("Ex-Ante Costs shown");
    expect(markedCard.querySelector(".uc-type-n5-strong")).toBeTruthy();

    const unselectedCard = screen.getByTestId("bulk-summary-draft-draft-02");
    expect(unselectedCard).toHaveTextContent("Not selected to be signed");
    expect(unselectedCard).toHaveTextContent("onemarkets Climate Focus Fund");
    expect(unselectedCard).toHaveTextContent("SELL · LU1953188835");
    expect(unselectedCard).toHaveTextContent(/3[.,]200,00 RON/);

    expect(screen.queryByRole("button", { name: "Back to review" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm and sign ALL marked ORDERS" })).toHaveClass("!w-full");
  });

  it("opens any summary card as a read-only inspection and returns without changing its status", () => {
    renderBulkPrototype();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select UniCredit Balanced Income Fund" }));
    fireEvent.click(screen.getByRole("button", { name: "REJECT" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, reject the order" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select onemarkets Climate Focus Fund" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign orders" }));
    fireEvent.click(screen.getByRole("button", { name: "View summary" }));

    fireEvent.click(screen.getByRole("button", { name: "View onemarkets Climate Focus Fund order details" }));
    expect(screen.getAllByRole("heading", { name: "Order details" })).not.toHaveLength(0);
    expect(screen.getByText("Marked to sign")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getAllByRole("heading", { name: "Orders summary" })).not.toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "View Sustainable Future Mixed Fund order details" }));
    expect(screen.getByText("Not signed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    fireEvent.click(screen.getByRole("button", { name: "View UniCredit Balanced Income Fund order details" }));
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("bulk-summary-draft-draft-01")).toHaveTextContent("Not selected to be signed");
  });

  it("uses a clean generic success tile with one return action and no failure shortcut", () => {
    render(
      <DemoProvider initialState={{ country: "RO", product: "PI" }}>
        {renderFlowPreview("investments-bulk-confirmation" as FlowScreenKind)}
      </DemoProvider>,
    );

    expect(screen.getByTestId("bulk-signing-success-tile")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Signing successful" })).not.toHaveLength(0);
    expect(screen.getByText("Your signing step is complete in this prototype.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to Orders to approve" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /failed send/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Signing request prepared")).not.toBeInTheDocument();
    expect(screen.getByTestId("bulk-signing-success-tile")).not.toHaveClass("border", "shadow-sm");
  });

  it("keeps a draft unread until its review content reaches the bottom", () => {
    renderBulkPrototype();

    startReviewWithSelectedDrafts(3);

    expect(screen.getByTestId("bulk-review-read-status")).toHaveTextContent("Scroll down for all the details");
    expect(screen.getByTestId("bulk-review-read-status")).toHaveAttribute("data-read", "false");
    expect(screen.getByRole("button", { name: "Next draft" })).toBeEnabled();

    scrollReviewContentToBottom();

    expect(screen.getByTestId("bulk-review-read-status")).toHaveTextContent("You're all caught up");
    expect(screen.getByTestId("bulk-review-read-status")).toHaveAttribute("data-read", "true");
  });

  it("preserves the earned read state while navigating between selected drafts", () => {
    renderBulkPrototype();

    startReviewWithSelectedDrafts(3);
    scrollReviewContentToBottom();
    nextOrderFromBottom();

    expect(screen.getByTestId("bulk-review-read-status")).toHaveTextContent("Scroll down for all the details");
    fireEvent.click(screen.getByRole("button", { name: "Previous draft" }));
    expect(screen.getByTestId("bulk-review-read-status")).toHaveTextContent("You're all caught up");
  });

  it("keeps batch signing disabled until every marked order was presented and the last-order terms are accepted", () => {
    renderBulkPrototype();

    startReviewWithSelectedDrafts();
    fireEvent.click(screen.getByRole("button", { name: "View summary" }));

    expect(screen.getByRole("button", { name: "Confirm and sign ALL marked ORDERS" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    nextOrderFromBottom();
    nextOrderFromBottom();
    fireEvent.click(screen.getByRole("switch", { name: /Accept terms/i }));
    openSummaryFromBottom();

    expect(screen.getByRole("button", { name: "Confirm and sign ALL marked ORDERS" })).toBeEnabled();
  });

  it("enters one standard signing step for the eligible marked orders", () => {
    renderBulkPrototype();

    startReviewWithSelectedDrafts();
    nextOrderFromBottom();
    nextOrderFromBottom();
    fireEvent.click(screen.getByRole("switch", { name: /Accept terms/i }));
    openSummaryFromBottom();
    fireEvent.click(screen.getByRole("button", { name: "Confirm and sign ALL marked ORDERS" }));

    expect(screen.getAllByRole("heading", { name: "Sign all marked orders" })).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "Sign order" })).toBeInTheDocument();
  });

  it("uses the checked current-draft row to deselect and preserves its Not signed summary state", () => {
    renderBulkPrototype();

    startReviewWithSelectedDrafts();
    fireEvent.click(screen.getByRole("checkbox", { name: "Selected: UniCredit Balanced Income Fund. Activate to deselect." }));

    expect(screen.getByTestId("bulk-review-progress")).toHaveTextContent("Order 1 of 2");
    nextOrderFromBottom();
    fireEvent.click(screen.getByRole("switch", { name: /Accept terms/i }));
    openSummaryFromBottom();

    expect(screen.getByRole("button", { name: "Confirm and sign ALL marked ORDERS" })).toBeEnabled();
    expect(screen.getByText("UniCredit Balanced Income Fund").parentElement).toHaveTextContent("Not selected to be signed");
  });

  it.each(COUNTRIES)("renders selectable, country-formatted drafts for %s", (country) => {
    render(
      <DemoProvider initialState={{ country, product: "PI" }}>
        {renderFlowPreview("investments-bulk-prototype" as FlowScreenKind)}
      </DemoProvider>,
    );

    expect(document.body).toHaveTextContent(getCountryCurrency(country));
    startReviewWithSelectedDrafts(1);
    expect(screen.getByTestId("bulk-review-progress")).toHaveTextContent("Order 1 of 1");
    expect(screen.getByRole("button", { name: /Ex-Ante cost information/i })).toHaveAttribute("aria-expanded", "true");
  });
});
