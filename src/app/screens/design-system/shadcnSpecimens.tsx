/**
 * Design System specimens for the vendored shadcn primitives.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { useEffect, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Slider } from "@/app/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Progress } from "@/app/components/ui/progress";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import { Toggle } from "@/app/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import { VariantSelector, type SelectorOption } from "./specimenShell";

export const shadcnFamilyOptions = [
  { id: "button", label: "Button" },
  { id: "badge", label: "Badge" },
  { id: "input", label: "Input" },
  { id: "checkbox", label: "Checkbox" },
  { id: "toggle", label: "Toggle" },
  { id: "toggle-group", label: "Toggle group" },
  { id: "slider", label: "Slider" },
  { id: "progress", label: "Progress" },
  { id: "separator", label: "Separator" },
  { id: "skeleton", label: "Skeleton" },
  { id: "alert", label: "Alert" },
  { id: "tabs", label: "Tabs" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export const shadcnButtonVariantOptions = [
  { id: "default", label: "Default" },
  { id: "secondary", label: "Secondary" },
  { id: "outline", label: "Outline" },
  { id: "ghost", label: "Ghost" },
  { id: "destructive", label: "Destructive" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export const shadcnBadgeVariantOptions = [
  { id: "default", label: "Default" },
  { id: "secondary", label: "Secondary" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export const shadcnCheckboxVariantOptions = [
  { id: "checked", label: "Checked" },
  { id: "unchecked", label: "Unchecked" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export const shadcnToggleVariantOptions = [
  { id: "pressed", label: "Pressed" },
  { id: "unpressed", label: "Unpressed" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export const shadcnToggleGroupVariantOptions = [
  { id: "left", label: "Left active" },
  { id: "center", label: "Center active" },
  { id: "right", label: "Right active" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export const shadcnProgressVariantOptions = [
  { id: "64", label: "64%" },
  { id: "32", label: "32%" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export const shadcnTabsVariantOptions = [
  { id: "current", label: "Current" },
  { id: "variant", label: "Variant" },
  { id: "audit", label: "Audit" },
] as const satisfies readonly [SelectorOption, ...SelectorOption[]];

export type ShadcnFamily = (typeof shadcnFamilyOptions)[number]["id"];

export type ShadcnVariant =
  | (typeof shadcnButtonVariantOptions)[number]["id"]
  | (typeof shadcnBadgeVariantOptions)[number]["id"]
  | (typeof shadcnCheckboxVariantOptions)[number]["id"]
  | (typeof shadcnToggleVariantOptions)[number]["id"]
  | (typeof shadcnToggleGroupVariantOptions)[number]["id"]
  | (typeof shadcnProgressVariantOptions)[number]["id"]
  | (typeof shadcnTabsVariantOptions)[number]["id"];

export type NonEmptySelectorOptions<Value extends string> = readonly [SelectorOption<Value>, ...SelectorOption<Value>[]];

export const shadcnVariantOptionsByFamily: Partial<Record<ShadcnFamily, NonEmptySelectorOptions<ShadcnVariant>>> = {
  button: shadcnButtonVariantOptions,
  badge: shadcnBadgeVariantOptions,
  checkbox: shadcnCheckboxVariantOptions,
  toggle: shadcnToggleVariantOptions,
  "toggle-group": shadcnToggleGroupVariantOptions,
  progress: shadcnProgressVariantOptions,
  tabs: shadcnTabsVariantOptions,
};

export function resolveSelectorVariant<Value extends string>(options: NonEmptySelectorOptions<Value>, requestedVariant: string): Value {
  return options.find((option) => option.id === requestedVariant)?.id ?? options[0].id;
}

export function ShadcnSpecimens() {
  const [selectedFamily, setSelectedFamily] = useState<ShadcnFamily>("button");
  const [selectedVariant, setSelectedVariant] = useState<ShadcnVariant>("default");
  const activeVariantOptions = shadcnVariantOptionsByFamily[selectedFamily];
  const renderedVariant = activeVariantOptions
    ? resolveSelectorVariant(activeVariantOptions, selectedVariant)
    : selectedVariant;

  useEffect(() => {
    if (!activeVariantOptions || renderedVariant === selectedVariant) return;
    setSelectedVariant(renderedVariant);
  }, [activeVariantOptions, renderedVariant, selectedVariant]);

  const renderFamily = () => {
    switch (selectedFamily) {
      case "button":
        {
          const buttonVariant = resolveSelectorVariant(shadcnButtonVariantOptions, renderedVariant);
          return (
            <Button variant={buttonVariant}>
              {buttonVariant.charAt(0).toUpperCase() + buttonVariant.slice(1)}
            </Button>
          );
        }
      case "badge":
        {
          const badgeVariant = resolveSelectorVariant(shadcnBadgeVariantOptions, renderedVariant);
          return (
            <Badge variant={badgeVariant}>
              {badgeVariant === "secondary" ? "Secondary badge" : "Badge"}
            </Badge>
          );
        }
      case "input":
        return <Input placeholder="Input specimen" />;
      case "checkbox":
        return <Checkbox defaultChecked={resolveSelectorVariant(shadcnCheckboxVariantOptions, renderedVariant) === "checked"} />;
      case "toggle":
        return (
          <Toggle aria-label="Bold toggle" pressed={resolveSelectorVariant(shadcnToggleVariantOptions, renderedVariant) === "pressed"}>
            B
          </Toggle>
        );
      case "toggle-group":
        return (
          <ToggleGroup type="single" value={resolveSelectorVariant(shadcnToggleGroupVariantOptions, renderedVariant)}>
            <ToggleGroupItem value="left">L</ToggleGroupItem>
            <ToggleGroupItem value="center">C</ToggleGroupItem>
            <ToggleGroupItem value="right">R</ToggleGroupItem>
          </ToggleGroup>
        );
      case "slider":
        return <Slider defaultValue={[42]} max={100} step={1} />;
      case "progress":
        return <Progress value={Number(resolveSelectorVariant(shadcnProgressVariantOptions, renderedVariant))} />;
      case "separator":
        return <Separator />;
      case "skeleton":
        return <Skeleton className="h-8 w-40" />;
      case "alert":
        return (
          <Alert className="w-full">
            <span className="grid h-[32px] w-[32px] place-items-center">
              <AppIcon name="info-circle" />
            </span>
            <AlertTitle>Alert primitive</AlertTitle>
            <AlertDescription>
              This is a generic registry component, separate from the custom UniCredit maintenance banner.
            </AlertDescription>
          </Alert>
        );
      case "tabs":
        return (
          <Tabs value={resolveSelectorVariant(shadcnTabsVariantOptions, renderedVariant)} className="w-full">
            <TabsList>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="variant">Variant</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
              Tabs content: current.
            </TabsContent>
            <TabsContent value="variant" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
              Tabs content: variant.
            </TabsContent>
            <TabsContent value="audit" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
              Tabs content: audit.
            </TabsContent>
          </Tabs>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shadcn / generic UI primitives</CardTitle>
        <CardDescription>Registry primitives grouped by family so variant audits stay compact.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="min-w-[220px] flex-1">
            <VariantSelector
              id="shadcn-family-select"
              label="Family"
              value={selectedFamily}
              onChange={setSelectedFamily}
              options={shadcnFamilyOptions}
            />
          </div>
          {activeVariantOptions ? (
            <div className="min-w-[220px] flex-1">
              <VariantSelector
                id="shadcn-variant-select"
                value={renderedVariant}
                onChange={setSelectedVariant}
                options={activeVariantOptions}
              />
            </div>
          ) : null}
        </div>
        <div className="flex min-h-[140px] items-center justify-center rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-6">
          {renderFamily()}
        </div>
      </CardContent>
    </Card>
  );
}
