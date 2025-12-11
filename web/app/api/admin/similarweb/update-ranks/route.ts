import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, toolId, globalRank, countryRank, industryRank, industry } = body;
    
    if (!reportId && !toolId) {
      return NextResponse.json(
        { error: 'Either reportId or toolId is required' },
        { status: 400 }
      );
    }
    
    // Try to update via reportId first (if tables exist)
    let updateSuccess = false;
    
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (globalRank !== null && globalRank !== undefined) {
        updateData.global_rank = globalRank;
      }
      if (countryRank !== null && countryRank !== undefined) {
        updateData.country_rank = countryRank;
      }
      if (industryRank !== null && industryRank !== undefined) {
        updateData.industry_rank = industryRank;
      }
      if (industry !== null && industry !== undefined) {
        updateData.industry = industry;
      }
      
      if (reportId) {
        const { error } = await supabase
          .from('similarweb_reports')
          .update(updateData)
          .eq('id', reportId);
        
        if (!error) {
          updateSuccess = true;
        }
      } else if (toolId) {
        // Update the most recent report for this tool
        const { data: reports } = await supabase
          .from('similarweb_reports')
          .select('id')
          .eq('tool_id', toolId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (reports && reports.length > 0) {
          const { error } = await supabase
            .from('similarweb_reports')
            .update(updateData)
            .eq('id', reports[0].id);
          
          if (!error) {
            updateSuccess = true;
          }
        }
      }
    } catch (dbError) {
      // Tables don't exist, use JSON fallback
      console.log('Database tables not available, using JSON fallback');
    }
    
    // Fallback: Store in tools.domain_data JSON
    if (!updateSuccess && toolId) {
      const { data: toolData } = await supabase
        .from('tools')
        .select('domain_data')
        .eq('id', toolId)
        .single();
      
      const domainData = toolData?.domain_data || {};
      const similarwebSummary = domainData.similarweb_summary || {};
      
      if (globalRank !== null && globalRank !== undefined) {
        similarwebSummary.global_rank = globalRank;
      }
      if (countryRank !== null && countryRank !== undefined) {
        similarwebSummary.country_rank = countryRank;
      }
      if (industryRank !== null && industryRank !== undefined) {
        similarwebSummary.industry_rank = industryRank;
      }
      if (industry !== null && industry !== undefined) {
        similarwebSummary.industry = industry;
      }
      
      const updatedDomainData = {
        ...domainData,
        similarweb_summary: similarwebSummary,
      };
      
      const { error: updateError } = await supabase
        .from('tools')
        .update({ domain_data: updatedDomainData })
        .eq('id', toolId);
      
      if (updateError) {
        throw new Error(`Failed to update rankings: ${updateError.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Rankings updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating rankings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update rankings' },
      { status: 500 }
    );
  }
}

