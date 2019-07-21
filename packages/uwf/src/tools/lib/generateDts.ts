import ts from 'typescript';
import detectNewline from 'detect-newline';

// import path from "path";
// import { stripComments } from 'jsonc-parser';
// const { compilerOptions } = JSON.parse(stripComments(fs.readFileSync('./tsconfig.json').toString()));
// const input = fs.readFileSync('./packages/uwf/__generated__/routes/index/news.tsx').toString();
// const fileName = path.join(__dirname, './packages/uwf/__generated__/routes/index/news.tsx');

const inputFileName = 'module.tsx';
const options = {
  target: 8,
  module: 6,
  jsx: 1,
  strict: true,
  moduleResolution: 2,
  baseUrl: '.',
  typeRoots: ['typings', 'node_modules/@types'],
  allowSyntheticDefaultImports: true,
  skipLibCheck: true,
  esModuleInterop: true,
  resolveJsonModule: true,
  emitDeclarationOnly: true,
  isolatedModules: true,
  suppressOutputPathCheck: true,
  allowNonTsExtensions: true,
  noLib: true,
  noResolve: true,
};

const getNewLine = (() => {
  let newLine: '\r\n' | '\n';
  return (input: string) => {
    if (newLine) return newLine;
    return (newLine = detectNewline.graceful(input));
  };
})();

export default function generateDts(input: string): string {
  const newLine = getNewLine(input);

  const sourceFile = ts.createSourceFile(inputFileName, input, options.target);

  let outputText: string;
  const compilerHost = {
    getSourceFile(fileName: string) {
      return sourceFile;
    },
    writeFile(name: string, text: string) {
      outputText = text;
    },
    getDefaultLibFileName() {
      return 'lib.d.ts';
    },
    useCaseSensitiveFileNames() {
      return false;
    },
    getCanonicalFileName(fileName: string) {
      return fileName;
    },
    getCurrentDirectory() {
      return newLine;
    },
    getNewLine() {
      return newLine;
    },
    fileExists(fileName: string) {
      return fileName === inputFileName;
    },
    readFile() {
      return '';
    },
    directoryExists() {
      return true;
    },
    getDirectories() {
      return [];
    },
  };

  const program = ts.createProgram([inputFileName], options, compilerHost);
  program.emit(
    /* targetSourceFile */ undefined,
    /* writeFile */ undefined,
    /* cancellationToken */ undefined,
    /* emitOnlyDtsFiles */ true,
    /* customTransformers */ undefined,
  );

  return outputText!;
}