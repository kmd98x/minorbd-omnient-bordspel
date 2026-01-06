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
		<div className="min-h-screen flex items-center justify-center bg-neutral-50 p-8">
			<div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-6xl">
				<h1 className="text-4xl font-bold text-center mb-8 text-neutral-800">
					Deelnemers
				</h1>

				{/* Player Setup Forms */}
				<div className="space-y-6 mb-8">
					{playerSetups.map((setup, index) => (
						<div
							key={index}
							className="border-2 border-neutral-200 rounded-lg p-6 bg-neutral-50"
						>
							{/* Name Input */}
							<div className="mb-4">
								<div className="flex items-center gap-4">
									<img
										src={`/images/player-${index + 1}.svg`}
										alt={`Speler ${index + 1}`}
										className="h-12 w-12 shrink-0 self-end mb-2"
									/>
									<div className="flex-1">
										<label className="block text-sm font-medium mb-2 text-neutral-600">
											Naam
										</label>
										<input
											type="text"
											value={setup.name}
											onChange={(e) =>
												updatePlayerSetup(index, "name", e.target.value)
											}
											placeholder={`Voer naam van speler ${index + 1} in`}
											className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800"
										/>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Start Game Button */}
				<button
					onClick={handleStartGame}
					className="w-full py-4 bg-neutral-800 text-white rounded-lg font-semibold text-lg hover:bg-neutral-700 transition-colors"
				>
					Spel Starten
				</button>
			</div>
		</div>
	);
}
