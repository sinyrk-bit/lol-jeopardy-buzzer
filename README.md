# League of Legends Jeopardy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/sinyrk-bit/lol-jeopardy-buzzer)

A complete React + TypeScript Jeopardy game inspired by a dark fantasy esports show board.

## Features

- 6 categories with 30 League of Legends questions
- team setup for 2 to 4 teams
- animated Jeopardy board hover states
- question and answer flow
- host-controlled scoring
- configurable penalty for wrong answers
- team buzzer system with queue, lock, and reset
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

This repo includes `render.yaml` for a Render Static Site.

- Build command: `npm install && npm run build`
- Publish directory: `dist`
