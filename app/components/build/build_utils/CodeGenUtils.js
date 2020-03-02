import { toLowerCamelCase, isString } from './TypeCheckFormattingUtils';

export default class CodeGenUtils {
  formCode(buildState, settings) {
    let code = 'pragma solidity ^0.5.4;\ncontract Code {\n';
    code += this.formStructsEvents(buildState.entities, settings.bitsMode, false);
    code += this.formVars(buildState.variables);
    code += this.formStructsEvents(buildState.events, settings.bitsMode, true);
    for (let i = 0; i < buildState.tabsCode.length; i += 1) {
      code += this.formFunctionBody(buildState, i, settings);
    }
    return `${code}}`;
  }

  formFunctionBody(buildState, i, settings) {
    const functionName =
      buildState.tabs[i + 1] === 'Initial State'
        ? 'constructor'
        : `function ${toLowerCamelCase(buildState.tabs[i + 1])}`;
    const returnCode = this.formReturnCode(buildState.tabsReturn[i]);
    const requires = this.formRequires(
      buildState.tabsRequire[i],
      buildState.variables,
      settings.indentation
    );
    const params = this.formParams(buildState.tabsParams[i], settings.bitsMode);
    return `${functionName}(${params}) public ${
      buildState.isView[i] && buildState.tabs[i + 1] !== 'Initial State'
        ? 'view'
        : 'payable'
    } ${returnCode}{\n${requires}${buildState.tabsCode[i]}}\n`;
  }

  formReturnCode(returnType) {
    if (!returnType) {
      return '';
    }
    return ['bool', 'address', 'address payable'].includes(returnType) ||
      returnType.includes('bytes') ||
      returnType.includes('int')
      ? `returns (${returnType}) `
      : `returns (${returnType} memory) `;
  }

  formRequires(requires, variables, indentation) {
    return requires
      .filter(req => req.var1 && req.var2 && req.comp)
      .map(req => {
        if (
          isString(req.var1, variables) &&
          isString(req.var2, variables) &&
          req.comp === '=='
        ) {
          return `${indentation}require(keccak256(${req.var1}) == keccak256(${req.var2}), "${req.requireMessage}");\n`;
        }
        return `${indentation}require(${req.var1} ${req.comp} ${req.var2}, "${req.requireMessage}");\n`;
      })
      .join('');
  }

  formParams(params, bitsMode) {
    return params
      .filter(element => element.name)
      .map(element => {
        if (bitsMode && element.bits) {
          if (element.type === 'string') {
            return `bytes${element.bits} ${element.name}`;
          }
          return `${element.type}${element.bits} ${element.name}`;
        }
        if (element.type === 'string') {
          return `${element.type} memory ${element.name}`;
        }
        return `${element.type} ${element.name}`;
      })
      .join(', ');
  }

  formStructsEvents(entities, bitsMode, isEvent) {
    let code = '';
    for (const [name, params] of Object.entries(entities)) {
      code += `${isEvent ? 'event' : 'struct'} ${name} ${
        isEvent ? '(' : '{\n'
      }${params
        .filter(param => param.name)
        .map(param => {
          const suffix = isEvent ? '' : ';\n';
          if (bitsMode) {
            if (param.type === 'string' && param.bits !== '') {
              return `bytes${param.bits} ${param.name}${suffix}`;
            }
            if (param.bits) {
              return `${param.type}${param.bits} ${param.name}${suffix}`;
            }
          }
          return `${param.type} ${param.name}${suffix}`;
        })
        .join(isEvent ? ', ' : '')}${isEvent ? ')' : '}'}${
        isEvent ? ';' : ''
      }\n`;
    }
    return code;
  }

  formVars(variables) {
    let code = '';
    for (const [name, type] of Object.entries(variables)) {
      if (typeof type === 'object' && type.type === 'mapping') {
        code +=
          'inner' in type
            ? `mapping(${type.from} => mapping(${
                type.inner === 'address payable' ? 'address' : type.inner
              } => ${type.to})) ${name};\n`
            : `mapping(${type.from} => ${type.to}) ${name};\n`;
      } else if (type) {
        code += `${type} private ${name};\n`;
      }
    }
    return code;
  }
}
