# Omnient Bord Game - Project Overzicht

## Project Beschrijving
Een bordspel applicatie gebouwd met Next.js, React en TypeScript. Spelers kunnen een spel starten, hun namen en iconen kiezen, en hun pionnen bewegen over een bord met 39 posities.

## Technologie Stack
- **Framework**: Next.js 16.1.1
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## Project Structuur

### Belangrijke Bestanden

#### `/app/page.tsx` - Start Scherm
- Startscherm waar spelers het spel kunnen configureren
- Selectie van aantal spelers (1-4) met afbeeldingen (1-player.svg, 2-players.svg, etc.)
- Voor elke speler:
  - Naam invoerveld
  - Icoon selectie (Boek, Pen, Stoel, Telefoon)
- Validatie: alle spelers moeten een naam en icoon hebben
- Navigatie naar `/board` na "Spel Starten"
- Alle tekst is in het Nederlands

#### `/app/board/page.tsx` - Spelbord
- Canvas gebaseerd bord (1000x1000px)
- 39 posities getekend als cirkels met borders
- Card decks voor elke speler:
  - Speler 1: Top (horizontaal)
  - Speler 2: Bottom (horizontaal)
  - Speler 3: Rechts (90° geroteerd)
  - Speler 4: Links (-90° geroteerd)
- Card labels: "Be perfect", "Hurry up", "Be strong", "Pleaser", "Try hard"
- Spelernamen worden weergegeven bij hun respectievelijke card decks
- Pionnen worden getekend op het canvas:
  - Gekleurde cirkels per speler (blauw, rood, groen, geel)
  - Speler iconen in het midden van de pionnen
  - Witte border rond de pionnen

#### `/data/circle-positions.ts` - Bord Posities
- Array van 39 posities (genummerd 1-39)
- Elke positie heeft:
  - `x`, `y`: coördinaten op het canvas
  - `radius`: 25px
  - `number`: positie nummer (1-39)
  - `text`: object met `x`, `y`, `content` voor tekst weergave
  - `image`: optioneel pad naar icoon afbeelding
- Positie 1 = START
- Positie 39 = EIND

#### `/contexts/GameContext.tsx` - Game State Management
- React Context voor globale game state
- Player type:
  - `id`: nummer (1-4)
  - `name`: string
  - `icon`: pad naar icoon afbeelding
  - `position`: huidige positie op bord (1-39)
- Functies:
  - `setPlayers`: set alle spelers
  - `updatePlayerPosition`: update positie van een speler
  - `addPlayer`: voeg speler toe
  - `removePlayer`: verwijder speler
  - `currentPlayerIndex`: huidige speler index
  - `setCurrentPlayerIndex`: set huidige speler

#### `/components/GameProviderWrapper.tsx`
- Client component wrapper voor GameProvider
- Nodig omdat layout.tsx een server component is

#### `/app/layout.tsx`
- Root layout met GameProviderWrapper
- Zorgt ervoor dat GameContext beschikbaar is in de hele app

## Speler Kleuren
- **Speler 1**: Blauw (#2563eb)
- **Speler 2**: Rood (#dc2626)
- **Speler 3**: Groen (#059669)
- **Speler 4**: Geel (#eab308)

## Beschikbare Iconen
- Boek (`/images/boek.svg`)
- Pen (`/images/pen.svg`)
- Stoel (`/images/stoel.svg`)
- Telefoon (`/images/telefoon.svg`)

## Afbeeldingen Locatie
Alle afbeeldingen staan in `/public/images/`:
- Speler aantal: `1-player.svg`, `2-players.svg`, `3-players.svg`, `4-players.svg`
- Speler iconen: `boek.svg`, `pen.svg`, `stoel.svg`, `telefoon.svg`
- Bord iconen: `-1.svg`, `+2.svg`, `hart.svg`, `hand.svg`, `verwissel.svg`, etc.

## Huidige Status
✅ Startscherm met speler configuratie
✅ Bord rendering met 39 posities
✅ Card decks voor 4 spelers
✅ Spelernamen weergave
✅ Pionnen met kleuren en iconen
✅ GameContext voor state management

## Volgende Stappen (Mogelijk)
- Dice functionaliteit toevoegen
- Speler beweging implementeren
- Card deck interactie
- Game regels implementeren
- Win conditie detectie

## Belangrijke Notities
- Alle UI tekst is in het Nederlands
- Canvas gebruikt 2D context voor rendering
- Pionnen worden getekend op basis van `player.position` die correspondeert met `POSITIONS[].number`
- Spelers starten altijd op positie 1 (START)

