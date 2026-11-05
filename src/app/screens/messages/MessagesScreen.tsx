import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'
import AccountSearchBar from '@/app/components/accounts/AccountSearchBar'
import {
  DeleteActionReveal,
  MoreActionsButton,
  deleteRevealContentClass,
} from '@/app/components/messages/DeleteActionReveal'
import MessagesMailboxTabs from '@/app/components/messages/MessagesMailboxTabs'
import PageHeader from '@/app/components/PageHeader'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useCountry } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'
import { getMessagesConfigForCountry, type MessageListItem, type MessageMailbox } from '@/app/config/messagesConfig'

interface MessagesScreenProps {
  onBack: () => void
}

function MessagesSectionTitle({ children }: { children: string }) {
  return (
    <div className="mx-[24px] border-b border-[var(--uc-border-muted)] pb-[5px]">
      <h2 className="uc-type-h2 text-[var(--uc-text)]">{children}</h2>
    </div>
  )
}

interface MessageListRowProps {
  message: MessageListItem
  actionsOpen: boolean
  onToggleActions: () => void
  onDelete: () => void
}

function MessageListRow({ message, actionsOpen, onToggleActions, onDelete }: MessageListRowProps) {
  const { t } = useLanguage()
  const contentId = `message-content-${message.id}`
  return (
    <DeleteActionReveal
      data-message-row={message.id}
      actionsOpen={actionsOpen}
      deleteLabel={`${t('runtime.messages.deleteMessage', 'Delete message')} ${message.title}`}
      deleteText={t('runtime.messages.deleteAction', 'DELETE')}
      contentId={contentId}
      onDelete={onDelete}
    >
      <div
        id={contentId}
        data-message-content
        className={deleteRevealContentClass(
          actionsOpen,
          'grid grid-cols-[32px_1fr_48px_32px] items-center gap-[2px] px-[18px]',
        )}
      >
        <div className="text-center">
          <p className="uc-type-h2 leading-[20px] text-[var(--uc-text)]">{message.day}</p>
          <p className="uc-type-n5-strong leading-[16px] text-[var(--uc-text-muted)]">{message.month}</p>
        </div>
        <div className="min-w-0 pl-[6px]">
          <p className="uc-type-n4-strong truncate leading-[20px] text-[var(--uc-text)]">{message.title}</p>
          <p className="uc-type-n4 truncate leading-[22px] text-[var(--uc-text-muted)]">{message.description}</p>
        </div>
        {message.badge ? (
          <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
            {message.badge}
          </span>
        ) : (
          <span />
        )}
        <MoreActionsButton
          label={`${t('runtime.messages.messageActions', 'Message actions')} ${message.title}`}
          actionsOpen={actionsOpen}
          contentId={contentId}
          onToggle={onToggleActions}
        />
      </div>
    </DeleteActionReveal>
  )
}

export default function MessagesScreen({ onBack }: MessagesScreenProps) {
  const country = useCountry()
  const { t } = useLanguage()
  const config = getMessagesConfigForCountry(country)
  const screenRef = useRef<HTMLDivElement | null>(null)
  const [activeMailbox, setActiveMailbox] = useState<MessageMailbox>('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [openMessageId, setOpenMessageId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ country: CountryId; message: MessageListItem } | null>(null)
  const [deletedMessageIdsByCountry, setDeletedMessageIdsByCountry] = useState<
    Partial<Record<CountryId, ReadonlySet<string>>>
  >({})
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64)
  const messages = activeMailbox === 'inbox' ? config.inbox : config.outbox
  const deletedMessageIds = deletedMessageIdsByCountry[country]
  const mailboxTabs = [
    { id: 'inbox' as MessageMailbox, label: t('runtime.messages.inbox', config.tabs.inbox), hasNewItems: true },
    { id: 'outbox' as MessageMailbox, label: t('runtime.messages.outbox', config.tabs.outbox) },
  ] as const
  const localizeMessage = useCallback(
    (message: MessageListItem): MessageListItem => {
      const keyBase = `runtime.messages.rows.${message.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`
      return {
        ...message,
        title: t(`${keyBase}.title`, message.title),
        description: t(`${keyBase}.description`, message.description),
        badge: message.badge ? t('runtime.messages.newBadge', message.badge) : message.badge,
      }
    },
    [t],
  )

  const filteredMessages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const localizedMessages = messages.filter((message) => !deletedMessageIds?.has(message.id)).map(localizeMessage)
    if (!normalizedQuery) return localizedMessages

    return localizedMessages.filter((message) =>
      [message.day, message.month, message.title, message.description, message.badge ?? '', config.sectionTitle]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [config.sectionTitle, deletedMessageIds, messages, searchQuery, localizeMessage])

  const handleConfirmDelete = () => {
    if (!pendingDelete) return
    setDeletedMessageIdsByCountry((current) => {
      const deletedIds = new Set(current[pendingDelete.country] ?? [])
      deletedIds.add(pendingDelete.message.id)
      return { ...current, [pendingDelete.country]: deletedIds }
    })
    setPendingDelete(null)
    setOpenMessageId(null)
  }

  return (
    <div
      ref={screenRef}
      className="relative h-full w-full overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
    >
      <div className="relative h-full w-full overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={t('runtime.messages.title', config.title)}
          onBack={onBack}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
        />
        <div
          className="sticky z-20 bg-[var(--uc-surface)]"
          style={{ top: 'calc(var(--uc-phone-top-reserve, 54px) + 48px)' }}
        >
          <MessagesMailboxTabs
            tabs={mailboxTabs}
            activeTabId={activeMailbox}
            onChange={(tabId) => {
              setActiveMailbox(tabId as MessageMailbox)
              setOpenMessageId(null)
            }}
          />
          <div data-messages-search-container className="px-[16px] pt-[16px] pb-[16px]">
            <AccountSearchBar value={searchQuery} onValueChange={setSearchQuery} />
          </div>
        </div>
        <MessagesSectionTitle>{t('runtime.messages.sectionTitle', config.sectionTitle)}</MessagesSectionTitle>
        <div className="pt-[20px] pb-[24px]">
          {filteredMessages.map((message) => (
            <MessageListRow
              key={message.id}
              message={message}
              actionsOpen={openMessageId === message.id}
              onToggleActions={() => setOpenMessageId((current) => (current === message.id ? null : message.id))}
              onDelete={() => setPendingDelete({ country, message })}
            />
          ))}
        </div>
      </div>
      <AlertDialog.Root
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setOpenMessageId(null)
          }
        }}
      >
        <AlertDialog.Portal container={screenRef.current ?? undefined}>
          <AlertDialog.Overlay className="absolute inset-0 z-50 bg-black/40" />
          <AlertDialog.Content className="absolute left-1/2 top-1/2 z-[51] w-[calc(100%-32px)] max-w-[320px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[16px] border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_16px_40px_rgb(var(--uc-shadow-rgb)/0.2)]">
            <div className="px-[20px] pb-[18px] pt-[20px] text-center">
              <AlertDialog.Title className="text-[17px] font-semibold leading-[22px]">
                {t('runtime.messages.deleteDialog.title', 'Delete message?')}
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-[8px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">
                {t('runtime.messages.deleteDialog.body', 'Are you sure you want to delete this message?')}
              </AlertDialog.Description>
            </div>
            <div className="h-px bg-[var(--uc-border)]" />
            <div className="flex">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="h-[48px] flex-1 text-[16px] font-medium text-[var(--uc-action)] transition-colors hover:bg-[var(--uc-border-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
                >
                  {t('runtime.dialogs.cancel', 'Cancel')}
                </button>
              </AlertDialog.Cancel>
              <div className="w-px bg-[var(--uc-border)]" />
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-[48px] flex-1 text-[16px] font-semibold text-[var(--uc-action)] transition-colors hover:bg-[var(--uc-border-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
                >
                  {t('runtime.messages.deleteDialog.confirm', 'Delete')}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
