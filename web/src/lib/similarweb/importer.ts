import { supabase } from '../supabaseClient';
import { ParsedSimilarwebData } from './parser';

export async function importSimilarwebData(
  toolId: string,
  parsedData: ParsedSimilarwebData
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  // Determine report period
  let reportPeriodStart: string | null = null;
  let reportPeriodEnd: string | null = null;
  
  if (parsedData.reportPeriodStart) {
    reportPeriodStart = parsedData.reportPeriodStart;
  }
  if (parsedData.reportPeriodEnd) {
    reportPeriodEnd = parsedData.reportPeriodEnd;
  }
  
  // If we have monthly data, infer period from it
  if (!reportPeriodStart && parsedData.monthlyData && parsedData.monthlyData.length > 0) {
    const sorted = [...parsedData.monthlyData].sort((a, b) => a.month.localeCompare(b.month));
    reportPeriodStart = sorted[0].month;
    reportPeriodEnd = sorted[sorted.length - 1].month;
  }
  
  // Helper function to store data in JSON fallback
  const storeInJsonFallback = async () => {
    // Store monthly data as JSON in domain_data JSONB column
    const { data: toolData } = await supabase
      .from('tools')
      .select('domain_data')
      .eq('id', toolId)
      .single();
    
    const domainData = toolData?.domain_data || {};
    const existingMonthlyData = domainData.similarweb_monthly_data || [];
    
    // Merge new monthly data, avoiding duplicates
    const existingMonths = new Set(existingMonthlyData.map((item: any) => item.month));
    const newMonthlyData = (parsedData.monthlyData || []).filter(item => !existingMonths.has(item.month));
    const mergedMonthlyData = [...existingMonthlyData, ...newMonthlyData].sort((a, b) => 
      a.month.localeCompare(b.month)
    );
    
    // Also store summary metrics in domain_data
    const similarwebSummary: any = {};
    if (parsedData.totalVisits) similarwebSummary.total_visits = parsedData.totalVisits;
    if (parsedData.monthlyVisits) similarwebSummary.monthly_visits = parsedData.monthlyVisits;
    if (parsedData.bounceRate) similarwebSummary.bounce_rate = parsedData.bounceRate;
    if (parsedData.pagesPerVisit) similarwebSummary.pages_per_visit = parsedData.pagesPerVisit;
    if (parsedData.globalRank) similarwebSummary.global_rank = parsedData.globalRank;
    if (parsedData.industryRank) similarwebSummary.industry_rank = parsedData.industryRank;
    
    const updatedDomainData = {
      ...domainData,
      similarweb_monthly_data: mergedMonthlyData,
      similarweb_summary: similarwebSummary,
    };
    
    const { error: updateError } = await supabase
      .from('tools')
      .update({ domain_data: updatedDomainData })
      .eq('id', toolId);
    
    if (updateError) {
      throw new Error(`Failed to store data: ${updateError.message}`);
    }
    
    return { success: true };
  };
  
  // Try to use database tables, but fall back to JSON storage if tables don't exist or have wrong schema
  try {
    // Tables exist with correct schema - use normal database flow
    // Check for existing reports for the same period
    let existingReportId: string | null = null;
    
    if (reportPeriodStart && reportPeriodEnd) {
      const { data: existingReports } = await supabase
        .from('similarweb_reports')
        .select('id')
        .eq('tool_id', toolId)
        .eq('report_period_start', reportPeriodStart)
        .eq('report_period_end', reportPeriodEnd)
        .limit(1);
      
      if (existingReports && existingReports.length > 0) {
        existingReportId = existingReports[0].id;
      }
    }
    
    // Prepare report data - only include fields that have values
    const reportData: any = {
      tool_id: toolId,
      report_period_start: reportPeriodStart || null,
      report_period_end: reportPeriodEnd || null,
      updated_at: new Date().toISOString(),
    };
    
    // Only update fields that are provided and not null/undefined/0
    if (parsedData.totalVisits !== undefined && parsedData.totalVisits !== null && parsedData.totalVisits !== 0) {
      reportData.total_visits = parsedData.totalVisits;
    }
    if (parsedData.monthlyVisits !== undefined && parsedData.monthlyVisits !== null && parsedData.monthlyVisits !== 0) {
      reportData.monthly_visits = parsedData.monthlyVisits;
    }
    if (parsedData.pagesPerVisit !== undefined && parsedData.pagesPerVisit !== null && parsedData.pagesPerVisit !== 0) {
      reportData.pages_per_visit = parsedData.pagesPerVisit;
    }
    if (parsedData.bounceRate !== undefined && parsedData.bounceRate !== null && parsedData.bounceRate !== 0) {
      reportData.bounce_rate = parsedData.bounceRate;
    }
    if (parsedData.visitDurationSeconds !== undefined && parsedData.visitDurationSeconds !== null && parsedData.visitDurationSeconds !== 0) {
      reportData.visit_duration_seconds = parsedData.visitDurationSeconds;
    }
    if (parsedData.avgVisitDurationSeconds !== undefined && parsedData.avgVisitDurationSeconds !== null && parsedData.avgVisitDurationSeconds !== 0) {
      reportData.avg_visit_duration_seconds = parsedData.avgVisitDurationSeconds;
    }
    // Note: uniqueVisitors, desktopPercentage, mobilePercentage, and totalPageViews are not in ParsedSimilarwebData interface
    // If needed, add them to the interface first
    if (parsedData.globalRank !== undefined && parsedData.globalRank !== null && parsedData.globalRank !== 0) {
      reportData.global_rank = parsedData.globalRank;
    }
    if (parsedData.countryRank !== undefined && parsedData.countryRank !== null && parsedData.countryRank !== 0) {
      reportData.country_rank = parsedData.countryRank;
    }
    if (parsedData.industryRank !== undefined && parsedData.industryRank !== null && parsedData.industryRank !== 0) {
      reportData.industry_rank = parsedData.industryRank;
    }
    if (parsedData.industry !== undefined && parsedData.industry !== null && parsedData.industry !== '') {
      reportData.industry = parsedData.industry;
    }
    
    // Upsert the report
    let reportId: string;
    
    if (existingReportId) {
      // Update existing report - merge data (only update fields that are null/undefined/0 in existing)
      const { data: existingReport } = await supabase
        .from('similarweb_reports')
        .select('*')
        .eq('id', existingReportId)
        .single();
      
      if (existingReport) {
        // Only update fields that are currently null/undefined/0 in the existing report
        const updateData: any = { updated_at: new Date().toISOString() };
        
        Object.keys(reportData).forEach(key => {
          if (key !== 'tool_id' && key !== 'report_period_start' && key !== 'report_period_end' && key !== 'updated_at') {
            const existingValue = existingReport[key];
            const newValue = reportData[key];
            
            // Skip if new value is null/undefined/0/empty
            if (newValue === null || newValue === undefined || newValue === 0 || newValue === '') {
              return;
            }
            
            // For rank fields (global_rank, country_rank, industry_rank, industry), always update if new value is provided
            // This allows PDF uploads to add/update ranks
            const isRankField = ['global_rank', 'country_rank', 'industry_rank', 'industry'].includes(key);
            
            if (isRankField) {
              // Always update rank fields if new value is valid
              updateData[key] = newValue;
            } else {
              // For metrics (pages_per_visit, bounce_rate, etc.), always update if new value is provided
              // This ensures Excel uploads can update metrics even if they were previously set
              // Only skip if existing value is already set and new value is the same (to avoid unnecessary updates)
              if (existingValue === null || existingValue === undefined || existingValue === 0 || existingValue !== newValue) {
                updateData[key] = newValue;
              }
            }
          }
        });
        
        const { error: updateError } = await supabase
          .from('similarweb_reports')
          .update(updateData)
          .eq('id', existingReportId);
        
        if (updateError) {
          throw new Error(`Failed to update report: ${updateError.message}`);
        }
        
        reportId = existingReportId;
      } else {
        // Fallback: create new report
        const { data: newReport, error: insertError } = await supabase
          .from('similarweb_reports')
          .insert(reportData)
          .select('id')
          .single();
        
        if (insertError) {
          throw new Error(`Failed to create report: ${insertError.message}`);
        }
        
        reportId = newReport.id;
      }
    } else {
      // Create new report
      const { data: newReport, error: insertError } = await supabase
        .from('similarweb_reports')
        .insert(reportData)
        .select('id')
        .single();
      
      if (insertError) {
        throw new Error(`Failed to create report: ${insertError.message}`);
      }
      
      reportId = newReport.id;
    }
    
    // Import monthly data
    if (parsedData.monthlyData && parsedData.monthlyData.length > 0) {
      try {
        // Get existing monthly data for this report to avoid duplicates
        const { data: existingMonthly } = await supabase
          .from('similarweb_monthly_data')
          .select('month')
          .eq('report_id', reportId);
        
        const existingMonths = new Set((existingMonthly || []).map((item: any) => item.month));
        
        // Only insert new monthly data
        const monthlyDataToInsert = parsedData.monthlyData
          .filter(item => !existingMonths.has(item.month))
          .map(item => ({
            report_id: reportId,
            tool_id: toolId,
            month: item.month,
            visits: item.visits,
          }));
        
        if (monthlyDataToInsert.length > 0) {
          const { error: monthlyError } = await supabase
            .from('similarweb_monthly_data')
            .insert(monthlyDataToInsert);
          
          if (monthlyError) {
            console.error('Failed to insert monthly data:', monthlyError);
            // Don't throw - report was created successfully
          }
        }
      } catch (err) {
        console.error('Error inserting monthly data (table may not exist):', err);
        // Continue - monthly data insertion is optional
      }
    }
    
    return { success: true, reportId };
  } catch (error: any) {
    // If database operation fails due to schema/column issues, fall back to JSON storage
    if (error.message && (
      error.message.includes('column') || 
      error.message.includes('schema cache') ||
      error.message.includes('does not exist') ||
      error.message.includes('relation') ||
      error.code === '42703' // PostgreSQL column does not exist error
    )) {
      console.warn('Database schema issue detected, falling back to JSON storage:', error.message);
      try {
        return await storeInJsonFallback();
      } catch (jsonError: any) {
        return {
          success: false,
          error: `Failed to store data: ${jsonError.message || 'Unknown error'}`
        };
      }
    }
    // For other errors, log and return error
    console.error('Error importing Similarweb data:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to import Similarweb data' 
    };
  }
}
