export function parseVariable(variable, variables, structList) {
  if (
    (variable[0] === '"' && variable[variable.length - 1] === '"') ||
    (variable[0] === "'" && variable[variable.length - 1] === "'")
  ) {
    return { name: variable, type: 'string' };
  }
  if (!isNaN(variable)) {
    if (parseInt(variable) < 0) {
      return { name: variable.trim(), type: 'int' };
    }
    return { name: variable.trim(), type: 'uint' };
  }
  let varName = variable
    .toLowerCase()
    .trim()
    .replace(/\s/g, '_');
  return (
    parseOperator(variable, variables) ||
    parseStruct(variable, variables, structList) ||
    parseMap(variable, variables) ||
    parseKeyword(varName) ||
    lookupVariableName(varName, variables)
  );
}

function parseOperator(variable, variables) {
  for (let operator of ['*', '/', '+', '-']) {
    if (variable.indexOf(operator) > 0) {
      let lhs, rhs;
      [lhs, rhs] = variable.split(operator);
      let parsedLhs = this.parseVariable(lhs, variables);
      let parsedRhs = this.parseVariable(rhs, variables);
      if (parsedLhs.type !== parsedRhs.type) {
        // one of them is a uint
        let mismatch = this.checkIntUintMismatch(
          parsedLhs,
          parsedRhs,
          {
            name: `uint(${parsedLhs.name}) ${operator} ${parsedRhs.name}`,
            type: 'uint'
          },
          {
            name: `${parsedLhs.name} ${operator} uint(${parsedRhs.name})`,
            type: 'uint'
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
        let varName = `${parsedLhs.name}_${parsedRhs.name}`;
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

function parseStruct(variable, variables, structList) {
  if (/('s )/.test(variable)) {
    let struct, attr;
    [struct, attr] = variable.split("'s ");
    let parsedStruct = this.parseVariable(struct, variables);
    let parsedAttr = this.parseVariable(attr, variables);
    for (let attribute of structList[parsedStruct.type]) {
      if (
        attribute.name === parsedAttr.name ||
        attribute.displayName === parsedAttr.name
      ) {
        return {
          name: `${parsedStruct.name}.${parsedAttr.name}`,
          type: this.bitsMode ? this.bitsModeGetType(attribute) : attribute.type
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

function parseMap(variable, variables) {
  if (/( for | of )/.test(variable)) {
    let map, key, innerKey;
    if (variable.indexOf(' of ') > 0) {
      [map, key, innerKey] = variable.split(' of ');
    } else {
      [map, key, innerKey] = variable.split(' for ');
    }
    if (innerKey) {
      let parsedMap = this.parseVariable(map, variables);
      let parsedKey = this.parseVariable(key, variables);
      let parsedInnerKey = this.parseVariable(innerKey, variables);
      let type = variables[parsedMap.name]
        ? variables[parsedMap.name]['to']
        : 'map';
      return {
        name: `${parsedMap.name}[${parsedKey.name}][${parsedInnerKey.name}]`,
        mapName: parsedMap.name,
        keyType: parsedKey.type,
        innerKeyType: parsedInnerKey.type,
        type: type
      };
    }
    let parsedMap = this.parseVariable(map, variables);
    let parsedKey = this.parseVariable(key, variables);
    let type = variables[parsedMap.name]
      ? variables[parsedMap.name]['to']
      : 'map';
    return {
      name: `${parsedMap.name}[${parsedKey.name}]`,
      mapName: parsedMap.name,
      keyType: parsedKey.type,
      type: type
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
    { name: 'true', type: 'bool', strings: ['true'] },
    { name: 'false', type: 'bool', strings: ['false'] }
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

function bitsModeGetType(info) {
  return `${info.type === 'string' && info.bits ? 'bytes' : info.type}${
    info['bits']
  }`;
}
