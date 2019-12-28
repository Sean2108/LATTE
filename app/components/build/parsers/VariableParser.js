import { checkIntUintMismatch, bitsModeGetType } from '../build_utils/TypeCheckFormattingUtils';

export default function parseVariable(
  rawVariable,
  variables,
  structList,
  bitsMode = false
) {
  const variable = rawVariable.trim();
  if (
    (variable[0] === '"' && variable[variable.length - 1] === '"') ||
    (variable[0] === "'" && variable[variable.length - 1] === "'")
  ) {
    return { name: variable, type: 'string' };
  }
  if (!Number.isNaN(Number(variable)) && variable.slice(0, 2) !== '0x') {
    if (parseInt(variable, 10) < 0) {
      return { name: variable, type: 'int' };
    }
    return { name: variable, type: 'uint' };
  }
  const varName = variable.toLowerCase().replace(/\s/g, '_');
  return (
    parseOperator(variable, variables, structList, bitsMode) ||
    parseStruct(variable, variables, structList, bitsMode) ||
    parseMap(variable, variables, structList, bitsMode) ||
    parseKeyword(varName) ||
    lookupVariableName(varName, variables)
  );
}

function parseOperator(variable, variables, structList, bitsMode) {
  for (const operator of ['*', '/', '+', '- ']) {
    if (variable.indexOf(operator) > 0) {
      const [lhs, rhs] = variable.split(operator);
      const parsedLhs = parseVariable(lhs, variables, structList, bitsMode);
      const parsedRhs = parseVariable(rhs, variables, structList, bitsMode);
      if (parsedLhs.type !== parsedRhs.type) {
        // one of them is a uint
        const mismatch = checkIntUintMismatch(
          parsedLhs,
          parsedRhs,
          {
            name: `${parsedLhs.name} ${operator} int(${parsedRhs.name})`,
            type: 'int'
          },
          {
            name: `int(${parsedLhs.name}) ${operator} ${parsedRhs.name}`,
            type: 'int'
          }
        );
        if (mismatch) {
          return mismatch;
        }
        if (parsedLhs.type === 'map' || parsedRhs.type === 'map') {
          return {
            name: `${parsedLhs.name} ${operator} ${parsedRhs.name}`,
            type: parsedLhs.type === 'map' ? parsedRhs.type : parsedLhs.type
          };
        }
        return {
          name: `${parsedLhs.name} ${operator} ${parsedRhs.name}`,
          type: 'var'
        };
      }
      if (parsedLhs === 'string' && operator !== '+') {
        const varName = `${parsedLhs.name}_${parsedRhs.name}`;
        if (!(varName in variables)) {
          return { name: varName, type: 'var' };
        }
        return { name: varName, type: variables[varName] };
      }
      return {
        name: `${parsedLhs.name} ${operator} ${parsedRhs.name}`,
        type: parsedLhs.type
      };
    }
  }
  return null;
}

function parseStruct(variable, variables, structList, bitsMode) {
  if (/('s )/.test(variable)) {
    const [struct, attr] = variable.split("'s ");
    const parsedStruct = parseVariable(struct, variables, structList, bitsMode);
    const parsedAttr = parseVariable(attr, variables, structList, bitsMode);
    for (const attribute of structList[parsedStruct.type]) {
      if (
        attribute.name === parsedAttr.name ||
        attribute.displayName === parsedAttr.name
      ) {
        return {
          name: `${parsedStruct.name}.${parsedAttr.name}`,
          type: bitsMode ? bitsModeGetType(attribute) : attribute.type
        };
      }
    }
    return {
      name: `${parsedStruct.name}.${parsedAttr.name}`,
      type: null
    };
  }
  return null;
}

function parseMap(variable, variables, structList, bitsMode) {
  if (/( for | of )/.test(variable)) {
    const [map, key, innerKey] =
      variable.indexOf(' of ') > 0
        ? variable.split(' of ')
        : variable.split(' for ');
    if (innerKey) {
      const parsedMap = parseVariable(map, variables, structList, bitsMode);
      const parsedKey = parseVariable(key, variables, structList, bitsMode);
      const parsedInnerKey = parseVariable(
        innerKey,
        variables,
        structList,
        bitsMode
      );
      const type = variables[parsedMap.name]
        ? variables[parsedMap.name].to
        : 'map';
      return {
        name: `${parsedMap.name}[${parsedKey.name}][${parsedInnerKey.name}]`,
        mapName: parsedMap.name,
        keyType: parsedKey.type,
        innerKeyType: parsedInnerKey.type,
        type
      };
    }
    const parsedMap = parseVariable(map, variables, structList, bitsMode);
    const parsedKey = parseVariable(key, variables, structList, bitsMode);
    const type = variables[parsedMap.name]
      ? variables[parsedMap.name].to
      : 'map';
    return {
      name: `${parsedMap.name}[${parsedKey.name}]`,
      mapName: parsedMap.name,
      keyType: parsedKey.type,
      type
    };
  }
  return null;
}

function parseKeyword(varName) {
  if (varName.slice(0, 2) === '0x') {
    return { name: varName, type: 'address payable' };
  }
  const keywords = [
    {
      name: 'msg.sender',
      type: 'address payable',
      strings: ['message_sender', 'msg_sender', 'sender', 'function_caller']
    },
    {
      name: 'msg.value',
      type: 'uint',
      strings: ['message_value', 'msg_value', 'value']
    },
    {
      name: 'address(this).balance',
      type: 'uint',
      strings: ['current_balance', 'contract_balance', 'balance']
    },
    { name: 'now', type: 'uint', strings: ['current_time', 'today', 'now'] },
    {
      name: 'address(uint160(0))',
      type: 'address payable',
      strings: [
        'address',
        'type_address',
        'address_type',
        'an_address',
        'invalid_address',
        'null_address'
      ]
    },
    { name: 'true', type: 'bool', strings: ['true', 'yes'] },
    { name: 'false', type: 'bool', strings: ['false', 'no'] }
  ];
  for (const keyword of keywords) {
    if (keyword.strings.includes(varName)) {
      return { name: keyword.name, type: keyword.type };
    }
  }
  return null;
}

function lookupVariableName(varName, variables) {
  if (!(varName in variables)) {
    return { name: varName, type: 'var' };
  }
  return { name: varName, type: variables[varName] };
}
