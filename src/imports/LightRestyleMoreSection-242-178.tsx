import svgPaths from "./svg-5leej5fnks";
import imgAdobeStock572760262 from "figma:asset/befcf83245a907a033553e7ac7902995e124d730.png";
import { imgFrame551 } from "./svg-vagwf";

function Frame() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[120px] items-start left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[164px_120px] p-[16px] top-1/2 w-[164px]" style={{ maskImage: `url('${imgFrame551}')` }}>
      <div className="flex-[1_0_0] font-['UniCredit:Bold',sans-serif] h-full leading-[normal] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">
        <p className="mb-0">Documents</p>
        <p>&nbsp;</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Group">
      <div className="absolute bg-gradient-to-r from-[#f5f5f5] inset-0 rounded-[8px] to-[#ccc]" data-name="Rectangle" />
      <div className="absolute inset-[46.67%_-9.15%_-13.33%_35.98%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-59px_-56px] mask-size-[164px_120px]" data-name="AdobeStock_572760262" style={{ maskImage: `url('${imgFrame551}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAdobeStock572760262} />
        </div>
      </div>
      <Frame />
    </div>
  );
}

function DocumentIndicator() {
  return (
    <div className="absolute inset-[0_-0.37%_5.88%_6.25%]" data-name="document indicator">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30.1176 30.1176">
        <g id="document indicator">
          <path d={svgPaths.p1e1dbb80} fill="var(--fill-0, #E2001A)" id="Combined-Shape" />
          <g id="12">
            <path d={svgPaths.p8e75680} fill="var(--fill-0, white)" id="Path" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IcPlaceholederRedWithNumber() {
  return (
    <div className="absolute right-0 size-[32px] top-0" data-name="ic_placeholeder_redWithNumber">
      <DocumentIndicator />
    </div>
  );
}

export default function LightRestyleMoreSection() {
  return (
    <div className="relative size-full" data-name="Light Restyle/ More section">
      <Group />
      <IcPlaceholederRedWithNumber />
    </div>
  );
}