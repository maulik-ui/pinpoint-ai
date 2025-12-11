/**
 * Download Assets from Figma
 * 
 * This script downloads images, icons, and other assets from your Figma file.
 * 
 * Usage:
 *   node scripts/download-figma-assets.js [frameName] [--format png|jpg|svg]
 * 
 * Example:
 *   node scripts/download-figma-assets.js "Assets" --format svg
 */

import { downloadAssets, exportFrames } from '../lib/figma-sync';
import { getFigmaImages } from '../lib/figma';

interface DownloadOptions {
  frameName?: string;
  format?: 'png' | 'jpg' | 'svg';
  outputDir?: string;
  scale?: number;
}

/**
 * Download all assets from a specific frame
 */
async function downloadAssetsFromFrame(options: DownloadOptions = {}) {
  const {
    frameName = 'Assets',
    format = 'png',
    outputDir = '/public/assets',
    scale = 2,
  } = options;

  console.log('📦 Downloading assets from Figma...\n');
  console.log(`   Frame: ${frameName}`);
  console.log(`   Format: ${format}`);
  console.log(`   Output: ${outputDir}`);
  console.log(`   Scale: ${scale}x\n`);

  try {
    // Get assets from the frame
    const assets = await downloadAssets(frameName, outputDir);

    if (assets.length === 0) {
      console.log('⚠️  No assets found in the specified frame');
      console.log('\nTip: Make sure you have a frame named "Assets" in your Figma file');
      console.log('     with components, icons, or images you want to export');
      return;
    }

    console.log(`Found ${assets.length} assets:\n`);

    // Display asset information
    assets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.name}`);
      console.log(`   URL: ${asset.url}`);
      console.log(`   Node ID: ${asset.nodeId}\n`);
    });

    console.log('✅ Asset URLs generated!');
    console.log('\n📝 Next steps:');
    console.log('   1. Copy the URLs above');
    console.log('   2. Download each image manually or use a script');
    console.log('   3. Save them to your /public/assets folder');
    console.log('\nOr use the provided asset manifest to automate downloads.');

    return assets;

  } catch (error) {
    console.error('❌ Error downloading assets:', error);
    throw error;
  }
}

/**
 * Download specific frames as images (for documentation, mockups, etc.)
 */
async function downloadFramesAsImages(
  frameNames: string[],
  format: 'png' | 'jpg' | 'svg' = 'png'
) {
  console.log('🖼️  Exporting frames as images...\n');

  try {
    const images = await exportFrames(frameNames, format);

    console.log(`Exported ${Object.keys(images).length} frames:\n`);

    Object.entries(images).forEach(([nodeId, url]) => {
      const frameName = frameNames.find(name => images[nodeId]); // Simplified
      console.log(`   ${frameName || nodeId}: ${url}\n`);
    });

    console.log('✅ Frame export complete!');
    return images;

  } catch (error) {
    console.error('❌ Error exporting frames:', error);
    throw error;
  }
}

/**
 * Download icons specifically
 */
async function downloadIcons(options: DownloadOptions = {}) {
  const {
    frameName = 'Icons',
    format = 'svg',
    outputDir = '/public/icons',
  } = options;

  console.log('🎨 Downloading icons from Figma...\n');

  try {
    const icons = await downloadAssets(frameName, outputDir);

    if (icons.length === 0) {
      console.log('⚠️  No icons found');
      console.log('\nTip: Create a frame named "Icons" in Figma with your icon components');
      return;
    }

    // Get SVG versions if possible
    const nodeIds = icons.map(icon => icon.nodeId);
    const { images } = await getFigmaImages(nodeIds, format as any);

    console.log(`Found ${icons.length} icons:\n`);

    icons.forEach((icon, index) => {
      const url = images[icon.nodeId];
      console.log(`${index + 1}. ${icon.name}`);
      console.log(`   SVG: ${url}\n`);
    });

    console.log('✅ Icons ready to download!');
    return icons;

  } catch (error) {
    console.error('❌ Error downloading icons:', error);
    throw error;
  }
}

/**
 * Generate asset manifest (JSON file listing all assets)
 */
async function generateAssetManifest(frameName: string = 'Assets') {
  console.log('📋 Generating asset manifest...\n');

  try {
    const assets = await downloadAssets(frameName);

    const manifest = {
      generatedAt: new Date().toISOString(),
      source: 'Figma',
      totalAssets: assets.length,
      assets: assets.map(asset => ({
        name: asset.name,
        filename: `${asset.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        url: asset.url,
        nodeId: asset.nodeId,
      })),
    };

    console.log('Asset Manifest:');
    console.log(JSON.stringify(manifest, null, 2));

    console.log('\n✅ Manifest generated!');
    console.log('\n📝 Save this as asset-manifest.json in your project');

    return manifest;

  } catch (error) {
    console.error('❌ Error generating manifest:', error);
    throw error;
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'assets';
  const frameName = args[1] || 'Assets';
  const formatFlag = args.find(arg => arg.startsWith('--format='));
  const format = formatFlag ? formatFlag.split('=')[1] as 'png' | 'jpg' | 'svg' : 'png';

  switch (command) {
    case 'assets':
      await downloadAssetsFromFrame({ frameName, format });
      break;

    case 'icons':
      await downloadIcons({ frameName: frameName || 'Icons', format: 'svg' });
      break;

    case 'frames':
      const frameNames = args.slice(1).filter(arg => !arg.startsWith('--'));
      if (frameNames.length === 0) {
        console.error('Please specify frame names to export');
        process.exit(1);
      }
      await downloadFramesAsImages(frameNames, format);
      break;

    case 'manifest':
      await generateAssetManifest(frameName);
      break;

    case 'help':
      console.log(`
Figma Asset Download Script

Commands:
  assets [frameName] [--format=png|jpg|svg]
      Download all assets from a frame (default: "Assets")
      
  icons [frameName] [--format=svg]
      Download icons specifically (default frame: "Icons")
      
  frames <frame1> <frame2> ... [--format=png|jpg|svg]
      Export specific frames as images
      
  manifest [frameName]
      Generate a JSON manifest of all assets
      
  help
      Show this help message

Examples:
  node scripts/download-figma-assets.js assets
  node scripts/download-figma-assets.js assets "My Assets" --format=svg
  node scripts/download-figma-assets.js icons
  node scripts/download-figma-assets.js frames "Homepage" "Dashboard" --format=png
  node scripts/download-figma-assets.js manifest

Environment Variables:
  FIGMA_API_TOKEN     Your Figma personal access token
  FIGMA_FILE_KEY      The file key from your Figma URL
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

export {
  downloadAssetsFromFrame,
  downloadFramesAsImages,
  downloadIcons,
  generateAssetManifest,
};
