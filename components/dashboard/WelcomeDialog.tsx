'use client'

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface WelcomeDialogProps {
    username: string;
    onClose: () => void;
}

export default function WelcomeDialog({ username, onClose }: WelcomeDialogProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
    };

    return (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold mb-2">
                            Hello, {username}!
                        </h2>

                        <p className="text-blue-100 text-sm">
                            {currentDate}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome to BMS Capital
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your dashboard is ready. Let's make today productive!
                    </p>

                    <button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}
