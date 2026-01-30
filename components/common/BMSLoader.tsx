'use client';

import React from 'react';
import { colors } from '@/themes/colors';

interface BMSLoaderProps {
    message?: string;
    className?: string;
    size?: 'xsmall' | 'small' | 'medium' | 'large';
}

export function BMSLoader({ message, className = '', size = 'large' }: BMSLoaderProps) {
    // Size scales
    const scales = {
        xsmall: 0.3, // ~54px
        small: 0.5,  // ~90px
        medium: 0.75, // ~135px
        large: 1     // ~180px
    };

    // Default to large if size not found (safety)
    const scale = scales[size as keyof typeof scales] || scales.large;

    return (
        <div className={`bms-loader-wrapper ${className}`}>
            <div className="bms-loader-container" style={{ transform: `scale(${scale})` }}>
                {/* Rotating border ring */}
                <div className="bms-loading-ring"></div>

                {/* BMS Logo in center */}
                <div className="bms-logo-container">
                    <img
                        src="/bms-loading-logo.png"
                        alt="BMS Logo"
                        className="bms-logo"
                    />
                </div>
            </div>

            {/* Loading message - outside scaling to keep text readable */}
            {message && (
                <p className="bms-loading-message">{message}</p>
            )}

            <style jsx>{`
                .bms-loader-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 24px;
                }

                .bms-loader-container {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bms-loading-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 4px solid transparent;
                    border-top: 4px solid ${colors.primary.brand};
                    border-right: 4px solid ${colors.primary.brand};
                    animation: spin 1.2s linear infinite;
                    box-shadow: 
                        0 0 20px rgba(59, 157, 217, 0.3),
                        inset 0 0 20px rgba(59, 157, 217, 0.1);
                    z-index: 10;
                }

                .bms-loading-ring::before {
                    content: '';
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    border-radius: 50%;
                    border: 2px solid rgba(59, 157, 217, 0.2);
                }

                .bms-loading-ring::after {
                    content: '';
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    right: 8px;
                    bottom: 8px;
                    border-radius: 50%;
                    border: 2px solid rgba(59, 157, 217, 0.15);
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                .bms-logo-container {
                    width: 140px;
                    height: 140px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${colors.white};
                    border-radius: 50%;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.2),
                        0 0 0 1px rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    z-index: 20;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.02);
                    }
                }

                .bms-logo {
                    width: 110px;
                    height: 110px;
                    object-fit: contain;
                }

                .bms-loading-message {
                    color: inherit;
                    font-size: 16px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    animation: textPulse 1.5s ease-in-out infinite;
                    text-align: center;
                }

                @keyframes textPulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
}

export default BMSLoader;

