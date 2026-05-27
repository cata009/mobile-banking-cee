/**
 * ShareScreenGlow - Efect vizual de "Share Screen Mode"
 * 
 * Indică vizual că sesiunea de co-apping este activă și că un operator bancar
 * vede ecranul clientului prin intermediul share screen-ului.
 * 
 * Features:
 * - Border glow animat pe marginile ecranului cu SVG pentru colțuri perfecte
 * - Gradient verde UniCredit (var(--uc-green-bright) → var(--uc-green-bright))
 * - Glow subtil non-disruptive în zona ecranului
 * - Animație de pulsare lentă (breathing effect - 2.5s cycle)
 * - Fade in/out smooth când se activează/dezactivează
 * - Colțuri perfect rotunjite cu frame-ul telefonului (36px radius)
 * - Z-index sub butonul floating
 */

export default function ShareScreenGlow() {
  return (
    <>
      {/* Keyframes pentru animație de pulsare */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shareScreenPulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.85;
          }
        }
        
        @keyframes shareScreenGlowPulse {
          0%, 100% {
            box-shadow: 
              inset 0 0 60px color-mix(in srgb, var(--uc-green-bright) 8%, transparent),
              inset 0 0 30px color-mix(in srgb, var(--uc-green-main) 5%, transparent);
          }
          50% {
            box-shadow: 
              inset 0 0 80px color-mix(in srgb, var(--uc-green-bright) 12%, transparent),
              inset 0 0 40px color-mix(in srgb, var(--uc-green-main) 8%, transparent);
          }
        }
        
        @keyframes shareScreenFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}} />
      
      {/* Main Glow Border Container - z-[45] pentru a fi SUB butonul floating (z-50) */}
      <div 
        className="absolute inset-0 pointer-events-none z-[45]"
        style={{
          animation: 'shareScreenFadeIn 400ms ease-out'
        }}
      >
        {/* SVG Border cu colțuri perfect rotunjite - EXACT pe margine */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            animation: 'shareScreenPulse 2.5s ease-in-out infinite',
          }}
          viewBox="0 0 393 852"
          preserveAspectRatio="none"
        >
          {/* Rounded Rectangle Border - stroke PERFECT aliniat cu marginea */}
          {/* strokeWidth 3 = 1.5px interior + 1.5px exterior de la linia centrală */}
          {/* CULOARE SOLIDĂ var(--uc-green-bright) - exact ca butonul floating pentru blend perfect */}
          <rect
            x="1.5"
            y="1.5"
            width="390"
            height="849"
            rx="36"
            ry="36"
            fill="none"
            stroke="var(--uc-green-bright)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Subtle Inner Glow - FOARTE subtil, non-disruptive */}
        <div 
          className="absolute inset-0 rounded-[36px]"
          style={{
            animation: 'shareScreenGlowPulse 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        
        {/* Vignette foarte subtil pentru contrast */}
        <div 
          className="absolute inset-0 rounded-[36px]"
          style={{
            background: 'radial-gradient(circle at center, transparent 65%, color-mix(in srgb, var(--uc-green-bright) 2%, transparent) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  );
}
