import imgAdobeStock533298452 from "figma:asset/b756062d79e37b43d0eda8eee6125757ce5bb9bf.png";
import { imgFrame552 } from "./svg-umeeu";

function Frame() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[120px] items-start left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[164px_120px] p-[16px] top-1/2 w-[164px]" style={{ maskImage: `url('${imgFrame552}')` }}>
      <div className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">
        <p className="mb-0">Settings</p>
        <p>&nbsp;</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <div className="absolute inset-[47.86%_-30.03%_-29.17%_42.2%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-69.212px_-57.43px] mask-size-[164px_120px]" data-name="AdobeStock_533298452" style={{ maskImage: `url('${imgFrame552}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAdobeStock533298452} />
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