import path from 'path';
import tsConfigPaths from 'tsconfig-paths';
import tsConfig from './tsconfig.json';

const explicitParams = {
  baseUrl: path.resolve('dist/'),
  paths: tsConfig.compilerOptions.paths,
};

tsConfigPaths.register(explicitParams);
