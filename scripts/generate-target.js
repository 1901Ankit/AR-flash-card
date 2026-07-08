import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_PATH = resolve(__dirname, "../src/assets/marker/card.jpg");
const OUTPUT_PATH = resolve(__dirname, "../src/assets/marker/target.mind");

if (!existsSync(IMAGE_PATH)) {
  console.error(`\n❌ Image not found: ${IMAGE_PATH}`);
  console.error("\nPlease place your flash card photo at:");
  console.error("  src/assets/marker/card.jpg");
  console.error("\nThen run this script again with:");
  console.error("  npm run generate-marker\n");
  process.exit(1);
}

async function run() {
  let loadImage;
  let OfflineCompiler;
  try {
    ({ loadImage } = await import("canvas"));
    ({ OfflineCompiler } = await import("mind-ar/src/image-target/offline-compiler.js"));
  } catch (err) {
    console.error("\n⚠️  The 'canvas' native module could not be loaded on this machine.");
    console.error("   This is common on Windows if build tools are not installed.");
    console.error("\n✅ Easiest fix: use the online MindAR compiler instead:");
    console.error("   1. Go to https://hiukim.github.io/mind-ar-js-doc/tools/compile");
    console.error("   2. Upload your card image");
    console.error("   3. Download targets.mind and rename it to target.mind");
    console.error("   4. Replace src/assets/marker/target.mind with it\n");
    process.exit(1);
  }

  console.log(`\n🖼️  Loading image: ${IMAGE_PATH}`);
  const image = await loadImage(IMAGE_PATH);

  console.log("⚙️  Compiling MindAR target (this may take a few seconds)...");
  const compiler = new OfflineCompiler();
  await compiler.compileImageTargets([image], (progress) => {
    console.log(`   Progress: ${progress.toFixed(1)}%`);
  });

  const buffer = compiler.exportData();
  await writeFile(OUTPUT_PATH, buffer);

  console.log(`\n✅ Target saved: ${OUTPUT_PATH}`);
  console.log(`   Size: ${(buffer.byteLength / 1024).toFixed(1)} KB`);
  console.log("\nNow restart the dev server and scan your card.\n");
}

run().catch((err) => {
  console.error("\n❌ Failed to compile marker:", err.message);
  console.error(err);
  process.exit(1);
});
