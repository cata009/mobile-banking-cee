/**
 * Component code-sample registry.
 *
 * For every reusable design-system component, holds:
 *  - `react`:   a hand-curated real snippet from the actual component source
 *               (imports + types + main render body; large data tables / inline
 *               SVG paths are trimmed with an ellipsis comment to keep it readable).
 *  - `swift`:   a production-faithful SwiftUI port of the same component.
 *  - `kotlin`:  a production-faithful Jetpack Compose @Composable port.
 *
 * Swift and Kotlin are reference ports (no native source exists in this repo) and
 * are intended as a starting point for the iOS / Android teams — adapt naming,
 * theming and lifecycle to your native project conventions.
 *
 * Variants (e.g. PageHeader's "Level 1 page" / "Collapsed") override the base
 * sample per-variant when the variant meaningfully changes the code.
 */

export interface ComponentVariantCodeSample {
  react?: string;
  swift?: string;
  kotlin?: string;
}

export interface ComponentCodeSample {
  /** Hand-curated real React/TSX snippet from the component source. */
  react: string;
  /** Production-faithful SwiftUI port. */
  swift: string;
  /** Production-faithful Jetpack Compose port. */
  kotlin: string;
  /** Optional per-variant overrides (keyed by variant id). */
  variants?: Record<string, ComponentVariantCodeSample>;
}

/**
 * Resolve the effective sample for a (componentId, variantId?) pair.
 * Falls back to the component-level sample when no variant-specific override exists.
 */
export function resolveComponentCodeSample(
  samples: ComponentCodeSample | undefined,
  variantId?: string,
): { react: string; swift: string; kotlin: string } | null {
  if (!samples) return null;
  const variant = variantId ? samples.variants?.[variantId] : undefined;
  return {
    react: variant?.react ?? samples.react,
    swift: variant?.swift ?? samples.swift,
    kotlin: variant?.kotlin ?? samples.kotlin,
  };
}

const sample = (
  react: string,
  swift: string,
  kotlin: string,
  variants?: Record<string, ComponentVariantCodeSample>,
): ComponentCodeSample => ({ react, swift, kotlin, variants });

export const COMPONENT_CODE_SAMPLES: Record<string, ComponentCodeSample> = {
  // ============================================================
  // BATCH 1 — Headers / Navigation / Chrome
  // ============================================================

  "shell.page-header": sample(
    // --- React (real, from src/app/components/PageHeader.tsx) ---
    `import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export interface PageHeaderProps {
  title: string;
  onBack: () => void;
  onHelpClick?: () => void;
  onRightActionClick?: () => void;
  variant?: "light" | "dark" | "transparent" | "gray";
  showHelp?: boolean;
  showBack?: boolean;
  compact?: boolean;
  collapsedTitleProgress?: number; // 0 = expanded, 1 = collapsed
  includeSafeArea?: boolean;
  rightActionIcon?: React.ReactNode;
  largeTitleAlign?: "left" | "center";
}

export default function PageHeader({
  title, onBack, onHelpClick, onRightActionClick,
  variant = "light", showHelp = true, showBack = true,
  compact = false, collapsedTitleProgress = 0,
  includeSafeArea = false, rightActionIcon,
  largeTitleAlign = "left",
}: PageHeaderProps) {
  const iconColor = variant === "dark" ? "white" : "var(--uc-text)";
  const titleProgress = Math.min(1, Math.max(0, collapsedTitleProgress));
  const largeTitleOpacity = 1 - titleProgress;

  return (
    <>
      <div className={cn(
        "sticky z-10 w-full top-0",
        variant !== "dark" ? "bg-[var(--uc-surface)]" : "",
        includeSafeArea ? "pt-[var(--uc-phone-top-reserve,54px)]" : ""
      )}>
        <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
          {showBack ? (
            <button onClick={onBack} aria-label="Back"
              className="flex h-[40px] w-[40px] items-center justify-center">
              <AppIcon name="back-heavy" color={iconColor} />
            </button>
          ) : <div className="h-[40px] w-[40px]" />}

          <h1 className="uc-type-n4-strong pointer-events-none truncate text-center text-[var(--uc-text)]"
            style={{ opacity: titleProgress,
                     transform: \`translateY(\${(1 - titleProgress) * 6}px)\` }}>
            {title}
          </h1>

          {rightActionIcon ?? (showHelp ? (
            <button onClick={onHelpClick} aria-label="Help"
              className="flex h-[40px] w-[40px] items-center justify-center">
              <AppIcon name="help-circle" color={iconColor} />
            </button>
          ) : <div className="h-[40px] w-[40px]" />)}
        </div>
      </div>

      <div className="flex items-center bg-[var(--uc-surface)]"
        style={{ width: "375px", padding: "8px 16px", opacity: largeTitleOpacity }}>
        <h1 className={cn("uc-type-h1 text-[var(--uc-text)]",
          largeTitleAlign === "center" ? "text-center" : "")}>
          {title}
        </h1>
      </div>
    </>
  );
}`,
    // --- Swift (SwiftUI port) ---
    `import SwiftUI

struct PageHeader: View {
    let title: String
    let onBack: () -> Void
    var onHelp: (() -> Void)? = nil
    var variant: HeaderVariant = .light
    var showHelp: Bool = true
    var showBack: Bool = true
    var collapsedTitleProgress: Double = 0   // 0 = expanded, 1 = collapsed
    var includeSafeArea: Bool = true

    enum HeaderVariant { case light, dark, transparent, gray }

    private var iconColor: Color {
        variant == .dark ? .white : Color("UcText")
    }

    var body: some View {
        VStack(spacing: 0) {
            // Sticky title bar
            HStack(spacing: 0) {
                if showBack {
                    Button(action: onBack) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(iconColor)
                            .frame(width: 40, height: 40)
                    }
                    .accessibilityLabel("Back")
                } else { Spacer().frame(width: 40) }

                Text(title)
                    .font(.system(size: 14, weight: .bold))
                    .lineLimit(1)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                    .opacity(collapsedTitleProgress)
                    .offset(y: (1 - collapsedTitleProgress) * 6)

                if showHelp, let onHelp {
                    Button(action: onHelp) {
                        Image(systemName: "questionmark.circle")
                            .foregroundColor(iconColor)
                            .frame(width: 40, height: 40)
                    }
                    .accessibilityLabel("Help")
                } else { Spacer().frame(width: 40) }
            }
            .frame(height: 48)
            .padding(.horizontal, 8)
            .padding(.top, includeSafeArea ? 8 : 0)

            // Expanded large title
            Text(title)
                .font(.system(size: 28, weight: .bold))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .opacity(1 - collapsedTitleProgress)
        }
        .background(variant == .dark ? Color.clear : Color("UcSurface"))
    }
}`,
    // --- Kotlin (Jetpack Compose port) ---
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class HeaderVariant { LIGHT, DARK, TRANSPARENT, GRAY }

@Composable
fun PageHeader(
    title: String,
    onBack: () -> Unit,
    onHelp: (() -> Unit)? = null,
    variant: HeaderVariant = HeaderVariant.LIGHT,
    showHelp: Boolean = true,
    showBack: Boolean = true,
    collapsedTitleProgress: Float = 0f, // 0 = expanded, 1 = collapsed
    includeSafeArea: Boolean = true,
) {
    val iconColor = if (variant == HeaderVariant.DARK)
        androidx.compose.ui.graphics.Color.White else UcTokens.Text

    Column {
        // Sticky title bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .padding(horizontal = 8.dp)
                .padding(top = if (includeSafeArea) 8.dp else 0.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (showBack) {
                IconButton(onClick = onBack, modifier = Modifier.size(40.dp)) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack,
                         contentDescription = "Back", tint = iconColor)
                }
            } else { Spacer(Modifier.width(40.dp)) }

            Text(
                title,
                fontSize = 14.sp, fontWeight = FontWeight.Bold,
                maxLines = 1,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
                    .alpha(collapsedTitleProgress),
                color = UcTokens.Text,
            )

            if (showHelp && onHelp != null) {
                IconButton(onClick = onHelp, modifier = Modifier.size(40.dp)) {
                    Icon(Icons.Outlined.HelpOutline,
                         contentDescription = "Help", tint = iconColor)
                }
            } else { Spacer(Modifier.width(40.dp)) }
        }

        // Expanded large title
        Text(
            title,
            fontSize = 28.sp, fontWeight = FontWeight.Bold,
            modifier = Modifier
                .fillMaxWidth()
                .alpha(1f - collapsedTitleProgress)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            color = UcTokens.Text,
        )
    }
}`,
  ),

  "shell.bottom-navigation": sample(
    `import { AppIcon, type IconName } from "@/app/components/icons";

type NavId = "home" | "analytics" | "payments" | "products" | "more";

const NAV_ITEMS: ReadonlyArray<{ id: NavId; label: string; icon: IconName }> = [
  { id: "home",      label: "Home",     icon: "nav-home" },
  { id: "analytics", label: "Analytics",icon: "nav-analytics" },
  { id: "payments",  label: "Payments", icon: "nav-payments" },
  { id: "products",  label: "Products", icon: "nav-products" },
  { id: "more",      label: "More",     icon: "nav-more" },
];

export default function BottomNavigation({
  activeId,
  onChange,
  badge,
}: {
  activeId: NavId;
  onChange: (id: NavId) => void;
  badge?: Partial<Record<NavId, number>>;
}) {
  return (
    <nav className="flex h-[72px] w-full items-stretch border-t border-[var(--uc-border)] bg-[var(--uc-surface)]">
      {NAV_ITEMS.map((item) => {
        const active = item.id === activeId;
        const count = badge?.[item.id] ?? 0;
        return (
          <button key={item.id} type="button" onClick={() => onChange(item.id)}
            aria-pressed={active} aria-label={item.label}
            className="relative flex flex-1 flex-col items-center justify-center gap-[2px]">
            <span className="relative">
              <AppIcon name={item.icon} color={active ? "var(--uc-action)" : "var(--uc-text)"} />
              {count > 0 ? (
                <span className="absolute -right-[8px] -top-[2px] grid size-[16px] place-items-center rounded-full bg-[var(--uc-action)] text-[10px] font-bold leading-none text-[var(--uc-static-white)]">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </span>
            <span className={active ? "text-[10px] font-bold text-[var(--uc-action)]" : "text-[10px] font-bold text-[var(--uc-text)]"}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}`,
    `import SwiftUI

struct BottomNavigation: View {
    let activeId: NavId
    let onChange: (NavId) -> Void
    var badges: [NavId: Int] = [:]

    enum NavId: String, CaseIterable { case home, analytics, payments, products, more

        var label: String { rawValue.capitalized }
        var systemImage: String {
            switch self {
            case .home: return "house.fill"
            case .analytics: return "chart.bar.xaxis"
            case .payments: return "arrow.up.arrow.down"
            case .products: return "square.grid.2x2.fill"
            case .more: return "ellipsis"
            }
        }
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(NavId.allCases, id: \\.self) { item in
                let active = item == activeId
                Button { onChange(item) } label: {
                    VStack(spacing: 2) {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: item.systemImage)
                                .foregroundColor(active ? Color("UcAction") : Color("UcText"))
                            if let n = badges[item], n > 0 {
                                Text(n > 99 ? "99+" : "\\\\(n)")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(3)
                                    .background(Color("UcAction"))
                                    .clipShape(Circle())
                                    .offset(x: 10, y: -4)
                            }
                        }
                        Text(item.label)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(active ? Color("UcAction") : Color("UcText"))
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .frame(height: 72)
        .background(Color("UcSurface"))
        .overlay(Rectangle().frame(height: 1).foregroundColor(Color("UcBorder")), alignment: .top)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class BottomNavId(val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    HOME("Home", Icons.Filled.Home),
    ANALYTICS("Analytics", Icons.Filled.BarChart),
    PAYMENTS("Payments", Icons.AutoMirrored.Filled.Send),
    PRODUCTS("Products", Icons.Filled.Grid),
    MORE("More", Icons.Filled.MoreHoriz),
}

@Composable
fun BottomNavigation(
    activeId: BottomNavId,
    onChange: (BottomNavId) -> Unit,
    badges: Map<BottomNavId, Int> = emptyMap(),
) {
    Row(
        modifier = Modifier.fillMaxWidth().height(72.dp)
            .background(UcTokens.Surface),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        BottomNavId.values().forEach { item ->
            val active = item == activeId
            val color = if (active) UcTokens.Action else UcTokens.Text
            val count = badges[item] ?: 0
            Box(
                modifier = Modifier.weight(1f).fillMaxHeight().clickable { onChange(item) },
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    BadgedBox(badge = {
                        if (count > 0) Badge {
                            Text(if (count > 99) "99+" else count.toString())
                        }
                    }) {
                        Icon(item.icon, contentDescription = item.label, tint = color)
                    }
                    Spacer(Modifier.height(2.dp))
                    Text(item.label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = color)
                }
            }
        }
    }
}`,
  ),

  "shell.mobile-frame": sample(
    `// src/app/components/MobileFrame.tsx (curated)
import StatusBar from "@/app/components/StatusBar";
import DynamicIsland from "@/app/components/DynamicIsland";

export const SAFE_AREA_TOP = 70;
export const SAFE_AREA_BOTTOM = 34;
const SCREEN_WIDTH = 375;
const SCREEN_HEIGHT = 812;
const PHONE_BEZEL = 12;

export default function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-0 w-full justify-center overflow-hidden bg-gradient-to-br from-[var(--uc-app-bg)] via-[var(--uc-surface-muted)] to-[var(--uc-action-soft)] px-6 py-4">
      <div className="relative flex h-full max-h-[812px] items-center">
        {/* Bezel */}
        <div className="relative rounded-[36px] overflow-hidden bg-[var(--uc-static-black)]"
             style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <DynamicIsland />
          {/* Screen content with scroll + safe areas */}
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hide"
               style={{ paddingTop: SAFE_AREA_TOP, paddingBottom: SAFE_AREA_BOTTOM }}>
            {children}
          </div>
          <StatusBar />
        </div>
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct MobileFrame<Content: View>: View {
    @ViewBuilder var content: () -> Content

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color("UcAppBg"), Color("UcSurfaceMuted"), Color("UcActionSoft")],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            RoundedRectangle(cornerRadius: 36)
                .fill(Color.black)
                .frame(width: 375, height: 812)
                .overlay(
                    ScrollView {
                        content()
                            .padding(.top, 70)
                            .padding(.bottom, 34)
                    }
                )
                .overlay(alignment: .top) { DynamicIsland() }
                .overlay(alignment: .top) { StatusBar() }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun MobileFrame(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(UcTokens.AppBgGradient)
            .wrapContentSize(androidx.compose.ui.Alignment.Center),
    ) {
        Box(
            modifier = Modifier
                .width(375.dp).height(812.dp)
                .clip(RoundedCornerShape(36.dp))
                .background(Color.Black),
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(top = 70.dp, bottom = 34.dp),
            ) { content() }
            DynamicIsland(Modifier.align(androidx.compose.ui.Alignment.TopCenter))
            StatusBar(Modifier.align(androidx.compose.ui.Alignment.TopCenter))
        }
    }
}`,
  ),

  "ui.primary-button": sample(
    `// src/app/components/PrimaryButton.tsx (real)
interface PrimaryButtonProps {
  children: React.ReactNode;
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
        \${disabled ? 'opacity-30 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-[var(--uc-action-hover)] active:scale-[0.98]'}
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

import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
    Button(
        onClick = onClick,
        enabled = !disabled,
        modifier = modifier
            .width(327.dp).height(48.dp)
            .scale(if (pressed) 0.98f else 1f)
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

  // ---- StatusBar ----
  "shell.status-bar": sample(
    `// src/app/components/StatusBar.tsx (curated; inline SVG paths elided)
import { useState, useEffect } from 'react';
import svgPaths from '@/imports/svg-2hn0mpby87';

export type PhoneChromeVariant = 'light' | 'dark' | 'theme';

function getStatusBarForeground(variant: PhoneChromeVariant) {
  if (variant === 'theme') return 'var(--uc-phone-status-fg, var(--uc-text))';
  return variant === 'light' ? 'var(--uc-text)' : 'var(--uc-static-white)';
}

function Time({ variant }: { variant: PhoneChromeVariant }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return \`\${h}:\${m}\`;
  };
  return (
    <div className="flex h-[22px] flex-1 items-center justify-center">
      <p className="font-[590] text-[17px] leading-[22px]"
         style={{ color: getStatusBarForeground(variant), fontFamily: 'SF Pro Semibold, sans-serif' }}>
        {formatTime(currentTime)}
      </p>
    </div>
  );
}

function Levels({ variant }: { variant: PhoneChromeVariant }) {
  const fillColor = getStatusBarForeground(variant);
  return (
    <div className="flex h-[22px] flex-1 items-center justify-center gap-[7px]">
      {/* Cellular, wifi, battery — inline SVGs use \${fillColor} */}
      <svg width="19.2" height="12.226" viewBox="0 0 19.2 12.2264" fill="none">
        <path clipRule="evenodd" d={svgPaths.p1e09e400} fill={fillColor} fillRule="evenodd" />
      </svg>
      <svg width="17.142" height="12.328" viewBox="0 0 17.1417 12.3283" fill="none">
        <path clipRule="evenodd" d={svgPaths.p18b35300} fill={fillColor} fillRule="evenodd" />
      </svg>
      <svg width="27.328" height="13" viewBox="0 0 27.328 13" fill="none">
        <rect x="0.5" y="0.5" width="24" height="12" rx="3.8"
              opacity="0.35" stroke={fillColor} fill="none" />
        <rect x="2" y="2" width="21" height="9" rx="2.5" fill={fillColor} />
      </svg>
    </div>
  );
}

export default function StatusBar({ variant = 'dark' }: { variant?: PhoneChromeVariant }) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-50">
      <div className="flex w-full items-center justify-center gap-[154px] px-[24px] pb-[16px] pt-[14px]">
        <Time variant={variant} />
        <Levels variant={variant} />
      </div>
    </div>
  );
}`,
    `import SwiftUI

enum PhoneChromeVariant { case light, dark, theme }

struct StatusBar: View {
    var variant: PhoneChromeVariant = .dark

    private var fg: Color {
        switch variant {
        case .light: return Color("UcText")
        case .dark:  return .white
        case .theme: return Color("UcText")
        }
    }

    var body: some View {
        HStack(spacing: 154) {
            TimelineView(.periodic(from: .now, by: 1)) { context in
                Text(context.date, format: .dateTime.hour().minute())
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(fg)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
            HStack(spacing: 7) {
                Image(systemName: "cellularbars")
                Image(systemName: "wifi")
                Image(systemName: "battery.100")
            }
            .foregroundColor(fg)
            .font(.system(size: 13))
            .frame(maxWidth: .infinity, alignment: .center)
        }
        .padding(.horizontal, 24)
        .padding(.top, 14)
        .padding(.bottom, 16)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class PhoneChromeVariant { LIGHT, DARK, THEME

    val fg: Color get() = when (this) {
        PhoneChromeVariant.LIGHT -> UcTokens.Text
        PhoneChromeVariant.DARK -> Color.White
        PhoneChromeVariant.THEME -> UcTokens.Text
    }
}

@Composable
fun StatusBar(
    variant: PhoneChromeVariant = PhoneChromeVariant.DARK,
    modifier: Modifier = Modifier,
) {
    var now by remember { mutableStateOf(Date()) }
    LaunchedEffect(Unit) {
        while (true) { delay(1000); now = Date() }
    }
    val time = remember(now) {
        SimpleDateFormat("HH:mm", Locale.getDefault()).format(now)
    }
    androidx.compose.foundation.layout.Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(time, fontSize = 17.sp,
             fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
             color = variant.fg, modifier = Modifier.weight(1f))
        Row(modifier = Modifier.weight(1f), horizontalArrangement = Arrangement.Center) {
            Icon(Icons.Filled.Wifi, null, tint = variant.fg, modifier = Modifier.size(14.dp))
            Spacer(Modifier.width(7.dp))
            Icon(Icons.Filled.BatteryFull, null, tint = variant.fg, modifier = Modifier.size(14.dp))
        }
    }
}`,
  ),

  // ---- DynamicIsland ----
  "shell.dynamic-island": sample(
    `// src/app/components/DynamicIsland.tsx (real)
interface DynamicIslandProps {
  variant?: "light" | "dark" | "theme";
}

export default function DynamicIsland({ variant = "dark" }: DynamicIslandProps) {
  const shellColor = variant === "theme"
    ? "var(--uc-phone-dynamic-island-bg, #262626)"
    : variant === "light" ? "#262626" : "#1F1F1F";
  const sensorColor = variant === "theme"
    ? "var(--uc-phone-dynamic-island-sensor-bg, #0E0E0E)"
    : variant === "light" ? "#131313" : "#0E0E0E";

  return (
    <div className="pointer-events-none absolute left-1/2 top-[11px] z-[45] -translate-x-1/2">
      <div className="relative h-[28px] w-[106px] rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
           style={{ backgroundColor: shellColor }}>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[12px]">
          <div className="h-[5.5px] w-[5.5px] rounded-full" style={{ backgroundColor: sensorColor }} />
          <div className="h-[5.5px] w-[5.5px] rounded-full" style={{ backgroundColor: sensorColor }} />
        </div>
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct DynamicIsland: View {
    var variant: PhoneChromeVariant = .dark

    private var shell: Color {
        variant == .light ? Color(red: 0.149, green: 0.149, blue: 0.149) : Color(red: 0.122, green: 0.122, blue: 0.122)
    }
    private var sensor: Color {
        variant == .light ? Color(red: 0.075, green: 0.075, blue: 0.075) : Color(red: 0.055, green: 0.055, blue: 0.055)
    }

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 14)
                .fill(shell)
                .frame(width: 106, height: 28)
            HStack(spacing: 12) {
                Circle().fill(sensor).frame(width: 5.5, height: 5.5)
                Circle().fill(sensor).frame(width: 5.5, height: 5.5)
            }
        }
        .allowsHitTesting(false)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun DynamicIsland(
    variant: PhoneChromeVariant = PhoneChromeVariant.DARK,
    modifier: Modifier = Modifier,
) {
    val shell = if (variant == PhoneChromeVariant.LIGHT) Color(0xFF262626) else Color(0xFF1F1F1F)
    val sensor = if (variant == PhoneChromeVariant.LIGHT) Color(0xFF131313) else Color(0xFF0E0E0E)
    Box(
        modifier = modifier
            .width(106.dp).height(28.dp)
            .background(shell, RoundedCornerShape(14.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(Modifier.size(5.5.dp).background(sensor, RoundedCornerShape(50)))
            Box(Modifier.size(5.5.dp).background(sensor, RoundedCornerShape(50)))
        }
    }
}`,
  ),

  // ---- HeaderActionIcons (HeaderActionButton + Rail) ----
  "shell.header-action-icons": sample(
    `// src/app/components/HeaderActionIcons.tsx (real)
import type { ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";

type HeaderActionIconName = "profile" | "messages" | "help" | "logout" | "contact-phone";

export function HeaderActionIcon({ icon }: { icon: HeaderActionIconName }) {
  // Each branch renders the matching AppIcon glyph.
  if (icon === "profile") return <AppIcon name="header-profile" color="var(--uc-icon)" />;
  if (icon === "messages") return <AppIcon name="header-messages" color="var(--uc-icon)" />;
  if (icon === "logout") return <AppIcon name="logout" color="var(--uc-icon)" />;
  if (icon === "contact-phone") return <AppIcon name="contact-phone" color="var(--uc-icon)" />;
  return <AppIcon name="help-circle" color="var(--uc-icon)" />;
}

export function HeaderActionRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={\`flex h-[32px] shrink-0 items-center gap-[8px] \${className}\`}>{children}</div>;
}

export function HeaderActionButton({
  icon, label, onClick, className = "size-[32px]", badgeCount = 0,
}: {
  icon: HeaderActionIconName; label: string; onClick?: () => void;
  className?: string; badgeCount?: number;
}) {
  return (
    <button type="button" onClick={onClick}
      className={\`relative flex items-center justify-center cursor-pointer hover:opacity-70 \${className}\`}
      aria-label={label}>
      <HeaderActionIcon icon={icon} />
      {badgeCount > 0 && (
        <span className="uc-type-n5-strong absolute right-0 top-0 grid size-[20px] place-items-center rounded-full bg-[var(--uc-brand)] leading-none tracking-[0.35px] text-[var(--uc-text-inverse)]">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </button>
  );
}`,
    `import SwiftUI

enum HeaderAction: String { case profile, messages, help, logout, contactPhone
    var system: String {
        switch self {
        case .profile: return "person.crop.circle"
        case .messages: return "envelope"
        case .help: return "questionmark.circle"
        case .logout: return "rectangle.portrait.and.arrow.right"
        case .contactPhone: return "phone"
        }
    }
}

struct HeaderActionButton: View {
    let icon: HeaderAction
    let label: String
    var badgeCount: Int = 0
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: icon.system)
                    .font(.system(size: 18))
                    .frame(width: 32, height: 32)
                if badgeCount > 0 {
                    Text(badgeCount > 99 ? "99+" : "\\\\(badgeCount)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 4)
                        .frame(minWidth: 20, minHeight: 20)
                        .background(Color("UcBrand"))
                        .clipShape(Circle())
                }
            }
        }
        .accessibilityLabel(label)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class HeaderAction(val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    PROFILE(Icons.Filled.AccountCircle),
    MESSAGES(Icons.Filled.Email),
    HELP(Icons.Outlined.HelpOutline),
    LOGOUT(Icons.AutoMirrored.Filled.Logout),
    CONTACT_PHONE(Icons.Filled.Phone),
}

@Composable
fun HeaderActionButton(
    icon: HeaderAction,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    badgeCount: Int = 0,
) {
    Box(
        modifier = modifier.size(32.dp).clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon.icon, contentDescription = label, tint = UcTokens.Icon, modifier = Modifier.size(20.dp))
        if (badgeCount > 0) {
            Text(
                if (badgeCount > 99) "99+" else badgeCount.toString(),
                fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .background(UcTokens.Brand, androidx.compose.foundation.shape.CircleShape)
                    .padding(horizontal = 4.dp)
                    .requiredSize(20.dp)
                    .wrapContentSize(Alignment.Center),
            )
        }
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

  // ============================================================
  // BATCH 4 — Cards & Banners
  // ============================================================

  // ---- InfoBanner (solid-border informational) ----
  "cards.info-banner": sample(
    `// src/app/components/cards/InfoBanner.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export interface InfoBannerProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  iconName?: IconName;
  className?: string;
}

export default function InfoBanner({
  title, description, actionLabel, onActionClick,
  iconName = "info-circle", className,
}: InfoBannerProps) {
  return (
    <div className={cn("flex w-[327px] max-w-full items-start gap-[8px] rounded-[8px]",
                       "border border-solid border-[var(--uc-text)] bg-transparent p-[16px]", className)}
         data-component="InfoBanner">
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
        <AppIcon name={iconName} color="var(--uc-text)" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex flex-col gap-[4px]">
          <span className="uc-type-h2 line-clamp-2 leading-[20px] text-[var(--uc-text)]">{title}</span>
          {description && (
            <span className="uc-type-n4 line-clamp-4 whitespace-pre-line leading-[18px] text-[var(--uc-text)]">
              {description}
            </span>
          )}
        </div>
        {actionLabel && (
          <button type="button" onClick={onActionClick}
            className="uc-type-n5-strong self-start leading-[15px] text-[var(--uc-action)]">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct InfoBanner: View {
    let title: String
    var description: String? = nil
    var actionLabel: String? = nil
    var onAction: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "info.circle.fill")
                .font(.system(size: 20))
                .foregroundColor(Color("UcText"))
                .frame(width: 32, height: 32)
            VStack(alignment: .leading, spacing: 8) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.system(size: 18, weight: .bold)).lineLimit(2)
                    if let d = description {
                        Text(d).font(.system(size: 14)).lineLimit(4)
                    }
                }
                if let label = actionLabel, let onAction {
                    Button(action: onAction) {
                        Text(label).font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color("UcAction"))
                    }
                }
            }
            Spacer(minLength: 0)
        }
        .padding(16)
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color("UcText")))
        .frame(maxWidth: 327)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun InfoBanner(
    title: String,
    description: String? = null,
    actionLabel: String? = null,
    onActionClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.width(327.dp).padding(16.dp)
            .border(1.dp, UcTokens.Text, RoundedCornerShape(8.dp)),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Icon(Icons.Filled.Info, null, tint = UcTokens.Text, modifier = Modifier.size(32.dp))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
                     maxLines = 2, overflow = TextOverflow.Ellipsis)
                description?.let {
                    Text(it, fontSize = 14.sp, color = UcTokens.Text,
                         maxLines = 4, overflow = TextOverflow.Ellipsis)
                }
            }
            if (actionLabel != null && onActionClick != null) {
                Text(actionLabel, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.Action,
                     modifier = Modifier.clickable { onActionClick() })
            }
        }
    }
}`,
  ),

  // ---- GhostBanner (dashed-border CTA) ----
  "cards.ghost-banner": sample(
    `// src/app/components/cards/GhostBanner.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export interface GhostBannerProps {
  title: string;
  description?: string;
  iconName?: IconName;
  onClick?: () => void;
  className?: string;
}

export default function GhostBanner({
  title, description, iconName = "add-circle", onClick, className,
}: GhostBannerProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex w-[327px] max-w-full items-start gap-[8px] rounded-[8px]",
        "border border-dashed border-[var(--uc-text)] bg-transparent p-[16px] text-left",
        onClick && "cursor-pointer transition-opacity hover:opacity-80",
        className,
      )}>
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
        <AppIcon name={iconName} color="var(--uc-action)" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <span className="uc-type-h2 line-clamp-2 leading-[20px] text-[var(--uc-text)]">{title}</span>
        {description && (
          <span className="uc-type-n4 line-clamp-4 whitespace-pre-line leading-[18px] text-[var(--uc-text)]">
            {description}
          </span>
        )}
      </div>
    </Tag>
  );
}`,
    `import SwiftUI

struct GhostBanner: View {
    let title: String
    var description: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        Button {
            action?()
        } label: {
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(Color("UcAction"))
                    .frame(width: 32, height: 32)
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.system(size: 18, weight: .bold)).lineLimit(2)
                    if let d = description {
                        Text(d).font(.system(size: 14)).lineLimit(4)
                    }
                }
                Spacer(minLength: 0)
            }
            .padding(16)
            .overlay(
                RoundedRectangle(cornerRadius: 8).stroke(style: StrokeStyle(lineWidth: 1, dash: [4]))
                    .foregroundColor(Color("UcText"))
            )
            .frame(maxWidth: 327)
        }
        .buttonStyle(.plain)
        .disabled(action == nil)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun GhostBanner(
    title: String,
    description: String? = null,
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.width(327.dp).padding(0.dp),
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(1.dp, UcTokens.Text.copy(alpha = 0.5f)),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Icon(Icons.Filled.AddCircle, null, tint = UcTokens.Action, modifier = Modifier.size(32.dp))
            Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.weight(1f)) {
                Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
                     maxLines = 2, overflow = TextOverflow.Ellipsis)
                description?.let {
                    Text(it, fontSize = 14.sp, color = UcTokens.Text,
                         maxLines = 4, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}`,
  ),

  // ---- HelperCard (solid teal helper) ----
  "cards.helper-card": sample(
    `// src/app/components/cards/HelperCard.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";

export interface HelperCardProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  dismissible?: boolean;
  onClose?: () => void;
  iconName?: IconName;
}

export default function HelperCard({
  title, description, actionLabel, onActionClick,
  dismissible = false, onClose, iconName = "info-circle",
}: HelperCardProps) {
  return (
    <div className="relative flex w-[343px] max-w-full items-center gap-[8px] rounded-[4px] bg-[var(--uc-action)] p-[16px]">
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
        <AppIcon name={iconName} color="var(--uc-static-white)" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[8px] pr-[24px]">
        <div className="flex flex-col gap-[4px]">
          <span className="uc-type-h2 line-clamp-2 leading-[20px] text-[var(--uc-static-white)]">{title}</span>
          {description && (
            <span className="uc-type-p1 line-clamp-4 whitespace-pre-line leading-[20px] text-[var(--uc-static-white)]">
              {description}
            </span>
          )}
        </div>
        {actionLabel && (
          <button type="button" onClick={onActionClick}
            className="uc-type-n5-strong self-start leading-[15px] text-[var(--uc-static-white)]">
            {actionLabel}
          </button>
        )}
      </div>
      {dismissible && (
        <button type="button" onClick={onClose} aria-label="Close"
          className="absolute right-[8px] top-[8px] flex size-[24px] items-center justify-center text-[var(--uc-static-white)]">
          <AppIcon name="close-x" color="var(--uc-static-white)" size={12} />
        </button>
      )}
    </div>
  );
}`,
    `import SwiftUI

struct HelperCard: View {
    let title: String
    var description: String? = nil
    var actionLabel: String? = nil
    var onAction: (() -> Void)? = nil
    var dismissible: Bool = false
    var onClose: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "info.circle.fill")
                .foregroundColor(.white)
                .frame(width: 32, height: 32)
            VStack(alignment: .leading, spacing: 8) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white).lineLimit(2)
                    if let d = description {
                        Text(d).font(.system(size: 16)).foregroundColor(.white).lineLimit(4)
                    }
                }
                if let label = actionLabel {
                    Button { onAction?() } label: {
                        Text(label).font(.system(size: 11, weight: .bold)).foregroundColor(.white)
                    }
                }
            }
            Spacer(minLength: 0)
        }
        .padding(16)
        .background(Color("UcAction"))
        .cornerRadius(4)
        .overlay(alignment: .topTrailing) {
            if dismissible {
                Button(action: { onClose?() }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(4)
                }
            }
        }
        .frame(maxWidth: 343)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HelperCard(
    title: String,
    description: String? = null,
    actionLabel: String? = null,
    onActionClick: (() -> Unit)? = null,
    dismissible: Boolean = false,
    onClose: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .width(343.dp)
            .background(UcTokens.Action, RoundedCornerShape(4.dp))
            .padding(16.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Filled.Info, null, tint = UcTokens.StaticWhite, modifier = Modifier.size(32.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f).padding(end = 24.dp)) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = UcTokens.StaticWhite,
                         maxLines = 2, overflow = TextOverflow.Ellipsis)
                    description?.let {
                        Text(it, fontSize = 16.sp, color = UcTokens.StaticWhite,
                             maxLines = 4, overflow = TextOverflow.Ellipsis)
                    }
                }
                if (actionLabel != null && onActionClick != null) {
                    Text(actionLabel, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.StaticWhite,
                         modifier = Modifier.clickable { onActionClick() })
                }
            }
        }
        if (dismissible && onClose != null) {
            Icon(
                Icons.Filled.Close, contentDescription = "Close",
                tint = UcTokens.StaticWhite,
                modifier = Modifier.align(Alignment.TopEnd).size(16.dp).clickable { onClose() },
            )
        }
    }
}`,
  ),

  // ---- PendingActionCard (teal-gradient CTA) ----
  "cards.pending-action-card": sample(
    `// src/app/components/cards/PendingActionCard.tsx (curated)
const PENDING_ACTION_GRADIENT = "linear-gradient(90deg, #007A91 0%, #44909E 100%)";

export interface PendingActionCardProps {
  title: string;
  description?: string;
  tagLabel?: string;
  onClick?: () => void;
  className?: string;
}

export default function PendingActionCard({
  title, description, tagLabel, onClick, className,
}: PendingActionCardProps) {
  return (
    <button type="button" onClick={onClick}
      className="flex h-[157px] w-[327px] max-w-full flex-col gap-[8px] overflow-hidden rounded-[8px] p-[24px] text-left cursor-pointer"
      style={{ background: PENDING_ACTION_GRADIENT }}
      data-component="PendingActionCard">
      <span className="uc-type-l1 line-clamp-2 leading-[26px] text-[var(--uc-static-white)]">{title}</span>
      {description && (
        <span className="uc-type-p1 line-clamp-4 flex-1 whitespace-pre-line leading-[22px] text-[var(--uc-static-white)]">
          {description}
        </span>
      )}
      {tagLabel && (
        <span className="mt-auto inline-flex w-fit items-center gap-[4px] rounded-[4px] bg-[var(--uc-static-white)] px-[8px] py-[4px]">
          <span className="text-[12px] font-bold uppercase leading-[16px] text-[var(--uc-action)]">{tagLabel}</span>
        </span>
      )}
    </button>
  );
}`,
    `import SwiftUI

struct PendingActionCard: View {
    let title: String
    var description: String? = nil
    var tagLabel: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                Text(title).font(.system(size: 24, weight: .bold))
                    .foregroundColor(.white).lineLimit(2)
                if let d = description {
                    Text(d).font(.system(size: 16))
                        .foregroundColor(.white).lineLimit(4)
                }
                if let tag = tagLabel {
                    HStack {
                        Text(tag.uppercased())
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color("UcAction"))
                    }
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(Color.white)
                    .cornerRadius(4)
                }
            }
            .frame(maxWidth: 327, alignment: .leading)
            .padding(24)
            .background(LinearGradient(
                colors: [Color(red: 0, green: 0.478, blue: 0.569), Color(red: 0.267, green: 0.565, blue: 0.620)],
                startPoint: .leading, endPoint: .trailing))
            .cornerRadius(8)
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PendingActionCard(
    title: String,
    description: String? = null,
    tagLabel: String? = null,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val gradient = Brush.horizontalGradient(listOf(Color(0xFF007A91), Color(0xFF44909E)))
    Button(
        onClick = onClick,
        modifier = modifier.width(327.dp).height(157.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        shape = RoundedCornerShape(8.dp),
        contentPadding = PaddingValues(24.dp),
    ) {
        Column(
            horizontalAlignment = Alignment.Start,
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxSize().background(gradient, RoundedCornerShape(8.dp)),
        ) {
            Text(title, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White,
                 maxLines = 2, overflow = TextOverflow.Ellipsis)
            description?.let {
                Text(it, fontSize = 16.sp, color = Color.White,
                     maxLines = 4, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
            }
            tagLabel?.let { tag ->
                Text(
                    tag.uppercase(),
                    fontSize = 12.sp, fontWeight = FontWeight.Bold, color = UcTokens.Action,
                    modifier = Modifier
                        .background(Color.White, RoundedCornerShape(4.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                )
            }
        }
    }
}`,
  ),

  // ---- UserEventCard (avatar event card) ----
  "cards.user-event-card": sample(
    `// src/app/components/cards/UserEventCard.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";

export interface UserEventCardProps {
  title: string;
  description?: string;
  iconName?: IconName;
  actionLabel?: string;
  onActionClick?: () => void;
  showOptions?: boolean;
  onOptionsClick?: () => void;
}

export default function UserEventCard({
  title, description, iconName = "user-event-refresh", actionLabel, onActionClick,
  showOptions = false, onOptionsClick,
}: UserEventCardProps) {
  return (
    <div className="flex w-[343px] max-w-full gap-[8px] rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] items-start"
         data-component="UserEventCard">
      <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[var(--uc-action)]">
        <AppIcon name={iconName} color="var(--uc-static-white)" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex flex-col">
          <span className="uc-type-n5-strong leading-[15px] line-clamp-2 text-[var(--uc-text)]">{title}</span>
          {description && (
            <span className="uc-type-n5 whitespace-pre-line leading-[15px] line-clamp-4 text-[var(--uc-text)]">{description}</span>
          )}
        </div>
        {actionLabel && (
          <button type="button" onClick={onActionClick}
            className="uc-type-n5-strong self-start leading-[15px] text-[var(--uc-action)]">{actionLabel}</button>
        )}
      </div>
      {showOptions && (
        <button type="button" aria-label="More options" onClick={onOptionsClick}
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center">
          <AppIcon name="more-horizontal" color="var(--uc-action)" />
        </button>
      )}
    </div>
  );
}`,
    `import SwiftUI

struct UserEventCard: View {
    let title: String
    var description: String? = nil
    var actionLabel: String? = nil
    var onAction: (() -> Void)? = nil
    var showOptions: Bool = false
    var onOptions: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            ZStack {
                Circle().fill(Color("UcAction")).frame(width: 48, height: 48)
                Image(systemName: "arrow.2.circlepath")
                    .foregroundColor(.white).font(.system(size: 20))
            }
            VStack(alignment: .leading, spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    Text(title).font(.system(size: 11, weight: .bold)).lineLimit(2)
                    if let d = description {
                        Text(d).font(.system(size: 11)).lineLimit(4)
                    }
                }
                if let label = actionLabel {
                    Button(action: { onAction?() }) {
                        Text(label).font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color("UcAction"))
                    }
                }
            }
            Spacer(minLength: 0)
            if showOptions {
                Button(action: { onOptions?() }) {
                    Image(systemName: "ellipsis")
                        .foregroundColor(Color("UcAction"))
                        .frame(width: 32, height: 32)
                }
            }
        }
        .padding(16)
        .background(Color("UcSurface"))
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
        .frame(maxWidth: 343)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun UserEventCard(
    title: String,
    description: String? = null,
    actionLabel: String? = null,
    onActionClick: (() -> Unit)? = null,
    showOptions: Boolean = false,
    onOptionsClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .width(343.dp).padding(16.dp)
            .shadow(4.dp, RoundedCornerShape(8.dp))
            .background(UcTokens.Surface, RoundedCornerShape(8.dp))
            .padding(0.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(
            modifier = Modifier.size(48.dp).background(UcTokens.Action, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Filled.Refresh, null, tint = Color.White, modifier = Modifier.size(20.dp))
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Column {
                Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
                     maxLines = 2, overflow = TextOverflow.Ellipsis)
                description?.let {
                    Text(it, fontSize = 11.sp, color = UcTokens.Text,
                         maxLines = 4, overflow = TextOverflow.Ellipsis)
                }
            }
            if (actionLabel != null && onActionClick != null) {
                Text(actionLabel, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.Action,
                     modifier = Modifier.clickable { onActionClick() })
            }
        }
        if (showOptions && onOptionsClick != null) {
            Icon(Icons.Filled.MoreHoriz, contentDescription = "More options",
                 tint = UcTokens.Action, modifier = Modifier.size(32.dp).clickable { onOptionsClick() })
        }
    }
}`,
  ),

  // ---- AccountActionBar (1-4 action items bar) ----
  "accounts.action-bar": sample(
    `// src/app/components/accounts/AccountActionBar.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";

export interface AccountActionBarItem {
  id: string;
  iconName: IconName;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  iconColor?: string;
  hidden?: boolean;
}

export default function AccountActionBar({
  items, align = "between",
}: { items?: readonly AccountActionBarItem[]; align?: "start" | "center" | "end" | "between" }) {
  const actionItems = (items ?? []).slice(0, 4);
  const stretch = align === "between";
  return (
    <div className={"flex items-start px-[16px] py-[8px] justify-" + align + (stretch ? "" : " gap-[8px]")}>
      {actionItems.map((item) => (
        <button key={item.id} type="button" disabled={item.hidden}
          aria-label={item.ariaLabel ?? item.label}
          className={"flex flex-col items-center gap-[4px] " + (stretch ? "min-w-0 flex-1" : "w-[82px] shrink-0")
                     + (item.hidden ? " pointer-events-none invisible" : "")}>
          <span className="flex h-[32px] w-[32px] items-center justify-center">
            <AppIcon name={item.iconName} color={item.iconColor ?? "var(--uc-text)"} />
          </span>
          <span className="uc-type-p2 whitespace-pre-line text-center leading-[15px] text-[var(--uc-text)]">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}`,
    `import SwiftUI

struct AccountActionBar: View {
    let items: [ActionItem]
    var alignment: HorizontalAlignment = .center

    struct ActionItem: Identifiable {
        let id: String
        let systemImage: String
        let label: String
        var action: () -> Void = {}
        var isHidden: Bool = false
    }

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            ForEach(items.prefix(4)) { item in
                if !item.isHidden {
                    Button(action: item.action) {
                        VStack(spacing: 4) {
                            Image(systemName: item.systemImage)
                                .font(.system(size: 18))
                                .frame(width: 32, height: 32)
                            Text(item.label)
                                .font(.system(size: 11))
                                .multilineTextAlignment(.center)
                        }
                    }
                    .frame(maxWidth: alignment == .center ? nil : .infinity)
                }
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 8)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class AccountActionBarItem(
    val id: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val label: String,
    val onClick: () -> Unit = {},
    val isHidden: Boolean = false,
)

@Composable
fun AccountActionBar(
    items: List<AccountActionBarItem>,
    modifier: Modifier = Modifier,
    alignment: Arrangement.Horizontal = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
) {
    Row(
        modifier = modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = alignment,
    ) {
        items.take(4).filter { !it.isHidden }.forEach { item ->
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Icon(item.icon, item.label, tint = UcTokens.Text, modifier = Modifier.size(32.dp))
                Text(item.label, fontSize = 11.sp, color = UcTokens.Text, textAlign = TextAlign.Center)
            }
        }
    }
}`,
  ),

  // ---- AccountDetailsInfoField ----
  "accounts.details-info-field": sample(
    `// src/app/components/accounts/AccountDetailsInfoField.tsx (real)
import type { ReactNode } from "react";

interface AccountDetailsInfoFieldProps {
  title: string;
  subtitle: string;
  trailingIcon?: ReactNode;
}

export default function AccountDetailsInfoField({ title, subtitle, trailingIcon }: AccountDetailsInfoFieldProps) {
  return (
    <div className={"h-[80px] w-full items-center " +
      (trailingIcon ? "grid grid-cols-[minmax(0,1fr)_40px] gap-[16px]" : "flex")}
      data-account-details-info-field>
      <div className="flex min-w-0 flex-col gap-[4px]">
        <p className="uc-type-n4 uppercase text-[var(--uc-text)]">{title}</p>
        <p className="uc-type-n4-strong break-words text-[var(--uc-text)]">{subtitle}</p>
      </div>
      {trailingIcon && (
        <div className="flex h-[40px] w-[40px] items-center justify-center" aria-hidden="true">
          {trailingIcon}
        </div>
      )}
    </div>
  );
}`,
    `import SwiftUI

struct AccountDetailsInfoField<Trailing: View>: View {
    let title: String
    let subtitle: String
    var trailingIcon: (() -> Trailing)? = nil

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title.uppercased())
                    .font(.system(size: 14))
                    .foregroundColor(Color("UcText"))
                Text(subtitle)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color("UcText"))
            }
            Spacer()
            if let trailing = trailingIcon { trailing() }
        }
        .frame(minHeight: 80)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.toUpperCase
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AccountDetailsInfoField(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    trailingIcon: @Composable (() -> Unit)? = null,
) {
    Row(modifier = modifier.fillMaxWidth().heightIn(min = 80.dp)) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title.uppercase(), fontSize = 14.sp, fontWeight = FontWeight.Normal, color = UcTokens.Text)
            Text(subtitle, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
        }
        if (trailingIcon != null) {
            Spacer(Modifier.width(16.dp))
            trailingIcon()
        }
    }
}`,
  ),

  // ---- AccountTransactionMonthDivider ----
  "accounts.transaction-month-divider": sample(
    `// src/app/components/accounts/AccountTransactionMonthDivider.tsx (real)
export default function AccountTransactionMonthDivider({
  title, total, currency,
}: { title: string; total?: string; currency: string }) {
  return (
    <div className="flex flex-col items-start gap-[4px] px-[16px] py-[8px]"
         data-ds-label="AccountTransactionMonthDivider">
      <div className="flex items-center justify-between self-stretch">
        <h2 className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{title}</h2>
        {total && (
          <p className="uc-type-n5-strong text-right uppercase text-[var(--uc-text)]">
            {total} {currency}
          </p>
        )}
      </div>
      <div className="flex flex-col items-center gap-[10px] self-stretch">
        <div className="h-px w-full bg-[var(--uc-border)]" />
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct AccountTransactionMonthDivider: View {
    let title: String
    var total: String? = nil
    let currency: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(title.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(Color("UcTextMuted"))
                Spacer()
                if let t = total {
                    Text("\\\\(t) \\\\(currency)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color("UcText"))
                }
            }
            Rectangle().fill(Color("UcBorder")).frame(height: 1)
        }
        .padding(.horizontal, 16).padding(.vertical, 8)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AccountTransactionMonthDivider(
    title: String,
    total: String?,
    currency: String,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(title.uppercase(), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.TextMuted)
            if (total != null) {
                Text("$total $currency", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            }
        }
        Spacer(Modifier.height(4.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(UcTokens.Border))
    }
}`,
  ),

  // ---- CopyToast ----
  "accounts.copy-toast": sample(
    `// src/app/components/accounts/CopyToast.tsx (real)
import { cn } from "@/app/components/ui/utils";

export interface CopyToastState { message: string; visible: boolean; }

export default function CopyToast({ toast }: { toast: CopyToastState | null }) {
  if (!toast) return null;
  return (
    <div aria-live="polite" role="status"
      className="pointer-events-none absolute inset-x-0 bottom-[18px] z-[60] flex justify-center px-[16px]"
      data-copy-toast>
      <div className={cn(
        "flex h-[34px] w-[343px] max-w-full items-center rounded-[48px]",
        "bg-[var(--uc-static-black)] px-[16px] py-[6px]",
        "shadow-[0_12px_26px_rgb(var(--uc-shadow-rgb)_/_0.24)] transition-all duration-300",
        toast.visible ? "translate-y-0 opacity-100" : "translate-y-[10px] opacity-0",
      )}>
        <p className="min-w-0 flex-1 truncate text-center text-[14px] font-bold text-[var(--uc-static-white)]">
          {toast.message}
        </p>
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct CopyToast: View {
    let message: String
    let isVisible: Bool

    var body: some View {
        if isVisible {
            Text(message)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .frame(height: 34)
                .frame(maxWidth: 343)
                .padding(.horizontal, 16)
                .background(Color.black)
                .clipShape(Capsule())
                .shadow(radius: 12)
                .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun CopyToast(
    message: String,
    visible: Boolean,
    modifier: Modifier = Modifier,
) {
    AnimatedVisibility(visible = visible,
        enter = { slideInVertically { it } + fadeIn() },
        exit = { slideOutVertically { it } + fadeOut() },
    ) {
        Text(
            message,
            fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White,
            maxLines = 1, overflow = TextOverflow.Ellipsis,
            modifier = modifier
                .width(343.dp).height(34.dp)
                .background(Color.Black, RoundedCornerShape(48.dp))
                .wrapContentWidth(Alignment.CenterHorizontally)
                .wrapContentHeight(Alignment.CenterVertically),
        )
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

  // ---- BottomSheet ----
  "shell.bottom-sheet": sample(
    `// src/app/components/BottomSheet.tsx (curated)
import { ReactNode, useEffect, useId, useRef } from "react";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

interface BottomSheetProps {
  title?: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  maxHeightOffsetPx?: number;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClose: () => void;
}

export function BottomSheet({
  title, subtitle, meta, children,
  maxHeightOffsetPx = 54, className, headerClassName, bodyClassName, onClose,
}: BottomSheetProps) {
  const dialogRef = useRef<HTMLElement>(null);

  // Focus management + Escape to close + scroll lock omitted for brevity.

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-[var(--uc-overlay)]">
      <button aria-label="Close sheet" className="absolute inset-0" onClick={onClose} />
      <section
        ref={dialogRef} role="dialog" aria-modal="true"
        className={cn(
          "relative w-full overflow-y-auto rounded-t-[12px] bg-[var(--uc-sheet-bg)] p-[16px]",
          "shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)] [-ms-overflow-style:none] [scrollbar-width:none]",
          className,
        )}
        style={{ maxHeight: "calc(100% - " + maxHeightOffsetPx + "px)" }}>
        <div className={cn("mb-[24px] flex items-start justify-between gap-[16px]", headerClassName)}>
          <div className="min-w-0">
            {title && <h1 className="uc-type-h1 text-[var(--uc-text)]">{title}</h1>}
            {subtitle && <div className="uc-type-n5 mt-[4px] text-[var(--uc-text)]">{subtitle}</div>}
            {meta && <div className="mt-[4px]">{meta}</div>}
          </div>
          <button aria-label="Close" onClick={onClose}
            className="grid size-[32px] shrink-0 place-items-center bg-transparent text-[var(--uc-text)]">
            <AppIcon name="close-x" color="var(--uc-icon)" />
          </button>
        </div>
        <div className={bodyClassName}>{children}</div>
      </section>
    </div>
  );
}`,
    `import SwiftUI

struct BottomSheet<Content: View>: View {
    let title: String?
    @ViewBuilder var content: () -> Content
    let onDismiss: () -> Void

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black.opacity(0.4).ignoresSafeArea().onTapGesture(perform: onDismiss)
            VStack(spacing: 0) {
                if let t = title {
                    HStack {
                        Text(t).font(.system(size: 28, weight: .bold))
                        Spacer()
                        Button(action: onDismiss) {
                            Image(systemName: "xmark").font(.system(size: 18, weight: .bold))
                        }
                    }
                    .padding(16)
                }
                ScrollView { content() }.padding(.horizontal, 16)
            }
            .background(Color("UcSheetBg"))
            .cornerRadius(12, corners: [.topLeft, .topRigth])
            .shadow(radius: 8, y: -4)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun BottomSheet(
    title: String? = null,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Surface(
        modifier = modifier.fillMaxWidth().shadow(8.dp),
        shape = RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp),
        color = UcTokens.Surface,
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            if (title != null) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(title, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
                    TextButton(onClick = onDismiss) {
                        Text("✕", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) { content() }
        }
    }
}`,
  ),

  // ---- MessagesMailboxTabs ----
  "messages.mailbox-tabs": sample(
    `// src/app/components/messages/MessagesMailboxTabs.tsx (curated)
import { cn } from "@/app/components/ui/utils";

export interface MessagesMailboxTab {
  id: string;
  label: string;
}

export default function MessagesMailboxTabs({
  tabs, activeTabId, onChange, minTabWidth = 188, ariaLabel,
}: {
  tabs: readonly MessagesMailboxTab[];
  activeTabId: string;
  onChange: (tabId: string) => void;
  minTabWidth?: number;
  ariaLabel?: string;
  withTopMargin?: boolean;
}) {
  return (
    <div className="mt-0 h-[48px] shrink-0 border-b border-[var(--uc-border)] flex overflow-x-auto scrollbar-hide"
         role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <button key={tab.id} type="button" role="tab" aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex h-full shrink-0 items-center justify-center px-[16px]",
              active ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)]",
            )}
            style={{ minWidth: minTabWidth }}>
            <span className="whitespace-nowrap uc-type-n4-strong">{tab.label}</span>
            {active && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[var(--uc-text)]" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}`,
    `import SwiftUI

struct MessagesMailboxTab: Identifiable { let id: String; let label: String }

struct MessagesMailboxTabs: View {
    let tabs: [MessagesMailboxTab]
    @Binding var activeTabId: String

    var body: some View {
        HStack(spacing: 0) {
            ForEach(tabs) { tab in
                let active = tab.id == activeTabId
                Button { activeTabId = tab.id } label: {
                    VStack(spacing: 0) {
                        Text(tab.label)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(active ? Color("UcText") : Color("UcTextMuted"))
                            .frame(minWidth: 188)
                            .padding(.vertical, 14)
                        if active {
                            Rectangle().fill(Color("UcText")).frame(height: 2)
                        } else { Color.clear.frame(height: 2) }
                    }
                }
            }
        }
        .frame(height: 48)
        .overlay(Rectangle().fill(Color("UcBorder")).frame(height: 1), alignment: .bottom)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class MailboxTab(val id: String, val label: String)

@Composable
fun MessagesMailboxTabs(
    tabs: List<MailboxTab>,
    activeTabId: String,
    onChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth().height(48.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            tabs.forEach { tab ->
                val active = tab.id == activeTabId
                Box(
                    modifier = Modifier
                        .weight(1f).fillMaxHeight()
                        .clickable { onChange(tab.id) },
                    contentAlignment = Alignment.Center,
                ) {
                    Text(tab.label,
                        fontSize = 14.sp, fontWeight = FontWeight.Bold,
                        color = if (active) UcTokens.Text else UcTokens.TextMuted)
                }
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(UcTokens.Border))
        Box(
            Modifier
                .width(if (tabs.isNotEmpty()) (1f / tabs.size).dp else 0.dp)
                .height(2.dp)
                .background(UcTokens.Text)
        )
    }
}`,
  ),

  // ---- AccountSearchBar ----
  "accounts.search-bar": sample(
    `// src/app/components/accounts/AccountSearchBar.tsx (curated)
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export default function AccountSearchBar({
  value, onValueChange, onFilterClick, filtersActive = false,
  onRemoveFilters, showRemoveFiltersAction = true,
}: {
  value: string;
  onValueChange: (v: string) => void;
  onFilterClick: () => void;
  filtersActive: boolean;
  onRemoveFilters?: () => void;
  showRemoveFiltersAction?: boolean;
}) {
  return (
    <div className="flex items-center gap-[8px] py-[8px]">
      <div className="flex flex-1 items-center gap-[8px] rounded-[8px] bg-[var(--uc-app-bg)] px-[12px] h-[44px]">
        <AppIcon name="search" color="var(--uc-text-muted)" />
        <input type="text" value={value} onChange={(e) => onValueChange(e.target.value)}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none text-[var(--uc-text)] placeholder:text-[var(--uc-text-muted)]" />
        {value && (
          <button onClick={() => onValueChange("")} aria-label="Clear results">
            <AppIcon name="clear-results" color="var(--uc-text-muted)" />
          </button>
        )}
      </div>
      <button onClick={onFilterClick} aria-label="Filters"
        className={cn("flex h-[44px] w-[44px] items-center justify-center rounded-[8px]",
          filtersActive ? "bg-[var(--uc-action)]" : "bg-[var(--uc-app-bg)]")}>
        <AppIcon name="filters" color={filtersActive ? "var(--uc-static-white)" : "var(--uc-text-muted)"} />
      </button>
    </div>
  );
}`,
    `import SwiftUI

struct AccountSearchBar: View {
    @Binding var query: String
    var filtersActive: Bool = false
    let onFilter: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass").foregroundColor(Color("UcTextMuted"))
                TextField("", text: $query, prompt: Text("Search"))
                    .font(.system(size: 14))
                if !query.isEmpty {
                    Button { query = "" } label: {
                        Image(systemName: "xmark.circle.fill").foregroundColor(Color("UcTextMuted"))
                    }
                }
            }
            .padding(.horizontal, 12).frame(height: 44)
            .background(Color("UcAppBg")).cornerRadius(8)
            Button(action: onFilter) {
                Image(systemName: "line.3.horizontal.decrease")
                    .foregroundColor(filtersActive ? .white : Color("UcTextMuted"))
                    .frame(width: 44, height: 44)
                    .background(filtersActive ? Color("UcAction") : Color("UcAppBg"))
                    .cornerRadius(8)
            }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AccountSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onFilterClick: () -> Unit,
    filtersActive: Boolean,
    modifier: Modifier = Modifier,
) {
    Row(modifier = modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Box(
            modifier = Modifier.weight(1f).height(44.dp)
                .background(UcTokens.AppBg, RoundedCornerShape(8.dp))
                .padding(horizontal = 12.dp),
            contentAlignment = Alignment.CenterStart,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Filled.Search, null, tint = UcTokens.TextMuted, modifier = Modifier.size(20.dp))
                OutlinedTextField(
                    value = query, onValueChange = onQueryChange,
                    placeholder = { Text("Search", fontSize = 14.sp) },
                    modifier = Modifier.weight(1f), singleLine = true,
                )
                if (query.isNotEmpty()) {
                    Icon(Icons.Filled.Close, "Clear", tint = UcTokens.TextMuted, modifier = Modifier.size(20.dp).clickable { onQueryChange("") })
                }
            }
        }
        Box(
            modifier = Modifier.size(44.dp)
                .background(if (filtersActive) UcTokens.Action else UcTokens.AppBg, RoundedCornerShape(8.dp))
                .clickable { onFilterClick() },
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Filled.FilterList, "Filters",
                 tint = if (filtersActive) Color.White else UcTokens.TextMuted)
        }
    }
}`,
  ),

  // ---- AccountTransactionRow ----
  "accounts.transaction-row": sample(
    `// src/app/components/accounts/AccountTransactionRow.tsx (curated)
import { cn } from "@/app/components/ui/utils";

export default function AccountTransactionRow({
  date, title, amount, subtitle, tone = "neutral",
}: {
  date: { day: string; month: string };
  title: string;
  amount: string;
  subtitle: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="flex h-[80px] w-full items-center bg-[#FFFFFF] px-[16px]">
      <div className="w-[48px] shrink-0">
        <p className="text-[18px] font-bold leading-[20px] text-[#262626]">{date.day}</p>
        <p className="text-[14px] font-bold leading-[15px] text-[#666666]">{date.month}</p>
      </div>
      <div className={cn("ml-[16px] flex min-w-0 flex-1 flex-col border-b border-[#E5E5E5] py-[10px]",
        tone === "positive" && "text-right")}>
        <p className="text-[14px] text-[#262626]">{title}</p>
        <p className={cn("text-[20px] font-bold",
          tone === "positive" ? "text-[#3D7D43]" : tone === "negative" ? "text-[#E2001A]" : "text-[#262626]")}>
          {amount}
        </p>
        <p className="text-[14px] text-[#666666]">{subtitle}</p>
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct AccountTransactionRow: View {
    let day: String
    let month: String
    let title: String
    let amount: String
    let subtitle: String
    var tone: Tone = .neutral

    enum Tone { case neutral, positive, negative
        var color: Color {
            switch self {
            case .neutral: return Color("UcText")
            case .positive: return Color(red: 0.239, green: 0.490, blue: 0.263)
            case .negative: return Color(red: 0.886, green: 0, blue: 0.102)
            }
        }
    }

    var body: some View {
        HStack {
            VStack {
                Text(day).font(.system(size: 18, weight: .bold)).foregroundColor(Color("UcText"))
                Text(month).font(.system(size: 14, weight: .bold)).foregroundColor(Color("UcTextMuted"))
            }
            .frame(width: 48)
            VStack(alignment: .trailing, spacing: 0) {
                Text(title).font(.system(size: 14)).foregroundColor(Color("UcText"))
                Text(amount).font(.system(size: 20, weight: .bold)).foregroundColor(tone.color)
                Text(subtitle).font(.system(size: 14)).foregroundColor(Color("UcTextMuted"))
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
            .padding(.vertical, 10)
        }
        .frame(height: 80)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class TransactionTone(val color: Color) {
    NEUTRAL(UcTokens.Text),
    POSITIVE(Color(0xFF3D7D43)),
    NEGATIVE(Color(0xFFE2001A)),
}

@Composable
fun AccountTransactionRow(
    day: String, month: String,
    title: String, amount: String, subtitle: String,
    tone: TransactionTone = TransactionTone.NEUTRAL,
    modifier: Modifier = Modifier,
) {
    Row(modifier = modifier.fillMaxWidth().height(80.dp).padding(horizontal = 16.dp)) {
        Column(modifier = Modifier.width(48.dp)) {
            Text(day, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text(month, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.TextMuted)
        }
        Column(
            modifier = Modifier.weight(1f).padding(start = 16.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.End,
        ) {
            Text(title, fontSize = 14.sp, color = UcTokens.Text)
            Text(amount, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = tone.color)
            Text(subtitle, fontSize = 14.sp, color = UcTokens.TextMuted)
        }
    }
}`,
  ),

  // ---- AccountCarouselIndicator ----
  "accounts.carousel-indicator": sample(
    `// src/app/components/accounts/AccountCarouselIndicator.tsx (curated)
export default function AccountCarouselIndicator({
  count, activeIndex, onSelect,
}: { count: number; activeIndex: number; onSelect?: (index: number) => void }) {
  // For <=4 items: show full dots. For 5+ items: show a mini dot at each end.
  const items = count <= 4
    ? Array.from({ length: count }, (_, i) => i)
    : Array.from({ length: count }, (_, i) => i).slice(0, 4); // simplified

  return (
    <div className="flex items-center gap-[6px] backdrop-blur-sm">
      {items.map((i) => {
        const active = i === activeIndex;
        return (
          <button key={i} onClick={() => onSelect?.(i)}
            className={active ? "h-[6px] w-[30px] rounded-full bg-[var(--uc-text)]" : "h-[6px] w-[6px] rounded-full bg-[var(--uc-text-muted)]"}
            aria-label={"Item " + (i + 1)} aria-pressed={active} />
        );
      })}
      {count > 4 && (
        <span className="h-[4px] w-[4px] rounded-full bg-[var(--uc-text-muted)]" aria-hidden="true" />
      )}
    </div>
  );
}`,
    `import SwiftUI

struct AccountCarouselIndicator: View {
    let count: Int
    @Binding var activeIndex: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<min(count, 5), id: \\.self) { i in
                let active = i == activeIndex
                Capsule()
                    .fill(active ? Color("UcText") : Color("UcTextMuted"))
                    .frame(width: active ? 30 : 6, height: 6)
                    .onTapGesture { activeIndex = i }
            }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AccountCarouselIndicator(
    count: Int,
    activeIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        val visible = minOf(count, 5)
        for (i in 0 until visible) {
            val active = i == activeIndex
            Box(
                Modifier
                    .height(6.dp)
                    .width(if (active) 30.dp else 6.dp)
                    .background(
                        if (active) UcTokens.Text else UcTokens.TextMuted,
                        RoundedCornerShape(50),
                    )
                    .clickable { onSelect(i) },
            )
        }
    }
}`,
  ),

  // ============================================================
  // BATCH 5 — Products
  // ============================================================

  // ---- ProductMenuCard (164x120 / 164x72 product entry) ----
  "products.product-card": sample(
    `// src/app/components/products/ProductMenuCard.tsx (curated)
export default function ProductMenuCard({
  card, variant = "standard", onClick,
}: { card: ProductsCard; variant?: "standard" | "compact"; onClick?: (card: ProductsCard) => void }) {
  const isCompact = variant === "compact";
  return (
    <button type="button" onClick={() => onClick?.(card)} aria-label={card.title}
      className="relative shrink-0 cursor-pointer overflow-hidden rounded-[8px] text-left"
      style={{
        display: "flex",
        width: 164,
        height: isCompact ? 72 : 120,
        padding: 16,
        background: card.background,
      }}>
      <span className="relative z-10 whitespace-pre-line text-[var(--uc-text-inverse)] uc-type-h2"
            style={{ fontSize: isCompact ? 16 : 18 }}>
        {card.title}
      </span>
      {card.imageSrc && (
        <img src={card.imageSrc} alt="" draggable="false"
          className="absolute bottom-[-2px] right-0 h-[92px] w-[72px] object-contain" />
      )}
    </button>
  );
}`,
    `import SwiftUI

struct ProductMenuCard: View {
    let title: String
    var background: Color = Color(red: 0.141, green: 0.282, blue: 0.345)
    var isCompact: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .topLeading) {
                Rectangle().fill(background)
                Text(title)
                    .font(.system(size: isCompact ? 16 : 18, weight: .bold))
                    .foregroundColor(.white)
                    .padding(16)
            }
            .frame(width: 164, height: isCompact ? 72 : 120)
            .cornerRadius(8)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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

@Composable
fun ProductMenuCard(
    title: String,
    background: Color = Color(0xFF244858),
    isCompact: Boolean = false,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .width(164.dp).height(if (isCompact) 72.dp else 120.dp)
            .background(background, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(16.dp),
        contentAlignment = Alignment.TopStart,
    ) {
        Text(title, fontSize = if (isCompact) 16.sp else 18.sp,
             fontWeight = FontWeight.Bold, color = Color.White)
    }
}`,
  ),

  // ---- ProductOfferCard (327x157 offer banner) ----
  "products.offer-card": sample(
    `// src/app/components/products/ProductOfferCard.tsx (curated)
export default function ProductOfferCard({
  offer, onClick,
}: { offer: ProductsOffer; onClick?: (offer: ProductsOffer) => void }) {
  return (
    <button type="button" onClick={() => onClick?.(offer)}
      className="relative flex h-[157px] w-[327px] cursor-pointer overflow-hidden rounded-[8px] text-left"
      style={{ background: getOfferBackground(offer) }}>
      <div className="relative z-10 flex h-full items-center pl-[20px] pr-[116px]">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-[8px]">
          <h3 className="overflow-hidden whitespace-pre-line font-bold text-[var(--uc-static-white)]"
              style={{ fontSize: 22, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {offer.title}
          </h3>
          <p className="uc-type-p1 overflow-hidden whitespace-pre-line text-[var(--uc-static-white)]"
             style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {offer.description}
          </p>
        </div>
      </div>
      {/* Right side illustration column 116px wide */}
      <div className="absolute right-0 top-0 h-full w-[116px]" />
    </button>
  );
}`,
    `import SwiftUI

struct ProductOfferCard: View {
    let title: String
    let description: String
    var backgroundColor: Color = Color(red: 0.141, green: 0.282, blue: 0.345)
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text(title)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white).lineLimit(2)
                    Text(description)
                        .font(.system(size: 18))
                        .foregroundColor(.white).lineLimit(3)
                }
                Spacer()
                Color.clear.frame(width: 116)
            }
            .padding(.leading, 20)
            .frame(width: 327, height: 157)
            .background(backgroundColor)
            .cornerRadius(8)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ProductOfferCard(
    title: String,
    description: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    backgroundColor: Color = Color(0xFF244858),
) {
    Box(
        modifier = modifier
            .width(327.dp).height(157.dp)
            .background(backgroundColor, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(start = 20.dp, end = 116.dp),
        contentAlignment = Alignment.CenterStart,
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White,
                 maxLines = 2, overflow = TextOverflow.Ellipsis)
            Text(description, fontSize = 18.sp, color = Color.White,
                 maxLines = 3, overflow = TextOverflow.Ellipsis)
        }
    }
}`,
  ),

  // ---- ShopsmartOfferCard (327px shopsmart offer) ----
  "products.shopsmart-offer-card": sample(
    `// src/app/components/shopsmart/ShopsmartOfferCard.tsx (curated)
export default function ShopsmartOfferCard({
  offer,
}: { offer: ShopSmartOfferCard }) {
  return (
    <div className="flex w-[327px] max-w-full flex-col gap-[8px] rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-sm">
      <div className="flex items-start gap-[12px]">
        <img src={offer.imageSrc} alt="" className="size-[56px] rounded-[8px] object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <p className="uc-type-n4-strong text-[var(--uc-text)]">{offer.merchant}</p>
          <p className="uc-type-n4 text-[var(--uc-text)]">{offer.title}</p>
          {offer.statusText && (
            <p className="uc-type-n5 text-[var(--uc-text-muted)]">{offer.statusText}</p>
          )}
        </div>
      </div>
      {offer.tagLabel && (
        <span className="inline-flex w-fit items-center rounded-[4px] bg-[var(--uc-action-soft)] px-[8px] py-[4px]">
          <span className="uc-type-n5-strong text-[var(--uc-action)]">{offer.tagLabel}</span>
        </span>
      )}
    </div>
  );
}`,
    `import SwiftUI

struct ShopsmartOfferCard: View {
    let merchant: String
    let title: String
    var statusText: String? = nil
    var tagLabel: String? = nil
    var imageName: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 8).fill(Color("UcSurfaceMuted"))
                    .frame(width: 56, height: 56)
                VStack(alignment: .leading, spacing: 4) {
                    Text(merchant).font(.system(size: 14, weight: .bold))
                    Text(title).font(.system(size: 14))
                    if let s = statusText {
                        Text(s).font(.system(size: 11)).foregroundColor(Color("UcTextMuted"))
                    }
                }
            }
            if let tag = tagLabel {
                Text(tag).font(.system(size: 11, weight: .bold))
                    .foregroundColor(Color("UcAction"))
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(Color("UcActionSoft"))
                    .cornerRadius(4)
            }
        }
        .padding(16)
        .background(Color("UcSurface"))
        .cornerRadius(8)
        .frame(maxWidth: 327)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ShopsmartOfferCard(
    merchant: String,
    title: String,
    statusText: String? = null,
    tagLabel: String? = null,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .width(327.dp)
            .background(UcTokens.Surface, RoundedCornerShape(8.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(Modifier.size(56.dp).background(UcTokens.SurfaceMuted, RoundedCornerShape(8.dp)))
            Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.weight(1f)) {
                Text(merchant, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
                Text(title, fontSize = 14.sp, color = UcTokens.Text)
                statusText?.let { Text(it, fontSize = 11.sp, color = UcTokens.TextMuted) }
            }
        }
        tagLabel?.let { tag ->
            Text(tag.uppercase(), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.Action,
                 modifier = Modifier.background(UcTokens.ActionSoft, RoundedCornerShape(4.dp)).padding(horizontal = 8.dp, vertical = 4.dp))
        }
    }
}`,
  ),

  // ---- ProductCard / ProductsList / TotalRow (evolution) ----
  "products.product-card-list-total": sample(
    `// src/app/components/ProductCard.tsx + ProductsList.tsx + TotalRow.tsx (curated)
// ProductCard: single product line with title, IBAN, amount
export function ProductCard({ title, iban, amount }: { title: string; iban: string; amount: string }) {
  return (
    <div className="flex items-center justify-between py-[12px] px-[16px]">
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold text-[var(--uc-text)]">{title}</p>
        <p className="text-[14px] text-[var(--uc-text-muted)]">{iban}</p>
      </div>
      <p className="text-[16px] font-bold text-[var(--uc-text)]">{amount}</p>
    </div>
  );
}

// ProductsList: stacked ProductCards with shared shadow
export function ProductsList({ products }: { products: Array<{ title: string; iban: string; amount: string }> }) {
  return (
    <div className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-md">
      {products.map((p, i) => (
        <ProductCard key={i} {...p} />
      ))}
    </div>
  );
}

// TotalRow: total amount summary row
export function TotalRow({ label, total }: { label: string; total: string }) {
  return (
    <div className="flex items-center justify-between px-[16px] py-[12px]">
      <p className="text-[14px] font-bold text-[var(--uc-text-muted)]">{label}</p>
      <p className="text-[20px] font-bold text-[var(--uc-text)]">{total}</p>
    </div>
  );
}`,
    `import SwiftUI

struct ProductCard: View {
    let title: String; let iban: String; let amount: String
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(title).font(.system(size: 16, weight: .bold))
                Text(iban).font(.system(size: 14)).foregroundColor(Color("UcTextMuted"))
            }
            Spacer()
            Text(amount).font(.system(size: 16, weight: .bold))
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
    }
}

struct ProductsList: View {
    let items: [ProductCardData]
    var body: some View {
        VStack(spacing: 0) {
            ForEach(items) { ProductCard(title: $0.title, iban: $0.iban, amount: $0.amount) }
        }
        .background(Color("UcSurface")).cornerRadius(8)
    }
}

struct TotalRow: View {
    let label: String; let total: String
    var body: some View {
        HStack {
            Text(label).font(.system(size: 14, weight: .bold)).foregroundColor(Color("UcTextMuted"))
            Spacer()
            Text(total).font(.system(size: 20, weight: .bold))
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ProductCard(title: String, iban: String, amount: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text(iban, fontSize = 14.sp, color = UcTokens.TextMuted)
        }
        Text(amount, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
    }
}

@Composable
fun TotalRow(label: String, total: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.TextMuted)
        Text(total, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
    }
}`,
  ),

  // ============================================================
  // BATCH 6 — Investments / Payments / PFM
  // ============================================================

  // ---- InvestmentDetailField (label/value row) ----
  "investments.detail-field": sample(
    `// src/app/components/investments/InvestmentDetailField.tsx (real)
export default function InvestmentDetailField({
  label, value, multiline = false, strong = true,
}: { label: string; value: string; multiline?: boolean; strong?: boolean }) {
  return (
    <div className={"flex w-full flex-col gap-[4px] px-[24px] py-[16px] "
      + (multiline ? "min-h-[132px]" : "min-h-[80px] justify-center")}
      data-investment-detail-field={label}>
      <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{label}</p>
      <p className={"text-[16px] leading-[20px] text-[var(--uc-text)] "
        + (strong ? "font-bold" : "font-normal")}>{value}</p>
    </div>
  );
}`,
    `import SwiftUI

struct InvestmentDetailField: View {
    let label: String
    let value: String
    var isStrong: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.system(size: 14)).foregroundColor(Color("UcTextMuted"))
            Text(value).font(.system(size: 16, weight: isStrong ? .bold : .regular))
                .foregroundColor(Color("UcText"))
        }
        .padding(.horizontal, 24).padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun InvestmentDetailField(
    label: String,
    value: String,
    isStrong: Boolean = true,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(label, fontSize = 14.sp, fontWeight = FontWeight.Normal, color = UcTokens.TextMuted)
        Text(value, fontSize = 16.sp,
             fontWeight = if (isStrong) FontWeight.Bold else FontWeight.Normal,
             color = UcTokens.Text)
    }
}`,
  ),

  // ---- InvestmentProductCard ----
  "investments.product-card": sample(
    `// src/app/components/investments/InvestmentProductCard.tsx (curated)
export default function InvestmentProductCard({
  title, valueText, performanceText, contributionLabel,
}: { title: string; valueText: string; performanceText: string; contributionLabel?: string }) {
  return (
    <article className="flex min-h-[95px] flex-col gap-[4px] bg-[var(--uc-surface)] py-[16px] pl-[16px] pr-[24px]">
      <h3 className="truncate text-[14px] font-bold text-[var(--uc-text)]">{title}</h3>
      <div className="flex min-h-[22px] items-center gap-[8px]">
        <p className="min-w-0 flex-1 truncate text-[14px] text-[var(--uc-text)]">{valueText}</p>
        <p className="shrink-0 text-right">
          <span className="text-[20px] font-bold text-[var(--uc-text)]">{performanceText}</span>
        </p>
      </div>
      {contributionLabel && (
        <div className="flex min-h-[18px] items-center gap-[8px]">
          <span className="truncate uppercase text-[14px] text-[var(--uc-text)]">{contributionLabel}</span>
        </div>
      )}
    </article>
  );
}`,
    `import SwiftUI

struct InvestmentProductCard: View {
    let title: String
    let valueText: String
    let performanceText: String
    var contributionLabel: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.system(size: 14, weight: .bold)).lineLimit(1)
            HStack {
                Text(valueText).font(.system(size: 14))
                Spacer()
                Text(performanceText).font(.system(size: 20, weight: .bold))
            }
            if let c = contributionLabel {
                Text(c.uppercased()).font(.system(size: 14))
            }
        }
        .foregroundColor(Color("UcText"))
        .padding(.horizontal, 16).padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun InvestmentProductCard(
    title: String,
    valueText: String,
    performanceText: String,
    contributionLabel: String? = null,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
           verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
             maxLines = 1, overflow = TextOverflow.Ellipsis)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(valueText, fontSize = 14.sp, color = UcTokens.Text,
                 modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(performanceText, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
        }
        contributionLabel?.let {
            Text(it.uppercase(), fontSize = 14.sp, color = UcTokens.Text)
        }
    }
}`,
  ),

  // ---- InvestmentActionBar ----
  "investments.action-bar": sample(
    `// src/app/components/investments/InvestmentActionBar.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";

export interface InvestmentActionItem {
  id: string; iconName: IconName; label: string;
  onClick?: () => void; badgeCount?: number;
}

export default function InvestmentActionBar({
  actions,
}: { actions: readonly InvestmentActionItem[] }) {
  return (
    <div className="flex items-center px-[16px] py-[8px]">
      {actions.map((action) => (
        <button key={action.id} type="button" onClick={action.onClick}
          className="flex flex-1 flex-col items-center gap-[4px]">
          <span className="flex h-[32px] w-[32px] items-center justify-center">
            <AppIcon name={action.iconName} color="var(--uc-text)" size={32} />
          </span>
          <span className="text-[14px] font-bold text-[var(--uc-text)]">{action.label}</span>
          {action.badgeCount ? (
            <span className="text-[11px] font-bold text-[var(--uc-action)]">{action.badgeCount}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}`,
    `import SwiftUI

struct InvestmentActionBar: View {
    let actions: [ActionItem]

    struct ActionItem: Identifiable {
        let id: String; let systemImage: String; let label: String
        var badge: Int? = nil
    }

    var body: some View {
        HStack {
            ForEach(actions) { action in
                VStack(spacing: 4) {
                    Image(systemName: action.systemImage).font(.system(size: 18)).frame(width: 32, height: 32)
                    Text(action.label).font(.system(size: 14, weight: .bold))
                    if let b = action.badge { Text("\\\\(b)").font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color("UcAction")) }
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 8)
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

data class InvestmentActionItem(
    val id: String, val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val label: String, val badge: Int? = null,
)

@Composable
fun InvestmentActionBar(actions: List<InvestmentActionItem>, modifier: Modifier = Modifier) {
    Row(modifier = modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)) {
        actions.forEach { action ->
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Icon(action.icon, action.label, tint = UcTokens.Text, modifier = Modifier.size(32.dp))
                Text(action.label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
                action.badge?.let {
                    Text(it.toString(), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = UcTokens.Action)
                }
            }
        }
    }
}`,
  ),

  // ---- PaymentHeroCard (curated; image paths elided) ----
  "payments.hero-card": sample(
    `// src/app/components/payments/PaymentHeroCard.tsx (curated)
export default function PaymentHeroCard({
  item, onSelect,
}: { item: PaymentHeroItem; onSelect?: (item: PaymentHeroItem) => void }) {
  return (
    <button type="button" onClick={() => onSelect?.(item)} disabled={false}
      className="relative h-[120px] w-full max-w-[327px] cursor-pointer overflow-hidden rounded-[8px] text-left">
      {/* Background illustration image */}
      <div className="relative z-10 flex h-full w-full flex-col px-[20px] pt-[16px]">
        <h2 className="uc-type-l1 whitespace-pre-line text-[var(--uc-text)]">{item.title}</h2>
        <p className="uc-type-n5 mt-[16px] whitespace-pre-line text-[var(--uc-text)]">{item.description}</p>
      </div>
    </button>
  );
}`,
    `import SwiftUI

struct PaymentHeroCard: View {
    let title: String
    let description: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading) {
                Text(title).font(.system(size: 24, weight: .bold))
                Text(description).font(.system(size: 11)).padding(.top, 16)
            }
            .frame(maxWidth: 327, alignment: .leading)
            .padding(.horizontal, 20).padding(.top, 16)
            .frame(height: 120, alignment: .topLeading)
            .background(Color("UcAppBg"))
            .cornerRadius(8)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PaymentHeroCard(
    title: String,
    description: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .width(327.dp).height(120.dp)
            .background(UcTokens.AppBg, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp).padding(top = 16.dp),
    ) {
        Text(title, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
        Text(description, fontSize = 11.sp, color = UcTokens.Text)
    }
}`,
  ),

  // ---- ContactsNavigationCard ----
  "contacts.navigation-card": sample(
    `// src/app/screens/contacts/ContactsNavigationCard.tsx (curated)
export function ContactsNavigationCard({
  icon, title, value, subtitle, hasChevron = true, onClick,
}: {
  icon: ContactsNavigationIcon;
  title: string; value?: string; subtitle?: string;
  hasChevron?: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="relative flex items-start gap-[8px] rounded-[8px] bg-[var(--uc-surface)] p-[16px] text-left">
      <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center">
        <AppIcon name={CONTACT_ICON_NAME[icon]} color="var(--uc-action)" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <p className="text-[16px] font-bold text-[var(--uc-text)]">{title}</p>
        {subtitle && <p className="text-[14px] text-[var(--uc-text-muted)]">{subtitle}</p>}
        {value && <p className="text-[16px] text-[var(--uc-action)]">{value}</p>}
      </div>
      {hasChevron && (
        <span className="flex h-[32px] w-[32px] shrink-0 items-center">
          <AppIcon name="chevron-link" color="var(--uc-action)" />
        </span>
      )}
    </button>
  );
}`,
    `import SwiftUI

struct ContactsNavigationCard: View {
    let systemImage: String
    let title: String
    var subtitle: String? = nil
    var value: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: systemImage)
                    .font(.system(size: 18)).foregroundColor(Color("UcAction"))
                    .frame(width: 40, height: 40)
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.system(size: 16, weight: .bold))
                    if let s = subtitle { Text(s).font(.system(size: 14)).foregroundColor(Color("UcTextMuted")) }
                    if let v = value { Text(v).font(.system(size: 16)).foregroundColor(Color("UcAction")) }
                }
                Spacer()
                Image(systemName: "chevron.right").foregroundColor(Color("UcAction"))
            }
            .padding(16).background(Color("UcSurface")).cornerRadius(8)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ContactsNavigationCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String? = null,
    value: String? = null,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .background(UcTokens.Surface, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Icon(icon, null, tint = UcTokens.Action, modifier = Modifier.size(40.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            subtitle?.let { Text(it, fontSize = 14.sp, color = UcTokens.TextMuted) }
            value?.let { Text(it, fontSize = 16.sp, color = UcTokens.Action) }
        }
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = UcTokens.Action, modifier = Modifier.size(32.dp))
    }
}`,
  ),

  // ============================================================
  // BATCH 7 — Overlays / Prime
  // ============================================================

  // ---- LogoutConfirmDialog ----
  "dialogs.logout-confirm": sample(
    `// src/app/components/LogoutConfirmDialog.tsx (curated)
export default function LogoutConfirmDialog({
  open, onConfirm, onCancel,
}: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
      <div className="w-[327px] rounded-[12px] bg-[var(--uc-surface)] p-[24px]">
        <h2 className="uc-type-h2 text-[var(--uc-text)]">Log out?</h2>
        <p className="mt-[8px] uc-type-n4 text-[var(--uc-text-muted)]">
          You will need to sign in again to access your accounts.
        </p>
        <div className="mt-[24px] flex gap-[8px]">
          <button onClick={onCancel}
            className="flex-1 rounded-[8px] bg-[var(--uc-app-bg)] py-[12px] text-[16px] font-bold text-[var(--uc-text)]">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-[8px] bg-[var(--uc-status-red)] py-[12px] text-[16px] font-bold text-[var(--uc-static-white)]">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct LogoutConfirmDialog: View {
    let onConfirm: () -> Void
    let onCancel: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.4).ignoresSafeArea()
            VStack(alignment: .leading, spacing: 8) {
                Text("Log out?").font(.system(size: 20, weight: .bold))
                Text("You will need to sign in again to access your accounts.")
                    .font(.system(size: 14)).foregroundColor(Color("UcTextMuted"))
                HStack(spacing: 8) {
                    Button("Cancel", action: onCancel)
                        .frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(Color("UcAppBg")).cornerRadius(8)
                    Button("Log out", action: onConfirm)
                        .frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(Color("UcStatusRed")).foregroundColor(.white)
                        .cornerRadius(8)
                }.padding(.top, 24)
            }
            .padding(24).background(Color("UcSurface")).cornerRadius(12)
            .frame(width: 327)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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

@Composable
fun LogoutConfirmDialog(
    onConfirm: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.4f)),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.width(327.dp).padding(24.dp)
                .background(UcTokens.Surface, RoundedCornerShape(12.dp)),
        ) {
            Text("Log out?", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text("You will need to sign in again to access your accounts.",
                 fontSize = 14.sp, color = UcTokens.TextMuted)
            Spacer(Modifier.height(24.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Cancel", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
                     modifier = Modifier.weight(1f).clickable(onClick = onCancel)
                         .background(UcTokens.AppBg, RoundedCornerShape(8.dp)).padding(vertical = 12.dp)
                         .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true))
                Text("Log out", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White,
                     modifier = Modifier.weight(1f).clickable(onClick = onConfirm)
                         .background(UcTokens.StatusRed, RoundedCornerShape(8.dp)).padding(vertical = 12.dp)
                         .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true))
            }
        }
    }
}`,
  ),

  // ---- PrimeDiamondMark ----
  "prime.diamond-mark": sample(
    `// src/app/components/prime/PrimeDiamondMark.tsx (real)
export function PrimeDiamondMark({
  color = "currentColor", size = 16, title,
}: { className?: string; color?: string; size?: number; title?: string }) {
  return (
    <svg aria-hidden={title ? undefined : true} color={color} fill="none"
      height={size} role={title ? "img" : undefined}
      viewBox="0 0 16 16" width={size} xmlns="http://www.w3.org/2000/svg">
      {title ? <title>{title}</title> : null}
      <path d="M7.99 15L4.69 6h6.59L7.99 15ZM9.7 13.21L12.35 6H16L9.7 13.21ZM6.24 13.21L0 6h3.63L6.24 13.21ZM3.7 5H0L2.87 1.5h2.37L3.7 5ZM9.66 1.5L11.18 5H4.79L6.32 1.5h3.34ZM15.98 5H12.27L10.75 1.5h2.37L15.98 5Z"
        fill="currentColor" />
    </svg>
  );
}`,
    `import SwiftUI

struct PrimeDiamondMark: View {
    var size: CGFloat = 16
    var color: Color = .white

    var body: some View {
        Canvas { ctx in
            let path = Path { p in
                p.move(to: CGPoint(x: 7.99, y: 15)); p.addLine(to: CGPoint(x: 4.69, y: 6))
                p.addLine(to: CGPoint(x: 11.28, y: 6)); p.closeSubpath()
                // ... remaining diamond facets elided
            }
            ctx.fill(path, with: .color(color))
        }
        .frame(width: size, height: size)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.dp

@Composable
fun PrimeDiamondMark(
    size: Int = 16,
    color: Color = UcTokens.StaticWhite,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier.size(size.dp)) {
        val scale = size.toFloat() / 16f
        val path = Path().apply {
            moveTo(7.99f * scale, 15f * scale)
            lineTo(4.69f * scale, 6f * scale)
            lineTo(11.28f * scale, 6f * scale)
            close()
            // ... remaining diamond facets follow same pattern
        }
        drawPath(path, color = color)
    }
}`,
  ),

  // ---- PrimeLabelValue ----
  "prime.label-value": sample(
    `// src/app/components/prime/PrimeLabelValue.tsx (real)
export function PrimeLabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-[4px] items-start py-[8px] text-[var(--uc-static-white)] whitespace-pre-wrap">
      <p className="uc-type-n4-strong w-full">{label}</p>
      <p className="uc-type-n4 w-full">{value}</p>
    </div>
  );
}`,
    `import SwiftUI

struct PrimeLabelValue: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.system(size: 14, weight: .bold)).foregroundColor(.white)
            Text(value).font(.system(size: 14)).foregroundColor(.white)
        }
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PrimeLabelValue(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxWidth().padding(vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text(value, fontSize = 14.sp, color = Color.White)
    }
}`,
  ),

  // ---- PrimeIconLabelValue ----
  "prime.icon-label-value": sample(
    `// src/app/components/prime/PrimeIconLabelValue.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";

export function PrimeIconLabelValue({
  iconName, label, value,
}: { iconName: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-[12px] py-[12px]">
      <span className="flex size-[40px] shrink-0 items-center justify-center">
        <AppIcon name={iconName} color="var(--uc-static-white)" />
      </span>
      <div className="flex flex-1 flex-col gap-[2px]">
        <p className="uc-type-n4 text-[var(--uc-static-white)]">{label}</p>
        <p className="uc-type-n4-strong text-[var(--uc-static-white)]">{value}</p>
      </div>
      <span className="flex size-[32px] shrink-0 items-center">
        <AppIcon name="chevron-link" color="var(--uc-static-white)" />
      </span>
    </div>
  );
}`,
    `import SwiftUI

struct PrimeIconLabelValue: View {
    let systemImage: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage)
                .foregroundColor(.white).frame(width: 40, height: 40)
            VStack(alignment: .leading, spacing: 2) {
                Text(label).font(.system(size: 14)).foregroundColor(.white)
                Text(value).font(.system(size: 14, weight: .bold)).foregroundColor(.white)
            }
            Spacer()
            Image(systemName: "chevron.right").foregroundColor(.white)
        }
        .padding(.vertical, 12)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PrimeIconLabelValue(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth().padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, null, tint = Color.White, modifier = Modifier.size(40.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(label, fontSize = 14.sp, color = Color.White)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = Color.White, modifier = Modifier.size(32.dp))
    }
}`,
  ),

  // ---- PanelMenuSheet (the actual shared panel content) ----
  "shell.panel-menu-sheet": sample(
    `// src/app/components/PanelMenuSheet.tsx (curated)
import { AppIcon, type IconName } from "@/app/components/icons";

export default function PanelMenuSheet({
  aboutSmartBanking, exchangeRates, findAtmBranches,
  startCoAppingSession, onClose, onStartCoApping,
}: {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  startCoAppingSession: string;
  onClose?: () => void;
  onStartCoApping?: () => void;
}) {
  const items: Array<{ iconName: IconName; label: string; action?: () => void }> = [
    { iconName: "info-circle", label: aboutSmartBanking },
    { iconName: "payment-exchange-rates", label: exchangeRates },
    { iconName: "landmark", label: findAtmBranches },
    { iconName: "panel-share-screen", label: startCoAppingSession, action: onStartCoApping },
  ];
  return (
    <div className="p-[16px]">
      <div className="mb-[16px] flex items-start justify-between">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">UniCredit</h1>
        {onClose && (
          <button onClick={onClose} aria-label="Close"
            className="grid size-[32px] place-items-center">
            <AppIcon name="close-x" color="var(--uc-icon)" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-[1px] bg-[var(--uc-border)]">
        {items.map((item, i) => (
          <button key={i} onClick={item.action}
            className="flex min-h-[48px] items-center gap-[12px] bg-[var(--uc-sheet-bg)] px-[12px] py-[12px] text-left">
            <AppIcon name={item.iconName} color="var(--uc-action)" size={20} />
            <span className="uc-type-n4 text-[var(--uc-text)]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct PanelMenuSheet: View {
    let items: [(String, String)]  // (systemImage, label)
    var onClose: (() -> Void)? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("UniCredit").font(.system(size: 28, weight: .bold))
                Spacer()
                if let close = onClose {
                    Button(action: close) { Image(systemName: "xmark") }
                }
            }
            VStack(spacing: 1) {
                ForEach(items.indices, id: \\.self) { i in
                    let item = items[i]
                    HStack(spacing: 12) {
                        Image(systemName: item.0).foregroundColor(Color("UcAction"))
                        Text(item.1).font(.system(size: 14))
                        Spacer()
                    }
                    .padding(.horizontal, 12).padding(.vertical, 12)
                    .background(Color("UcSurface"))
                }
            }
            .background(Color("UcBorder")).cornerRadius(8)
        }
        .padding(16)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class PanelMenuItem(val icon: androidx.compose.ui.graphics.vector.ImageVector, val label: String)

@Composable
fun PanelMenuSheet(
    title: String = "UniCredit",
    items: List<PanelMenuItem>,
    onClose: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(title, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            onClose?.let {
                Text("✕", modifier = Modifier.size(32.dp).clickable(onClick = it))
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(1.dp)) {
            items.forEach { item ->
                Row(
                    modifier = Modifier.fillMaxWidth().background(UcTokens.Surface)
                        .clickable { }.padding(horizontal = 12.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(item.icon, null, tint = UcTokens.Action, modifier = Modifier.size(20.dp))
                    Text(item.label, fontSize = 14.sp, color = UcTokens.Text)
                }
            }
        }
    }
}`,
  ),

  // ============================================================
  // BATCH 8 — Remaining components (Cards / Charts / PFM / Payments / Overlays)
  // ============================================================

  // ---- Card (Mastercard card art, 6 variants) ----
  "cards.card": sample(
    `// src/app/components/cards/Card.tsx (curated — variant table elided)
// 6 card variants (MC Debit Standard, MC Credit Premium, etc.) in 3 sizes.
export type CardVariant = string;
export type CardSize = "64x40" | "96x60" | "160x100";

export default function Card({
  variant = "mc-debit-standard", size = "96x60", className,
}: { variant?: CardVariant; size?: CardSize; className?: string }) {
  const dims: Record<CardSize, { w: number; h: number }> = {
    "64x40": { w: 64, h: 40 },
    "96x60": { w: 96, h: 60 },
    "160x100": { w: 160, h: 100 },
  };
  const { w, h } = dims[size];
  return (
    <div className={"relative shrink-0 overflow-hidden rounded-[6px] bg-[var(--uc-static-black)] " + className}
         style={{ width: w, height: h }}
         data-card-variant={variant}>
      {/* Card artwork: gradient + chip + Mastercard circles per variant */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a1a1a, #333)" }} />
      <div className="absolute left-[8px] top-[10px] h-[16px] w-[22px] rounded-[3px] bg-[#FFD700]" />
      <div className="absolute right-[10px] bottom-[8px] flex">
        <div className="size-[14px] rounded-full bg-[#EB001B] opacity-90" />
        <div className="size-[14px] rounded-full bg-[#F79E1B] opacity-90 -ml-[4px]" />
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct CardView: View {
    var variant: String = "mc-debit-standard"
    var width: CGFloat = 96
    var height: CGFloat = 60

    var body: some View {
        ZStack(alignment: .topLeading) {
            LinearGradient(colors: [Color(0x1a1a1a), Color(0x333333)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            RoundedRectangle(cornerRadius: 3).fill(Color(0xFFD700))
                .frame(width: 22, height: 16).padding(.leading, 8).padding(.top, 10)
            HStack(spacing: -4) {
                Circle().fill(Color(0xEB001B)).opacity(0.9).frame(width: 14, height: 14)
                Circle().fill(Color(0xF79E1B)).opacity(0.9).frame(width: 14, height: 14)
            }
            .padding(.trailing, 10).padding(.bottom, 8)
        }
        .frame(width: width, height: height)
        .cornerRadius(6)
        .clipped()
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun CardArt(
    modifier: Modifier = Modifier,
    width: Int = 96,
    height: Int = 60,
) {
    Box(
        modifier = modifier
            .width(width.dp).height(height.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(Brush.linearGradient(listOf(Color(0xFF1A1A1A), Color(0xFF333333)))),
    ) {
        Box(
            Modifier.padding(start = 8.dp, top = 10.dp)
                .width(22.dp).height(16.dp)
                .background(Color(0xFFFFD700), RoundedCornerShape(3.dp)),
        )
        Row(
            modifier = Modifier.align(androidx.compose.ui.Alignment.BottomEnd)
                .padding(end = 10.dp, bottom = 8.dp),
            horizontalArrangement = Arrangement.spacedBy((-4).dp),
        ) {
            Box(Modifier.size(14.dp).background(Color(0xFFEB001B).copy(alpha = 0.9f), RoundedCornerShape(50)))
            Box(Modifier.size(14.dp).background(Color(0xFFF79E1B).copy(alpha = 0.9f), RoundedCornerShape(50)))
        }
    }
}`,
  ),

  // ---- CardComponent (carousel) ----
  "cards.card-component": sample(
    `// src/app/components/cards/CardComponent.tsx (curated)
import Card, { type CardVariant } from "@/app/components/cards/Card";

export interface CardArtItem { id: string; variant: CardVariant; ariaLabel?: string; }

export default function CardComponent({
  cards, activeIndex, onSelect,
}: { cards: readonly CardArtItem[]; activeIndex: number; onSelect?: (index: number) => void }) {
  return (
    <div className="w-[375px] bg-[var(--uc-neutral-100)] p-[16px]">
      <p className="mb-[8px] text-[14px] font-bold text-[var(--uc-text)]">CARD HOLDER</p>
      <div className="flex gap-[24px] overflow-x-auto scrollbar-hide">
        {cards.map((card, i) => (
          <button key={card.id} onClick={() => onSelect?.(i)} aria-label={card.ariaLabel ?? "Card"}
            className="shrink-0">
            <Card variant={card.variant} size="160x100" />
          </button>
        ))}
      </div>
      <p className="mt-[8px] text-[18px] font-bold text-[var(--uc-text)]">•••• •••• •••• 4007</p>
    </div>
  );
}`,
    `import SwiftUI

struct CardCarousel: View {
    let cards: [String]  // variant ids
    @Binding var activeIndex: Int

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 24) {
                ForEach(cards.indices, id: \\.self) { i in
                    CardView(variant: cards[i], width: 160, height: 100)
                        .onTapGesture { activeIndex = i }
                        .overlay(activeIndex == i ? RoundedRectangle(cornerRadius: 6)
                            .stroke(Color("UcAction"), lineWidth: 2) : nil)
                }
            }
            .padding(.horizontal, 16)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CardCarousel(
    cardVariants: List<String>,
    activeIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(24.dp),
    ) {
        cardVariants.forEachIndexed { i, variant ->
            CardArt(width = 160, height = 100)
        }
    }
}`,
  ),

  // ---- AccountBalanceCard (311x197 balance card) ----
  "home.account-balance-card": sample(
    `// src/app/components/accounts/AccountBalanceCard.tsx (curated)
export default function AccountBalanceCard({
  account, availableInteger, availableDecimals, currency,
  currentBalance, onClick, onCopy, active,
}: {
  account: { name: string; accountNumber: string };
  availableInteger: string;
  availableDecimals: string;
  currency: string;
  currentBalance?: string;
  onClick?: () => void;
  onCopy?: () => void;
  active?: boolean;
}) {
  return (
    <div onClick={onClick}
      className={"rounded-[6px] bg-[var(--uc-surface)] p-[16px] shadow-md cursor-pointer transition-shadow "
        + (active ? "ring-2 ring-[var(--uc-action)]" : "")}>
      <p className="text-[20px] font-bold text-[var(--uc-text)]">{account.name}</p>
      <div className="mt-[4px] flex items-center gap-[8px]">
        <p className="text-[14px] text-[var(--uc-text-muted)]">{account.accountNumber}</p>
        {onCopy && (
          <button onClick={(e) => { e.stopPropagation(); onCopy(); }} aria-label="Copy IBAN"
            className="flex size-[32px] items-center justify-center">
            <AppIcon name="account-option-share-info" color="var(--uc-icon)" />
          </button>
        )}
      </div>
      <div className="mt-[8px] flex items-baseline">
        <span className="text-[30px] font-bold text-[var(--uc-text)]">{availableInteger}</span>
        <span className="text-[20px] font-normal text-[var(--uc-text)]">{availableDecimals} {currency}</span>
      </div>
      {currentBalance && (
        <p className="mt-[4px] text-[14px] text-[var(--uc-text-muted)]">Current balance {currentBalance}</p>
      )}
    </div>
  );
}`,
    `import SwiftUI

struct AccountBalanceCard: View {
    let name: String
    let accountNumber: String
    let availableInteger: String
    let availableDecimals: String
    let currency: String
    var currentBalance: String? = nil
    var isActive: Bool = false
    let action: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(name).font(.system(size: 20, weight: .bold))
            Text(accountNumber).font(.system(size: 14)).foregroundColor(Color("UcTextMuted"))
            HStack(alignment: .firstTextBaseline) {
                Text(availableInteger).font(.system(size: 30, weight: .bold))
                Text(availableDecimals + " " + currency).font(.system(size: 20))
            }
            if let cb = currentBalance {
                Text("Current balance " + cb).font(.system(size: 14)).foregroundColor(Color("UcTextMuted"))
            }
        }
        .padding(16)
        .background(Color("UcSurface")).cornerRadius(6)
        .shadow(radius: 4)
        .overlay(isActive ? RoundedRectangle(cornerRadius: 6).stroke(Color("UcAction"), lineWidth: 2) : nil)
        .onTapGesture(perform: action)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AccountBalanceCard(
    name: String, accountNumber: String,
    availableInteger: String, availableDecimals: String, currency: String,
    currentBalance: String? = null,
    isActive: Boolean = false,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .background(UcTokens.Surface, RoundedCornerShape(6.dp))
            .then(if (isActive) Modifier.border(2.dp, UcTokens.Action, RoundedCornerShape(6.dp)) else Modifier)
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(name, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
        Text(accountNumber, fontSize = 14.sp, color = UcTokens.TextMuted)
        Row {
            Text(availableInteger, fontSize = 30.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text("$availableDecimals $currency", fontSize = 20.sp, color = UcTokens.Text)
        }
        currentBalance?.let {
            Text("Current balance $it", fontSize = 14.sp, color = UcTokens.TextMuted)
        }
    }
}`,
  ),

  // ---- FloatingCoAppingButton ----
  "co-apping.floating-button": sample(
    `// src/app/components/FloatingCoAppingButton.tsx (curated)
export default function FloatingCoAppingButton({
  onClick, showSlideIn = false,
}: { onClick: () => void; showSlideIn?: boolean }) {
  return (
    <button onClick={onClick}
      className="absolute right-0 z-[100] cursor-pointer hover:opacity-90"
      style={{ top: 432, width: 44, height: 113 }}
      aria-label="Co-apping session active">
      <svg className="block w-full h-full" fill="none" viewBox="0 0 44 113.013">
        <path d="M44 0v113.013H0V0h44Z" fill="var(--uc-green-bright)" />
      </svg>
      <div className="absolute" style={{ inset: "36% 5% 35% 23%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Share screen icon */}
      </div>
    </button>
  );
}`,
    `import SwiftUI

struct FloatingCoAppingButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color("UcGreenBright"))
                    .frame(width: 44, height: 113)
                Image(systemName: "rectangle.on.rectangle")
                    .foregroundColor(.white).font(.system(size: 20))
            }
        }
        .position(x: UIScreen.main.bounds.width - 22, y: 488)
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun FloatingCoAppingButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .width(44.dp).height(113.dp)
            .background(UcTokens.GreenBright, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            androidx.compose.material.icons.Icons.Filled.AddToPhotos,
            contentDescription = "Co-apping session active",
            tint = Color.White,
        )
    }
}`,
  ),

  // ---- CurrencyFlag ----
  "payments.currency-flag": sample(
    `// src/app/components/payments/CurrencyFlag.tsx (curated — flag SVG art elided per currency)
export default function CurrencyFlag({ currency }: { currency: string }) {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" className="shrink-0 overflow-hidden rounded-[2px]">
      {/* Per-currency flag artwork: RON, EUR, USD, GBP, CZK, HUF, RSD, etc.
          Each branch returns SVG rects/circles/paths for the country flag. */}
    </svg>
  );
}`,
    `import SwiftUI

struct CurrencyFlag: View {
    let currency: String

    var body: some View {
        // Each currency renders its country's flag artwork.
        // Example for EUR: blue background + circle of 12 gold stars.
        Rectangle().fill(flagBackground).frame(width: 36, height: 24).cornerRadius(2)
    }

    private var flagBackground: Color {
        switch currency {
        case "EUR": return Color(red: 0, green: 0.2, blue: 0.6)
        case "USD": return .white
        case "GBP": return Color(red: 0, green: 0.13, blue: 0.41)
        default: return Color("UcAction")
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun CurrencyFlag(currency: String, modifier: Modifier = Modifier) {
    val bgColor = when (currency) {
        "EUR" -> Color(0xFF003399)
        "USD" -> Color.White
        "GBP" -> Color(0xFF012169)
        "RON" -> Color(0xFF002B7F)
        else -> UcTokens.Action
    }
    Surface(
        modifier = modifier.size(width = 36.dp, height = 24.dp),
        shape = RoundedCornerShape(2.dp),
        color = bgColor,
    ) {}
}`,
  ),

  // ---- ExchangeRateListItem ----
  "payments.exchange-rate-list-item": sample(
    `// src/app/components/payments/ExchangeRateListItem.tsx (curated)
import CurrencyFlag from "@/app/components/payments/CurrencyFlag";

export default function ExchangeRateListItem({
  currency, flag, rate, onSelect,
}: { currency: string; flag: string; rate: string; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      className="flex w-full items-center gap-[12px] px-[16px] py-[12px] text-left">
      <CurrencyFlag currency={currency} />
      <div className="flex-1">
        <p className="text-[16px] font-bold text-[var(--uc-text)]">{currency}</p>
        <p className="text-[14px] text-[var(--uc-text-muted)]">{flag}</p>
      </div>
      <p className="text-[16px] font-bold text-[var(--uc-text)]">{rate}</p>
    </button>
  );
}`,
    `import SwiftUI

struct ExchangeRateListItem: View {
    let currency: String
    let flagDescription: String
    let rate: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                CurrencyFlag(currency: currency)
                VStack(alignment: .leading) {
                    Text(currency).font(.system(size: 16, weight: .bold))
                    Text(flagDescription).font(.system(size: 14))
                        .foregroundColor(Color("UcTextMuted"))
                }
                Spacer()
                Text(rate).font(.system(size: 16, weight: .bold))
            }
            .padding(.horizontal, 16).padding(.vertical, 12)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ExchangeRateListItem(
    currency: String,
    flagDescription: String,
    rate: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth().clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        CurrencyFlag(currency = currency)
        Column(modifier = Modifier.weight(1f)) {
            Text(currency, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text(flagDescription, fontSize = 14.sp, color = UcTokens.TextMuted)
        }
        Text(rate, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
    }
}`,
  ),

  // ---- NewPaymentActionListItem ----
  "payments.new-payment-action": sample(
    `// src/app/components/payments/NewPaymentActionListItem.tsx (curated)
import { AppIcon } from "@/app/components/icons";

export default function NewPaymentActionListItem({
  label, iconName, onClick,
}: { label: string; iconName: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="grid h-[80px] w-full grid-cols-[32px_1fr_32px] items-center gap-[16px] text-left">
      <span className="flex size-[32px] items-center justify-center">
        <AppIcon name={iconName} color="var(--uc-icon)" />
      </span>
      <span className="uc-type-n4 text-[var(--uc-text)]">{label}</span>
      <span className="flex size-[32px] items-center justify-center">
        <AppIcon name="chevron-link" color="var(--uc-text)" />
      </span>
    </button>
  );
}`,
    `import SwiftUI

struct NewPaymentActionListItem: View {
    let systemImage: String
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: systemImage).frame(width: 32, height: 32)
                Text(label).font(.system(size: 14))
                Spacer()
                Image(systemName: "chevron.right").frame(width: 32, height: 32)
            }
            .frame(height: 80)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NewPaymentActionListItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth().height(80.dp).clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Icon(icon, null, tint = UcTokens.Icon, modifier = Modifier.size(32.dp))
        Text(label, fontSize = 14.sp, color = UcTokens.Text, modifier = Modifier.weight(1f))
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = UcTokens.Text,
             modifier = Modifier.size(32.dp))
    }
}`,
  ),

  // ---- PaymentTemplateListItem ----
  "payments.template-list-item": sample(
    `// src/app/components/payments/PaymentTemplateListItem.tsx (curated)
import { AppIcon } from "@/app/components/icons";

export default function PaymentTemplateListItem({
  title, beneficiary, onSelect,
}: { title: string; beneficiary: string; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      className="grid w-full grid-cols-[40px_minmax(0,1fr)_32px] items-center gap-[8px] px-[8px] py-[10px] text-left">
      <span className="grid size-[40px] place-items-center">
        <AppIcon name="payment-templates" color="var(--uc-icon)" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[16px] font-bold text-[var(--uc-text)]">{title}</p>
        <p className="truncate text-[14px] text-[var(--uc-text-muted)]">{beneficiary}</p>
      </div>
      <span className="flex size-[32px] items-center justify-center">
        <AppIcon name="chevron-link" color="var(--uc-text)" />
      </span>
    </button>
  );
}`,
    `import SwiftUI

struct PaymentTemplateListItem: View {
    let title: String
    let beneficiary: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: "doc.text.fill").frame(width: 40, height: 40)
                VStack(alignment: .leading) {
                    Text(title).font(.system(size: 16, weight: .bold)).lineLimit(1)
                    Text(beneficiary).font(.system(size: 14))
                        .foregroundColor(Color("UcTextMuted")).lineLimit(1)
                }
                Spacer()
                Image(systemName: "chevron.right").frame(width: 32, height: 32)
            }
            .padding(.horizontal, 8).padding(.vertical, 10)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PaymentTemplateListItem(
    title: String,
    beneficiary: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth().clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(androidx.compose.material.icons.Icons.Filled.Description, null,
             tint = UcTokens.Icon, modifier = Modifier.size(40.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
                 maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(beneficiary, fontSize = 14.sp, color = UcTokens.TextMuted,
                 maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = UcTokens.Text,
             modifier = Modifier.size(32.dp))
    }
}`,
  ),

  // ---- InvestmentProductsAccordion ----
  "investments.products-accordion": sample(
    `// src/app/components/investments/InvestmentProductsAccordion.tsx (curated)
import { useState } from "react";

export default function InvestmentProductsAccordion({
  title, count, defaultOpen = true, children,
}: { title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-[24px] py-[12px]">
        <span className="text-[16px] font-bold text-[var(--uc-text)]">{title}</span>
        <span className="text-[14px] text-[var(--uc-text-muted)]">({count})</span>
      </button>
      {open && <div className="px-[0px]">{children}</div>}
    </div>
  );
}`,
    `import SwiftUI

struct InvestmentProductsAccordion<Content: View>: View {
    let title: String
    let count: Int
    var defaultOpen: Bool = true
    @ViewBuilder var content: () -> Content
    @State private var isOpen = true

    var body: some View {
        VStack {
            Button { withAnimation { isOpen.toggle() } } label: {
                HStack {
                    Text(title).font(.system(size: 16, weight: .bold))
                    Spacer()
                    Text("(\\\\(count))").font(.system(size: 14))
                        .foregroundColor(Color("UcTextMuted"))
                }
                .padding(.horizontal, 24).padding(.vertical, 12)
            }
            if isOpen { content() }
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.animation.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun InvestmentProductsAccordion(
    title: String,
    count: Int,
    modifier: Modifier = Modifier,
    defaultOpen: Boolean = true,
    content: @Composable () -> Unit,
) {
    var isOpen by remember { mutableStateOf(defaultOpen) }
    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth().clickable { isOpen = !isOpen }
                .padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text("($count)", fontSize = 14.sp, color = UcTokens.TextMuted)
        }
        AnimatedVisibility(visible = isOpen) { content() }
    }
}`,
  ),

  // ---- TerminateSessionPopup ----
  "dialogs.terminate-session": sample(
    `// src/app/components/TerminateSessionPopup.tsx (curated)
export default function TerminateSessionPopup({
  onCancel, onTerminate,
}: { onCancel: () => void; onTerminate: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-[327px] overflow-hidden rounded-[12px] bg-[var(--uc-surface)] shadow-xl">
        <div className="flex flex-col items-center gap-[16px] px-[24px] py-[32px]">
          <h2 className="text-[20px] font-bold text-[var(--uc-text)]">Terminate session?</h2>
          <p className="text-center text-[14px] text-[var(--uc-text-muted)]">
            The other person will lose access immediately.
          </p>
          <div className="flex w-full gap-[8px]">
            <button onClick={onCancel}
              className="flex-1 rounded-[8px] bg-[var(--uc-app-bg)] py-[12px] text-[16px] font-bold text-[var(--uc-text)]">
              Cancel
            </button>
            <button onClick={onTerminate}
              className="flex-1 rounded-[8px] bg-[var(--uc-status-red)] py-[12px] text-[16px] font-bold text-white">
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    `import SwiftUI

struct TerminateSessionPopup: View {
    let onCancel: () -> Void
    let onTerminate: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.5).ignoresSafeArea().onTapGesture(perform: onCancel)
            VStack(spacing: 16) {
                Text("Terminate session?").font(.system(size: 20, weight: .bold))
                Text("The other person will lose access immediately.")
                    .font(.system(size: 14)).foregroundColor(Color("UcTextMuted"))
                    .multilineTextAlignment(.center)
                HStack(spacing: 8) {
                    Button("Cancel", action: onCancel).frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(Color("UcAppBg")).cornerRadius(8)
                    Button("Terminate", action: onTerminate).frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(Color("UcStatusRed")).foregroundColor(.white).cornerRadius(8)
                }
            }
            .padding(.horizontal, 24).padding(.vertical, 32)
            .background(Color("UcSurface")).cornerRadius(12)
            .frame(width: 327)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TerminateSessionPopup(
    onCancel: () -> Unit,
    onTerminate: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.5f)),
        contentAlignment = Alignment.Center) {
        Column(
            modifier = Modifier
                .width(327.dp)
                .background(UcTokens.Surface, RoundedCornerShape(12.dp))
                .padding(horizontal = 24.dp, vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text("Terminate session?", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text("The other person will lose access immediately.",
                 fontSize = 14.sp, color = UcTokens.TextMuted, textAlign = TextAlign.Center)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Cancel", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text,
                     modifier = Modifier.weight(1f).clickable(onClick = onCancel)
                         .background(UcTokens.AppBg, RoundedCornerShape(8.dp)).padding(vertical = 12.dp)
                         .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true))
                Text("Terminate", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White,
                     modifier = Modifier.weight(1f).clickable(onClick = onTerminate)
                         .background(UcTokens.StatusRed, RoundedCornerShape(8.dp)).padding(vertical = 12.dp)
                         .wrapContentWidth(Alignment.CenterHorizontally, unbounded = true))
            }
        }
    }
}`,
  ),
};
