'use client';

import { useEffect } from 'react';
import { migrateLocalCampaigns } from '@/lib/migrateCampaigns';

export default function MigrationRunner({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateLocalCampaigns();
  }, []);

  return <>{children}</>;
}
