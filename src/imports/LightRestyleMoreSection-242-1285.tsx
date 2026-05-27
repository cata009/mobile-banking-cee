import imgMicrosoftTeamsImage41 from "figma:asset/fabdcbcfc3ceae62811fed754b790551b42a2f6e.png";
import { imgFrame557 } from "./svg-bcx13";

function Frame() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex h-[120px] items-start left-1/2 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[164px_120px] p-[16px] top-0 w-[164px]" style={{ maskImage: `url('${imgFrame557}')` }}>
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">Tutorial</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <div className="absolute inset-[38.33%_0_0_51.83%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-85px_-46px] mask-size-[164px_120px]" data-name="MicrosoftTeams-image (41)" style={{ maskImage: `url('${imgFrame557}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgMicrosoftTeamsImage41} />
        </div>
      </div>
      <Frame />
    </div>
  );
}

export default function LightRestyleMoreSection() {
  return (
    <div className="relative size-full" data-name="Light Restyle/ More section">
      <Group />
    </div>
  );
}