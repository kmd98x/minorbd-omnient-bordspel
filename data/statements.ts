export interface StatementCard {
	text: string;
	hasQuestion: boolean; // "Herken je de uitspraak?" for first 5
	bottomText: "privacy" | "pass"; // "Alles wat je deelt blijft in deze ruimte." or "Je mag altijd passen/overslaan."
}

export const STATEMENTS: Array<StatementCard> = [
	// First 5 with question
	{
		text: "Jij bent altijd zo sterk, jij redt je wel.",
		hasQuestion: true,
		bottomText: "privacy"
	},
	{
		text: "Jij bent de verantwoordelijke van het gezin.",
		hasQuestion: true,
		bottomText: "pass"
	},
	{
		text: "Jij bent net zo perfectionistisch als ik.",
		hasQuestion: true,
		bottomText: "privacy"
	},
	{
		text: "Jij bent degene die altijd alles goed wil doen.",
		hasQuestion: true,
		bottomText: "pass"
	},
	{
		text: "Jij bent gevoelig, dus je moet extra opletten.",
		hasQuestion: true,
		bottomText: "privacy"
	},
	// Rest without question
	{
		text: "Als het druk wordt, trek ik mezelf meestal even terug in plaats van dat ik het deel.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik merk dat ik sneller doorpak dan dat ik toegeef dat iets me raakt.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik vertel liever wat ik heb opgelost dan waar ik mee zat.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Als iemand vraagt hoe het gaat, zeg ik vaak \"goed\", ook als dat maar half klopt.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik denk regelmatig: anderen hoeven dit niet van mij te weten.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik voel me prettiger als ik het gevoel heb dat ik alles onder controle heb.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik stel me sterk op, ook op momenten dat ik me eigenlijk onzeker voel.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik wacht lang voordat ik toegeef dat iets me te veel wordt.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik vind het lastig om te laten zien dat ik ergens mee worstel.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik praat makkelijker over de feiten van werk dan over wat het met mij doet.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik wil niet degene zijn die het 'zwaar' maakt.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Mijn eerste reactie is vaak: ik red dit wel.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Soms denk ik: dit hoort er gewoon bij, dus ik moet me erdoorheen slaan.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik zeg soms ja, terwijl ik eigenlijk nee voel.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik wil liever niemand teleurstellen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik pas me snel aan om de sfeer goed te houden.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik vind het lastig om grenzen aan te geven zonder daar een schuldgevoel van te krijgen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik weeg vaak eerst af hoe iets bij de ander overkomt, voordat ik iets zeg.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik slik mijn mening soms in om gedoe te voorkomen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik stem mijn gedrag af op de groep waar ik in zit.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik kies regelmatig voor de rust, ook als dat betekent dat ik mezelf opzij zet.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik pas mijn mening aan afhankelijk van wie er tegenover me zit.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik merk dat ik sneller meega dan dat ik echt stilsta bij wat ik wil.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik vind het fijn als iedereen zich prettig voelt, zelfs als dat mij iets kost.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Als ik een doel behaald heb, voelt dat als vanzelfsprekend en niet als een mijlpaal.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik heb vaak het gevoel dat ik nét iets extra's moet laten zien.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Als het rustig is, voelt dat soms alsof ik iets mis.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik pak snel dingen op, ook als niemand daar expliciet om vraagt.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik vergelijk mezelf regelmatig met anderen om te checken of ik het goed doe.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik ben pas tevreden als ik het gevoel heb dat ik alles heb gegeven.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik denk vaak: ik moet laten zien dat ik dit aankan.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik neem meer hooi op mijn vork dan eigenlijk nodig is.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Het voelt alsof het nooit genoeg is, wat ik ook doe.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik merk dat ik mezelf blijf uitdagen, ook als ik al moe ben.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik vind het lastig om stil te staan bij wat al gelukt is.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Soms voelt stoppen alsof ik opgeef.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik zie die ene fout vaak harder dan de tien dingen die wél goed gingen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik zie sneller wat beter kan dan wat al goed was.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik ben streng voor mezelf, ook als niemand anders dat is.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Complimenten neem ik aan, maar ik denk vaak: ja, maar…",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik stel dingen uit omdat het in mijn hoofd nog niet klopt.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik baal langer van een fout dan dat ik geniet van succes.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik leg de lat voor mezelf hoger dan voor anderen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik vind het moeilijk om iets los te laten als het nog niet \"af\" voelt.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik denk vaak terug aan hoe iets beter had gekund.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik voel me pas rustig als alles klopt.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik focus snel op details die anders hadden gemoeten.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Soms voelt het alsof het nooit helemaal goed genoeg is.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Het voelt vaak alsof ik al bezig ben met het volgende, terwijl het huidige nog loopt.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik word onrustig als dingen langer duren dan verwacht.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Pauze nemen voelt voor mij niet vanzelfsprekend.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik ga snel in de actiestand, soms zonder echt na te denken.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik heb moeite met wachten of vertragen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik doe vaak meerdere dingen tegelijk, ook als dat niet hoeft.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik voel stress als iets blijft liggen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik merk dat ik snel vooruit wil, ook als dat ten koste gaat van rust.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Ik vind het lastig om even stil te staan bij wat er is.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik heb het gevoel dat ik altijd 'aan' sta.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Rust voelt soms alsof ik achterloop.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Ik wil dingen graag afronden, het liefst meteen.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Je ziet dat emoties worden ingeslikt, dus je leert dat zelf ook te doen.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Door altijd door te werken laat je zien dat rust nemen niet hoort.",
		hasQuestion: false,
		bottomText: "privacy"
	},
	{
		text: "Als fouten maken wordt vermeden, leer je dat falen gevaarlijk is.",
		hasQuestion: false,
		bottomText: "pass"
	},
	{
		text: "Je ziet dat hulp vragen niet gebeurt, dus je doet het zelf ook niet.",
		hasQuestion: false,
		bottomText: "privacy"
	}
];
