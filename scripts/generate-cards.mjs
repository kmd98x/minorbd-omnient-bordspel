import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Card dimensions
const CARD_WIDTH = 220;
const CARD_HEIGHT = 337;

// Read the logo SVG to embed
const logoPath = path.join(__dirname, '../public/images/omnient-logo.svg');
const heartPath = path.join(__dirname, '../public/images/hart.svg');
const handPath = path.join(__dirname, '../public/images/hand.svg');

const logoContent = fs.readFileSync(logoPath, 'utf8');
const heartContent = fs.readFileSync(heartPath, 'utf8');
const handContent = fs.readFileSync(handPath, 'utf8');

// Extract SVG content (remove outer svg tags for embedding)
const extractSVGContent = (svgString) => {
	const match = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
	return match ? match[1] : svgString;
};

const logoSVG = extractSVGContent(logoContent);
const heartSVG = extractSVGContent(heartContent);
const handSVG = extractSVGContent(handContent);

// Helper to escape XML
function escapeXml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

// Helper to wrap text
function wrapText(text, maxWidth, fontSize) {
	const words = text.split(' ');
	const lines = [];
	let currentLine = '';

	words.forEach(word => {
		const testLine = currentLine + (currentLine ? ' ' : '') + word;
		// Approximate width: each character is roughly fontSize * 0.55 pixels wide (more accurate for Dutch)
		const testWidth = testLine.length * fontSize * 0.55;
		
		if (testWidth > maxWidth && currentLine) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = testLine;
		}
	});
	
	if (currentLine) {
		lines.push(currentLine);
	}
	
	return lines;
}

// Generate statement card
function generateStatementCard(statement, index) {
	const question = statement.hasQuestion ? "Herken je de uitspraak?" : "";
	const bottomText = statement.bottomText === "privacy" 
		? "Alles wat je deelt blijft in deze ruimte."
		: "Je mag altijd passen/overslaan.";
	
	// Wrap main text
	const mainTextLines = wrapText(statement.text, 180, 12);
	const questionLines = question ? wrapText(question, 180, 11) : [];
	const bottomTextLines = wrapText(bottomText, 180, 9);
	
	// Calculate positions
	const logoY = 25;
	const logoSize = 40;
	
	let currentY = question ? 75 : 85;
	const questionY = currentY;
	if (question) {
		currentY += questionLines.length * 16 + 10;
	}
	
	const mainTextY = currentY;
	const mainTextHeight = mainTextLines.length * 16;
	currentY += mainTextHeight + 20;
	
	const bottomTextY = 300;
	
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Background with subtle shadow effect -->
	<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#F5F5F5" rx="8"/>
	<rect x="2" y="2" width="${CARD_WIDTH - 4}" height="${CARD_HEIGHT - 4}" fill="white" rx="6" stroke="#D4D4D4" stroke-width="1.5"/>
	<rect x="3" y="3" width="${CARD_WIDTH - 6}" height="${CARD_HEIGHT - 6}" fill="white" rx="5"/>
	
	<!-- Logo at top center -->
	<g transform="translate(${CARD_WIDTH / 2}, ${logoY + logoSize / 2}) scale(${logoSize / 702}) translate(-351, -350)">
		${logoSVG}
	</g>
	
	<!-- Question text (if present) -->
	${questionLines.map((line, i) => `
		<text x="${CARD_WIDTH / 2}" y="${questionY + i * 16}" 
			font-family="Arial, sans-serif" font-size="11" font-weight="600" 
			fill="#333" text-anchor="middle">${escapeXml(line)}</text>
	`).join('')}
	
	<!-- Main statement text -->
	${mainTextLines.map((line, i) => `
		<text x="${CARD_WIDTH / 2}" y="${mainTextY + i * 16}" 
			font-family="Arial, sans-serif" font-size="12" 
			fill="#000" text-anchor="middle">${escapeXml(line)}</text>
	`).join('')}
	
	<!-- Bottom text -->
	${bottomTextLines.map((line, i) => `
		<text x="${CARD_WIDTH / 2}" y="${bottomTextY + i * 14}" 
			font-family="Arial, sans-serif" font-size="9" 
			fill="#666" text-anchor="middle">${escapeXml(line)}</text>
	`).join('')}
</svg>`;

	return svg;
}

// Generate compliment card
function generateComplimentCard(compliment, index) {
	const mainTextLines = wrapText(compliment.mainText, 180, 13);
	const subTextLines = wrapText(compliment.subText, 180, 10);
	
	const logoY = 25;
	const logoSize = 40;
	const heartSize = 30;
	
	const mainTextY = 90;
	const mainTextHeight = mainTextLines.length * 18;
	const subTextY = mainTextY + mainTextHeight + 15;
	const subTextHeight = subTextLines.length * 14;
	
	const heartY = CARD_HEIGHT - 50;
	
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Background with subtle shadow effect -->
	<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#F5F5F5" rx="8"/>
	<rect x="2" y="2" width="${CARD_WIDTH - 4}" height="${CARD_HEIGHT - 4}" fill="white" rx="6" stroke="#D4D4D4" stroke-width="1.5"/>
	<rect x="3" y="3" width="${CARD_WIDTH - 6}" height="${CARD_HEIGHT - 6}" fill="white" rx="5"/>
	
	<!-- Logo at top center -->
	<g transform="translate(${CARD_WIDTH / 2}, ${logoY + logoSize / 2}) scale(${logoSize / 702}) translate(-351, -350)">
		${logoSVG}
	</g>
	
	<!-- Main text (bold/larger) -->
	${mainTextLines.map((line, i) => `
		<text x="${CARD_WIDTH / 2}" y="${mainTextY + i * 18}" 
			font-family="Arial, sans-serif" font-size="13" font-weight="bold" 
			fill="#000" text-anchor="middle">${escapeXml(line)}</text>
	`).join('')}
	
	<!-- Sub text (smaller) -->
	${subTextLines.map((line, i) => `
		<text x="${CARD_WIDTH / 2}" y="${subTextY + i * 14}" 
			font-family="Arial, sans-serif" font-size="10" 
			fill="#555" text-anchor="middle">${escapeXml(line)}</text>
	`).join('')}
	
	<!-- Heart icon at bottom center -->
	<g transform="translate(${CARD_WIDTH / 2}, ${heartY + heartSize / 2}) scale(${heartSize / 58}) translate(-29, -27)">
		${heartSVG}
	</g>
</svg>`;

	return svg;
}

// Generate bonding card
function generateBondingCard(text, index) {
	const textLines = wrapText(text, 180, 12);
	
	const logoY = 25;
	const logoSize = 40;
	const handSize = 30;
	
	const textY = 100;
	const textHeight = textLines.length * 16;
	
	const handY = CARD_HEIGHT - 50;
	
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Background with subtle shadow effect -->
	<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#F5F5F5" rx="8"/>
	<rect x="2" y="2" width="${CARD_WIDTH - 4}" height="${CARD_HEIGHT - 4}" fill="white" rx="6" stroke="#D4D4D4" stroke-width="1.5"/>
	<rect x="3" y="3" width="${CARD_WIDTH - 6}" height="${CARD_HEIGHT - 6}" fill="white" rx="5"/>
	
	<!-- Logo at top center -->
	<g transform="translate(${CARD_WIDTH / 2}, ${logoY + logoSize / 2}) scale(${logoSize / 702}) translate(-351, -350)">
		${logoSVG}
	</g>
	
	<!-- Main text -->
	${textLines.map((line, i) => `
		<text x="${CARD_WIDTH / 2}" y="${textY + i * 16}" 
			font-family="Arial, sans-serif" font-size="12" 
			fill="#000" text-anchor="middle">${escapeXml(line)}</text>
	`).join('')}
	
	<!-- Hand icon at bottom center -->
	<g transform="translate(${CARD_WIDTH / 2}, ${handY + handSize / 2}) scale(${handSize / 60}) translate(-30, -28.5)">
		${handSVG}
	</g>
</svg>`;

	return svg;
}

// Import data from TypeScript files (we'll read and parse them)
function parseTypeScriptData(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	
	// For statements.ts - extract the array
	if (filePath.includes('statements')) {
		const arrayMatch = content.match(/export const STATEMENTS[^=]*=\s*\[([\s\S]*?)\];/);
		if (arrayMatch) {
			// This is a simplified parser - in production you'd want a proper TS parser
			// For now, we'll manually define the data
			return null; // We'll use embedded data
		}
	}
	
	return null;
}

// Embedded data (since parsing TS is complex, we embed it)
const STATEMENTS = [
	{ text: "Jij bent altijd zo sterk, jij redt je wel.", hasQuestion: true, bottomText: "privacy" },
	{ text: "Jij bent de verantwoordelijke van het gezin.", hasQuestion: true, bottomText: "pass" },
	{ text: "Jij bent net zo perfectionistisch als ik.", hasQuestion: true, bottomText: "privacy" },
	{ text: "Jij bent degene die altijd alles goed wil doen.", hasQuestion: true, bottomText: "pass" },
	{ text: "Jij bent gevoelig, dus je moet extra opletten.", hasQuestion: true, bottomText: "privacy" },
	{ text: "Als het druk wordt, trek ik mezelf meestal even terug in plaats van dat ik het deel.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik merk dat ik sneller doorpak dan dat ik toegeef dat iets me raakt.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik vertel liever wat ik heb opgelost dan waar ik mee zat.", hasQuestion: false, bottomText: "pass" },
	{ text: "Als iemand vraagt hoe het gaat, zeg ik vaak \"goed\", ook als dat maar half klopt.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik denk regelmatig: anderen hoeven dit niet van mij te weten.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik voel me prettiger als ik het gevoel heb dat ik alles onder controle heb.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik stel me sterk op, ook op momenten dat ik me eigenlijk onzeker voel.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik wacht lang voordat ik toegeef dat iets me te veel wordt.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik vind het lastig om te laten zien dat ik ergens mee worstel.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik praat makkelijker over de feiten van werk dan over wat het met mij doet.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik wil niet degene zijn die het 'zwaar' maakt.", hasQuestion: false, bottomText: "pass" },
	{ text: "Mijn eerste reactie is vaak: ik red dit wel.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Soms denk ik: dit hoort er gewoon bij, dus ik moet me erdoorheen slaan.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik zeg soms ja, terwijl ik eigenlijk nee voel.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik wil liever niemand teleurstellen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik pas me snel aan om de sfeer goed te houden.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik vind het lastig om grenzen aan te geven zonder daar een schuldgevoel van te krijgen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik weeg vaak eerst af hoe iets bij de ander overkomt, voordat ik iets zeg.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik slik mijn mening soms in om gedoe te voorkomen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik stem mijn gedrag af op de groep waar ik in zit.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik kies regelmatig voor de rust, ook als dat betekent dat ik mezelf opzij zet.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik pas mijn mening aan afhankelijk van wie er tegenover me zit.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik merk dat ik sneller meega dan dat ik echt stilsta bij wat ik wil.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik vind het fijn als iedereen zich prettig voelt, zelfs als dat mij iets kost.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Als ik een doel behaald heb, voelt dat als vanzelfsprekend en niet als een mijlpaal.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik heb vaak het gevoel dat ik nét iets extra's moet laten zien.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Als het rustig is, voelt dat soms alsof ik iets mis.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik pak snel dingen op, ook als niemand daar expliciet om vraagt.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik vergelijk mezelf regelmatig met anderen om te checken of ik het goed doe.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik ben pas tevreden als ik het gevoel heb dat ik alles heb gegeven.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik denk vaak: ik moet laten zien dat ik dit aankan.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik neem meer hooi op mijn vork dan eigenlijk nodig is.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Het voelt alsof het nooit genoeg is, wat ik ook doe.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik merk dat ik mezelf blijf uitdagen, ook als ik al moe ben.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik vind het lastig om stil te staan bij wat al gelukt is.", hasQuestion: false, bottomText: "pass" },
	{ text: "Soms voelt stoppen alsof ik opgeef.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik zie die ene fout vaak harder dan de tien dingen die wél goed gingen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik zie sneller wat beter kan dan wat al goed was.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik ben streng voor mezelf, ook als niemand anders dat is.", hasQuestion: false, bottomText: "pass" },
	{ text: "Complimenten neem ik aan, maar ik denk vaak: ja, maar…", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik stel dingen uit omdat het in mijn hoofd nog niet klopt.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik baal langer van een fout dan dat ik geniet van succes.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik leg de lat voor mezelf hoger dan voor anderen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik vind het moeilijk om iets los te laten als het nog niet \"af\" voelt.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik denk vaak terug aan hoe iets beter had gekund.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik voel me pas rustig als alles klopt.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik focus snel op details die anders hadden gemoeten.", hasQuestion: false, bottomText: "pass" },
	{ text: "Soms voelt het alsof het nooit helemaal goed genoeg is.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Het voelt vaak alsof ik al bezig ben met het volgende, terwijl het huidige nog loopt.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik word onrustig als dingen langer duren dan verwacht.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Pauze nemen voelt voor mij niet vanzelfsprekend.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik ga snel in de actiestand, soms zonder echt na te denken.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik heb moeite met wachten of vertragen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik doe vaak meerdere dingen tegelijk, ook als dat niet hoeft.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik voel stress als iets blijft liggen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik merk dat ik snel vooruit wil, ook als dat ten koste gaat van rust.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Ik vind het lastig om even stil te staan bij wat er is.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik heb het gevoel dat ik altijd 'aan' sta.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Rust voelt soms alsof ik achterloop.", hasQuestion: false, bottomText: "pass" },
	{ text: "Ik wil dingen graag afronden, het liefst meteen.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Je ziet dat emoties worden ingeslikt, dus je leert dat zelf ook te doen.", hasQuestion: false, bottomText: "pass" },
	{ text: "Door altijd door te werken laat je zien dat rust nemen niet hoort.", hasQuestion: false, bottomText: "privacy" },
	{ text: "Als fouten maken wordt vermeden, leer je dat falen gevaarlijk is.", hasQuestion: false, bottomText: "pass" },
	{ text: "Je ziet dat hulp vragen niet gebeurt, dus je doet het zelf ook niet.", hasQuestion: false, bottomText: "privacy" }
];

const COMPLIMENT_CARDS = [
	{ mainText: "Geef de persoon links van jou een complimentje", subText: "Over iets wat je waardeert in hoe diegene samenwerkt of communiceert." },
	{ mainText: "Kies iemand aan tafel en geef diegene een oprecht compliment", subText: "Het mag klein zijn, zolang het echt is." },
	{ mainText: "Geef de persoon tegenover je een compliment", subText: "Over iets wat je vandaag bij diegene hebt gezien of gemerkt." },
	{ mainText: "Geef een compliment over iemands houding", subText: "Bijvoorbeeld hoe iemand luistert, meedoet of aanwezig is." },
	{ mainText: "Geef iemand een compliment over iets wat vaak niet opvalt", subText: "Iets wat diegene doet zonder dat het altijd benoemd wordt." },
	{ mainText: "Geef iemand een compliment over iets waar diegene zelf misschien te bescheiden over is", subText: "Iets waarvan jij denkt: dit mag vaker gezegd worden." },
	{ mainText: "Geef een compliment over iemands manier van omgaan met spanning of druk", subText: "Denk aan rust, humor of doorzettingsvermogen." }
];

const BONDING_CARDS = [
	"Wijs iemand aan van wie je vandaag iets hebt geleerd. Wat was dat?",
	"Iedereen zegt één woord Dat beschrijft hoe je je op dit moment voelt.",
	"Kies iemand aan tafel En benoem iets wat je waardeert aan hoe diegene meedoet in het spel.",
	"Iedereen deelt kort Eén moment van vandaag (of deze week) dat energie gaf.",
	"Wijs iemand aan. Bijvoorbeeld hoe iemand luistert, meedoet of aanwezig is.",
	"Iedereen beantwoordt om de beurt Wat helpt jou om je veilig te voelen in een groep?",
	"Kies iemand aan tafel En vertel wat je denkt dat diegene goed kan in samenwerken of leidinggeven.",
	"Check-in moment Iedereen mag zeggen: \"Ik zit er nu zo in…\" (je mag ook passen)."
];

// Create output directories
const statementsDir = path.join(__dirname, '../public/images/cards/statements');
const complimentsDir = path.join(__dirname, '../public/images/cards/compliments');
const bondingDir = path.join(__dirname, '../public/images/cards/bonding');

[statementsDir, complimentsDir, bondingDir].forEach(dir => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
});

// Generate statement cards
STATEMENTS.forEach((statement, index) => {
	const svg = generateStatementCard(statement, index);
	const filename = `statement-${String(index + 1).padStart(3, '0')}.svg`;
	fs.writeFileSync(path.join(statementsDir, filename), svg);
	console.log(`Generated: ${filename}`);
});

// Generate compliment cards
COMPLIMENT_CARDS.forEach((compliment, index) => {
	const svg = generateComplimentCard(compliment, index);
	const filename = `compliment-${String(index + 1).padStart(3, '0')}.svg`;
	fs.writeFileSync(path.join(complimentsDir, filename), svg);
	console.log(`Generated: ${filename}`);
});

// Generate bonding cards
BONDING_CARDS.forEach((text, index) => {
	const svg = generateBondingCard(text, index);
	const filename = `bonding-${String(index + 1).padStart(3, '0')}.svg`;
	fs.writeFileSync(path.join(bondingDir, filename), svg);
	console.log(`Generated: ${filename}`);
});

console.log('\nAll cards generated successfully!');

