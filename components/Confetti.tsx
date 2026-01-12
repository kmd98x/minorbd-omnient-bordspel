"use client"

import { useEffect, useState } from "react"

interface ConfettiProps {
    trigger: boolean;
    duration?: number;
}

interface ConfettiParticle {
    id: number;
    left: number;
    animationDuration: number;
    animationDelay: number;
    color: string;
    size: number;
}

const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#FFA07A", // Light Salmon
    "#98D8C8", // Mint
    "#F7DC6F", // Yellow
    "#BB8FCE", // Purple
    "#85C1E2", // Sky Blue
    "#F8B739", // Orange
    "#52BE80", // Green
];

export default function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
    const [particles, setParticles] = useState<ConfettiParticle[]>([]);

    useEffect(() => {
        if (trigger) {
            // Generate confetti particles
            const newParticles: ConfettiParticle[] = [];
            const particleCount = 150;

            for (let i = 0; i < particleCount; i++) {
                newParticles.push({
                    id: i,
                    left: Math.random() * 100, // Random horizontal position (0-100%)
                    animationDuration: 2 + Math.random() * 2, // 2-4 seconds
                    animationDelay: Math.random() * 0.5, // 0-0.5 seconds
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 8 + Math.random() * 8, // 8-16px
                });
            }

            setParticles(newParticles);

            // Clear particles after duration
            const timer = setTimeout(() => {
                setParticles([]);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [trigger, duration]);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute top-0 rounded-sm"
                    style={{
                        left: `${particle.left}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        animation: `confetti-fall ${particle.animationDuration}s ease-out ${particle.animationDelay}s forwards`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}
        </div>
    );
}
