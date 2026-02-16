'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CampaignContextInput({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dd-slate mb-1">
        Campaign Context
        <span className="text-xs font-normal text-dd-gray ml-1">(optional)</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal resize-y"
        placeholder="e.g., Part of the Unity BC launch campaign targeting notaries. CTA should drive to dyedurham.com/unity-bc"
      />
    </div>
  );
}
