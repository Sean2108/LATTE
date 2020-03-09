// @flow

import type {
  ParserVariable,
  VariableObj,
  VariablesLookupType
} from '../../../types';

export function checkIntUintMismatch(
  parsedLhs: ParserVariable,
  parsedRhs: ParserVariable,
  leftIntReturn: ParserVariable,
  rightIntReturn: ParserVariable
): ParserVariable | null {
  if (
    parsedLhs.type &&
    parsedRhs.type &&
    parsedLhs.type.slice(-3) === 'int' &&
    parsedRhs.type.slice(-3) === 'int'
  ) {
    return parsedLhs.type === 'int' ? leftIntReturn : rightIntReturn;
  }
  return null;
}

export function bitsModeGetType(info: VariableObj): string {
  return `${info.type === 'string' && info.bits ? 'bytes' : info.type}${
    info.bits ? info.bits : ''
  }`;
}

export function isSameBaseType(
  lhs: string,
  rhs: string,
  bitsMode: boolean
): boolean {
  if (lhs === rhs) {
    return true;
  }
  if (!bitsMode) {
    return false;
  }
  return (
    (lhs.startsWith('uint') && rhs.startsWith('uint')) ||
    (lhs.startsWith('int') && rhs.startsWith('int')) ||
    (lhs.startsWith('bytes') && rhs === 'string') ||
    (lhs.startsWith('string') && rhs.startsWith('bytes')) ||
    (lhs.startsWith('bytes') && rhs.startsWith('bytes'))
  );
}

export function isPrimitiveType(type: string): boolean {
  return (
    type.startsWith('uint') ||
    type.startsWith('int') ||
    type.startsWith('address') ||
    type.startsWith('bytes') ||
    type === 'bool'
  );
}
export function toLowerCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(/\s+/g, '');
}

export function isString(
  rawVariable: string,
  vars: VariablesLookupType
): boolean {
  const variable = rawVariable.trim();
  return (
    (variable[0] === '"' && variable[variable.length - 1] === '"') ||
    (variable[0] === "'" && variable[variable.length - 1] === "'") ||
    vars[variable] === 'string'
  );
}

export function deepClone(toClone: {}): {} {
  return JSON.parse(JSON.stringify(toClone));
}

export function objectEquals(objectA: {}, objectB: {}): boolean {
  return JSON.stringify(objectA) === JSON.stringify(objectB);
}
