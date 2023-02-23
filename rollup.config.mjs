import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
const config = [
  // component and manager together
  {
    input: 'build/index.js',
    output: {
      file: 'index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['react'],
    plugins: [typescript()]
  },
  // component split into its one bundle
  {
    input: 'build/component.js',
    output: {
      file: 'component.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['react'],
    plugins: [typescript()]
  },
  // manager split into its own bundle
  {
    input: 'build/manager.js',
    output: {
      file: 'manager.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['react'],
    plugins: [typescript()]
  },
  {
    input: 'build/index.d.ts',
    output: {
      file: 'index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
export default config;