import { Suspense } from "react"
import AccountDetailsContent from "./account-details-content"

export default function AccountDetailsPage() {
  return (
    <Suspense fallback={null}>
      <AccountDetailsContent />
    </Suspense>
  )
}
