import { useState } from 'react'
import type { Team } from '../types/game'

const palette = ['#c89b3c', '#0ac8b9', '#e84057', '#8f6df8', '#f0e6d2']
const defaultNames = ['Baron Buff', 'Nexus Destroyers', 'Minion Diff', 'Pentakill']

type SetupScreenProps = {
  onStart: (teams: Team[], wrongAnswerCostsPoints: boolean) => void
  onBack: () => void
}

export function SetupScreen({ onStart, onBack }: SetupScreenProps) {
  const [teamCount, setTeamCount] = useState(3)
  const [wrongAnswerCostsPoints, setWrongAnswerCostsPoints] = useState(true)
  const [names, setNames] = useState(defaultNames)
  const [colors, setColors] = useState(palette)

  const visibleTeams = Array.from({ length: teamCount }, (_, index) => index)

  const updateName = (index: number, value: string) => {
    setNames((current) => current.map((name, nameIndex) => (nameIndex === index ? value : name)))
  }

  const updateColor = (index: number, value: string) => {
    setColors((current) => current.map((color, colorIndex) => (colorIndex === index ? value : color)))
  }

  const startGame = () => {
    const teams = visibleTeams.map((index) => ({
      id: `team-${index + 1}`,
      name: names[index].trim() || `Team ${index + 1}`,
      color: colors[index],
      score: 0,
    }))

    onStart(teams, wrongAnswerCostsPoints)
  }

  return (
    <main className="setup-screen">
      <div className="screen-header">
        <p className="eyebrow">Spiel konfigurieren</p>
        <h1>Teams, Farben und Risiko</h1>
      </div>

      <section className="setup-panel">
        <div className="setup-row">
          <span>Teams</span>
          <div className="segmented-control" aria-label="Teamanzahl">
            {[2, 3, 4].map((count) => (
              <button
                className={teamCount === count ? 'is-active' : ''}
                key={count}
                onClick={() => setTeamCount(count)}
                type="button"
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="team-config-grid">
          {visibleTeams.map((index) => (
            <label className="team-config" key={index}>
              <span>Team {index + 1}</span>
              <input value={names[index]} onChange={(event) => updateName(index, event.target.value)} />
              <input
                aria-label={`Farbe Team ${index + 1}`}
                type="color"
                value={colors[index]}
                onChange={(event) => updateColor(index, event.target.value)}
              />
            </label>
          ))}
        </div>

        <label className="toggle-row">
          <input
            checked={wrongAnswerCostsPoints}
            type="checkbox"
            onChange={(event) => setWrongAnswerCostsPoints(event.target.checked)}
          />
          <span>Falsche Antworten ziehen den halben Punktwert ab</span>
        </label>
      </section>

      <div className="screen-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          Zurück
        </button>
        <button className="primary-button" type="button" onClick={startGame}>
          Spiel starten
        </button>
      </div>
    </main>
  )
}
