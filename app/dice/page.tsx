"use client"

import { useState } from 'react'
import Dice from '@/components/Dice'

export default function DicePage() {
	const [lastRoll, setLastRoll] = useState<number | null>(null)

	const handleRoll = (value: number) => {
		setLastRoll(value)
	}

	return (
		<main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-8">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold text-gray-800 mb-4">3D Dice</h1>
				<p className="text-gray-600 mb-2">Click the dice to roll!</p>
				{lastRoll && (
					<p className="text-2xl font-semibold text-blue-600 mt-4">
						You rolled: <span className="text-3xl">{lastRoll}</span>
					</p>
				)}
			</div>
			
			<div className="mb-8">
				<Dice size={150} onRoll={handleRoll} />
			</div>

			<div className="text-center text-gray-500 text-sm">
				<p>Click anywhere on the dice to roll it</p>
			</div>
		</main>
	)
}

