import { Sparkles } from 'lucide-react';

interface AIAdviceCardProps {
  advice: string;
}

export function AIAdviceCard({ advice }: AIAdviceCardProps) {
  return (
    <section className="mt-5 rounded-xl border border-[#F8C7D1] bg-[#FFF6F8] p-5 text-left">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#E8173A]">
        AI Style Consultant Says:
      </h3>
      <p className="text-sm leading-6 text-[#1F2937]">{advice}</p>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#F4A9B8] bg-white px-2.5 py-1 text-xs font-medium text-[#6B7280]">
        <Sparkles size={12} className="text-[#E8173A]" aria-hidden="true" />
        Claude AI
      </div>
    </section>
  );
}
