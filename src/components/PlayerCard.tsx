import { User, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'
import { Player } from '../types'
import { calculateWinRate, calculateScore } from '../utils/playerStats'

interface PlayerCardProps {
  player: Player
  onDelete?: (id: string) => void
  onEdit?: (id: string, updatedData: Partial<Omit<Player, 'id'>>) => void
}

export function PlayerCard ({ player, onDelete, onEdit }: PlayerCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<Omit<Player, 'id'>>>({
    name: player.name,
    matches: player.matches,
    goals: player.goals,
    assists: player.assists
  })

  const winRate = calculateWinRate(player)
  const score = calculateScore(player)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (onEdit) {
      onEdit(player.id, editedData)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedData({
      name: player.name,
      matches: player.matches,
      goals: player.goals,
      assists: player.assists
    })
    setIsEditing(false)
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-4'>
          <User className='w-10 h-10 text-emerald-600' />
          <h3 className='text-xl font-bold text-gray-800'>{player.name}</h3>
        </div>
        <div className='flex items-center gap-3'>
          {onEdit && (
            <button
              onClick={handleEdit}
              className='rounded-full text-emerald-600 hover:text-emerald-200 transition-colors'
              title='Editar jugador'
              aria-label='Editar jugador'
            >
              <Edit className='w-5 h-5' />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(player.id)}
              className='rounded-full text-red-600 hover:text-red-200 transition-colors'
              title='Eliminar jugador'
              aria-label='Eliminar jugador'
            >
              <Trash2 className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div>
          <p className='text-gray-500'>Partidos V/E/D</p>
          <p className='text-lg font-medium text-gray-800'>
            {player.wins}/{player.matches - player.wins - player.losses}/
            {player.losses}
          </p>
        </div>
        <div>
          <p className='text-gray-500'>Tasa de victorias</p>
          <p className='text-lg font-medium text-gray-800'>
            {winRate.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className='text-gray-500'>Goles</p>
          <p className='text-lg font-medium text-gray-800'>{player.goals}</p>
        </div>
        <div>
          <p className='text-gray-500'>Asistencias</p>
          <p className='text-lg font-medium text-gray-800'>{player.assists}</p>
        </div>
      </div>

      {/* Player Score */}
      <div className='mt-5 pt-4 border-t border-gray-200'>
        <p className='text-gray-500 text-sm'>Puntuación del jugador</p>
        <p className='text-2xl font-bold text-emerald-600'>
          {score.toFixed(1)}
        </p>
      </div>

      {/* Modal for editing */}
      {isEditing && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
            <h2 className='text-xl font-semibold mb-4'>Edit Player</h2>
            <form className='space-y-3'>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Nombre
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded px-3 py-2'
                  value={editedData.name}
                  onChange={e =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Partidos
                </label>
                <input
                  type='number'
                  className='w-full border border-gray-300 rounded px-3 py-2'
                  value={editedData.matches}
                  onChange={e =>
                    setEditedData({ ...editedData, matches: +e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Goles
                </label>
                <input
                  type='number'
                  className='w-full border border-gray-300 rounded px-3 py-2'
                  value={editedData.goals}
                  onChange={e =>
                    setEditedData({ ...editedData, goals: +e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Asistencias
                </label>
                <input
                  type='number'
                  className='w-full border border-gray-300 rounded px-3 py-2'
                  value={editedData.assists}
                  onChange={e =>
                    setEditedData({ ...editedData, assists: +e.target.value })
                  }
                />
              </div>
            </form>
            <div className='flex justify-end gap-3 mt-4'>
              <button
                onClick={handleCancel}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className='px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700'
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
