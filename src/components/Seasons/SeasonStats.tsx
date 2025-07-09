import { useState, useMemo, useCallback } from 'react';
import { Player, Match } from '../../types';
import { calculateScore } from '../../utils/playerStats';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface SeasonStatsProps {
  seasonId: string;
  players: Player[];
  matches: Match[];
}

import type { ChartData } from 'chart.js';

export function SeasonStats({ seasonId, players, matches }: SeasonStatsProps) {
  const [detailChart, setDetailChart] = useState<ChartData<'bar', number[], string> | null>(null);
  const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');
  const [chartStat, setChartStat] = useState<'matches' | 'goals' | 'assists'>('goals');

  const seasonMatches = useMemo(() => matches.filter(m => m.seasonId === seasonId), [matches, seasonId]);
  const matchesChrono = useMemo(
    () => [...seasonMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [seasonMatches]
  );

  const playerStats = useMemo(() =>
    players.map(player => {
      const played = seasonMatches.filter(m =>
        m.teamA.players.some(p => p.id === player.id) ||
        m.teamB.players.some(p => p.id === player.id)
      );
      let goals = 0, assists = 0, wins = 0, losses = 0;
      for (const m of played) {
        goals += m.goals.filter(g => g.playerId === player.id).length;
        assists += m.goals.filter(g => g.assistById === player.id).length;
        const isA = m.teamA.players.some(p => p.id === player.id);
        const isB = m.teamB.players.some(p => p.id === player.id);
        if (isA && m.teamA.score > m.teamB.score) wins++;
        if (isB && m.teamB.score > m.teamA.score) wins++;
        if (isA && m.teamA.score < m.teamB.score) losses++;
        if (isB && m.teamB.score < m.teamA.score) losses++;
      }
      return { ...player, matches: played.length, goals, assists, wins, losses };
    }), [players, seasonMatches]);

  const bestPlayer = useMemo(() =>
    playerStats.reduce<Player | null>((b, p) => {
      if (!b) return p;
      return calculateScore(p) > calculateScore(b) ? p : b;
    }, null),
    [playerStats]
  );
  const topScorer = useMemo(() =>
    playerStats.reduce<Player | null>((b, p) => (!b || p.goals > b.goals) ? p : b, null),
    [playerStats]
  );
  const topAssistant = useMemo(() =>
    playerStats.reduce<Player | null>((b, p) => (!b || p.assists > b.assists) ? p : b, null),
    [playerStats]
  );

  const totalGoals = useMemo(() => playerStats.reduce((s, p) => s + p.goals, 0), [playerStats]);
  const totalAssists = useMemo(() => playerStats.reduce((s, p) => s + p.assists, 0), [playerStats]);
  const avgGoals = useMemo(() => seasonMatches.length ? (totalGoals / seasonMatches.length).toFixed(2) : '0', [totalGoals, seasonMatches.length]);
  const avgAssists = useMemo(() => seasonMatches.length ? (totalAssists / seasonMatches.length).toFixed(2) : '0', [totalAssists, seasonMatches.length]);

  const mostGames = useMemo(() =>
    playerStats.reduce<Player | null>((b, p) => (!b || p.matches > b.matches) ? p : b, null),
    [playerStats]
  );
  const mostEfficient = useMemo(() =>
    playerStats.reduce<Player | null>((b, p) => {
      const eff = p.matches ? (p.goals + p.assists) / p.matches : 0;
      const beff = b?.matches ? (b.goals + b.assists) / b.matches : 0;
      return eff > beff ? p : b;
    }, null),
    [playerStats]
  );

  const getStatArray = useCallback((stat: keyof (typeof playerStats)[0]) =>
    players.map(p => {
      const ps = playerStats.find(x => x.id === p.id);
      return ps ? ps[stat as keyof typeof ps] as number : 0;
    }),
    [players, playerStats]
  );

  const onClickStat = (stat: keyof (typeof playerStats)[0] | 'score', useLine: boolean) => {
    if (stat === 'score') {
      setChartMode('bar');
      setChartStat('goals'); // chartStat is not used for score, but required for type
      setDetailChart({
        labels: players.map(p => p.name),
        datasets: [{
          label: 'Score',
          data: players.map(p => {
            const ps = playerStats.find(x => x.id === p.id);
            return ps ? calculateScore(ps) : 0;
          }),
          backgroundColor: 'rgba(251,191,36,0.7)'
        }]
      });
    } else if (useLine) {
      setChartMode('line');
      setChartStat(stat as 'matches' | 'goals' | 'assists');
      setDetailChart(null);
    } else {
      setChartMode('bar');
      setChartStat(stat as 'matches' | 'goals' | 'assists');
      setDetailChart({
        labels: players.map(p => p.name),
        datasets: [{
          label: stat,
          data: getStatArray(stat as keyof (typeof playerStats)[0]),
          backgroundColor: stat === 'goals'
            ? 'rgba(244,63,94,0.7)'
            : stat === 'assists'
              ? 'rgba(59,130,246,0.7)'
              : 'rgba(16,185,129,0.7)'
        }]
      });
    }
  };

  const dynamicData = useMemo<ChartData<'line', number[], string> | ChartData<'bar', number[], string> | null>(() => {
    if (chartMode === 'bar') return detailChart;
    const labels = matchesChrono.map(m => new Date(m.date).toLocaleDateString());
    const datasets = players.map((p, i) => ({
      label: p.name,
      data: matchesChrono.map(m => chartStat === 'goals'
        ? m.goals.filter(g => g.playerId === p.id).length
        : m.goals.filter(g => g.assistById === p.id).length
      ),
      borderColor: `hsl(${i * 360 / players.length},70%,50%)`,
      backgroundColor: `hsla(${i * 360 / players.length},70%,50%,0.3)`,
      tension: 0.3,
    }));
    return { labels, datasets };
  }, [chartMode, chartStat, detailChart, matchesChrono, players]);

  return (
    <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart2 className="w-7 h-7 text-emerald-500" /> Estadísticas de la temporada
      </h3>

      {/* Premios */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-600">
          <Trophy className="w-5 h-5" /> Premios
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <StatCard
            icon={<Trophy className="text-yellow-500" />}
            label="Mejor jugador"
            value={bestPlayer ? `${bestPlayer.name} (${calculateScore(bestPlayer).toFixed(1)})` : '-'}
            highlight
            onValueClick={() => onClickStat('score', false)}
          />
          <StatCard
            icon={<Award className="text-rose-500" />}
            label="Máximo goleador"
            value={topScorer ? `${topScorer.name} (${topScorer.goals})` : '-'}
            onValueClick={() => onClickStat('goals', false)}
          />
          <StatCard
            icon={<Star className="text-cyan-500" />}
            label="Máximo asistente"
            value={topAssistant ? `${topAssistant.name} (${topAssistant.assists})` : '-'}
            onValueClick={() => onClickStat('assists', false)}
          />
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-emerald-600">
          <BarChart2 className="w-5 h-5" /> Estadísticas generales
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <StatCard
            icon={<Users className="text-blue-500" />}
            label="Partidos jugados"
            value={seasonMatches.length}
            onValueClick={() => onClickStat('matches', true)}
          />
          <StatCard
            icon={<Volleyball className="text-emerald-500" />}
            label="Total de goles"
            value={totalGoals}
            onValueClick={() => onClickStat('goals', true)}
          />
          <StatCard
            icon={<UserPlus className="text-sky-500" />}
            label="Total de asistencias"
            value={totalAssists}
            onValueClick={() => onClickStat('assists', true)}
          />
        </div>
      </div>

      {/* Promedios y eficiencia */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-sky-600">
          <TrendingUp className="w-5 h-5" /> Promedios y eficiencia
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <StatCard
            icon={<Goal className="text-emerald-400" />}
            label="Prom. goles/partido"
            value={avgGoals}
            onValueClick={() => onClickStat('goals', true)}
          />
          <StatCard
            icon={<UserCheck className="text-sky-400" />}
            label="Prom. asistencias/partido"
            value={avgAssists}
            onValueClick={() => onClickStat('assists', true)}
          />
          <StatCard
            icon={<User2 className="text-indigo-500" />}
            label="Jugador con más partidos"
            value={mostGames ? `${mostGames.name} (${mostGames.matches})` : '-'}
            highlight
            onValueClick={() => onClickStat('matches', true)}
          />
          <StatCard
            icon={<TrendingUp className="text-orange-500" />}
            label="Jugador más eficiente"
            value={mostEfficient ? `${mostEfficient.name} (${((mostEfficient.goals + mostEfficient.assists) / mostEfficient.matches).toFixed(2)})` : '-'}
          />
        </div>
      </div>

      {/* Gráfica dinámica (línea por jugador o barra individual) */}
      {detailChart || chartMode === 'line' ? (
        <div className="my-8 bg-white rounded-xl p-6 shadow-md border border-emerald-100 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              {chartMode === 'bar' ? detailChart?.datasets?.[0].label : (chartStat === 'goals' ? 'Evolución de goles' : 'Evolución de asistencias')}
            </h5>
          </div>
          <div style={{ minHeight: 400, height: 400, width: '100%', position: 'relative' }}>
            {chartMode === 'bar' ? (
              detailChart && <Bar data={detailChart} options={{ responsive: true, maintainAspectRatio: false, layout: { padding: 0 }, plugins: { legend: { display: false }, title: { display: false } } }} height={400} />
            ) : (
              dynamicData && chartMode === 'line' && <Line data={dynamicData as import('chart.js').ChartData<'line', number[], string>} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
            )}
          </div>
        </div>
      ) : null}
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
      className={`flex items-center gap-4 p-4 rounded-xl shadow-sm bg-white border hover:bg-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer
        ${onValueClick ? 'underline decoration-dotted' : ''} transition-all duration-200
        ${highlight ? 'border-emerald-400 bg-emerald-50/60' : 'border-gray-100'}`}
      title={label}
      onClick={onValueClick}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
        <div className="text-lg font-bold text-gray-800 cursor-pointer">{value}</div>
      </div>
    </div>
  );
}
