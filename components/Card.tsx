import { useState } from "react";
import Bonding from "./icons/Bonding";
import Compliment from "./icons/Compliment";
import QuoteClose from "./icons/QuoteClose";
import QuoteOpen from "./icons/QuoteOpen";
import Logo from "./Logo";

interface cardProps {
    type: "stelling" | "compliment" | "bonding";
    cardTitle: string;
    cardStatement: string;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e?: React.DragEvent) => void;
    onClick?: () => void;
    onSkip?: () => void;
}

export default function Card({type, cardTitle, cardStatement, draggable = false, onDragStart, onDragEnd, onClick, onSkip}: cardProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        onDragStart?.(e);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        onDragEnd?.();
    };

    const handleClick = () => {
        if (!isDragging && onClick) {
            onClick();
        }
    };

    return (
        <div 
            className={`flex item-center justify-center w-xs aspect-3/4 p-3 rounded-2xl ${draggable ? 'cursor-grab active:cursor-grabbing' : onClick ? 'cursor-pointer' : ''} ${isDragging ? 'opacity-50' : ''}`}
            style={{ background: `url("/images/cards/${type}-card-bg.png")`}}
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
        >
            <div className='bg-white rounded-lg flex flex-col gap-5 items-center justify-center relative py-4 px-4 w-full'>
                {onSkip && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSkip();
                        }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-button hover:bg-button-hover text-white px-6 py-2 rounded-lg transition-colors font-semibold text-base z-10"
                    >
                        Overslaan
                    </button>
                )}
                <Logo className="scale-[1.8] h-[100px] mb-10" />

                {cardTitle && (
                    <p className="font-bold text-center text-xl mb-3">{cardTitle}</p>
                )}
                
                <div className="relative flex flex-col gap-3 h-full">
                    <QuoteOpen className="scale-[2]" />
                    <p className="text-center text-lg">{cardStatement}</p>
                    <QuoteClose className="scale-[2] ml-auto mr-3" />
                </div>

                {type === "compliment" && (
                    <div className="flex-1 flex flex-col items-end justify-center">
                        <Compliment className="scale-[2] mb-1.5" />
                    </div>
                )}

                {type === "bonding" && (
                    <div className="flex-1 flex flex-col items-end justify-center">
                        <Bonding className="scale-[2]" />
                    </div>
                )}
            </div>
        </div>
    )
}
