import path from 'path';
import createMD5Hash from './createMD5Hash';
import { genDir, userDir, srcDir } from './dirs';
import { readDir, writeFile } from './fs';

const relSrcDir = path.relative(genDir, srcDir);

type ModuleInfo = {
  modulePath: string;
  displayPath: string;
  varName: string;
};

function buildBindSchemaScript(
  moduleInfoArray: ModuleInfo[],
  moduleType: string,
) {
  return `/* Auto-generated. Do not edit. */
import { ${moduleType} } from '${relSrcDir}/app/types';

${moduleInfoArray.reduce((acc, { modulePath, varName }) => {
  return `${acc}import * as ${varName} from '${modulePath}';
`;
}, '')}
const importedModules: ${moduleType}[] = [
  ${moduleInfoArray
    .map(({ displayPath, varName }) => {
      return `[${varName}, '${displayPath}']`;
    })
    .join(', \n  ')}
];

export default importedModules;
`;
}

function createFileInfo(fileName: string): ModuleInfo {
  const displayPath = path.relative(userDir, fileName);
  const varName = `$${createMD5Hash(displayPath)}`;
  let modulePath = path.relative(genDir, fileName);
  const ext = path.extname(modulePath);

  if (ext.startsWith('.ts')) {
    modulePath = path.join(
      path.dirname(modulePath),
      path.basename(modulePath, ext),
    );
  }

  if (!modulePath.startsWith('.')) {
    // To load files as module instead of package
    modulePath = `./${modulePath}`;
  }

  return { modulePath, displayPath, varName };
}

export default async function generateDeps(
  globPattern: string,
  fileBaseNameToGenerate: string,
  moduleType: string,
) {
  const fileNames = await readDir(globPattern);

  const scriptContent = buildBindSchemaScript(
    fileNames.map(createFileInfo),
    moduleType,
  );

  const fileName = `${fileBaseNameToGenerate}.ts`;

  await writeFile(path.resolve(genDir, fileName), scriptContent);
}
