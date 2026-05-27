import svgPaths from "./svg-dx3926yo4l";

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
        <g clipPath="url(#clip0_14_3077)" id="Left Detail">
          <path d={svgPaths.p23acee00} fill="var(--fill-0, black)" id="Signal" />
          <g id="Wifi">
            <path clipRule="evenodd" d={svgPaths.p3e004880} fill="black" fillRule="evenodd" />
            <path d={svgPaths.p73b7cf0} fill="var(--stroke-0, black)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_14_3077">
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
          <rect fill="white" height="32" width="32" />
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

function Frame4() {
  return (
    <div className="content-stretch flex items-start justify-between pr-[16px] relative shrink-0 w-[375px]">
      <IcNavigationRestyleChevronLeftBig />
      <IcNavigationRestyleFaq />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-center pl-[24px] pr-[16px] pt-[10px] relative shrink-0 w-[375px]">
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#262626] text-[28px] whitespace-pre-wrap">Select language</p>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 top-0 w-[375px]" data-name="Header">
      <IPhoneStatusBar />
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#007a91] content-stretch flex h-[48px] items-center justify-center left-[24px] py-[12px] rounded-[4px] top-[740px] w-[327px]" data-name="Button">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">
        <p className="leading-[normal]">Save</p>
      </div>
    </div>
  );
}

function IcNavigationCheckboxdoneRestyle() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_checkboxdone_restyle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_checkboxdone_restyle">
          <g id="SafeArea24" />
          <circle cx="16" cy="16" fill="var(--fill-0, white)" id="Oval 2" r="11" stroke="var(--stroke-0, #262626)" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] uppercase w-[303px] whitespace-pre-wrap">Český</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
      <IcNavigationCheckboxdoneRestyle />
      <Frame />
    </div>
  );
}

function List() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[8px] h-[80px] items-center left-0 px-[16px] top-[125px] w-[375px]" data-name="List">
      <Frame2 />
    </div>
  );
}

function IcNavigationCheckboxdoneRestyle1() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="ic_navigation_checkboxdone_restyle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="ic_navigation_checkboxdone_restyle">
          <g id="SafeArea24" />
          <circle cx="16" cy="16" fill="var(--fill-0, white)" id="Oval 2" r="11" stroke="var(--stroke-0, #262626)" />
          <circle cx="16" cy="16" fill="var(--fill-0, #007A91)" id="Oval" r="5" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[16px] w-[303px] whitespace-pre-wrap">ENGLISH</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
      <IcNavigationCheckboxdoneRestyle1 />
      <Frame1 />
    </div>
  );
}

function List1() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[8px] h-[80px] items-center left-0 px-[16px] top-[205px] w-[375px]" data-name="List">
      <Frame3 />
    </div>
  );
}

export default function Validation() {
  return (
    <div className="bg-white relative size-full" data-name="Validation">
      <div className="relative size-full">
        <Header />
        <Button />
        <List />
        <List1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#ccc] border-solid inset-[-1px] pointer-events-none" />
    </div>
  );
}