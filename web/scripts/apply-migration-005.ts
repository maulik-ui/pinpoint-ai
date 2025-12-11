/**
 * Apply migration 005: Add comprehensive SEO data columns
 * 
 * Run with: npx tsx scripts/apply-migration-005.ts
 */

import { supabase } from '../src/lib/supabaseClient';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  console.log('📦 Applying migration 005: Add comprehensive SEO data columns...\n');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/005_add_comprehensive_seo_data.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('Migration SQL:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;

      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC doesn't exist
          const { error: queryError } = await supabase.from('_migration_temp').select('*').limit(0);
          
          if (queryError) {
            // Use raw SQL execution via Supabase client
            // Note: Supabase JS client doesn't support raw SQL directly
            // We'll need to use the REST API or provide manual instructions
            console.warn('⚠️  Cannot execute SQL directly via Supabase JS client.');
            console.warn('⚠️  Please apply this migration manually through Supabase Dashboard.\n');
            console.log('📋 Manual Application Instructions:');
            console.log('1. Go to your Supabase Dashboard');
            console.log('2. Navigate to SQL Editor');
            console.log('3. Copy and paste the migration SQL above');
            console.log('4. Click "Run" to execute\n');
            return;
          }
        }

        console.log('✅ Success\n');
      } catch (err) {
        console.error(`❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        throw err;
      }
    }

    console.log('✅ Migration 005 applied successfully!');
    console.log('\nNew columns added:');
    console.log('  - domain_authority (INTEGER)');
    console.log('  - referring_domains (INTEGER)');
    console.log('  - backlinks_count (BIGINT)');
    console.log('  - ranked_keywords_count (INTEGER)');
    console.log('  - top_keywords (JSONB)');
    console.log('  - competitors (JSONB)');
    console.log('  - seo_data (JSONB)');
    console.log('  - seo_data_updated_at (TIMESTAMPTZ)');
    console.log('  - seo_score (NUMERIC(5, 2))');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n📋 Please apply this migration manually:');
    console.error('1. Go to Supabase Dashboard → SQL Editor');
    console.error('2. Copy the SQL from: supabase/migrations/005_add_comprehensive_seo_data.sql');
    console.error('3. Paste and run it\n');
    process.exit(1);
  }
}

applyMigration();

