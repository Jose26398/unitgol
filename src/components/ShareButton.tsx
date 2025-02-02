import { Share } from 'lucide-react';
import { Player } from '../types';
import { calculateScore, calculateWinRate, totalScore } from '../utils/playerStats';

interface Props {
  players?: Player[];
  teams?: {
    teamA: Player[];
    teamB: Player[];
  };
}

export function ShareButton({ players, teams }: Props) {
  const generatePlayerSummary = (player: Player): string => {
    const { name, matches, wins, losses, goals, assists } = player;
    const draws = matches - wins - losses;
    const winRate = calculateWinRate(player);
    const goalsPerMatch = (goals / matches).toFixed(2);
    const assistsPerMatch = (assists / matches).toFixed(2);

    return `- ${name} (🌟${calculateScore(player).toFixed(2)}):\n🥅 Partidos: ${wins} Victorias / ${draws} Empates / ${losses} Derrotas\n🏆 WR: ${winRate}%\n⚽️ Goles: ${goals} (Promedio: ${goalsPerMatch} por partido)\n🎯 Asistencias: ${assists} (Promedio: ${assistsPerMatch} por partido)\n\n`;
  };

  const generateShareableContent = (): string => {
    let content = "";

    if (players) {
      content += "Resumen de Jugadores:\n\n";
      players.forEach(player => {
        content += generatePlayerSummary(player);
      });
    } else if (teams) {
      content += "Equipo A (Total: " + totalScore(teams.teamA).toFixed(2) + "):\n";
      teams.teamA.forEach(player => {
        content += generatePlayerSummary(player);
      });
      content += "\nEquipo B (Total: " + totalScore(teams.teamB).toFixed(2) + "):\n";
      teams.teamB.forEach(player => {
        content += generatePlayerSummary(player);
      });
    }

    return content;
  };

  const handleShare = async () => {
    const content = generateShareableContent();

    if (navigator.share) {
      try {
        await navigator.share({
          title: players ? 'Resumen de Jugadores' : 'Resumen de Equipos',
          text: content
        });
        console.log('Contenido compartido con éxito.');
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          alert('Contenido copiado al portapapeles.');
        })
        .catch(err => {
          console.error('Error al copiar al portapapeles:', err);
        });
    }
  };

  return (
    <button
      onClick={handleShare}
      className='flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700'
    >
      <Share className='w-5 h-5' /> Compartir
    </button>
  );
}
