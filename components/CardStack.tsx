"use client";

import { useState } from "react";
import { StatementCard } from "@/data/statements";
import { ComplimentCard } from "@/data/compliments";

type CardStackProps = {
	type: "statement" | "compliment" | "bonding";
	onCardDrawn: (card: StatementCard | ComplimentCard | string) => void;
};

export default function CardStack({ type, onCardDrawn }: CardStackProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentCard, setCurrentCard] = useState<StatementCard | ComplimentCard | string | null>(null);

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
		}
	};

	const handleCardClick = () => {
		if (currentCard) {
			onCardDrawn(currentCard);
			setIsOpen(false);
			setCurrentCard(null);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setCurrentCard(null);
	};

	return (
		<>
			{/* Card Stack Image - Clickable */}
			<div 
				onClick={handleStackClick}
				className="cursor-pointer hover:opacity-80 transition-opacity relative"
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

			{/* Card Display Modal */}
			{isOpen && currentCard && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8">
						<div className="mb-6 flex justify-between items-center">
							<h2 className="text-2xl font-bold text-button-hover">
								{type === "statement" && "Stellingenkaart"}
								{type === "compliment" && "Complimentenkaart"}
								{type === "bonding" && "Bondingkaart"}
							</h2>
							<button
								onClick={handleClose}
								className="text-neutral-400 hover:text-neutral-600 text-2xl"
							>
								×
							</button>
						</div>

						<div 
							onClick={handleCardClick}
							className={`bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-8 border-2 border-button-hover transition-all min-h-[300px] flex flex-col justify-center ${
								type === "statement" 
									? "cursor-grab active:cursor-grabbing hover:shadow-lg" 
									: "cursor-pointer hover:shadow-lg"
							}`}
							draggable={type === "statement"}
							onDragStart={(e) => {
								if (type === "statement" && typeof currentCard !== "string" && "text" in currentCard) {
									e.dataTransfer.setData("application/json", JSON.stringify(currentCard));
									e.dataTransfer.effectAllowed = "move";
								}
							}}
						>
							{type === "statement" && typeof currentCard !== "string" && "text" in currentCard && (
								<div className="space-y-6">
									{(currentCard as StatementCard).hasQuestion && (
										<p className="text-lg font-semibold text-button-hover mb-4">
											Herken je de uitspraak?
										</p>
									)}
									<p className="text-xl font-medium text-neutral-800 mb-6">
										{(currentCard as StatementCard).text}
									</p>
									<p className="text-sm text-neutral-600 italic">
										{(currentCard as StatementCard).bottomText === "privacy" 
											? "Alles wat je deelt blijft in deze ruimte."
											: "Je mag altijd passen/overslaan."}
									</p>
								</div>
							)}

							{type === "compliment" && typeof currentCard !== "string" && "mainText" in currentCard && (
								<div className="space-y-4">
									<p className="text-2xl font-bold text-button-hover mb-4">
										{(currentCard as ComplimentCard).mainText}
									</p>
									<p className="text-lg text-neutral-700">
										{(currentCard as ComplimentCard).subText}
									</p>
								</div>
							)}

							{type === "bonding" && typeof currentCard === "string" && (
								<div>
									<p className="text-xl font-medium text-neutral-800">
										{currentCard}
									</p>
								</div>
							)}
						</div>

						<div className="mt-6 text-center">
							<p className="text-sm text-neutral-600">
								{type === "statement" ? "Sleep de kaart naar een categorie of klik om door te gaan" : "Klik op de kaart om door te gaan"}
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

