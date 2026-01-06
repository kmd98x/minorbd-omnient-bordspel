"use client";

import { useRef, useEffect, useState } from "react";
import { POSITIONS } from "@/data/circle-positions";
import { useGame } from "@/contexts/GameContext";
import Dice from "@/components/Dice";

export default function Board() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { players, currentPlayerIndex, updatePlayerPosition, setCurrentPlayerIndex } = useGame();
	const [diceValue, setDiceValue] = useState<number | null>(null);
	const [isRolling, setIsRolling] = useState(false);
	const [animatingPlayer, setAnimatingPlayer] = useState<{
		playerId: number;
		currentStep: number;
		targetPosition: number;
		startPosition: number;
	} | null>(null);
	const [animationComplete, setAnimationComplete] = useState<{
		playerId: number;
		targetPosition: number;
	} | null>(null);
	const [borderVisible, setBorderVisible] = useState(true);

	// Player colors
	const playerColors: Record<number, string> = {
		1: "#2563eb", // blue
		2: "#dc2626", // red
		3: "#059669", // green
		4: "#eab308", // yellow
	};
    
	// Store images in ref to avoid reloading
	const imagesRef = useRef<{
		positionImages: Array<{ position: typeof POSITIONS[0]; img: HTMLImageElement | null }>;
		playerPawns: Array<{ playerId: number; img: HTMLImageElement }>;
	} | null>(null);

	// Load images and draw static board (only when players or animatingPlayer changes)
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		canvas.width = 1000;
		canvas.height = 1000;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Load all position images first
		const positionImagePromises = POSITIONS.map((position) => {
			if (position.image) {
				const imagePath = position.image;
				return new Promise<{ position: typeof position; img: HTMLImageElement }>((resolve, reject) => {
					const img = new Image();
					img.onload = () => resolve({ position, img });
					img.onerror = reject;
					img.src = imagePath;
				});
			}
			return Promise.resolve<{ position: typeof position; img: HTMLImageElement | null }>({ position, img: null });
		});

		// Load player pawn images (player-1.svg, player-2.svg, etc.)
		const playerPawnPromises = players.map((player) => {
			return new Promise<{ playerId: number; img: HTMLImageElement }>((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve({ playerId: player.id, img });
				img.onerror = reject;
				img.src = `/images/player-${player.id}.svg`;
			});
		});

		Promise.all([...positionImagePromises, ...playerPawnPromises]).then((allImages) => {
			const positionImages = allImages.slice(0, POSITIONS.length) as Array<{ position: typeof POSITIONS[0]; img: HTMLImageElement | null }>;
			const playerPawns = allImages.slice(POSITIONS.length) as Array<{ playerId: number; img: HTMLImageElement }>;
			
			imagesRef.current = { positionImages, playerPawns };

			// Draw board positions
			POSITIONS.forEach((position, index) => {
				ctx.beginPath();
				ctx.arc(position.x, position.y, position.radius, 0, 2 * Math.PI);
				ctx.strokeStyle = "#737373"; // neutral-500 color
				ctx.lineWidth = 2;
				ctx.stroke();

				// Draw image if available
				const { img } = positionImages[index];
				if (img) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(position.x, position.y, position.radius, 0, 2 * Math.PI);
					ctx.clip();
					const size = position.radius * 0.8;
					ctx.drawImage(img, position.x - size / 2, position.y - size / 2, size, size);
					ctx.restore();
				}

				// Add text if available
				if (position.text.content !== "") {
					ctx.fillStyle = "#000000";
					ctx.font = "14px Arial";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText(position.text.content, position.text.x, position.text.y);
				}
			});

			// Draw player pieces (pawns) - without border
			players.forEach((player) => {
				let displayPosition = player.position;

				// If this player is animating, use the animated position
				if (animatingPlayer && animatingPlayer.playerId === player.id) {
					displayPosition = animatingPlayer.currentStep;
				}

				const position = POSITIONS.find((p) => p.number === displayPosition);
				if (!position) return;

				const playerPawn = playerPawns.find((pp) => pp.playerId === player.id);
				if (!playerPawn) return;

				// Draw the pawn image
				const pawnSize = 40;
				ctx.drawImage(
					playerPawn.img,
					position.x - pawnSize / 2,
					position.y - pawnSize / 2,
					pawnSize,
					pawnSize
				);
			});
		});
	}, [players, animatingPlayer]);

	// Draw border separately (only when border visibility changes)
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !imagesRef.current) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const currentPlayerInScope = players[currentPlayerIndex];
		if (!currentPlayerInScope) return;

		const shouldShowBorder = !isRolling && !animatingPlayer && borderVisible;

		// Get player position
		let displayPosition = currentPlayerInScope.position;
		if (animatingPlayer && animatingPlayer.playerId === currentPlayerInScope.id) {
			displayPosition = animatingPlayer.currentStep;
		}

		const position = POSITIONS.find((p) => p.number === displayPosition);
		if (!position) return;

		const playerPawn = imagesRef.current.playerPawns.find((pp) => pp.playerId === currentPlayerInScope.id);
		if (!playerPawn) return;

		const pawnSize = 40;

		// Clear the area around the pawn
		ctx.clearRect(
			position.x - pawnSize / 2 - 8,
			position.y - pawnSize / 2 - 8,
			pawnSize + 16,
			pawnSize + 16
		);

		// Redraw the pawn
		ctx.drawImage(
			playerPawn.img,
			position.x - pawnSize / 2,
			position.y - pawnSize / 2,
			pawnSize,
			pawnSize
		);

		// Draw border if needed
		if (shouldShowBorder) {
			ctx.save();
			ctx.strokeStyle = playerColors[currentPlayerInScope.id] || "#737373";
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.arc(position.x, position.y, pawnSize / 2 + 4, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.restore();
		}
	}, [borderVisible, currentPlayerIndex, isRolling, animatingPlayer, players]);

    const textStyling = "border-x border-neutral-800 flex-1 text-center py-2"
	const cardLabels = ["Be perfect", "Hurry up", "Be strong", "Pleaser", "Try hard"];

	// Get players by position
	const player1 = players.find(p => p.id === 1);
	const player2 = players.find(p => p.id === 2);
	const player3 = players.find(p => p.id === 3);
	const player4 = players.find(p => p.id === 4);

	// Get current player
	const currentPlayer = players[currentPlayerIndex];
	const isCurrentPlayerTurn = currentPlayer && !isRolling && !animatingPlayer;
	const currentPlayerColor = currentPlayer ? playerColors[currentPlayer.id] : "#737373";

	// Blink border when player's turn
	useEffect(() => {
		if (!isCurrentPlayerTurn) {
			setBorderVisible(false);
			return;
		}

		// Toggle border visibility every 2000ms
		const blinkInterval = setInterval(() => {
			setBorderVisible((prev) => !prev);
		}, 1000);

		return () => {
			clearInterval(blinkInterval);
		};
	}, [isCurrentPlayerTurn]);

	// Animate player movement
	useEffect(() => {
		if (!animatingPlayer) return;

		// Start animation with delay between steps
		const stepInterval = setInterval(() => {
			setAnimatingPlayer((prev) => {
				if (!prev) return null;

				const nextStep = prev.currentStep + 1;
				
				if (nextStep > prev.targetPosition) {
					// Animation complete - signal completion
					setAnimationComplete({
						playerId: prev.playerId,
						targetPosition: prev.targetPosition,
					});
					
					return null;
				}

				// Continue animation
				return {
					...prev,
					currentStep: nextStep,
				};
			});
		}, 200); // 200ms per step

		return () => {
			clearInterval(stepInterval);
		};
	}, [animatingPlayer]);

	// Handle animation completion and move to next player
	useEffect(() => {
		if (!animationComplete) return;

		// Update player position
		updatePlayerPosition(animationComplete.playerId, animationComplete.targetPosition);
		
		// Move to next player's turn
		const currentPlayerIdx = players.findIndex(p => p.id === animationComplete.playerId);
		if (currentPlayerIdx !== -1) {
			const nextIndex = (currentPlayerIdx + 1) % players.length;
			setCurrentPlayerIndex(nextIndex);
		}
		
		// Clear completion state
		setAnimationComplete(null);
	}, [animationComplete, updatePlayerPosition, setCurrentPlayerIndex, players]);

	// Roll dice function - called when dice finishes rolling
	const handleDiceRoll = (rolledValue: number) => {
		if (!currentPlayer) return;

		setDiceValue(rolledValue);
		setIsRolling(false);

		// Start animation for current player
		const newPosition = Math.min(currentPlayer.position + rolledValue, 39);
		setAnimatingPlayer({
			playerId: currentPlayer.id,
			currentStep: currentPlayer.position,
			targetPosition: newPosition,
			startPosition: currentPlayer.position,
		});
	};

	// Called when dice starts rolling
	const handleDiceRollStart = () => {
		setIsRolling(true);
	};

	return (
        <div className="relative flex flex-col items-center">
            {/* Player 1 - Top */}
            {player1 && (
                <>
                    <div className="w-[1000px] mb-2">
                        <h2 className="text-xl font-semibold text-center text-neutral-800 flex items-center justify-center gap-2">
                            <img
                                src="/images/player-1.svg"
                                alt="Speler 1"
                                className="h-8 w-8"
                            />
                            {player1.name}
                        </h2>
                    </div>
                    <div className="flex items-center justify-between w-[1000px] border-b-2 border-neutral-800 mt-20 mb-10" id="player-1">
                        {cardLabels.map((label, index) => (
                            <p key={index} className={textStyling}>{label}</p>
                        ))}
                    </div>
                </>
            )}

            <div className="relative flex items-center justify-center">
                {/* Player 4 - Left */}
                {player4 && (
                    <div className="absolute left-[-600px] top-1/2 -translate-y-1/2 flex flex-col items-center -rotate-90 origin-center">
                        <h2 className="text-xl font-semibold text-center text-neutral-800 whitespace-nowrap mb-4 flex items-center justify-center gap-2">
                            <img
                                src="/images/player-4.svg"
                                alt="Speler 4"
                                className="h-8 w-8"
                            />
                            {player4.name}
                        </h2>
                        <div className="flex items-center justify-between w-[1000px] border-b-2 border-neutral-800" id="player-4">
                            {cardLabels.map((label, index) => (
                                <p key={index} className={textStyling}>{label}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Canvas - Center */}
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        className="w-[1000px] h-[1000px]"
                    />
                    
                    {/* Dice - Right Bottom */}
                    <div className="absolute right-[-120px] bottom-0 flex flex-col items-center">
                        <div 
                            className="relative"
                            style={{
                                filter: isCurrentPlayerTurn ? `drop-shadow(0 0 15px ${currentPlayerColor})` : 'none'
                            }}
                        >
                            <Dice 
                                size={120} 
                                onRoll={handleDiceRoll}
                                onRollStart={handleDiceRollStart}
                                disabled={!isCurrentPlayerTurn || isRolling}
                            />
                        </div>
                        {currentPlayer && (
                            <p className="mt-2 text-sm text-neutral-600 font-semibold text-center">
                                {currentPlayer.name} aan de beurt
                            </p>
                        )}
                    </div>
                </div>

                {/* Player 3 - Right */}
                {player3 && (
                    <div className="absolute right-[-600px] top-1/2 -translate-y-1/2 flex flex-col items-center rotate-90 origin-center">
                        <h2 className="text-xl font-semibold text-center text-neutral-800 whitespace-nowrap mb-4 flex items-center justify-center gap-2">
                            <img
                                src="/images/player-3.svg"
                                alt="Speler 3"
                                className="h-8 w-8"
                            />
                            {player3.name}
                        </h2>
                        <div className="flex items-center justify-between w-[1000px] border-b-2 border-neutral-800" id="player-3">
                            {cardLabels.map((label, index) => (
                                <p key={index} className={textStyling}>{label}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Player 2 - Bottom */}
            {player2 && (
                <>
                    <div className="w-[1000px] mt-2">
                        <h2 className="text-xl font-semibold text-center text-neutral-800 flex items-center justify-center gap-2">
                            <img
                                src="/images/player-2.svg"
                                alt="Speler 2"
                                className="h-8 w-8"
                            />
                            {player2.name}
                        </h2>
                    </div>
                    <div className="flex items-center justify-between w-[1000px] border-t-2 border-neutral-800 mb-20 mt-10" id="player-2">
                        {cardLabels.map((label, index) => (
                            <p key={index} className={textStyling}>{label}</p>
                        ))}
                    </div>
                </>
            )}
        </div>
	);
}
