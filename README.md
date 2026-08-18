# League of Legends Jeopardy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/sinyrk-bit/lol-jeopardy-buzzer)

Eine vollständige React- und TypeScript-Jeopardy-App, inspiriert von einem dunklen Fantasy-Esports-Showboard.

## Funktionen

- 6 Kategorien mit 30 League-of-Legends-Fragen
- Team-Setup für 2 bis 4 Teams
- animierte Hover-Effekte auf dem Jeopardy-Board
- Frage- und Antwortablauf
- Punktevergabe durch den Host
- konfigurierbare Strafe für falsche Antworten mit halbem Punktwert
- die letzten 5 offenen Fragen werden Bonusfragen mit doppelten Punkten
- Team-Buzzer-System mit Reihenfolge, Sperre und Reset
- Live-Spielerlobby, in der der Host Spieler Teams zuweist
- Einladungslink für Freunde über den eingebauten WebSocket-Raum-Server
- Host sieht die Antwort privat, bevor sie für Spieler aufgedeckt wird
- Host-Steuerung für Antworten, Fragenabschluss, Punktevergabe und Spielerwechsel
- feste Team-Anzeige in Setup-Reihenfolge, damit Team 1 bis 4 nicht nach Punkten springen
- Host wählt, welches Team die nächste Frage aussuchen darf
- Cyberpunk-Oberfläche mit generiertem League-Schriftzug und offiziellem Riot-Data-Dragon-Splash-Art
- Spielstand bleibt über `localStorage` gespeichert
- Game-Over-Ansicht mit Rangliste

## Lokale Entwicklung

```bash
npm install
npm run dev
```

## Build Erstellen

```bash
npm run build
```

Der Produktions-Build wird in `dist/` erstellt.

## Render

Dieses Repo enthält `render.yaml` für einen Render Web Service, der die App und den Live-Raum-Server ausliefert.

- Build-Befehl: `npm install && npm run build`
- Start-Befehl: `npm start`

Render Static Sites können das Board anzeigen, aber nicht den WebSocket-Raum-Server dieser App ausführen. Für Einladungslinks, denen Freunde von zu Hause beitreten können, brauchst du einen Render Web Service oder einen temporären Tunnel zum lokalen `npm start`-Server.

## Multiplayer

Starte als Host ein Spiel, klicke auf `Link erstellen` und teile die erzeugte URL. Freunde treten in der Spieleransicht bei. Öffne als Host die `Lobby`, um verbundene Spieler Teams zuzuweisen; danach buzzert jeder Spieler nur für sein zugewiesenes Team.

Der Host sieht die Antwort sofort im privaten Host-Panel. Spieler sehen sie erst, wenn der Host auf `Antwort für Spieler aufdecken` klickt.

Die Team-Leiste bleibt immer in der Setup-Reihenfolge. Über `Auswahlrecht` legt der Host fest, welches Team die nächste Frage aussuchen darf; die Frage selbst wird weiterhin nur vom Host angeklickt und freigegeben.

## Bilder In Fragen

Lege Bilder in `public/question-images/` ab und referenziere sie danach in `src/data/questions.ts`.

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

## Quelle Der Visual Assets

Der Cyberpunk-Hintergrund nutzt das generierte 16:9-SVG unter `src/assets/league-cyberpunk-title.svg` als Haupt-Hologramm und das offizielle Riot-Data-Dragon-Champion-Splash-Art für `PROJECT: Zed` als atmosphärische Ebene:

`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_3.jpg`
