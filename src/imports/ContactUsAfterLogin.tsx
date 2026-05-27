import svgPaths from "./svg-1bppizgqls";
import imgPlaceholder from "figma:asset/98dd23c242155a923a78eda01f9320afee4330eb.png";

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
        <g clipPath="url(#clip0_243_4900)" id="Left Detail">
          <path d={svgPaths.p23acee00} fill="var(--fill-0, black)" id="Signal" />
          <g id="Wifi">
            <path clipRule="evenodd" d={svgPaths.p3e004880} fill="black" fillRule="evenodd" />
            <path d={svgPaths.p73b7cf0} fill="var(--stroke-0, black)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_243_4900">
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
    <div className="bg-white h-[20px] relative shrink-0 w-[375px]" data-name="iPhone Status Bar">
      <StatusBar />
    </div>
  );
}

function IcNavigationRestyleChevronLeftBig() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_chevron-left-big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_chevron-left-big">
          <g id="SafeArea24" />
          <g id="Back">
            <path clipRule="evenodd" d={svgPaths.p3228c4f0} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IcNavigationRestyleFaq() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_FAQ">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_FAQ">
          <g id="Navigation and action_FAQ">
            <path clipRule="evenodd" d={svgPaths.p367fd70} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex items-start justify-between pr-[16px] relative shrink-0 w-[375px]">
      <IcNavigationRestyleChevronLeftBig />
      <IcNavigationRestyleFaq />
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex items-center pl-[24px] pr-[16px] pt-[10px] relative shrink-0 w-[375px]">
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#262626] text-[28px] whitespace-pre-wrap">{`Contact us `}</p>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative shrink-0 w-[375px]" data-name="Header">
      <IPhoneStatusBar />
      <Frame18 />
      <Frame19 />
    </div>
  );
}

function Placeholder() {
  return (
    <div className="content-stretch flex h-[160px] items-center justify-center overflow-clip px-[109px] py-[58px] relative rounded-[8px] shrink-0 w-[327px]" data-name="Placeholder">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8px] size-full" src={imgPlaceholder} />
    </div>
  );
}

function Divider1() {
  return (
    <div className="absolute h-px left-0 top-[31px] w-[375px]" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <path d="M16.5359 0.5H358.464" id="Line" stroke="var(--stroke-0, #999999)" strokeLinecap="square" strokeWidth="0.25" />
        </g>
      </svg>
    </div>
  );
}

function Divider() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[5px] h-[32px] items-center justify-center pl-[24px] pr-[16px] pt-[6px] relative shrink-0 w-[375px]" data-name="Divider">
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#262626] text-[18px] w-[335px] whitespace-pre-wrap">BANK CONTACTS</p>
      <Divider1 />
    </div>
  );
}

function MiscellaneousPremiumK() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Miscellaneous/Premium_K10">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Miscellaneous/Premium_K10">
          <g id="Path">
            <path d={svgPaths.p287ddaf0} fill="var(--fill-0, #262626)" />
            <path d={svgPaths.pfd86a00} fill="var(--fill-0, #262626)" />
            <path d={svgPaths.p1800e240} fill="var(--fill-0, #262626)" />
            <path d={svgPaths.p3140e480} fill="var(--fill-0, #262626)" />
            <path d={svgPaths.p1abe0f00} fill="var(--fill-0, #262626)" />
            <path d={svgPaths.p9050200} fill="var(--fill-0, #262626)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[32px]">
      <MiscellaneousPremiumK />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <Frame30 />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-[251px] whitespace-pre-wrap">MY PRIME ADVISOR</p>
    </div>
  );
}

function Aempty() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="aempty">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="aempty">
          <g id="SafeArea24" />
          <g id="Forth">
            <path clipRule="evenodd" d={svgPaths.p1d931b00} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Navigation() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame />
      <Aempty />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Divider />
      <Navigation />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame22 />
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
            <path clipRule="evenodd" d={svgPaths.p343f1f80} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationRestyleLocatorWhite />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-[251px] whitespace-pre-wrap">{`BRANCH & ATM FINDER`}</p>
    </div>
  );
}

function Aempty1() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="aempty">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="aempty">
          <g id="SafeArea24" />
          <g id="Forth">
            <path clipRule="evenodd" d={svgPaths.p1d931b00} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Navigation1() {
  return (
    <div className="bg-white h-[80px] relative shrink-0 w-full" data-name="Navigation">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pl-[16px] pr-[12px] py-[24px] relative size-full">
          <Frame1 />
          <Aempty1 />
        </div>
      </div>
    </div>
  );
}

function IcNavigationHomepageRestyleTimeBlack() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_homepage_restyle_time_black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_homepage_restyle_time_black">
          <g id="SafeArea24" />
          <g id="Navigation and action/Time">
            <path clipRule="evenodd" d={svgPaths.p44d0f80} fill="var(--fill-0, #262626)" fillRule="evenodd" id="158" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-[251px] whitespace-pre-wrap">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">INFOLINE AVAILABILITY</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">Mon - Sun | 07:00 - 22:00</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <IcNavigationHomepageRestyleTimeBlack />
      <Frame3 />
    </div>
  );
}

function Navigation2() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame2 />
    </div>
  );
}

function IcNavigationRestylePhone() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_Phone">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_Phone">
          <g id="SafeArea24" />
          <g id="Phone support">
            <path clipRule="evenodd" d={svgPaths.p38534880} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[204px]">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-full whitespace-pre-wrap">CALL US</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative">
      <Frame6 />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#007a91] text-[14px]">+420 221 210 031</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center justify-center min-h-px min-w-px relative">
      <IcNavigationRestylePhone />
      <Frame5 />
    </div>
  );
}

function Navigation3() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame4 />
    </div>
  );
}

function IcActionbarBlockdeviceBlack() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_actionbar_blockdevice_black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_actionbar_blockdevice_black">
          <path clipRule="evenodd" d={svgPaths.p39847b70} fill="var(--fill-0, #262626)" fillRule="evenodd" id="185" />
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[204px]">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-full whitespace-pre-wrap">EMERGENCY LINE FOR CARD BLOCKING</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative">
      <Frame9 />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#007a91] text-[14px]">+420 221 210 012</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center justify-center min-h-px min-w-px relative">
      <IcActionbarBlockdeviceBlack />
      <Frame8 />
    </div>
  );
}

function Navigation4() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame7 />
    </div>
  );
}

function IcNavigationRestyleEmail() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_Email">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_Email">
          <g id="SafeArea24" />
          <g id="184">
            <path clipRule="evenodd" d={svgPaths.p10fcb600} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[204px]">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-full whitespace-pre-wrap">EMAIL</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative">
      <Frame12 />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#007a91] text-[14px]">INFO@UNICREDITGROUP.RO</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center justify-center min-h-px min-w-px relative">
      <IcNavigationRestyleEmail />
      <Frame11 />
    </div>
  );
}

function Navigation5() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame10 />
    </div>
  );
}

function IcNavigationRestyleWebSite() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_restyle_WebSite">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_restyle_WebSite">
          <g id="SafeArea24" />
          <g id="Online">
            <path clipRule="evenodd" d={svgPaths.p185b6700} fill="var(--fill-0, #262626)" fillRule="evenodd" id="Shape" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[204px]">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-full whitespace-pre-wrap">WEBSITE</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative">
      <Frame15 />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#007a91] text-[14px]">WWW.UNICREDIT.CZ</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center justify-center min-h-px min-w-px relative">
      <IcNavigationRestyleWebSite />
      <Frame14 />
    </div>
  );
}

function Navigation6() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame13 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <Frame28 />
      <Navigation1 />
      <Navigation2 />
      <Navigation3 />
      <Navigation4 />
      <Navigation5 />
      <Navigation6 />
    </div>
  );
}

function Divider3() {
  return (
    <div className="absolute h-px left-0 top-[31px] w-[375px]" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <path d="M16.5359 0.5H358.464" id="Line" stroke="var(--stroke-0, #999999)" strokeLinecap="square" strokeWidth="0.25" />
        </g>
      </svg>
    </div>
  );
}

function Divider2() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[5px] h-[32px] items-center justify-center pl-[24px] pr-[16px] pt-[6px] relative shrink-0 w-[375px]" data-name="Divider">
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#262626] text-[18px] w-[335px] whitespace-pre-wrap">SOCIAL MEDIA</p>
      <Divider3 />
    </div>
  );
}

function SocialIconYoutube() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Social icon/ Youtube">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Social icon/ Youtube">
          <path d={svgPaths.p2add4480} fill="var(--fill-0, #262626)" id="1002" />
        </g>
      </svg>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <SocialIconYoutube />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-[251px] whitespace-pre-wrap">YOUTUBE</p>
    </div>
  );
}

function Navigation7() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame16 />
    </div>
  );
}

function SocialIconX() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Social icon/ X">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Social icon/ X">
          <path d={svgPaths.p7707070} fill="var(--fill-0, #262626)" id="1000" />
        </g>
      </svg>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
      <SocialIconX />
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-[251px] whitespace-pre-wrap">X</p>
    </div>
  );
}

function Navigation8() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[80px] items-center pl-[16px] pr-[12px] py-[24px] relative shrink-0 w-[375px]" data-name="Navigation">
      <Frame17 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <Navigation7 />
      <Navigation8 />
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Divider2 />
      <Frame27 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <Frame23 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0">
      <Frame24 />
      <Frame26 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
      <Placeholder />
      <Frame25 />
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="bg-white h-[20px] relative shrink-0 w-[375px]" data-name="Home Indicator">
      <div className="-translate-x-1/2 absolute bg-[#262626] bottom-[8px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] w-[134px]" data-name="Home Indicator" />
    </div>
  );
}

function NavbarLightMode() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center relative shrink-0" data-name="Navbar Light Mode">
      <HomeIndicator />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0">
      <NavbarLightMode />
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-[376px]">
      <Frame20 />
    </div>
  );
}

export default function ContactUsAfterLogin() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] items-start relative size-full" data-name="Contact us after login">
      <Header />
      <Frame21 />
      <Frame29 />
    </div>
  );
}