import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FaceIdAnimationProps {
  onComplete: () => void;
}

/**
 * Face ID Authentication Animation
 * Premium iOS-style authentication with:
 * - Phase 1: Scanning (150-200ms) - glow + pulse
 * - Phase 2: Confirmation (100-150ms) - fade Face ID + draw checkmark
 * - Phase 3: Final (100ms) - stable checkmark
 * Total duration: ~400-500ms
 */
export default function FaceIdAnimation({ onComplete }: FaceIdAnimationProps) {
  const [phase, setPhase] = useState<'scanning' | 'confirming' | 'complete'>('scanning');

  useEffect(() => {
    // Phase 1: Scanning (360ms - doubled from 180ms)
    const scanningTimer = setTimeout(() => {
      setPhase('confirming');
    }, 360);

    // Phase 2: Confirming (280ms after scanning - doubled from 140ms)
    const confirmingTimer = setTimeout(() => {
      setPhase('complete');
    }, 640);

    // Phase 3: Complete and trigger callback (200ms after confirming - doubled from 100ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 840);

    return () => {
      clearTimeout(scanningTimer);
      clearTimeout(confirmingTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-[9999] flex items-start justify-center pt-[40px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Dark Backdrop - very subtle */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />

      {/* Face ID Container */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.2, 
          ease: [0.25, 0.1, 0.25, 1] // ease-out
        }}
      >
        {/* Bezel - black rounded square */}
        <div 
          className="relative bg-black rounded-[42px] size-[150px]" 
          style={{
            boxShadow: '0px 0px 0px 0px #262626, 0px 20px 50px 0px rgba(0,0,0,0.3)'
          }}
        >
          {/* Face ID Icon - Scanning Phase */}
          <AnimatePresence mode="wait">
            {phase === 'scanning' && (
              <motion.div
                key="face-id"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 1 }}
                exit={{ 
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.15, ease: 'easeOut' }
                }}
              >
                {/* SF Symbol Face ID icon with glow animation */}
                <motion.p
                  className="font-['SF_Pro:Light',sans-serif] text-[#a1f293] text-[72px] text-center leading-[normal]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                  animate={{
                    opacity: [1, 0.7, 1],
                    filter: [
                      'drop-shadow(0 0 8px rgba(161, 242, 147, 0.6))',
                      'drop-shadow(0 0 12px rgba(161, 242, 147, 0.8))',
                      'drop-shadow(0 0 8px rgba(161, 242, 147, 0.6))',
                    ],
                  }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeInOut',
                    repeat: 0,
                  }}
                >
                  􀎽
                </motion.p>
              </motion.div>
            )}

            {/* Checkmark - Confirming & Complete Phase */}
            {(phase === 'confirming' || phase === 'complete') && (
              <motion.div
                key="checkmark"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                transition={{ 
                  duration: 0.15, 
                  ease: [0.25, 0.1, 0.25, 1] // smooth elastic
                }}
              >
                {/* Circle outline */}
                <motion.svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Circle stroke */}
                  <motion.circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke="#a1f293"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: 'easeOut' 
                    }}
                  />
                  
                  {/* Checkmark path */}
                  <motion.path
                    d="M 22 36 L 30 44 L 50 24"
                    stroke="#a1f293"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: 0.1 // slight delay for checkmark after circle
                    }}
                  />
                </motion.svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}