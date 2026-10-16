export type PaymentHeroPreset='payments-1'|'payments-2'|'payments-3'|'payments-4'|'payments-5'|'payments-6'|'payments-7'|'payments-8'|'payments-9'
const images={
 'payments-1':{bottom:0,right:0,height:104,width:126},'payments-2':{bottom:0,right:0,height:92,width:137},'payments-3':{bottom:0,right:0,height:104,width:96},'payments-4':{bottom:0,right:0,height:104,width:100},'payments-5':{bottom:0,right:8,height:104,width:70},'payments-6':{bottom:0,right:0,height:96,width:137},'payments-7':{bottom:0,right:0,height:104,width:104},'payments-8':{bottom:0,right:0,height:104,width:86},'payments-9':{bottom:0,right:0,height:104,width:118},
} as const
export function resolvePaymentHero({title,imageVariant,disabled=false}: {title:string;imageVariant?:PaymentHeroPreset;disabled?:boolean}) {
 const multiline=title.includes('\n')
 return {height:120,radius:8,paddingHorizontal:20,paddingTop:16,titleFontSize:24,titleLineHeight:multiline?26:'normal',descriptionFontSize:14,descriptionMargin:multiline?8:16,disabled,opacity:disabled?.55:1,image:imageVariant?images[imageVariant]:{bottom:0,right:0,height:'100%',width:120}} as const
}
