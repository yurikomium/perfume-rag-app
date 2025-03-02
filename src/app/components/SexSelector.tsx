import { Sex } from "../types/perfume";

interface SexSelectorProps {
  selectedSex: Sex | null;
  onSelect: (sex: Sex | null) => void;
}

export default function SexSelector({
  selectedSex,
  onSelect,
}: SexSelectorProps) {
  const options: Sex[] = ["ユニセックス", "レディース", "メンズ"];

  return (
    <div className="flex gap-2 mb-4">
      {options.map((sex) => (
        <button
          key={sex}
          onClick={() => onSelect(selectedSex === sex ? null : sex)}
          className={`px-4 py-2 rounded-full border ${
            selectedSex === sex
              ? "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] font-bold"
              : "bg-white text-[var(--color-text-light)] border-[var(--color-text-light)] hover:bg-gray-50"
          }`}
        >
          {sex}
        </button>
      ))}
    </div>
  );
}
