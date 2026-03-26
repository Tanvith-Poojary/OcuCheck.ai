"use client";

import { useState } from 'react';
import LiveScan from '@/components/dashboard/LiveScan';
import AnalysisWorkflow from '@/components/dashboard/AnalysisWorkflow';

export default function DashboardPage() {
  const [imageData, setImageData] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LiveScan onCapture={setImageData} />
        </div>
        <div className="lg:col-span-3">
          <AnalysisWorkflow imageData={imageData} />
        </div>
      </div>
    </div>
  );
}
