

import { useState, useMemo, useCallback } from 'react';
import { Player, Match } from '../../types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Trophy,
  Volleyball,
  Users,
  Goal,
  BarChart2,
  UserCheck,
  UserPlus,
  Star,
  TrendingUp,
  Award,
  User2,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SeasonStatsProps {
  seasonId: string;
  players: Player[];
  matches: Match[];
}
import type { ChartData, ChartOptions } from 'chart.js';


export function SeasonStats({ seasonId, players, matches }: SeasonStatsProps) {
  type ChartDetail = {
    type: 'bar';
    data: ChartData<'bar', number[], string>;
    options?: ChartOptions<'bar'>;
    label: string;
  };
  const [detailChart, setDetailChart] = useState<ChartDetail | null>(null);

  // Memoize filtered matches for this season
  const seasonMatches = useMemo(() => matches.filter(m => m.seasonId === seasonId), [matches, seasonId]);

  // Memoize player stats calculation
  const playerStats = useMemo(() => players.map(player => {
    const playedMatches = seasonMatches.filter(m =>
      m.teamA.players.some(p => p.id === player.id) ||
      m.teamB.players.some(p => p.id === player.id)
    );
    let goals = 0, assists = 0, wins = 0, losses = 0;
    for (const match of playedMatches) {
      goals += match.goals.filter(g => g.playerId === player.id).length;
      assists += match.goals.filter(g => g.assistById === player.id).length;
      const isTeamA = match.teamA.players.some(p => p.id === player.id);
      const isTeamB = match.teamB.players.some(p => p.id === player.id);
      if (isTeamA && match.teamA.score > match.teamB.score) wins++;
      if (isTeamB && match.teamB.score > match.teamA.score) wins++;
      if (isTeamA && match.teamA.score < match.teamB.score) losses++;
      if (isTeamB && match.teamB.score < match.teamA.score) losses++;
    }
    return {
      ...player,
      matches: playedMatches.length,
      goals,
      assists,
      wins,
      losses,
    };
  }), [players, seasonMatches]);



  // Memoize all stats selectors
  const bestPlayer = useMemo(() =>
    playerStats.reduce((best, p) => {
      if (!best) return p;
      if (p.wins > best.wins) return p;
      if (p.wins === best.wins && p.goals > best.goals) return p;
      return best;
    }, null as null | typeof playerStats[0])
    , [playerStats]);

  const topScorer = useMemo(() =>
    playerStats.reduce((top, p) => (!top || p.goals > top.goals ? p : top), null as null | typeof playerStats[0])
    , [playerStats]);

  const topAssistant = useMemo(() =>
    playerStats.reduce((top, p) => (!top || p.assists > top.assists ? p : top), null as null | typeof playerStats[0])
    , [playerStats]);

  const totalGoals = useMemo(() => playerStats.reduce((sum, p) => sum + p.goals, 0), [playerStats]);
  const totalAssists = useMemo(() => playerStats.reduce((sum, p) => sum + p.assists, 0), [playerStats]);
  const avgGoals = useMemo(() => seasonMatches.length > 0 ? (totalGoals / seasonMatches.length).toFixed(2) : '0', [totalGoals, seasonMatches.length]);
  const avgAssists = useMemo(() => seasonMatches.length > 0 ? (totalAssists / seasonMatches.length).toFixed(2) : '0', [totalAssists, seasonMatches.length]);
  const mostGames = useMemo(() => playerStats.reduce((top, p) => (!top || p.matches > top.matches ? p : top), null as null | typeof playerStats[0]), [playerStats]);
  const mostEfficient = useMemo(() => playerStats.reduce((top, p) => {
    const eff = p.matches > 0 ? (p.goals + p.assists) / p.matches : 0;
    const topEff = top && top.matches > 0 ? (top.goals + top.assists) / top.matches : 0;
    return eff > topEff ? p : top;
  }, null as null | typeof playerStats[0]), [playerStats]);

  // Helper to get stat array for chart
  type PlayerStats = typeof playerStats[0];
  const getStatArray = useCallback(
    (stat: keyof PlayerStats, fn?: (ps: PlayerStats | undefined) => number) =>
      players.map(p => {
        const ps = playerStats.find(ps => ps.id === p.id);
        const value = fn ? fn(ps) : (ps?.[stat] ?? 0);
        return typeof value === 'number' ? value : Number(value) || 0;
      }),
    [players, playerStats]
  );

  // Chart click handlers (memoized)
  const handleChart = useCallback(
    (label: string, stat: keyof PlayerStats, color: string, fn?: (ps: PlayerStats | undefined) => number) => {
      setDetailChart({
        type: 'bar',
        label,
        data: {
          labels: players.map(p => p.name),
          datasets: [{
            label,
            data: getStatArray(stat, fn),
            backgroundColor: color,
          }],
        },
        options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: label } } },
      });
    },
    [getStatArray, players]
  );

  return (
    <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart2 className="w-7 h-7 text-emerald-500" /> Estadísticas de la temporada
      </h3>
      {/* Premios */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-600"><Trophy className="w-5 h-5" /> Premios</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <StatCard icon={<Trophy className="text-yellow-500" />} label="Mejor jugador" value={bestPlayer ? bestPlayer.name : '-'} highlight onValueClick={() => bestPlayer && handleChart('Victorias por jugador', 'wins', 'rgba(250, 204, 21, 0.7)')} />
          <StatCard icon={<Award className="text-rose-500" />} label="Máximo goleador" value={topScorer ? `${topScorer.name} (${topScorer.goals})` : '-'} onValueClick={() => topScorer && handleChart('Goles por jugador', 'goals', 'rgba(244, 63, 94, 0.7)')} />
          <StatCard icon={<Star className="text-cyan-500" />} label="Máximo asistente" value={topAssistant ? `${topAssistant.name} (${topAssistant.assists})` : '-'} onValueClick={() => topAssistant && handleChart('Asistencias por jugador', 'assists', 'rgba(34, 211, 238, 0.7)')} />
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-emerald-600"><BarChart2 className="w-5 h-5" /> Estadísticas generales</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <StatCard icon={<Users className="text-blue-500" />} label="Partidos jugados" value={seasonMatches.length} onValueClick={() => handleChart('Partidos jugados por jugador', 'matches', 'rgba(59, 130, 246, 0.7)')} />
          <StatCard icon={<Volleyball className="text-emerald-500" />} label="Total de goles" value={totalGoals} onValueClick={() => handleChart('Goles por jugador', 'goals', 'rgba(16, 185, 129, 0.7)')} />
          <StatCard icon={<UserPlus className="text-sky-500" />} label="Total de asistencias" value={totalAssists} onValueClick={() => handleChart('Asistencias por jugador', 'assists', 'rgba(59, 130, 246, 0.7)')} />
        </div>
      </div>

      {/* Promedios y eficiencia */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-sky-600"><TrendingUp className="w-5 h-5" /> Promedios y eficiencia</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <StatCard icon={<Goal className="text-emerald-400" />} label="Prom. goles/partido" value={avgGoals} onValueClick={() => handleChart('Promedio de goles por jugador', 'goals', 'rgba(16, 185, 129, 0.7)', ps => ps && ps.matches > 0 ? Number((ps.goals / ps.matches).toFixed(2)) : 0)} />
          <StatCard icon={<UserCheck className="text-sky-400" />} label="Prom. asistencias/partido" value={avgAssists} onValueClick={() => handleChart('Promedio de asistencias por jugador', 'assists', 'rgba(59, 130, 246, 0.7)', ps => ps && ps.matches > 0 ? Number((ps.assists / ps.matches).toFixed(2)) : 0)} />
          <StatCard icon={<User2 className="text-indigo-500" />} label="Jugador con más partidos" value={mostGames ? `${mostGames.name} (${mostGames.matches})` : '-'} highlight onValueClick={() => handleChart('Partidos jugados por jugador', 'matches', 'rgba(99, 102, 241, 0.7)')} />
          <StatCard icon={<TrendingUp className="text-orange-500" />} label="Jugador más eficiente" value={mostEfficient ? `${mostEfficient.name} (${((mostEfficient.goals + mostEfficient.assists) / (mostEfficient.matches || 1)).toFixed(2)})` : '-'} onValueClick={() => handleChart('Eficiencia (goles+asistencias) por jugador', 'goals', 'rgba(251, 191, 36, 0.7)', ps => ps && ps.matches > 0 ? Number(((ps.goals + ps.assists) / ps.matches).toFixed(2)) : 0)} />
        </div>
      </div>
      {detailChart && (
        <div className="my-8 bg-white rounded-xl p-6 shadow-md border border-emerald-100 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" /> {detailChart.label}
            </h5>
          </div>
          {detailChart.type === 'bar' && (
            <div style={{ minHeight: 400, height: 400, width: '100%', position: 'relative' }}>
              <Bar
                data={detailChart.data}
                options={{
                  ...detailChart.options,
                  maintainAspectRatio: false,
                  layout: { padding: 0 },
                  plugins: {
                    ...((detailChart.options && detailChart.options.plugins) || {}),
                  },
                  responsive: true,
                }}
                height={400}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  onValueClick?: () => void;
}

function StatCard({ icon, label, value, highlight, onValueClick }: StatCardProps) {
  return (
    <div
      className={
        `flex items-center gap-4 p-4 rounded-xl shadow-sm bg-white border hover:bg-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer
        ${onValueClick ? 'underline decoration-dotted' : ''} transition-all duration-200
        ${highlight ? 'border-emerald-400 bg-emerald-50/60' : 'border-gray-100'}`
      }
      title={label}
      onClick={onValueClick}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
        <div
          className={"text-lg font-bold text-gray-800 cursor-pointer"}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
