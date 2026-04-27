'use client';

import { useClerk } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { SymbolLogo } from './SymbolLogo';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const { signOut } = useClerk();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-[728px] rounded-[16px] bg-[rgba(14,14,14,0.88)] p-8 text-center shadow-2xl backdrop-blur-[30px] relative overflow-hidden sm:p-12"
          >
            {/* Decorative Butterfly Logo */}
            <SymbolLogo
              className="absolute -top-4 -right-4 w-32 h-32 text-[#D46B4E] rotate-12 opacity-90"
              variant="solid"
            />

            <div className="relative z-10 text-left">
              <h2 className="text-[42px] font-urbanist font-medium leading-none text-white mb-8 sm:text-[60px]">
                Leaving for now?
              </h2>
              <p className="text-2xl text-white/85 font-playfair italic mb-20 sm:text-[30px]">
                Your thoughts are safely stored. You can
                <br />
                return anytime.
              </p>

              <div className="flex flex-col gap-4 justify-center mb-10 sm:flex-row sm:gap-16">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-[rgba(15,15,15,0.5)] border border-[#D46B4E] text-[#E6E2D6] hover:bg-[#222] transition-all text-lg font-bold shadow-lg sm:w-52"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="w-full py-3.5 rounded-2xl bg-[rgba(255,0,0,0.72)] border border-red-600 text-[#E6E2D6] hover:bg-red-700 transition-all text-lg font-bold shadow-lg sm:w-52"
                >
                  Logout
                </button>
              </div>

              <p className="text-center text-lg text-white/60 font-playfair italic">
                See you soon.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
