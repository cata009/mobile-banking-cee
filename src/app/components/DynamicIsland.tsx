interface DynamicIslandProps {
  variant?: 'light' | 'dark';
}

export default function DynamicIsland({ variant = 'dark' }: DynamicIslandProps) {
  // Dynamic Island trebuie să fie în spațiul dintre Time și Levels (gap-ul de 154px)
  // Dimensiuni realiste iPhone 16 Pro Max: ~126px × 37px
  
  return (
    <div className="absolute top-[13px] left-1/2 -translate-x-1/2 z-[45] pointer-events-none">
      {/* Dynamic Island shape - dimensiuni realiste */}
      <div className="relative w-[126px] h-[37px] bg-black rounded-[19px] shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        {/* Camera & Sensors - layout realistic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-[15px]">
          {/* Front Camera (stânga) */}
          <div className="w-[10px] h-[10px] rounded-full bg-[#0a0a0a] ring-[0.5px] ring-black/10" />
          
          {/* Face ID / Proximity Sensor (dreapta) */}
          <div className="w-[8px] h-[6px] rounded-full bg-[#0a0a0a]" />
        </div>
      </div>
    </div>
  );
}
