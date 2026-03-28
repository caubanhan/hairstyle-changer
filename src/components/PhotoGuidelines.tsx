import { Info } from 'lucide-react';

const guidelines = [
  'Face clearly visible, looking straight at the camera',
  'Selfie format (chest up) works best',
  'Good lighting without harsh shadows',
  'No glasses, hats, or hands covering your face',
];

export function PhotoGuidelines() {
  return (
    <section className="mt-5 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Info size={16} className="text-[#E8173A]" aria-hidden="true" />
        <h3 className="text-sm font-bold text-[#1A1A1A]">Photo Guidelines for Best Results</h3>
      </div>
      <ul className="space-y-2">
        {guidelines.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#4B5563]">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#E8173A]" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
