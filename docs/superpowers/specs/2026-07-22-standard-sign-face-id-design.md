# Standard Sign Face ID Design

## Goal

Every runtime flow that uses the shared `StandardSignScreen` must authenticate with the existing Face ID animation before it can advance to its success state.

## Approved interaction

1. The customer enters the standard sign screen and sees the existing PIN field and primary Sign action.
2. Pressing the primary action starts the existing `FaceIdAnimation` used by login and card-detail reveal.
3. While authentication is running, the Sign action cannot be triggered again and the flow callback is not called.
4. Only `FaceIdAnimation.onComplete` calls the supplied `onSign` callback, allowing the owning payment, investment, or credit-limit flow to show Success.
5. Back continues to work before authentication starts. No new authentication UI, dependency, route, backend, failure simulation, or persistence is introduced.

## Architecture

The behavior belongs in `StandardSignScreen`, not in each product flow. This keeps one authorization sequence for all current consumers: domestic payments, investment buy orders, and the credit-limit offer. The shared screen owns a local `isAuthenticating` flag, mounts `FaceIdAnimation` inside `AnimatePresence`, disables the primary action, and guards duplicate activation.

## Verification

- A component regression test proves Sign does not call `onSign` immediately and calls it once after the real 840 ms Face ID lifecycle.
- Investment and credit-limit flow tests advance through the same lifecycle before expecting Success.
- The focused tests, full repository verification, and a port-4001 browser smoke cover the shared behavior and visible transition.
