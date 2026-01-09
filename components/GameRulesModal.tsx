"use client";

import { ReactNode } from "react";

type GameRulesModalProps = {
	isOpen: boolean;
	onClose: () => void;
	showStartButton?: boolean;
	onStart?: () => void;
};

export default function GameRulesModal({ isOpen, onClose, showStartButton = false, onStart }: GameRulesModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
					<h2 className="font-bold text-3xl text-button-hover">Spelregels</h2>
					<button
						onClick={onClose}
						className="bg-button hover:bg-button-hover text-white px-5 py-2 rounded-lg cursor-pointer transition-colors"
					>
						X
					</button>
				</div>

				<div className="p-6 space-y-6 text-neutral-800">
					{/* Basisregels */}
					<div className="bg-neutral-50 rounded-lg p-4">
						<h3 className="font-semibold text-xl mb-3 text-button-hover">Basisregels</h3>
						<ul className="list-disc pl-6 space-y-2">
							<li>Wat je deelt blijft hier</li>
							<li>Overslaan mag altijd</li>
							<li>Er zijn geen foute antwoorden</li>
							<li>Niemand oordeelt</li>
						</ul>
					</div>

					{/* Spelverloop */}
					<div>
						<h3 className="font-semibold text-xl mb-3 text-button-hover">Spelverloop</h3>
						<ol className="list-decimal pl-6 space-y-2">
							<li>Gooi dobbelsteen</li>
							<li>Verplaats je pion</li>
							<li>Actie van vakje</li>
							<li>Volgende speler</li>
						</ol>
					</div>

					{/* Vakjes en acties */}
					<div>
						<h3 className="font-semibold text-xl mb-3 text-button-hover">Vakjes en Acties</h3>
						<div className="space-y-3">
							<div className="bg-blue-50 rounded-lg p-4">
								<p className="font-medium mb-2">📄 Normaal vakje</p>
								<ul className="list-disc pl-6 space-y-1 text-sm">
									<li>Trek een stellingenkaart</li>
									<li>Herken je dit?</li>
									<li><strong>JA:</strong> Kies categorie en plaats het daarop</li>
									<li><strong>NEE:</strong> Leg terug</li>
								</ul>
							</div>

							<div className="bg-pink-50 rounded-lg p-4">
								<p className="font-medium mb-2">❤️ Compliment vakje</p>
								<p className="text-sm">Pak een complimentenkaart</p>
							</div>

							<div className="bg-green-50 rounded-lg p-4">
								<p className="font-medium mb-2">🤝 Bonding vakje</p>
								<p className="text-sm">Trek een bonding kaart</p>
							</div>

							<div className="bg-yellow-50 rounded-lg p-4">
								<p className="font-medium mb-2">+2</p>
								<p className="text-sm">Ga 2 vooruit</p>
							</div>

							<div className="bg-red-50 rounded-lg p-4">
								<p className="font-medium mb-2">-1</p>
								<p className="text-sm">Ga 1 terug</p>
							</div>

							<div className="bg-purple-50 rounded-lg p-4">
								<p className="font-medium mb-2">🔄 Wissel</p>
								<p className="text-sm">Wissel van plek met de volgende speler</p>
							</div>
						</div>
					</div>

					{/* Einde spel */}
					<div className="bg-neutral-50 rounded-lg p-4">
						<h3 className="font-semibold text-xl mb-3 text-button-hover">Einde van het spel</h3>
						<p>Op het eind kijk je welke kaarten je het meest hebt en vul je het reflectie vel in.</p>
					</div>

					{/* Patronen */}
					<div>
						<h3 className="font-semibold text-xl mb-3 text-button-hover">Patronen</h3>
						<div className="space-y-3">
							<div className="border-l-4 border-blue-500 pl-4">
								<p className="font-medium">Be Perfect</p>
								<p className="text-sm text-neutral-600">Je bent pas tevreden als het foutloos is</p>
							</div>
							<div className="border-l-4 border-orange-500 pl-4">
								<p className="font-medium">Hurry Up</p>
								<p className="text-sm text-neutral-600">Alles moet snel, stilzitten voelt als tijdverspilling</p>
							</div>
							<div className="border-l-4 border-red-500 pl-4">
								<p className="font-medium">Try Hard</p>
								<p className="text-sm text-neutral-600">Je hebt constant het gevoel dat je jezelf moet bewijzen</p>
							</div>
							<div className="border-l-4 border-pink-500 pl-4">
								<p className="font-medium">Pleaser</p>
								<p className="text-sm text-neutral-600">Aandacht is altijd gericht op de ander, daarbij vergeet je je eigen behoefte</p>
							</div>
							<div className="border-l-4 border-green-500 pl-4">
								<p className="font-medium">Be Strong</p>
								<p className="text-sm text-neutral-600">Wilt vaak alleen dingen oplossen</p>
							</div>
						</div>
					</div>
				</div>

				{showStartButton && onStart && (
					<div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4">
						<button
							onClick={onStart}
							className="w-full cursor-pointer py-4 bg-button text-white rounded-lg font-semibold text-lg hover:bg-button-hover transition-colors"
						>
							Ik heb het begrepen, spel starten
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

