'use client';

import { useState } from 'react';
import { SavedPlan } from '@/lib/event-navigator/types';
import { ChevronDown, ChevronUp, FolderOpen, Trash2, Upload } from 'lucide-react';

interface SavedPlansListProps {
  plans: SavedPlan[];
  onLoad: (plan: SavedPlan) => void;
  onDelete: (planId: number) => void;
}

export default function SavedPlansList({ plans, onLoad, onDelete }: SavedPlansListProps) {
  const [expanded, setExpanded] = useState(false);

  if (plans.length === 0) return null;

  return (
    <div className="bg-evn-card border border-evn-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-evn-text-secondary" />
          <span className="text-xs font-medium text-evn-text-secondary">
            Saved Plans ({plans.length})
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-evn-text-muted" />
        ) : (
          <ChevronDown size={14} className="text-evn-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-evn-border/50">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="flex items-center justify-between px-3 py-2 border-b border-evn-border/30 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-evn-text-primary truncate">{plan.name}</p>
                <p className="text-[10px] text-evn-text-muted">
                  {plan.eventIds.length} events \u00b7{' '}
                  {new Date(plan.created).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onLoad(plan)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-evn-info hover:bg-evn-info/10 transition-colors"
                >
                  <Upload size={10} />
                  Load
                </button>
                <button
                  onClick={() => onDelete(plan.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-evn-alert hover:bg-evn-alert/10 transition-colors"
                >
                  <Trash2 size={10} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
