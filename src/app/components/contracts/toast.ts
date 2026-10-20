export type ToastMessageVariant='action-required'|'aware'|'google-pay'
/** Original page-8 source shared by the web and React Native renderers. */
export const TOAST_MESSAGE_SOURCE = {
 schema: 'codex-figma-component-spec/v1',
 figmaComponentName: 'Toast message',
 sourceNodeId: '178:15386',
 sourceNodeIds: {
  awareDark: '297:18333',
  googlePayDark: '297:18334',
  actionRequiredLight: '303:23659',
 },
 width: { default: 327, googlePay: 174 },
 height: { default: 32, googlePay: 35 },
 cornerRadius: 16,
} as const
const messages={'action-required':'Amount exceeds balance in your account',aware:'You have pending payments','google-pay':'Added to Google Pay'} as const
export function resolveToast({variant='action-required',message,dark}: {variant?:ToastMessageVariant;message?:string;dark?:boolean}) {
 const googlePay=variant==='google-pay'
 return {variant,googlePay,dark:dark??variant!=='action-required',label:message??messages[variant],width:googlePay?TOAST_MESSAGE_SOURCE.width.googlePay:TOAST_MESSAGE_SOURCE.width.default,height:googlePay?TOAST_MESSAGE_SOURCE.height.googlePay:TOAST_MESSAGE_SOURCE.height.default,radius:TOAST_MESSAGE_SOURCE.cornerRadius,fontSize:14,showDot:!googlePay,dotSize:8,slotSize:32,gap:20} as const
}
