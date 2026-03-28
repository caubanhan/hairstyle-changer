import { hairstyles } from '../data/hairstyles';
import { useAppStore } from '../store/useAppStore';
import { HairstyleCard } from './HairstyleCard';

export function HairstyleGrid() {
  const filterLength = useAppStore((state) => state.filterLength);
  const filterGender = useAppStore((state) => state.filterGender);
  const selectedHairstyle = useAppStore((state) => state.selectedHairstyle);
  const setSelectedHairstyle = useAppStore((state) => state.setSelectedHairstyle);
  const clearResult = useAppStore((state) => state.clearResult);

  const filteredHairstyles = hairstyles.filter((hairstyle) => {
    const matchesLength = filterLength === 'all' || hairstyle.length === filterLength;
    const matchesGender =
      filterGender === 'all' || hairstyle.gender === 'all' || hairstyle.gender === filterGender;
    return matchesLength && matchesGender;
  });

  return (
    <div className="grid grid-cols-3 gap-2 px-5 pb-6">
      {filteredHairstyles.map((hairstyle) => (
        <HairstyleCard
          key={hairstyle.id}
          hairstyle={hairstyle}
          selected={selectedHairstyle?.id === hairstyle.id}
          onSelect={(style) => {
            setSelectedHairstyle(style);
            clearResult();
          }}
        />
      ))}
    </div>
  );
}
