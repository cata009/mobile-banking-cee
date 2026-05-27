import imgGdpr from "figma:asset/e017033a83e177f2a0d9a121d8161971ab5db3b5.png";
import { imgFrame553 } from "./svg-0g68x";

function Frame() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[120px] items-start left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[164px_120px] p-[16px] top-1/2 w-[164px]" style={{ maskImage: `url('${imgFrame553}')` }}>
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">3rd Party consent</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <Frame />
      <div className="absolute flex inset-[15.28%_-37.87%_-87.03%_14.48%] items-center justify-center">
        <div className="-rotate-156 -scale-y-100 flex-none h-[158.373px] w-[151px]">
          <div className="mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-23.749px_-18.334px] mask-size-[164px_120px] relative size-full" data-name="GDPR" style={{ maskImage: `url('${imgFrame553}')` }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgGdpr} />
            </div>
          </div>
        </div>
      </div>
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