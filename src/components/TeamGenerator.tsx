import { Shuffle, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Player } from '../types'
import { calculateScore, generateBalancedTeams } from '../utils/playerStats'
import { PlayerCard } from './PlayerCard'
import { ShareButton } from './ShareButton'

interface TeamGeneratorProps {
  players: Player[]
}

const PlayerSelector = ({ player, isSelected, onToggle }: { player: Player, isSelected: boolean, onToggle: (player: Player) => void }) => (
  <div
    onClick={() => onToggle(player)}
    className={`flex items-center p-2 border rounded-md cursor-pointer ${isSelected ? 'bg-emerald-50 border-emerald-300' : 'hover:bg-gray-100'
      }`}
  >
    <label
      htmlFor={`player-${player.id}`}
      className='flex-1 cursor-pointer text-gray-700 truncate'
    >
      {player.name}
    </label>
    <input
      id={`player-${player.id}`}
      type='checkbox'
      checked={isSelected}
      onChange={() => onToggle(player)}
      className='form-checkbox text-emerald-600'
      aria-label={`Seleccionar a ${player.name}`}
    />
  </div>
)

const TeamDisplay = ({ teamName, players }: { teamName: string, players: Player[] }) => {
  const teamScore = useMemo(
    () =>
      players
        .reduce((sum, player) => sum + calculateScore(player), 0)
        .toFixed(2),
    [players]
  )

  return (
    <div>
      <h3 className='text-2xl under font-semibold my-4'>
        {teamName} 🌟<span className='italic'>{teamScore}</span>
      </h3>
      <div className='space-y-4'>
        {players.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  )
}

export function TeamGenerator({ players }: TeamGeneratorProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<{
    teamA: Player[]
    teamB: Player[]
  } | null>(null)

  const handleTogglePlayer = (player: Player) => {
    setSelectedPlayers(prev =>
      prev.some(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    )
  }

  const handleGenerateTeams = () => {
    if (selectedPlayers.length < 2) {
      alert('Selecciona al menos dos jugadores para generar equipos.')
      return
    }
    setTeams(generateBalancedTeams(selectedPlayers))
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <div className='flex justify-between mb-6 flex-col sm:flex-row gap-4'>
        <div className='flex items-center gap-2'>
          <Users className='w-6 h-6 text-emerald-600' />
          <h2 className='text-xl font-semibold'>Generador de Equipos</h2>
        </div>
        <div className='flex flex-col-reverse gap-2 sm:flex-row'>
          {teams && <ShareButton teams={teams} />}
          <button
            onClick={handleGenerateTeams}
            className='flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors'
          >
            <Shuffle className='w-4 h-4' />
            Generar Equipos
          </button>
        </div>
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Selecciona los jugadores</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          {players.map(player => (
            <PlayerSelector
              key={player.id}
              player={player}
              isSelected={selectedPlayers.some(p => p.id === player.id)}
              onToggle={handleTogglePlayer}
            />
          ))}
        </div>
      </div>

      {teams && (
        <div className='grid md:grid-cols-2 gap-6'>
          <TeamDisplay teamName='Equipo A' players={teams.teamA} />
          <TeamDisplay teamName='Equipo B' players={teams.teamB} />
        </div>
      )}
    </div>
  )
}
