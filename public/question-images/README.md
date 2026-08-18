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
