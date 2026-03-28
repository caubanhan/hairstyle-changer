import type { HairGender } from '../types';
import { useAppStore } from '../store/useAppStore';

const lengthFilters: Array<'all' | 'short' | 'medium' | 'long'> = ['all', 'short', 'medium', 'long'];
const genderFilters: HairGender[] = ['female', 'male', 'all'];

export function FilterBar() {
  const filterLength = useAppStore((state) => state.filterLength);
  const filterGender = useAppStore((state) => state.filterGender);
  const setFilterLength = useAppStore((state) => state.setFilterLength);
  const setFilterGender = useAppStore((state) => state.setFilterGender);

  return (
    <div className="space-y-2 px-5 pb-4">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {lengthFilters.map((length) => {
          const isActive = filterLength === length;
          const label = length.charAt(0).toUpperCase() + length.slice(1);
          return (
            <button
              key={length}
              type="button"
              onClick={() => setFilterLength(length)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                isActive
                  ? 'border-[#E8173A] bg-[#E8173A] text-white'
                  : 'border-[#D1D5DB] bg-white text-[#6B7280] hover:border-[#9CA3AF]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {genderFilters.map((gender) => {
          const isActive = filterGender === gender;
          const label = gender === 'female' ? '♀' : gender === 'male' ? '♂' : 'All';
          return (
            <button
              key={gender}
              type="button"
              onClick={() => setFilterGender(gender)}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-3 text-sm font-medium transition ${
                isActive
                  ? 'border-[#E8173A] bg-[#E8173A] text-white'
                  : 'border-[#D1D5DB] bg-white text-[#6B7280] hover:border-[#9CA3AF]'
              }`}
              aria-label={`Filter by ${gender}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
