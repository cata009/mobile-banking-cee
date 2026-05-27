import svgPaths from "@/imports/svg-i4inyt2jkm";

export default function UniCreditLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className} style={{ position: 'relative' }}>
      <svg 
        width="174" 
        height="24" 
        viewBox="0 0 174 24" 
        fill="none"
        className="block h-full w-auto"
      >
        {/* Red icon */}
        <g transform="translate(0, 1.2)">
          <path d={svgPaths.p1c620d00} fill="var(--uc-brand)" />
          <path d={svgPaths.p17bca3c0} fill="var(--uc-brand)" />
          <path clipRule="evenodd" d={svgPaths.p2a77a780} fill="var(--uc-static-white)" fillRule="evenodd" />
        </g>
        
        {/* White text - "UniCredit Bank" */}
        <g transform="translate(27.5, 2.8)">
          <path d={svgPaths.p2bbcf1c0} fill="var(--uc-static-white)" />
          <path d={svgPaths.p31616600} fill="var(--uc-static-white)" />
          <path d={svgPaths.p2cf54f00} fill="var(--uc-static-white)" />
          <path d={svgPaths.p1776a200} fill="var(--uc-static-white)" />
          <path d={svgPaths.p2f2c2800} fill="var(--uc-static-white)" />
          <path d={svgPaths.p5e6d200} fill="var(--uc-static-white)" />
          <path d={svgPaths.p3aedad60} fill="var(--uc-static-white)" />
          <path d={svgPaths.p1cf60e80} fill="var(--uc-static-white)" />
          <path d={svgPaths.p1ebae3f0} fill="var(--uc-static-white)" />
          <path d={svgPaths.p378e5e80} fill="var(--uc-static-white)" />
          <path d={svgPaths.p159ffa60} fill="var(--uc-static-white)" />
          <path d={svgPaths.p5405500} fill="var(--uc-static-white)" />
          <path d={svgPaths.p2cc5f200} fill="var(--uc-static-white)" />
        </g>
      </svg>
    </div>
  );
}
