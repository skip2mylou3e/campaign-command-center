'use client';

import { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { TeamConfig } from '@/lib/types';
import { getTeamConfig, saveTeamConfig, DEFAULT_CONFIG } from '@/lib/storage';

const adAccountOptions = [
  'Google Ads',
  'LinkedIn Campaign Manager',
  'Meta Business Manager',
  'YouTube (via Google Ads)',
];

const creativeToolOptions = [
  'Canva',
  'Adobe Creative Suite',
  'Figma',
];

export default function SettingsPage() {
  const [config, setConfig] = useState<TeamConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getTeamConfig());
  }, []);

  const updateConfig = (field: keyof TeamConfig, value: unknown) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'adAccountsActive' | 'creativeTools', item: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item],
    }));
  };

  const handleSave = () => {
    saveTeamConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-dd-slate">Settings</h1>
          <p className="text-sm text-dd-gray mt-1">
            Configure your team&apos;s tech stack. This context is included in every AI interaction.
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            saved
              ? 'bg-green-100 text-green-800'
              : 'bg-dd-teal text-white hover:bg-dd-teal-light'
          }`}
        >
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-dd-navy mb-4 border-b border-dd-border pb-2">Tech Stack</h2>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">CRM / Marketing Automation</label>
              <select
                value={config.crmPlatform}
                onChange={(e) => updateConfig('crmPlatform', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="HubSpot">HubSpot</option>
                <option value="Salesforce Marketing Cloud">Salesforce Marketing Cloud</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">HubSpot Tier</label>
              <select
                value={config.hubspotTier}
                onChange={(e) => updateConfig('hubspotTier', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="Free">Free</option>
                <option value="Starter">Starter</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Sales CRM</label>
              <select
                value={config.salesCrm}
                onChange={(e) => updateConfig('salesCrm', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="Salesforce">Salesforce</option>
                <option value="HubSpot CRM">HubSpot CRM</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">HubSpot-Salesforce Sync</label>
              <select
                value={config.hubspotSalesforceSync}
                onChange={(e) => updateConfig('hubspotSalesforceSync', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="Active">Active</option>
                <option value="Not active">Not active</option>
                <option value="Don't know">Don&apos;t know</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Website Platform</label>
              <select
                value={config.websitePlatform}
                onChange={(e) => updateConfig('websitePlatform', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="HubSpot CMS">HubSpot CMS</option>
                <option value="WordPress">WordPress</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Analytics Platform</label>
              <select
                value={config.analyticsPlatform}
                onChange={(e) => updateConfig('analyticsPlatform', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="Google Analytics 4">Google Analytics 4</option>
                <option value="HubSpot Analytics">HubSpot Analytics</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dd-slate mb-2">Active Ad Accounts</label>
            <div className="grid grid-cols-2 gap-2">
              {adAccountOptions.map(acc => (
                <label key={acc} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.adAccountsActive.includes(acc)}
                    onChange={() => toggleArrayItem('adAccountsActive', acc)}
                    className="rounded border-dd-border text-dd-teal focus:ring-dd-teal"
                  />
                  {acc}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dd-slate mb-2">Creative Tools</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {creativeToolOptions.map(tool => (
                <label key={tool} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.creativeTools.includes(tool)}
                    onChange={() => toggleArrayItem('creativeTools', tool)}
                    className="rounded border-dd-border text-dd-teal focus:ring-dd-teal"
                  />
                  {tool}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dd-slate mb-1">Landing Page Capability</label>
            <select
              value={config.landingPageCapability}
              onChange={(e) => updateConfig('landingPageCapability', e.target.value)}
              className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
            >
              <option value="Can build in HubSpot">Can build in HubSpot</option>
              <option value="Can build in WordPress">Can build in WordPress</option>
              <option value="Need developer help">Need developer help</option>
              <option value="Cannot build">Cannot build</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Defaults */}
      <div className="bg-white rounded-lg shadow-sm border border-dd-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-dd-navy mb-4 border-b border-dd-border pb-2">Company Defaults</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dd-slate mb-1">Brand Tone of Voice</label>
            <textarea
              value={config.brandToneOfVoice}
              onChange={(e) => updateConfig('brandToneOfVoice', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
            />
            <p className="text-xs text-dd-gray italic mt-1">Included in messaging recommendations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Legal Review Time</label>
              <select
                value={config.defaultLegalReviewTime}
                onChange={(e) => updateConfig('defaultLegalReviewTime', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="None">None</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="3+ weeks">3+ weeks</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Team Size</label>
              <input
                type="number"
                value={config.teamSize}
                onChange={(e) => updateConfig('teamSize', e.target.value)}
                min={1}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dd-slate mb-1">Experience Level</label>
              <select
                value={config.teamExperienceLevel}
                onChange={(e) => updateConfig('teamExperienceLevel', e.target.value)}
                className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
              >
                <option value="Beginner">Beginner</option>
                <option value="Some experience">Some experience</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dd-slate mb-1">Budget Approval Process</label>
            <textarea
              value={config.standardBudgetApproval}
              onChange={(e) => updateConfig('standardBudgetApproval', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dd-slate mb-1">Primary Brand Colors</label>
            <input
              type="text"
              value={config.primaryBrandColors}
              onChange={(e) => updateConfig('primaryBrandColors', e.target.value)}
              placeholder="#0A1F3F, #00A5B5"
              className="w-full rounded-lg border border-dd-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            saved
              ? 'bg-green-100 text-green-800'
              : 'bg-dd-teal text-white hover:bg-dd-teal-light'
          }`}
        >
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
