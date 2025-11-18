import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Input brain image (existing JPG in repo root)
const projectRoot = path.resolve(__dirname, '..');
const source = path.resolve(projectRoot, '..', 'Brain_human_anatomy_biology_organ_body_system_health_care_and_medical_hand_drawn_cartoon_art_illustration.jpg');
const assetsDir = path.resolve(projectRoot, 'assets');

const ICON_SIZE = 1024; // Expo recommended
const ZOOM_FACTOR = 1.15; // ~15% zoom-in

async function ensureAssetsDir() {
  await fs.promises.mkdir(assetsDir, { recursive: true });
}

async function generateIcon(outputPath: string) {
  // Load source, trim surrounding whitespace, then zoom-crop and resize into 1024x1024 canvas
  const img = sharp(source);

  // Autotrim borders (works best with solid white margin)
  const trimmed = img.trim();

  // Get metadata after trim to compute zoom crop
  const meta = await trimmed.metadata();
  const width = meta.width || ICON_SIZE;
  const height = meta.height || ICON_SIZE;

  // Compute crop box with 15% zoom-in
  const cropWidth = Math.round(width / ZOOM_FACTOR);
  const cropHeight = Math.round(height / ZOOM_FACTOR);
  const left = Math.max(0, Math.floor((width - cropWidth) / 2));
  const top = Math.max(0, Math.floor((height - cropHeight) / 2));

  const composited = await trimmed
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(ICON_SIZE, ICON_SIZE, { fit: 'cover' })
    .png()
    .toBuffer();

  await fs.promises.writeFile(outputPath, composited);
}

async function main() {
  if (!fs.existsSync(source)) {
    console.error('Source image not found:', source);
    process.exit(1);
  }
  await ensureAssetsDir();

  const iconOut = path.resolve(assetsDir, 'icon.png');
  const adaptiveOut = path.resolve(assetsDir, 'adaptive-icon.png');

  await generateIcon(iconOut);
  await generateIcon(adaptiveOut);

  console.log('Generated icons:');
  console.log(' -', iconOut);
  console.log(' -', adaptiveOut);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


