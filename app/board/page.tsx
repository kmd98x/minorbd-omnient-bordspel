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
		canvas.width = 900;
		canvas.height = 900;

		// Scale factor to convert from 1000x1000 to 900x900
		const scale = 0.9;

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
				const scaledX = position.x * scale;
				const scaledY = position.y * scale;
				const radiusMultiplier = 1.3; // Make steps larger
				const scaledRadius = position.radius * scale * radiusMultiplier;
				
				ctx.beginPath();
				ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
				ctx.strokeStyle = "#737373"; // neutral-500 color
				ctx.lineWidth = 1.5;
				ctx.stroke();

				// Draw image if available
				const { img } = positionImages[index];
				if (img) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
					ctx.clip();
					// Special size multiplier for bubbles (larger)
					const isBubble = position.image?.includes('bubble');
					const sizeMultiplier = isBubble ? 1.5 : 0.75;
					const size = scaledRadius * sizeMultiplier;
					ctx.drawImage(img, scaledX - size / 2, scaledY - size / 2, size, size);
					ctx.restore();
				}

				// Add text if available
				if (position.text.content !== "") {
					ctx.fillStyle = "#000000";
					ctx.font = "12px Arial";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText(position.text.content, position.text.x * scale, position.text.y * scale);
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
				const pawnSize = 32;
				const scaledX = position.x * scale;
				const scaledY = position.y * scale;
				ctx.drawImage(
					playerPawn.img,
					scaledX - pawnSize / 2,
					scaledY - pawnSize / 2,
					pawnSize,
					pawnSize
				);
			});
		});
	}, [players, animatingPlayer]);

	// Draw border separately (only when border visibility changes)
	// Only draw border for the player whose turn it is
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !imagesRef.current) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const currentPlayerInScope = players[currentPlayerIndex];
		if (!currentPlayerInScope) return;

		// Only show border when it's this player's turn and they're not rolling/animating
		const isCurrentPlayerTurn = !isRolling && !animatingPlayer;
		const shouldShowBorder = isCurrentPlayerTurn && borderVisible;

		// Get player position - use same logic as main draw to avoid double drawing
		let displayPosition = currentPlayerInScope.position;
		if (animatingPlayer && animatingPlayer.playerId === currentPlayerInScope.id) {
			displayPosition = animatingPlayer.currentStep;
		}

		const position = POSITIONS.find((p) => p.number === displayPosition);
		if (!position) return;

		const playerPawn = imagesRef.current.playerPawns.find((pp) => pp.playerId === currentPlayerInScope.id);
		if (!playerPawn) return;

		const scale = 0.9;
		const scaledX = position.x * scale;
		const scaledY = position.y * scale;
		const pawnSize = 32;

		// Only redraw if we need to show/hide the border and not animating
		if (!animatingPlayer && (shouldShowBorder || (isCurrentPlayerTurn && borderVisible === false))) {
			// Clear the area around the pawn
			ctx.clearRect(
				scaledX - pawnSize / 2 - 8,
				scaledY - pawnSize / 2 - 8,
				pawnSize + 16,
				pawnSize + 16
			);

			// Redraw the pawn
			ctx.drawImage(
				playerPawn.img,
				scaledX - pawnSize / 2,
				scaledY - pawnSize / 2,
				pawnSize,
				pawnSize
			);

			// Draw border only if it's this player's turn and border should be visible
			if (shouldShowBorder) {
				ctx.save();
				ctx.strokeStyle = playerColors[currentPlayerInScope.id] || "#737373";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(scaledX, scaledY, pawnSize / 2 + 3, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.restore();
			}
		}
	}, [borderVisible, currentPlayerIndex, isRolling, animatingPlayer, players, playerColors]);

	const cardLabels = ["Be perfect", "Hurry up", "Be strong", "Pleaser", "Try hard"];
	const cardImages = [
		"/images/cards/be-perfect.svg",
		"/images/cards/hurry-up.svg",
		"/images/cards/be-strong.svg",
		"/images/cards/pleaser.svg",
		"/images/cards/try-hard.svg"
	];

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
        <div 
            className="relative flex flex-col items-center min-h-screen w-full"
            style={{
                backgroundImage: 'url(/images/finalhomestate.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Player 1 - Top */}
            {player1 && (
                <div className="flex items-center justify-between w-[900px] mb-8 p-5 rounded-2xl" id="player-1">
                    {cardImages.map((image, index) => (
                        <img key={index} src={image} alt={cardLabels[index]} className="flex-1 h-auto object-contain max-h-[235px]" />
                    ))}
                </div>
            )}

            <div className="relative flex items-center justify-center">
                {/* Player 4 - Left */}
                {player4 && (
                    <div className="absolute left-[-650px] top-1/2 -translate-y-1/2 flex flex-col items-center -rotate-90 origin-center">
                        <div className="flex items-center justify-between w-[900px] p-5 rounded-2xl" id="player-4">
                            {cardImages.map((image, index) => (
                                <img key={index} src={image} alt={cardLabels[index]} className="flex-1 h-auto object-contain max-h-[235px]" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Canvas - Center */}
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        className="w-[900px] h-[900px] m-10"
                    />
                    
                    {/* Player 1 - Top (inside) */}
                    {player1 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2">
                            <h2 className="text-lg font-semibold text-center text-neutral-800 flex items-center justify-center gap-2">
                                <img
                                    src="/images/player-1.svg"
                                    alt="Speler 1"
                                    className="h-6 w-6"
                                />
                                {player1.name}
                            </h2>
                        </div>
                    )}

                    {/* Player 2 - Bottom (inside) */}
                    {player2 && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                            <h2 className="text-lg font-semibold text-center text-neutral-800 flex items-center justify-center gap-2">
                                <img
                                    src="/images/player-2.svg"
                                    alt="Speler 2"
                                    className="h-6 w-6"
                                />
                                {player2.name}
                            </h2>
                        </div>
                    )}

                    {/* Player 3 - Right (inside) */}
                    {player3 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 origin-center">
                            <h2 className="text-lg font-semibold text-center text-neutral-800 whitespace-nowrap flex items-center justify-center gap-2">
                                <img
                                    src="/images/player-3.svg"
                                    alt="Speler 3"
                                    className="h-6 w-6"
                                />
                                {player3.name}
                            </h2>
                        </div>
                    )}

                    {/* Player 4 - Left (inside) */}
                    {player4 && (
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
                            <h2 className="text-lg font-semibold text-center text-neutral-800 whitespace-nowrap flex items-center justify-center gap-2">
                                <img
                                    src="/images/player-4.svg"
                                    alt="Speler 4"
                                    className="h-6 w-6"
                                />
                                {player4.name}
                            </h2>
                        </div>
                    )}

                    {/* Card Decks */}
                    {/* Compliments Card Deck - Right Top */}
                    <div className="absolute right-[380px] top-6">
                        <img
                            src="/images/cards/compliment-card-deck.svg"
                            alt="Compliments Card Deck"
                            className="h-[235px]"
                        />
                    </div>

                    {/* Statement Card Deck - Left Middle */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <img
                            src="/images/cards/statement-card-deck.svg"
                            alt="Statement Card Deck"
                            className="h-[175px]"
                        />
                    </div>

                    {/* Bonding Card Deck - Right Bottom */}
                    <div className="absolute right-[200px] bottom-[230px]">
                        <img
                            src="/images/cards/bonding-card-deck.svg"
                            alt="Bonding Card Deck"
                            className="h-[235px]"
                        />
                    </div>
                    
                    {/* Dice - Right Bottom */}
                    <div className="absolute right-[-100px] bottom-0 flex flex-col items-center">
                        <div 
                            className="relative"
                            style={{
                                filter: isCurrentPlayerTurn ? `drop-shadow(0 0 15px ${currentPlayerColor})` : 'none'
                            }}
                        >
                            <Dice 
                                size={100} 
                                onRoll={handleDiceRoll}
                                onRollStart={handleDiceRollStart}
                                disabled={!isCurrentPlayerTurn || isRolling}
                            />
                        </div>
                        {currentPlayer && (
                            <p className="mt-2 text-xs text-neutral-600 font-semibold text-center">
                                {currentPlayer.name} aan de beurt
                            </p>
                        )}
                    </div>
                </div>

                {/* Player 3 - Right */}
                {player3 && (
                    <div className="absolute right-[-640px] top-1/2 -translate-y-1/2 flex flex-col items-center rotate-90 origin-center">
                        <div className="flex items-center justify-between w-[900px] p-5 rounded-2xl" id="player-3">
                            {cardImages.map((image, index) => (
                                <img key={index} src={image} alt={cardLabels[index]} className="flex-1 h-auto object-contain max-h-[235px]" />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Player 2 - Bottom */}
            {player2 && (
                <div className="flex items-center justify-between w-[900px] mt-8 p-5 rounded-2xl" id="player-2">
                    {cardImages.map((image, index) => (
                        <img key={index} src={image} alt={cardLabels[index]} className="flex-1 h-auto object-contain max-h-[235px]" />
                    ))}
                </div>
            )}
        </div>
	);
}
