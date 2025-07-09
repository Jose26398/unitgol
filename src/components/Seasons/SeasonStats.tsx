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

import type { ChartData } from 'chart.js';

interface SeasonStatsProps {
  seasonId: string;
  players: Player[];
  matches: Match[];
}


export function SeasonStats({ seasonId, players, matches }: SeasonStatsProps) {
  // State
  const [detailChart, setDetailChart] = useState<ChartData<'bar' | 'line', number[], string> | null>(null);
  const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');
  const [chartStat, setChartStat] = useState<'matches' | 'goals' | 'assists'>('goals');
  const [selectedStat, setSelectedStat] = useState<{ stat: string, useLine: boolean }>({ stat: 'score', useLine: false });


  // Memoized data
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
      played.forEach(m => {
        goals += m.goals.filter(g => g.playerId === player.id).length;
        assists += m.goals.filter(g => g.assistById === player.id).length;
        const isA = m.teamA.players.some(p => p.id === player.id);
        const isB = m.teamB.players.some(p => p.id === player.id);
        if (isA && m.teamA.score > m.teamB.score) wins++;
        if (isB && m.teamB.score > m.teamA.score) wins++;
        if (isA && m.teamA.score < m.teamB.score) losses++;
        if (isB && m.teamB.score < m.teamA.score) losses++;
      });
      return { ...player, matches: played.length, goals, assists, wins, losses };
    }), [players, seasonMatches]);


  // Premios y estadísticas generales
  const bestPlayer = useMemo(() => playerStats.reduce<Player | null>((b, p) => (!b || calculateScore(p) > calculateScore(b)) ? p : b, null), [playerStats]);
  const topScorer = useMemo(() => playerStats.reduce<Player | null>((b, p) => (!b || p.goals > b.goals) ? p : b, null), [playerStats]);
  const topAssistant = useMemo(() => playerStats.reduce<Player | null>((b, p) => (!b || p.assists > b.assists) ? p : b, null), [playerStats]);
  const totalGoals = useMemo(() => playerStats.reduce((s, p) => s + p.goals, 0), [playerStats]);
  const totalAssists = useMemo(() => playerStats.reduce((s, p) => s + p.assists, 0), [playerStats]);
  const avgGoals = useMemo(() => seasonMatches.length ? (totalGoals / seasonMatches.length).toFixed(2) : '0', [totalGoals, seasonMatches.length]);
  const avgAssists = useMemo(() => seasonMatches.length ? (totalAssists / seasonMatches.length).toFixed(2) : '0', [totalAssists, seasonMatches.length]);
  const mostGames = useMemo(() => playerStats.reduce<Player | null>((b, p) => (!b || p.matches > b.matches) ? p : b, null), [playerStats]);

  // Handler para cambiar el gráfico dinámico
  const onClickStat = useCallback((stat: string, useLine: boolean) => {
    setSelectedStat({ stat, useLine });
    // Bar chart: total partidos jugados por jugador
    if (stat === 'matches' && !useLine) {
      setChartMode('bar');
      setChartStat('matches');
      setDetailChart({
        labels: players.map(p => p.name),
        datasets: [{
          label: 'Partidos jugados',
          data: players.map(p => {
            const ps = playerStats.find(x => x.id === p.id);
            return ps ? ps.matches : 0;
          }),
          backgroundColor: 'rgba(16,185,129,0.7)'
        }]
      });
      return;
    }

    // Line chart: acumulado de partidos jugados por jugador
    if ((stat === 'matches' && useLine) || stat === 'mostGames') {
      setChartMode('line');
      setChartStat('matches');
      setDetailChart({
        labels: matchesChrono.map(m => new Date(m.date).toLocaleDateString()),
        datasets: players.map((p, i) => {
          let acc = 0;
          return {
            label: p.name,
            data: matchesChrono.map(m => {
              const played = m.teamA.players.some(pl => pl.id === p.id) || m.teamB.players.some(pl => pl.id === p.id);
              if (played) acc++;
              return acc;
            }),
            borderColor: `hsl(${i * 360 / players.length},70%,50%)`,
            backgroundColor: `hsla(${i * 360 / players.length},70%,50%,0.3)`,
            tension: 0.3,
          };
        })
      });
      return;
    }

    // Line chart: acumulado de goles por jugador
    if (stat === 'goals' && useLine) {
      setChartMode('line');
      setChartStat('goals');
      setDetailChart({
        labels: matchesChrono.map(m => new Date(m.date).toLocaleDateString()),
        datasets: players.map((p, i) => {
          let acc = 0;
          return {
            label: p.name,
            data: matchesChrono.map(m => {
              acc += m.goals.filter(g => g.playerId === p.id).length;
              return acc;
            }),
            borderColor: `hsl(${i * 360 / players.length},70%,50%)`,
            backgroundColor: `hsla(${i * 360 / players.length},70%,50%,0.3)`,
            tension: 0.3,
          };
        })
      });
      return;
    }

    // Bar chart: total goles por jugador
    if (stat === 'goals' && !useLine) {
      setChartMode('bar');
      setChartStat('goals');
      setDetailChart({
        labels: players.map(p => p.name),
        datasets: [{
          label: 'Goles',
          data: players.map(p => {
            const ps = playerStats.find(x => x.id === p.id);
            return ps ? ps.goals : 0;
          }),
          backgroundColor: 'rgba(244,63,94,0.7)'
        }]
      });
      return;
    }

    // Line chart: acumulado de asistencias por jugador
    if (stat === 'assists' && useLine) {
      setChartMode('line');
      setChartStat('assists');
      setDetailChart({
        labels: matchesChrono.map(m => new Date(m.date).toLocaleDateString()),
        datasets: players.map((p, i) => {
          let acc = 0;
          return {
            label: p.name,
            data: matchesChrono.map(m => {
              acc += m.goals.filter(g => g.assistById === p.id).length;
              return acc;
            }),
            borderColor: `hsl(${i * 360 / players.length},70%,50%)`,
            backgroundColor: `hsla(${i * 360 / players.length},70%,50%,0.3)`,
            tension: 0.3,
          };
        })
      });
      return;
    }

    // Bar chart: total asistencias por jugador
    if (stat === 'assists' && !useLine) {
      setChartMode('bar');
      setChartStat('assists');
      setDetailChart({
        labels: players.map(p => p.name),
        datasets: [{
          label: 'Asistencias',
          data: players.map(p => {
            const ps = playerStats.find(x => x.id === p.id);
            return ps ? ps.assists : 0;
          }),
          backgroundColor: 'rgba(59,130,246,0.7)'
        }]
      });
      return;
    }

    // Line chart: promedio goles por partido por jugador
    if (stat === 'avgGoals') {
      setChartMode('line');
      setChartStat('goals');
      setDetailChart({
        labels: matchesChrono.map(m => new Date(m.date).toLocaleDateString()),
        datasets: players.map((p, i) => {
          let played = 0;
          let goals = 0;
          return {
            label: p.name,
            data: matchesChrono.map(m => {
              const playedThis = m.teamA.players.some(pl => pl.id === p.id) || m.teamB.players.some(pl => pl.id === p.id);
              if (playedThis) {
                played++;
                goals += m.goals.filter(g => g.playerId === p.id).length;
              }
              return played ? goals / played : 0;
            }),
            borderColor: `hsl(${i * 360 / players.length},70%,50%)`,
            backgroundColor: `hsla(${i * 360 / players.length},70%,50%,0.3)`,
            tension: 0.3,
          };
        })
      });
      return;
    }

    // Line chart: promedio asistencias por partido por jugador
    if (stat === 'avgAssists') {
      setChartMode('line');
      setChartStat('assists');
      setDetailChart({
        labels: matchesChrono.map(m => new Date(m.date).toLocaleDateString()),
        datasets: players.map((p, i) => {
          let played = 0;
          let assists = 0;
          return {
            label: p.name,
            data: matchesChrono.map(m => {
              const playedThis = m.teamA.players.some(pl => pl.id === p.id) || m.teamB.players.some(pl => pl.id === p.id);
              if (playedThis) {
                played++;
                assists += m.goals.filter(g => g.assistById === p.id).length;
              }
              return played ? assists / played : 0;
            }),
            borderColor: `hsl(${i * 360 / players.length},70%,50%)`,
            backgroundColor: `hsla(${i * 360 / players.length},70%,50%,0.3)`,
            tension: 0.3,
          };
        })
      });
      return;
    }

    // Line chart: score por partido por jugador (eficiencia)
    if (stat === 'efficiency') {
      setChartMode('line');
      setChartStat('goals');
      setDetailChart({
        labels: matchesChrono.map(m => new Date(m.date).toLocaleDateString()),
        datasets: players.map((p, i) => ({
          label: p.name,
          data: matchesChrono.map(m => {
            const goals = m.goals.filter(g => g.playerId === p.id).length;
            const assists = m.goals.filter(g => g.assistById === p.id).length;
            return calculateScore({ ...p, goals, assists, matches: 1, wins: 0, losses: 0 });
          }),
          borderColor: `hsl(${i * 360 / players.length},70%,50%)`,
          backgroundColor: `hsla(${i * 360 / players.length},70%,50%,0.3)`,
          tension: 0.3,
        }))
      });
      return;
    }

    // Bar chart: score total por jugador (mejor jugador)
    if (stat === 'score') {
      setChartMode('bar');
      setChartStat('goals');
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
      return;
    }
  }, [players, playerStats, matchesChrono]);


  // Selección por defecto: mejor jugador (score)
  // Solo se ejecuta una vez al montar
  useState(() => {
    onClickStat('score', false);
  });

  // dynamicData es solo detailChart
  const dynamicData = detailChart;


  return (
    <section className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
      <Header title="Estadísticas de la temporada" />

      <StatsSection
        title="Premios"
        icon={<Trophy className="w-5 h-5" />}
        titleClass="text-yellow-600"
        stats={[
          {
            icon: <Trophy className="text-yellow-500" />,
            label: 'Mejor jugador',
            value: bestPlayer ? `${bestPlayer.name} (${calculateScore(bestPlayer).toFixed(1)})` : '-',
            onValueClick: () => onClickStat('score', false),
            highlight: selectedStat.stat === 'score' && !selectedStat.useLine,
          },
          {
            icon: <Award className="text-rose-500" />,
            label: 'Máximo goleador',
            value: topScorer ? `${topScorer.name} (${topScorer.goals})` : '-',
            onValueClick: () => onClickStat('goals', false),
            highlight: selectedStat.stat === 'goals' && !selectedStat.useLine,
          },
          {
            icon: <Star className="text-cyan-500" />,
            label: 'Máximo asistente',
            value: topAssistant ? `${topAssistant.name} (${topAssistant.assists})` : '-',
            onValueClick: () => onClickStat('assists', false),
            highlight: selectedStat.stat === 'assists' && !selectedStat.useLine,
          },
        ]}
      />

      <StatsSection
        title="Estadísticas generales"
        icon={<BarChart2 className="w-5 h-5" />}
        titleClass="text-emerald-600"
        stats={[
          {
            icon: <Users className="text-blue-500" />,
            label: 'Partidos jugados',
            value: seasonMatches.length,
            onValueClick: () => onClickStat('matches', false),
            highlight: selectedStat.stat === 'matches' && !selectedStat.useLine,
          },
          {
            icon: <Volleyball className="text-emerald-500" />,
            label: 'Total de goles',
            value: totalGoals,
            onValueClick: () => onClickStat('goals', true),
            highlight: selectedStat.stat === 'goals' && selectedStat.useLine,
          },
          {
            icon: <UserPlus className="text-sky-500" />,
            label: 'Total de asistencias',
            value: totalAssists,
            onValueClick: () => onClickStat('assists', true),
            highlight: selectedStat.stat === 'assists' && selectedStat.useLine,
          },
        ]}
      />

      <StatsSection
        title="Promedios y eficiencia"
        icon={<TrendingUp className="w-5 h-5" />}
        titleClass="text-sky-600"
        stats={[
          {
            icon: <Goal className="text-emerald-400" />,
            label: 'Prom. goles/partido',
            value: avgGoals,
            onValueClick: () => onClickStat('avgGoals', true),
            highlight: selectedStat.stat === 'avgGoals',
          },
          {
            icon: <UserCheck className="text-sky-400" />,
            label: 'Prom. asistencias/partido',
            value: avgAssists,
            onValueClick: () => onClickStat('avgAssists', true),
            highlight: selectedStat.stat === 'avgAssists',
          },
          {
            icon: <User2 className="text-indigo-500" />,
            label: 'Jugador con más partidos',
            value: mostGames ? `${mostGames.name} (${mostGames.matches})` : '-',
            onValueClick: () => onClickStat('mostGames', true),
            highlight: selectedStat.stat === 'mostGames',
          },
        ]}
      />

      {/* Gráfica dinámica (línea por jugador o barra individual) */}
      {(detailChart || chartMode === 'line') && (
        <div className="my-8 bg-white rounded-xl p-6 shadow-md border border-emerald-100 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              {getChartTitle(chartMode, chartStat, detailChart, players)}
            </h5>
          </div>
          <div style={{ minHeight: 400, height: 400, width: '100%', position: 'relative' }}>
            {chartMode === 'bar' ? (
              detailChart && <Bar data={detailChart as import('chart.js').ChartData<'bar', number[], string>} options={{ responsive: true, maintainAspectRatio: false, layout: { padding: 0 }, plugins: { legend: { display: false }, title: { display: false } } }} height={400} />
            ) : (
              dynamicData && chartMode === 'line' && <Line data={dynamicData as unknown as import('chart.js').ChartData<'line', number[], string>} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}


// Header component
function Header({ title }: { title: string }) {
  return (
    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <BarChart2 className="w-7 h-7 text-emerald-500" /> {title}
    </h3>
  );
}

// StatsSection component
interface StatsSectionProps {
  title: string;
  icon: React.ReactNode;
  titleClass?: string;
  stats: Array<{
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    onValueClick?: () => void;
    highlight?: boolean;
  }>;
}
function StatsSection({ title, icon, titleClass = '', stats }: StatsSectionProps) {
  return (
    <div className="mb-8">
      <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${titleClass}`}>
        {icon} {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label + i} {...stat} />
        ))}
      </div>
    </div>
  );
}

// StatCard component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  onValueClick?: () => void;
  highlight?: boolean;
}
function StatCard({ icon, label, value, onValueClick, highlight }: StatCardProps) {
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

// Utilidad para el título del gráfico
function getChartTitle(
  chartMode: 'bar' | 'line',
  chartStat: 'matches' | 'goals' | 'assists',
  detailChart: ChartData<'bar' | 'line', number[], string> | null,
  players: Player[]
) {
  if (chartMode === 'bar') return detailChart?.datasets?.[0].label || '';
  if (chartStat === 'goals' && chartMode === 'line' && detailChart?.datasets?.length === players.length && detailChart?.datasets?.[0].label !== 'Score')
    return 'Evolución de goles';
  if (chartStat === 'assists' && chartMode === 'line')
    return 'Evolución de asistencias';
  if (chartStat === 'matches' && chartMode === 'line')
    return 'Evolución de partidos jugados';
  if (chartStat === 'goals' && chartMode === 'line' && detailChart?.datasets?.[0].label === 'Score')
    return 'Jugador más eficiente';
  return '';
}
