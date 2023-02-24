import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

const external = ['react', '@concord-consortium/lara-interactive-api'];
const config = [
  // component and manager together
  {
    input: 'build/index.js',
    output: {
      file: 'index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external,
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
    external,
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
    external,
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