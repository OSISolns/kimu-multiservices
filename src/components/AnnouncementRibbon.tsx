'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { HiSpeakerphone } from 'react-icons/hi';

export default function AnnouncementRibbon() {
    const [isVisible, setIsVisible] = useState(true);

    // Check if the user has previously dismissed the announcement
    useEffect(() => {
        const dismissed = localStorage.getItem('announcement-dismissed-gisozi');
        if (dismissed) {
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('announcement-dismissed-gisozi', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="relative z-50 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white shadow-md">
                        <motion.div
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{
                                duration: 5,
                                ease: 'linear',
                                repeat: Infinity,
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%]"
                            style={{ backgroundSize: '50% 100%' }}
                        />

                        <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
                            <div className="flex items-center justify-center w-full gap-3 text-sm md:text-base font-medium">
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <HiSpeakerphone className="w-5 h-5 md:w-6 md:h-6 text-yellow-200" />
                                </motion.div>

                                <p className="text-center">
                                    <span className="font-bold text-yellow-200">ITANGAZO:</span>{' '}
                                    Twimukiye <span className="underline decoration-yellow-300 decoration-2 underline-offset-2">Gisozi</span>!
                                    Tuboneka ku muhanda <span className="font-bold">KG 780 St</span>.
                                </p>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Dismiss announcement"
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
