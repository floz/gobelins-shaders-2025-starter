import glsl from 'vite-plugin-glsl';

export default {
  plugins: [glsl()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist'
  }
};