"use client";

import { BarChart3 } from 'lucide-react';
import { SimilarwebRankingEditor } from './SimilarwebRankingEditor';

interface SimilarwebDataDisplayProps {
  report: any;
  monthlyData: any[];
  onUpdate?: () => void;
}

export function SimilarwebDataDisplay({ report, monthlyData, onUpdate }: SimilarwebDataDisplayProps) {
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold" style={{ fontWeight: 600 }}>
          Similarweb Report
        </h3>
        {report.report_period_start && report.report_period_end && (
          <span className="text-sm text-muted-foreground">
            {formatDate(report.report_period_start)} - {formatDate(report.report_period_end)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {report.total_visits !== null && report.total_visits !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Visits</div>
            <div className="text-xl font-bold">{formatNumber(report.total_visits)}</div>
          </div>
        )}
        
        {report.monthly_visits !== null && report.monthly_visits !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Monthly Visits</div>
            <div className="text-xl font-bold">{formatNumber(report.monthly_visits)}</div>
          </div>
        )}
        
        {report.pages_per_visit !== null && report.pages_per_visit !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Pages/Visit</div>
            <div className="text-xl font-bold">{report.pages_per_visit.toFixed(2)}</div>
          </div>
        )}
        
        {report.bounce_rate !== null && report.bounce_rate !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Bounce Rate</div>
            <div className="text-xl font-bold">{report.bounce_rate.toFixed(1)}%</div>
          </div>
        )}
        
        {report.visit_duration_seconds !== null && report.visit_duration_seconds !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Visit Duration</div>
            <div className="text-xl font-bold">{formatDuration(report.visit_duration_seconds)}</div>
          </div>
        )}
        
        {report.unique_visitors !== null && report.unique_visitors !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Unique Visitors</div>
            <div className="text-xl font-bold">{formatNumber(report.unique_visitors)}</div>
          </div>
        )}
        
        {report.desktop_percentage !== null && report.desktop_percentage !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Desktop</div>
            <div className="text-xl font-bold">{report.desktop_percentage.toFixed(1)}%</div>
          </div>
        )}
        
        {report.mobile_percentage !== null && report.mobile_percentage !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Mobile</div>
            <div className="text-xl font-bold">{report.mobile_percentage.toFixed(1)}%</div>
          </div>
        )}
        
        {report.total_page_views !== null && report.total_page_views !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4 md:col-span-2 lg:col-span-1">
            <div className="text-xs text-muted-foreground mb-1">Total Page Views</div>
            <div className="text-xl font-bold">{formatNumber(report.total_page_views)}</div>
          </div>
        )}
        
        {report.country_rank !== null && report.country_rank !== undefined && (
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="text-xs text-muted-foreground mb-1">Country Rank</div>
            <div className="text-xl font-bold">#{report.country_rank.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Editable Rankings Section */}
      <div className="mt-6">
        <SimilarwebRankingEditor
          reportId={report.id || null}
          toolId={report.tool_id}
          globalRank={report.global_rank}
          countryRank={report.country_rank}
          industryRank={report.industry_rank}
          industry={report.industry}
          onUpdate={onUpdate}
        />
      </div>

      {monthlyData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3" style={{ fontWeight: 600 }}>
            Monthly Breakdown
          </h4>
          <div className="bg-secondary/30 rounded-[12px] p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {monthlyData.map((item, index) => (
                <div key={item.id || item.month || `month-${index}`} className="text-center">
                  <div className="text-xs text-muted-foreground">
                    {formatDate(item.month)}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {formatNumber(item.visits)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


