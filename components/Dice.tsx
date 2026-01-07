"use client"

import { useState } from 'react'

interface DiceProps {
	size?: number
	onRoll?: (value: number) => void
	onRollStart?: () => void
	disabled?: boolean
}

export default function Dice({ size = 100, onRoll, onRollStart, disabled = false }: DiceProps) {
	const [isRolling, setIsRolling] = useState(false)
	const [value, setValue] = useState(1)

	const rollDice = () => {
		if (isRolling || disabled) return

		setIsRolling(true)
		onRollStart?.()
		const newValue = Math.floor(Math.random() * 6) + 1
		
		setTimeout(() => {
			setValue(newValue)
			setIsRolling(false)
			onRoll?.(newValue)
		}, 1000)
	}

	const getRotation = () => {
		if (isRolling) {
			return {}
		}

		// Rotations to show each face (bringing that face to the front)
		const rotations: Record<number, string> = {
			1: 'rotateX(0deg) rotateY(0deg)',      // Face 1 is already at front
			2: 'rotateX(0deg) rotateY(-90deg)',     // Rotate to show right face (2)
			3: 'rotateX(0deg) rotateY(90deg)',      // Rotate to show left face (3)
			4: 'rotateX(90deg) rotateY(0deg)',     // Rotate to show top face (4)
			5: 'rotateX(-90deg) rotateY(0deg)',      // Rotate to show bottom face (5)
			6: 'rotateX(0deg) rotateY(180deg)',    // Rotate to show back face (6)
		}

		return { transform: rotations[value] }
	}

	return (
		<div className="dice-container" style={{ opacity: disabled ? 0.5 : 1 }}>
			<div
				className={`dice ${isRolling ? 'dice-rolling' : ''}`}
				style={{
					width: `${size}px`,
					height: `${size}px`,
					position: 'relative',
					transformStyle: 'preserve-3d',
					transition: isRolling ? 'none' : 'transform 0.6s ease',
					cursor: disabled ? 'not-allowed' : 'pointer',
					willChange: 'transform',
					transformOrigin: 'center center',
					...getRotation()
				}}
				onClick={rollDice}
			>
				{/* Face 1 - Front */}
				<div
					className="dice-face face-1"
					style={{
						transform: `translate3d(0, 0, ${size / 2}px)`,
					}}
				>
					<div className="dot"></div>
				</div>

				{/* Face 2 - Right */}
				<div
					className="dice-face face-2"
					style={{
						transform: `rotateY(90deg) translate3d(0, 0, ${size / 2}px)`,
					}}
				>
					<div className="dot"></div>
					<div className="dot"></div>
				</div>

				{/* Face 3 - Left */}
				<div
					className="dice-face face-3"
					style={{
						transform: `rotateY(-90deg) translate3d(0, 0, ${size / 2}px)`,
					}}
				>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
				</div>

				{/* Face 4 - Top */}
				<div
					className="dice-face face-4"
					style={{
						transform: `rotateX(-90deg) translate3d(0, 0, ${size / 2}px)`,
					}}
				>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
				</div>

				{/* Face 5 - Bottom */}
				<div
					className="dice-face face-5"
					style={{
						transform: `rotateX(90deg) translate3d(0, 0, ${size / 2}px)`,
					}}
				>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
				</div>

				{/* Face 6 - Back */}
				<div
					className="dice-face face-6"
					style={{
						transform: `rotateY(180deg) translate3d(0, 0, ${size / 2}px)`,
					}}
				>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
				</div>
			</div>
		</div>
	)
}

