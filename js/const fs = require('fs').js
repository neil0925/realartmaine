const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    const imagesDir = path.join(process.cwd(), 'images');
    const outFile = path.join(process.cwd(), 'images.json');

    const entries = await fs.readdir(imagesDir, { withFileTypes: true });
    const exts = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;

    const files = entries
      .filter(e => e.isFile() && exts.test(e.name))
      .map(e => `images/${e.name}`);

    // Optionally sort alphabetically for stable output
    files.sort((a,b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    await fs.writeFile(outFile, JSON.stringify(files, null, 2), 'utf8');
    console.log(`Wrote ${files.length} entries to images.json`);
    process.exit(0);
  } catch (err) {
    console.error('Error generating images.json:', err);
    process.exit(2);
  }
})();
