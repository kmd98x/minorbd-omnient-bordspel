"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { POSITIONS } from "@/data/circle-positions";
import { useGame } from "@/contexts/GameContext";
import Dice from "@/components/Dice";
import GameRulesModal from "@/components/GameRulesModal";
import CardStack from "@/components/CardStack";
import PlayerCardStack from "@/components/PlayerCardStack";
import Card from "@/components/Card";
import { STATEMENTS, StatementCard } from "@/data/statements";
import { COMPLIMENT_CARDS, ComplimentCard } from "@/data/compliments";
import { BONDING_CARDS } from "@/data/bonding";

const FINISH_POSITION = 39;

export default function Board() {
	const router = useRouter();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { players, currentPlayerIndex, updatePlayerPosition, setCurrentPlayerIndex, addCardToPlayer, moveCardBetweenCategories } = useGame();
	const [diceValue, setDiceValue] = useState<number | null>(null);
	const [isRolling, setIsRolling] = useState(false);
	const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
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
	const [showRulesModal, setShowRulesModal] = useState(false);
	const [showRestartModal, setShowRestartModal] = useState(false);
	const [showEnjoyMessage, setShowEnjoyMessage] = useState(false);
	const [showFinishModal, setShowFinishModal] = useState(false);
	const [activeCardStack, setActiveCardStack] = useState<"statement" | "compliment" | "bonding" | null>(null);
	const [drawnCard, setDrawnCard] = useState<StatementCard | ComplimentCard | string | null>(null);
	const [draggedCard, setDraggedCard] = useState<{ card: StatementCard; sourceCategory: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong" } | null>(null);

	// Handle card drag start from PlayerCardStack
	const handleCardDragStart = (e: React.DragEvent, card: StatementCard, sourceCategory: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => {
		if (!currentPlayer) return;
		
		// Set drag data
		e.dataTransfer.setData("application/json", JSON.stringify(card));
		e.dataTransfer.setData("source-category", sourceCategory);
		e.dataTransfer.effectAllowed = "move";
		
		// Store dragged card for preview
		setDraggedCard({ card, sourceCategory });
		
		// Create custom drag image
		const dragImage = document.createElement("div");
		dragImage.style.position = "absolute";
		dragImage.style.top = "-1000px";
		dragImage.style.left = "-1000px";
		dragImage.style.width = "320px";
		dragImage.style.height = "480px";
		dragImage.style.background = `url('/images/cards/stelling-card-bg.png')`;
		dragImage.style.backgroundSize = "cover";
		dragImage.style.padding = "12px";
		dragImage.style.borderRadius = "16px";
		dragImage.style.opacity = "0.9";
		
		const innerDiv = document.createElement("div");
		innerDiv.style.background = "white";
		innerDiv.style.borderRadius = "8px";
		innerDiv.style.padding = "16px";
		innerDiv.style.height = "100%";
		innerDiv.style.display = "flex";
		innerDiv.style.flexDirection = "column";
		innerDiv.style.alignItems = "center";
		innerDiv.style.justifyContent = "center";
		innerDiv.style.gap = "20px";
		
		if (card.hasQuestion) {
			const title = document.createElement("p");
			title.style.fontWeight = "bold";
			title.style.textAlign = "center";
			title.style.fontSize = "20px";
			title.style.marginBottom = "12px";
			title.textContent = "Herken je de uitspraak?";
			innerDiv.appendChild(title);
		}
		
		const text = document.createElement("p");
		text.style.textAlign = "center";
		text.style.fontSize = "18px";
		text.textContent = card.text;
		innerDiv.appendChild(text);
		
		dragImage.appendChild(innerDiv);
		document.body.appendChild(dragImage);
		
		// Set custom drag image
		e.dataTransfer.setDragImage(dragImage, 160, 240);
		
		// Clean up after a short delay
		setTimeout(() => {
			if (document.body.contains(dragImage)) {
				document.body.removeChild(dragImage);
			}
		}, 0);
	};

	// Redirect to /deelnemers if no players
	useEffect(() => {
		if (players.length === 0) {
			router.push('/deelnemers');
		}
	}, [players, router]);

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
				
				// Set drop shadow
				ctx.shadowBlur = 2.87;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 2.87;
				ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
				
				ctx.beginPath();
				ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
				// Fill with white background at 80% opacity
				ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
				ctx.fill();
				// Draw border - black border for all steps
				ctx.strokeStyle = "#000000"; // black border
				ctx.lineWidth = 1.5;
				ctx.stroke();
				
				// Reset shadow
				ctx.shadowBlur = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.shadowColor = "transparent";

				// Draw image if available
				const { img } = positionImages[index];
				if (img) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
					ctx.clip();
					// Special size multipliers
					const isBubble = position.image?.includes('bubble');
					const isText = position.image?.includes('text');
					let sizeMultiplier = 0.75;
					if (isBubble) {
						sizeMultiplier = 1.5;
					} else if (isText) {
						sizeMultiplier = 3.0; // Make start/finish text larger
					}
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
			// Group players by position to offset them when on the same square
			const playersByPosition: Record<number, typeof players> = {};
			players.forEach((player) => {
				let displayPosition = player.position;

				// If this player is animating, use the animated position
				if (animatingPlayer && animatingPlayer.playerId === player.id) {
					displayPosition = animatingPlayer.currentStep;
				}

				if (!playersByPosition[displayPosition]) {
					playersByPosition[displayPosition] = [];
				}
				playersByPosition[displayPosition].push(player);
			});

			// Draw pawns with offset if multiple players on same position
			const basePawnSize = 15; // Smaller pawns to show all when on same position
			const currentPlayerInScope = players[currentPlayerIndex];
			Object.entries(playersByPosition).forEach(([positionNum, playersAtPosition]) => {
				const position = POSITIONS.find((p) => p.number === parseInt(positionNum));
				if (!position) return;

				const scaledX = position.x * scale;
				const scaledY = position.y * scale;
				const offsetRadius = 8; // Offset radius for multiple pawns
				const angleStep = playersAtPosition.length > 1 ? (2 * Math.PI) / playersAtPosition.length : 0; // Angle between pawns

				playersAtPosition.forEach((player, index) => {
					const playerPawn = playerPawns.find((pp) => pp.playerId === player.id);
					if (!playerPawn) return;

					// Make current player's pawn larger
					const isCurrentPlayer = currentPlayerInScope && currentPlayerInScope.id === player.id;
					const pawnSize = isCurrentPlayer ? basePawnSize * 1.4 : basePawnSize; // 40% larger for current player

					// Calculate offset position in a circle if multiple players
					let offsetX = 0;
					let offsetY = 0;
					if (playersAtPosition.length > 1) {
						const angle = index * angleStep;
						offsetX = Math.cos(angle) * offsetRadius;
						offsetY = Math.sin(angle) * offsetRadius;
					}

					ctx.drawImage(
						playerPawn.img,
						scaledX - pawnSize / 2 + offsetX,
						scaledY - pawnSize / 2 + offsetY,
						pawnSize,
						pawnSize
					);
				});
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
		const basePawnSize = 15; // Base pawn size for non-current players

		// Calculate offset if multiple players on same position
		const playersAtPosition = players.filter((p) => {
			let pos = p.position;
			if (animatingPlayer && animatingPlayer.playerId === p.id) {
				pos = animatingPlayer.currentStep;
			}
			return pos === displayPosition;
		});
		
		const offsetRadius = 8;
		const angleStep = playersAtPosition.length > 1 ? (2 * Math.PI) / playersAtPosition.length : 0;
		const currentPlayerIndexAtPosition = playersAtPosition.findIndex((p) => p.id === currentPlayerInScope.id);
		let offsetX = 0;
		let offsetY = 0;
		if (playersAtPosition.length > 1 && currentPlayerIndexAtPosition !== -1) {
			const angle = currentPlayerIndexAtPosition * angleStep;
			offsetX = Math.cos(angle) * offsetRadius;
			offsetY = Math.sin(angle) * offsetRadius;
		}

		// Only redraw if we need to show/hide the border and not animating
		if (!animatingPlayer && (shouldShowBorder || (isCurrentPlayerTurn && borderVisible === false))) {
			const radiusMultiplier = 1.3;
			const scaledRadius = position.radius * scale * radiusMultiplier;
			const currentPlayerPawnSize = basePawnSize * 1.4; // Larger size for current player
			
			// Clear the area around the step and pawn
			const clearArea = Math.max(scaledRadius * 2, currentPlayerPawnSize + 16);
			ctx.clearRect(
				scaledX - clearArea / 2,
				scaledY - clearArea / 2,
				clearArea,
				clearArea
			);

			// Redraw the step circle with black border and 80% white background
			ctx.save();
			ctx.shadowBlur = 2.87;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 2.87;
			ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
			
			ctx.beginPath();
			ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
			ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
			ctx.fill();
			ctx.strokeStyle = "#000000"; // black border
			ctx.lineWidth = 1.5;
			ctx.stroke();
			
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowColor = "transparent";
			ctx.restore();

			// Redraw position image if available
			const positionIndex = POSITIONS.findIndex((p) => p.number === displayPosition);
			if (positionIndex !== -1 && imagesRef.current.positionImages[positionIndex]?.img) {
				const { img } = imagesRef.current.positionImages[positionIndex];
				ctx.save();
				ctx.beginPath();
				ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
				ctx.clip();
				const isBubble = position.image?.includes('bubble');
				const isText = position.image?.includes('text');
				let sizeMultiplier = 0.75;
				if (isBubble) {
					sizeMultiplier = 1.5;
				} else if (isText) {
					sizeMultiplier = 3.0;
				}
				const size = scaledRadius * sizeMultiplier;
				ctx.drawImage(img, scaledX - size / 2, scaledY - size / 2, size, size);
				ctx.restore();
			}

			// Redraw text if available
			if (position.text.content !== "") {
				ctx.save();
				ctx.fillStyle = "#000000";
				ctx.font = "12px Arial";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(position.text.content, position.text.x * scale, position.text.y * scale);
				ctx.restore();
			}

			// Redraw all pawns at this position (to handle multiple players)
			playersAtPosition.forEach((player, index) => {
				const playerPawnImg = imagesRef.current?.playerPawns.find((pp) => pp.playerId === player.id);
				if (!playerPawnImg) return;

				// Make current player's pawn larger
				const isCurrentPlayer = currentPlayerInScope && currentPlayerInScope.id === player.id;
				const playerPawnSize = isCurrentPlayer ? basePawnSize * 1.4 : basePawnSize; // 40% larger for current player

				let pawnOffsetX = 0;
				let pawnOffsetY = 0;
				if (playersAtPosition.length > 1) {
					const angle = index * angleStep;
					pawnOffsetX = Math.cos(angle) * offsetRadius;
					pawnOffsetY = Math.sin(angle) * offsetRadius;
				}

				ctx.drawImage(
					playerPawnImg.img,
					scaledX - playerPawnSize / 2 + pawnOffsetX,
					scaledY - playerPawnSize / 2 + pawnOffsetY,
					playerPawnSize,
					playerPawnSize
				);
			});

			// Draw border only if it's this player's turn and border should be visible
			if (shouldShowBorder) {
				const currentPlayerPawnSize = basePawnSize * 1.4; // Use larger size for current player's border
				ctx.save();
				ctx.strokeStyle = "#1e3a8a"; // Dark blue border
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(scaledX + offsetX, scaledY + offsetY, currentPlayerPawnSize / 2 + 3, 0, 2 * Math.PI);
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
	const isCurrentPlayerAtFinish = currentPlayer?.position >= FINISH_POSITION;
	const isCurrentPlayerTurn = currentPlayer && !isRolling && !animatingPlayer && !isCurrentPlayerAtFinish;
	const currentPlayerColor = currentPlayer ? playerColors[currentPlayer.id] : "#737373";

	// Blink border when player's turn
	useEffect(() => {
		if (!isCurrentPlayerTurn) {
			setBorderVisible(false);
			return;
		}

		// Toggle border visibility every 500ms (faster blinking)
		const blinkInterval = setInterval(() => {
			setBorderVisible((prev) => !prev);
		}, 500);

		return () => {
			clearInterval(blinkInterval);
		};
	}, [isCurrentPlayerTurn]);

	// Reset hasRolledThisTurn when turn changes
	useEffect(() => {
		setHasRolledThisTurn(false);
	}, [currentPlayerIndex]);


	// Check if all players are at finish and skip players at finish when turn changes
	useEffect(() => {
		if (players.length === 0) return;
		
		// Check if all players are at finish
		const allAtFinish = players.every(player => player.position >= FINISH_POSITION);
		if (allAtFinish) {
			setShowFinishModal(true);
			return;
		}
		
		// Skip current player if at finish
		const currentPlayer = players[currentPlayerIndex];
		if (currentPlayer && currentPlayer.position >= FINISH_POSITION) {
			// Find next player not at finish
			let nextIndex: number | null = null;
			for (let i = 0; i < players.length; i++) {
				const index = (currentPlayerIndex + 1 + i) % players.length;
				const player = players[index];
				if (player.position < FINISH_POSITION) {
					nextIndex = index;
					break;
				}
			}
			
			if (nextIndex !== null && nextIndex !== currentPlayerIndex) {
				// Only update if different to avoid infinite loop
				setCurrentPlayerIndex(nextIndex);
			} else if (nextIndex === null) {
				setShowFinishModal(true);
			}
		}
	}, [currentPlayerIndex, players, setCurrentPlayerIndex]);

	// Scroll to current player's deck when turn changes
	useEffect(() => {
		if (!currentPlayer) return;
		
		const playerDeckId = `player-${currentPlayer.id}`;
		const playerDeck = document.getElementById(playerDeckId);
		
		if (playerDeck) {
			// Small delay to ensure DOM is updated
			setTimeout(() => {
				playerDeck.scrollIntoView({ 
					behavior: 'smooth', 
					block: 'center',
					inline: 'center'
				});
			}, 100);
		}
	}, [currentPlayerIndex, currentPlayer]);

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


	// Handle special actions and card drawing
	const handlePositionAction = (playerId: number, position: number): boolean => {
		const positionData = POSITIONS.find(p => p.number === position);
		if (!positionData) return false;

		const image = positionData.image || "";
		let finalPosition = position;

		// Handle special actions first
		if (image.includes("+2")) {
			// Move 2 steps forward
			finalPosition = Math.min(position + 2, 39);
			updatePlayerPosition(playerId, finalPosition);
			return false; // No card for special actions
		} else if (image.includes("-1")) {
			// Move 1 step backward
			finalPosition = Math.max(position - 1, 1);
			updatePlayerPosition(playerId, finalPosition);
			return false; // No card for special actions
		} else if (image.includes("verwissel")) {
			// Swap with next player (clockwise)
			const currentPlayerIdx = players.findIndex(p => p.id === playerId);
			if (currentPlayerIdx !== -1) {
				const nextPlayerIdx = (currentPlayerIdx + 1) % players.length;
				const nextPlayer = players[nextPlayerIdx];
				const currentPlayer = players[currentPlayerIdx];
				
				// Swap positions
				const tempPosition = currentPlayer.position;
				updatePlayerPosition(currentPlayer.id, nextPlayer.position);
				updatePlayerPosition(nextPlayer.id, tempPosition);
			}
			return false; // Don't draw card on swap
		}

		// Determine card type to draw
		let cardType: "statement" | "compliment" | "bonding" | null = null;
		
		if (image.includes("compliment-bubble") || image.includes("hart")) {
			// Compliment card
			cardType = "compliment";
		} else if (image.includes("bonding-bubble") || image.includes("hand")) {
			// Bonding card
			cardType = "bonding";
		} else if (!image.includes("+2") && !image.includes("-1") && !image.includes("verwissel") && !image.includes("text")) {
			// Statement card (default for normal positions without special icons)
			cardType = "statement";
		}

		// Activate card stack if card should be drawn
		if (cardType) {
			setActiveCardStack(cardType);
			return true; // Card stack will be activated
		}

		return false; // No card to show
	};

	// Handle animation completion
	useEffect(() => {
		if (!animationComplete) return;

		const { playerId, targetPosition } = animationComplete;

		// Update player position first
		updatePlayerPosition(playerId, targetPosition);

		// Then handle special actions and card drawing
		const shouldShowCard = handlePositionAction(playerId, targetPosition);
		
		// If no card should be shown, move to next player immediately
		if (!shouldShowCard) {
			const currentPlayerIdx = players.findIndex(p => p.id === playerId);
			if (currentPlayerIdx !== -1) {
				// Find next player not at finish
				let nextIndex: number | null = null;
				for (let i = 0; i < players.length; i++) {
					const index = (currentPlayerIdx + 1 + i) % players.length;
					const player = players[index];
					if (player.position < FINISH_POSITION) {
						nextIndex = index;
						break;
					}
				}
				
				if (nextIndex !== null) {
					setCurrentPlayerIndex(nextIndex);
				} else {
					// All players at finish
					setShowFinishModal(true);
				}
			}
		}
		
		// Clear completion state
		setAnimationComplete(null);
	}, [animationComplete, updatePlayerPosition, setCurrentPlayerIndex, players]);


	// Move to next player after card is drawn
	const handleCardDrawn = () => {
		// Find current player and move to next
		const currentPlayerIdx = players.findIndex(p => p.id === currentPlayer?.id);
		if (currentPlayerIdx !== -1) {
			// Find next player not at finish
			let nextIndex: number | null = null;
			for (let i = 0; i < players.length; i++) {
				const index = (currentPlayerIdx + 1 + i) % players.length;
				const player = players[index];
				if (player.position < FINISH_POSITION) {
					nextIndex = index;
					break;
				}
			}
			
			if (nextIndex !== null) {
				setCurrentPlayerIndex(nextIndex);
			} else {
				// All players at finish
				setShowFinishModal(true);
			}
		}
	};

	// Handle drop on player deck category
	const handleDrop = (e: React.DragEvent, playerId: number, category: "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong") => {
		e.preventDefault();
		
		// Only allow drop on current player's deck
		if (playerId !== currentPlayer?.id) return;

		const cardData = e.dataTransfer.getData("application/json");
		const sourceCategory = e.dataTransfer.getData("source-category");
		
		if (cardData) {
			try {
				const card: StatementCard = JSON.parse(cardData);
				
				// If source category is provided, this is a move between categories
				if (sourceCategory) {
					const sourceCat = sourceCategory as "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
					// Only move if source and target are different
					if (sourceCat !== category) {
						moveCardBetweenCategories(playerId, card, sourceCat, category);
					}
					setDraggedCard(null);
				} else {
					// Otherwise, it's a new card from the stack
					addCardToPlayer(playerId, card, category);
					setDrawnCard(null);
					setActiveCardStack(null);
					handleCardDrawn();
				}
			} catch (error) {
				console.error("Error parsing card data:", error);
			}
		}
	};

	// Handle card drag end
	const handleCardDragEnd = () => {
		setDraggedCard(null);
	};

	// Handle card drawn from stack
	const handleCardDrawnFromStack = (card: StatementCard | ComplimentCard | string) => {
		// Card is already displayed in CardStack component
		// When card is clicked (not dragged), close CardStack and move to next player
		// When card is dragged and dropped, handleDrop will handle closing
		if (activeCardStack === "statement") {
			// For statement cards clicked (not dragged), close CardStack and move to next player
			// If dragged, handleDrop will handle the close
			setDrawnCard(null); // Clear any previous drawn card
			setActiveCardStack(null); // Close CardStack
			handleCardDrawn(); // Move to next player
		} else {
			// For compliment and bonding, just close and move to next player
			setActiveCardStack(null);
			handleCardDrawn();
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

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
		setHasRolledThisTurn(true);
	};

	return (
        <div 
            className="relative flex flex-col items-center min-h-screen w-full"
            style={{
                backgroundImage: 'url(/images/background-image.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Player 1 - Top */}
            {player1 && (
                <div 
                    className={`flex items-center justify-between w-[900px] mb-8 p-5 rounded-2xl transition-all ${
                        currentPlayer?.id === 1 && borderVisible && isCurrentPlayerTurn
                            ? 'border-4'
                            : 'border-4 border-transparent'
                            }`}
                    id="player-1"
                    style={{
                        borderColor: currentPlayer?.id === 1 && borderVisible && isCurrentPlayerTurn 
                            ? 'var(--color-button-hover)' 
                            : 'transparent'
                    }}
                    onDragOver={handleDragOver}
                >
                    {cardLabels.map((label, index) => {
                        const category = label as "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
                        const cards = player1.cards[category];
                        return (
                            <div
                                key={index}
                                onDrop={(e) => handleDrop(e, 1, category)}
                                onDragOver={handleDragOver}
                                className={`flex-1 flex flex-col items-center justify-center mx-2 min-h-[235px] rounded-lg border-2 border-dashed transition-all relative ${
                                    currentPlayer?.id === 1 && activeCardStack === "statement"
                                        ? "border-button-hover"
                                        : "border-transparent"
                                }`}
                            >
                                <img 
                                    src={cardImages[index]} 
                                    alt={label} 
                                    className="h-auto object-contain w-full max-h-[400px] mb-2" 
                                />
                                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-10" style={{ transform: 'translateY(-10%)' }}>
                                    <PlayerCardStack cards={cards} playerId={1} category={category} onDragStart={handleCardDragStart} onDragEnd={handleCardDragEnd} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="relative flex items-center justify-center">
                {/* Player 4 - Left */}
                {player4 && (
                    <div className="absolute left-[-650px] top-1/2 -translate-y-1/2 flex flex-col items-center -rotate-90 origin-center">
                        <div 
                            className={`flex items-center justify-between w-[900px] p-5 rounded-2xl transition-all ${
                                currentPlayer?.id === 4 && borderVisible && isCurrentPlayerTurn
                                    ? 'border-4'
                                    : 'border-4 border-transparent'
                            }`}
                            id="player-4"
                            style={{
                                borderColor: currentPlayer?.id === 4 && borderVisible && isCurrentPlayerTurn 
                                    ? 'var(--color-button-hover)' 
                                    : 'transparent'
                            }}
                            onDragOver={handleDragOver}
                        >
                            {cardLabels.map((label, index) => {
                                const category = label as "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
                                const cards = player4.cards[category];
                                return (
                                    <div
                                        key={index}
                                        onDrop={(e) => handleDrop(e, 4, category)}
                                        onDragOver={handleDragOver}
                                        className={`flex-1 flex flex-col items-center justify-center mx-2 min-h-[235px] rounded-lg border-2 border-dashed transition-all relative ${
                                            currentPlayer?.id === 4 && activeCardStack === "statement"
                                                ? "border-button-hover"
                                                : "border-transparent"
                                        }`}
                                    >
                                        <img 
                                            src={cardImages[index]} 
                                            alt={label} 
                                            className="h-auto object-contain w-full max-h-[400px] mb-2" 
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-10" style={{ transform: 'translateY(-10%)' }}>
                                            <PlayerCardStack cards={cards} playerId={4} category={category} onDragStart={handleCardDragStart} onDragEnd={handleCardDragEnd} />
                                        </div>
                                    </div>
                                );
                            })}
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
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10">
                            <h2 className="text-lg font-semibold text-center text-neutral-800 flex items-center justify-center gap-2 scale-[1.5]">
                                <img
                                    src="/images/player-1.svg"
                                    alt="Speler 1"
                                    className="h-6 w-6"
                                />
                                {player1.name}
                            </h2>
                        </div>
                    )}

                    {/* Player 2 - Right (inside) */}
                    {player2 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 origin-center">
                            <h2 className="text-lg font-semibold text-center text-neutral-800 whitespace-nowrap flex items-center justify-center gap-2">
                                <img
                                    src="/images/player-2.svg"
                                    alt="Speler 2"
                                    className="h-6 w-6"
                                />
                                {player2.name}
                            </h2>
                        </div>
                    )}

                    {/* Player 3 - Bottom (inside) */}
                    {player3 && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                            <h2 className="text-lg font-semibold text-center text-neutral-800 flex items-center justify-center gap-2">
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
                    {activeCardStack === "compliment" && (
                        <div className="absolute right-[380px] top-6 z-20">
                            <CardStack type="compliment" onCardDrawn={handleCardDrawnFromStack} />
                        </div>
                    )}
                    {activeCardStack !== "compliment" && (
                        <div className="absolute right-[380px] top-6">
                            <img
                                src="/images/cards/compliment-card-deck.svg"
                                alt="Compliments Card Deck"
                                className={`h-[235px] ${activeCardStack === "statement" || activeCardStack === "bonding" ? "opacity-20" : ""}`}
                            />
                        </div>
                    )}

                    {/* Statement Card Deck - Left Middle */}
                    {activeCardStack === "statement" && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
                            <CardStack type="statement" onCardDrawn={handleCardDrawnFromStack} />
                        </div>
                    )}
                    {activeCardStack !== "statement" && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <img
                                src="/images/cards/statement-card-deck.svg"
                                alt="Statement Card Deck"
                                className={`h-[175px] ${activeCardStack === "compliment" || activeCardStack === "bonding" ? "opacity-20" : ""}`}
                            />
                        </div>
                    )}

                    {/* Bonding Card Deck - Right Bottom */}
                    {activeCardStack === "bonding" && (
                        <div className="absolute right-[200px] bottom-[230px] z-20">
                            <CardStack type="bonding" onCardDrawn={handleCardDrawnFromStack} />
                        </div>
                    )}
                    {activeCardStack !== "bonding" && (
                        <div className="absolute right-[200px] bottom-[230px]">
                            <img
                                src="/images/cards/bonding-card-deck.svg"
                                alt="Bonding Card Deck"
                                className={`h-[235px] ${activeCardStack === "compliment" || activeCardStack === "statement" ? "opacity-20" : ""}`}
                            />
                        </div>
                    )}
                    

                    {/* Game Rules Modal */}
                    <GameRulesModal
                        isOpen={showRulesModal}
                        onClose={() => setShowRulesModal(false)}
                    />

                    {/* Dice - Center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+63px)] -translate-y-[calc(50%+67px)] flex flex-col items-center z-10">
                        <div 
                            className="relative"
                            style={{
                                filter: isCurrentPlayerTurn ? `drop-shadow(0 0 15px ${currentPlayerColor})` : 'none'
                            }}
                        >
                            <Dice 
                                size={50} 
                                onRoll={handleDiceRoll}
                                onRollStart={handleDiceRollStart}
                                disabled={!isCurrentPlayerTurn || isRolling || hasRolledThisTurn}
                            />
                        </div>
                    </div>

                    {/* Restart Button and Info Icon - Top Right */}
                    <div className="absolute right-4 top-4 flex items-center gap-3 z-10">
                        <button
                            onClick={() => setShowRestartModal(true)}
                            className="bg-button hover:bg-button-hover transition duration-300 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-semibold text-lg"
                            aria-label="Spel herstarten"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            Restarten
                        </button>
                        <button
                            onClick={() => setShowRulesModal(true)}
                            className="bg-button hover:bg-button-hover text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
                            aria-label="Spelregels bekijken"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Restart Confirmation Modal */}
                    {showRestartModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                                <h2 className="text-2xl font-bold text-center mb-6 text-button-hover">
                                    Bent u zeker dat u opnieuw wilt starten?
                                </h2>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setShowRestartModal(false);
                                            router.push("/deelnemers");
                                        }}
                                        className="flex-1 bg-button hover:bg-button-hover text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                                    >
                                        Ja
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRestartModal(false);
                                            setShowEnjoyMessage(true);
                                            setTimeout(() => setShowEnjoyMessage(false), 2000);
                                        }}
                                        className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-6 py-3 rounded-lg transition-colors font-semibold"
                                    >
                                        Nee
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enjoy Message */}
                    {showEnjoyMessage && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center">
                                <p className="text-2xl font-bold text-button-hover">
                                    Veel plezier! 🎲
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Finish Modal */}
                    {showFinishModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                                <h2 className="text-2xl font-bold text-center mb-6 text-button-hover">
                                    Klaar! Tijd voor het reflectie vel!
                                </h2>
                                <button
                                    onClick={() => {
                                        router.push("/reflectie");
                                    }}
                                    className="w-full bg-button hover:bg-button-hover text-white px-6 py-3 rounded-lg transition-colors font-semibold text-lg"
                                >
                                    Naar de reflectie
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Dragged Card Preview */}
                    {draggedCard && (
                        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                            <div className="opacity-80">
                                <Card
                                    type="stelling"
                                    cardTitle={draggedCard.card.hasQuestion ? "Herken je de uitspraak?" : ""}
                                    cardStatement={draggedCard.card.text}
                                />
                            </div>
                        </div>
                    )}

                </div>

                {/* Player 2 - Right */}
                {player2 && (
                    <div className="absolute right-[-640px] top-1/2 -translate-y-1/2 flex flex-col items-center rotate-90 origin-center">
                        <div 
                            className={`flex items-center justify-between w-[900px] p-5 rounded-2xl transition-all ${
                                currentPlayer?.id === 2 && borderVisible && isCurrentPlayerTurn
                                    ? 'border-4'
                                    : 'border-4 border-transparent'
                            }`}
                            id="player-2"
                            style={{
                                borderColor: currentPlayer?.id === 2 && borderVisible && isCurrentPlayerTurn 
                                    ? 'var(--color-button-hover)' 
                                    : 'transparent'
                            }}
                            onDragOver={handleDragOver}
                        >
                            {cardLabels.map((label, index) => {
                                const category = label as "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
                                const cards = player2.cards[category];
                                return (
                                    <div
                                        key={index}
                                        onDrop={(e) => handleDrop(e, 2, category)}
                                        onDragOver={handleDragOver}
                                        className={`flex-1 flex flex-col items-center justify-center mx-2 min-h-[235px] rounded-lg border-2 border-dashed transition-all relative ${
                                            currentPlayer?.id === 2 && activeCardStack === "statement"
                                                ? "border-button-hover"
                                                : "border-transparent"
                                        }`}
                                    >
                                        <img 
                                            src={cardImages[index]} 
                                            alt={label} 
                                            className="h-auto object-contain w-full max-h-[400px] mb-2" 
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-10" style={{ transform: 'translateY(-10%)' }}>
                                            <PlayerCardStack cards={cards} playerId={2} category={category} onDragStart={handleCardDragStart} onDragEnd={handleCardDragEnd} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Player 3 - Bottom */}
            {player3 && (
                <div 
                    className={`flex items-center justify-between w-[900px] mt-8 p-5 rounded-2xl transition-all ${
                        currentPlayer?.id === 3 && borderVisible && isCurrentPlayerTurn
                            ? 'border-4'
                            : 'border-4 border-transparent'
                            }`}
                    id="player-3"
                    style={{
                        borderColor: currentPlayer?.id === 3 && borderVisible && isCurrentPlayerTurn 
                            ? 'var(--color-button-hover)' 
                            : 'transparent'
                    }}
                    onDragOver={handleDragOver}
                >
                    {cardLabels.map((label, index) => {
                        const category = label as "Be perfect" | "Try hard" | "Pleaser" | "Hurry up" | "Be strong";
                        const cards = player3.cards[category];
                        return (
                            <div
                                key={index}
                                onDrop={(e) => handleDrop(e, 3, category)}
                                onDragOver={handleDragOver}
                                className={`flex-1 flex flex-col items-center justify-center mx-2 min-h-[235px] rounded-lg border-2 border-dashed transition-all relative ${
                                    currentPlayer?.id === 3 && activeCardStack === "statement"
                                        ? "border-button-hover"
                                        : "border-transparent"
                                }`}
                            >
                                <img 
                                    src={cardImages[index]} 
                                    alt={label} 
                                    className="h-auto object-contain w-full max-h-[400px] mb-2" 
                                />
                                <div className="absolute top-0 left-0 right-0 flex items-center justify-center z-10" style={{ transform: 'translateY(-70%)' }}>
                                    <PlayerCardStack cards={cards} reversed={true} playerId={3} category={category} onDragStart={handleCardDragStart} onDragEnd={handleCardDragEnd} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
