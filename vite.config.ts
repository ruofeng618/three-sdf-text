import { defineConfig } from 'vite'
import { resolve } from "path";
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname,'src/index.ts'),
      name: 'SdfFontRender',
      fileName: ()=>'SdfFontRender.js',
      formats: ["umd",'es'],
    },
    minify:false
    // chunkSizeWarningLimit: 2048,
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       three: ["three"],
    //     },
    //   },
    // },
  },
})
