'use client';

import { useState } from 'react';
import { Save, Check } from 'lucide-react';

interface SavePlanFormProps {
  onSave: (name: string) => void;
}

export default function SavePlanForm({ onSave }: SavePlanFormProps) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName('');
    }, 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Plan name..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        className="flex-1 bg-evn-base border border-evn-border rounded-lg px-3 py-2 text-xs text-evn-text-primary placeholder:text-evn-text-muted focus:outline-none focus:border-evn-amber/50"
      />
      <button
        onClick={handleSave}
        disabled={!name.trim() || saved}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
          saved
            ? 'bg-evn-tier1/15 text-evn-tier1 border border-evn-tier1/30'
            : name.trim()
            ? 'bg-gradient-to-r from-evn-amber to-evn-amber-dark text-evn-base hover:shadow-lg hover:shadow-evn-amber/20'
            : 'bg-evn-border text-evn-text-muted cursor-not-allowed'
        }`}
      >
        {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Plan</>}
      </button>
    </div>
  );
}
