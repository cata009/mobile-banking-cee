# Mobile PI Co-Apping Chat Package

Reusable extraction of the Mobile PI Smart Assistant / co-apping UI.

## Folder Layout

- `src/` - portable React implementation.
- `src/coapping.css` - required styles and design tokens.
- `src/demo/AppExample.tsx` - example host composition.
- `integration/` - integration notes and dependency map.
- `original-mobile-pi-source/` - exact source files copied from Mobile PI.

## Fast Usage

```tsx
import { CoAppingChatLauncher } from "./src";
import "./src/coapping.css";

export function MobileScreen() {
  return (
    <div style={{ position: "relative", width: 375, height: 812, overflow: "hidden" }}>
      <YourExistingScreen />
      <CoAppingChatLauncher />
    </div>
  );
}
```

The host container must be `position: relative` because the launcher and full-screen chat are absolutely positioned inside it.

## Components

- `CoAppingChatLauncher`
- `CoAppingChatAssistant`
- `FloatingCoAppingButton`
- `CoAppingPanel`
- `CoAppingSessionScreen`
- `TerminateSessionPopup`

## Dependencies

Runtime:

- `react`
- `lucide-react`

No Mobile PI aliases are required by the portable version.

## Notes

The chat reply logic is local and deterministic by default. For a real assistant, pass a `resolveReply` prop to call your backend or AI runtime.

