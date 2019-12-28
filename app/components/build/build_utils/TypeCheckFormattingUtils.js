export function checkIntUintMismatch(
  parsedLhs,
  parsedRhs,
  leftIntReturn,
  rightIntReturn
) {
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

export function bitsModeGetType(info) {
  return `${info.type === 'string' && info.bits ? 'bytes' : info.type}${
    info.bits
  }`;
}

export function isSameBaseType(lhs, rhs, bitsMode) {
  if (lhs === rhs) {
    return true;
  }
  if (!bitsMode) {
    return false;
  }
  return (
    (lhs.startsWith('uint') && rhs.startsWith('uint')) ||
    (lhs.startsWith('int') && rhs.startsWith('int')) ||
    (lhs.startsWith('uint') && rhs.startsWith('uint')) ||
    (lhs.startsWith('bytes') && rhs === 'string') ||
    (lhs.startsWith('string') && rhs.startsWith('bytes'))
  );
}

export function isPrimitiveType(type) {
  return (
    type.startsWith('uint') ||
    type.startsWith('int') ||
    type.startsWith('address') ||
    type === 'bool'
  );
}
export function toLowerCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(/\s+/g, '');
}

export function isString(rawVariable, vars) {
  const variable = rawVariable.trim();
  return (
    (variable[0] === '"' && variable[variable.length - 1] === '"') ||
    (variable[0] === "'" && variable[variable.length - 1] === "'") ||
    vars[variable] === 'string'
  );
}

export function deepClone(toClone) {
  return JSON.parse(JSON.stringify(toClone));
}
