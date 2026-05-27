import imgRectangle from "figma:asset/4d7abd397db5234d24f236a294f434a9b45b7d2b.png";
import { imgFrame554 } from "./svg-0eu38";

function Frame() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[120px] items-start left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[164px_120px] p-[16px] top-1/2 w-[164px]" style={{ maskImage: `url('${imgFrame554}')` }}>
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">GDPR Consent</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <div className="absolute bg-size-[61.60000091791153px_62.90000093728304px] bg-top-left bottom-[-35.83%] left-[38.66%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-63.4px_-60px] mask-size-[164px_120px] right-[-0.24%] top-1/2" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle}')`, maskImage: `url('${imgFrame554}')` }} />
      <div className="absolute bg-size-[61.60000091791153px_62.90000093728304px] bg-top-left inset-[178.33%_-163.41%_-164.17%_201.83%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-331px_-214px] mask-size-[164px_120px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle}')`, maskImage: `url('${imgFrame554}')` }} />
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