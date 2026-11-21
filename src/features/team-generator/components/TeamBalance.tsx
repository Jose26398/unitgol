import type { RatingMode } from "@/utils/elo";

interface TeamBalanceProps {
  teamAScore: number;
  teamBScore: number;
  ratingMode: RatingMode;
}

export function TeamBalance({
  teamAScore,
  teamBScore,
  ratingMode,
}: TeamBalanceProps) {
  const total = teamAScore + teamBScore;
  const teamAPercentage = total > 0 ? (teamAScore / total) * 100 : 50;
  const teamBPercentage = 100 - teamAPercentage;
  const unit = ratingMode === "elo" ? "ELO" : "PTS";

  return (
    <div className="rounded-xl border border-slate-800 bg-emerald-800 p-4 text-white shadow-md sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-sky-400">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            Equipo A
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
            {teamAScore.toFixed(1)}{" "}
            <span className="text-xs font-medium text-slate-300">{unit}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-2 text-sm font-semibold text-amber-400">
            Equipo B
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
            {teamBScore.toFixed(1)}{" "}
            <span className="text-xs font-medium text-slate-300">{unit}</span>
          </p>
        </div>
      </div>
      <div
        role="img"
        aria-label={`Reparto de puntuación: Equipo A ${teamAPercentage.toFixed(1)}%, Equipo B ${teamBPercentage.toFixed(1)}%`}
        className="flex h-4 overflow-hidden rounded-full"
      >
        <div
          className="h-full shrink-0 bg-sky-400 motion-safe:transition-[width] motion-safe:duration-300"
          style={{ width: `${teamAPercentage}%` }}
        />
        <div
          className="h-full shrink-0 bg-amber-400 motion-safe:transition-[width] motion-safe:duration-300"
          style={{ width: `${teamBPercentage}%` }}
        />
      </div>
      <div
        aria-hidden="true"
        className="mt-2 flex justify-between text-xs font-medium tabular-nums text-slate-300"
      >
        <span>{teamAPercentage.toFixed(1)}%</span>
        <span>{teamBPercentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}
