# Baseline overlays contracts and preservation

Owner: Root, main checkout `C:\Users\mihai\Desktop\Mobile Banking - CEE`; base `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Initial pending changes and allocated paths recorded before edits in `.codex-temp/baseline-overlays-pilot/ownership.json`.

The existing BottomSheet, PanelMenuSheet, LogoutConfirmDialog and TerminateSessionPopup exports now consume pure contract constants or Web bindings. Existing focus trap/restoration, Escape, lifecycle, translation and callback owners remain unchanged. The 270px phone-local system logout alert and the 327px viewport termination dialog are explicit variants; they are not flattened into one visual design. Animated sheet closing remains 360ms, backdrop 260ms, with reduced-motion bypass.

Evidence: 60 frozen-source before/after cases, original CSS/fonts, light/dark and 375/600px; zero pixels, normalized DOM or measured button-style differences. Nine sheet options, panel co-app/inert variants, open/closed logout and termination were covered. Source tests preserve Escape and logout ordering. Five isolated Native tests preserve immediate/delayed/reduced-motion close, duplicate close suppression, logout order and termination owner lifecycle. Native Web smoke checks controlled actions and dark rendering with zero page errors.

Native leaves are isolated renderers. Native hosting, device safe area, blur, shadows, focus restoration and complete screen routes are not accepted by these fixtures. They remain explicit device integration work. No APK or existing Native application controller was changed by this family.

Final combined verification is Root-owned. Review artifacts and exact delta are in `.codex-temp/baseline-overlays-pilot/`; the central batch report links this evidence and all other families.
