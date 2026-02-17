import generatePackageJson from 'rollup-plugin-generate-package-json';
import { resolvePakPath, getPackageJson } from './utils';
import { getBaseRollupConfig } from './utils';

const { name, module } = getPackageJson('react');
const pkgPath = resolvePakPath(name);
const pkgDistPath = resolvePakPath(name, true);

export default [
  // React包
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'React',
      format: 'umd',
    },
    plugins: [
      ...getBaseRollupConfig(),
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, version, description }) => ({
          name,
          version,
          description,
          main: 'index.js',
        }),
      }),
    ],
  },
  // jsx-runtime包
  {
    input: `${pkgPath}/src/jsx.ts`,
    output: [
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: 'ReactJSXRuntime',
        format: 'umd',
      },
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: 'ReactJSXDevRuntime',
        format: 'umd',
      },
    ],
    plugins: getBaseRollupConfig(),
  },
];
