# Mobile Banking Demo Components

This folder contains placeholder demo components for the Mobile First CEE project.

## Structure

```
apps/mobile-banking/
├── components/
│   ├── PlaceholderScreen.tsx    # Base component for placeholder screens
│   ├── DemoPlayer.tsx           # Demo player with device selector
│   └── screens/
│       └── index.tsx            # All demo screen components
└── README.md
```

## Creating New Demos/Variants

### 1. Add Screen Components

Create new screen components in `components/screens/index.tsx`:

```tsx
export function MyNewScreen() {
  return (
    <PlaceholderScreen 
      title="My Screen" 
      subtitle="Description"
      icon={<SomeIcon className="w-8 h-8" />}
      color="cyan"
    >
      {/* Screen content */}
    </PlaceholderScreen>
  )
}
```

### 2. Register in screenComponents Map

Add your component to the `screenComponents` map at the bottom of `screens/index.tsx`:

```tsx
export const screenComponents: Record<string, React.ComponentType> = {
  // ... existing components
  MyNewScreen,
}
```

### 3. Create Demo Definition

Add a new demo in `src/lib/demoStore.ts` seedDemos array or create via the UI:

```typescript
{
  id: "my-new-demo",
  name: "My New Demo",
  description: "Description of the demo",
  projectIds: ["mobile-banking-cee"],
  defaultDevice: "phone",
  data: {
    screens: [
      { id: "screen1", name: "Screen 1", component: "MyNewScreen", props: {} },
    ],
    currentScreenIndex: 0,
  },
}
```

### 4. Using the Duplicate Feature

1. Go to `/studio/projects/mobile-banking-cee` → Demo tab
2. Select an existing demo from the dropdown
3. Click "Duplicate" button
4. You'll be taken to the Creator editor with the new demo
5. Edit name, description, and screens
6. Save to persist changes

## Available Screen Components

| Component | Description |
|-----------|-------------|
| `MobileBankingHome` | Home screen with balance and quick actions |
| `MobileBankingAccounts` | Accounts list view |
| `MobileBankingPayments` | Payments/transfers screen |
| `AddMoneyAmount` | Add money - amount entry |
| `AddMoneySource` | Add money - source selection |
| `AddMoneyConfirm` | Add money - confirmation |
| `AddMoneySuccess` | Add money - success screen |

## Demo Data Structure

```typescript
interface DemoData {
  screens: {
    id: string
    name: string
    component: string  // Must match a key in screenComponents
    props?: Record<string, unknown>
  }[]
  currentScreenIndex: number
  theme?: "light" | "dark"
}
```
