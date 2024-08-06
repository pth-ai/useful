import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'lib/index.ts', // Your library's entry point
    output: [
        {file: 'dist/index.js', format: 'cjs', sourcemap: true},
        {file: 'dist/index.esm.js', format: 'esm', sourcemap: true},
    ],
    plugins: [typescript(), resolve(), commonjs(),],
};
