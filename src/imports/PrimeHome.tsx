import svgPaths from "./svg-4ivm7mrbpm";
import imgAdvisorImage from "figma:asset/e693dd6eed452da6c4cda0e69dbdd3f45039c9f2.png";
import imgPrimeHome from "figma:asset/6f8736f05a24b87b9ef5508cfd9021e9a466bf48.png";

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
        <g clipPath="url(#clip0_185_3563)" id="Left Detail">
          <path d={svgPaths.p23acee00} fill="var(--fill-0, white)" id="Signal" />
          <g id="Wifi">
            <path clipRule="evenodd" d={svgPaths.p3e004880} fill="white" fillRule="evenodd" />
            <path d={svgPaths.p73b7cf0} fill="var(--stroke-0, white)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_185_3563">
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

function BackButtonIcon() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Back Button Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Back Button Icon">
          <g id="SafeArea24" />
          <g id="Back">
            <path clipRule="evenodd" d={svgPaths.p3228c4f0} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function RiDiamondLine() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="ri:diamond-line">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="ri:diamond-line">
          <path d={svgPaths.p3c615d00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p1479ef80} fill="var(--fill-0, white)" id="250" />
        </g>
      </svg>
    </div>
  );
}

function UpgradeIconContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Upgrade Icon Container">
      <RiDiamondLine />
    </div>
  );
}

function QuickActionSquared() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex gap-[5px] items-center justify-center px-[12px] py-[6px] relative rounded-[16px] shrink-0" data-name="Quick Action/Squared">
      <UpgradeIconContainer />
      <div className="flex flex-col font-['UniCredit:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[16px]">Upgrade</p>
      </div>
    </div>
  );
}

function UpgradeContainer() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center opacity-0 py-[8px] relative shrink-0" data-name="Upgrade Container">
      <QuickActionSquared />
    </div>
  );
}

function BackButtonContainer() {
  return (
    <div className="content-stretch flex items-center justify-between pr-[24px] relative shrink-0 w-[375px]" data-name="Back Button Container">
      <BackButtonIcon />
      <UpgradeContainer />
    </div>
  );
}

function TitleContainer() {
  return (
    <div className="content-stretch flex items-center pl-[24px] pr-[16px] pt-[10px] relative shrink-0 w-[375px]" data-name="Title Container">
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[28px] text-white whitespace-pre-wrap">Prime by UniCredit Bank</p>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Header">
      <IPhoneStatusBar />
      <BackButtonContainer />
      <TitleContainer />
    </div>
  );
}

function InteractiveText() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name=".Interactive text">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#262626] text-[14px] uppercase">YOUR ADVISOR</p>
    </div>
  );
}

function Chip() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center px-[16px] py-[8px] relative rounded-[4px] shrink-0" data-name="Chip">
      <InteractiveText />
    </div>
  );
}

function InteractiveText1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name=".Interactive text">
      <p className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white uppercase">YOUR BENEFITS</p>
    </div>
  );
}

function Chip1() {
  return (
    <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative rounded-[4px] shrink-0" data-name="Chip">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[4px]" />
      <InteractiveText1 />
    </div>
  );
}

function TabsContainer() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Tabs Container">
      <Chip />
      <Chip1 />
    </div>
  );
}

function AdvisorImage() {
  return (
    <div className="relative rounded-[100px] shrink-0 size-[64px]" data-name="Advisor Image">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full" src={imgAdvisorImage} />
    </div>
  );
}

function AdvisorImageContainer() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Advisor Image Container">
      <AdvisorImage />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] h-full items-start justify-center leading-[normal] min-h-px min-w-px not-italic relative text-[16px] text-white whitespace-pre-wrap" data-name="List">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">YOUR ADVISOR</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">David Novak</p>
    </div>
  );
}

function AdvisorInfoRow() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-[295px]" data-name="Advisor Info Row">
      <AdvisorImageContainer />
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <List />
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px min-w-px not-italic py-[8px] relative text-[16px] text-white whitespace-pre-wrap" data-name="List">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">PHONE NUMBER</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">+420 602 123 456</p>
    </div>
  );
}

function PhoneNumberRow() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Phone Number Row">
      <List1 />
    </div>
  );
}

function List2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px min-w-px not-italic py-[8px] relative text-[16px] text-white whitespace-pre-wrap" data-name="List">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">E-MAIL</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">david.novak@unicredit.cz</p>
    </div>
  );
}

function EmailRow() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Email Row">
      <List2 />
    </div>
  );
}

function List3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px min-w-px not-italic py-[8px] relative text-[16px] text-white whitespace-pre-wrap" data-name="List">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">BRANCH NAME</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">Branch name 36</p>
    </div>
  );
}

function BranchStatusContainer() {
  return (
    <div className="content-stretch flex h-full items-start justify-end opacity-0 py-[8px] relative rounded-[8px] shrink-0" data-name="Branch Status Container">
      <div className="font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[0px] text-[14px] text-right text-white whitespace-nowrap">
        <p className="mb-0">OPENED</p>
        <p className="font-['UniCredit:Regular',sans-serif]">until 18:00</p>
      </div>
    </div>
  );
}

function BranchNameContainer() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-full" data-name="Branch Name Container">
      <List3 />
      <div className="flex flex-row items-center self-stretch">
        <BranchStatusContainer />
      </div>
    </div>
  );
}

function BranchNameRow() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Branch Name Row">
      <BranchNameContainer />
    </div>
  );
}

function List4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px min-w-px not-italic py-[8px] relative text-[16px] text-white whitespace-pre-wrap" data-name="List">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">BRANCH ADDRESS</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">Želetavská 1525/1, 140 92, Praha 4</p>
    </div>
  );
}

function DirectionIcon() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Direction Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Direction Icon">
          <path clipRule="evenodd" d={svgPaths.p25a58600} fill="var(--fill-0, white)" fillRule="evenodd" id="062" />
          <g id="SafeArea24" />
        </g>
      </svg>
    </div>
  );
}

function BranchAddressContainer() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-full" data-name="Branch Address Container">
      <List4 />
      <DirectionIcon />
    </div>
  );
}

function BranchAddressRow() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Branch Address Row">
      <BranchAddressContainer />
    </div>
  );
}

function BankTouchpointAndCustomerCarePhoneSupportK() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Bank touchpoint AND CUSTOMER CARE/Phone support_K10">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Bank touchpoint AND CUSTOMER CARE/Phone support_K10">
          <g id="Path">
            <path d={svgPaths.p2bdf8180} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3f51c500} fill="var(--fill-0, white)" />
            <path d={svgPaths.p35db4800} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3aed3500} fill="var(--fill-0, white)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-start justify-center max-w-[79px] relative shrink-0">
      <p className="flex-[1_0_0] font-['UniCredit:Medium',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-center text-white whitespace-pre-wrap">Call now</p>
    </div>
  );
}

function QuickActionSquared1() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] flex-[1_0_0] min-h-[124px] min-w-px relative rounded-[16px]" data-name="Quick Action/Squared">
      <div className="flex flex-col items-center justify-center min-h-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-center min-h-[inherit] px-[4px] py-[24px] relative w-full">
          <BankTouchpointAndCustomerCarePhoneSupportK />
          <Frame />
        </div>
      </div>
    </div>
  );
}

function NavigationAndActionMessaggesK() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Navigation and action/Messagges_K10">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Navigation and action/Messagges_K10">
          <g id="Path">
            <path d={svgPaths.p3b0b8280} fill="var(--fill-0, white)" />
            <path d={svgPaths.p2c048300} fill="var(--fill-0, white)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-start justify-center max-w-[79px] relative shrink-0">
      <p className="flex-[1_0_0] font-['UniCredit:Medium',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-center text-white whitespace-pre-wrap">Send an email</p>
    </div>
  );
}

function QuickActionSquared2() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] flex-[1_0_0] min-h-[124px] min-w-px relative rounded-[16px]" data-name="Quick Action/Squared">
      <div className="flex flex-col items-center justify-center min-h-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-center min-h-[inherit] px-[4px] py-[24px] relative w-full">
          <NavigationAndActionMessaggesK />
          <Frame1 />
        </div>
      </div>
    </div>
  );
}

function ContactButtonsContainer() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Contact Buttons Container">
      <QuickActionSquared1 />
      <QuickActionSquared2 />
    </div>
  );
}

function ContactOptionsContainer1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Contact Options Container">
      <ContactButtonsContainer />
    </div>
  );
}

function ContactOptionsContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Contact Options Container">
      <ContactOptionsContainer1 />
    </div>
  );
}

function AdvisorDetailsContainer3() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col gap-[16px] items-start p-[16px] relative rounded-[16px] shrink-0 w-[327px]" data-name="Advisor Details Container">
      <AdvisorInfoRow />
      <PhoneNumberRow />
      <EmailRow />
      <BranchNameRow />
      <BranchAddressRow />
      <ContactOptionsContainer />
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[14px] text-center text-white w-[min-content] whitespace-pre-wrap">Available during interval 08-18, from Monday to Friday</p>
    </div>
  );
}

function AdvisorDetailsContainer2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Advisor Details Container">
      <AdvisorDetailsContainer3 />
    </div>
  );
}

function AdvisorDetailsContainer1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Advisor Details Container">
      <AdvisorDetailsContainer2 />
    </div>
  );
}

function AdvisorDetailsContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Advisor Details Container">
      <AdvisorDetailsContainer1 />
    </div>
  );
}

function AdvisorInfoContainer1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[327px]" data-name="Advisor Info Container">
      <AdvisorDetailsContainer />
    </div>
  );
}

function CommonPremium() {
  return (
    <div className="relative shrink-0 size-[14.318px]" data-name="Common/Premium">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.3184 14.318">
        <g id="Common/Premium">
          <path d={svgPaths.p1c66f100} fill="var(--fill-0, white)" id="213" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[14.318px]">
      <CommonPremium />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex h-full items-center pt-[2.603px] relative shrink-0">
      <Frame2 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[2.603px] items-center relative shrink-0">
      <p className="font-['UniCredit:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[18.223px] text-white">Prime</p>
      <div className="flex flex-row items-center self-stretch">
        <Frame3 />
      </div>
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[13.016px] text-white">by</p>
    </div>
  );
}

function ZSystemLogoUnicreditBank() {
  return (
    <div className="h-[9.762px] relative shrink-0 w-[75.604px]" data-name="Z-system/Logo/UnicreditBank">
      <div className="absolute inset-[0_-0.01%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75.625 9.76226">
          <g id="Z-system/Logo/UnicreditBank">
            <path d={svgPaths.p13052c00} fill="var(--fill-0, #E1061C)" id="Shape" />
            <path d={svgPaths.p3c560500} fill="var(--fill-0, #E1061C)" id="Shape_2" />
            <path clipRule="evenodd" d={svgPaths.p3ca9bf80} fill="var(--fill-0, white)" fillRule="evenodd" id="Shape_3" />
            <path d={svgPaths.p1834a500} fill="var(--fill-0, white)" id="Shape_4" />
            <path d={svgPaths.p17272d80} fill="var(--fill-0, white)" id="Shape_5" />
            <path d={svgPaths.p29df9f00} fill="var(--fill-0, white)" id="Shape_6" />
            <path d={svgPaths.pbda0e80} fill="var(--fill-0, white)" id="Shape_7" />
            <path d={svgPaths.p1ce7ba00} fill="var(--fill-0, white)" id="Shape_8" />
            <path d={svgPaths.p2c4fd100} fill="var(--fill-0, white)" id="Shape_9" />
            <path d={svgPaths.p6540400} fill="var(--fill-0, white)" id="Shape_10" />
            <path d={svgPaths.p300b6500} fill="var(--fill-0, white)" id="Shape_11" />
            <path d={svgPaths.p28ab6800} fill="var(--fill-0, white)" id="Shape_12" />
            <path d={svgPaths.p118b800} fill="var(--fill-0, white)" id="Shape_13" />
            <path d={svgPaths.p27431f00} fill="var(--fill-0, white)" id="Shape_14" />
            <path d={svgPaths.pc51b080} fill="var(--fill-0, white)" id="Shape_15" />
            <path d={svgPaths.p22773e00} fill="var(--fill-0, white)" id="Shape_16" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[2.603px] items-start relative shrink-0">
      <Frame4 />
      <ZSystemLogoUnicreditBank />
    </div>
  );
}

function TitleContainer1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Title Container">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[14.289px] relative w-full">
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
      <TitleContainer1 />
    </div>
  );
}

function AdvisorInfoContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[327px]" data-name="Advisor Info Container">
      <TabsContainer />
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[18px] text-white w-[min-content] whitespace-pre-wrap">Need personalized support? Your bank advisor is just a call away, ready to assist you with any request, anytime!</p>
      <AdvisorInfoContainer1 />
      <Frame6 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="Container">
      <Header />
      <AdvisorInfoContainer />
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="h-[20px] relative shrink-0 w-[375px]" data-name="Home Indicator">
      <div className="-translate-x-1/2 absolute bg-white bottom-[8px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] w-[134px]" data-name="Home Indicator" />
    </div>
  );
}

function NavbarLightMode() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Navbar Light Mode">
      <HomeIndicator />
    </div>
  );
}

function FooterContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Footer Container">
      <NavbarLightMode />
    </div>
  );
}

export default function PrimeHome() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative size-full" data-name="Prime home">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(210.406deg, rgb(116, 151, 192) 32.305%, rgb(38, 38, 38) 60.005%)" }} />
        <div className="absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\'0 0 375 940.37\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'><rect x=\'0\' y=\'0\' height=\'100%\' width=\'100%\' fill=\'url(%23grad)\' opacity=\'0.20000000298023224\'/><defs><radialGradient id=\'grad\' gradientUnits=\'userSpaceOnUse\' cx=\'0\' cy=\'0\' r=\'10\' gradientTransform=\'matrix(-0.05 46.965 -23.194 -0.027879 188 470.71)\'><stop stop-color=\'rgba(19,64,151,1)\' offset=\'0\'/><stop stop-color=\'rgba(15,48,113,1)\' offset=\'0.25\'/><stop stop-color=\'rgba(10,32,75,1)\' offset=\'0.5\'/><stop stop-color=\'rgba(5,16,38,1)\' offset=\'0.75\'/><stop stop-color=\'rgba(2,8,19,1)\' offset=\'0.875\'/><stop stop-color=\'rgba(1,4,9,1)\' offset=\'0.9375\'/><stop stop-color=\'rgba(0,0,0,1)\' offset=\'1\'/></radialGradient></defs></svg>')" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\'0 0 375 940.37\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'><rect x=\'0\' y=\'0\' height=\'100%\' width=\'100%\' fill=\'url(%23grad)\' opacity=\'0.20000000298023224\'/><defs><radialGradient id=\'grad\' gradientUnits=\'userSpaceOnUse\' cx=\'0\' cy=\'0\' r=\'10\' gradientTransform=\'matrix(-7.5 66.782 -13.925 -1.7657 262.5 272.55)\'><stop stop-color=\'rgba(23,20,32,0)\' offset=\'0\'/><stop stop-color=\'rgba(38,38,38,1)\' offset=\'1\'/></radialGradient></defs></svg>')" }} />
        <img alt="" className="absolute max-w-none mix-blend-soft-light object-cover opacity-10 size-full" src={imgPrimeHome} />
        <div className="absolute bg-[rgba(0,0,0,0.2)] inset-0" />
      </div>
      <Container />
      <FooterContainer />
    </div>
  );
}