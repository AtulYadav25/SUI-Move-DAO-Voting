// LoadingScreen.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SUIIMG from './SUI.png'
import TrueFocus from "./TrueFocus";

const LoadingScreen: React.FC = () => {
    const [showContent, setShowContent] = useState(true);
    const [animateBg, setAnimateBg] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        // Fade out content after 1.2s
        const timeout1 = setTimeout(() => {
            setShowContent(false);
        }, 2400);

        // Animate background 100ms after content fade
        const timeout2 = setTimeout(() => {
            setAnimateBg(true);
        }, 2500);

        // Finish completely after background animation (0.6s)
        const timeout3 = setTimeout(() => {
            setFinished(true);
        }, 3000); // 1300ms delay + 600ms bg animation

        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            clearTimeout(timeout3);
        };
    }, []);

    if (finished) return null; // Return null when animation is complete

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden flex justify-center items-center z-[100]">
            {/* Background animation */}
            <AnimatePresence>
                {!animateBg && (
                    <motion.div
                        className="absolute inset-0 bg-zinc-900"
                        initial={{ y: 0 }}
                        animate={{ y: animateBg ? "-100%" : 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>

            {/* Content: Image + Text */}
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        className="flex flex-col items-center gap-4 z-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-[120px] h-[120px] flex justify-center items-center">
                            <img
                                src={SUIIMG} // Replace with your image
                                alt="Logo"
                                className="w-24 h-24 object-contain"
                            />
                        </div>
                        <motion.h1
                            className="text-2xl text-zinc-50 font-bold"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <TrueFocus
                                sentence="DAO Vote"
                                manualMode={false}
                                blurAmount={3}
                                borderColor="#4da2ff"
                                animationDuration={0.7}
                                pauseBetweenAnimations={0.2}
                            />
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoadingScreen;
