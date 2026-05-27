import svgPaths from "./svg-3ff69lig5m";
import imgEstateMeteorologicaInizioOggiQuandoSolstizioSignificato16539833767081280Jpg from "figma:asset/f4db1d1cdcbf6f7ad5674a0b74b6af74a9706415.png";

function ActivePreloginOverlay() {
  return (
    <div className="absolute h-[812px] left-0 top-0 w-[375px]" data-name="Active Prelogin overlay">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 812">
        <g id="Active Prelogin overlay">
          <rect fill="url(#paint0_linear_1_9743)" height="591" id="Rectangle" transform="matrix(1 0 0 -1 0 591)" width="375" />
          <rect fill="url(#paint1_linear_1_9743)" height="270" id="Rectangle_2" width="375" y="542" />
          <path d="M375 370H0V0H375V370Z" fill="url(#paint2_linear_1_9743)" id="Rectangle_3" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_9743" x1="56.0541" x2="56.0541" y1="0" y2="414.318">
            <stop stopOpacity="0.01" />
            <stop offset="1" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_9743" x1="104.167" x2="104.167" y1="566.696" y2="686.696">
            <stop stopOpacity="0.01" />
            <stop offset="1" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_9743" x1="187" x2="187" y1="370" y2="82.931">
            <stop stopOpacity="0" />
            <stop offset="1" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function BatteryIcon() {
  return (
    <div className="-translate-y-1/2 absolute h-[11.5px] right-0 top-[calc(50%-0.75px)] w-[26.5px]" data-name="Battery Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.5 11.5">
        <g id="Battery Icon">
          <path d={svgPaths.p32feca80} id="Battery Outline" opacity="0.47" stroke="var(--stroke-0, white)" />
          <path d={svgPaths.p303cb380} fill="var(--fill-0, white)" id="Battery Connector" opacity="0.58" />
          <path clipRule="evenodd" d={svgPaths.p34553880} fill="var(--fill-0, white)" fillRule="evenodd" id="Battery Fill" />
        </g>
      </svg>
    </div>
  );
}

function Battery() {
  return (
    <div className="-translate-y-1/2 absolute h-[15px] overflow-clip right-0 top-1/2 w-[62.5px]" data-name="Battery">
      <BatteryIcon />
      <p className="absolute font-['SF_Pro_Text:Regular',sans-serif] leading-[normal] not-italic right-[29.5px] text-[12px] text-right text-white top-[calc(50%-7.5px)] w-[33px] whitespace-pre-wrap">100%</p>
    </div>
  );
}

function RightDetail() {
  return (
    <div className="-translate-y-1/2 absolute h-[15px] overflow-clip right-0 top-[calc(50%-0.25px)] w-[73px]" data-name="Right Detail">
      <Battery />
      <div className="absolute inset-[3.33%_90.41%_16.67%_0]" data-name="bluetooth">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 12">
          <path d={svgPaths.p3113e300} fill="var(--fill-0, white)" id="bluetooth" />
        </svg>
      </div>
    </div>
  );
}

function LeftDetail() {
  return (
    <div className="-translate-y-1/2 absolute h-[10px] left-0 top-[calc(50%-1.25px)] w-[35px]" data-name="Left Detail">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 10">
        <g clipPath="url(#clip0_1_9713)" id="Left Detail">
          <path d={svgPaths.p23acee00} fill="var(--fill-0, white)" id="Signal" />
          <g id="Wifi">
            <path clipRule="evenodd" d={svgPaths.p3e004880} fill="white" fillRule="evenodd" />
            <path d={svgPaths.p73b7cf0} fill="var(--stroke-0, white)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_1_9713">
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
      <p className="absolute font-['SF_Pro_Text:Semibold',sans-serif] leading-[normal] left-[132px] not-italic right-[129.5px] text-[12px] text-center text-white top-[calc(50%-7.25px)] whitespace-pre-wrap">9:41 AM</p>
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

function Group2() {
  return (
    <div className="absolute inset-[5%_87.14%_1.89%_0.07%]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.2486 22.347">
        <g id="Group 2">
          <path d={svgPaths.p1c620d00} fill="var(--fill-0, #E1061C)" id="Shape" />
          <path d={svgPaths.p3a678c00} fill="var(--fill-0, #E1061C)" id="Shape_2" />
          <path clipRule="evenodd" d={svgPaths.p1c999100} fill="var(--fill-0, white)" fillRule="evenodd" id="Shape_3" />
        </g>
      </svg>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[11.6%_0.49%_5.95%_15.81%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 145.651 19.7899">
        <g id="Group">
          <path d={svgPaths.p322bca60} fill="var(--fill-0, white)" id="Shape" />
          <path d={svgPaths.p357164f0} fill="var(--fill-0, white)" id="Shape_2" />
          <path d={svgPaths.p1b4c9100} fill="var(--fill-0, white)" id="Shape_3" />
          <path d={svgPaths.p3a418300} fill="var(--fill-0, white)" id="Shape_4" />
          <path d={svgPaths.p1ba79e70} fill="var(--fill-0, white)" id="Shape_5" />
          <path d={svgPaths.p292a3500} fill="var(--fill-0, white)" id="Shape_6" />
          <path d={svgPaths.p19c0ae00} fill="var(--fill-0, white)" id="Shape_7" />
          <path d={svgPaths.p2b636980} fill="var(--fill-0, white)" id="Shape_8" />
          <path d={svgPaths.p39c16200} fill="var(--fill-0, white)" id="Shape_9" />
          <path d={svgPaths.p3e816c30} fill="var(--fill-0, white)" id="Shape_10" />
          <path d={svgPaths.p15d0d480} fill="var(--fill-0, white)" id="Shape_11" />
          <path d={svgPaths.p2d1393b0} fill="var(--fill-0, white)" id="Shape_12" />
          <path d={svgPaths.p2cc5f200} fill="var(--fill-0, white)" id="Shape_13" />
        </g>
      </svg>
    </div>
  );
}

function Lettering() {
  return (
    <div className="absolute contents inset-[5%_0.49%_1.89%_0.07%]" data-name="lettering">
      <Group2 />
      <Group />
    </div>
  );
}

function ZSystemLogoUnicreditBank() {
  return (
    <div className="absolute contents inset-[5%_0.49%_1.89%_0.07%]" data-name="Z-system/Logo/UnicreditBank">
      <Lettering />
    </div>
  );
}

function Component9ImagesLogoUnicreditBankFfffff() {
  return (
    <div className="h-[24px] relative shrink-0 w-[174px]" data-name="9 Images/Logo/UnicreditBank#FFFFFF">
      <ZSystemLogoUnicreditBank />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-px items-end justify-center relative shrink-0">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-right text-white">ENG</p>
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_-2%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 1">
            <path d="M0.5 0.5H25.5" id="Line 2" stroke="var(--stroke-0, white)" strokeLinecap="square" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex items-center justify-between px-[24px] relative shrink-0 w-[375px]">
      <Component9ImagesLogoUnicreditBankFfffff />
      <Frame8 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-start left-0 top-0 w-[375px]" data-name="Header">
      <IPhoneStatusBar />
      <Frame11 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-white content-stretch flex h-[48px] items-center justify-center left-[24px] py-[12px] rounded-[4px] top-[660px] w-[327px]" data-name="Button">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[18px] text-center whitespace-nowrap">
        <p className="leading-[normal]">Log in</p>
      </div>
    </div>
  );
}

function IcNavigationChevronrightBlack() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_chevronright_black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_chevronright_black">
          <path d={svgPaths.p248d8e40} fill="var(--fill-0, white)" id="Icon" />
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-br-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[normal]">CONTACTS</p>
      </div>
      <IcNavigationChevronrightBlack />
    </div>
  );
}

function IcNavigationChevronrightBlack1() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_chevronright_black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_chevronright_black">
          <path d={svgPaths.p248d8e40} fill="var(--fill-0, white)" id="Icon" />
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-br-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[normal]">MTOKEN</p>
      </div>
      <IcNavigationChevronrightBlack1 />
    </div>
  );
}

function IcNavigationChevronrightBlack2() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_chevronright_black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_chevronright_black">
          <path d={svgPaths.p248d8e40} fill="var(--fill-0, white)" id="Icon" />
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-br-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[normal]">OTHER</p>
      </div>
      <IcNavigationChevronrightBlack2 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[24px] top-[748px] w-[327px]">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[16%_4.45%_9.75%_4.45%]" data-name="Group">
      <div className="absolute flex inset-[16%_41.95%_9.75%_4.45%] items-center justify-center">
        <div className="flex-none h-[5px] rotate-20 w-[21px]">
          <div className="bg-[#e5e5e5] rounded-[4px] size-full" />
        </div>
      </div>
      <div className="absolute flex inset-[16%_4.45%_9.75%_41.95%] items-center justify-center">
        <div className="-rotate-20 flex-none h-[5px] w-[21px]">
          <div className="bg-[#e5e5e5] rounded-[4px] size-full" data-name="Rectangle 11 Copy" />
        </div>
      </div>
    </div>
  );
}

function Component11NativeContainerStatusBarMore() {
  return (
    <div className="-translate-x-1/2 absolute h-[16px] left-[calc(50%+0.5px)] top-0 w-[40px]" data-name="11 Native/ContainerStatusBar/More">
      <Group1 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="h-[16px] relative shrink-0 w-full">
      <div className="content-stretch flex items-start p-[10px] relative size-full">
        <Component11NativeContainerStatusBarMore />
      </div>
    </div>
  );
}

function IcNavigationPreloginActivatetokensWhite() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_prelogin_activatetokens_white">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_prelogin_activatetokens_white">
          <path d={svgPaths.pa8e0080} fill="var(--fill-0, white)" id="Icon" />
          <g id="Object">
            <mask height="23" id="mask0_1_9663" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="22" x="5" y="5">
              <path d={svgPaths.pa8e0080} fill="var(--fill-0, white)" id="Icon_2" />
            </mask>
            <g mask="url(#mask0_1_9663)" />
          </g>
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full whitespace-pre-wrap">ABOUT SMART BANKING</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationPreloginActivatetokensWhite />
      <Frame />
    </div>
  );
}

function LightRestyleNavigation() {
  return (
    <div className="content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]" data-name="Light Restyle/Navigation">
      <Frame4 />
    </div>
  );
}

function IcNavigationPaymentsExchangeratesWhite() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_payments_exchangerates_white">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_payments_exchangerates_white">
          <g id="SafeArea24" />
          <path d={svgPaths.p27220500} fill="var(--fill-0, white)" id="Combined Shape" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full whitespace-pre-wrap">EXCHANGE RATES</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationPaymentsExchangeratesWhite />
      <Frame1 />
    </div>
  );
}

function LightRestyleNavigation1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]" data-name="Light Restyle/Navigation">
      <Frame5 />
    </div>
  );
}

function IcNavigationRestyleLocatorWhite() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_LocatorWhite">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_LocatorWhite">
          <g id="SafeArea24" />
          <g id="Locator">
            <path clipRule="evenodd" d={svgPaths.p343f1f80} fill="var(--fill-0, white)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full whitespace-pre-wrap">{`FIND ATM & BRANCHES`}</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationRestyleLocatorWhite />
      <Frame2 />
    </div>
  );
}

function LightRestyleNavigation2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]" data-name="Light Restyle/Navigation">
      <Frame6 />
    </div>
  );
}

function IcNavigationRestyleLocatorWhite1() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_LocatorWhite">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_LocatorWhite">
          <g id="SafeArea24" />
          <g id="Navigation and action/Share screen_K10">
            <path clipRule="evenodd" d={svgPaths.p70ed400} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full whitespace-pre-wrap">START CO-APPING SESSION</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationRestyleLocatorWhite1 />
      <Frame3 />
    </div>
  );
}

function LightRestyleNavigation3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[80px] items-center px-[16px] py-[24px] relative shrink-0 w-[375px]" data-name="Light Restyle/Navigation">
      <Frame7 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[375px]">
      <LightRestyleNavigation />
      <LightRestyleNavigation1 />
      <LightRestyleNavigation2 />
      <LightRestyleNavigation3 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#262626] bottom-0 content-stretch flex flex-col gap-[8px] items-start left-1/2 py-[24px] rounded-tl-[12px] rounded-tr-[12px]">
      <Frame10 />
      <Frame13 />
    </div>
  );
}

function Panel() {
  return (
    <div className="absolute bottom-0 h-[812px] left-0 w-[375px]" data-name="Panel">
      <div className="absolute backdrop-blur-[5.939px] bg-black inset-0 opacity-51" data-name="Screen Dimming" />
      <Frame9 />
    </div>
  );
}

export default function NewPreLoginActive() {
  return (
    <div className="bg-black relative size-full" data-name="New Pre Login - Active">
      <div className="absolute h-[897px] left-[-53px] top-[-42px] w-[1280px]" data-name="estate-meteorologica-inizio-oggi-quando-solstizio-significato-1653983376708_1280.jpg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgEstateMeteorologicaInizioOggiQuandoSolstizioSignificato16539833767081280Jpg} />
        </div>
      </div>
      <ActivePreloginOverlay />
      <Header />
      <Button />
      <Frame12 />
      <p className="absolute font-['UniCredit:Regular',sans-serif] leading-[normal] left-[24px] not-italic text-[18px] text-white top-[166px] w-[327px] whitespace-pre-wrap">All bank services in your pocket!</p>
      <div className="absolute font-['UniCredit:Bold',sans-serif] leading-[40px] left-[24px] not-italic text-[38px] text-white top-[78px] w-[327px] whitespace-pre-wrap">
        <p className="mb-0">New look,</p>
        <p>{`& more services.`}</p>
      </div>
      <Panel />
    </div>
  );
}