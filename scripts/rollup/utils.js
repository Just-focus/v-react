import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePakPath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`;
  }
  return `${pkgPath}/${pkgName}`;
}

export function getPackageJson(pkgName) {
  const path = `${resolvePakPath(pkgName, false)}/package.json`;
  const str = fs.readFileSync(path, 'utf-8');
  return JSON.parse(str);
}

export function getBaseRollupConfig({ typescript = {} } = {}) {
  return [cjs(), ts(typescript)];
}
