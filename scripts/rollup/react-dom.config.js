import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';
import { resolvePkgPath, getPackageJson } from './utils';
import { getBaseRollupConfig } from './utils';

const { name, module, peerDependencies } = getPackageJson('react-dom');
const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);

export default [
  // ReactDom包
  {
    input: `${pkgPath}/${module}`,
    output: [
      {
        file: `${pkgDistPath}/index.js`,
        name: 'ReactDOM',
        format: 'umd',
      },
      {
        file: `${pkgDistPath}/client.js`,
        name: 'ReactDOM',
        format: 'umd',
      },
    ],
    external: [...Object.keys(peerDependencies)],
    plugins: [
      ...getBaseRollupConfig(),
      alias({
        entries: {
          hostConfig: `${pkgPath}/src/hostConfig.ts`,
        },
      }),
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, version, description }) => ({
          name,
          version,
          description,
          peerDependencies: {
            'react ': version,
          },
          main: 'index.js',
        }),
      }),
    ],
  },
];
