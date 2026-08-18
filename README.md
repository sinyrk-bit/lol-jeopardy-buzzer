# League of Legends Jeopardy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/sinyrk-bit/lol-jeopardy-buzzer)

A complete React + TypeScript Jeopardy game inspired by a dark fantasy esports show board.

## Features

- 6 categories with 30 League of Legends questions
- team setup for 2 to 4 teams
- animated Jeopardy board hover states
- question and answer flow
- host-controlled scoring
- configurable penalty for wrong answers, now scored as half the question value
- final 5 remaining questions become bonus questions worth double points
- team buzzer system with queue, lock, and reset
- live player lobby where the host assigns players to teams
- invite link for friends through the built-in Render WebSocket room server
- host-only answer preview before revealing answers to players
- host-only controls for revealing answers, ending questions, assigning points, and moving players
- cyberpunk interface using the provided League logo background plus an official Riot Data Dragon splash asset
- score persistence through `localStorage`
- game over screen with ranking

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is written to `dist/`.

## Render

This repo includes `render.yaml` for a Render Web Service that serves the app and the live room server.

- Build command: `npm install && npm run build`
- Start command: `npm start`

Render Static Sites can show the board, but they cannot run this app's WebSocket room server. For invite links that friends can join from home, use a Render Web Service or a temporary tunnel to the local `npm start` server.

## Multiplayer

Start a host game, click `Link erstellen`, and share the generated URL. Friends join in player mode. Open `Lobby` as host to move connected players into teams; after that each player only buzzes for their assigned team.

The host sees the answer immediately in the private host panel. Players only see it after the host clicks `Antwort fuer Spieler aufdecken`.

## Images In Questions

Add images to `public/question-images/`, then reference them in `src/data/questions.ts`.

```ts
{
  id: 'champions-100',
  category: 'Champions',
  value: 100,
  question: 'Welcher Champion ist das?',
  answer: 'Lee Sin',
  questionImage: 'question-images/lee-sin-question.png',
  answerImage: 'question-images/lee-sin-answer.png',
}
```

## Visual Asset Source

The cyberpunk background uses the generated 16:9 SVG title asset at `src/assets/league-cyberpunk-title.svg` as the main hologram layer and the official Riot Data Dragon champion splash asset for `PROJECT: Zed` as an atmospheric layer:

`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_3.jpg`
