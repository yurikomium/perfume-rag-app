import { Season } from "../types/perfume";

interface SeasonSelectorProps {
  selectedSeasons: Season[];
  onSelect: (seasons: Season[]) => void;
}

export default function SeasonSelector({
  selectedSeasons,
  onSelect,
}: SeasonSelectorProps) {
  const options: Season[] = ["春", "夏", "秋", "冬"];

  const toggleSeason = (season: Season) => {
    if (selectedSeasons.includes(season)) {
      onSelect(selectedSeasons.filter((s) => s !== season));
    } else {
      onSelect([...selectedSeasons, season]);
    }
  };

  return (
    <div className="flex gap-2">
      {options.map((season) => (
        <button
          key={season}
          onClick={() => toggleSeason(season)}
          className={`px-4 py-2 rounded-full border ${
            selectedSeasons.includes(season)
              ? "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] font-bold"
              : "bg-white text-[var(--color-text-light)] border-[var(--color-text-light)] hover:bg-gray-50"
          }`}
        >
          {season}
        </button>
      ))}
    </div>
  );
}
