import { type ReactNode } from 'react'
import AccountBalanceCard from '@/app/components/accounts/AccountBalanceCard'
import NavigationRow from '@/app/components/NavigationRow'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import { AppIcon, type IconName } from '@/app/components/icons'
import { PreviewSafeTop } from '@/app/screens/flow-library/components/MiniPhone'
import { FLOW_DEMO } from '@/app/screens/flow-library/flows/demoData'
import type { RoundUpScreenKind } from '@/app/screens/flow-library/flows/types'
import {
  noop,
  Screen,
  Pills,
  Overlay,
  BottomCta,
  ExampleBox,
  AccountSelectField,
  DisplayField,
  SearchBar,
  QuickAction,
  SignStep,
  SuccessStep,
} from '@/flows/shared/previewPrimitives'
function HomeEntryPreview() {
  const { currentAccount, savingsAccount, homeCard } = FLOW_DEMO
  return (
    <Screen tone="app">
      <PreviewSafeTop background="var(--uc-app-bg)" />
      <div className="flex items-center justify-between px-[16px] pb-[10px]">
        <span className="inline-flex items-center gap-[6px] rounded-full bg-[var(--uc-static-black)] px-[12px] py-[5px] uc-type-n5-strong text-[var(--uc-static-white)]">
          Prime
        </span>
        <span className="flex gap-[14px]">
          <AppIcon name="header-profile" color="var(--uc-text)" />
          <AppIcon name="header-messages" color="var(--uc-text)" />
        </span>
      </div>
      <div className="flex-1 overflow-hidden px-[16px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">Your Homepage</h1>

        <div className="mt-[16px] overflow-hidden rounded-[8px] bg-[linear-gradient(120deg,var(--uc-teal-main),var(--uc-teal-blue))] p-[16px]">
          <p className="max-w-[180px] uc-type-n2-strong text-[var(--uc-static-white)]">Start saving with Round Up</p>
          <p className="mt-[6px] max-w-[190px] uc-type-n5 text-[var(--uc-static-white)] opacity-90">
            Round up your card payments and save the difference.
          </p>
        </div>
        <div className="mt-[10px] flex justify-center gap-[6px]">
          <span className="h-[6px] w-[18px] rounded-full bg-[var(--uc-action)]" />
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-[6px] w-[6px] rounded-full bg-[var(--uc-border)]" />
          ))}
        </div>

        <HomeSectionHeader title="Accounts" />
        <HomeProductRow
          icon="account-details"
          name={currentAccount.name}
          sub={currentAccount.iban}
          amount={`${currentAccount.balance} ${currentAccount.currency}`}
        />
        <HomeSectionHeader title="Cards" />
        <HomeProductRow icon="view-pin" name={homeCard.label} sub={homeCard.pan} amount={homeCard.balance} />
        <HomeSectionHeader title="Savings and term deposit" />
        <HomeProductRow
          icon="add-money"
          name={savingsAccount.name}
          sub={savingsAccount.iban}
          amount={`${savingsAccount.available} ${savingsAccount.currency}`}
        />
      </div>
    </Screen>
  )
}

function HomeSectionHeader({ title }: { title: string }) {
  return (
    <div className="mt-[18px] flex items-center justify-between">
      <p className="uc-type-h2 text-[var(--uc-text)]">{title}</p>
      <AppIcon name="chevron-down" color="var(--uc-text)" />
    </div>
  )
}

function HomeProductRow({ icon, name, sub, amount }: { icon: IconName; name: string; sub: string; amount: string }) {
  return (
    <div className="mt-[10px] rounded-[8px] bg-[var(--uc-surface)] p-[14px] shadow-sm">
      <div className="flex items-start gap-[12px]">
        <span className="flex size-[28px] shrink-0 items-center justify-center">
          <AppIcon name={icon} color="var(--uc-action)" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{name}</p>
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{sub}</p>
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">Account under favorable conditions</p>
        </div>
      </div>
      <p className="mt-[8px] text-right uc-type-n4-strong text-[var(--uc-text)]">{amount}</p>
    </div>
  )
}

const PRODUCT_TILES: Array<{ label: string; color: string }> = [
  { label: 'Accounts', color: 'var(--uc-product-blue-deep)' },
  { label: 'Cards', color: 'var(--uc-red-card)' },
  { label: 'Borrowing', color: 'var(--uc-product-mauve)' },
  { label: 'Saving and investing', color: 'var(--uc-product-blue)' },
]

function ProductsRoundUpPreview() {
  const items = ['Term deposit', 'Saving account', 'Round Up', 'Mutual funds']
  return (
    <Screen tone="app">
      <PreviewSafeTop />
      <div className="px-[16px] pt-[8px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">Products</h1>
        <div className="mt-[14px] flex gap-[24px] border-b border-[var(--uc-border)]">
          <span className="border-b-[3px] border-[var(--uc-action)] pb-[8px] uc-type-n4-strong text-[var(--uc-text)]">
            Banking
          </span>
          <span className="pb-[8px] uc-type-n4-strong text-[var(--uc-text-muted)]">ShopSmart</span>
        </div>
        <div className="mt-[16px] grid grid-cols-2 gap-[10px]">
          {PRODUCT_TILES.map((tile) => (
            <div key={tile.label} className="h-[84px] rounded-[8px] p-[12px]" style={{ backgroundColor: tile.color }}>
              <p className="uc-type-n5-strong text-[var(--uc-static-white)]">{tile.label}</p>
            </div>
          ))}
        </div>
      </div>
      <Overlay align="bottom">
        <div className="w-full rounded-t-[16px] bg-[var(--uc-surface)] px-[16px] pb-[8px] pt-[16px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.14)]">
          <div className="mb-[4px] flex items-center justify-between">
            <p className="uc-type-h2 text-[var(--uc-text)]">Saving and investing</p>
            <AppIcon name="close-x" color="var(--uc-text)" />
          </div>
          {items.map((item) => (
            <NavigationRow key={item} title={item} trailingAccessory="chevron" rowHeight={64} />
          ))}
        </div>
      </Overlay>
    </Screen>
  )
}

function RoundUpInfoPreview() {
  const { info } = FLOW_DEMO.roundUp
  return (
    <Screen>
      <PageHeader title="Round Up" onBack={noop} includeSafeArea showHelp={false} />
      <div className="flex-1 overflow-hidden px-[16px]">
        <div className="h-[128px] rounded-[8px] bg-[linear-gradient(135deg,var(--uc-peach-200),var(--uc-teal-soft))]" />
        <h2 className="mt-[16px] uc-type-n4-strong text-[var(--uc-text)]">{info.heading}</h2>
        <p className="mt-[8px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{info.body}</p>
        <ExampleBox>{info.example}</ExampleBox>
        <SectionHeadingDivider title="How it works" className="mt-[18px]" />
        <div className="mt-[10px] flex flex-col gap-[14px]">
          {info.steps.slice(0, 3).map((step, index) => (
            <div key={step.title} className="flex gap-[12px]">
              <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-[var(--uc-static-black)] uc-type-n5-strong text-[var(--uc-static-white)]">
                {index + 1}
              </span>
              <div>
                <p className="uc-type-n5-strong text-[var(--uc-text)]">{step.title}</p>
                <p className="uc-type-n5 leading-[18px] text-[var(--uc-text-muted)]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop}>Set up Round Up</PrimaryButton>
      </BottomCta>
    </Screen>
  )
}

function OpenSavingsPreview() {
  const intro = FLOW_DEMO.savingsAccountIntro
  return (
    <Screen>
      <PreviewSafeTop />
      <div className="flex items-center justify-between px-[16px] pt-[6px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">{intro.title}</h1>
        <AppIcon name="close-x" size={28} color="var(--uc-text)" />
      </div>
      <div className="flex-1 overflow-hidden px-[16px] pt-[12px]">
        <div className="h-[132px] rounded-[8px] bg-[linear-gradient(135deg,var(--uc-peach-100),var(--uc-product-mauve))]" />
        <p className="mt-[14px] uc-type-n5-strong text-[var(--uc-text)]">{intro.heading}</p>
        <p className="mt-[6px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">{intro.body}</p>
        <p className="mt-[12px] uc-type-n5-strong text-[var(--uc-text)]">Benefits</p>
        <ul className="mt-[6px] flex flex-col gap-[6px]">
          {intro.benefits.map((benefit) => (
            <li key={benefit} className="uc-type-n5 leading-[18px] text-[var(--uc-text-muted)]">
              • {benefit}
            </li>
          ))}
        </ul>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop}>Next</PrimaryButton>
      </BottomCta>
    </Screen>
  )
}

function SetupFormPreview() {
  const { currentAccount, savingsAccount, roundUp } = FLOW_DEMO
  const state = roundUp.setup.filled
  return (
    <Screen>
      <PageHeader title="Set up Round Up" onBack={noop} includeSafeArea />
      <div className="flex-1 overflow-hidden px-[16px]">
        <AccountSelectField
          label="Round up card payments from current account"
          iban={currentAccount.iban}
          name={currentAccount.name}
          balance={`${currentAccount.balance} ${currentAccount.currency}`}
        />
        <AccountSelectField
          label="Save the difference into"
          iban={savingsAccount.iban}
          name={savingsAccount.name}
          balance={`${savingsAccount.available} ${savingsAccount.currency}`}
        />
        <SectionHeadingDivider title="Saving options" className="mt-[18px]" />
        <p className="mt-[10px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">
          We'll round up each eligible card payment and transfer the saved amount to your savings account.
        </p>
        <p className="mt-[14px] uc-type-n4-strong text-[var(--uc-text)]">Round up to</p>
        <Pills options={roundUp.thresholdOptions} active={state.threshold} />
        <p className="mt-[16px] uc-type-n4-strong text-[var(--uc-text)]">Add an extra amount to each transfer</p>
        <Pills options={roundUp.boostOptions} active={state.boost} />
        <ExampleBox heading="Round up example">{state.example}</ExampleBox>
        <div className="mt-[14px]">
          <NavigationRow
            title="I have read and agree to the Round Up Terms and Conditions."
            trailingAccessory="toggle"
            toggleChecked={state.termsChecked}
            rowHeight={64}
          />
        </div>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop}>Activate Round Up</PrimaryButton>
      </BottomCta>
    </Screen>
  )
}

function AccountsActivePreview() {
  const { savingsAccount, roundUp } = FLOW_DEMO
  const [availableInteger = '0', availableDecimals = '00'] = savingsAccount.available.split(',')
  const actions: Array<{ icon: IconName; label: string }> = [
    { icon: 'account-details', label: 'Details' },
    { icon: 'account-options', label: 'Options' },
    { icon: 'add-money', label: 'Internal\ntransfer' },
  ]
  return (
    <Screen tone="app">
      <PageHeader title="Accounts" onBack={noop} includeSafeArea variant="gray" />
      <div className="flex-1 overflow-hidden">
        <div className="px-[16px]">
          <AccountBalanceCard
            account={{ accountName: savingsAccount.name, accountNumber: savingsAccount.iban, subAccount: '' }}
            availableInteger={`${availableInteger},`}
            availableDecimals={availableDecimals}
            currency={savingsAccount.currency}
            currentBalance=""
            productType="saving_account"
            showCopy
            showSubAccount={false}
          />
        </div>
        <div className="mt-[12px] flex items-start justify-around px-[16px]">
          {actions.map((action) => (
            <QuickAction key={action.label} icon={action.icon} label={action.label} />
          ))}
        </div>
        <div className="mt-[12px] bg-[var(--uc-surface)] px-[16px]">
          <NavigationRow
            title="Round Up"
            description="Save spare change automatically"
            leadingIconName="refresh"
            trailingAccessory="chevron"
            rowHeight={64}
          />
          <SearchBar />
          <SectionHeadingDivider title={roundUp.monthLabel} className="mt-[14px]" />
          {roundUp.transfers.map((transfer) => (
            <div
              key={transfer.day}
              className="flex min-h-[56px] items-center gap-[12px] border-b border-[var(--uc-border)]"
            >
              <span className="w-[34px] text-center uc-type-n5-strong text-[var(--uc-text)]">
                {transfer.day}
                <span className="block uc-type-p2 text-[var(--uc-text-muted)]">{transfer.month}</span>
              </span>
              <span className="grid size-[28px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-green-status)_18%,var(--uc-surface))]">
                <AppIcon name="refresh" size={16} color="var(--uc-green-status)" />
              </span>
              <span className="flex-1 uc-type-n5 text-[var(--uc-text)]">Transfer</span>
              <span className="uc-type-n5-strong text-[var(--uc-action)]">{transfer.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  )
}

function ManagePreview() {
  const { currentAccount, savingsAccount, roundUp } = FLOW_DEMO
  const state = roundUp.setup.empty
  return (
    <Screen>
      <PageHeader title="Manage Round Up" onBack={noop} includeSafeArea />
      <div className="flex-1 overflow-hidden px-[16px]">
        <DisplayField
          label="Round up card payments from current account"
          name={currentAccount.name}
          iban={currentAccount.iban}
        />
        <DisplayField label="Save the difference into" name={savingsAccount.name} iban={savingsAccount.iban} />
        <SectionHeadingDivider title="Saving options" className="mt-[18px]" />
        <p className="mt-[10px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">
          We'll round up each eligible card payment and transfer the saved amount to your savings account.
        </p>
        <p className="mt-[14px] uc-type-n4-strong text-[var(--uc-text)]">Round up to</p>
        <Pills options={roundUp.thresholdOptions} active={state.threshold} />
        <p className="mt-[16px] uc-type-n4-strong text-[var(--uc-text)]">Add an extra amount to each transfer</p>
        <Pills options={roundUp.boostOptions} active={state.boost} />
        <ExampleBox heading="Round up example">{state.example}</ExampleBox>
      </div>
      <div className="flex flex-col items-center gap-[10px] bg-[var(--uc-surface)] px-[24px] pb-[24px] pt-[12px]">
        <PrimaryButton onClick={noop} disabled>
          Save Changes
        </PrimaryButton>
        <span className="uc-type-n4-strong text-[var(--uc-action)]">Deactivate Round Up</span>
      </div>
    </Screen>
  )
}

function ConfirmDeactivatePreview() {
  return (
    <Screen>
      <ManagePreview />
      <Overlay align="bottom">
        <div className="m-[16px] w-full rounded-[12px] bg-[var(--uc-surface)] p-[16px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.14)]">
          <h2 className="text-center uc-type-n4-strong text-[var(--uc-text)]">Deactivate Round Up?</h2>
          <p className="mt-[8px] text-center uc-type-n5 text-[var(--uc-text-muted)]">
            You'll stop saving automatically when you pay by card.
          </p>
          <div className="mt-[14px] flex justify-between border-t border-[var(--uc-border)] pt-[12px] uc-type-n4-strong text-[var(--uc-action)]">
            <span>Cancel</span>
            <span>Deactivate</span>
          </div>
        </div>
      </Overlay>
    </Screen>
  )
}

export function renderRoundUpPreview(kind: RoundUpScreenKind): ReactNode {
  switch (kind) {
    case 'home-entry':
      return <HomeEntryPreview />
    case 'products-round-up':
      return <ProductsRoundUpPreview />
    case 'round-up-info':
      return <RoundUpInfoPreview />
    case 'open-savings':
      return <OpenSavingsPreview />
    case 'setup-form':
      return <SetupFormPreview />
    case 'sign':
      return <SignStep />
    case 'success-active':
      return (
        <SuccessStep
          title="Round Up is now active"
          body="You'll now save automatically every time you pay by card. The rounded-up difference will be transferred to your savings account."
        />
      )
    case 'accounts-active':
      return <AccountsActivePreview />
    case 'manage':
      return <ManagePreview />
    case 'confirm-deactivate':
      return <ConfirmDeactivatePreview />
    case 'success-deactivated':
      return (
        <SuccessStep
          title="Round Up has been deactivated"
          body="Your card payments will no longer be rounded up automatically. You can set up Round Up again anytime from your account settings."
        />
      )
    default:
      return null
  }
}
