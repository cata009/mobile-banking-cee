# Navigation architecture

Runtime navigation is owned by `src/app/contexts/NavigationContext.tsx`. The exhaustive policy for all screen states lives in `src/app/navigation/routePolicy.ts`; it defines back fallbacks, surfaces, status-bar behavior, registry links, payload shape, and deep-link restoration.

Use `useNavigationContext()` inside `NavigationProvider`. Existing calls such as `navigateTo("homepage")` remain supported. Card/account flows should pass typed payloads, for example `navigateTo({ screen: "card-options", cardId })`, so Back restores the selected entity.

Shareable URL behavior is implemented by `src/app/utils/deepLink.ts`. Missing card payloads and unknown screen names normalize safely. Non-empty card/account IDs are context-specific product identifiers and are validated by the runtime product selection layer, not by the generic URL parser.

This is a state-driven demo navigation model, not React Router. Add every new screen to the `Screen` union, `ROUTE_POLICY`, and the screen registry, then cover its fallback and restoration behavior with navigation tests.
