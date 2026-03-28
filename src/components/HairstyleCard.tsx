import { Check } from 'lucide-react';
import type { Hairstyle } from '../types';

interface HairstyleCardProps {
  hairstyle: Hairstyle;
  selected: boolean;
  onSelect: (hairstyle: Hairstyle) => void;
}

export function HairstyleCard({ hairstyle, selected, onSelect }: HairstyleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(hairstyle)}
      className={`group relative aspect-[3/4] w-full overflow-hidden rounded-[10px] border-2 text-left transition duration-200 ${
        selected
          ? 'border-[#E8173A] shadow-[0_8px_20px_rgba(232,23,58,0.2)]'
          : 'border-transparent hover:scale-[1.03] hover:border-[#E8173A] hover:shadow-[0_8px_20px_rgba(26,26,26,0.12)]'
      }`}
    >
      <img
        src={hairstyle.imageUrl}
        alt={hairstyle.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-1.5">
        <p className="truncate text-[11px] font-medium text-white">{hairstyle.name}</p>
      </div>
      {selected ? (
        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E8173A] text-white">
          <Check size={12} aria-hidden="true" />
        </div>
      ) : null}
    </button>
  );
}
