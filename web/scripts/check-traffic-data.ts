/**
 * Check if traffic data columns exist and show current data for a tool
 * 
 * Run with: npx tsx scripts/check-traffic-data.ts cursor
 */

import { supabase } from '../src/lib/supabaseClient';

async function checkTrafficData(toolSlug: string) {
  console.log(`🔍 Checking traffic data for tool: ${toolSlug}\n`);

  try {
    // Check if columns exist by trying to select them
    const { data, error } = await supabase
      .from('tools')
      .select(`
        id,
        name,
        slug,
        website_url,
        monthly_visits,
        unique_visitors,
        bounce_rate,
        avg_visit_duration,
        pages_per_visit,
        traffic_data,
        traffic_data_updated_at,
        seo_score,
        seo_data,
        seo_data_updated_at
      `)
      .eq('slug', toolSlug)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('column')) {
        console.error('❌ Database columns missing!');
        console.error('   Error:', error.message);
        console.error('   Hint:', error.hint);
        console.error('\n📋 Please run migration 005:');
        console.error('   See APPLY_MIGRATION.md for instructions\n');
        return;
      }
      throw error;
    }

    if (!data) {
      console.log(`❌ Tool "${toolSlug}" not found`);
      return;
    }

    console.log(`✅ Tool found: ${data.name}`);
    console.log(`   Website: ${data.website_url || 'N/A'}\n`);

    console.log('📊 Traffic Data:');
    console.log(`   monthly_visits: ${data.monthly_visits ?? 'NULL'}`);
    console.log(`   unique_visitors: ${data.unique_visitors ?? 'NULL'}`);
    console.log(`   bounce_rate: ${data.bounce_rate ?? 'NULL'}`);
    console.log(`   avg_visit_duration: ${data.avg_visit_duration ?? 'NULL'}`);
    console.log(`   pages_per_visit: ${data.pages_per_visit ?? 'NULL'}`);
    console.log(`   traffic_data_updated_at: ${data.traffic_data_updated_at ?? 'NULL'}`);
    console.log(`   seo_score: ${data.seo_score ?? 'NULL'}`);
    console.log(`   seo_data_updated_at: ${data.seo_data_updated_at ?? 'NULL'}`);

    if (data.traffic_data) {
      console.log('\n📦 Raw traffic_data (JSON):');
      console.log(JSON.stringify(data.traffic_data, null, 2));
    } else {
      console.log('\n⚠️  No traffic_data JSON found');
    }

    if (data.seo_data) {
      console.log('\n📦 SEO data structure:');
      console.log(`   Has traffic: ${!!data.seo_data.traffic}`);
      console.log(`   Has backlinks: ${!!data.seo_data.backlinks}`);
      console.log(`   Has ranked_keywords: ${!!data.seo_data.ranked_keywords}`);
      if (data.seo_data.traffic) {
        console.log(`   Traffic visits: ${data.seo_data.traffic.visits ?? 'N/A'}`);
      }
    } else {
      console.log('\n⚠️  No seo_data JSON found');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

const toolSlug = process.argv[2] || 'cursor';
checkTrafficData(toolSlug);


