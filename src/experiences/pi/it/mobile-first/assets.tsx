import imgNavigationAndActionBackK10 from '@/assets/mobile-first/it/imgNavigationAndActionBackK10.svg'
import hideAmounts from '@/assets/mobile-first/it/hide-amounts.svg'
import accountChevron from '@/assets/mobile-first/it/account-chevron.svg'
import imgNavigationAndActionBackK4 from '@/assets/mobile-first/it/imgNavigationAndActionBackK4.svg'
import imgNavigationAndActionForthK10 from '@/assets/mobile-first/it/imgNavigationAndActionForthK10.svg'
import imgGroup from '@/assets/mobile-first/it/imgGroup.svg'
import imgGroup1 from '@/assets/mobile-first/it/imgGroup1.svg'
import imgModeLight from '@/assets/mobile-first/it/imgModeLight.svg'
import imgVector from '@/assets/mobile-first/it/imgVector.svg'
import imgVector1 from '@/assets/mobile-first/it/imgVector1.svg'
import imgVector2 from '@/assets/mobile-first/it/imgVector2.svg'
import imgVector3 from '@/assets/mobile-first/it/imgVector3.svg'
import imgVector4 from '@/assets/mobile-first/it/imgVector4.svg'
import imgVector5 from '@/assets/mobile-first/it/imgVector5.svg'
import imgVector6 from '@/assets/mobile-first/it/imgVector6.svg'
import imgVector7 from '@/assets/mobile-first/it/imgVector7.svg'
import imgVector8 from '@/assets/mobile-first/it/imgVector8.svg'
import imgVector9 from '@/assets/mobile-first/it/imgVector9.svg'
import imgVector10 from '@/assets/mobile-first/it/imgVector10.svg'
import imgVector11 from '@/assets/mobile-first/it/imgVector11.svg'
import imgVector12 from '@/assets/mobile-first/it/imgVector12.svg'
import imgVector13 from '@/assets/mobile-first/it/imgVector13.svg'
import imgVector14 from '@/assets/mobile-first/it/imgVector14.svg'
import imgVector15 from '@/assets/mobile-first/it/imgVector15.svg'
import imgImage from '@/assets/mobile-first/it/imgImage.png'
import imgLogo from '@/assets/mobile-first/it/imgLogo.png'
import imgImage1 from '@/assets/mobile-first/it/imgImage1.png'
import imgImage2 from '@/assets/mobile-first/it/imgImage2.png'
import imgImage3 from '@/assets/mobile-first/it/imgImage3.png'
import imgImage4 from '@/assets/mobile-first/it/imgImage4.png'
import imgImg2 from '@/assets/mobile-first/it/imgImg2.png'
import imgNavigationAndActionForthK11 from '@/assets/mobile-first/it/imgNavigationAndActionForthK11.svg'
import imgAvatar from '@/assets/mobile-first/it/imgAvatar.png'
import imgB from '@/assets/mobile-first/it/imgB.svg'
import imgB1 from '@/assets/mobile-first/it/imgB1.svg'
import imgB2 from '@/assets/mobile-first/it/imgB2.svg'
import imgB3 from '@/assets/mobile-first/it/imgB3.svg'
import imgB4 from '@/assets/mobile-first/it/imgB4.svg'
import imgB5 from '@/assets/mobile-first/it/imgB5.svg'
import imgLogo1 from '@/assets/mobile-first/it/imgLogo1.svg'
import searchAssistant from '@/assets/mobile-first/it/search-assistant.svg'
import imgBankProductAndServicePfmK10 from '@/assets/mobile-first/it/imgBankProductAndServicePfmK10.svg'
import imgNavigationAndActionShowK10 from '@/assets/mobile-first/it/imgNavigationAndActionShowK10.svg'
import imgEllipse31 from '@/assets/mobile-first/it/imgEllipse31.svg'
import imgEllipse29 from '@/assets/mobile-first/it/imgEllipse29.svg'
import imgHomeBankingAndPaymentsTransferK10 from '@/assets/mobile-first/it/imgHomeBankingAndPaymentsTransferK10.svg'
import imgNavigationAndActionSettingsK10 from '@/assets/mobile-first/it/imgNavigationAndActionSettingsK10.svg'
import imgHomeBankingAndPaymentsFastPaymentsK10 from '@/assets/mobile-first/it/imgHomeBankingAndPaymentsFastPaymentsK10.svg'
import imgNavigationAndActionShareK10 from '@/assets/mobile-first/it/imgNavigationAndActionShareK10.svg'
import imgNavigationAndActionForthT2 from '@/assets/mobile-first/it/imgNavigationAndActionForthT2.svg'
import type { CSSProperties } from 'react'

export const mobileFirstAssets = {
  back: imgNavigationAndActionBackK10,
  backDisabled: imgNavigationAndActionBackK4,
  forth: imgNavigationAndActionForthK10,
  accountChevron,
  forwardSmall: imgNavigationAndActionForthK11,
  forwardTeal: imgNavigationAndActionForthT2,
  help: searchAssistant,
  analytics: imgBankProductAndServicePfmK10,
  show: imgNavigationAndActionShowK10,
  hide: hideAmounts,
  avatar: imgAvatar,
  notification: imgEllipse31,
  selected: imgEllipse29,
  transfer: imgHomeBankingAndPaymentsTransferK10,
  settings: imgNavigationAndActionSettingsK10,
  frequent: imgHomeBankingAndPaymentsFastPaymentsK10,
  share: imgNavigationAndActionShareK10,
  products: [imgImage, imgImage1, imgImage2, imgImage3, imgImage4],
  appLogo: imgLogo,
  partner: imgImg2,
  googlePay: imgModeLight,
}

export function BrandToggle({
  onClick,
  preferredProfile = 'UniCredit',
}: {
  onClick: () => void
  preferredProfile?: 'UniCredit' | 'buddy'
}) {
  return (
    <button
      type="button"
      aria-label="UniCredit e buddy"
      onClick={onClick}
      className="mf-brand-toggle"
      data-active-profile={preferredProfile}
    >
      <div className="h-[34px] relative shrink-0 w-[78px]" data-node-id="23045:83042" data-name="Toggle UCI">
        <div
          className="absolute bg-[var(--neutral\/k2,#e5e5e5)] inset-0 rounded-[20px]"
          data-node-id="I23045:83042;585:6264"
        />
        {preferredProfile === 'buddy' && (
          <div className="absolute h-[30px] right-[2px] top-[2px] w-[37px] rounded-[20px] bg-white" />
        )}
        <div
          className="absolute flex inset-[20.59%_15.48%_26.47%_66.66%] items-center justify-center"
          data-node-id="I23045:83042;585:6265"
          style={{ containerType: 'size' }}
        >
          <div className="flex-none h-[hypot(-34.8145cqw,81.3128cqh)] rotate-[20.33deg] skew-x-2 w-[hypot(65.1855cqw,18.6872cqh)]">
            <div className="relative size-full" data-name="b">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgB} />
            </div>
          </div>
        </div>
        <div
          className="absolute flex inset-[21.32%_16.27%_27.2%_67.23%] items-center justify-center"
          data-node-id="I23045:83042;585:6266"
          style={{ containerType: 'size' }}
        >
          <div className="flex-none h-[hypot(-27.4345cqw,86.0079cqh)] rotate-[14.69deg] skew-x-[1.5deg] w-[hypot(72.5655cqw,13.9921cqh)]">
            <div className="relative size-full" data-name="b">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgB1} />
            </div>
          </div>
        </div>
        <div
          className="absolute flex inset-[22.29%_17.21%_27.15%_67.03%] items-center justify-center"
          data-node-id="I23045:83042;585:6267"
          style={{ containerType: 'size' }}
        >
          <div className="flex-none h-[hypot(-23.2255cqw,88.4819cqh)] rotate-[11.85deg] skew-x-[1.22deg] w-[hypot(76.7745cqw,11.5181cqh)]">
            <div className="relative size-full" data-name="b">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgB2} />
            </div>
          </div>
        </div>
        <div
          className="absolute flex inset-[23.53%_18.12%_27.55%_67.35%] items-center justify-center"
          data-node-id="I23045:83042;585:6268"
          style={{ containerType: 'size' }}
        >
          <div className="flex-none h-[hypot(-15.7496cqw,92.5548cqh)] rotate-[7.39deg] skew-x-[0.77deg] w-[hypot(84.2504cqw,7.44517cqh)]">
            <div className="relative size-full" data-name="b">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgB3} />
            </div>
          </div>
        </div>
        <div
          className="absolute flex inset-[24.75%_19.11%_28.17%_67.61%] items-center justify-center"
          data-node-id="I23045:83042;585:6269"
          style={{ containerType: 'size' }}
        >
          <div className="flex-none h-[hypot(-7.21328cqw,96.7631cqh)] rotate-[3.09deg] skew-x-[0.33deg] w-[hypot(92.7867cqw,3.23693cqh)]">
            <div className="relative size-full" data-name="b">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgB4} />
            </div>
          </div>
        </div>
        <div
          className="absolute inset-[26.47%_20.24%_29.41%_67.86%]"
          data-node-id="I23045:83042;585:6270"
          data-name="b"
        >
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgB5} />
        </div>
        <div
          className="absolute h-[30px] left-[2px] top-[2px] w-[37px]"
          data-node-id="I23045:83042;585:6327"
          data-name="UCI"
        >
          <div
            className="absolute bg-[var(--neutral\/w,white)] inset-0 rounded-[20px]"
            data-node-id="I23045:83042;585:6271"
            style={{ opacity: preferredProfile === 'buddy' ? 0 : 1 }}
          />
          <div
            className="absolute inset-[23.33%_27.03%_23.33%_29.73%]"
            data-node-id="I23045:83042;585:6272"
            data-name="Logo"
          >
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLogo1} />
          </div>
        </div>
      </div>
    </button>
  )
}

type LogosBuddyHorizontalProps = {
  className?: string
  dark?: 'Yes'
  size?: 'M'
  typology?: 'Horizontal'
}

export function LogosBuddyHorizontal({ className }: LogosBuddyHorizontalProps) {
  return (
    <div className={className || 'aspect-[57/26] relative w-[57px]'} data-node-id="21332:327174">
      <div className="absolute inset-[22.64%_61.96%_34.14%_21.15%]" data-node-id="21332:327175" data-name="Vector">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector} />
      </div>
      <div className="absolute inset-[6.44%_41.19%_34.14%_41.14%]" data-node-id="21332:327176" data-name="Vector">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
      </div>
      <div className="absolute inset-[6.44%_20.41%_34.14%_61.91%]" data-node-id="21332:327177" data-name="Vector">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector2} />
      </div>
      <div className="absolute inset-[22.63%_0_17.6%_81.56%]" data-node-id="21332:327178" data-name="Vector">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector3} />
      </div>
      <div className="absolute contents inset-[78.16%_48.94%_0_0]" data-node-id="21332:327179" data-name="Group">
        <div className="absolute contents inset-[78.16%_90.09%_0_0]" data-node-id="21332:327180" data-name="Group">
          <div className="absolute inset-[78.16%_91.82%_3.95%_0]" data-node-id="21332:327181" data-name="Vector">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector4} />
          </div>
          <div className="absolute inset-[81.55%_90.09%_0_0.88%]" data-node-id="21332:327182" data-name="Vector">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector5} />
          </div>
        </div>
        <div className="absolute inset-[80.13%_82.78%_0.92%_11.66%]" data-node-id="21332:327183" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector6} />
        </div>
        <div className="absolute inset-[84.95%_77.29%_1.11%_17.84%]" data-node-id="21332:327184" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector7} />
        </div>
        <div className="absolute inset-[80.13%_75.07%_1.11%_23.29%]" data-node-id="21332:327185" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector8} />
        </div>
        <div className="absolute inset-[79.85%_68.91%_0.92%_25.42%]" data-node-id="21332:327186" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector9} />
        </div>
        <div className="absolute inset-[84.95%_65.39%_1.11%_31.6%]" data-node-id="21332:327187" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector10} />
        </div>
        <div className="absolute inset-[84.96%_60.16%_0.91%_34.59%]" data-node-id="21332:327188" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector11} />
        </div>
        <div className="absolute inset-[80.13%_54.74%_0.92%_40.28%]" data-node-id="21332:327189" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector12} />
        </div>
        <div className="absolute inset-[80.13%_52.48%_1.11%_45.89%]" data-node-id="21332:327190" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector13} />
        </div>
        <div className="absolute inset-[80.13%_48.94%_0.91%_47.94%]" data-node-id="21332:327191" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector14} />
        </div>
      </div>
      <div className="absolute inset-[0_79.94%_33.72%_0.02%]" data-node-id="21332:327192" data-name="Vector">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector15} />
      </div>
    </div>
  )
}

export function SamsungPayLogo() {
  return (
    <span className="mf-samsung" role="img" aria-label="Samsung Pay">
      <img src={imgGroup1} alt="" style={{ position: 'absolute', top: 0, left: 0 }} />
      <img src={imgGroup} alt="" style={{ position: 'absolute', left: '75.96%', top: '4.88%' } as CSSProperties} />
    </span>
  )
}
