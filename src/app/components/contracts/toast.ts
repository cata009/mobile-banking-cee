export type ToastMessageVariant='action-required'|'aware'|'google-pay'
const messages={'action-required':'Amount exceeds balance in your account',aware:'You have pending payments','google-pay':'Added to Google Pay'} as const
export function resolveToast({variant='action-required',message,dark}: {variant?:ToastMessageVariant;message?:string;dark?:boolean}) {
 const googlePay=variant==='google-pay'
 return {variant,googlePay,dark:dark??variant!=='action-required',label:message??messages[variant],width:googlePay?174:327,height:googlePay?35:32,radius:16,fontSize:14,showDot:!googlePay,dotSize:8,slotSize:32,gap:20} as const
}
