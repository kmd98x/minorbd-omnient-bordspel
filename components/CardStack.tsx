"use client";

import { useState } from "react";
import { StatementCard } from "@/data/statements";
import { ComplimentCard } from "@/data/compliments";
import Card from "./Card";

type CardStackProps = {
	type: "statement" | "compliment" | "bonding";
	onCardDrawn: (card: StatementCard | ComplimentCard | string) => void;
};

export default function CardStack({ type, onCardDrawn }: CardStackProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentCard, setCurrentCard] = useState<StatementCard | ComplimentCard | string | null>(null);
	const [wasDragged, setWasDragged] = useState(false);

	const handleStackClick = () => {
		if (!isOpen) {
			// Draw a random card
			let card: StatementCard | ComplimentCard | string;
			
			if (type === "statement") {
				const { STATEMENTS } = require("@/data/statements");
				const randomIndex = Math.floor(Math.random() * STATEMENTS.length);
				card = STATEMENTS[randomIndex];
			} else if (type === "compliment") {
				const { COMPLIMENT_CARDS } = require("@/data/compliments");
				const randomIndex = Math.floor(Math.random() * COMPLIMENT_CARDS.length);
				card = COMPLIMENT_CARDS[randomIndex];
			} else {
				const { BONDING_CARDS } = require("@/data/bonding");
				const randomIndex = Math.floor(Math.random() * BONDING_CARDS.length);
				card = BONDING_CARDS[randomIndex];
			}
			
			setCurrentCard(card);
			setIsOpen(true);
			setWasDragged(false);
		}
	};

	const handleCardClick = () => {
		// Only handle click if card wasn't dragged (drag will be handled by drop)
		if (currentCard && !wasDragged) {
			onCardDrawn(currentCard);
			setIsOpen(false);
			setCurrentCard(null);
			setWasDragged(false);
		}
	};


	return (
		<>
			{/* Card Stack Image - Clickable */}
			<div 
				onClick={handleStackClick}
				className="cursor-pointer relative"
			>
				{type === "statement" && (
					<img
						src="/images/cards/statement-card-deck.svg"
						alt="Statement Card Deck"
						className="h-[175px]"
					/>
				)}
				{type === "compliment" && (
					<img
						src="/images/cards/compliment-card-deck.svg"
						alt="Compliments Card Deck"
						className="h-[235px]"
					/>
				)}
				{type === "bonding" && (
					<img
						src="/images/cards/bonding-card-deck.svg"
						alt="Bonding Card Deck"
						className="h-[235px]"
					/>
				)}
			</div>

			{/* Card Display */}
			{isOpen && currentCard && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
					<div className="relative animate-slideUp">
						{type === "statement" && typeof currentCard !== "string" && "text" in currentCard && (
							<Card
								type="stelling"
								cardTitle={(currentCard as StatementCard).hasQuestion ? "Herken je de uitspraak?" : ""}
								cardStatement={(currentCard as StatementCard).text}
								draggable={true}
								onDragStart={(e) => {
									setWasDragged(true);
									e.dataTransfer.setData("application/json", JSON.stringify(currentCard));
									e.dataTransfer.effectAllowed = "move";
								}}
								onDragEnd={() => {
									// If card was dropped successfully, board page will close CardStack via setActiveCardStack(null)
									// If drop was not successful (dropped outside valid zone), keep card visible
									// Reset wasDragged after a short delay to allow drop handler to process
									setTimeout(() => {
										setWasDragged(false);
									}, 100);
								}}
								onClick={handleCardClick}
							/>
						)}
						{type === "compliment" && typeof currentCard !== "string" && "mainText" in currentCard && (
							<Card
								type="compliment"
								cardTitle={(currentCard as ComplimentCard).mainText}
								cardStatement={(currentCard as ComplimentCard).subText}
								onClick={handleCardClick}
							/>
						)}
						{type === "bonding" && typeof currentCard === "string" && (
							<Card
								type="bonding"
								cardTitle=""
								cardStatement={currentCard}
								onClick={handleCardClick}
							/>
						)}
						<div className="mt-4 text-center">
							<p className="text-sm text-neutral-200 bg-black/50 px-4 py-2 rounded-lg">
								{type === "statement" ? "Sleep de kaart naar een categorie of klik om door te gaan" : "Klik op de kaart om door te gaan"}
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

