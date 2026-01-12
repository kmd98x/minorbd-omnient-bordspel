"use client"

import ReflectieColumn from "@/components/ReflectieColumn"
import { REFLECTION_QUESTIONS as questions} from "@/data/reflection-questions"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGame } from "@/contexts/GameContext"
import PlayerCardStack from "@/components/PlayerCardStack"

type PlayerReflections = {
    [playerId: number]: {
        [questionIndex: number]: string;
    };
}

export default function Reflectie() {
    const router = useRouter();
    const { players } = useGame();
    const [playerReflections, setPlayerReflections] = useState<PlayerReflections>({});
    const [currentReflectionPlayerIndex, setCurrentReflectionPlayerIndex] = useState(0);

    // Initialize reflections structure and reset to first player
    useEffect(() => {
        if (players.length === 0) {
            router.push('/deelnemers');
            return;
        }
        setCurrentReflectionPlayerIndex(0);
        
        // Initialize reflections object
        const initialReflections: PlayerReflections = {};
        players.forEach(player => {
            initialReflections[player.id] = {};
            questions.forEach((_, index) => {
                initialReflections[player.id][index] = '';
            });
        });
        setPlayerReflections(initialReflections);
    }, [players, router]);

    const currentPlayer = players[currentReflectionPlayerIndex];
    const isCurrentPlayerTurn = currentPlayer !== undefined;

    const handleReflectionChange = (questionIndex: number, value: string) => {
        if (!currentPlayer) return;
        
        setPlayerReflections(prev => ({
            ...prev,
            [currentPlayer.id]: {
                ...prev[currentPlayer.id],
                [questionIndex]: value
            }
        }));
    };

    const handleNext = () => {
        if (!currentPlayer) return;
        
        // Check if all questions are filled
        const allFilled = questions.every((_, index) => {
            const reflection = playerReflections[currentPlayer.id]?.[index];
            return reflection && reflection.trim() !== '';
        });

        if (!allFilled) {
            // Show alert or disable button - for now just return
            return;
        }

        // Move to next player
        if (currentReflectionPlayerIndex < players.length - 1) {
            setCurrentReflectionPlayerIndex(prev => prev + 1);
        } else {
            // All players completed - could show completion message or redirect
            // For now, just stay on the page (or you could redirect to a completion page)
        }
    };

    const getCurrentPlayerReflections = () => {
        if (!currentPlayer) return {};
        return playerReflections[currentPlayer.id] || {};
    };

    const currentReflections = getCurrentPlayerReflections();
    const canProceed = questions.every((_, index) => {
        const reflection = currentReflections[index];
        return reflection && reflection.trim() !== '';
    });

    if (!isCurrentPlayerTurn) {
        return null;
    }

    return (
        <div style={{ background: 'url("/images/background-image.png")'}} className="bg-cover bg-no-repeat bg-center min-h-screen p-20">
            {currentPlayer && (
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-black mb-2">
                        {currentPlayer.name}'s beurt
                    </h1>
                    <p className="text-lg text-black/80">
                        Speler {currentReflectionPlayerIndex + 1} van {players.length}
                    </p>
                </div>
            )}

            {/* Results section - Categories */}
            {currentPlayer && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-black text-center">
                        Jouw kaarten per categorie
                    </h2>
                    <div className="flex items-center justify-between w-full">
                        {(() => {
                            const cardLabels = ["Be perfect", "Hurry up", "Be strong", "Pleaser", "Try hard"];
                            const cardImages = [
                                "/images/cards/be-perfect.svg",
                                "/images/cards/hurry-up.svg",
                                "/images/cards/be-strong.svg",
                                "/images/cards/pleaser.svg",
                                "/images/cards/try-hard.svg"
                            ];
                            
                            return cardLabels.map((label, index) => {
                                const category = label as "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
                                const cards = currentPlayer.cards[category];
                                
                                return (
                                    <div
                                        key={index}
                                        className="flex-1 flex flex-col items-center justify-center mx-2 min-h-[235px] rounded-lg relative"
                                    >
                                        <img 
                                            src={cardImages[index]} 
                                            alt={label} 
                                            className="h-auto object-contain w-full max-h-[400px] mb-2" 
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-10" style={{ transform: 'translateY(-10%)' }}>
                                            <PlayerCardStack cards={cards} reversed={false} scale={0.45} />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-10 w-full mb-3">
                {questions.map((question, index) => (
                    <ReflectieColumn
                        key={index}
                        title={question.title}
                        firstQuestion={question.subTitle}
                        label={question.label}
                        htmlFor={question.htmlFor}
                        placeholder={question.textareaPlaceholder}
                        value={currentReflections[index] || ''}
                        onChange={(e) => handleReflectionChange(index, e.target.value)}
                        disabled={!isCurrentPlayerTurn}
                    />
                ))}
            </div>

            <div className="flex justify-center w-full">
                <button 
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`py-3 px-8 rounded-lg border-0 text-white text-xl transition-colors ${
                        canProceed 
                            ? 'bg-button hover:bg-button-hover cursor-pointer' 
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    {currentReflectionPlayerIndex < players.length - 1 ? 'Volgende speler' : 'Klaar'}
                </button>
            </div>
        </div>
    )
}
