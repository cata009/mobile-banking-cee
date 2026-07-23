// AUTO-GROUPED slice of the component code-sample registry (see ../componentCodeSamples.ts).
// Split purely by domain for navigability; the merged record is unchanged.
import { sample, type ComponentCodeSample } from "../componentCodeSampleShared";

export const CODE_SAMPLES_BANKING: Record<string, ComponentCodeSample> = {

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

  // ---- AccountSearchBar ----
  "accounts.transaction-search": sample(
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
};
