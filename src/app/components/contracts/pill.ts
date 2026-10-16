export type PillVariant='primary'|'secondary'|'active-counter'|'loading-counter'|'activated'
export type PillSortingValue='max-value'|'min-value'|'max-percent'|'min-percent'
export const PILL_SUCCESS_PATH='M4.5 8.1 6.7 10.3 11.5 5.5'
export const SORTING_OPTIONS=[{value:'max-value',label:'MAX VALUE'},{value:'min-value',label:'MIN VALUE'},{value:'max-percent',label:'MAX %'},{value:'min-percent',label:'MIN %'}] as const
export const PILL_SORTING_CONTRACT={width:375,height:40,gap:8,chipHeight:24,chipRadius:14.5,paddingHorizontal:8,paddingVertical:4,fontSize:14,lineHeight:14} as const
export function resolvePill({variant='primary',label,counterText='0 From 30 Eur',disabled=false}: {variant?:PillVariant;label?:string;counterText?:string;disabled?:boolean}) {
 const primary=variant==='primary',loading=variant==='loading-counter',activated=variant==='activated'
 return {variant,primary,loading,activated,label:label??(variant==='secondary'?'Secondary':loading?'Activate':activated?'Activated':primary?'Primary':counterText),disabled:Boolean(disabled)||loading,busy:loading||undefined,width:120,height:36,radius:18,paddingHorizontal:8,paddingVertical:10,fontSize:14,iconSize:16,spinnerDuration:1000,backgroundToken:primary?'--uc-action-strong':'--uc-surface',textToken:primary?'--uc-static-white':variant==='secondary'?'--uc-action':'--uc-text'} as const
}
