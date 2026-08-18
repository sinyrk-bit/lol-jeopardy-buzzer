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

Unterstützte Browser-Formate sind `.png`, `.jpg`, `.jpeg`, `.webp` und `.svg`. Für die Kategorie `Fußfetisch` sind die Pfade aber bereits fest auf `.png` eingestellt.

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

Wichtig: Verwende nur Bilder, für die du die Rechte hast und die legal sowie passend für deine Mitspieler sind.
