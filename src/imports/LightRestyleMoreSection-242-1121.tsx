import imgMicrosoftTeamsImage46 from "figma:asset/4d22afc493e4ab72aca4b5793ce68cd204c58b7f.png";
import { imgFrame550 } from "./svg-m4ue6";

function Group() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
    </div>
  );
}

function Frame() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[120px] items-start left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_1px] mask-size-[164px_119px] p-[16px] top-1/2 w-[164px]" style={{ maskImage: `url('${imgFrame550}')` }}>
      <div className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">
        <p className="mb-0">Contacts</p>
        <p>&nbsp;</p>
      </div>
    </div>
  );
}

export default function LightRestyleMoreSection() {
  return (
    <div className="relative size-full" data-name="Light Restyle/ More section">
      <Group />
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-[0.83%_0_0_0] rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <Frame />
      <div className="absolute inset-[36.67%_-2.62%_0_52.69%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-86.409px_-43px] mask-size-[164px_119px]" data-name="MicrosoftTeams-image (46)" style={{ maskImage: `url('${imgFrame550}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgMicrosoftTeamsImage46} />
        </div>
      </div>
    </div>
  );
}