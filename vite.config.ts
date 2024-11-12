import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './src/index.html'
      }
    }
  },
  plugins: [{
    name: 'copy-files',
    writeBundle() {

      const files = [
        'capacitorBLE.js',
        'emModule.js',
        'gpSupport.js',
        'microblocksCN.js',
        'FileSaver.js',
        'gp_wasm.js',
        'gp_wasm.wasm',
        'gp_wasm.data'
      ];
      
      files.forEach(file => {
        try {
          fs.copyFileSync(
            resolve(__dirname, `src/${file}`),
            resolve(__dirname, `dist/${file}`)
          );
          console.log(`Copied: ${file}`);
        } catch (err) {
          console.error(`Error copying ${file}:`, err);
        }
      });

      function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = resolve(src, entry.name);
          const destPath = resolve(dest, entry.name);

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${entry.name}`);
          }
        }
      }

      // copy boardie directory
      const srcBoardieDir = resolve(__dirname, 'src/boardie');
      const destBoardieDir = resolve(__dirname, 'dist/boardie');
      try {
        copyDir(srcBoardieDir, destBoardieDir);
        console.log('Boardie directory copied successfully');
      } catch (err) {
        console.error('Error copying boardie directory:', err);
      }
    }
  }]
});
