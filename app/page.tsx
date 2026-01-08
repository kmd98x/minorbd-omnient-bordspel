import Image from "next/image"

export default function Home() {
	const size = 300;

	return (
		<main style={{ backgroundImage: "url('/images/finalhomestate.jpg')" }} className="h-screen w-screen bg-no-repeat bg-cover">
			<Image
				alt="Omnient logo"
				src="/images/omnient-logo.svg"
				width={size}
				height={size}
				loading="eager"
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 home-omnient-logo" />

			<a href="/deelnemers" className="absolute left-1/2 -translate-x-1/2 bottom-10 bg-button  hover:bg-button-hover transition duration-300 uppercase tracking-[12px] font-bold text-white px-12 py-6 rounded-xl shadow-2xl">Starten</a>
		</main>
	)
}
