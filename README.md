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
- invite link for friends through the built-in Render WebSocket room server
- host-only controls for revealing answers, ending questions, and assigning points
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

## Multiplayer

Start a host game, click `Link erstellen`, and share the generated URL. Friends join in player mode and can buzz for their team while the host keeps control of questions, answers, and scoring.

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
