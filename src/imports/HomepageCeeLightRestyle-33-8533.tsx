import svgPaths from "./svg-wan58807zo";
import imgRectangle1 from "figma:asset/6f4a518088433560480f90c7a7448fdc1d294def.png";
import img1000F1351018953Xn3Y0KEfi9SZc6WqxoT6GApUlcapa1Qi2 from "figma:asset/0b2e1320778abbfabfe3812e914dcba7496b6ce1.png";
import imgGianCescon00ByExKcSkAUnsplash1 from "figma:asset/ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6.png";
import { imgRectangle, imgFrame1699, img1000F1351018953Xn3Y0KEfi9SZc6WqxoT6GApUlcapa1Qi1, imgGianCescon00ByExKcSkAUnsplash } from "./svg-depre";

function Frame16() {
  return (
    <div className="content-stretch flex font-['UniCredit:Bold',sans-serif] gap-[2px] items-baseline leading-[normal] not-italic relative shrink-0 text-[#262626] w-full">
      <p className="relative shrink-0 text-[30px]">1.786.475</p>
      <p className="relative shrink-0 text-[20px]">,31 CZK</p>
    </div>
  );
}

function Frame40() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[-10px] p-[10px] top-[-10px] w-[215px]">
      <Frame16 />
    </div>
  );
}

function Amount() {
  return (
    <div className="h-[33px] overflow-clip relative shrink-0 w-full" data-name="amount">
      <Frame40 />
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#262626] text-[14px] w-[min-content] whitespace-pre-wrap">Total Available</p>
      <Amount />
      <div className="h-px relative shrink-0 w-[205px]" data-name="Line">
        <div className="absolute inset-[37.5%_-0.06%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 205.25 0.25">
            <path d="M0.125 0.125H205.125" id="Line" stroke="var(--stroke-0, #262626)" strokeLinecap="square" strokeWidth="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="row 2">
      <p className="absolute font-['UniCredit:Bold',sans-serif] leading-[normal] left-0 not-italic text-[#262626] text-[14px] top-0">Total Owed</p>
    </div>
  );
}

function Amount1() {
  return (
    <div className="content-stretch flex font-['UniCredit:Bold',sans-serif] items-baseline leading-[normal] not-italic overflow-clip relative shrink-0 text-[#262626] w-full" data-name="amount">
      <p className="relative shrink-0 text-[20px]">1.786.474</p>
      <p className="relative shrink-0 text-[14px]">,00 CZK</p>
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full">
      <Row />
      <Amount1 />
    </div>
  );
}

function Info() {
  return (
    <div className="flex-[1_0_0] h-[157px] min-h-px min-w-px relative" data-name="info">
      <div className="content-stretch flex flex-col gap-[5px] items-start pl-[24px] py-[24px] relative size-full">
        <Frame35 />
        <Frame36 />
      </div>
    </div>
  );
}

function Faro() {
  return (
    <div className="h-[157px] relative shrink-0 w-[96px]" data-name="Faro">
      <div className="absolute inset-0 rounded-[8px]" data-name="Rectangle" />
      <div className="absolute inset-[21.66%_-0.05%_-75.16%_-1.04%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0.996px_-34px] mask-size-[96px_157px]" data-name="Rectangle" style={{ maskImage: `url('${imgRectangle}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRectangle1} />
        </div>
      </div>
    </div>
  );
}

function Frame41() {
  return (
    <div className="absolute content-stretch flex inset-0 items-center justify-center mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[327px_157px]" style={{ maskImage: `url('${imgFrame1699}')` }}>
      <Info />
      <Faro />
    </div>
  );
}

function Cards() {
  return (
    <div className="absolute h-[157px] left-[24px] top-[151px] w-[327px]" data-name="Cards">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Mask" />
      </svg>
      <div className="absolute bg-[#94b1ba] inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[327px_157px]" style={{ maskImage: `url('${imgFrame1699}')` }} />
      <Frame41 />
    </div>
  );
}

function Blur() {
  return (
    <div className="absolute contents inset-0" data-name="Blur">
      <div className="absolute backdrop-blur-[13.591px] inset-0" data-name="Rectangle3" />
    </div>
  );
}

function Rectangle() {
  return (
    <div className="h-[6px] relative shrink-0 w-[30px]" data-name="Rectangle">
      <div className="absolute bg-[#007a91] inset-0 rounded-[3px]" data-name="Rectangle" />
    </div>
  );
}

function Oval() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Oval">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
        <g id="Oval">
          <circle cx="3" cy="3" fill="var(--fill-0, #666666)" id="Oval Copy 2" r="3" />
        </g>
      </svg>
    </div>
  );
}

function Oval1() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Oval">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
        <g id="Oval">
          <circle cx="3" cy="3" fill="var(--fill-0, #666666)" id="Oval Copy 2" r="3" />
        </g>
      </svg>
    </div>
  );
}

function Oval2() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Oval">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
        <g id="Oval">
          <circle cx="3" cy="3" fill="var(--fill-0, #666666)" id="Oval Copy 2" r="3" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[6px] items-center left-[calc(50%-0.5px)] top-1/2" data-name="Frame">
      <Rectangle />
      <Oval />
      <Oval1 />
      <Oval2 />
    </div>
  );
}

function Carousel() {
  return (
    <div className="absolute h-[32px] left-0 top-[308px] w-[375px]" data-name="Carousel">
      <Blur />
      <Frame />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[24px] w-full whitespace-pre-wrap">Accounts</p>
    </div>
  );
}

function IcNavigationRestyleChevronDown() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_chevron-down">
          <g id="SafeArea24" />
          <g id="Down">
            <path clipRule="evenodd" d={svgPaths.p1c2a0e00} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex gap-[16px] items-center py-[24px] relative shrink-0 w-full">
      <Frame3 />
      <IcNavigationRestyleChevronDown />
    </div>
  );
}

function List() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="List">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[24px] relative size-full">
          <Frame17 />
        </div>
      </div>
    </div>
  );
}

function IcNavigationHomepageRestyleAccount() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_account">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_homepage_restyle_account">
          <rect fill="white" height="32" width="32" />
          <g id="SafeArea24" />
          <g id="Accounts (V2)">
            <path clipRule="evenodd" d={svgPaths.p30b125f0} fill="var(--fill-0, #007A91)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col items-start not-italic relative shrink-0 w-full">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[18px] text-black w-full whitespace-pre-wrap">Primary Account</p>
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] h-[18px] justify-center leading-[0] relative shrink-0 text-[#262626] text-[14px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">1234567890123456</p>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[247px]">
      <Frame19 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <IcNavigationHomepageRestyleAccount />
      <Frame14 />
    </div>
  );
}

function Group() {
  return (
    <div className="content-stretch flex h-[18px] items-baseline justify-end not-italic relative shrink-0 text-[#262626] text-right w-full">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] relative shrink-0 text-[20px] whitespace-nowrap">
        <p className="leading-[normal]">1.429.089</p>
      </div>
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px]">,00 CZK</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[16px] relative w-full">
        <Frame15 />
        <Group />
      </div>
    </div>
  );
}

function SecondoElemento() {
  return (
    <div className="h-[9px] relative shrink-0 w-[319px]" data-name="secondo elemento">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 319 9">
        <g id="secondo elemento">
          <path clipRule="evenodd" d={svgPaths.p43eb000} fill="var(--fill-0, white)" fillRule="evenodd" id="Rectangle Copy" />
          <path d="M0 0.5H319" id="Path 2 Copy" opacity="0.296317" stroke="var(--stroke-0, #D8D8D8)" />
        </g>
      </svg>
    </div>
  );
}

function ProductCard() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[327px]" data-name="Product card">
      <Frame18 />
      <SecondoElemento />
    </div>
  );
}

function Frame46() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <List />
      <ProductCard />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[24px] w-full whitespace-pre-wrap">Cards</p>
    </div>
  );
}

function IcNavigationRestyleChevronDown1() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_chevron-down">
          <g id="SafeArea24" />
          <g id="Down">
            <path clipRule="evenodd" d={svgPaths.p1c2a0e00} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex gap-[16px] items-center py-[24px] relative shrink-0 w-full">
      <Frame4 />
      <IcNavigationRestyleChevronDown1 />
    </div>
  );
}

function List1() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="List">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[24px] relative size-full">
          <Frame20 />
        </div>
      </div>
    </div>
  );
}

function IcCardsLogovendorMastercardWhiteNew() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_cards_logovendor_mastercard_white_NEW">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_cards_logovendor_mastercard_white_NEW">
          <rect fill="white" height="32" width="32" />
          <g id="SafeArea24" />
          <g id="1xMC standard">
            <rect fill="var(--fill-0, #FF5F00)" height="9.76779" id="Rectangle" width="5.40809" x="13.2961" y="11.3282" />
            <path d={svgPaths.p3d2aad00} fill="var(--fill-0, #EB001B)" id="Path" />
            <path d={svgPaths.pf70130} fill="var(--fill-0, #F79E1B)" id="Path_2" />
            <path d={svgPaths.p1c8e3f80} fill="var(--fill-0, #F79E1B)" id="Path_3" />
            <path d={svgPaths.p3bd78770} fill="var(--fill-0, #F79E1B)" id="Path_4" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col items-start not-italic relative shrink-0 w-full">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[18px] text-black w-full whitespace-pre-wrap">Mastercard Classic</p>
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] h-[18px] justify-center leading-[0] relative shrink-0 text-[#262626] text-[14px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">9234 **** **** 4007</p>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[247px]">
      <Frame24 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <IcCardsLogovendorMastercardWhiteNew />
      <Frame23 />
    </div>
  );
}

function Group1() {
  return (
    <div className="content-stretch flex h-[18px] items-baseline justify-end not-italic relative shrink-0 text-[#262626] text-right w-full">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] relative shrink-0 text-[20px] whitespace-nowrap">
        <p className="leading-[normal]">71.089</p>
      </div>
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px]">,00 CZK</p>
    </div>
  );
}

function Frame21() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[16px] relative w-full">
        <Frame22 />
        <Group1 />
      </div>
    </div>
  );
}

function SecondoElemento1() {
  return (
    <div className="h-[9px] relative shrink-0 w-[319px]" data-name="secondo elemento">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 319 9">
        <g id="secondo elemento">
          <path clipRule="evenodd" d={svgPaths.p43eb000} fill="var(--fill-0, white)" fillRule="evenodd" id="Rectangle Copy" />
          <path d="M0 0.5H319" id="Path 2 Copy" opacity="0.296317" stroke="var(--stroke-0, #D8D8D8)" />
        </g>
      </svg>
    </div>
  );
}

function ProductCard1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[327px]" data-name="Product card">
      <Frame21 />
      <SecondoElemento1 />
    </div>
  );
}

function Frame47() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <List1 />
      <ProductCard1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[24px] w-full whitespace-pre-wrap">Savings and term deposit</p>
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex gap-[16px] items-center py-[24px] relative shrink-0 w-full">
      <Frame5 />
    </div>
  );
}

function List2() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="List">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[24px] relative size-full">
          <Frame25 />
        </div>
      </div>
    </div>
  );
}

function IcActionbarSavingAccountBlack() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_actionbar_Saving_Account_black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_actionbar_Saving_Account_black">
          <rect fill="white" height="32" width="32" />
          <g id="SafeArea24" />
          <path d={svgPaths.p12c04000} fill="var(--fill-0, #007A91)" id="Combined Shape" />
          <path d={svgPaths.p1808a00} fill="var(--fill-0, #007A91)" id="Combined Shape_2" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px not-italic relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[18px] text-black w-full whitespace-pre-wrap">Saving account</p>
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] h-[18px] justify-center leading-[0] relative shrink-0 text-[#262626] text-[14px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">1234567890123456</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <IcActionbarSavingAccountBlack />
      <Frame1 />
    </div>
  );
}

function Group2() {
  return (
    <div className="content-stretch flex h-[18px] items-baseline justify-end not-italic relative shrink-0 text-[#262626] text-right w-full">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] relative shrink-0 text-[20px] whitespace-nowrap">
        <p className="leading-[normal]">1.429.089</p>
      </div>
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px]">,00 CZK</p>
    </div>
  );
}

function ProductCard2() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[4px] items-end p-[16px] relative rounded-[4px] shrink-0 w-[327px]" data-name="Product card">
      <Frame2 />
      <Group2 />
    </div>
  );
}

function Frame48() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <List2 />
      <ProductCard2 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[24px] w-full whitespace-pre-wrap">Mortgage and loans</p>
    </div>
  );
}

function IcNavigationRestyleChevronDown2() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_chevron-down">
          <g id="SafeArea24" />
          <g id="Down">
            <path clipRule="evenodd" d={svgPaths.p1c2a0e00} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex gap-[16px] items-center py-[24px] relative shrink-0 w-full">
      <Frame6 />
      <IcNavigationRestyleChevronDown2 />
    </div>
  );
}

function List3() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="List">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[24px] relative size-full">
          <Frame26 />
        </div>
      </div>
    </div>
  );
}

function IcNavigationHomepageRestyleMortgage() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_mortgage">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_homepage_restyle_mortgage">
          <rect fill="white" height="32" width="32" />
          <g id="SafeArea24" />
          <g id="Mortgages">
            <path clipRule="evenodd" d={svgPaths.p2a1e5d80} fill="var(--fill-0, #007A91)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-col items-start not-italic relative shrink-0 w-full">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[18px] text-black w-full whitespace-pre-wrap">House mortgage</p>
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] h-[18px] justify-center leading-[0] relative shrink-0 text-[#262626] text-[14px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">1234567890123459</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[247px]">
      <Frame30 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <IcNavigationHomepageRestyleMortgage />
      <Frame29 />
    </div>
  );
}

function Group3() {
  return (
    <div className="content-stretch flex h-[18px] items-baseline justify-end not-italic relative shrink-0 text-[#262626] text-right w-full">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] relative shrink-0 text-[20px] whitespace-nowrap">
        <p className="leading-[normal]">1.429.089</p>
      </div>
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px]">,00 CZK</p>
    </div>
  );
}

function Frame27() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[16px] relative w-full">
        <Frame28 />
        <Group3 />
      </div>
    </div>
  );
}

function SecondoElemento2() {
  return (
    <div className="h-[9px] relative shrink-0 w-[319px]" data-name="secondo elemento">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 319 9">
        <g id="secondo elemento">
          <path clipRule="evenodd" d={svgPaths.p43eb000} fill="var(--fill-0, white)" fillRule="evenodd" id="Rectangle Copy" />
          <path d="M0 0.5H319" id="Path 2 Copy" opacity="0.296317" stroke="var(--stroke-0, #D8D8D8)" />
        </g>
      </svg>
    </div>
  );
}

function ProductCard3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[327px]" data-name="Product card">
      <Frame27 />
      <SecondoElemento2 />
    </div>
  );
}

function Frame49() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <List3 />
      <ProductCard3 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[24px] w-full whitespace-pre-wrap">Investment</p>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex gap-[16px] items-center py-[24px] relative shrink-0 w-full">
      <Frame7 />
    </div>
  );
}

function List4() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="List">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[24px] relative size-full">
          <Frame31 />
        </div>
      </div>
    </div>
  );
}

function IcPfmInvestmentsSavingsBlack() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_pfm_investments_savings_black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_pfm_investments_savings_black">
          <rect fill="white" height="32" width="32" />
          <g id="SafeArea24" />
          <path d={svgPaths.p13a34800} fill="var(--fill-0, #007A91)" id="Combined Shape" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[18px] text-black w-full whitespace-pre-wrap">Security Portfolio</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <IcPfmInvestmentsSavingsBlack />
      <Frame9 />
    </div>
  );
}

function Group4() {
  return (
    <div className="content-stretch flex h-[18px] items-baseline justify-end not-italic relative shrink-0 text-[#262626] text-right w-full">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] relative shrink-0 text-[20px] whitespace-nowrap">
        <p className="leading-[normal]">71.089</p>
      </div>
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px]">,00 CZK</p>
    </div>
  );
}

function ProductCard4() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[4px] items-end p-[16px] relative rounded-[4px] shrink-0 w-[327px]" data-name="Product card">
      <Frame8 />
      <Group4 />
    </div>
  );
}

function Frame50() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <List4 />
      <ProductCard4 />
    </div>
  );
}

function Frame51() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 top-[340px] w-[375px]">
      <Frame46 />
      <Frame47 />
      <Frame48 />
      <Frame49 />
      <Frame50 />
    </div>
  );
}

function NavigationAndActionWarningSmall() {
  return (
    <div className="absolute inset-[15.63%_15.63%_15.62%_15.63%]" data-name="Navigation and action/Warning/Small">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3125 10.3125">
        <g id="Navigation and action/Warning/Small">
          <path clipRule="evenodd" d={svgPaths.p2a1fa6f0} fill="var(--fill-0, #007A91)" fillRule="evenodd" id="210" />
        </g>
      </svg>
    </div>
  );
}

function IcNavigationRestyleWarningSmall() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="ic_navigation_restyle_Warning_Small">
      <NavigationAndActionWarningSmall />
    </div>
  );
}

function TagExpiringDate() {
  return (
    <div className="bg-white content-stretch flex gap-[5px] items-start px-[7px] py-[3px] relative rounded-[4px] shrink-0" data-name="Tag expiring date">
      <IcNavigationRestyleWarningSmall />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#007a91] text-[12px] uppercase">EXPIRING ON 12.04.25</p>
    </div>
  );
}

function Frame33() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col gap-[8px] h-[157px] items-start left-0 p-[24px] top-1/2 w-[327px]">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[24px] text-white w-[min-content] whitespace-pre-wrap">{`Pending Action `}</p>
      <div className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-white w-full whitespace-pre-wrap">
        <p className="mb-0">You have to reject or confirm a pending payment</p>
        <p>&nbsp;</p>
      </div>
      <TagExpiringDate />
    </div>
  );
}

function Cards1() {
  return (
    <div className="absolute h-[157px] left-[359px] overflow-clip rounded-[8px] top-[151px] w-[327px]" data-name="Cards">
      <div className="absolute bg-gradient-to-r from-[rgba(0,122,145,1)] inset-0 rounded-[8px] to-[#44909e] to-[95.09%]" />
      <Frame33 />
    </div>
  );
}

function Group5() {
  return (
    <div className="h-[2px] relative shrink-0 w-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 2">
        <g id="Group 419">
          <path d={svgPaths.p3ff1ec00} fill="var(--fill-0, #007A91)" id="Rectangle 101" />
        </g>
      </svg>
    </div>
  );
}

function IcNavigationHomepageRestyleHome() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_home">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_homepage_restyle_home">
          <g id="SafeArea24" />
          <g id="055">
            <path clipRule="evenodd" d={svgPaths.p21b28000} fill="var(--fill-0, #007A91)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Item() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Item 1">
      <p className="-translate-x-1/2 absolute font-['UniCredit:Regular',sans-serif] leading-[normal] left-[calc(50%+1px)] not-italic text-[#007a91] text-[14px] text-center top-[calc(50%-8px)]">Home</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[59px]">
      <Group5 />
      <IcNavigationHomepageRestyleHome />
      <Item />
    </div>
  );
}

function IcNavigationHomepageRestyleAnalyticsGrey() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_analytics_grey">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_homepage_restyle_analytics_grey">
          <g id="SafeArea24" />
          <path clipRule="evenodd" d={svgPaths.p654f280} fill="var(--fill-0, #666666)" fillRule="evenodd" id="Icon" />
          <mask height="20" id="mask0_33_8621" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="20" x="6" y="6">
            <path clipRule="evenodd" d={svgPaths.p654f280} fill="var(--fill-0, white)" fillRule="evenodd" id="Icon_2" />
          </mask>
          <g mask="url(#mask0_33_8621)" />
        </g>
      </svg>
    </div>
  );
}

function Item1() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Item 2">
      <p className="-translate-x-1/2 absolute font-['UniCredit:Regular',sans-serif] leading-[normal] left-[calc(50%+0.5px)] not-italic text-[#666] text-[14px] text-center top-[calc(50%-8px)]">Analytics</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[59px]">
      <IcNavigationHomepageRestyleAnalyticsGrey />
      <Item1 />
    </div>
  );
}

function IcNavigationHomepageRestylePaymentsGrey2() {
  return (
    <div className="absolute inset-[12.5%]" data-name="ic_navigation_homepage_restyle_payments_grey">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="ic_navigation_homepage_restyle_payments_grey">
          <g id="SafeArea24" />
          <g id="Group-2">
            <path clipRule="evenodd" d={svgPaths.p30cd1a00} fill="var(--fill-0, #666666)" fillRule="evenodd" id="Combined-Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IcNavigationHomepageRestylePaymentsGrey1() {
  return (
    <div className="absolute left-0 overflow-clip size-[32px] top-0" data-name="ic_navigation_homepage_restyle_payments_grey 1">
      <IcNavigationHomepageRestylePaymentsGrey2 />
    </div>
  );
}

function IcNavigationHomepageRestylePaymentsGrey() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_payments_grey">
      <IcNavigationHomepageRestylePaymentsGrey1 />
    </div>
  );
}

function Item2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item 4">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[2px] relative w-full">
          <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#666] text-[14px] text-center">Payments</p>
        </div>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[59px]">
      <IcNavigationHomepageRestylePaymentsGrey />
      <Item2 />
    </div>
  );
}

function IcNavigationHomepageRestyleProductsGrey() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_products_grey">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_homepage_restyle_products_grey">
          <g id="SafeArea24" />
          <g id="Products catalog (V2)">
            <path clipRule="evenodd" d={svgPaths.p6b1df00} fill="var(--fill-0, #666666)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Item3() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Item 4">
      <p className="-translate-x-1/2 absolute font-['UniCredit:Regular',sans-serif] leading-[normal] left-[calc(50%+0.5px)] not-italic text-[#666] text-[14px] text-center top-[calc(50%-8px)]">Products</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[59px]">
      <IcNavigationHomepageRestyleProductsGrey />
      <Item3 />
    </div>
  );
}

function IcNavigationHomepageRestyleMoreGrey() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_more_grey">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_homepage_restyle_more_grey">
          <g id="More">
            <path clipRule="evenodd" d={svgPaths.p10aa0380} fill="var(--fill-0, #666666)" fillRule="evenodd" id="Shape" />
          </g>
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function Item4() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Item 5">
      <p className="-translate-x-1/2 absolute font-['UniCredit:Regular',sans-serif] leading-[normal] left-[calc(50%+0.5px)] not-italic text-[#666] text-[14px] text-center top-[calc(50%-8px)]">More</p>
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[59px]">
      <IcNavigationHomepageRestyleMoreGrey />
      <Item4 />
    </div>
  );
}

function LightRestyleDivider() {
  return (
    <div className="-translate-x-1/2 absolute h-px left-1/2 top-0 w-[375px]" data-name="Light Restyle/ Divider">
      <div className="absolute inset-[0_-0.03%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375.25 1">
          <g id="Light Restyle/ Divider">
            <path d="M0.125 0.5H375.125" id="Line" stroke="var(--stroke-0, #999999)" strokeLinecap="square" strokeWidth="0.25" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex gap-[8px] items-end left-0 pb-[4px] px-[24px] w-[375px]" data-name="Nav bar">
      <Frame10 />
      <Frame11 />
      <Frame12 />
      <Frame13 />
      <Frame32 />
      <LightRestyleDivider />
    </div>
  );
}

function BatteryIcon() {
  return (
    <div className="-translate-y-1/2 absolute h-[11.5px] right-0 top-[calc(50%-0.75px)] w-[26.5px]" data-name="Battery Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.5 11.5">
        <g id="Battery Icon">
          <path d={svgPaths.p32feca80} id="Battery Outline" opacity="0.47" stroke="var(--stroke-0, black)" />
          <path d={svgPaths.p303cb380} fill="var(--fill-0, black)" id="Battery Connector" opacity="0.58" />
          <path clipRule="evenodd" d={svgPaths.p34553880} fill="var(--fill-0, black)" fillRule="evenodd" id="Battery Fill" />
        </g>
      </svg>
    </div>
  );
}

function Battery() {
  return (
    <div className="-translate-y-1/2 absolute h-[15px] overflow-clip right-0 top-1/2 w-[62.5px]" data-name="Battery">
      <BatteryIcon />
      <p className="absolute font-['SF_Pro_Text:Regular',sans-serif] leading-[normal] not-italic right-[29.5px] text-[12px] text-black text-right top-[calc(50%-7.5px)] w-[33px] whitespace-pre-wrap">100%</p>
    </div>
  );
}

function RightDetail() {
  return (
    <div className="-translate-y-1/2 absolute h-[15px] overflow-clip right-0 top-[calc(50%-0.25px)] w-[73px]" data-name="Right Detail">
      <Battery />
      <div className="absolute inset-[3.33%_90.41%_16.67%_0]" data-name="bluetooth">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 12">
          <path d={svgPaths.p3113e300} fill="var(--fill-0, black)" id="bluetooth" />
        </svg>
      </div>
    </div>
  );
}

function LeftDetail() {
  return (
    <div className="-translate-y-1/2 absolute h-[10px] left-0 top-[calc(50%-1.25px)] w-[35px]" data-name="Left Detail">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 10">
        <g clipPath="url(#clip0_33_8654)" id="Left Detail">
          <path d={svgPaths.p23acee00} fill="var(--fill-0, black)" id="Signal" />
          <g id="Wifi">
            <path clipRule="evenodd" d={svgPaths.p3e004880} fill="black" fillRule="evenodd" />
            <path d={svgPaths.p73b7cf0} fill="var(--stroke-0, black)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_33_8654">
            <rect fill="white" height="10" width="35" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute inset-[17.5%_2%_5%_1.6%] overflow-clip" data-name="Status Bar">
      <RightDetail />
      <p className="absolute font-['SF_Pro_Text:Semibold',sans-serif] leading-[normal] left-[132px] not-italic right-[129.5px] text-[12px] text-black text-center top-[calc(50%-7.25px)] whitespace-pre-wrap">9:41 AM</p>
      <LeftDetail />
    </div>
  );
}

function IPhoneStatusBar() {
  return (
    <div className="h-[20px] relative shrink-0 w-[375px]" data-name="iPhone Status Bar">
      <StatusBar />
    </div>
  );
}

function Maschera() {
  return (
    <div className="absolute contents left-0 top-0" data-name="maschera">
      <div className="absolute flex h-[436.884px] items-center justify-center left-[-41.09px] top-[-123.38px] w-[244.655px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "404" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="blur-[3px] h-[244.655px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[41.094px_123.383px] mask-size-[72px_32px] relative w-[436.884px]" data-name="1000_F_1351018953_xn3y0KEfi9sZc6WqxoT6gApUlcapa1Qi 1" style={{ maskImage: `url('${img1000F1351018953Xn3Y0KEfi9SZc6WqxoT6GApUlcapa1Qi1}')` }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-full left-[-50.75%] max-w-none top-[-3.38%] w-[201.49%]" src={img1000F1351018953Xn3Y0KEfi9SZc6WqxoT6GApUlcapa1Qi2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame42() {
  return <div className="absolute bg-[rgba(38,38,38,0.6)] h-[32px] left-0 rounded-[100px] top-0 w-[72px]" />;
}

function CommonPremium() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Common/Premium">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Common/Premium">
          <path d={svgPaths.p20aec1a0} fill="var(--fill-0, white)" id="213" />
        </g>
      </svg>
    </div>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex h-full items-center justify-center pl-[8px] relative shrink-0">
      <CommonPremium />
    </div>
  );
}

function Frame43() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex gap-[8px] items-center left-0 top-[calc(50%+0.5px)]">
      <div className="flex flex-row items-center self-stretch">
        <Frame44 />
      </div>
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[normal]">Prime</p>
      </div>
    </div>
  );
}

function Frame45() {
  return (
    <div className="absolute h-[32px] left-0 top-0 w-[72px]">
      <Maschera />
      <Frame42 />
      <Frame43 />
    </div>
  );
}

function PrimeButtonMyAdvisory() {
  return (
    <div className="h-[32px] relative shrink-0 w-[87px]" data-name="Prime button My advisory">
      <Frame45 />
    </div>
  );
}

function IcNavigationRestyleHide() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_hide">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_hide">
          <g id="SafeArea24" />
          <g id="Hide">
            <path clipRule="evenodd" d={svgPaths.p32c7f480} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IcNavigationRestyleProfile() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_profile">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_profile">
          <g id="SafeArea24" />
          <g id="Navigation and action_Profile">
            <path clipRule="evenodd" d={svgPaths.p2a09dd00} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IconR() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Icon R2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Icon R2">
          <g id="SafeArea24" />
          <g id="186">
            <path clipRule="evenodd" d={svgPaths.p4f3cf00} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
      <IcNavigationRestyleHide />
      <IcNavigationRestyleProfile />
      <IconR />
    </div>
  );
}

function Frame38() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 pl-[24px] pr-[16px] top-[10px] w-[375px]">
      <PrimeButtonMyAdvisory />
      <Frame37 />
    </div>
  );
}

function Frame39() {
  return (
    <div className="h-[54px] relative shrink-0 w-[375px]">
      <Frame38 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-start left-0 top-0 w-[375px]" data-name="Header">
      <IPhoneStatusBar />
      <Frame39 />
    </div>
  );
}

function Component9ImagesPlaceHolderHomepage() {
  return (
    <div className="absolute contents inset-0" data-name="9 Images/PlaceHolder/Homepage">
      <div className="absolute inset-[-0.64%_-0.31%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 329 159">
          <g id="Group 4">
            <path d={svgPaths.pe53f200} fill="var(--fill-0, #D1960A)" id="Mask" stroke="var(--stroke-0, #917112)" />
            <mask height="157" id="mask0_33_8588" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="327" x="1" y="1">
              <path clipRule="evenodd" d={svgPaths.p2cbcfb00} fill="var(--fill-0, white)" fillRule="evenodd" id="Mask_2" />
            </mask>
            <g mask="url(#mask0_33_8588)">
              <g id="aempty">
                <g id="SafeArea24" />
                <g id="Rectangle" />
              </g>
              <g id="Chevron">
                <path clipRule="evenodd" d={svgPaths.p2f717380} fill="var(--fill-0, #DFA805)" fillRule="evenodd" id="Shape" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame34() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[125px] items-start leading-[normal] left-[16px] not-italic text-[#262626] top-[16px] w-[207px] whitespace-pre-wrap">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 text-[24px] w-full">Lorem ipsum lorem ipsum title!</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 text-[18px] w-full">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. `}</p>
    </div>
  );
}

function CommercialEngagement() {
  return (
    <div className="-translate-x-1/2 absolute h-[157px] left-1/2 top-[1189px] w-[327px]" data-name="Commercial Engagement">
      <Component9ImagesPlaceHolderHomepage />
      <Frame34 />
      <div className="absolute inset-[0_0_0_70.64%] rounded-br-[8px] rounded-tr-[8px]" data-name="Rectangle" />
      <div className="absolute inset-[0_0_0_70.64%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[96px_157px] rounded-br-[8px] rounded-tr-[8px]" data-name="gian-cescon-00ByEXKcSkA-unsplash" style={{ maskImage: `url('${imgGianCescon00ByExKcSkAUnsplash}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-br-[8px] rounded-tr-[8px]">
          <img alt="" className="absolute h-full left-[-4.17%] max-w-none top-0 w-[109.14%]" src={imgGianCescon00ByExKcSkAUnsplash1} />
        </div>
      </div>
    </div>
  );
}

function IcNavigationRestyleProfile1() {
  return (
    <div className="absolute left-[327px] size-[48px] top-[614px]" data-name="ic_navigation_restyle_profile">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="ic_navigation_restyle_profile">
          <g id="SafeArea24" />
          <g id="Navigation and action/Share screen_K10">
            <path clipRule="evenodd" d={svgPaths.p59e0600} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[327px] top-[558px]">
      <div className="absolute h-[80.505px] left-[328px] top-[638px] w-[65px]" data-name="Subtract">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 65 80.5053">
          <path d={svgPaths.pa3b0f80} fill="var(--fill-0, #008574)" id="Subtract" />
        </svg>
      </div>
      <div className="absolute flex h-[80.505px] items-center justify-center left-[328px] top-[558px] w-[65px]">
        <div className="-scale-y-100 flex-none">
          <div className="h-[80.505px] relative w-[65px]" data-name="Subtract">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 65 80.5053">
              <path d={svgPaths.pa3b0f80} fill="var(--fill-0, #008574)" id="Subtract" />
            </svg>
          </div>
        </div>
      </div>
      <IcNavigationRestyleProfile1 />
    </div>
  );
}

export default function HomepageCeeLightRestyle() {
  return (
    <div className="bg-[#f5f5f5] relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] size-full" data-name="Homepage - CEE Light Restyle">
      <Cards />
      <Carousel />
      <Frame51 />
      <Cards1 />
      <NavBar />
      <Header />
      <p className="absolute font-['UniCredit:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#262626] text-[28px] top-[96px] w-[215px] whitespace-pre-wrap">Your Homepage</p>
      <CommercialEngagement />
      <Group6 />
    </div>
  );
}