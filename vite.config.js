import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'pdf.worker.js') {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf', 'pdfjs-dist/build/pdf.worker.entry']
  }
});




//default
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// export default defineConfig({
//  plugins: [react()],
// })
