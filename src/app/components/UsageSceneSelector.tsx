import { usageSceneMapping, UsageScene } from "../types/usageScene";

interface UsageSceneSelectorProps {
  selectedScenes: UsageScene[];
  onSelect: (scenes: UsageScene[]) => void;
}

export default function UsageSceneSelector({
  selectedScenes,
  onSelect,
}: UsageSceneSelectorProps) {
  const handleToggle = (scene: UsageScene) => {
    if (selectedScenes.includes(scene)) {
      onSelect(selectedScenes.filter((s) => s !== scene));
    } else {
      onSelect([...selectedScenes, scene]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(usageSceneMapping).map(([key, value]) => (
        <button
          key={key}
          onClick={() => handleToggle(value.query)}
          className={`px-4 py-2 rounded-full border ${
            selectedScenes.includes(value.query)
              ? "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] font-bold"
              : "bg-white text-[var(--color-text-light)] border-[var(--color-text-light)] hover:bg-gray-50"
          }`}
        >
          {value.display}
        </button>
      ))}
    </div>
  );
}
