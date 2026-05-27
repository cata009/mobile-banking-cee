/**
 * EdgeLoadingAnimation Component
 * Progressive edge loading animation for co-apping session activation
 * The border gets drawn progressively as the glow moves around (clockwise from top-left)
 */

import { useEffect, useState } from 'react';

interface EdgeLoadingAnimationProps {
  onComplete?: () => void;
  onAnimationStart?: () => void;
}

export default function EdgeLoadingAnimation({ onComplete, onAnimationStart }: EdgeLoadingAnimationProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Notify parent that animation started
    onAnimationStart?.();
    
    // Complete animation after 2.1s (1.8s edge trace + 0.3s FAB)
    const timer = setTimeout(() => {
      setIsComplete(true);
      onComplete?.();
    }, 2100);

    return () => clearTimeout(timer);
  }, [onComplete, onAnimationStart]);

  if (isComplete) return null;

  // Calculate path length dynamically based on viewport (approximate)
  // For a rectangle: perimeter = 2 * (width + height)
  // Assuming mobile frame ~375x812: perimeter ≈ 2374
  const pathLength = 2400;

  return (
    <>
      {/* SVG border that gets drawn progressively following the glow */}
      <svg 
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          zIndex: 9998
        }}
        preserveAspectRatio="none"
      >
        {/* Path that follows clockwise from top-left */}
        <path
          d="M 2 2 L calc(100% - 2px) 2 L calc(100% - 2px) calc(100% - 2px) L 2 calc(100% - 2px) Z"
          fill="none"
          stroke="var(--uc-teal-bright)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={pathLength}
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength}
          style={{
            animation: 'drawBorder 1.8s ease-in-out forwards'
          }}
        />
      </svg>
      
      {/* Animated glowing point following the same path */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '8px',
          height: '8px',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--uc-static-white) 90%, transparent) 0%, color-mix(in srgb, var(--uc-teal-bright) 80%, transparent) 30%, color-mix(in srgb, var(--uc-teal-bright) 40%, transparent) 60%, transparent 100%)',
          boxShadow: '0 0 6px 3px color-mix(in srgb, var(--uc-teal-bright) 50%, transparent), 0 0 12px 6px color-mix(in srgb, var(--uc-teal-bright) 20%, transparent)',
          borderRadius: '50%',
          zIndex: 9999,
          animation: 'edgeTrace 1.8s ease-in-out forwards'
        }}
      />

      <style>{`
        @keyframes drawBorder {
          from {
            stroke-dashoffset: ${pathLength};
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes edgeTrace {
          /* Start at top-left corner */
          0% {
            top: 2px;
            left: 2px;
          }
          /* Across top edge to top-right */
          25% {
            top: 2px;
            left: calc(100% - 2px);
          }
          /* Down right edge to bottom-right */
          50% {
            top: calc(100% - 2px);
            left: calc(100% - 2px);
          }
          /* Across bottom edge to bottom-left */
          75% {
            top: calc(100% - 2px);
            left: 2px;
          }
          /* Up left edge back to top-left (complete the loop) */
          100% {
            top: 2px;
            left: 2px;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
