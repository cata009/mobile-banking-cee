import { useState } from 'react'
import type { InsuranceModule } from '@/features/insurance/mobileFirstInsurance'
import {
  InsuranceAmount,
  InsuranceField,
  InsuranceLink,
  InsurancePage,
  insuranceDate,
} from './MobileFirstInsurancePrimitives'
import { INSURANCE_CIVIL_LIABILITY_DETAIL as detail } from './insuranceContent'

export default function MobileFirstInsuranceModule({
  module,
  onClose,
  onHelp,
}: {
  module: InsuranceModule
  onClose: () => void
  onHelp: () => void
}) {
  const [personIndex, setPersonIndex] = useState(0)
  const [coverageOpen, setCoverageOpen] = useState(false)
  const person = module.people?.[personIndex]
  if (coverageOpen)
    return (
      <InsurancePage title={detail.title} subtitle={`Modulo ${module.name}`} onClose={() => setCoverageOpen(false)}>
        <div className="mf-ins-coverage-details">
          <section>
            <h3>Cosa è assicurato</h3>
            <p>{detail.covered}</p>
          </section>
          <section>
            <h3>Principali esclusioni</h3>
            <p>{detail.excluded}</p>
          </section>
        </div>
      </InsurancePage>
    )
  return (
    <InsurancePage title={module.name} onClose={onClose} onHelp={onHelp}>
      <div className="mf-ins-field-grid">
        <InsuranceField label="Data decorrenza">{insuranceDate(module.start)}</InsuranceField>
        <InsuranceField label="Data scadenza">{insuranceDate(module.expiry)}</InsuranceField>
        <InsuranceField label="Importo del premio">
          <InsuranceAmount value={module.premium} />
        </InsuranceField>
      </div>
      <hr className="mf-ins-divider" />
      {module.addresses && (
        <InsuranceField label="Abitazioni assicurate">
          {module.addresses.map((address) => (
            <span key={address}>{address}</span>
          ))}
        </InsuranceField>
      )}
      {module.people && (
        <>
          <div className="mf-ins-person-tabs" role="tablist" aria-label="Assicurati">
            {module.people.map((insured, index) => (
              <button
                type="button"
                key={insured.name}
                role="tab"
                aria-selected={personIndex === index}
                onClick={() => setPersonIndex(index)}
              >
                Assicurato {index + 1}
              </button>
            ))}
          </div>
          <InsuranceField label="Cognome e nome">{person?.name}</InsuranceField>
        </>
      )}
      <div className="mf-ins-module-details">
        <InsuranceField label="Garanzie">
          {(person?.guarantees ?? module.guarantees).map((guarantee) =>
            guarantee === detail.title ? (
              <InsuranceLink key={guarantee} onClick={() => setCoverageOpen(true)}>
                {guarantee}
              </InsuranceLink>
            ) : (
              <span key={guarantee}>{guarantee}</span>
            ),
          )}
        </InsuranceField>
        {person?.beneficiary && <InsuranceField label="Beneficiario">{person.beneficiary}</InsuranceField>}
        {person?.contact && <InsuranceField label="Referente terzo">{person.contact}</InsuranceField>}
      </div>
    </InsurancePage>
  )
}
