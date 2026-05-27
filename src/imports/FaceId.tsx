function Bezel() {
  return <div className="-translate-x-1/2 absolute bg-black left-[calc(50%+0.5px)] rounded-[42px] shadow-[0px_0px_0px_0px_#262626,0px_20px_50px_0px_rgba(0,0,0,0.3)] size-[150px] top-[9px]" data-name="Bezel" />;
}

export default function FaceId() {
  return (
    <div className="backdrop-blur-[1px] relative size-full" data-name="Face ID">
      <Bezel />
      <p className="-translate-x-1/2 absolute font-['SF_Pro:Light',sans-serif] font-[274.31500244140625] leading-[normal] left-[calc(50%+0.5px)] text-[#a1f293] text-[72px] text-center top-[42px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        􀎽
      </p>
    </div>
  );
}