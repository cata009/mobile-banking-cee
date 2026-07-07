# Mobile PI Integration Notes

This package extracts the co-apping/chat functionality from:

`C:/Users/mihai/Desktop/all in one/Projects Studio/.od/projects/mobile-pi`

## What Was Extracted

- Floating Smart Assistant button.
- Full-screen chat assistant.
- Suggested topic chips.
- Deterministic local reply resolver.
- Co-apping side tab.
- Bottom panel with `START CO-APPING SESSION`.
- Co-apping session code screen.
- End session confirmation dialog.
- Original Mobile PI source files for traceability.

## Important Split

`src/` is the portable implementation. It removes Mobile PI local aliases such as `@/app/...`, `figma:asset/...`, app stores, country context, and custom Figma import modules.

`original-mobile-pi-source/` is the original extracted code. Keep it as reference. Do not drop it directly into another project unless that project has the same aliases, imports, tokens, and app shell.

## Minimal Host Integration

```tsx
import { CoAppingChatLauncher } from "./mobile-pi-coapping-chat-package/src";
import "./mobile-pi-coapping-chat-package/src/coapping.css";

export function Screen() {
  return (
    <div style={{ position: "relative", width: 375, height: 812, overflow: "hidden" }}>
      <YourScreen />
      <CoAppingChatLauncher />
    </div>
  );
}
```

## Full Co-Apping Flow

```tsx
import {
  CoAppingChatLauncher,
  CoAppingPanel,
  CoAppingSessionScreen,
  FloatingCoAppingButton,
  TerminateSessionPopup,
} from "./mobile-pi-coapping-chat-package/src";
import "./mobile-pi-coapping-chat-package/src/coapping.css";
```

Use `src/demo/AppExample.tsx` as a working composition example.

## Replacing The Fake Reply Logic

Pass `resolveReply` to `CoAppingChatLauncher`. Returning a string keeps the package's default contextual enhancement behavior:

```tsx
<CoAppingChatLauncher
  resolveReply={async (input, history) => {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, history }),
    });
    const data = await response.json();
    return data.message;
  }}
/>
```

Hosts that already know the current screen, product, account, or country can return a structured reply instead:

```tsx
<CoAppingChatLauncher
  resolveReply={async (input, history) => ({
    text: "### Recent documents\nStart in Documents and use the newest year group first.",
    richBlocks: [
      {
        type: "product-cards",
        title: "Document routes",
        body: "Statements, notices, and confirmations stay in Documents.",
        products: [
          {
            id: "documents",
            title: "Documents",
            subtitle: "Statements, notices, confirmations",
            meta: "Open list",
            tone: "blue",
          },
        ],
      },
    ],
    followUps: [
      { id: "find-confirmation", label: "Find confirmation", prompt: "Help me find a payment confirmation." },
    ],
  })}
/>
```

Use the structured shape when suggested topics need real cards, action chips, or page-specific data. Use the string shape for a simple backend text response.

## Styling

The portable package uses CSS variables:

- `--mpc-brand`
- `--mpc-accent-green`
- `--mpc-panel-green`
- `--mpc-text`
- `--mpc-muted`
- `--mpc-border`
- `--mpc-surface`
- `--mpc-app-bg`
- `--mpc-font`

Override them at the host screen root if the target project has a different design system.
