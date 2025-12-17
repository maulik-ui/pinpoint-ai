#!/usr/bin/env tsx
/**
 * CLI script to sync design tokens from Figma
 * 
 * Usage:
 *   npm run sync:figma
 *   npm run sync:figma -- --file-key=YOUR_KEY
 */

import { syncDesignTokens } from '../src/lib/figmaSyncService';
import { writeFileSync } from 'fs';
import { join } from 'path';

const fileKey = process.env.FIGMA_FILE_KEY || process.argv.find(arg => arg.startsWith('--file-key='))?.split('=')[1];

if (!fileKey) {
  console.error('❌ Error: FIGMA_FILE_KEY not set');
  console.log('\nUsage:');
  console.log('  Set FIGMA_FILE_KEY in .env.local, or');
  console.log('  npm run sync:figma -- --file-key=YOUR_KEY');
  process.exit(1);
}

async function main() {
  console.log('🔄 Syncing design tokens from Figma...');
  console.log(`📁 File Key: ${fileKey}\n`);

  try {
    if (!fileKey) {
      console.error("Error: FIGMA_FILE_KEY environment variable is not set");
      process.exit(1);
    }
    
    const result = await syncDesignTokens({
      fileKey,
      generateCSS: true,
    });

    console.log('✅ Sync successful!\n');
    console.log('📊 Token Summary:');
    console.log(`   Colors: ${result.metadata.tokenCounts.colors}`);
    console.log(`   Typography: ${result.metadata.tokenCounts.typography}`);
    console.log(`   Spacing: ${result.metadata.tokenCounts.spacing}`);
    console.log(`   File: ${result.metadata.fileName}`);
    console.log(`   Last Modified: ${new Date(result.metadata.lastModified).toLocaleString()}\n`);

    // Save CSS file
    if (result.css) {
      const cssPath = join(process.cwd(), 'styles', 'figma-tokens.css');
      writeFileSync(cssPath, result.css, 'utf-8');
      console.log(`💾 CSS saved to: ${cssPath}`);
    }

    // Save tokens JSON
    const tokensPath = join(process.cwd(), 'styles', 'figma-tokens.json');
    writeFileSync(tokensPath, JSON.stringify(result.tokens, null, 2), 'utf-8');
    console.log(`💾 Tokens JSON saved to: ${tokensPath}`);

    console.log('\n✨ Done!');
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();

