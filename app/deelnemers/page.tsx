"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/GameContext";

type PlayerSetup = {
	name: string;
	icon: string;
};

export default function Deelnemers() {
    const router = useRouter();
	const { setPlayers } = useGame();
	const [ displayPopup, setDisplayPopup ] = useState(false);
	const [playerSetups, setPlayerSetups] = useState<PlayerSetup[]>([
		{ name: "", icon: "" },
		{ name: "", icon: "" },
		{ name: "", icon: "" },
		{ name: "", icon: "" },
	]);


	const updatePlayerSetup = (index: number, field: keyof PlayerSetup, value: string) => {
		setPlayerSetups((prev) =>
			prev.map((setup, i) => (i === index ? { ...setup, [field]: value } : setup))
		);
	};

	const handleStartGame = () => {
		// Filter out players without names and validate at least 1 player
		const validPlayers = playerSetups
			.map((setup, index) => ({
				setup,
				originalIndex: index,
			}))
			.filter(({ setup }) => setup.name.trim() !== "");

		if (validPlayers.length === 0) {
			alert("Vul ten minste één spelernaam in.");
			return;
		}

		// Create players and add to context
		// Assign default icons based on player number
		const defaultIcons = [
			"/images/boek.svg",
			"/images/pen.svg",
			"/images/stoel.svg",
			"/images/telefoon.svg",
		];

		const players = validPlayers.map(({ setup, originalIndex }, playerIndex) => ({
			id: playerIndex + 1,
			name: setup.name.trim(),
			icon: defaultIcons[originalIndex] || "/images/boek.svg",
			position: 1,
		}));

		setPlayers(players);
		router.push("/board");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral-50 p-8 bg-no-repeat bg-cover" style={{ backgroundImage: "url('/images/homestate-2.svg')" }}>
			<div className="bg-black/25 fixed top-0 inset-0 z-0"></div>

			<div className="bg-white/50 backdrop-blur-lg border border-button-hover rounded-2xl p-8 w-full max-w-lg z-10 relative">
				<h1 className="text-4xl font-bold text-center mb-8 text-button-hover">
					Deelnemers
				</h1>

				{/* Player Setup Forms */}
				<div className="space-y-6 mb-8">
					{playerSetups.map((setup, index) => (
						<div
							key={index}
							className="border-2 border-button-hover/20 rounded-lg p-6 bg-white/40"
						>
							{/* Name Input */}
							<div>
								<div className="flex items-center gap-4">
									<img
										src={`/images/player-${index + 1}.svg`}
										alt={`Speler ${index + 1}`}
										className="h-16 w-16 shrink-0 self-end"
									/>
									<div className="flex-1">
										<input
											type="text"
											value={setup.name}
											onChange={(e) =>
												updatePlayerSetup(index, "name", e.target.value)
											}
											placeholder={`Voer naam van speler ${index + 1} in`}
											className="w-full bg-white/80 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-button-hover"
										/>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Pop-up modal */}
				<div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-button-hover ${displayPopup ? " pointer-events-auto opacity-100 mt-0" : "opacity-0 pointer-events-none mt-5" } transition-all duration-500 p-8 rounded-2xl bg-white shadow-2xl max-w-xl w-full`}>
					<p className="absolute top-2 right-2 bg-button hover:to-button-hover text-white px-5 py-2 rounded-lg cursor-pointer" onClick={() => setDisplayPopup(false)}>X</p>
					<h2 className="font-bold text-2xl">Spelregels</h2>

					<ul className="list-disc pl-6 py-5">
						<li>Wat je deelt blijft hier</li>
						<li>Overslaan mag altijd</li>
						<li>Er zijn geen foute antwoorden</li>
						<li>Niemand oordeelt</li>
					</ul>

					<button onClick={handleStartGame} className="w-full cursor-pointer py-4 bg-button text-white rounded-lg font-semibold text-lg hover:bg-button-hover transition-colors">Ik heb het begrepen, spel starten</button>
				</div>

				{/* Start Game Button */}
				<button
					onClick={() => setDisplayPopup(true)}
					className="w-full py-4 bg-button hover:bg-button-hover text-white rounded-lg cursor-pointer font-semibold text-lg transition-colors"
				>
					Spel starten
				</button>
			</div>
		</div>
	);
}
