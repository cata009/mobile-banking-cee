import {resolveBanner} from './banner'
const rootClasses={
 helper:'relative flex w-[343px] max-w-full items-center gap-[8px] rounded-[4px] bg-[var(--uc-action)] p-[16px]',
 ghost:'flex w-[327px] max-w-full flex-col gap-[10px] rounded-[8px] border border-dashed border-[var(--uc-text)] bg-transparent p-[16px]',
 info:'flex w-[327px] max-w-full items-start gap-[8px] rounded-[8px] border border-solid border-[var(--uc-text)] bg-transparent p-[16px]',
 pending:'flex h-[157px] w-[327px] max-w-full flex-col gap-[8px] overflow-hidden rounded-[8px] p-[24px] text-left',
 'user-event':'flex w-[343px] max-w-full gap-[8px] rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
} as const
export function bannerWeb(options:Parameters<typeof resolveBanner>[0]){return {...resolveBanner(options),rootClass:rootClasses[options.variant]} as const}
