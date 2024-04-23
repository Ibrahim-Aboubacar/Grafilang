import { buildASTTree } from "./ast.ts";
import { parseTokens, Position } from "./lexer.ts";
import { ParseError, RuntimeError, UnexpectedTokenError } from "./errors.ts";
import { interpret } from "./interpreter.ts";

let source = "";

export function run(s: string) {
  source = s;
  try {
    return interpret(buildASTTree(parseTokens(source)));
  } catch (e) {
    if (e instanceof RuntimeError) {
      throwRuntimeError(e, source);
    } else if (e instanceof ParseError) {
      throwParseError(e, source);
    } else if (e instanceof UnexpectedTokenError) {
      throwUnexpectedToken(e, source);
    }
    throw e;
    return "";
  }
}

function throwUnexpectedToken(e: UnexpectedTokenError, s: string) {
  const errorMessage = `"${e.got.type}" inattendu`;
  const expectedMessage = `"${e.expected}" attendu ici`;
  const column = getColumn(e.got.position, source);
  throw `Erreur de syntaxe : ${errorMessage} (${positionToString(e.got.position, column)})

${getLine(e.got.position[0], s)}
${underline(column + 1, e.got.position)} ${e.expected ? expectedMessage : errorMessage}`;
}

function throwRuntimeError(e: RuntimeError, s: string) {
  const column = getColumn(e.expression.position, source);
  throw `Erreur à l'exécution (${positionToString(e.expression.position, column)})
  
${getLine(e.expression.position[0], s)}
${underline(column, e.expression.position)}
${e.message.padStart(column)}
  `;
}

function underline(column: number, position: Position): string {
  return "".padStart(column).padEnd(position[1] - position[0] + column, "^");
}

function throwParseError(e: ParseError, s: string) {
  console.error(e, s[0]);
}

function getColumn(position: Position, source: string): number {
  return position[0] - Math.max(source.lastIndexOf("\n", position[0]), 0);
}

function positionToString(position: Position, column: number): string {
  return `ligne ${position[2]}, colonne ${column}`;
}

function getLine(index: number, source: string): string {
  const lineIndex = source.lastIndexOf("\n", index);
  const endLineIndex = source.indexOf("\n", index);
  return source.substring(
    lineIndex === -1 ? 0 : lineIndex,
    endLineIndex === -1 ? undefined : endLineIndex,
  );
}
