"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { StatementCard } from "@/data/statements";

export type Player = {
	id: number;
	name: string;
	icon: string;
	position: number; // Position on the board (1-39)
	cards: {
		"Be perfect": StatementCard[];
		"Try hard": StatementCard[];
		"Pleaser": StatementCard[];
		"Hurry up": StatementCard[];
		"Be strong": StatementCard[];
	};
};

type GameContextType = {
	players: Player[];
	setPlayers: (players: Player[]) => void;
	updatePlayerPosition: (playerId: number, newPosition: number) => void;
	addPlayer: (name: string, icon: string) => void;
	removePlayer: (playerId: number) => void;
	addCardToPlayer: (playerId: number, card: StatementCard, category: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => void;
	currentPlayerIndex: number;
	setCurrentPlayerIndex: (index: number) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
	const [players, setPlayers] = useState<Player[]>([]);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

	const updatePlayerPosition = (playerId: number, newPosition: number) => {
		setPlayers((prevPlayers) =>
			prevPlayers.map((player) =>
				player.id === playerId
					? { ...player, position: newPosition }
					: player
			)
		);
	};

	const addPlayer = (name: string, icon: string) => {
		const newPlayer: Player = {
			id: players.length + 1,
			name,
			icon,
			position: 1, // Start at position 1 (START)
			cards: {
				"Be perfect": [],
				"Try hard": [],
				"Pleaser": [],
				"Hurry up": [],
				"Be strong": [],
			},
		};
		setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
	};

	const addCardToPlayer = (playerId: number, card: StatementCard, category: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => {
		setPlayers((prevPlayers) =>
			prevPlayers.map((player) =>
				player.id === playerId
					? { ...player, cards: { ...player.cards, [category]: [...player.cards[category], card] } }
					: player
			)
		);
	};

	const removePlayer = (playerId: number) => {
		setPlayers((prevPlayers) => prevPlayers.filter((p) => p.id !== playerId));
	};

	return (
		<GameContext.Provider
			value={{
				players,
				setPlayers,
				updatePlayerPosition,
				addPlayer,
				removePlayer,
				addCardToPlayer,
				currentPlayerIndex,
				setCurrentPlayerIndex,
			}}
		>
			{children}
		</GameContext.Provider>
	);
}

export function useGame() {
	const context = useContext(GameContext);
	if (context === undefined) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return context;
}
