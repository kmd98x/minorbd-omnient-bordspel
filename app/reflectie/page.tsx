"use client"

import ReflectieColumn from "@/components/ReflectieColumn"
import { REFLECTION_QUESTIONS as questions} from "@/data/reflection-questions"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGame } from "@/contexts/GameContext"
import PlayerCardStack from "@/components/PlayerCardStack"
import Card from "@/components/Card"
import { StatementCard } from "@/data/statements"
import Confetti from "@/components/Confetti"

type PlayerReflections = {
    [playerId: number]: {
        [questionIndex: number]: string;
    };
}

export default function Reflectie() {
    const router = useRouter();
    const { players, moveCardBetweenCategories } = useGame();
    const [playerReflections, setPlayerReflections] = useState<PlayerReflections>({});
    const [currentReflectionPlayerIndex, setCurrentReflectionPlayerIndex] = useState(0);
    const [selectedCard, setSelectedCard] = useState<{ card: StatementCard; category: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong" } | null>(null);
    const [draggedCard, setDraggedCard] = useState<{ card: StatementCard; sourceCategory: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong" } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

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
            // All players completed - show confetti!
            setShowConfetti(true);
            // Redirect to results page after confetti
            setTimeout(() => {
                router.push('/resultaten');
            }, 3000);
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

    // Handle card click to show enlarged view
    const handleCardClick = (card: StatementCard, category: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => {
        setSelectedCard({ card, category });
    };

    // Handle card drag start
    const handleCardDragStart = (e: React.DragEvent, card: StatementCard, sourceCategory: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => {
        if (!currentPlayer) return;
        
        // Set drag data
        e.dataTransfer.setData("application/json", JSON.stringify(card));
        e.dataTransfer.setData("source-category", sourceCategory);
        e.dataTransfer.effectAllowed = "move";
        
        // Store dragged card for preview
        setDraggedCard({ card, sourceCategory });
    };

    // Handle card drag end
    const handleCardDragEnd = () => {
        setDraggedCard(null);
    };

    // Handle drop on category
    const handleDrop = (e: React.DragEvent, targetCategory: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => {
        e.preventDefault();
        
        if (!currentPlayer) return;

        const cardData = e.dataTransfer.getData("application/json");
        const sourceCategory = e.dataTransfer.getData("source-category");
        
        if (cardData) {
            try {
                const card: StatementCard = JSON.parse(cardData);
                const sourceCat = sourceCategory as "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
                
                // Only move if source and target are different
                if (sourceCat !== targetCategory) {
                    moveCardBetweenCategories(currentPlayer.id, card, sourceCat, targetCategory);
                }
                
                setDraggedCard(null);
                setSelectedCard(null); // Close modal if open
            } catch (error) {
                console.error("Error parsing card data:", error);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

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
                                        onDrop={(e) => handleDrop(e, category)}
                                        onDragOver={handleDragOver}
                                    >
                                        <img 
                                            src={cardImages[index]} 
                                            alt={label} 
                                            className="h-auto object-contain w-full max-h-[400px] mb-2" 
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-10" style={{ transform: 'translateY(-10%)' }}>
                                            <PlayerCardStack 
                                                cards={cards} 
                                                reversed={false} 
                                                scale={0.45}
                                                playerId={currentPlayer.id}
                                                category={category}
                                                onCardClick={handleCardClick}
                                                onDragStart={handleCardDragStart}
                                                onDragEnd={handleCardDragEnd}
                                            />
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

            {/* Enlarged Card Modal */}
            {selectedCard && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setSelectedCard(null)}
                >
                    <div 
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card
                            type="stelling"
                            cardTitle={selectedCard.card.hasQuestion ? "Herken je de uitspraak?" : ""}
                            cardStatement={selectedCard.card.text}
                            draggable={true}
                            onDragStart={(e) => handleCardDragStart(e, selectedCard.card, selectedCard.category)}
                            onDragEnd={handleCardDragEnd}
                        />
                        <button
                            onClick={() => setSelectedCard(null)}
                            className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                            aria-label="Sluiten"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Dragged Card Preview */}
            {draggedCard && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                    <div className="opacity-80">
                        <Card
                            type="stelling"
                            cardTitle={draggedCard.card.hasQuestion ? "Herken je de uitspraak?" : ""}
                            cardStatement={draggedCard.card.text}
                        />
                    </div>
                </div>
            )}

            {/* Confetti */}
            <Confetti trigger={showConfetti} duration={3000} />
        </div>
    )
}
