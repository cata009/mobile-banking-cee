import imgProdottiEServizi from "figma:asset/612ac7960c2d43bfdada538aae6f3cf27be44d99.png";
import { imgFrame556 } from "./svg-wcbyp";

function Frame() {
  return (
    <div className="absolute content-stretch flex h-[120px] items-start left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[164px_120px] p-[16px] top-0 w-[164px]" style={{ maskImage: `url('${imgFrame556}')` }}>
      <p className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">My requests</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <div className="absolute inset-[37.22%_0_-6.36%_29.88%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-49px_-44.661px] mask-size-[164px_120px]" data-name="prodotti e servizi" style={{ maskImage: `url('${imgFrame556}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgProdottiEServizi} />
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