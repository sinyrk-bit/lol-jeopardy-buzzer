# League of Legends Jeopardy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/sinyrk-bit/lol-jeopardy-buzzer)

Eine vollständige React- und TypeScript-Jeopardy-App, inspiriert von einem dunklen Cyberpunk-Showboard.

## Funktionen

- 6 Kategorien mit 30 Fragen, inklusive Schätzrunde und reiner Bildkategorie
- Team-Setup für 2 bis 4 Teams
- animierte Hover-Effekte auf dem Jeopardy-Board
- Frage- und Antwortablauf
- Punktevergabe durch den Host
- konfigurierbare Strafe für falsche Antworten mit halbem Punktwert
- die letzten 5 offenen Fragen werden Bonusfragen mit doppelten Punkten
- Team-Buzzer-System mit Reihenfolge, Sperre und Reset
- Live-Spielerlobby, in der der Host Spieler Teams zuweist
- Einladungslink für Freunde über den eingebauten WebSocket-Raum-Server
- Allgemeinchat für alle und farbiger Teamchat nur für Teammitglieder plus Host
- Host sieht die Antwort privat, bevor sie für Spieler aufgedeckt wird
- Host-Steuerung für Antworten, Fragenabschluss, Punktevergabe und Spielerwechsel
- feste Team-Anzeige in Setup-Reihenfolge, damit Team 1 bis 4 nicht nach Punkten springen
- Host wählt, welches Team die nächste Frage aussuchen darf
- nach jeder abgeschlossenen Frage wandert das Auswahlrecht automatisch zum nächsten Team
- nur das aktive Team kann die nächste Punkte-Kachel auswählen; der Host bestätigt die markierte Auswahl
- `Kluft-Kalkulation` ist eine Schätzrunde: alle Fragen geben 300 Punkte, Gewinner ist das Team mit der nächsten Schätzung
- Cyberpunk-Oberfläche mit generiertem League-Schriftzug und eigenem 16:9-Hintergrundbild
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

Die Team-Leiste bleibt immer in der Setup-Reihenfolge. Über `Auswahlrecht` legt der Host fest, welches Team die nächste Frage aussuchen darf. Nur Spieler aus diesem Team können auf dem Board eine Punkte-Kachel markieren; der Host sieht diese Markierung und klickt sie an, um die Frage mit oder ohne Buzzer freizugeben. Nach dem Abschluss der Frage springt das Auswahlrecht automatisch zum nächsten Team in der festen Reihenfolge.

Der Chat ist im Spiel und über den Overlays sichtbar. `Alle` ist der Allgemeinchat für alle verbundenen Spieler. `Team` ist farblich markiert und wird nur dem eigenen Team sowie dem Host angezeigt; der Host kann beim Schreiben in den Teamchat auswählen, welches Team die Nachricht bekommt.

## Kluft-Kalkulation

Die Kategorie `Kluft-Kalkulation` ersetzt die alte Item-Kategorie. Alle fünf Fragen sind Schätzfragen und geben immer 300 Punkte. Jedes Team trägt in der Spieleransicht eine Zahl ein und bestätigt sie final. Der Host sieht alle abgegebenen Schätzungen im Frage-Overlay; nach dem Aufdecken klickt er bei dem Team auf `Am nächsten`, das am besten geschätzt hat.

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

Der Cyberpunk-Hintergrund nutzt das generierte 16:9-SVG unter `src/assets/league-cyberpunk-title.svg` als Hologramm-Ebene und das Bild `src/assets/cyberpunk-rift-background.png` als Vollbild-Hintergrund.
