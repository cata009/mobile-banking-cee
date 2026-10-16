import {describe,expect,it} from 'vitest'
import {resolveBanner} from '@/app/components/contracts/banner'
import {resolvePaymentHero} from '@/app/components/contracts/paymentHero'
import {PAYMENT_DISCOVER_CONTRACT} from '@/app/components/contracts/paymentDiscover'
import {CARD_COMPONENT_CONTRACT} from '@/app/components/contracts/cardComponent'
import {resolvePill,SORTING_OPTIONS} from '@/app/components/contracts/pill'
import {resolveToast} from '@/app/components/contracts/toast'
describe('gallery and auxiliary contracts',()=>{
 it('keeps helper/discover geometry, close glyph and dismissal owners distinct',()=>{
  expect(resolveBanner({variant:'helper',dismissible:true})).toMatchObject({width:343,gap:8,align:'center',height:undefined,closeGlyph:12,dismissMode:'external'})
  expect(PAYMENT_DISCOVER_CONTRACT).toMatchObject({gap:14,slotSize:32,closeGlyph:32,dismissMode:'internal',align:'start'})
  expect(resolveBanner({variant:'ghost',interactive:true,layout:'stacked'})).toMatchObject({width:327,height:undefined,rootTag:'button',titleFontSize:12})
  expect(resolveBanner({variant:'pending'})).toMatchObject({height:157,width:327,titleFontSize:24})
 })
 it('keeps nine hero image positions, disabled state and multiline spacing',()=>{
  expect(resolvePaymentHero({title:'Bill\npayments',imageVariant:'payments-3',disabled:true})).toMatchObject({height:120,titleLineHeight:26,descriptionMargin:8,opacity:.55,image:{bottom:0,right:0,height:104,width:96}})
  expect(resolvePaymentHero({title:'Payment',imageVariant:'payments-5'})).toMatchObject({titleLineHeight:'normal',descriptionMargin:16,image:{right:8,width:70}})
 })
 it('keeps DS CardComponent dimensions as metadata and actual art slots separately',()=>{
  expect(CARD_COMPONENT_CONTRACT).toMatchObject({specimenWidth:375,specimenHeight:448,fixedHeight:undefined,slotWidth:219,slotHeight:138,slotRadius:5.67,gap:24,paddingLeft:1})
 })
 it('preserves pill labels, loading disability and controlled sorting order',()=>{
  expect(resolvePill({variant:'loading-counter'})).toMatchObject({label:'Activate',disabled:true,busy:true,width:120,height:36})
  expect(resolvePill({variant:'activated'}).label).toBe('Activated')
  expect(resolvePill({variant:'active-counter',counterText:'3 From 30 Eur'}).label).toBe('3 From 30 Eur')
  expect(SORTING_OPTIONS.map(option=>option.value)).toEqual(['max-value','min-value','max-percent','min-percent'])
 })
 it('keeps toast mode darkness independent of global theme',()=>{
  expect(resolveToast({variant:'aware'})).toMatchObject({dark:true,width:327,height:32})
  expect(resolveToast({variant:'google-pay',dark:false})).toMatchObject({dark:false,width:174,height:35,showDot:false,label:'Added to Google Pay'})
 })
})
