/**
 * Sync Design Tokens from Figma
 * 
 * This script extracts design tokens from your Figma file and syncs them to your codebase.
 * 
 * Usage:
 *   node scripts/sync-figma-tokens.js
 * 
 * Prerequisites:
 *   1. Set FIGMA_API_TOKEN in .env.local
 *   2. Set FIGMA_FILE_KEY in .env.local
 *   3. In Figma, create frames named:
 *      - "Colors" (with color swatches)
 *      - "Typography" (with text samples)
 *      - "Spacing" (with spacing examples)
 */

import {
  extractColorTokens,
  extractTypographyTokens,
  extractSpacingTokens,
  generateCSSVariables,
} from '../lib/figma-sync';

interface SyncOptions {
  colorFrameName?: string;
  typographyFrameName?: string;
  spacingFrameName?: string;
  outputPath?: string;
  dryRun?: boolean;
}

/**
 * Main sync function
 */
async function syncTokens(options: SyncOptions = {}) {
  const {
    colorFrameName = 'Colors',
    typographyFrameName = 'Typography',
    spacingFrameName = 'Spacing',
    outputPath = './styles/figma-tokens.css',
    dryRun = false,
  } = options;

  console.log('🎨 Starting Figma token sync...\n');

  try {
    // Extract tokens from Figma
    console.log('📥 Extracting color tokens...');
    const colors = await extractColorTokens(colorFrameName);
    console.log(`   Found ${Object.keys(colors).length} colors`);

    console.log('📥 Extracting typography tokens...');
    const typography = await extractTypographyTokens(typographyFrameName);
    console.log(`   Found ${Object.keys(typography).length} typography styles`);

    console.log('📥 Extracting spacing tokens...');
    const spacing = await extractSpacingTokens(spacingFrameName);
    console.log(`   Found ${Object.keys(spacing).length} spacing values\n`);

    // Generate CSS
    const tokens = {
      colors,
      typography,
      spacing,
      radii: {}, // Add if you extract border radii
    };

    const css = generateCSSVariables(tokens);

    // Output results
    console.log('✨ Generated CSS Variables:\n');
    console.log(css);

    if (!dryRun) {
      // In a real environment, you would write this to a file
      // For Figma Make, we'll just log it
      console.log(`\n💾 Would save to: ${outputPath}`);
      console.log('\n📝 To save this output:');
      console.log('   1. Copy the CSS above');
      console.log('   2. Create a new file in /styles/figma-tokens.css');
      console.log('   3. Import it in your globals.css: @import "figma-tokens.css";');
    }

    console.log('\n✅ Sync complete!');
    
    return { colors, typography, spacing, css };

  } catch (error) {
    console.error('❌ Error syncing tokens:', error);
    throw error;
  }
}

/**
 * Display comparison with current tokens
 */
async function compareWithCurrent() {
  console.log('\n📊 Comparing with current implementation...\n');
  
  // Current tokens from your globals.css
  const currentColors = {
    'background': '#F5F2EB',
    'foreground': '#3D3834',
    'card': '#FDFCFA',
    'primary': '#6E7E55',
    'secondary': '#EFE9E4',
    'muted': '#E8E2DC',
    'accent': '#AFC1A1',
    'destructive': '#C46A4A',
  };

  const figmaColors = await extractColorTokens();
  
  console.log('Colors in current CSS:', Object.keys(currentColors).length);
  console.log('Colors in Figma:', Object.keys(figmaColors).length);
  
  // Find new colors
  const newColors = Object.keys(figmaColors).filter(
    key => !(key in currentColors)
  );
  
  if (newColors.length > 0) {
    console.log('\n🆕 New colors in Figma:');
    newColors.forEach(key => {
      console.log(`   ${key}: ${figmaColors[key]}`);
    });
  }
  
  // Find changed colors
  const changedColors = Object.keys(figmaColors).filter(
    key => key in currentColors && currentColors[key] !== figmaColors[key]
  );
  
  if (changedColors.length > 0) {
    console.log('\n🔄 Changed colors:');
    changedColors.forEach(key => {
      console.log(`   ${key}:`);
      console.log(`      Current: ${currentColors[key]}`);
      console.log(`      Figma:   ${figmaColors[key]}`);
    });
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';

  switch (command) {
    case 'sync':
      await syncTokens({ dryRun: args.includes('--dry-run') });
      break;
      
    case 'compare':
      await compareWithCurrent();
      break;
      
    case 'help':
      console.log(`
Figma Token Sync Script

Commands:
  sync [--dry-run]    Sync tokens from Figma (default)
  compare             Compare Figma tokens with current implementation
  help                Show this help message

Environment Variables:
  FIGMA_API_TOKEN     Your Figma personal access token
  FIGMA_FILE_KEY      The file key from your Figma URL

Example:
  node scripts/sync-figma-tokens.js sync
  node scripts/sync-figma-tokens.js sync --dry-run
  node scripts/sync-figma-tokens.js compare
      `);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run with "help" for usage information');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { syncTokens, compareWithCurrent };
