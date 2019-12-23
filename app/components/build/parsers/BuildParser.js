import { DiamondNodeModel } from '../diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';
import {
  parseVariable,
  checkIntUintMismatch,
  bitsModeGetType
} from './VariableParser';

export class BuildParser {
  constructor(onVariablesChange) {
    this.reset({}, {});
    this.onVariablesChange = onVariablesChange;
  }

  reset(
    varList,
    functionParams,
    eventList = null,
    structList = null,
    bitsMode = false
  ) {
    this.variables = {};
    this.memoryVars = {};
    this.memoryVarsDeclared = {};
    this.returnVar = null;
    this.varList = varList;
    this.functionParams = functionParams;
    this.eventList = eventList;
    this.structList = structList;
    this.isView = true;
    this.bitsMode = bitsMode;
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
      this.parseNode(node.data, this.structList);
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
    if (node instanceof DiamondNodeModel) {
      let falseNextNode = this.getNextNode(node.outPortFalse);
      let trueNextNode = this.getNextNode(node.outPortTrue);
      let trueWhileCode = this.generateCodeForCycle(node, true);
      let conditionCode = this.parseNode(node.data, this.structList);
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
        return `if (${conditionCode}) {\n${this.traverseNextNode(
          trueNextNode,
          intersection
        )}} ${
          elseCode !== '' ? `else {\n${elseCode}}` : ''
        }\n${this.traverseNextNode(intersection, stopNode)}`;
      }
      let elseCode = this.traverseNextNode(falseNextNode, stopNode);
      return `if (${conditionCode}) {\n${this.traverseNextNode(
        trueNextNode,
        stopNode
      )}} ${elseCode !== '' ? `else {\n${elseCode}}` : ''}\n`;
    }
    let curNodeCode =
      node.name === 'Start'
        ? ''
        : this.parseNode(node.data, this.structList) + '\n';
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
      code +=
        this.parseNode(node.data, this.structList, {
          ...this.memoryVarsDeclared
        }) + '\n';
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

  getAllVariables() {
    return {
      ...this.varList,
      ...this.variables,
      ...this.functionParams,
      ...this.memoryVars
    };
  }

  parseNodeForVariables(nodeData) {
    let parsedLhs, parsedRhs;
    const variables = this.getAllVariables();
    switch (nodeData.type) {
      case 'assignment':
        parsedLhs = parseVariable(
          nodeData.variableSelected,
          variables,
          this.structList
        );
        parsedRhs = parseVariable(
          nodeData.assignedVal,
          variables,
          this.structList
        );
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
          if (nodeData.isMemory) {
            this.memoryVars[parsedLhs.name] = parsedRhs.type;
            this.memoryVarsDeclared[parsedLhs.name] = false;
          } else {
            this.variables[parsedLhs.name] = parsedRhs.type;
          }
          return true;
        }
        return false;
      case 'event':
        if (this.bitsMode) {
          this.bitsModeParseParams(
            nodeData.params,
            this.eventList,
            nodeData.variableSelected,
            variables,
            this.structList
          );
        }
        return true;
      case 'entity':
        parsedLhs = parseVariable(
          nodeData.assignVar,
          variables,
          this.structList
        );
        if (this.bitsMode) {
          this.bitsModeParseParams(
            nodeData.params,
            this.structList,
            nodeData.variableSelected,
            variables,
            this.structList
          );
        }
        if (nodeData.isMemory) {
          this.memoryVars[parsedLhs.name] = nodeData.variableSelected;
        } else {
          this.variables[parsedLhs.name] = nodeData.variableSelected;
        }
        return true;
      case 'transfer':
        parsedLhs = parseVariable(
          nodeData.variableSelected,
          variables,
          this.structList
        );
        parsedRhs = parseVariable(nodeData.value, variables, this.structList);
        if (!this.bitsMode && parsedLhs.type === 'var') {
          this.variables[parsedLhs.name] = 'uint';
        }
        if (parsedRhs.type === 'var') {
          this.variables[parsedRhs.name] = 'address payable';
        }
        return true;
    }
    return true;
  }

  bitsModeParseParams(params, infoList, varSelected, variables, structList) {
    for (let i = 0; i < params.length; i++) {
      let param = params[i];
      let info = infoList[varSelected][i];
      let parsedParam = parseVariable(param, variables, structList);
      if (
        parsedParam.type !== 'string' &&
        parsedParam.type !== 'uint' &&
        parsedParam.type !== 'int' &&
        parsedParam.type !== 'bool' &&
        !parsedParam.type.includes('address')
      ) {
        this.variables[parsedParam.name] = bitsModeGetType(info);
      }
    }
  }

  parseNode(
    nodeData,
    structList,
    memoryVarsDeclared = this.memoryVarsDeclared
  ) {
    const variables = this.getAllVariables();
    switch (nodeData.type) {
      case 'assignment':
        this.isView = false;
        return this.parseAssignmentNode(
          nodeData,
          memoryVarsDeclared,
          variables,
          structList
        );
      case 'event':
        this.isView = false;
        return this.parseEventNode(nodeData, variables, structList);
      case 'entity':
        this.isView = false;
        return this.parseEntityNode(nodeData, variables, structList);
      case 'transfer':
        this.isView = false;
        return this.parseTransferNode(nodeData, variables, structList);
      case 'return':
        let returnVar = parseVariable(
          nodeData.variableSelected,
          variables,
          structList
        );
        this.returnVar = returnVar.type;
        return `return ${returnVar.name};`;
      case 'conditional':
        return this.parseCompareNode(nodeData, variables, structList);
    }
    return '';
  }

  parseAssignmentNode(data, memoryVarsDeclared, variables, structList) {
    let parsedLhs = parseVariable(data.variableSelected, variables, structList);
    let parsedRhs = parseVariable(data.assignedVal, variables, structList);
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
      if (data.isMemory) {
        this.memoryVars[parsedLhs.name] = parsedRhs.type;
      } else {
        this.variables[parsedLhs.name] = parsedRhs.type;
      }
    } else if (parsedLhs.type !== parsedRhs.type) {
      console.log(
        `invalid assignment at node ${data.variableSelected} ${data.assignment} ${data.assignedVal}`
      );
    }
    if (
      data.isMemory &&
      !parsedLhs.name.includes('.') &&
      !('mapName' in parsedLhs) &&
      !memoryVarsDeclared[parsedLhs.name]
    ) {
      memoryVarsDeclared[parsedLhs.name] = true;
      return `${parsedRhs.type}${
        parsedRhs.type === 'string' ? ' memory ' : ' '
      }${parsedLhs.name} ${data.assignment} ${parsedRhs.name};`;
    }
    return `${parsedLhs.name} ${data.assignment} ${parsedRhs.name};`;
  }

  parseEventNode(data, variables, structList) {
    let params = data.params
      .map(param => parseVariable(param, variables, structList).name)
      .join(', ');
    return `emit ${data.variableSelected}(${params});`;
  }

  parseEntityNode(data, variables, structList) {
    let parsedLhs = parseVariable(data.assignVar, variables, structList);
    let params = data.params
      .map(param => parseVariable(param, variables, structList).name)
      .join(', ');
    if (data.isMemory) {
      this.memoryVars[parsedLhs.name] = data.variableSelected;
    } else {
      this.variables[parsedLhs.name] = data.variableSelected;
    }
    return `${data.isMemory ? `${data.variableSelected} memory ` : ''}${
      parsedLhs.name
    } = ${data.variableSelected}(${params});`;
  }

  parseTransferNode(data, variables, structList) {
    let parsedLhs = parseVariable(data.value, variables, structList);
    let parsedRhs = parseVariable(data.variableSelected, variables, structList);
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

  parseCompareNode(data, variables, structList) {
    let parsedLhs = parseVariable(data.var1, variables, structList);
    let parsedRhs = parseVariable(data.var2, variables, structList);
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
