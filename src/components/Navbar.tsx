import { Scissors } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Navbar() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[#E5E7EB] bg-white px-4 shadow-sm md:px-6">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8173A] text-white">
            <Scissors size={16} aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-[#1A1A1A]">Cut Gen</span>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === 'studio' ? 'bg-[#FEE2E6] text-[#E8173A]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
            }`}
          >
            <span aria-hidden="true">✦</span>
            <span>Studio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === 'sessions' ? 'bg-[#FEE2E6] text-[#E8173A]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
            }`}
          >
            <span aria-hidden="true">⊞</span>
            <span>My Sessions</span>
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition hover:border-[#9CA3AF] sm:inline-flex"
          >
            + New Session
          </button>
          <button
            type="button"
            className="rounded-full bg-[#E8173A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#C0122F]"
          >
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
