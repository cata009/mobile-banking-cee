// AUTO-GROUPED slice of the component code-sample registry (see ../componentCodeSamples.ts).
// Split purely by domain for navigability; the merged record is unchanged.
import { sample, type ComponentCodeSample } from "../componentCodeSampleShared";

export const CODE_SAMPLES_CHROME: Record<string, ComponentCodeSample> = {
  // ============================================================
  // BATCH 8 — Implementation package coverage completion
  // ============================================================

  "shell.home-header": sample(
    // --- React (real, from src/app/screens/home/HomeHeader.tsx) ---
    `import AmountVisibilityButton from "@/app/components/AmountVisibilityButton";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { PrimeDiamondMark } from "@/app/components/prime/PrimeDiamondMark";
import { useDemo } from "@/app/state/demoStore";

interface HomeHeaderProps {
  onPrimeClick?: () => void;
  onMessagesClick?: () => void;
  showActions?: boolean;
  showTitle?: boolean;
  title?: string;
}

export default function HomeHeader({
  onPrimeClick, onMessagesClick,
  showActions = true, showTitle = true, title = "Your Homepage",
}: HomeHeaderProps) {
  const { amountsHidden, toggleAmountsHidden } = useDemo();

  return (
    <div className="w-full">
      {showActions && (
        <div className="flex h-[56px] items-start justify-between px-[24px] pb-[24px]">
          <button onClick={onPrimeClick}
            className="flex items-center gap-[6px] rounded-[16px] px-[12px] py-[8px] hover:opacity-80">
            <PrimeDiamondMark color="var(--uc-static-white)" />
            <span className="uc-type-n5-strong text-[var(--uc-static-white)]" style={{ lineHeight: "16px" }}>
              Prime
            </span>
          </button>

          <HeaderActionRail>
            <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
            <HeaderActionButton icon="profile" label="Profile" />
            <HeaderActionButton icon="messages" label="Messages" onClick={onMessagesClick} />
          </HeaderActionRail>
        </div>
      )}

      {showTitle && (
        <div className="px-[24px] pb-[24px]">
          <h1 className="uc-type-h1 text-[var(--uc-text)]">{title}</h1>
        </div>
      )}
    </div>
  );
}`,
    // --- Swift (SwiftUI port) ---
    `import SwiftUI

struct HomeHeader: View {
    var onPrimeClick: (() -> Void)? = nil
    var onMessagesClick: (() -> Void)? = nil
    var showActions: Bool = true
    var showTitle: Bool = true
    var title: String = "Your Homepage"

    // Integration dependency: swap for the app's real amount-visibility state.
    @State private var amountsHidden: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if showActions {
                HStack(alignment: .top) {
                    Button(action: { onPrimeClick?() }) {
                        HStack(spacing: 6) {
                            PrimeDiamondMark(color: .white) // integration dependency: native diamond glyph
                            Text("Prime")
                                .font(.ucN5Strong)
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(
                            LinearGradient(colors: [Color("ucProductBlue"), Color.black], startPoint: .top, endPoint: .bottom)
                        )
                        .cornerRadius(16)
                    }

                    Spacer()

                    HStack(spacing: 16) {
                        AmountVisibilityButton(hidden: amountsHidden, onToggle: { amountsHidden.toggle() })
                        HeaderActionButton(icon: "profile", label: "Profile", action: {})
                        HeaderActionButton(icon: "messages", label: "Messages", action: { onMessagesClick?() })
                    }
                }
                .frame(height: 56)
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }

            if showTitle {
                Text(title)
                    .font(.ucH1)
                    .foregroundColor(Color("ucText"))
                    .padding(.horizontal, 24)
                    .padding(.bottom, 24)
            }
        }
    }
}`,
    // --- Kotlin (Jetpack Compose port) ---
    `import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun HomeHeader(
    onPrimeClick: () -> Unit = {},
    onMessagesClick: () -> Unit = {},
    showActions: Boolean = true,
    showTitle: Boolean = true,
    title: String = "Your Homepage",
) {
    // Integration dependency: swap for the app's real amount-visibility state.
    var amountsHidden by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        if (showActions) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(horizontal = 24.dp)
                    .padding(bottom = 24.dp),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(Brush.verticalGradient(listOf(UcColors.productBlue, Color.Black)))
                        .clickable(onClick = onPrimeClick)
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    PrimeDiamondMark(color = Color.White) // integration dependency
                    Text("Prime", style = UcType.n5Strong, color = Color.White)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    AmountVisibilityButton(hidden = amountsHidden, onToggle = { amountsHidden = !amountsHidden })
                    HeaderActionButton(icon = "profile", label = "Profile")
                    HeaderActionButton(icon = "messages", label = "Messages", onClick = onMessagesClick)
                }
            }
        }

        if (showTitle) {
            Text(
                text = title,
                style = UcType.h1,
                modifier = Modifier.padding(horizontal = 24.dp).padding(bottom = 24.dp),
            )
        }
    }
}`,
  ),

  "shell.more-header": sample(
    // --- React (real, from src/app/screens/more/MoreHeader.tsx) ---
    `import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface MoreHeaderProps {
  onProfile: () => void;
  onContactPhone?: () => void;
  onMessages: () => void;
  onLogout: () => void;
  actionVariant?: "default" | "contact-messages";
  messageCount?: number;
}

export function MoreHeader({
  onProfile, onContactPhone, onMessages, onLogout,
  actionVariant = "default", messageCount = 0,
}: MoreHeaderProps) {
  const { t } = useLanguage();
  const usesContactMessages = actionVariant === "contact-messages";

  return (
    <div className="w-full">
      <div className="px-[24px] pb-[24px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1 className="uc-type-h1 flex-1 min-w-0 text-[var(--uc-text)]">{t("more.title")}</h1>

          <HeaderActionRail>
            {usesContactMessages ? (
              <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={onContactPhone} />
            ) : (
              <HeaderActionButton icon="profile" label="Profile" onClick={onProfile} />
            )}
            <HeaderActionButton icon="messages" label="Messages" onClick={onMessages} badgeCount={messageCount} />
            {usesContactMessages ? null : (
              <HeaderActionButton icon="logout" label="Logout" onClick={onLogout} />
            )}
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}`,
    // --- Swift (SwiftUI port) ---
    `import SwiftUI

struct MoreHeader: View {
    let onProfile: () -> Void
    var onContactPhone: (() -> Void)? = nil
    let onMessages: () -> Void
    let onLogout: () -> Void
    var actionVariant: ActionVariant = .default
    var messageCount: Int = 0

    enum ActionVariant { case \`default\`, contactMessages }

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text(NSLocalizedString("more.title", comment: "More screen title"))
                .font(.ucH1)
                .foregroundColor(Color("ucText"))
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 16) {
                if actionVariant == .contactMessages {
                    HeaderActionButton(icon: "contact-phone", label: "Contact phone", action: { onContactPhone?() })
                } else {
                    HeaderActionButton(icon: "profile", label: "Profile", action: onProfile)
                }
                HeaderActionButton(icon: "messages", label: "Messages", badgeCount: messageCount, action: onMessages)
                if actionVariant != .contactMessages {
                    HeaderActionButton(icon: "logout", label: "Logout", action: onLogout)
                }
            }
        }
        .frame(minHeight: 32)
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
    }
}`,
    // --- Kotlin (Jetpack Compose port) ---
    `import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp

enum class MoreHeaderActionVariant { DEFAULT, CONTACT_MESSAGES }

@Composable
fun MoreHeader(
    onProfile: () -> Unit,
    onContactPhone: () -> Unit = {},
    onMessages: () -> Unit,
    onLogout: () -> Unit,
    actionVariant: MoreHeaderActionVariant = MoreHeaderActionVariant.DEFAULT,
    messageCount: Int = 0,
) {
    val usesContactMessages = actionVariant == MoreHeaderActionVariant.CONTACT_MESSAGES

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .padding(bottom = 24.dp)
            .heightIn(min = 32.dp),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(
            text = stringResource(id = R.string.more_title), // integration dependency: "more.title" translation key
            style = UcType.h1,
            modifier = Modifier.weight(1f),
        )

        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            if (usesContactMessages) {
                HeaderActionButton(icon = "contact-phone", label = "Contact phone", onClick = onContactPhone)
            } else {
                HeaderActionButton(icon = "profile", label = "Profile", onClick = onProfile)
            }
            HeaderActionButton(icon = "messages", label = "Messages", badgeCount = messageCount, onClick = onMessages)
            if (!usesContactMessages) {
                HeaderActionButton(icon = "logout", label = "Logout", onClick = onLogout)
            }
        }
    }
}`,
  ),

  "prelogin.other-panel": sample(
    // --- React (real, from src/app/components/PanelWithTranslations.tsx + PanelMenuSheet.tsx) ---
    `import PanelMenuSheet from "@/app/components/PanelMenuSheet";

interface PanelWithTranslationsProps {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  startCoAppingSession: string;
  onClose?: () => void;
  onStartCoApping?: () => void;
}

// Translated panel variant with the optional Co-Apping action enabled.
export default function PanelWithTranslations(props: PanelWithTranslationsProps) {
  return <PanelMenuSheet {...props} />;
}

// PanelMenuSheet renders: a dimmed backdrop, a bottom sheet with a drag handle,
// and one 375x80 row per label (icon + single-line text), plus the Co-Apping
// row only when startCoAppingSession is supplied.`,
    // --- Swift (SwiftUI port) ---
    `import SwiftUI

struct OtherPanelMenu: View {
    let aboutSmartBanking: String
    let exchangeRates: String
    let findAtmBranches: String
    let startCoAppingSession: String
    var onClose: (() -> Void)? = nil
    var onStartCoApping: (() -> Void)? = nil

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black.opacity(0.51)
                .background(.ultraThinMaterial)
                .onTapGesture { onClose?() }

            VStack(spacing: 8) {
                Capsule()
                    .fill(Color("ucBorderMuted"))
                    .frame(width: 40, height: 5)
                    .padding(.top, 10)
                    .onTapGesture { onClose?() }

                PanelMenuRow(icon: "panel-smart-banking", label: aboutSmartBanking, action: nil)
                PanelMenuRow(icon: "payment-exchange-rates", label: exchangeRates, action: nil)
                PanelMenuRow(icon: "contact-location", label: findAtmBranches, action: nil)
                PanelMenuRow(icon: "panel-share-screen", label: startCoAppingSession, action: onStartCoApping)
            }
            .padding(.vertical, 24)
            .background(Color("ucText"))
            .cornerRadius(12, corners: [.topLeft, .topRight])
        }
    }
}

private struct PanelMenuRow: View {
    let icon: String
    let label: String
    let action: (() -> Void)?

    var body: some View {
        HStack(spacing: 16) {
            AppIcon(name: icon, color: .white) // integration dependency: shared icon registry
                .frame(width: 32, height: 32)
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.white)
            Spacer()
        }
        .padding(.horizontal, 16)
        .frame(height: 80)
        .contentShape(Rectangle())
        .onTapGesture { action?() }
    }
}`,
    // --- Kotlin (Jetpack Compose port) ---
    `import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun OtherPanelMenu(
    aboutSmartBanking: String,
    exchangeRates: String,
    findAtmBranches: String,
    startCoAppingSession: String,
    onClose: () -> Unit = {},
    onStartCoApping: () -> Unit = {},
) {
    Box(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.51f))
                .clickable(onClick = onClose),
        )

        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(UcColors.text, RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                .padding(vertical = 24.dp),
        ) {
            PanelMenuRow(icon = "panel-smart-banking", label = aboutSmartBanking, onClick = null)
            PanelMenuRow(icon = "payment-exchange-rates", label = exchangeRates, onClick = null)
            PanelMenuRow(icon = "contact-location", label = findAtmBranches, onClick = null)
            PanelMenuRow(icon = "panel-share-screen", label = startCoAppingSession, onClick = onStartCoApping)
        }
    }
}

@Composable
private fun PanelMenuRow(icon: String, label: String, onClick: (() -> Unit)?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp)
            .let { if (onClick != null) it.clickable(onClick = onClick) else it }
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AppIcon(name = icon, tint = Color.White) // integration dependency: shared icon registry
        Spacer(modifier = Modifier.width(16.dp))
        Text(label, color = Color.White)
    }
}`,
  ),

  "prelogin.other-panel-basic": sample(
    // --- React (real, from src/app/components/PanelWithoutCoAppingTranslations.tsx + PanelMenuSheet.tsx) ---
    `import PanelMenuSheet from "@/app/components/PanelMenuSheet";

interface PanelWithoutCoAppingTranslationsProps {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  onClose?: () => void;
}

// Translated panel variant for countries where Co-Apping is unavailable: the
// same PanelMenuSheet without a startCoAppingSession label omits its row entirely.
export default function PanelWithoutCoAppingTranslations(
  props: PanelWithoutCoAppingTranslationsProps,
) {
  return <PanelMenuSheet {...props} />;
}`,
    // --- Swift (SwiftUI port) ---
    `import SwiftUI

struct OtherPanelMenuBasic: View {
    let aboutSmartBanking: String
    let exchangeRates: String
    let findAtmBranches: String
    var onClose: (() -> Void)? = nil

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black.opacity(0.51)
                .background(.ultraThinMaterial)
                .onTapGesture { onClose?() }

            VStack(spacing: 8) {
                Capsule()
                    .fill(Color("ucBorderMuted"))
                    .frame(width: 40, height: 5)
                    .padding(.top, 10)
                    .onTapGesture { onClose?() }

                PanelMenuRowBasic(icon: "panel-smart-banking", label: aboutSmartBanking)
                PanelMenuRowBasic(icon: "payment-exchange-rates", label: exchangeRates)
                PanelMenuRowBasic(icon: "contact-location", label: findAtmBranches)
            }
            .padding(.vertical, 24)
            .background(Color("ucText"))
            .cornerRadius(12, corners: [.topLeft, .topRight])
        }
    }
}

private struct PanelMenuRowBasic: View {
    let icon: String
    let label: String

    var body: some View {
        HStack(spacing: 16) {
            AppIcon(name: icon, color: .white) // integration dependency
                .frame(width: 32, height: 32)
            Text(label).font(.system(size: 14)).foregroundColor(.white)
            Spacer()
        }
        .padding(.horizontal, 16)
        .frame(height: 80)
    }
}`,
    // --- Kotlin (Jetpack Compose port) ---
    `import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun OtherPanelMenuBasic(
    aboutSmartBanking: String,
    exchangeRates: String,
    findAtmBranches: String,
    onClose: () -> Unit = {},
) {
    Box(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.51f))
                .clickable(onClick = onClose),
        )

        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(UcColors.text, RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                .padding(vertical = 24.dp),
        ) {
            PanelMenuRowBasic(icon = "panel-smart-banking", label = aboutSmartBanking)
            PanelMenuRowBasic(icon = "payment-exchange-rates", label = exchangeRates)
            PanelMenuRowBasic(icon = "contact-location", label = findAtmBranches)
        }
    }
}

@Composable
private fun PanelMenuRowBasic(icon: String, label: String) {
    Row(
        modifier = Modifier.fillMaxWidth().height(80.dp).padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AppIcon(name = icon, tint = Color.White) // integration dependency
        Spacer(modifier = Modifier.width(16.dp))
        Text(label, color = Color.White)
    }
}`,
  ),

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
  "dialogs.logout-confirmation": sample(
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
