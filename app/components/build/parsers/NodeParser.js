import parseVariable from './VariableParser';
import {
  checkIntUintMismatch,
  isSameBaseType,
  isPrimitiveType
} from '../build_utils/TypeCheckFormattingUtils';

export default class NodeParser {
  constructor(updateBuildError) {
    this.reset({}, {});
    this.updateBuildError = updateBuildError;
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

  getAllVariables() {
    return {
      ...this.varList,
      ...this.variables,
      ...this.functionParams,
      ...this.memoryVars
    };
  }

  updateVariablesForMap(parsedLhs, parsedRhs, variables) {
    if (
      parsedLhs.mapName in variables &&
      variables[parsedLhs.mapName].from !== 'var' &&
      variables[parsedLhs.mapName].to !== 'var'
    ) {
      return;
    }
    const lhsType =
      parsedLhs.keyType === 'address payable' ? 'address' : parsedLhs.keyType;
    this.variables[parsedLhs.mapName] = {
      type: 'mapping',
      from: lhsType,
      to: parsedRhs.type
    };
    if ('innerKeyType' in parsedLhs) {
      this.variables[parsedLhs.mapName].inner = parsedLhs.innerKeyType;
    }
  }

  parseNodeForVariables(nodeData) {
    const variables = this.getAllVariables();
    switch (nodeData.type) {
      case 'assignment':
        return this.parseAssignmentNodeForVariables(nodeData, variables);
      case 'entity':
        return this.parseEntityNodeForVariables(nodeData, variables);
      case 'transfer':
        return this.parseTransferNodeForVariables(nodeData, variables);
      default:
        return true;
    }
  }

  parseAssignmentNodeForVariables(nodeData, variables) {
    const parsedLhs = parseVariable(
      nodeData.variableSelected,
      variables,
      this.structList,
      this.bitsMode
    );
    const parsedRhs = parseVariable(
      nodeData.assignedVal,
      variables,
      this.structList,
      this.bitsMode
    );
    if ('mapName' in parsedLhs) {
      if (parsedLhs.keyType !== 'var' && parsedRhs.type !== 'var') {
        this.updateVariablesForMap(parsedLhs, parsedRhs, variables);
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
  }

  parseEntityNodeForVariables(nodeData, variables) {
    const parsedLhs = parseVariable(
      nodeData.assignVar,
      variables,
      this.structList,
      this.bitsMode
    );
    if (nodeData.isMemory) {
      this.memoryVars[parsedLhs.name] = nodeData.variableSelected;
    } else {
      this.variables[parsedLhs.name] = nodeData.variableSelected;
    }
    return true;
  }

  parseTransferNodeForVariables(nodeData, variables) {
    const parsedLhs = parseVariable(
      nodeData.variableSelected,
      variables,
      this.structList,
      this.bitsMode
    );
    const parsedRhs = parseVariable(
      nodeData.value,
      variables,
      this.structList,
      this.bitsMode
    );
    if (!this.bitsMode && parsedLhs.type === 'var') {
      this.variables[parsedLhs.name] = 'uint';
    }
    if (parsedRhs.type === 'var') {
      this.variables[parsedRhs.name] = 'address payable';
    }
    return true;
  }

  parseNode(nodeData, indentation = '') {
    const variables = this.getAllVariables();
    switch (nodeData.type) {
      case 'event':
        this.isView = false;
        return indentation + this.parseEventNode(nodeData, variables);
      case 'entity':
        this.isView = false;
        return indentation + this.parseEntityNode(nodeData, variables);
      case 'transfer':
        this.isView = false;
        return indentation + this.parseTransferNode(nodeData, variables);
      case 'return': {
        const returnVar = parseVariable(
          nodeData.variableSelected,
          variables,
          this.structList,
          this.bitsMode
        );
        this.returnVar = returnVar.type;
        return `${indentation}return ${returnVar.name};`;
      }
      case 'conditional':
        return this.parseCompareNode(nodeData, variables);
      case 'assignment':
      default:
        this.isView = false;
        return indentation + this.parseAssignmentNode(nodeData, variables);
    }
  }

  parseAssignmentNode(data, variables) {
    const parsedLhs = parseVariable(
      data.variableSelected,
      variables,
      this.structList,
      this.bitsMode
    );
    const parsedRhs = parseVariable(
      data.assignedVal,
      variables,
      this.structList,
      this.bitsMode
    );
    if ('mapName' in parsedLhs) {
      this.updateVariablesForMap(parsedLhs, parsedRhs, variables);
    } else if (
      parsedLhs.type !== 'var' &&
      parsedRhs.type !== 'var' &&
      !isSameBaseType(parsedLhs.type, parsedRhs.type, this.bitsMode)
    ) {
      this.updateBuildError(
        `Invalid assignment at node ${data.variableSelected} ${data.assignment} ${data.assignedVal}`
      );
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
    }
    if (
      data.isMemory &&
      !parsedLhs.name.includes('.') &&
      !('mapName' in parsedLhs) &&
      !this.memoryVarsDeclared[parsedLhs.name]
    ) {
      this.memoryVarsDeclared[parsedLhs.name] = true;
      return `${parsedRhs.type}${
        !isPrimitiveType(parsedRhs.type) ? ' memory ' : ' '
      }${parsedLhs.name} ${data.assignment} ${parsedRhs.name};`;
    }
    return `${parsedLhs.name} ${data.assignment} ${parsedRhs.name};`;
  }

  parseEventNode(data, variables) {
    const params = data.params
      .map(
        param =>
          parseVariable(param, variables, this.structList, this.bitsMode).name
      )
      .join(', ');
    return `emit ${data.variableSelected}(${params});`;
  }

  parseEntityNode(data, variables) {
    const parsedLhs = parseVariable(
      data.assignVar,
      variables,
      this.structList,
      this.bitsMode
    );
    const params = data.params
      .map(
        param =>
          parseVariable(param, variables, this.structList, this.bitsMode).name
      )
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

  parseTransferNode(data, variables) {
    const parsedLhs = parseVariable(
      data.value,
      variables,
      this.structList,
      this.bitsMode
    );
    const parsedRhs = parseVariable(
      data.variableSelected,
      variables,
      this.structList,
      this.bitsMode
    );
    if (parsedLhs.type !== 'uint') {
      this.updateBuildError(`Value should be an integer at transfer node`);
    }
    if (parsedRhs.type !== 'address payable') {
      this.updateBuildError(
        `Transfer target should be a payable address at transfer node`
      );
    }
    return `${parsedRhs.name}.transfer(${parsedLhs.name});`;
  }

  parseCompareNode(data, variables) {
    const parsedLhs = parseVariable(
      data.var1,
      variables,
      this.structList,
      this.bitsMode
    );
    const parsedRhs = parseVariable(
      data.var2,
      variables,
      this.structList,
      this.bitsMode
    );
    if (parsedLhs.type !== parsedRhs.type) {
      const mismatch = checkIntUintMismatch(
        parsedLhs,
        parsedRhs,
        `${parsedLhs.name} ${data.comp} int(${parsedRhs.name})`,
        `int(${parsedLhs.name}) ${data.comp} ${parsedRhs.name}`
      );
      if (mismatch) {
        return mismatch;
      }
    }
    if (
      parsedLhs.type === 'string' &&
      parsedRhs.type === 'string' &&
      data.comp === '=='
    ) {
      return `keccak256(${parsedLhs.name}) == keccak256(${parsedRhs.name})`;
    }
    return `${parsedLhs.name} ${data.comp} ${parsedRhs.name}`;
  }
}
