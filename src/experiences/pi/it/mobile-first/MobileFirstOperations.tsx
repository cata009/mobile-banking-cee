import { useId } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import help from '@/assets/mobile-first/it/operations/help.svg'
import {
  MOBILE_FIRST_OPERATION_QUICK_ACTIONS as quickActions,
  MOBILE_FIRST_OPERATION_GROUPS as groups,
} from './operationsContent'
import './mobile-first.css'
import './mobile-first-operations.css'

export interface MobileFirstOperationsProps {
  onClose: () => void
  onSelect: (label: string) => void
}

export default function MobileFirstOperations({ onClose, onSelect }: MobileFirstOperationsProps) {
  const groupId = useId()
  return (
    <div className="mf-home mf-operations-host">
      <BottomSheet
        title="Operazioni"
        onClose={onClose}
        closeLabel="Chiudi"
        fillHeight
        maxHeightOffsetPx={70}
        showCloseButton={false}
        showDragHandle
        animated
        className="mf-operations-sheet"
        titleClassName="mf-operations-title"
        headerClassName="mf-operations-heading"
        bodyClassName="mf-operations-body"
        meta={
          <button
            type="button"
            className="mf-operations-help"
            aria-label="Assistenza"
            onClick={() => onSelect('Assistenza')}
          >
            <img src={help} alt="" width={40} height={40} />
          </button>
        }
      >
        <div className="mf-operations-quick-actions" aria-label="Operazioni rapide">
          {quickActions.map(({ label, lines, icon }) => (
            <button
              type="button"
              key={label}
              className="mf-operations-quick-action"
              aria-label={label}
              onClick={() => onSelect(label)}
            >
              <span className="mf-operations-quick-icon">
                <img src={icon} alt="" width={24} height={24} />
              </span>
              <span className="mf-operations-quick-label">
                {lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            </button>
          ))}
        </div>
        <div className="mf-operations-groups">
          {groups.map(({ title, rows }, index) => (
            <section key={title} className="mf-operations-group" aria-labelledby={`${groupId}-${index}`}>
              <h2
                id={`${groupId}-${index}`}
                className={
                  title === 'Ricariche'
                    ? 'mf-operations-group-title mf-operations-group-title-small'
                    : 'mf-operations-group-title'
                }
              >
                {title}
              </h2>
              <div className="mf-operations-rows">
                {rows.map(({ label, icon }) => (
                  <button type="button" key={label} className="mf-operations-row" onClick={() => onSelect(label)}>
                    <img src={icon} alt="" width={24} height={24} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
