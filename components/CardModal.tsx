"use client";

import { useState } from "react";
import { StatementCard } from "@/data/statements";
import { ComplimentCard } from "@/data/compliments";

type CardModalProps = {
	isOpen: boolean;
	onClose: () => void;
	cardType: "statement" | "compliment" | "bonding";
	card?: StatementCard | ComplimentCard | string;
	onCardDrawn?: () => void;
	onCardDropped?: (card: StatementCard) => void;
	currentPlayerId?: number;
};

export default function CardModal({ isOpen, onClose, cardType, card, onCardDrawn, onCardDropped, currentPlayerId }: CardModalProps) {
	if (!isOpen || !card) return null;

	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	const handleCardClick = () => {
		// Only close on click if not dragging
		if (!isDragging) {
			onCardDrawn?.();
			onClose();
		}
	};

	const handleDragStart = (e: React.DragEvent) => {
		if (cardType !== "statement") return;
		
		setIsDragging(true);
		const rect = e.currentTarget.getBoundingClientRect();
		setDragOffset({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
		
		// Set drag data
		if (typeof card !== "string" && "text" in card) {
			e.dataTransfer.setData("application/json", JSON.stringify(card));
			e.dataTransfer.effectAllowed = "move";
		}
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-button-hover mb-4">
						{cardType === "statement" && "Stellingenkaart"}
						{cardType === "compliment" && "Complimentenkaart"}
						{cardType === "bonding" && "Bondingkaart"}
					</h2>
				</div>

				<div 
					onClick={handleCardClick}
					draggable={cardType === "statement"}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					className={`bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-8 border-2 border-button-hover transition-all min-h-[300px] flex flex-col justify-center ${
						cardType === "statement" 
							? "cursor-grab active:cursor-grabbing hover:shadow-lg" 
							: "cursor-pointer hover:shadow-lg"
					} ${isDragging ? "opacity-50" : ""}`}
				>
					{cardType === "statement" && typeof card !== "string" && "text" in card && (
						<div className="space-y-6">
							{(card as StatementCard).hasQuestion && (
								<p className="text-lg font-semibold text-button-hover mb-4">
									Herken je de uitspraak?
								</p>
							)}
							<p className="text-xl font-medium text-neutral-800 mb-6">
								{(card as StatementCard).text}
							</p>
							<p className="text-sm text-neutral-600 italic">
								{(card as StatementCard).bottomText === "privacy" 
									? "Alles wat je deelt blijft in deze ruimte."
									: "Je mag altijd passen/overslaan."}
							</p>
						</div>
					)}

					{cardType === "compliment" && typeof card !== "string" && "mainText" in card && (
						<div className="space-y-4">
							<p className="text-2xl font-bold text-button-hover mb-4">
								{(card as ComplimentCard).mainText}
							</p>
							<p className="text-lg text-neutral-700">
								{(card as ComplimentCard).subText}
							</p>
						</div>
					)}

					{cardType === "bonding" && typeof card === "string" && (
						<div>
							<p className="text-xl font-medium text-neutral-800">
								{card}
							</p>
						</div>
					)}
				</div>

				<div className="mt-6 text-center">
					<p className="text-sm text-neutral-600">
						Klik op de kaart om door te gaan
					</p>
				</div>
			</div>
		</div>
	);
}

