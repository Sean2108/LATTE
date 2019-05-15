import { DiamondNodeModel } from './diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';

export class BuildParser {
  constructor(onVariablesChange) {
    this.reset({}, {});
    this.onVariablesChange = onVariablesChange;
  }

  reset(varList, functionParams, structList = null) {
    this.variables = {};
    this.returnVar = null;
    this.varList = varList;
    this.functionParams = functionParams;
    this.structList = structList;
    this.isView = true;
  }

  getReturnVar() {
    return this.returnVar;
  }

  getView() {
    return this.isView;
  }

  parse(start) {
    this.findVariables(start);
    let code = this.traverseNextNode(start);
    this.onVariablesChange({ ...this.variables, ...this.varList });
    return code;
  }

  findVariables(start) {
    let unparsedStatements = new Set();
    this.traverseForVariables(start, unparsedStatements, new Set());
    let hasChanged = false;
    do {
      for (let statement of unparsedStatements) {
        if (this.parseNodeForVariables(statement)) {
          hasChanged = true;
          unparsedStatements.delete(statement);
        }
      }
    } while (unparsedStatements.size > 0 && hasChanged);
  }

  traverseForVariables(node, unparsedStatements, visitedNodes) {
    if (!node || visitedNodes.has(node)) {
      return;
    }
    visitedNodes.add(node);
    if (node instanceof DiamondNodeModel) {
      this.parseNode(node.data);
      let falseNextNode = this.getNextNode(node.outPortFalse);
      let trueNextNode = this.getNextNode(node.outPortTrue);
      this.traverseForVariables(
        falseNextNode,
        unparsedStatements,
        visitedNodes
      );
      this.traverseForVariables(trueNextNode, unparsedStatements, visitedNodes);
    }
    if (node.name !== 'Start' && !this.parseNodeForVariables(node.data)) {
      unparsedStatements.add(node.data);
    }
    let nextNode = this.getNextNodeForDefaultNode(node);
    this.traverseForVariables(nextNode, unparsedStatements, visitedNodes);
  }

  traverseNextNode(node, stopNode = null) {
    if (!node || (stopNode && node === stopNode)) {
      return '';
    }
    console.log(node.data);
    if (node instanceof DiamondNodeModel) {
      let falseNextNode = this.getNextNode(node.outPortFalse);
      let trueNextNode = this.getNextNode(node.outPortTrue);
      let trueWhileCode = this.generateCodeForCycle(node, true);
      let conditionCode = this.parseNode(node.data);
      if (trueWhileCode) {
        return `while (${conditionCode}) {\n${trueWhileCode}}\n${this.traverseNextNode(
          falseNextNode,
          stopNode
        )}`;
      }
      let falseWhileCode = this.generateCodeForCycle(node, false);
      if (falseWhileCode) {
        return `while (!(${conditionCode})) {\n${falseWhileCode}}\n${this.traverseNextNode(
          trueNextNode,
          stopNode
        )}`;
      }
      let intersection = this.getIntersection(trueNextNode, falseNextNode);
      if (intersection) {
        let elseCode = this.traverseNextNode(falseNextNode, intersection);
        return `if (${conditionCode}) {\n${this.traverseNextNode(trueNextNode, intersection)}} ${
          elseCode !== '' ? `else {\n${elseCode}}` : ''
        }\n${this.traverseNextNode(intersection, stopNode)}`;
      }
      let elseCode = this.traverseNextNode(falseNextNode, stopNode);
      return `if (${conditionCode}) {\n${this.traverseNextNode(trueNextNode, stopNode)}} ${
        elseCode !== '' ? `else {\n${elseCode}}` : ''
      }\n`;
    }
    let curNodeCode =
      node.name === 'Start' ? '' : this.parseNode(node.data) + '\n';
    let nextNode = this.getNextNodeForDefaultNode(node);
    if (!nextNode) {
      return curNodeCode;
    }
    return curNodeCode + this.traverseNextNode(nextNode, stopNode);
  }

  generateCodeForCycle(start, isTrue) {
    let outPort = isTrue ? start.outPortTrue : start.outPortFalse;
    let node = this.getNextNode(outPort);
    let code = '';
    while (node) {
      if (node === start) {
        return code;
      }
      if (node instanceof DiamondNodeModel) {
        return null;
      }
      code += this.parseNode(node.data) + '\n';
      node = this.getNextNodeForDefaultNode(node);
    }
    return null;
  }

  getNextNode(outPort) {
    let links = Object.values(outPort.getLinks());
    if (links.length === 0 || !links[0].targetPort) {
      return null;
    } else {
      return links[0].targetPort.getNode();
    }
  }

  getNextNodeForDefaultNode(node) {
    if (node instanceof DiamondNodeModel || node.getOutPorts().length === 0) {
      return null;
    }
    return this.getNextNode(node.getOutPorts()[0]);
  }

  parseNodeForVariables(nodeData) {
    let parsedLhs, parsedRhs;
    switch (nodeData.type) {
      case 'assignment':
        parsedLhs = this.parseVariable(nodeData.variableSelected);
        parsedRhs = this.parseVariable(nodeData.assignedVal);
        if (!parsedLhs.type || !parsedRhs.type) {
          return true;
        }
        if ('mapName' in parsedLhs) {
          if (parsedLhs.keyType !== 'var' && parsedRhs.type !== 'var') {
            let lhsType =
              parsedLhs.keyType === 'address payable'
                ? 'address'
                : parsedLhs.keyType;
            this.variables[parsedLhs.mapName] = {
              type: 'mapping',
              from: lhsType,
              to: parsedRhs.type
            };
            if ('innerKeyType' in parsedLhs) {
              this.variables[parsedLhs.mapName]['inner'] =
                parsedLhs.innerKeyType;
            }
            return true;
          }
          return false;
        }
        if (
          !parsedLhs.name.includes('.') &&
          (parsedLhs.type === 'var' ||
            !(
              parsedLhs.name in this.variables ||
              parsedLhs.name in this.functionParams
            ))
        ) {
          this.variables[parsedLhs.name] = parsedRhs.type;
          return true;
        }
        return false;
      case 'entity':
        parsedLhs = this.parseVariable(nodeData.variableSelected);
        this.variables[parsedLhs.name] = nodeData.assignVar;
        return true;
      case 'transfer':
        parsedLhs = this.parseVariable(nodeData.variableSelected);
        parsedRhs = this.parseVariable(nodeData.value);
        if (parsedLhs.type === 'var') {
          this.variables[parsedLhs.name] = 'uint';
        }
        if (parsedRhs.type === 'var') {
          this.variables[parsedRhs.name] = 'address payable';
        }
        return true;
    }
    return true;
  }

  parseNode(nodeData) {
    switch (nodeData.type) {
      case 'assignment':
        this.isView = false;
        return this.parseAssignmentNode(nodeData);
      case 'event':
        this.isView = false;
        return this.parseEventNode(nodeData);
      case 'entity':
        this.isView = false;
        return this.parseEntityNode(nodeData);
      case 'transfer':
        this.isView = false;
        return this.parseTransferNode(nodeData);
      case 'return':
        let returnVar = this.parseVariable(nodeData.variableSelected);
        this.returnVar = returnVar.type;
        return `return ${returnVar.name};`;
      case 'conditional':
        return this.parseCompareNode(nodeData);
    }
    return '';
  }

  parseAssignmentNode(data) {
    let parsedLhs = this.parseVariable(data.variableSelected);
    let parsedRhs = this.parseVariable(data.assignedVal);
    if (!parsedLhs.type || !parsedRhs.type) {
      return `${parsedLhs.name} ${data.assignment} ${parsedRhs.name};`;
    }
    if ('mapName' in parsedLhs) {
      let lhsType =
        parsedLhs.keyType === 'address payable' ? 'address' : parsedLhs.keyType;
      this.variables[parsedLhs.mapName] = {
        type: 'mapping',
        from: lhsType,
        to: parsedRhs.type
      };
      if ('innerKeyType' in parsedLhs) {
        this.variables[parsedLhs.mapName]['inner'] = parsedLhs.innerKeyType;
      }
    } else if (
      !parsedLhs.name.includes('.') &&
      (parsedLhs.type === 'var' ||
        !(
          parsedLhs.name in this.variables ||
          parsedLhs.name in this.functionParams
        ))
    ) {
      this.variables[parsedLhs.name] = parsedRhs.type;
    } else if (parsedLhs.type !== parsedRhs.type) {
      console.log(`invalid assignment at node ${data.variableSelected} ${data.assignment} ${data.assignedVal}`);
    }
    return `${parsedLhs.name} ${data.assignment} ${parsedRhs.name};`;
  }

  parseEventNode(data) {
    let params = data.params.map(param => this.parseVariable(param).name).join(', ');
    return `emit ${data.variableSelected}(${params});`;
  }

  parseEntityNode(data) {
    let parsedLhs = this.parseVariable(data.variableSelected);
    this.variables[parsedLhs.name] = data.assignVar;
    let params = data.params
      .map(param => this.parseVariable(param).name)
      .join(', ');
    return `${data.isMemory ? `${entityName} memory ` : ''}${
      parsedLhs.name
    } = ${data.assignVar}(${params});`;
  }

  parseTransferNode(data) {
    let parsedLhs = this.parseVariable(data.value);
    let parsedRhs = this.parseVariable(data.variableSelected);
    if (parsedLhs.type !== 'uint') {
      console.log(`value should be an integer at transfer node`);
    }
    if (parsedRhs.type !== 'address payable') {
      console.log(
        `transfer target should be a payable address at transfer node`
      );
    }
    return `${parsedRhs.name}.transfer(${parsedLhs.name});`;
  }

  parseCompareNode(data) {
    let parsedLhs = this.parseVariable(data.var1);
    let parsedRhs = this.parseVariable(data.var2);
    if (parsedLhs.type !== parsedRhs.type) {
      let mismatch = this.checkIntUintMismatch(
        parsedLhs,
        parsedRhs,
        `uint(${parsedLhs.name}) ${data.comp} ${parsedRhs.name}`,
        `${parsedLhs.name} ${data.comp} uint(${parsedRhs.name})`
      );
      if (mismatch) {
        return mismatch;
      }
    }
    if (
      parsedLhs.type === 'string' &&
      parsedRhs.type === 'string' &&
      comp === '=='
    ) {
      return `keccak256(${parsedLhs.name}) == keccak256(${parsedRhs.name})`;
    }
    return `${parsedLhs.name} ${data.comp} ${parsedRhs.name}`;
  }

  parseVariable(variable) {
    let variables = {
      ...this.varList,
      ...this.variables,
      ...this.functionParams
    };
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
      this.parseOperator(variable) ||
      this.parseStruct(variable) ||
      this.parseMap(variable, variables) ||
      this.parseKeyword(varName) ||
      this.lookupVariableName(varName, variables)
    );
  }

  parseOperator(variable) {
    for (let operator of ['*', '/', '+', '-']) {
      if (variable.indexOf(operator) > 0) {
        let lhs, rhs;
        [lhs, rhs] = variable.split(operator);
        let parsedLhs = this.parseVariable(lhs);
        let parsedRhs = this.parseVariable(rhs);
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

  parseStruct(variable) {
    if (/('s )/.test(variable)) {
      let struct, attr;
      [struct, attr] = variable.split("'s ");
      let parsedStruct = this.parseVariable(struct);
      let parsedAttr = this.parseVariable(attr);
      for (let attribute of this.structList[parsedStruct.type]) {
        if (
          attribute.name === parsedAttr.name ||
          attribute.displayName === parsedAttr.name
        ) {
          return {
            name: `${parsedStruct.name}.${parsedAttr.name}`,
            type: attribute.type
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

  parseMap(variable, variables) {
    if (/( for | of )/.test(variable)) {
      let map, key, innerKey;
      if (variable.indexOf(' of ') > 0) {
        [map, key, innerKey] = variable.split(' of ');
      } else {
        [map, key, innerKey] = variable.split(' for ');
      }
      if (innerKey) {
        let parsedMap = this.parseVariable(map);
        let parsedKey = this.parseVariable(key);
        let parsedInnerKey = this.parseVariable(innerKey);
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
      let parsedMap = this.parseVariable(map);
      let parsedKey = this.parseVariable(key);
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

  parseKeyword(varName) {
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

  lookupVariableName(varName, variables) {
    if (!(varName in variables)) {
      return { name: varName, type: 'var' };
    }
    return { name: varName, type: variables[varName] };
  }

  checkIntUintMismatch(parsedLhs, parsedRhs, leftIntReturn, rightIntReturn) {
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

  getIntersection(nodeA, nodeB) {
    let lengthDifference = this.getCount(nodeA) - this.getCount(nodeB);
    if (lengthDifference > 0) {
      return this.getIntersectionNodeTraversal(lengthDifference, nodeA, nodeB);
    }
    return this.getIntersectionNodeTraversal(-lengthDifference, nodeB, nodeA);
  }

  getCount(node) {
    let count = 0;
    while (node) {
      count += 1;
      node = this.getNextNodeForDefaultNode(node);
    }
    return count;
  }

  getIntersectionNodeTraversal(diff, longerNode, shorterNode) {
    for (let i = 0; i < diff; i++) {
      if (!longerNode) return null;
      longerNode = this.getNextNodeForDefaultNode(longerNode);
    }

    while (longerNode && shorterNode) {
      if (longerNode == shorterNode) return longerNode;
      longerNode = this.getNextNodeForDefaultNode(longerNode);
      shorterNode = this.getNextNodeForDefaultNode(shorterNode);
    }

    return null;
  }
}
