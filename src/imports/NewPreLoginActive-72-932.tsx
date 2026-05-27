import svgPaths from "./svg-zhp7xh4bmi";
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
        <g clipPath="url(#clip0_72_936)" id="Left Detail">
          <path d={svgPaths.p23acee00} fill="var(--fill-0, white)" id="Signal" />
          <g id="Wifi">
            <path clipRule="evenodd" d={svgPaths.p3e004880} fill="white" fillRule="evenodd" />
            <path d={svgPaths.p73b7cf0} fill="var(--stroke-0, white)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_72_936">
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

function Group1() {
  return (
    <div className="absolute inset-[5%_87.14%_1.89%_0.07%]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.2483 22.347">
        <g id="Group 2">
          <path d={svgPaths.p1c620d00} fill="var(--fill-0, #E1061C)" id="Shape" />
          <path d={svgPaths.p17bca3c0} fill="var(--fill-0, #E1061C)" id="Shape_2" />
          <path clipRule="evenodd" d={svgPaths.p2a77a780} fill="var(--fill-0, white)" fillRule="evenodd" id="Shape_3" />
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
          <path d={svgPaths.p2bbcf1c0} fill="var(--fill-0, white)" id="Shape" />
          <path d={svgPaths.p31616600} fill="var(--fill-0, white)" id="Shape_2" />
          <path d={svgPaths.pa219500} fill="var(--fill-0, white)" id="Shape_3" />
          <path d={svgPaths.p1776a200} fill="var(--fill-0, white)" id="Shape_4" />
          <path d={svgPaths.p2f2c2800} fill="var(--fill-0, white)" id="Shape_5" />
          <path d={svgPaths.p5e6d200} fill="var(--fill-0, white)" id="Shape_6" />
          <path d={svgPaths.p3aedad60} fill="var(--fill-0, white)" id="Shape_7" />
          <path d={svgPaths.p17605b00} fill="var(--fill-0, white)" id="Shape_8" />
          <path d={svgPaths.p1ebae3f0} fill="var(--fill-0, white)" id="Shape_9" />
          <path d={svgPaths.p378e5e80} fill="var(--fill-0, white)" id="Shape_10" />
          <path d={svgPaths.p159ffa60} fill="var(--fill-0, white)" id="Shape_11" />
          <path d={svgPaths.p5405500} fill="var(--fill-0, white)" id="Shape_12" />
          <path d={svgPaths.p2cc5f200} fill="var(--fill-0, white)" id="Shape_13" />
        </g>
      </svg>
    </div>
  );
}

function Lettering() {
  return (
    <div className="absolute contents inset-[5%_0.49%_1.89%_0.07%]" data-name="lettering">
      <Group1 />
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

function Frame() {
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

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-between px-[24px] relative shrink-0 w-[375px]">
      <Component9ImagesLogoUnicreditBankFfffff />
      <Frame />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-start left-0 top-0 w-[375px]" data-name="Header">
      <IPhoneStatusBar />
      <Frame1 />
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

function Frame2() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[24px] top-[748px] w-[327px]">
      <Button1 />
      <Button2 />
      <Button3 />
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
      <Frame2 />
      <p className="absolute font-['UniCredit:Regular',sans-serif] leading-[normal] left-[24px] not-italic text-[18px] text-white top-[166px] w-[327px] whitespace-pre-wrap">All bank services in your pocket!</p>
      <div className="absolute font-['UniCredit:Bold',sans-serif] leading-[40px] left-[24px] not-italic text-[38px] text-white top-[78px] w-[327px] whitespace-pre-wrap">
        <p className="mb-0">New look,</p>
        <p>{`& more services.`}</p>
      </div>
    </div>
  );
}