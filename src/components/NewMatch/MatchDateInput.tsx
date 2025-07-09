interface MatchDateInputProps {
  matchDate: string | null;
  setMatchDate: (date: string) => void;
}

export function MatchDateInput({ matchDate, setMatchDate }: MatchDateInputProps) {
  return (
    <div className="mb-6">
      <label htmlFor="matchDate" className="block text-gray-700 font-medium mb-2">
        Fecha del partido
      </label>
      <input
        type="date"
        id="matchDate"
        value={matchDate ?? ''}
        onChange={e => setMatchDate(e.target.value)}
        className="w-full border rounded-md p-2"
        aria-label="Match Date"
        required
      />
    </div>
  );
}
