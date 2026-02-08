'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Campaign } from '@/lib/types';
import { getCampaigns, deleteCampaign, updateCampaignStatus } from '@/lib/storage';
import { FolderOpen, Trash2, ExternalLink, FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-600',
  prompt_generated: 'bg-purple-100 text-purple-800',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    setCampaigns(getCampaigns());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
      setCampaigns(getCampaigns());
    }
  };

  const handleStatusChange = (id: string, status: Campaign['status']) => {
    updateCampaignStatus(id, status);
    setCampaigns(getCampaigns());
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-dd-slate">My Campaigns</h1>
          <p className="text-sm text-dd-gray mt-1">View and manage your saved campaign plans.</p>
        </div>
        <Link
          href="/plan"
          className="px-4 py-2 text-sm font-medium bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light text-center sm:text-left shrink-0"
        >
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-dd-border p-12 text-center">
          <FolderOpen className="w-12 h-12 text-dd-gray mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dd-slate mb-2">No campaigns yet</h2>
          <p className="text-sm text-dd-gray mb-4">
            Create your first campaign plan to get started.
          </p>
          <Link
            href="/plan"
            className="inline-block px-4 py-2 text-sm font-medium bg-dd-teal text-white rounded-lg hover:bg-dd-teal-light"
          >
            Plan a Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-sm border border-dd-border p-4 hover:border-dd-teal/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-dd-slate truncate">{campaign.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[campaign.status] || statusColors.draft}`}>
                      {campaign.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dd-gray">
                    <span>{campaign.objective}</span>
                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                    {campaign.brief.geography.length > 0 && (
                      <span>{campaign.brief.geography.join(', ')}</span>
                    )}
                    {campaign.brief.budgetRange && <span>{campaign.brief.budgetRange}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={campaign.status}
                    onChange={(e) => handleStatusChange(campaign.id, e.target.value as Campaign['status'])}
                    className="text-xs rounded border border-dd-border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-dd-teal"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                    <option value="prompt_generated">Prompt Generated</option>
                  </select>
                  {campaign.plan ? (
                    <Link
                      href={`/plan/${campaign.id}`}
                      className="p-2 text-dd-teal hover:bg-dd-teal/5 rounded"
                      title="View plan"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  ) : campaign.generatedPrompt ? (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(campaign.generatedPrompt || '');
                      }}
                      className="p-2 text-dd-navy hover:bg-dd-navy/5 rounded"
                      title="Copy prompt"
                    >
                      <FileText size={16} />
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete campaign"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
