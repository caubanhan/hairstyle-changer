import { FilterBar } from './components/FilterBar';
import { HairstyleGrid } from './components/HairstyleGrid';
import { Navbar } from './components/Navbar';
import { PhotoGuidelines } from './components/PhotoGuidelines';
import { UploadZone } from './components/UploadZone';
import { useAppStore } from './store/useAppStore';

function App() {
  const activeTab = useAppStore((state) => state.activeTab);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-0 lg:h-[calc(100vh-56px)] lg:flex-row lg:overflow-hidden">
        <aside className="custom-scrollbar border-b border-[#E5E7EB] bg-white lg:h-full lg:w-[360px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="p-5">
            <h1 className="text-[22px] font-bold leading-tight">Try on a New Look</h1>
          </div>
          <FilterBar />
          <HairstyleGrid />
        </aside>

        <section className="custom-scrollbar flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {activeTab === 'studio' ? (
            <>
              <UploadZone />
              <div className="mx-auto w-full max-w-[560px]">
                <PhotoGuidelines />
              </div>
            </>
          ) : (
            <div className="mx-auto mt-16 max-w-xl rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A1A]">My Sessions</h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                Session history will appear here after you generate your first looks.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
