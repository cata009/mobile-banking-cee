// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {afterEach,describe,expect,it,vi} from 'vitest'
import Helper from '@/app/components/cards/HelperCard'
import Ghost from '@/app/components/cards/GhostBanner'
import Info from '@/app/components/cards/InfoBanner'
import Pending from '@/app/components/cards/PendingActionCard'
import UserEvent from '@/app/components/cards/UserEventCard'
import CardComponent from '@/app/components/cards/CardComponent'
import Hero from '@/app/components/payments/PaymentHeroCard'
import Discover from '@/app/components/payments/NewPaymentDiscoverBanner'
import Pill from '@/app/components/ui/Pill'
import Sorting from '@/app/components/ui/PillSorting'
import Toast from '@/app/components/ui/ToastMessage'
import BeforeHelper from '../fixtures/baseline-gallery-before/HelperCard'
import BeforeGhost from '../fixtures/baseline-gallery-before/GhostBanner'
import BeforeInfo from '../fixtures/baseline-gallery-before/InfoBanner'
import BeforePending from '../fixtures/baseline-gallery-before/PendingActionCard'
import BeforeUser from '../fixtures/baseline-gallery-before/UserEventCard'
import BeforeCard from '../fixtures/baseline-gallery-before/CardComponent'
import BeforeHero from '../fixtures/baseline-gallery-before/PaymentHeroCard'
import BeforeDiscover from '../fixtures/baseline-gallery-before/NewPaymentDiscoverBanner'
import BeforePill from '../fixtures/baseline-gallery-before/Pill'
import BeforeSorting from '../fixtures/baseline-gallery-before/PillSorting'
import BeforeToast from '../fixtures/baseline-gallery-before/ToastMessage'
import type {PaymentHeroItem} from '@/app/config/paymentsMenuConfig'

afterEach(cleanup)
const html=(container:HTMLElement)=>{
 let markup=container.innerHTML.replace(/:[A-Za-z0-9]+:/g,':generated:')
 const ids=new Map<string,string>()
 for(const match of markup.matchAll(/\bid="([^"]+)"/g)){
  const resourceId=match[1]
  if(resourceId && !ids.has(resourceId))ids.set(resourceId,`resource-${ids.size}`)
 }
 for(const [id,replacement] of ids)markup=markup.split(`id="${id}"`).join(`id="${replacement}"`).split(`#${id}`).join(`#${replacement}`)
 return markup.replace(/\s+/g,' ')
}
describe('gallery/auxiliary frozen DOM and event preservation',()=>{
 it.each([false,true])('keeps helper dismissal external dismissible=%s',dismissible=>{
  const onClose=vi.fn(),onActionClick=vi.fn(),props={title:'Title',description:'Body\nline',actionLabel:'DETAILS',onActionClick,dismissible,onClose,className:'custom',style:{width:240}}
  const {container,rerender}=render(<BeforeHelper {...props}/>)
  // Approved Helpers source gap0 only; retain every other frozen DOM assertion.
  screen.getByText(props.title).parentElement!.classList.replace('gap-[4px]','gap-[0px]')
  const before=html(container);rerender(<Helper {...props}/>);expect(html(container)).toBe(before)
  fireEvent.click(screen.getByRole('button',{name:'DETAILS'}));expect(onActionClick).toHaveBeenCalledOnce()
  if(dismissible){fireEvent.click(screen.getByRole('button',{name:'Close'}));expect(onClose).toHaveBeenCalledOnce();expect(screen.getByText('Title')).toBeInTheDocument()}
 })
 for(const layout of ['horizontal','stacked'] as const)it.each([false,true])(`preserves Ghost ${layout} interactive=%s`,interactive=>{
  const onClick=interactive?vi.fn():undefined,props={title:'Placeholder',description:'Body',layout,onClick,ariaLabel:'Open',titleClassName:'custom-title',descriptionClassName:'custom-body'}
  const {container,rerender}=render(<BeforeGhost {...props}/>);const before=html(container);rerender(<Ghost {...props}/>);expect(html(container)).toBe(before)
  if(onClick){fireEvent.click(screen.getByRole('button',{name:'Open'}));expect(onClick).toHaveBeenCalledOnce()}
 })
 it('preserves Info inline-action ownership and icon override',()=>{
  const onActionClick=vi.fn(),props={title:'Information',description:'Body',actionLabel:'EDIT',actionIconName:'edit-pencil' as const,actionIconSize:24,onActionClick}
  const {container,rerender}=render(<BeforeInfo {...props}/>);const before=html(container);rerender(<Info {...props}/>);expect(html(container)).toBe(before)
  fireEvent.click(screen.getByRole('button',{name:'EDIT'}));expect(onActionClick).toHaveBeenCalledOnce()
 })
 it.each([false,true])('preserves Pending static/button mode=%s',interactive=>{
  const onClick=interactive?vi.fn():undefined,props={title:'Pending',description:'Body',tagLabel:'EXPIRES',onClick,style:{background:'red',height:180}}
  const {container,rerender}=render(<BeforePending {...props}/>);const before=html(container);rerender(<Pending {...props}/>);expect(html(container)).toBe(before)
  if(onClick){fireEvent.click(screen.getByRole('button',{name:'Pending'}));expect(onClick).toHaveBeenCalledOnce()}
 })
 it.each([false,true])('preserves UserEvent action/options/custom icon %s',full=>{
  const onActionClick=vi.fn(),onOptionsClick=vi.fn(),props={title:'Event',description:'Body',actionLabel:full?'DETAILS':undefined,onActionClick,showOptions:full,onOptionsClick,iconNode:<svg data-original-art/>,optionsAriaLabel:'Options'}
  const {container,rerender}=render(<BeforeUser {...props}/>);const before=html(container);rerender(<UserEvent {...props}/>);expect(html(container)).toBe(before)
  if(full){fireEvent.click(screen.getByRole('button',{name:'DETAILS'}));fireEvent.click(screen.getByRole('button',{name:'Options'}));expect(onActionClick).toHaveBeenCalledOnce();expect(onOptionsClick).toHaveBeenCalledOnce()}
 })
 it('keeps CardComponent shared artwork/default identity and forwarded attributes',()=>{
  const props={cardHolderName:'Custom Holder',cardNumber:'1234 **** 5678',className:'custom',style:{width:240},'aria-label':'Card specimen'}
  const {container,rerender}=render(<BeforeCard {...props}/>);const before=html(container);rerender(<CardComponent {...props}/>);expect(html(container)).toBe(before)
 })
 it.each([false,true])('preserves hero disabled=%s image overrides and exact payload',disabled=>{
  const onSelect=vi.fn(),item:PaymentHeroItem={id:'new-payment',title:'Make\npayment',description:'Description',illustration:'wallet',imageVariant:'payments-5'}
  const props={item,disabled,disabledReason:'Unavailable',onSelect,imageSrc:'/original-photo.png'}
  const {container,rerender}=render(<BeforeHero {...props}/>);const before=html(container);rerender(<Hero {...props}/>);expect(html(container)).toBe(before)
  fireEvent.click(screen.getByRole('button'));expect(onSelect.mock.calls).toEqual(disabled?[]:[[item]])
 })
 it('keeps discovery internal dismissal and close glyph size',()=>{
  const {container,rerender}=render(<BeforeDiscover title="Discover" description="Body"/>);const before=html(container);rerender(<Discover title="Discover" description="Body"/>);expect(html(container)).toBe(before)
  const close=screen.getByRole('button',{name:'Dismiss payment help'});expect(close.querySelector('svg')).toHaveAttribute('width','32');fireEvent.click(close);expect(container).toBeEmptyDOMElement()
 })
 it.each(['primary','secondary','active-counter','loading-counter','activated'] as const)('preserves pill %s state and native button semantics',variant=>{
  const onClick=vi.fn(),props={variant,onClick,counterText:'3 From 30 Eur',className:'custom'}
  const {container,rerender}=render(<BeforePill {...props}/>);const before=html(container);rerender(<Pill {...props}/>);expect(html(container)).toBe(before)
  fireEvent.click(screen.getByRole('button'));expect(onClick).toHaveBeenCalledTimes(variant==='loading-counter'?0:1)
 })
 it('keeps sorting controlled and emits original value without selection mutation',()=>{
  const onChange=vi.fn(),props={selectedValue:'max-percent' as const,onChange}
  const {container,rerender}=render(<BeforeSorting {...props}/>);const before=html(container);rerender(<Sorting {...props}/>);expect(html(container)).toBe(before)
  fireEvent.click(screen.getByRole('button',{name:'MIN VALUE'}));expect(onChange).toHaveBeenCalledExactlyOnceWith('min-value');expect(screen.getByRole('button',{name:'MAX %'})).toHaveAttribute('aria-pressed','true')
 })
 for(const variant of ['action-required','aware','google-pay'] as const)it.each([undefined,false,true])(`preserves Toast ${variant} dark=%s`,dark=>{
  const props={variant,dark,message:'Custom message',role:'alert','aria-live':'assertive' as const,className:'custom'}
  const {container,rerender}=render(<BeforeToast {...props}/>);const before=html(container);rerender(<Toast {...props}/>);expect(html(container)).toBe(before)
 })
})
