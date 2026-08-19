# Fragebilder

Lege deine eigenen Frage- und Antwortbilder in diesem Ordner ab.

Verwende sie in `src/data/questions.ts` so:

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

Unterstützte Browser-Formate sind `.png`, `.jpg`, `.jpeg`, `.webp` und `.svg`. Für die Kategorien `Drip or Int`, `Ability Abuse`, `Fußfetisch` und `Tiltmoji` sind die Pfade aber bereits fest auf `.png` eingestellt.

## Kategorie Drip or Int

Die Kategorie `Drip or Int` nutzt aktuell diese PNG-Dateien als Frage- und Antwortbilder. Die Textantwort bleibt zusätzlich als Host-Hilfe sichtbar:

- `champ-select-100-frage.png` und `champ-select-100-antwort.png` = Lee Sin
- `champ-select-200-frage.png` und `champ-select-200-antwort.png` = Annie
- `champ-select-300-frage.png` und `champ-select-300-antwort.png` = Jayce
- `champ-select-400-frage.png` und `champ-select-400-antwort.png` = Ryze
- `champ-select-500-frage.png` und `champ-select-500-antwort.png` = Senna

Wenn du deine eigenen Skin-Bilder nutzen willst, ersetze diese PNG-Dateien direkt mit exakt gleichem Dateinamen.

## Kategorie Ability Abuse

Die Kategorie `Ability Abuse` nutzt aktuell diese PNG-Dateien als Frage- und Antwortbilder. Die Textantwort bleibt zusätzlich als Host-Hilfe sichtbar:

- `ability-abuse-100-frage.png` und `ability-abuse-100-antwort.png` = Flash und Heal
- `ability-abuse-200-frage.png` und `ability-abuse-200-antwort.png` = Wind Wall
- `ability-abuse-300-frage.png` und `ability-abuse-300-antwort.png` = Root oder Snare
- `ability-abuse-400-frage.png` und `ability-abuse-400-antwort.png` = Diana
- `ability-abuse-500-frage.png` und `ability-abuse-500-antwort.png` = Autoattack Reset oder Empowered Auto

Wenn du deine eigenen Ability-Bilder nutzen willst, ersetze diese PNG-Dateien direkt mit exakt gleichem Dateinamen.

## Kategorie Fussfetisch

Die Kategorie `Fußfetisch` ist in `src/data/questions.ts` fertig eingetragen und nutzt aktuell diese PNG-Dateien:

- `fussfetisch-100-frage.png`
- `fussfetisch-100-antwort.png`
- `fussfetisch-200-frage.png`
- `fussfetisch-200-antwort.png`
- `fussfetisch-300-frage.png`
- `fussfetisch-300-antwort.png`
- `fussfetisch-400-frage.png`
- `fussfetisch-400-antwort.png`
- `fussfetisch-500-frage.png`
- `fussfetisch-500-antwort.png`

Wenn du eigene Bilder nutzen willst, lege sie in diesen Ordner und ersetze die PNG-Dateien direkt mit exakt gleichem Dateinamen.

## Kategorie Tiltmoji

Die Kategorie `Tiltmoji` nutzt aktuell diese PNG-Dateien als Fragebilder. Die Antwort bleibt jeweils nur der Championname:

- `tiltmoji-100-frage.png` = Ekko
- `tiltmoji-200-frage.png` = Fiora
- `tiltmoji-300-frage.png` = Karma
- `tiltmoji-400-frage.png` = Cassiopeia
- `tiltmoji-500-frage.png` = Ezreal

Wenn du deine eigenen Emoji-Bilder nutzen willst, ersetze diese PNG-Dateien direkt mit exakt gleichem Dateinamen.

Wichtig: Verwende nur Bilder, für die du die Rechte hast und die legal sowie passend für deine Mitspieler sind.
