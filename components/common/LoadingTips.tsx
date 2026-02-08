'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const tips = [
  "LinkedIn ads typically cost 3-5x more per click than Google Ads, but often generate higher-quality B2B leads.",
  "The first 2 weeks of any campaign are a 'learning phase' — the algorithm is figuring out who to show your ads to. Don't panic if results are slow at first.",
  "In legal tech B2B, the average sales cycle is 3-6 months. One campaign rarely closes a deal — think of it as one touchpoint in a longer journey.",
  "A/B testing isn't optional. Always run at least 2 ad variations so you learn what resonates with your audience.",
  "Retargeting website visitors is usually the highest-ROI tactic available. If you're not doing it, start there.",
  "UTM parameters are how you track which ads are actually driving results. Without them, you're flying blind.",
];

export default function LoadingTips({ message = 'Generating your campaign plan...' }: { message?: string }) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <Loader2 className="w-10 h-10 text-dd-teal animate-spin mb-6" />
      <p className="text-dd-slate font-semibold text-lg mb-6">{message}</p>

      {/* Skeleton cards */}
      <div className="w-full max-w-lg space-y-3 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-dd-gray-light rounded animate-pulse-gentle" style={{ width: `${90 - i * 15}%` }} />
        ))}
      </div>

      {/* Tip */}
      <div className="bg-dd-gray-light rounded-lg p-4 max-w-lg text-center">
        <p className="text-dd-gray text-sm">
          <span className="font-medium">Pro tip:</span> {tips[tipIndex]}
        </p>
      </div>
    </div>
  );
}
