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

Unterstützte Browser-Formate sind `.png`, `.jpg`, `.jpeg`, `.webp` und `.svg`.

## Kategorie Fussfetisch

Die Kategorie `Fußfetisch` ist in `src/data/questions.ts` fertig eingetragen und nutzt aktuell diese Platzhalter-Dateien:

- `fussfetisch-100-frage.svg`
- `fussfetisch-100-antwort.svg`
- `fussfetisch-200-frage.svg`
- `fussfetisch-200-antwort.svg`
- `fussfetisch-300-frage.svg`
- `fussfetisch-300-antwort.svg`
- `fussfetisch-400-frage.svg`
- `fussfetisch-400-antwort.svg`
- `fussfetisch-500-frage.svg`
- `fussfetisch-500-antwort.svg`

Wenn du eigene Bilder nutzen willst, lege sie in diesen Ordner und ersetze entweder die SVG-Dateien direkt oder passe die Pfade in `src/data/questions.ts` an, zum Beispiel auf `.png`, `.jpg` oder `.webp`.

Wichtig: Verwende nur Bilder, für die du die Rechte hast und die legal sowie passend für deine Mitspieler sind.
