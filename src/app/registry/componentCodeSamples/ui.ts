// AUTO-GROUPED slice of the component code-sample registry (see ../componentCodeSamples.ts).
// Split purely by domain for navigability; the merged record is unchanged.
import { sample, type ComponentCodeSample } from "../componentCodeSampleShared";

export const CODE_SAMPLES_UI: Record<string, ComponentCodeSample> = {

  "ui.button-registry": sample(
    // --- React (real, from src/app/components/ui/button.tsx) ---
    `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background text-foreground hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className, variant, size, asChild = false, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };`,
    // --- Swift (SwiftUI port) ---
    `import SwiftUI

enum ButtonVariant { case primary, secondary, outline, ghost, destructive, link }

struct GenericButton: View {
    let title: String
    var variant: ButtonVariant = .primary
    var isDisabled: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .padding(.horizontal, 16)
                .frame(height: 36)
        }
        .background(backgroundColor)
        .foregroundColor(foregroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .stroke(variant == .outline ? Color("ucBorder") : .clear, lineWidth: 1)
        )
        .cornerRadius(6)
        .opacity(isDisabled ? 0.5 : 1)
        .disabled(isDisabled)
    }

    private var backgroundColor: Color {
        switch variant {
        case .primary: return Color("ucAction")
        case .secondary: return Color("ucSurfaceMuted")
        case .destructive: return Color("ucError")
        case .outline, .ghost, .link: return .clear
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .primary, .destructive: return .white
        default: return Color("ucText")
        }
    }
}`,
    // --- Kotlin (Jetpack Compose port) ---
    `import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

enum class GenericButtonVariant { DEFAULT, SECONDARY, OUTLINE, GHOST, DESTRUCTIVE, LINK }

@Composable
fun GenericButton(
    label: String,
    variant: GenericButtonVariant = GenericButtonVariant.DEFAULT,
    enabled: Boolean = true,
    onClick: () -> Unit,
) {
    when (variant) {
        GenericButtonVariant.OUTLINE -> OutlinedButton(onClick = onClick, enabled = enabled, modifier = Modifier.height(36.dp)) {
            Text(label)
        }
        GenericButtonVariant.GHOST, GenericButtonVariant.LINK -> TextButton(onClick = onClick, enabled = enabled, modifier = Modifier.height(36.dp)) {
            Text(label)
        }
        GenericButtonVariant.DESTRUCTIVE -> Button(
            onClick = onClick,
            enabled = enabled,
            colors = ButtonDefaults.buttonColors(containerColor = UcColors.error, contentColor = UcColors.staticWhite),
            modifier = Modifier.height(36.dp),
        ) { Text(label) }
        GenericButtonVariant.SECONDARY -> Button(
            onClick = onClick,
            enabled = enabled,
            colors = ButtonDefaults.buttonColors(containerColor = UcColors.surfaceMuted, contentColor = UcColors.text),
            modifier = Modifier.height(36.dp),
        ) { Text(label) }
        GenericButtonVariant.DEFAULT -> Button(
            onClick = onClick,
            enabled = enabled,
            colors = ButtonDefaults.buttonColors(containerColor = UcColors.action, contentColor = UcColors.staticWhite),
            modifier = Modifier.height(36.dp).padding(horizontal = 0.dp),
        ) { Text(label) }
    }
}`,
  ),

  "ui.generic-controls": sample(
    // --- React (real, from src/app/components/ui/button.tsx — representative primitive of the kit) ---
    `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

// Same vendored Button primitive as "ui.button-registry"; the other kit members
// (Badge, Input, Checkbox, Toggle, Toggle group, Slider, Progress, Separator,
// Skeleton, Alert, Tabs) live alongside it in src/app/components/ui/*.tsx and
// follow the same cva()-driven variant pattern.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border bg-background text-foreground hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Button({
  className, variant, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}`,
    // --- Swift (SwiftUI port) ---
    `import SwiftUI

// Representative port for the generic-controls kit. Badge/Input/Checkbox/Toggle/
// Slider/Progress/Separator/Skeleton/Alert/Tabs map onto native SwiftUI equivalents
// (Text+background, TextField, Toggle-as-checkbox, Toggle, Slider, ProgressView,
// Divider, redacted(reason: .placeholder), a custom banner view, and TabView).
struct GenericControlsButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(title, action: action)
            .buttonStyle(.borderedProminent)
    }
}`,
    // --- Kotlin (Jetpack Compose port) ---
    `import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

// Representative port for the generic-controls kit. Badge/Input/Checkbox/Toggle/
// Slider/Progress/Separator/Skeleton/Alert/Tabs map onto Compose Material3
// equivalents (AssistChip/Badge, OutlinedTextField, Checkbox, Switch, Slider,
// LinearProgressIndicator, HorizontalDivider, a shimmer placeholder, a custom
// banner Composable, and TabRow).
@Composable
fun GenericControlsButton(label: String, onClick: () -> Unit) {
    Button(onClick = onClick) {
        Text(label)
    }
}`,
  ),

  "ui.primary-button": sample(
    `// src/app/components/PrimaryButton.tsx (real)
import type { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "action" | "surface";
  labelSize?: "16" | "18";
}

export default function PrimaryButton({
  children, onClick, disabled = false, className = "",
  variant = "action", labelSize = "16",
}: PrimaryButtonProps) {
  const isAction = variant === "action";
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={\`
        flex w-[327px] h-[48px] px-0 py-3
        justify-center items-center gap-4 rounded
        \${isAction ? "bg-[var(--uc-action)] text-[var(--uc-text-inverse)]"
                    : "bg-[var(--uc-surface)] text-[var(--uc-text)]"}
        \${labelSize === "18" ? "uc-type-h2" : "uc-type-n4-strong"}
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]
        focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]
        \${disabled ? 'opacity-30 cursor-not-allowed'
                    : \`opacity-100 cursor-pointer \${isAction ? "hover:bg-[var(--uc-action-hover)]" : "hover:opacity-90"} active:scale-[0.98]\`}
        \${className}
      \`}>
      <span className="block max-w-full truncate">{children}</span>
    </button>
  );
}`,
    `import SwiftUI

struct PrimaryButton: View {
    let label: String
    let action: () -> Void
    var variant: ButtonVariant = .action
    var labelSize: LabelSize = .regular
    var disabled: Bool = false

    enum ButtonVariant { case action, surface
        var fg: Color { self == .action ? Color("UcTextInverse") : Color("UcText") }
        var bg: Color { self == .action ? Color("UcAction") : Color("UcSurface") }
    }
    enum LabelSize { case regular, large
        var point: CGFloat { self == .regular ? 14 : 18 }
    }

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: labelSize.point, weight: .bold))
                .lineLimit(1)
                .truncationMode(.tail)
                .frame(width: 327, height: 48)
                .background(variant.bg)
                .foregroundColor(variant.fg)
                .cornerRadius(4)
        }
        .disabled(disabled)
        .opacity(disabled ? 0.3 : 1)
        .buttonStyle(ScaleButtonStyle())
    }
}

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class PrimaryButtonVariant(val fg: Color, val bg: Color) {
    ACTION(UcTokens.TextInverse, UcTokens.Action),
    SURFACE(UcTokens.Text, UcTokens.Surface),
}
enum class LabelSize(val sp: Int) { REGULAR(14), LARGE(18) }

@Composable
fun PrimaryButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: PrimaryButtonVariant = PrimaryButtonVariant.ACTION,
    labelSize: LabelSize = LabelSize.REGULAR,
    disabled: Boolean = false,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val pressedScale by animateFloatAsState(
        targetValue = if (pressed && !disabled) 0.98f else 1f,
        animationSpec = tween(durationMillis = 200),
        label = "PrimaryButtonScale",
    )
    Button(
        onClick = onClick,
        enabled = !disabled,
        modifier = modifier
            .width(327.dp).height(48.dp)
            .scale(pressedScale)
            .alpha(if (disabled) 0.3f else 1f),
        colors = ButtonDefaults.buttonColors(
            containerColor = variant.bg,
            contentColor = variant.fg,
            disabledContainerColor = variant.bg,
            disabledContentColor = variant.fg,
        ),
        shape = RoundedCornerShape(4.dp),
        contentPadding = PaddingValues(0.dp),
        interactionSource = interaction,
    ) {
        Text(
            label,
            fontSize = labelSize.sp.sp,
            fontWeight = FontWeight.Bold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}`,
  ),

  "ui.link-button": sample(
    `// src/app/components/ui/LinkButton.tsx (real)
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

type LinkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  iconName?: IconName;
  iconSize?: number;
};

export default function LinkButton({
  children, className, iconName = "chevron-link", iconSize = 24, type = "button", ...props
}: LinkButtonProps) {
  return (
    <button
      className={cn(
        "flex w-fit items-center justify-center gap-0 whitespace-nowrap",
        "text-[13px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--uc-action)]",
        "transition-opacity hover:opacity-80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      type={type} {...props}>
      <span>{children}</span>
      <AppIcon name={iconName} size={iconSize} />
    </button>
  );
}`,
    `import SwiftUI

struct LinkButton: View {
    let text: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 0) {
                Text(text.uppercased())
                    .font(.system(size: 13, weight: .bold))
                Image(systemName: "chevron.right")
                    .font(.system(size: 16, weight: .semibold))
            }
            .foregroundColor(Color("UcAction"))
            .opacity(1.0)
        }
        .buttonStyle(HoverOpacityStyle())
    }
}

struct HoverOpacityStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.opacity(configuration.isPressed ? 0.8 : 1.0)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LinkButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    TextButton(
        onClick = onClick,
        modifier = modifier.alpha(if (pressed) 0.8f else 1f),
        contentPadding = PaddingValues(0.dp),
        interactionSource = interaction,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text.uppercase(),
                fontSize = 13.sp, fontWeight = FontWeight.Bold,
                color = UcTokens.Action,
            )
            Icon(
                Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = UcTokens.Action,
                modifier = Modifier.size(20.dp),
            )
        }
    }
}`,
  ),

  "ui.pill": sample(
    `// src/app/components/ui/Pill.tsx (curated)
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export type PillVariant = "primary" | "secondary" | "active-counter" | "loading-counter" | "activated";

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillVariant;
  label?: string;
  counterText?: string;
};

function PillSuccessIcon() {
  return (
    <span className="flex size-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--uc-green-success)] text-[var(--uc-static-white)]" aria-hidden="true">
      <svg viewBox="0 0 16 16" className="size-[10px]" fill="none">
        <path d="M4.5 8.1 6.7 10.3 11.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Pill({
  variant = "primary", label, counterText = "0 From 30 Eur",
  className, type = "button", disabled, ...props
}: PillProps) {
  const isPrimary = variant === "primary";
  const isLoading = variant === "loading-counter";
  const isActivated = variant === "activated";
  const displayLabel = label ?? (variant === "secondary" ? "Secondary"
    : isLoading ? "Activate" : isActivated ? "Activated"
    : isPrimary ? "Primary" : counterText);

  return (
    <button type={type} disabled={disabled || isLoading}
      className={cn(
        "uc-type-n5-strong flex h-[36px] w-[120px] items-center justify-center rounded-[18px]",
        "px-[8px] py-[10px] text-center leading-none tracking-[0] shadow-[0_2px_2px_rgba(0,0,0,0.2)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]",
        "disabled:pointer-events-none disabled:opacity-50",
        isPrimary ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                  : "bg-[var(--uc-surface)] text-[var(--uc-text)]",
        variant === "secondary" ? "text-[var(--uc-action)]" : null,
        className,
      )}
      aria-busy={isLoading || undefined} {...props}>
      {isLoading || isActivated ? (
        <span className="flex min-w-0 items-center justify-center gap-[8px]">
          {isLoading ? <PillSpinner /> : <PillSuccessIcon />}
          <span className="truncate">{displayLabel}</span>
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
      )}
    </button>
  );
}`,
    `import SwiftUI

struct Pill: View {
    enum Variant { case primary, secondary, activeCounter, loadingCounter, activated
        var bg: Color { self == .primary ? Color("UcAction") : Color("UcSurface") }
        var fg: Color {
            switch self {
            case .primary: return Color("UcTextInverse")
            case .secondary: return Color("UcAction")
            default: return Color("UcText")
            }
        }
    }
    let variant: Variant
    var label: String

    var body: some View {
        HStack(spacing: 8) {
            if variant == .loadingCounter {
                ProgressView().scaleEffect(0.6).frame(width: 16, height: 16)
            } else if variant == .activated {
                Image(systemName: "checkmark")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white)
                    .padding(3)
                    .background(Color("UcGreenSuccess"))
                    .clipShape(Circle())
            }
            Text(label).lineLimit(1).truncationMode(.tail)
        }
        .font(.system(size: 11, weight: .bold))
        .frame(width: 120, height: 36)
        .background(variant.bg)
        .foregroundColor(variant.fg)
        .clipShape(Capsule())
        .shadow(color: .black.opacity(0.2), radius: 2)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class PillVariant(val bg: Color, val fg: Color) {
    PRIMARY(UcTokens.Action, UcTokens.TextInverse),
    SECONDARY(UcTokens.Surface, UcTokens.Action),
    ACTIVE_COUNTER(UcTokens.Surface, UcTokens.Text),
    LOADING_COUNTER(UcTokens.Surface, UcTokens.Text),
    ACTIVATED(UcTokens.Surface, UcTokens.Text),
}

@Composable
fun Pill(
    variant: PillVariant = PillVariant.PRIMARY,
    label: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .width(120.dp).height(36.dp)
            .background(variant.bg, RoundedCornerShape(18.dp))
            .padding(horizontal = 8.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        when (variant) {
            PillVariant.LOADING_COUNTER ->
                CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
            PillVariant.ACTIVATED -> Box(
                modifier = Modifier.size(16.dp)
                    .background(UcTokens.GreenSuccess, RoundedCornerShape(50)),
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(10.dp)) }
            else -> {}
        }
        if (variant == PillVariant.LOADING_COUNTER || variant == PillVariant.ACTIVATED) Spacer(Modifier.width(8.dp))
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = variant.fg,
             maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}`,
  ),

  // ---- SectionHeadingDivider (13 Meniga states curated) ----
  "ui.section-heading-divider": sample(
    `// src/app/components/SectionHeadingDivider.tsx (curated)
import { cn } from "@/app/components/ui/utils";

export type SectionHeadingVariant =
  | "small-title-data" | "small-two-line-title-data"
  | "medium-title" | "medium-two-line-title"
  | "large-title" | "large-two-line-title"
  | "light-title" | "light-small-title-data";

export default function SectionHeadingDivider({
  title, secondaryText, count, countAlign = "start",
  variant = "medium-title", className,
}: {
  title: string;
  secondaryText?: string;
  count?: number;
  countAlign?: "start" | "end";
  variant?: SectionHeadingVariant;
  className?: string;
}) {
  // 13 Meniga variants collapse into two layout families:
  //   - with count pill  -> h2 + count badge, divider underneath
  //   - without count    -> h2 (optionally + secondaryText), divider underneath
  const isLight = variant.startsWith("light-");
  const titleSizeClass = variant.includes("large") ? "text-[24px]"
                       : variant.includes("small") ? "text-[12px]"
                       : "text-[16px]";

  return (
    <div className={className} data-ds-label="SectionHeadingDivider">
      <div className="flex items-center justify-between gap-[8px]">
        <h2 className={cn("uc-type-n5-strong line-clamp-2 uppercase text-[var(--uc-text-muted)]", titleSizeClass)}>
          {title}
        </h2>
        {typeof count === "number" && (
          <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={\`\${title} count \${count}\`}>
            {count}
          </span>
        )}
      </div>
      {secondaryText ? <p className="uc-type-n5 text-[var(--uc-text-muted)]">{secondaryText}</p> : null}
      {!isLight && <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />}
    </div>
  );
}`,
    `import SwiftUI

enum SectionHeadingVariant: String {
    case smallTitleData, smallTwoLineTitleData, mediumTitle, mediumTwoLineTitle,
         largeTitle, largeTwoLineTitle, lightTitle, lightSmallTitleData

    var titleSize: CGFloat {
        switch self {
        case .largeTitle, .largeTwoLineTitle: return 24
        case .smallTitleData, .smallTwoLineTitleData, .lightSmallTitleData: return 12
        default: return 16
        }
    }
    var showsDivider: Bool { !rawValue.starts(with: "light") }
}

struct SectionHeadingDivider: View {
    let title: String
    var secondaryText: String? = nil
    var count: Int? = nil
    var variant: SectionHeadingVariant = .mediumTitle

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text(title.uppercased())
                    .font(.system(size: variant.titleSize, weight: .bold))
                    .foregroundColor(Color("UcTextMuted"))
                    .lineLimit(2)
                Spacer()
                if let n = count {
                    Text("\\\\(n)")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color("UcTextMuted"))
                }
            }
            if let s = secondaryText {
                Text(s).font(.system(size: 12)).foregroundColor(Color("UcTextMuted"))
            }
            if variant.showsDivider {
                Rectangle().fill(Color("UcBorder")).frame(height: 1).padding(.top, 8)
            }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SectionHeadingDivider(
    title: String,
    secondaryText: String? = null,
    count: Int? = null,
    showsDivider: Boolean = true,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(title.uppercase(),
                 fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.TextMuted,
                 maxLines = 2)
            if (count != null) {
                Text(count.toString(),
                     fontSize = 12.sp, fontWeight = FontWeight.Bold, color = UcTokens.TextMuted)
            }
        }
        secondaryText?.let {
            Text(it, fontSize = 12.sp, color = UcTokens.TextMuted)
        }
        if (showsDivider) {
            Spacer(Modifier.height(8.dp))
            Box(Modifier.fillMaxWidth().height(1.dp).background(UcTokens.Border))
        }
    }
}`,
  ),

  // ---- Bar (progress/awareness meter) ----
  "ui.bar": sample(
    `// src/app/components/ui/Bar.tsx (real, curated)
import type { HTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export type BarStatus = "empty" | "full" | "mid-1" | "mid-2" | "small" | "thin";

const STATUS_WIDTH: Record<Exclude<BarStatus, "empty" | "thin">, number> = {
  full: 327, "mid-1": 176, "mid-2": 64, small: 16,
};

type BarProps = HTMLAttributes<HTMLDivElement> & { status?: BarStatus };

export default function Bar({ status = "empty", className, ...props }: BarProps) {
  if (status === "thin") {
    return (
      <div className={cn("relative h-px w-[279px] shrink-0 bg-[var(--uc-neutral-300)]", className)}
           data-bar-status={status} role="presentation" {...props}>
        <span className="absolute inset-y-0 left-0 w-[109px] bg-[var(--uc-neutral-700)]" />
      </div>
    );
  }

  const value = status === "empty" ? 0 : STATUS_WIDTH[status];

  return (
    <div className={cn("relative h-[8px] w-[375px] shrink-0 bg-[var(--uc-static-white)]", className)}
         data-bar-status={status} role="meter" aria-valuemin={0} aria-valuemax={327}
         aria-valuenow={value} {...props}>
      {value > 0 && (
        <span className="absolute bottom-0 left-[24px] top-0 rounded-[4px] bg-[var(--uc-action)]"
              style={{ width: value }} />
      )}
    </div>
  );
}`,
    `import SwiftUI

enum BarStatus { case empty, full, mid1, mid2, small, thin
    var width: CGFloat { switch self {
        case .full: return 327; case .mid1: return 176; case .mid2: return 64
        case .small: return 16; default: return 0
    }}
}

struct Bar: View {
    var status: BarStatus = .empty

    var body: some View {
        if status == .thin {
            ZStack(alignment: .leading) {
                Rectangle().fill(Color("UcNeutral300")).frame(height: 1)
                Rectangle().fill(Color("UcNeutral700")).frame(width: 109, height: 1)
            }
            .frame(width: 279)
        } else {
            ZStack(alignment: .bottomLeading) {
                Rectangle().fill(Color.white).frame(width: 375, height: 8)
                if status.width > 0 {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color("UcAction"))
                        .padding(.leading, 24)
                        .frame(width: status.width, height: 8)
                }
            }
            .accessibilityElement()
            .accessibilityLabel("Progress")
            .accessibilityValue("\\\\(Int(status.width))")
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

enum class BarStatus(val width: Int) {
    EMPTY(0), FULL(327), MID_1(176), MID_2(64), SMALL(16), THIN(109)
}

@Composable
fun Bar(status: BarStatus = BarStatus.EMPTY, modifier: Modifier = Modifier) {
    if (status == BarStatus.THIN) {
        Box(modifier = modifier.width(279.dp).height(1.dp).background(UcTokens.Neutral300)) {
            Box(Modifier.fillMaxHeight().width(109.dp).background(UcTokens.Neutral700))
        }
    } else {
        Box(
            modifier = modifier.width(375.dp).height(8.dp).background(Color.White),
        ) {
            if (status.width > 0) {
                Box(
                    Modifier
                        .align(androidx.compose.ui.Alignment.BottomStart)
                        .padding(start = 24.dp)
                        .width(status.width.dp).height(8.dp)
                        .background(UcTokens.Action, RoundedCornerShape(4.dp))
                )
            }
        }
    }
}`,
  ),

  // ---- LanguageSelectorButton ----
  "ui.language-selector-button": sample(
    `// src/app/components/ui/LanguageSelectorButton.tsx (real)
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { Language } from "@/app/contexts/LanguageContext";

export default function LanguageSelectorButton({
  onClick, language: providedLanguage,
}: { onClick: () => void; language?: Language }) {
  const context = useLanguage();
  const language = providedLanguage ?? context.language;

  return (
    <button onClick={onClick}
      className="flex flex-col justify-center items-end gap-[1px] cursor-pointer hover:opacity-80 transition-opacity">
      <p className="uc-type-n5-strong text-right text-[var(--uc-static-white)]">
        {language.toUpperCase()}
      </p>
      <div className="h-[1px] w-full bg-[var(--uc-surface)]" />
    </button>
  );
}`,
    `import SwiftUI

struct LanguageSelectorButton: View {
    let language: String           // e.g. "ro"
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .trailing, spacing: 1) {
                Text(language.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                Rectangle().fill(Color("UcSurface")).frame(height: 1)
            }
            .frame(minWidth: 36)
        }
        .buttonStyle(.plain)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LanguageSelectorButton(
    language: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.clickable(onClick = onClick),
        horizontalAlignment = Alignment.End,
    ) {
        Text(
            language.uppercase(),
            fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.StaticWhite,
        )
        Spacer(Modifier.height(1.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(UcTokens.Surface))
    }
}`,
  ),

  // ---- NavigationLink ----
  "ui.navigation-link": sample(
    `// src/app/components/ui/NavigationLink.tsx (real)
import ChevronIcon from "@/app/components/ui/ChevronIcon";

export default function NavigationLink({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-[1px] cursor-pointer hover:opacity-80 transition-opacity"
      type="button">
      <p className="uc-type-n5-strong whitespace-nowrap text-[var(--uc-static-white)]">{text}</p>
      <ChevronIcon />
    </button>
  );
}`,
    `import SwiftUI

struct NavigationLink: View {
    let text: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 1) {
                Text(text)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                Image(systemName: "chevron.right")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
            }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NavigationLink(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TextButton(onClick = onClick, modifier = modifier, contentPadding = PaddingValues(0.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.StaticWhite)
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = UcTokens.StaticWhite,
                 modifier = Modifier.size(28.dp))
        }
    }
}`,
  ),

  // ---- PreLoginHeading ----
  "ui.prelogin-heading": sample(
    `// src/app/components/ui/PreLoginHeading.tsx (real)
export default function PreLoginHeading({ h1, h2, h3 }: { h1: string; h2: string; h3: string }) {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <div className="flex flex-col gap-[32px]">
        <h1 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[38px] font-bold leading-[40px] tracking-[0.335px]">
          {h1}
        </h1>
        <h2 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[24px] font-bold leading-[normal] tracking-[0.267px]">
          {h2}
        </h2>
      </div>
      <h3 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[18px] font-normal leading-[normal]">
        {h3}
      </h3>
    </div>
  );
}`,
    `import SwiftUI

struct PreLoginHeading: View {
    let h1: String
    let h2: String
    let h3: String

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 32) {
                Text(h1).font(.custom("UniCredit-Bold", size: 38)).foregroundColor(.white)
                Text(h2).font(.custom("UniCredit-Bold", size: 24)).foregroundColor(.white)
            }
            Text(h3)
                .font(.custom("UniCredit", size: 18))
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

@Composable
fun PreLoginHeading(h1: String, h2: String, h3: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(32.dp)) {
            Text(h1, fontSize = 38.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text(h2, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
        Text(h3, fontSize = 18.sp, fontWeight = FontWeight.Normal, color = Color.White)
    }
}`,
  ),

  // ---- AmountVisibilityButton ----
  "ui.amount-visibility-button": sample(
    `// src/app/components/AmountVisibilityButton.tsx (real)
import { AppIcon } from "@/app/components/icons";

export default function AmountVisibilityButton({
  hidden, onToggle,
}: { hidden: boolean; onToggle: () => void }) {
  return (
    <button type="button"
      className="flex h-[32px] w-[32px] items-center justify-center cursor-pointer hover:opacity-70"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? "Show amounts" : "Hide amounts"}>
      {hidden
        ? <AppIcon name="amount-show" color="var(--uc-icon)" />
        : <AppIcon name="amount-hide" color="var(--uc-icon)" />}
    </button>
  );
}`,
    `import SwiftUI

struct AmountVisibilityButton: View {
    @Binding var hidden: Bool

    var body: some View {
        Button {
            hidden.toggle()
        } label: {
            Image(systemName: hidden ? "eye" : "eye.slash")
                .font(.system(size: 18))
                .foregroundColor(Color("UcIcon"))
                .frame(width: 32, height: 32)
        }
        .accessibilityLabel(hidden ? "Show amounts" : "Hide amounts")
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AmountVisibilityButton(
    hidden: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    IconButton(
        onClick = onToggle,
        modifier = modifier.size(32.dp),
    ) {
        Icon(
            imageVector = if (hidden) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
            contentDescription = if (hidden) "Show amounts" else "Hide amounts",
            tint = UcTokens.Icon,
        )
    }
}`,
  ),

  // ---- BackButton (bare back-arrow) ----
  "ui.back-button": sample(
    `// src/app/components/common/BackButton.tsx (real)
import { AppIcon } from "@/app/components/icons";

export default function BackButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick}
      className={\`w-[32px] h-[32px] flex items-center justify-center cursor-pointer \${className}\`}
      aria-label="Go back">
      <AppIcon name="back-line" />
    </button>
  );
}`,
    `import SwiftUI

struct BackButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: "chevron.left")
                .font(.system(size: 20, weight: .semibold))
                .frame(width: 32, height: 32)
        }
        .accessibilityLabel("Go back")
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun BackButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Icon(
        Icons.AutoMirrored.Filled.ArrowBack,
        contentDescription = "Go back",
        modifier = modifier.size(32.dp).clickable(onClick = onClick),
        tint = UcTokens.Icon,
    )
}`,
  ),

  // ---- ChevronIcon (32x32 chevron wrapper) ----
  "ui.chevron-icon": sample(
    `// src/app/components/ui/ChevronIcon.tsx (real)
import { AppIcon } from "@/app/components/icons";

export default function ChevronIcon() {
  return (
    <div className="w-[32px] h-[32px] flex items-center justify-center shrink-0">
      <AppIcon name="chevron-link" color="var(--uc-static-white)" />
    </div>
  );
}`,
    `import SwiftUI

struct ChevronIcon: View {
    var color: Color = .white

    var body: some View {
        Image(systemName: "chevron.right")
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(color)
            .frame(width: 32, height: 32)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ChevronIcon(modifier: Modifier = Modifier, color: Color = UcTokens.StaticWhite) {
    Icon(
        Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null,
        tint = color, modifier = modifier.size(32.dp),
    )
}`,
  ),

  // ---- ThemeModeSegment (light/dark segmented control) ----
  "ui.theme-mode-segment": sample(
    `// src/app/components/ThemeModeSegment.tsx (curated)
function SunIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4.375V1.875M10 18.125V15.625M4.375 10H1.875M18.125 10H15.625M5.15625 5.15625L3.4375 3.4375M16.5625 16.5625L14.8438 14.8438M14.8438 5.15625L16.5625 3.4375M3.4375 16.5625L5.15625 14.8438"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10 13.125C11.7259 13.125 13.125 11.7259 13.125 10C13.125 8.27411 11.7259 6.875 10 6.875C8.27411 6.875 6.875 8.27411 6.875 10C6.875 11.7259 8.27411 13.125 10 13.125Z"
        fill="currentColor" />
    </svg>
  );
}
function MoonIcon({ size = 14 }: { size?: number }) { /* crescent SVG path */ }

export default function ThemeModeSegment({
  value, onChange, ariaLabel = "Theme mode",
}: { value: "light" | "dark"; onChange: (v: "light" | "dark") => void; ariaLabel?: string }) {
  return (
    <div className="inline-flex items-center gap-[2px] rounded-[14px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]"
      aria-label={ariaLabel}>
      {(["light", "dark"] as const).map((mode) => {
        const isActive = value === mode;
        return (
          <button key={mode} type="button" aria-label={mode === "light" ? "Light mode" : "Dark mode"}
            aria-pressed={isActive} onClick={() => onChange(mode)}
            className={
              "grid size-[24px] place-items-center rounded-[10px] transition-colors " +
              (isActive
                ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]")
            }>
            {mode === "light" ? <SunIcon /> : <MoonIcon />}
          </button>
        );
      })}
    </div>
  );
}`,
    `import SwiftUI

struct ThemeModeSegment: View {
    @Binding var value: ThemeMode

    enum ThemeMode: String, CaseIterable { case light, dark
        var systemImage: String { self == .light ? "sun.max" : "moon" }
        var label: String { self == .light ? "Light mode" : "Dark mode" }
    }

    var body: some View {
        HStack(spacing: 2) {
            ForEach(ThemeMode.allCases, id: \\.rawValue) { mode in
                Button {
                    value = mode
                } label: {
                    Image(systemName: mode.systemImage)
                        .font(.system(size: 12))
                        .frame(width: 24, height: 24)
                        .background(value == mode ? Color("UcSurface") : .clear)
                        .foregroundColor(value == mode ? Color("UcText") : Color("UcTextMuted"))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .accessibilityLabel(mode.label)
                .accessibilityAddTraits(value == mode ? .isSelected : [])
            }
        }
        .padding(2)
        .background(Color("UcSurfaceMuted"))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color("UcBorder")))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

enum class ThemeMode(val icon: androidx.compose.ui.graphics.vector.ImageVector, val label: String) {
    LIGHT(Icons.Filled.LightMode, "Light mode"),
    DARK(Icons.Filled.DarkMode, "Dark mode"),
}

@Composable
fun ThemeModeSegment(
    value: ThemeMode,
    onChange: (ThemeMode) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .background(UcTokens.SurfaceMuted, RoundedCornerShape(14.dp))
            .padding(2.dp),
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        ThemeMode.values().forEach { mode ->
            val active = mode == value
            Box(
                modifier = Modifier.size(24.dp)
                    .background(if (active) UcTokens.Surface else androidx.compose.ui.graphics.Color.Transparent, RoundedCornerShape(10.dp))
                    .clickable { onChange(mode) },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    mode.icon, contentDescription = mode.label,
                    tint = if (active) UcTokens.Text else UcTokens.TextMuted,
                    modifier = Modifier.size(14.dp),
                )
            }
        }
    }
}`,
  ),

  // ---- WalletButton (Google/Apple Wallet + Click-to-Pay) ----
  "ui.wallet-button": sample(
    `// src/app/components/ui/WalletButton.tsx (curated; wallet SVG paths elided)
import { cn } from "@/app/components/ui/utils";

type WalletVariant = "google" | "apple" | "click-to-pay";

const WALLETS: Record<WalletVariant, { label: string; height: number }> = {
  google:        { label: "Add to Google Wallet",       height: 60 },
  apple:         { label: "Add to Apple Wallet",        height: 60 },
  "click-to-pay":{ label: "Add to Click to pay",        height: 56 },
};

export default function WalletButton({
  variant, onClick, className,
}: { variant: WalletVariant; onClick?: () => void; className?: string }) {
  const meta = WALLETS[variant];
  return (
    <button type="button" onClick={onClick}
      className={cn("flex w-full items-center justify-center rounded-[12px]",
        "bg-[var(--uc-static-black)] text-[var(--uc-static-white)] text-[16px] font-bold",
        "transition-opacity hover:opacity-90", className)}
      style={{ height: meta.height }}
      aria-label={meta.label}>
      {/* Wallet logo SVG (Google/Apple/click-to-pay) elided for brevity */}
      <span>{meta.label}</span>
    </button>
  );
}`,
    `import SwiftUI

enum WalletVariant { case google, apple, clickToPay
    var label: String {
        switch self {
        case .google: return "Add to Google Wallet"
        case .apple: return "Add to Apple Wallet"
        case .clickToPay: return "Add to Click to pay"
        }
    }
    var height: CGFloat { self == .clickToPay ? 56 : 60 }
}

struct WalletButton: View {
    let variant: WalletVariant
    var action: () -> Void = {}

    var body: some View {
        Button(action: action) {
            Text(variant.label)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: variant.height)
                .background(Color.black)
                .cornerRadius(12)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class WalletVariant(val label: String, val height: Int) {
    GOOGLE("Add to Google Wallet", 60),
    APPLE("Add to Apple Wallet", 60),
    CLICK_TO_PAY("Add to Click to pay", 56),
}

@Composable
fun WalletButton(
    variant: WalletVariant,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth().height(variant.height.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Black, contentColor = Color.White),
        shape = RoundedCornerShape(12.dp),
    ) {
        Text(variant.label, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    }
}`,
  ),

  // ============================================================
  // BATCH 3 — Forms & controls
  // ============================================================

  // ---- TextField (line input with floating label) ----
  "ui.text-field": sample(
    `// src/app/components/TextField.tsx (curated)
// Six visual states: empty/focus/filled/error-filled/error-empty/disabled-*
// Floating label moves from center to top-left when focused or filled.
import { cn } from "@/app/components/ui/utils";

export type TextFieldVisualState =
  | "empty" | "focus" | "filled"
  | "error-filled" | "error-empty"
  | "disabled-empty" | "disabled-filled";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  helperText2?: string;
  errorText?: string;
  errorText2?: string;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: "text" | "numeric" | "decimal";
  suffix?: string;
  visualState?: TextFieldVisualState;
  readOnly?: boolean;
  trailingIconName?: string;
  onActivate?: () => void;
}

export default function TextField({
  label, value, onChange,
  helperText, helperText2, errorText, errorText2,
  placeholder, disabled, inputMode, suffix, visualState, readOnly, trailingIconName, onActivate,
}: TextFieldProps) {
  const isError = visualState === "error-filled" || visualState === "error-empty";
  const isDisabled = disabled || visualState === "disabled-empty" || visualState === "disabled-filled";
  const hasValue = value.length > 0;
  const shouldFloatLabel = hasValue || visualState === "focus" || visualState === "filled" || visualState === "error-filled";

  return (
    <div className="w-full" data-component="TextField">
      {shouldFloatLabel && (
        <label className="uc-type-n5 block"
               style={{ color: isError ? "var(--uc-status-red)" : isDisabled ? "var(--uc-neutral-650)" : "var(--uc-text-muted)" }}>
          {label}
        </label>
      )}
      <div className={cn("mt-[4px] flex items-end",
                          shouldFloatLabel ? "" : "")}>
        <div className={cn(
          "flex min-w-0 flex-1 items-end border-b pb-[3px]",
          isDisabled ? "cursor-default" : "cursor-text",
        )}
          style={{
            borderBottomColor: isError ? "var(--uc-status-red)" : isDisabled ? "var(--uc-text-subtle)" : "var(--uc-text)",
            borderBottomWidth: isError ? 1 : 0.5,
          }}>
          {shouldFloatLabel ? null : (
            <span className="uc-type-p1 text-[var(--uc-text-muted)]">{label}</span>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            readOnly={readOnly || !shouldFloatLabel}
            inputMode={inputMode}
            placeholder={shouldFloatLabel ? placeholder : ""}
            aria-label={label}
            className="uc-type-p1 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-default placeholder:text-[var(--uc-text-subtle)]"
            style={{ color: isDisabled ? "var(--uc-neutral-650)" : "var(--uc-text)" }}
          />
          {suffix ? <span className="uc-type-p1 ml-[8px] text-[var(--uc-text-muted)]">{suffix}</span> : null}
        </div>
        {trailingIconName ? (
          <span className="ml-[12px] grid h-[32px] w-[32px] shrink-0 place-items-center" aria-hidden="true">
            {/* trailing glyph */}
          </span>
        ) : null}
      </div>
      {/* helper / error text rows below */}
    </div>
  );
}`,
    `import SwiftUI

enum TextFieldState { case empty, focus, filled, errorFilled, errorEmpty, disabledEmpty, disabledFilled
    var isError: Bool { self == .errorFilled || self == .errorEmpty }
    var isDisabled: Bool { self == .disabledEmpty || self == .disabledFilled }
    var floatsLabel: Bool {
        switch self {
        case .filled, .focus, .errorFilled: return true
        default: return false
        }
    }
}

struct TextField: View {
    let label: String
    @Binding var value: String
    var state: TextFieldState = .empty
    var placeholder: String? = nil

    private var fg: Color {
        if state.isError { return Color("UcStatusRed") }
        if state.isDisabled { return Color("UcNeutral650") }
        return Color("UcText")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if state.floatsLabel {
                Text(label)
                    .font(.system(size: 11))
                    .foregroundColor(state.isError ? Color("UcStatusRed") : Color("UcTextMuted"))
            }
            HStack {
                if !state.floatsLabel && value.isEmpty {
                    Text(label).foregroundColor(Color("UcTextMuted"))
                }
                TextField(label, text: $value, prompt: placeholder.map(Text.init))
                    .foregroundColor(fg)
                    .disabled(state.isDisabled)
            }
            .padding(.bottom, 3)
            .overlay(Rectangle().frame(height: state.isError ? 1 : 0.5)
                .foregroundColor(state.isError ? Color("UcStatusRed") :
                                 state.isDisabled ? Color("UcTextSubtle") : Color("UcText")),
                     alignment: .bottom)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class TextFieldState {
    EMPTY, FOCUS, FILLED, ERROR_FILLED, ERROR_EMPTY, DISABLED_EMPTY, DISABLED_FILLED;
    val isError get() = this == ERROR_FILLED || this == ERROR_EMPTY
    val isDisabled get() = this == DISABLED_EMPTY || this == DISABLED_FILLED
    val floatsLabel get() = this == FILLED || this == FOCUS || this == ERROR_FILLED
}

@Composable
fun TextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    state: TextFieldState = TextFieldState.EMPTY,
    placeholder: String? = null,
) {
    val isError = state.isError
    val isDisabled = state.isDisabled
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        if (state.floatsLabel) {
            Text(label, fontSize = 11.sp,
                 color = if (isError) UcTokens.StatusRed else UcTokens.TextMuted)
        }
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            enabled = !isDisabled,
            placeholder = { if (state.floatsLabel && placeholder != null) Text(placeholder) },
            label = { if (!state.floatsLabel) Text(label, color = UcTokens.TextMuted) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = if (isError) UcTokens.StatusRed else UcTokens.Text,
                unfocusedBorderColor = if (isError) UcTokens.StatusRed else UcTokens.TextSubtle,
                disabledBorderColor = UcTokens.TextSubtle,
                focusedTextColor = UcTokens.Text,
                unfocusedTextColor = if (isDisabled) UcTokens.Neutral650 else UcTokens.Text,
            ),
        )
    }
}`,
  ),

  // ---- AmountField (currency picker built on TextField) ----
  "ui.amount-field": sample(
    `// src/app/components/AmountField.tsx (curated)
import TextField, { type TextFieldVisualState } from "@/app/components/TextField";
import { AppIcon, type IconName } from "@/app/components/icons";

interface AmountFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  currencyLabel?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  disabled?: boolean;
  visualState?: TextFieldVisualState;
  currencyIconName?: IconName;
}

export default function AmountField({
  label, value, onChange, currency = "RSD", currencyLabel = "Currency",
  helperText, errorText, placeholder, disabled, visualState,
  currencyIconName = "chevron-down-wide",
}: AmountFieldProps) {
  const isDisabled = disabled || visualState === "disabled-empty" || visualState === "disabled-filled";
  const currencyColor = isDisabled ? "var(--uc-neutral-650)" : "var(--uc-text)";
  return (
    <div className="flex w-full items-start gap-[24px]">
      <div className="min-w-0 flex-1">
        <TextField label={label} value={value} onChange={onChange}
          helperText={helperText} errorText={errorText} placeholder={placeholder}
          disabled={disabled} visualState={visualState} />
      </div>
      <button type="button" disabled={isDisabled}
        className="flex shrink-0 items-start gap-0 text-left disabled:cursor-default">
        <span className="flex min-w-[64px] flex-col">
          <span className="uc-type-n5" style={{ color: isDisabled ? "var(--uc-neutral-650)" : "var(--uc-text-muted)" }}>
            {currencyLabel}
          </span>
          <span className="uc-type-p1 mt-[4px]" style={{ color: currencyColor }}>{currency}</span>
        </span>
        <span className="mt-[21px] grid h-[32px] w-[32px] shrink-0 place-items-center">
          <AppIcon name={currencyIconName} color={currencyColor} />
        </span>
      </button>
    </div>
  );
}`,
    `import SwiftUI

struct AmountField: View {
    let label: String
    @Binding var value: String
    var currency: String = "RSD"
    var currencyLabel: String = "Currency"
    var state: TextFieldState = .empty

    var body: some View {
        HStack(alignment: .top, spacing: 24) {
            TextField(label: label, value: $value, state: state)
                .frame(maxWidth: .infinity, alignment: .leading)
            VStack(alignment: .leading, spacing: 4) {
                Text(currencyLabel)
                    .font(.system(size: 11))
                    .foregroundColor(Color("UcTextMuted"))
                HStack(spacing: 0) {
                    Text(currency).font(.system(size: 16))
                    Image(systemName: "chevron.down").font(.system(size: 14))
                }
                .foregroundColor(Color("UcText"))
            }
            .frame(minWidth: 64, alignment: .leading)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AmountField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    currency: String = "RSD",
    currencyLabel: String = "Currency",
    state: TextFieldState = TextFieldState.EMPTY,
) {
    Row(modifier = modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(24.dp)) {
        TextField(label = label, value = value, onValueChange = onValueChange, state = state,
                  modifier = Modifier.weight(1f))
        Column(modifier = Modifier.width(64.dp), horizontalAlignment = Alignment.Start) {
            Text(currencyLabel, fontSize = 11.sp, color = UcTokens.TextMuted)
            Spacer(Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(currency, fontSize = 16.sp, color = UcTokens.Text)
                Icon(Icons.Filled.KeyboardArrowDown, null, tint = UcTokens.Text, modifier = Modifier.size(32.dp))
            }
        }
    }
}`,
  ),

  // ---- NavigationRow (18 Meniga cases) ----
  "ui.navigation-row": sample(
    `// src/app/components/NavigationRow.tsx (curated)
// 18 Meniga cases collapse into a flexible row that supports:
// leading icon OR leading visual OR card-art thumbnail;
// title (with optional action tone); optional description; optional link label;
// optional toggle switch; optional chevron; row heights 64/80/96.
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export interface NavigationRowProps {
  title: string;
  description?: string;
  leadingIconName?: IconName;
  leadingVisual?: React.ReactNode;
  trailingAccessory?: "chevron" | "toggle";
  onToggleChange?: (checked: boolean) => void;
  checked?: boolean;
  onClick?: () => void;
  rowHeight?: 64 | 80 | 96;
  titleTone?: "default" | "action";
}

export default function NavigationRow({
  title, description, leadingIconName, leadingVisual,
  trailingAccessory, onToggleChange, checked, onClick, rowHeight = 80,
  titleTone = "default",
}: NavigationRowProps) {
  const titleColor = titleTone === "action" ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]";
  return (
    <div className="rounded-[8px] bg-[var(--uc-surface)] px-[16px] py-[8px] shadow-sm">
      <button type="button" onClick={onClick}
        className={cn("flex w-full items-center gap-[16px] bg-[var(--uc-surface)] text-left h-[" + rowHeight + "px] pl-[24px] pr-[12px]")}
        aria-label={title} data-component="NavigationRow">
        {(leadingIconName || leadingVisual) && (
          <span className="flex size-[32px] shrink-0 items-center justify-center">
            {leadingVisual ?? <AppIcon name={leadingIconName!} color="var(--uc-text)" />}
          </span>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-[16px]">
          <div className="min-w-0 flex-1">
            <p className={cn("uc-type-n4-strong line-clamp-2", titleColor)}>{title}</p>
            {description ? (
              <p className="uc-type-n4 mt-[4px] line-clamp-2 text-[var(--uc-text)]">{description}</p>
            ) : null}
          </div>
        </div>
        {trailingAccessory === "chevron" && <AppIcon name="chevron-link" color="var(--uc-text)" />}
        {trailingAccessory === "toggle" && (
          <input type="checkbox" role="switch" checked={checked}
            onChange={(e) => onToggleChange?.(e.target.checked)} />
        )}
      </button>
    </div>
  );
}`,
    `import SwiftUI

struct NavigationRow: View {
    let title: String
    var description: String? = nil
    var systemImage: String? = nil
    var trailingAccessory: TrailingAccessory = .chevron
    var action: () -> Void = {}

    enum TrailingAccessory { case chevron, toggle, none }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                if let s = systemImage {
                    Image(systemName: s).frame(width: 32, height: 32).foregroundColor(Color("UcText"))
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.system(size: 14, weight: .bold))
                        .lineLimit(2).foregroundColor(Color("UcText"))
                    if let d = description {
                        Text(d).font(.system(size: 14))
                            .lineLimit(2).foregroundColor(Color("UcText"))
                    }
                }
                Spacer()
                if trailingAccessory == .chevron {
                    Image(systemName: "chevron.right").foregroundColor(Color("UcText"))
                }
            }
            .padding(.horizontal, 24)
            .frame(minHeight: 80)
            .background(Color("UcSurface"))
            .cornerRadius(8)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NavigationRow(
    title: String,
    description: String? = null,
    leadingIcon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(8.dp),
        color = UcTokens.Surface,
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 8.dp).heightIn(min = 80.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            leadingIcon?.let {
                Icon(it, null, tint = UcTokens.Text, modifier = Modifier.size(32.dp))
                Spacer(Modifier.width(16.dp))
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
                     maxLines = 2, overflow = TextOverflow.Ellipsis)
                description?.let {
                    Spacer(Modifier.height(4.dp))
                    Text(it, fontSize = 14.sp, color = UcTokens.Text,
                         maxLines = 2, overflow = TextOverflow.Ellipsis)
                }
            }
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = UcTokens.Text,
                 modifier = Modifier.size(32.dp))
        }
    }
}`,
  ),

  // ---- ToggleButton (60x30 switch) ----
  "ui.toggle-button": sample(
    `// src/app/components/ToggleButton.tsx (curated)
import { cn } from "@/app/components/ui/utils";

export default function ToggleButton({
  checked, onChange, disabled = false,
}: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[30px] w-[60px] shrink-0 rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]",
        disabled
          ? "bg-[var(--uc-neutral-300)] cursor-not-allowed"
          : checked
            ? "bg-[var(--uc-action)]"
            : "bg-[var(--uc-neutral-400)]",
      )}>
      <span
        className={cn(
          "absolute top-[3px] size-[24px] rounded-full bg-[var(--uc-static-white)] shadow-md transition-transform duration-200",
          checked ? "translate-x-[33px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}`,
    `import SwiftUI

struct ToggleButton: View {
    @Binding var checked: Bool
    var disabled: Bool = false

    var body: some View {
        Button { if !disabled { checked.toggle() } } label: {
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(disabled ? Color("UcNeutral300") :
                          checked ? Color("UcAction") : Color("UcNeutral400"))
                    .frame(width: 60, height: 30)
                Circle()
                    .fill(.white)
                    .frame(width: 24, height: 24)
                    .shadow(radius: 1)
                    .padding(3)
                    .offset(x: checked ? 30 : 0)
                    .animation(.easeInOut(duration: 0.2), value: checked)
            }
        }
        .buttonStyle(.plain)
        .disabled(disabled)
        .accessibilityLabel("Toggle")
        .accessibilityValue(checked ? "on" : "off")
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ToggleButton(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    disabled: Boolean = false,
) {
    val thumbOffset by animateDpAsState(if (checked) 33.dp else 3.dp, label = "thumb")
    Box(
        modifier = modifier
            .width(60.dp).height(30.dp)
            .clip(RoundedCornerShape(50))
            .background(
                if (disabled) UcTokens.Neutral300
                else if (checked) UcTokens.Action else UcTokens.Neutral400
            )
            .clickable(enabled = !disabled) { onCheckedChange(!checked) },
    ) {
        Box(
            Modifier
                .padding(start = thumbOffset, top = 3.dp, bottom = 3.dp)
                .size(24.dp)
                .clip(CircleShape)
                .background(Color.White),
        )
    }
}`,
  ),

  // ---- DateFilter (date-range chip row) ----
  "ui.date-filter": sample(
    `// src/app/components/ui/DateFilter.tsx (real, curated)
import { cn } from "@/app/components/ui/utils";

export type DateFilterType = "five" | "four";

function DateFilterChip({
  value, selected, onClick,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; selected: boolean }) {
  return (
    <button type="button"
      className={cn(
        "inline-flex h-[24px] min-w-[42px] shrink-0 items-center justify-center rounded-[4px]",
        "px-[8px] text-center text-[14px] font-bold leading-[16px] whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]",
        selected
          ? "border border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-static-white)]"
          : "border border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]",
      )}
      aria-pressed={selected} onClick={onClick} data-date-filter-chip={value}>
      {value}
    </button>
  );
}

export default function DateFilter({
  type = "five", selectedValue = "3 Y", selectedIndex = 3, onChange,
}: { type?: DateFilterType; selectedValue?: string; selectedIndex?: number; onChange?: (v: string) => void }) {
  const values = type === "five" ? ["1 M", "3 M", "1 Y", "3 Y", "MAX"] : ["0 Y", "1 Y", "3 Y", "3 Y"];
  return (
    <div className="flex min-h-[24px] w-full max-w-[286px] items-center justify-center gap-[8px]">
      {values.map((value, index) => (
        <DateFilterChip key={value + "-" + index} value={value}
          selected={index === selectedIndex || (selectedIndex < 0 && value === selectedValue)}
          onClick={() => onChange?.(value)} />
      ))}
    </div>
  );
}`,
    `import SwiftUI

enum DateFilterType { case five, four }

struct DateFilter: View {
    var type: DateFilterType = .five
    @State var selectedIndex: Int = 3
    let onChange: (String) -> Void

    private var values: [String] {
        type == .five ? ["1 M", "3 M", "1 Y", "3 Y", "MAX"] : ["0 Y", "1 Y", "3 Y", "3 Y"]
    }

    var body: some View {
        HStack(spacing: 8) {
            ForEach(values.indices, id: \\.self) { i in
                let selected = i == selectedIndex
                Button { selectedIndex = i; onChange(values[i]) } label: {
                    Text(values[i])
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(selected ? .white : Color("UcText"))
                        .frame(minWidth: 42, minHeight: 24)
                        .padding(.horizontal, 8)
                        .background(selected ? Color("UcAction") : .clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(selected ? Color("UcAction") : Color("UcText"))
                        )
                }
            }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun DateFilter(
    values: List<String> = listOf("1 M", "3 M", "1 Y", "3 Y", "MAX"),
    onChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var selected by remember { mutableStateOf(3) }
    Row(
        modifier = modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
    ) {
        values.forEachIndexed { i, v ->
            val isSelected = i == selected
            Text(
                v,
                fontSize = 14.sp, fontWeight = FontWeight.Bold,
                color = if (isSelected) Color.White else UcTokens.Text,
                modifier = Modifier
                    .heightIn(min = 24.dp)
                    .padding(horizontal = 8.dp)
                    .background(if (isSelected) UcTokens.Action else Color.Transparent, RoundedCornerShape(4.dp))
                    .border(1.dp, if (isSelected) UcTokens.Action else UcTokens.Text, RoundedCornerShape(4.dp))
                    .clickable { selected = i; onChange(v) }
                    .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true),
            )
        }
    }
}`,
  ),

  // ---- PillSorting (4 chip sort rail) ----
  "ui.pill-sorting": sample(
    `// src/app/components/ui/PillSorting.tsx (curated)
import { cn } from "@/app/components/ui/utils";

export type PillSortingValue = "max-value" | "min-value" | "max-percent" | "min-percent";

const SORTING_OPTIONS: Array<{ value: PillSortingValue; label: string }> = [
  { value: "max-value", label: "MAX VALUE" },
  { value: "min-value", label: "MIN VALUE" },
  { value: "max-percent", label: "MAX %" },
  { value: "min-percent", label: "MIN %" },
];

export default function PillSorting({
  selectedValue = "max-percent", onChange,
}: { selectedValue?: PillSortingValue | null; onChange?: (v: PillSortingValue) => void }) {
  return (
    <div className="flex h-[40px] w-[375px] items-center justify-center gap-[8px]" data-pill-sorting>
      {SORTING_OPTIONS.map((option) => {
        const selected = selectedValue === option.value;
        return (
          <button key={option.value} type="button" aria-pressed={selected}
            onClick={() => onChange?.(option.value)}
            className={cn(
              "flex h-[24px] shrink-0 items-center justify-center rounded-[14.5px] px-[8px] py-[4px]",
              "text-[14px] leading-[14px] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]",
              selected
                ? "border border-[var(--uc-static-black)] bg-[var(--uc-static-black)] font-bold text-[var(--uc-static-white)]"
                : "border border-[var(--uc-text)] bg-transparent font-normal text-[var(--uc-text)]",
            )}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}`,
    `import SwiftUI

enum PillSort: String, CaseIterable {
    case maxValue = "MAX VALUE", minValue = "MIN VALUE",
         maxPercent = "MAX %", minPercent = "MIN %"
}

struct PillSorting: View {
    @Binding var selected: PillSort

    var body: some View {
        HStack(spacing: 8) {
            ForEach(PillSort.allCases, id: \\.rawValue) { option in
                let isActive = option == selected
                Button { selected = option } label: {
                    Text(option.rawValue)
                        .font(.system(size: 14, weight: isActive ? .bold : .regular))
                        .foregroundColor(isActive ? .white : Color("UcText"))
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .frame(minHeight: 24)
                        .background(isActive ? Color.black : .clear)
                        .overlay(Capsule().stroke(isActive ? Color.black : Color("UcText")))
                        .clipShape(Capsule())
                }
            }
        }
        .frame(height: 40)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class PillSort(val label: String) {
    MAX_VALUE("MAX VALUE"), MIN_VALUE("MIN VALUE"),
    MAX_PERCENT("MAX %"), MIN_PERCENT("MIN %"),
}

@Composable
fun PillSorting(
    selected: PillSort,
    onChange: (PillSort) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth().height(40.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
    ) {
        PillSort.values().forEach { option ->
            val active = option == selected
            Text(
                option.label,
                fontSize = 14.sp,
                fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
                color = if (active) Color.White else UcTokens.Text,
                modifier = Modifier
                    .heightIn(min = 24.dp)
                    .padding(horizontal = 8.dp)
                    .background(if (active) Color.Black else Color.Transparent, RoundedCornerShape(14.5.dp))
                    .border(1.dp, if (active) Color.Black else UcTokens.Text, RoundedCornerShape(14.5.dp))
                    .clickable { onChange(option) }
                    .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true),
            )
        }
    }
}`,
  ),

  // ---- RadioButton (radio with label) ----
  "ui.radio-button": sample(
    `// src/app/components/common/RadioButton.tsx (real)
import { AppIcon } from "@/app/components/icons";

export default function RadioButton({
  selected, onClick, label, className = '',
}: { selected: boolean; onClick: () => void; label: string; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={"w-full flex items-center gap-[8px] px-[24px] py-[20px] text-left cursor-pointer transition-opacity hover:opacity-80 " + className}
      aria-label={label} role="radio" aria-checked={selected}>
      <div className="grid h-[32px] w-[32px] flex-shrink-0 place-items-center">
        <AppIcon name={selected ? "radio-selected" : "radio-unselected"} color="var(--uc-text)" />
      </div>
      <span className="uc-type-n4-strong text-[var(--uc-primary-k1)]">{label}</span>
    </button>
  );
}`,
    `import SwiftUI

struct RadioButton: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                ZStack {
                    Circle().stroke(Color("UcText"), lineWidth: 1).frame(width: 20, height: 20)
                    if isSelected {
                        Circle().fill(Color("UcAction")).frame(width: 10, height: 10)
                    }
                }
                .frame(width: 32, height: 32)
                Text(label).font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color("UcText"))
            }
            .padding(.horizontal, 24).padding(.vertical, 20)
        }
        .accessibilityLabel(label)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.background

@Composable
fun RadioButton(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 24.dp, vertical = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier.size(32.dp),
            contentAlignment = Alignment.Center,
        ) {
            Box(
                Modifier.size(20.dp)
                    .border(1.dp, UcTokens.Text, CircleShape)
            )
            if (selected) Box(
                Modifier.size(10.dp)
                    .background(UcTokens.Action, CircleShape)
            )
        }
        Spacer(Modifier.width(8.dp))
        Text(label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
    }
}`,
  ),

  // ---- AccordionSection (titled collapsible) ----
  "ui.accordion-section": sample(
    `// src/app/components/AccordionSection.tsx (curated)
import { useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";

export default function AccordionSection({
  title, children, defaultOpen = true,
}: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between self-stretch cursor-pointer hover:opacity-80"
        style={{ height: 48, padding: "0 24px" }}>
        <h2 className="uc-type-l1 text-[var(--uc-text)]">{title}</h2>
        <div className="grid place-items-center transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", width: 32, height: 32 }}>
          <AppIcon name="chevron-down-wide" color="var(--uc-icon)" />
        </div>
      </button>
      {isOpen && <div className="pt-[8px]">{children}</div>}
    </div>
  );
}`,
    `import SwiftUI

struct AccordionSection<Content: View>: View {
    let title: String
    var defaultOpen: Bool = true
    @ViewBuilder var content: () -> Content

    @State private var isOpen: Bool = true

    var body: some View {
        VStack(spacing: 0) {
            Button { withAnimation { isOpen.toggle() } } label: {
                HStack {
                    Text(title).font(.system(size: 20, weight: .bold)).foregroundColor(Color("UcText"))
                    Spacer()
                    Image(systemName: "chevron.down")
                        .rotationEffect(.degrees(isOpen ? 180 : 0))
                        .foregroundColor(Color("UcIcon"))
                }
                .frame(height: 48)
                .padding(.horizontal, 24)
            }
            if isOpen {
                content().padding(.top, 8)
            }
        }
        .onAppear { isOpen = defaultOpen }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AccordionSection(
    title: String,
    modifier: Modifier = Modifier,
    defaultOpen: Boolean = true,
    content: @Composable () -> Unit,
) {
    var isOpen by remember { mutableStateOf(defaultOpen) }
    val rotation by animateFloatAsState(if (isOpen) 180f else 0f, label = "chevron")
    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth().height(48.dp).padding(horizontal = 24.dp).clickable { isOpen = !isOpen },
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(title, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text, modifier = Modifier.weight(1f))
            Icon(Icons.Filled.KeyboardArrowDown, null, tint = UcTokens.Icon,
                 modifier = Modifier.size(32.dp).rotate(rotation))
        }
        if (isOpen) {
            Spacer(Modifier.height(8.dp))
            content()
        }
    }
}`,
  ),

  // ---- NavigationCardArt (64x40 card thumbnail) ----
  "ui.navigation-card-art": sample(
    `// src/app/components/cards/NavigationCardArt.tsx (real)
export default function NavigationCardArt() {
  return (
    <span className="relative block h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[4px] bg-[var(--uc-neutral-100)] shadow-[0_1px_1px_rgba(0,0,0,0.25)]" aria-hidden="true">
      <span className="absolute left-[-7px] top-[-2px] h-[48px] w-[28px] skew-x-[-14deg] bg-[var(--uc-red-main)]" />
      <span className="absolute left-[20px] top-[5px] text-[4px] font-bold leading-none text-[var(--uc-text)]">UniCredit</span>
      <span className="absolute bottom-[9px] right-[8px] size-[10px] rounded-full bg-[var(--uc-orange-main)]" />
      <span className="absolute bottom-[9px] right-[14px] size-[10px] rounded-full bg-[var(--uc-red-main)] opacity-90" />
    </span>
  );
}`,
    `import SwiftUI

struct NavigationCardArt: View {
    var body: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color("UcNeutral100"))
                .frame(width: 64, height: 40)
            // Red skewed stripe
            Rectangle()
                .fill(Color("UcRedMain"))
                .frame(width: 28, height: 48)
                .rotationEffect(.degrees(-14), anchor: .topLeading)
                .offset(x: -7, y: -2)
            Text("UniCredit")
                .font(.system(size: 4, weight: .bold))
                .foregroundColor(Color("UcText"))
                .offset(x: 20, y: 5)
            HStack(spacing: -4) {
                Circle().fill(Color("UcRedMain")).opacity(0.9).frame(width: 10, height: 10)
                Circle().fill(Color("UcOrangeMain")).frame(width: 10, height: 10)
            }
            .offset(x: 38, y: 21)
        }
        .shadow(color: .black.opacity(0.25), radius: 1)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NavigationCardArt(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .width(64.dp).height(40.dp)
            .background(UcTokens.Neutral100, RoundedCornerShape(4.dp)),
    ) {
        Box(
            Modifier
                .align(Alignment.TopStart)
                .offset(x = (-7).dp, y = (-2).dp)
                .width(28.dp).height(48.dp)
                .rotate(-14f)
                .background(UcTokens.RedMain),
        )
        Text(
            "UniCredit", fontSize = 4.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
            modifier = Modifier.align(Alignment.TopStart).offset(x = 20.dp, y = 5.dp),
        )
        Box(
            Modifier.align(Alignment.BottomEnd).offset(x = (-8).dp, y = (-9).dp)
                .size(10.dp).background(UcTokens.OrangeMain, CircleShape),
        )
        Box(
            Modifier.align(Alignment.BottomEnd).offset(x = (-14).dp, y = (-9).dp)
                .size(10.dp).background(UcTokens.RedMain.copy(alpha = 0.9f), CircleShape),
        )
    }
}`,
  ),

  // ---- ProfileAvatar (40x40 avatar with 4 modes) ----
  "ui.profile-avatar": sample(
    `// src/app/components/ProfileAvatar.tsx (curated)
// 40x40 avatar with 4 modes: photo, photo+notif dot, initials, AI glyph.
export type ProfileAvatarMode =
  | { kind: "photo"; src: string }
  | { kind: "photo-dot"; src: string }
  | { kind: "initials"; initials: string }
  | { kind: "ai" };

export default function ProfileAvatar({ mode }: { mode: ProfileAvatarMode }) {
  return (
    <div className="relative size-[40px] shrink-0">
      <div className="size-[40px] overflow-hidden rounded-full bg-[var(--uc-action-soft)]">
        {mode.kind === "photo" || mode.kind === "photo-dot" ? (
          <img src={mode.src} alt="" className="size-full object-cover" />
        ) : mode.kind === "initials" ? (
          <div className="grid size-full place-items-center text-[14px] font-bold text-[var(--uc-action)]">
            {mode.initials}
          </div>
        ) : (
          <div className="grid size-full place-items-center text-[14px]">AI</div>
        )}
      </div>
      {mode.kind === "photo-dot" && (
        <span className="absolute right-0 top-0 size-[8px] rounded-full bg-[var(--uc-status-red)] ring-2 ring-[var(--uc-surface)]" />
      )}
    </div>
  );
}`,
    `import SwiftUI

enum ProfileAvatarMode {
    case photo(URL)
    case photoDot(URL)
    case initials(String)
    case ai
}

struct ProfileAvatar: View {
    let mode: ProfileAvatarMode

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Group {
                switch mode {
                case .photo(let url), .photoDot(let url):
                    AsyncImage(url: url) { phase in
                        if let img = phase.image { img.resizable().scaledToFill() }
                        else { Color("UcActionSoft") }
                    }
                case .initials(let s):
                    ZStack {
                        Color("UcActionSoft")
                        Text(s).font(.system(size: 14, weight: .bold)).foregroundColor(Color("UcAction"))
                    }
                case .ai:
                    ZStack {
                        Color("UcActionSoft")
                        Text("AI").font(.system(size: 14))
                    }
                }
            }
            .frame(width: 40, height: 40)
            .clipShape(Circle())

            if case .photoDot = mode {
                Circle().fill(Color("UcStatusRed")).frame(width: 8, height: 8)
                    .padding(0).overlay(Circle().stroke(Color("UcSurface"), lineWidth: 2))
            }
        }
        .frame(width: 40, height: 40)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

sealed class ProfileAvatarMode {
    data class Photo(val url: String) : ProfileAvatarMode()
    data class PhotoDot(val url: String) : ProfileAvatarMode()
    data class Initials(val initials: String) : ProfileAvatarMode()
    object Ai : ProfileAvatarMode()
}

@Composable
fun ProfileAvatar(mode: ProfileAvatarMode, modifier: Modifier = Modifier) {
    Box(modifier = modifier.size(40.dp)) {
        Box(
            Modifier.size(40.dp).clip(CircleShape).background(UcTokens.ActionSoft),
            contentAlignment = Alignment.Center,
        ) {
            when (mode) {
                is ProfileAvatarMode.Photo, is ProfileAvatarMode.PhotoDot -> {
                    val url = when (mode) {
                        is ProfileAvatarMode.Photo -> mode.url
                        is ProfileAvatarMode.PhotoDot -> mode.url
                        else -> ""
                    }
                    // AsyncImage(coil) would replace this placeholder
                    Text("photo", fontSize = 8.sp, color = UcTokens.Text)
                }
                is ProfileAvatarMode.Initials -> {
                    Text(mode.initials, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Action)
                }
                ProfileAvatarMode.Ai -> Text("AI", fontSize = 14.sp)
            }
        }
        if (mode is ProfileAvatarMode.PhotoDot) {
            Box(
                Modifier.align(Alignment.TopEnd).size(8.dp)
                    .background(UcTokens.StatusRed, CircleShape),
            )
        }
    }
}`,
  ),

  // ---- CodeField (4-slot OTP) ----
  "ui.code-field": sample(
    `// src/app/components/CodeField.tsx (curated)
import { useRef } from "react";
import { cn } from "@/app/components/ui/utils";

export default function CodeField({
  length = 4, value, onChange, error = false,
}: { length?: number; value: string; onChange: (v: string) => void; error?: boolean }) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-[16px]">
      {digits.map((digit, index) => (
        <input
          key={index} ref={(el) => { refs.current[index] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          className={cn(
            "grid size-[64px] place-items-center rounded-[8px] border bg-[var(--uc-surface)] text-center",
            "text-[24px] font-bold text-[var(--uc-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]",
            error ? "border-[var(--uc-status-red)]" : "border-[var(--uc-border)]",
          )}
          aria-label={"Digit " + (index + 1)}
        />
      ))}
    </div>
  );
}`,
    `import SwiftUI

struct CodeField: View {
    var length: Int = 4
    @Binding var value: String
    var hasError: Bool = false

    var body: some View {
        HStack(spacing: 16) {
            ForEach(0..<length, id: \\.self) { i in
                let digit = String(value.prefix(i + 1).last ?? Character(""))
                TextField("", text: Binding(
                    get: { i < value.count ? String(value[value.index(value.startIndex, offsetBy: i)]) : "" },
                    set: { newVal in
                        let chars = Array(value)
                        let padded = chars + Array(repeating: Character(" "), count: max(0, length - chars.count))
                        var updated = padded
                        updated[i] = newVal.first ?? Character(" ")
                        value = String(updated.filter { $0 != " " })
                    }
                ))
                .multilineTextAlignment(.center)
                .font(.system(size: 24, weight: .bold))
                .frame(width: 64, height: 64)
                .background(Color("UcSurface"))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(hasError ? Color("UcStatusRed") : Color("UcBorder"))
                )
                .keyboardType(.numberPad)
            }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun CodeField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    length: Int = 4,
    hasError: Boolean = false,
) {
    val borderColor = if (hasError) UcTokens.StatusRed else UcTokens.Border
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterHorizontally),
    ) {
        for (i in 0 until length) {
            val digit = if (i < value.length) value[i].toString() else ""
            BasicTextField(
                value = digit,
                onValueChange = { newDigit ->
                    if (newDigit.length <= 1 && newDigit.all { it.isDigit() }) {
                        val chars = value.padEnd(length, ' ').toMutableList()
                        if (i < chars.size) chars[i] = if (newDigit.isEmpty()) ' ' else newDigit[0]
                        onValueChange(chars.joinToString("").trim())
                    }
                },
                textStyle = TextStyle(
                    fontSize = 24.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text, textAlign = TextAlign.Center,
                ),
                singleLine = true,
                keyboardType = KeyboardType.NumberPassword,
                modifier = Modifier
                    .size(64.dp)
                    .border(1.dp, borderColor, RoundedCornerShape(8.dp))
                    .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true)
                    .padding(top = 16.dp),
            )
        }
    }
}`,
  ),

  // ---- ToastMessage ----
  "ui.toast-message": sample(
    `// src/app/components/ui/ToastMessage.tsx (curated)
import type { HTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export type ToastMessageVariant = "action-required" | "aware" | "google-pay";

const DEFAULT_MESSAGES: Record<ToastMessageVariant, string> = {
  "action-required": "Amount exceeds balance in your account",
  "aware": "You have pending payments",
  "google-pay": "Added to Google Pay",
};

export default function ToastMessage({
  variant = "aware", message, className,
}: { variant?: ToastMessageVariant; message?: string } & HTMLAttributes<HTMLDivElement>) {
  const text = message ?? DEFAULT_MESSAGES[variant];
  const isAction = variant === "action-required";
  return (
    <div className={cn(
      "flex h-[32px] w-fit max-w-[327px] items-center gap-[8px] rounded-[16px] px-[12px] text-[13px] font-bold",
      isAction
        ? "bg-[var(--uc-surface)] text-[var(--uc-text)]"
        : "bg-[var(--uc-static-black)] text-[var(--uc-static-white)]",
      className,
    )} data-toast-variant={variant}>
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
}`,
    `import SwiftUI

enum ToastMessageVariant { case actionRequired, aware, googlePay
    var isLight: Bool { self == .actionRequired }
}

struct ToastMessage: View {
    var variant: ToastMessageVariant = .aware
    var message: String

    var body: some View {
        Text(message)
            .font(.system(size: 13, weight: .bold))
            .foregroundColor(variant.isLight ? Color("UcText") : .white)
            .frame(height: 32)
            .padding(.horizontal, 12)
            .background(variant.isLight ? Color("UcSurface") : Color.black)
            .clipShape(Capsule())
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class ToastMessageVariant(val isLight: Boolean) {
    ACTION_REQUIRED(true), AWARE(false), GOOGLE_PAY(false),
}

@Composable
fun ToastMessage(
    message: String,
    variant: ToastMessageVariant = ToastMessageVariant.AWARE,
    modifier: Modifier = Modifier,
) {
    Text(
        message,
        fontSize = 13.sp, fontWeight = FontWeight.Bold,
        color = if (variant.isLight) UcTokens.Text else Color.White,
        modifier = modifier
            .height(32.dp)
            .padding(horizontal = 12.dp, vertical = 4.dp)
            .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true)
            .background(
                if (variant.isLight) UcTokens.Surface else Color.Black,
                RoundedCornerShape(16.dp),
            ),
    )
}`,
  ),
};
