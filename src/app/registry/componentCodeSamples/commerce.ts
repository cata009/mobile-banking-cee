// AUTO-GROUPED slice of the component code-sample registry (see ../componentCodeSamples.ts).
// Split purely by domain for navigability; the merged record is unchanged.
import { sample, type ComponentCodeSample } from "../componentCodeSampleShared";

export const CODE_SAMPLES_COMMERCE: Record<string, ComponentCodeSample> = {

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

  // ---- InvestmentsFundBanner (title / description / action / illustration CTA) ----
  "investments.fund-banner": sample(
    `// src/app/components/investments/InvestmentsFundBanner.tsx (curated)
import { AppIcon } from "@/app/components/icons";
import fundBannerPlant from "@/assets/investments/fund-banner-plant-unsplash.jpg";

interface InvestmentsFundBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
}

function FundBannerIllustration() {
  return (
    <div className="absolute right-0 top-0 h-full w-[179px] overflow-hidden" aria-hidden="true">
      <img
        src={fundBannerPlant}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "32px center" }}
        draggable={false}
      />
      <div className="absolute inset-y-0 left-0 w-[88px] bg-gradient-to-r from-[var(--uc-surface-muted)] via-[color-mix(in_srgb,var(--uc-surface-muted)_90%,transparent)] to-transparent" />
    </div>
  );
}

export default function InvestmentsFundBanner({
  title, description, actionLabel, onClick,
}: InvestmentsFundBannerProps) {
  return (
    <button type="button" onClick={onClick}
      className="relative mx-[16px] mt-[24px] block h-[157px] w-[calc(100%-32px)] overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px] text-left shadow-none"
      data-ds-label="Investments fund banner">
      <div className="relative z-10 max-w-[223px]">
        <h2 className="text-[22px] font-bold leading-[26px] tracking-[0.2px] text-[var(--uc-text)]">{title}</h2>
        <p className="mt-[8px] text-[18px] font-normal leading-normal text-[var(--uc-text)]">{description}</p>
        <span className="mt-[18px] inline-flex items-center gap-[4px] text-[14px] font-bold uppercase leading-normal text-[var(--uc-text)]">
          {actionLabel}
          <AppIcon name="arrow-right" size={12} color="var(--uc-text)" strokeWidth={3} />
        </span>
      </div>
      <FundBannerIllustration />
    </button>
  );
}`,
    `import SwiftUI

// Reference port — adapt to your native project conventions.
struct InvestmentsFundBanner: View {
    let title: String
    let description: String
    let actionLabel: String
    var onClick: (() -> Void)? = nil

    var body: some View {
        Button(action: { onClick?() }) {
            ZStack(alignment: .topTrailing) {
                // Decorative illustration on the right edge
                Image("fund-banner-plant")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 179)
                    .clipped()
                    .accessibilityHidden(true)
                // Left gradient fade into the muted surface
                LinearGradient(
                    gradient: Gradient(colors: [Color(UcTokens.SurfaceMuted), Color(UcTokens.SurfaceMuted).opacity(0)]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 88)
                .frame(maxHeight: .infinity, alignment: .leading)
                .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 0) {
                    Text(title)
                        .font(.system(size: 22, weight: .bold))
                        .tracking(0.2)
                        .lineSpacing(4)
                    Text(description)
                        .font(.system(size: 18))
                        .padding(.top, 8)
                    HStack(spacing: 4) {
                        Text(actionLabel)
                            .font(.system(size: 14, weight: .bold))
                            .textCase(.uppercase)
                        Image(systemName: "arrow.right")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .padding(.top, 18)
                }
                .foregroundStyle(Color(UcTokens.Text))
                .frame(maxWidth: 223, alignment: .leading)
                .padding(16)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
            .frame(height: 157)
            .background(Color(UcTokens.SurfaceMuted))
            .cornerRadius(8)
        }
    }
}`,
    `package com.unicredit.bank.designsystem

// Reference port — adapt to your native project conventions.
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.toUpperCase
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun InvestmentsFundBanner(
    title: String,
    description: String,
    actionLabel: String,
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(157.dp)
            .background(UcTokens.SurfaceMuted, RoundedCornerShape(8.dp))
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
            .padding(16.dp)
    ) {
        // Decorative illustration anchored to the right edge
        Image(
            painter = painterResource("fund-banner-plant"),
            contentDescription = null,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .width(179.dp)
                .matchParentSize(),
        )
        // Left gradient fade into the muted surface
        Box(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .width(88.dp)
                .matchParentSize()
                .background(
                    Brush.horizontalGradient(
                        listOf(UcTokens.SurfaceMuted, Color.Transparent)
                    )
                )
        )

        Column(modifier = Modifier.width(223.dp)) {
            Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
            Text(description, fontSize = 18.sp, color = UcTokens.Text, modifier = Modifier.padding(top = 8.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.padding(top = 18.dp),
            ) {
                Text(actionLabel.uppercase(), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = UcTokens.Text)
                Icon(painterResource("arrow-right"), contentDescription = null, modifier = Modifier.size(12.dp))
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
};
