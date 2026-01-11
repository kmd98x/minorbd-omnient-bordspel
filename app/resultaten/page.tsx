"use client"

import { useRouter } from "next/navigation"
import { useGame } from "@/contexts/GameContext"
import { useEffect } from "react"

export default function Resultaten() {
    const router = useRouter();
    const { players } = useGame();

    useEffect(() => {
        if (players.length === 0) {
            router.push('/deelnemers');
        }
    }, [players, router]);

    const cardCategories = ["Be perfect", "Try hard", "Pleaser", "Hurry up", "Be strong"];

    return (
        <div style={{ background: 'url("/images/background-image.png")'}} className="bg-cover bg-no-repeat bg-center min-h-screen p-20">
            <h1 className="text-4xl font-bold text-center text-black mb-12">Resultaten</h1>
            
            <div className="space-y-12">
                {players.map((player) => (
                    <div key={player.id} className="bg-white/90 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-3xl font-bold mb-6 text-button-hover flex items-center gap-3">
                            <img
                                src={`/images/player-${player.id}.svg`}
                                alt={player.name}
                                className="h-8 w-8"
                            />
                            {player.name}
                        </h2>
                        
                        <div className="grid grid-cols-5 gap-6">
                            {cardCategories.map((category) => {
                                const cards = player.cards[category as keyof typeof player.cards];
                                return (
                                    <div key={category} className="border-2 border-button-hover/30 rounded-lg p-4 min-h-[200px]">
                                        <h3 className="font-bold text-lg mb-3 text-button-hover text-center">
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {cards.length > 0 ? (
                                                cards.map((card, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="bg-button/10 rounded p-2 text-sm border border-button/20"
                                                    >
                                                        {card.text}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-sm text-center italic">Geen kaarten</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
