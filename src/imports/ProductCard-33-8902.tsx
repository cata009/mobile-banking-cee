import svgPaths from "./svg-b9govh2j99";

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

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start not-italic relative shrink-0 w-full">
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[18px] text-black w-full whitespace-pre-wrap">Primary Account</p>
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] h-[18px] justify-center leading-[0] relative shrink-0 text-[#262626] text-[14px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">1234567890123456</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[247px]">
      <Frame3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <IcNavigationHomepageRestyleAccount />
      <Frame />
    </div>
  );
}

function Group() {
  return (
    <div className="content-stretch flex items-baseline justify-end not-italic relative shrink-0 text-[#262626] text-right w-full">
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] relative shrink-0 text-[20px] whitespace-nowrap">
        <p className="leading-[normal]">1.429.089</p>
      </div>
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px]">,00 CZK</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[16px] relative w-full">
        <Frame1 />
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

export default function ProductCard() {
  return (
    <div className="content-stretch flex flex-col items-center relative size-full" data-name="Product card">
      <Frame2 />
      <SecondoElemento />
    </div>
  );
}