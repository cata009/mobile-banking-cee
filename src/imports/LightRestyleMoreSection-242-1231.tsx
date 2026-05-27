import imgAdobeStock576090462 from "figma:asset/947d85da595e4eb3e946a83cbab7bb8d8c148da1.png";
import { imgFrame555 } from "./svg-9hko5";

function Frame() {
  return (
    <div className="absolute content-stretch flex h-[120px] items-start left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[164px_120px] p-[16px] top-0 w-[164px]" style={{ maskImage: `url('${imgFrame555}')` }}>
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">Digital activities register</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <div className="absolute inset-[56.42%_-46.69%_-46.75%_49.96%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-81.931px_-67.706px] mask-size-[164px_120px]" data-name="AdobeStock_576090462" style={{ maskImage: `url('${imgFrame555}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAdobeStock576090462} />
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