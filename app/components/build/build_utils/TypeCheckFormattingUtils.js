// @flow

import type {
  ParserVariable,
  VariableObj,
  VariablesLookupType
} from '../../../types';

export function checkIntUintMismatch(
  parsedLhs: ParserVariable,
  parsedRhs: ParserVariable,
  leftIntReturn: string,
  rightIntReturn: string
): ?string {
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

export function convertTypeToReadable(type: string): string {
  return {
    uint: 'Number',
    int: 'Number',
    bool: 'True/False',
    address: 'Address',
    'address payable': 'Address',
    string: 'Text'
  }[type];
}

export function flattenParamsToObject(
  params: Array<VariableObj>,
  bitsMode: boolean
): VariablesLookupType {
  return params
    .filter((element: VariableObj): boolean => !!element.name)
    .reduce(
      (
        resultParam: VariablesLookupType,
        currentObject: VariableObj
      ): VariablesLookupType => {
        const result = resultParam;
        if (bitsMode && currentObject.bits) {
          if (currentObject.type === 'string') {
            result[currentObject.name] = `bytes${currentObject.bits}`;
          } else {
            result[
              currentObject.name
            ] = `${currentObject.type}${currentObject.bits}`;
          }
        } else {
          result[currentObject.name] = currentObject.type;
        }
        return result;
      },
      {}
    );
}

export function getDuplicateIndices(items: Array<string>): Array<number> {
  const lookup = {};
  items.forEach((item: string) => {
    if (!lookup[item]) {
      lookup[item] = 0;
    }
    lookup[item] += 1;
  });
  return items
    .map((item: string, index: number): { item: string, index: number } => ({
      item,
      index
    }))
    .filter(({ item }): boolean => lookup[item] > 1)
    .map(({ item, index }): number => {
      lookup[item] -= 1;
      if (lookup[item] === 0) {
        return index;
      }
      return -1;
    })
    .filter((item: number) => item !== -1);
}
