import { StatementCard } from "@/data/statements";
import Card from "./Card";

interface PlayerCardStackProps {
    cards: StatementCard[];
    reversed?: boolean;
    playerId?: number;
    category?: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
    onDragStart?: (e: React.DragEvent, card: StatementCard, category: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => void;
    onDragEnd?: () => void;
    scale?: number;
}

export default function PlayerCardStack({ cards, reversed = false, playerId, category, onDragStart, onDragEnd, scale }: PlayerCardStackProps) {
    if (cards.length === 0) return null;

    // Maximum aantal kaarten om visueel te tonen (om performance te behouden)
    const maxVisibleCards = 5;
    const visibleCards = cards.slice(0, maxVisibleCards);
    const remainingCount = Math.max(0, cards.length - maxVisibleCards);

    // Calculate card scale
    const cardScale = scale ?? 0.28; // Scale factor voor alle kaarten (default 0.28)
    const containerHeight = cardScale > 0.28 ? `${180 * (cardScale / 0.28)}px` : '180px';
    
    return (
        <div className="relative flex items-center justify-center" style={{ height: containerHeight, width: '100%' }}>
            {visibleCards.map((card, index) => {
                // De nieuwste kaart (laatste in array) komt bovenop
                // Eerste kaart (index 0) ligt onderaan, laatste kaart (hoogste index) ligt bovenop
                const offset = index * 15; // Offset van 15px tussen kaarten
                const finalOffset = reversed ? offset : -offset; // Omkeren voor reversed
                const zIndex = index + 1; // Z-index: laatste kaart (hoogste index) heeft hoogste z-index
                const isNewestCard = index === visibleCards.length - 1; // Laatste kaart in array is de nieuwste
                
                // Grootte: alle kaarten even groot
                const scaledWidth = 320 * cardScale; // Geschaalde breedte (ongeveer w-xs = 320px)
                const marginLeft = -scaledWidth / 2; // Centreren
                
                return (
                    <div
                        key={index}
                        className="absolute shadow-md"
                        style={{
                            transform: `translateY(${finalOffset}px)`,
                            zIndex: zIndex,
                            left: '50%',
                            marginLeft: `${marginLeft}px`,
                            transition: isNewestCard ? 'transform 0.3s ease-out' : 'none', // Animaties voor nieuwe kaart
                            width: 0,
                            height: 0,
                        }}
                    >
                        <div 
                            style={{ 
                                transform: `scale(${cardScale})`, 
                                transformOrigin: 'top center',
                            }}
                        >
                            <Card
                                type="stelling"
                                cardTitle={card.hasQuestion ? "Herken je de uitspraak?" : ""}
                                cardStatement={card.text}
                                draggable={playerId !== undefined && category !== undefined}
                                onDragStart={(e) => {
                                    if (onDragStart && category) {
                                        onDragStart(e, card, category);
                                    }
                                }}
                                onDragEnd={() => {
                                    if (onDragEnd) {
                                        onDragEnd();
                                    }
                                }}
                            />
                        </div>
                    </div>
                );
            })}
            {remainingCount > 0 && (
                <div 
                    className="absolute w-20 h-32 rounded-lg border-2 border-button-hover shadow-md flex items-center justify-center bg-button-hover/30 backdrop-blur-sm"
                    style={{
                        transform: `translateY(${reversed ? (visibleCards.length * 15) : -(visibleCards.length * 15)}px)`,
                        zIndex: 0,
                        left: '50%',
                        marginLeft: '-40px',
                    }}
                >
                    <span className="text-button-hover text-sm font-bold">+{remainingCount}</span>
                </div>
            )}
        </div>
    );
}
