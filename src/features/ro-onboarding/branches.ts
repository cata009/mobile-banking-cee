export const ONBOARDING_BRANCHES = [
  { id: 'branch-1', label: 'BRANCH ATM NAME 1', distance: '200m' },
  { id: 'branch-2', label: 'BRANCH ATM NAME 2', distance: '400m' },
  { id: 'branch-3', label: 'BRANCH ATM NAME 3', distance: '900m' },
  { id: 'branch-4', label: 'BRANCH ATM NAME 4', distance: '2km' },
  { id: 'branch-5', label: 'BRANCH ATM NAME 5', distance: '12km' },
  { id: 'branch-6', label: 'BRANCH ATM NAME 6', distance: '14km' },
] as const
export function searchOnboardingBranches(query: string) {
  const needle = query.trim().toLocaleLowerCase()
  return ONBOARDING_BRANCHES.filter(
    (branch) => !needle || `${branch.label} Bucuresti Bulevardul Expozitiei`.toLocaleLowerCase().includes(needle),
  )
}
