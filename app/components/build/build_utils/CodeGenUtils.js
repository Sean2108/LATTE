// @flow

import { toLowerCamelCase, isString } from './TypeCheckFormattingUtils';
import type {
  BuildState,
  SettingsObj,
  RequireObj,
  VariablesLookupType,
  StructLookupType,
  VariableObj
} from '../../../types';

export default class CodeGenUtils {
  formCode(buildState: BuildState, settings: SettingsObj): string {
    let code = 'pragma solidity ^0.5.4;\ncontract Code {\n';
    code += this.formStructsEvents(
      buildState.entities,
      settings.bitsMode,
      false
    );
    code += this.formVars(buildState.variables);
    code += this.formStructsEvents(buildState.events, settings.bitsMode, true);
    for (let i = 0; i < buildState.tabsCode.length; i += 1) {
      code += this.formFunctionBody(buildState, i, settings);
    }
    return `${code}}`;
  }

  formFunctionBody(
    buildState: BuildState,
    i: number,
    settings: SettingsObj
  ): string {
    const functionName =
      buildState.tabs[i + 1] === 'Initial State'
        ? 'constructor'
        : `function ${toLowerCamelCase(buildState.tabs[i + 1])}`;
    const returnCode = this.formReturnCode(buildState.tabsReturn[i]);
    const requires = this.formRequires(
      buildState.tabsRequire[i],
      buildState.variables,
      settings.indentation || '    '
    );
    const params = this.formParams(buildState.tabsParams[i], settings.bitsMode || false);
    return `${functionName}(${params}) public ${
      buildState.isView[i] && buildState.tabs[i + 1] !== 'Initial State'
        ? 'view'
        : 'payable'
    } ${returnCode}{\n${requires}${buildState.tabsCode[i]}}\n`;
  }

  formReturnCode(returnType: ?string): string {
    if (!returnType) {
      return '';
    }
    return ['bool', 'address', 'address payable'].includes(returnType) ||
      returnType.includes('bytes') ||
      returnType.includes('int')
      ? `returns (${returnType}) `
      : `returns (${returnType} memory) `;
  }

  formRequires(
    requires: Array<RequireObj>,
    variables: VariablesLookupType,
    indentation: string
  ): string {
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

  formParams(params: Array<VariableObj>, bitsMode: boolean) {
    return params
      .filter((element: VariableObj): boolean => !!element.name)
      .map((element: VariableObj): string => {
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

  formStructsEvents(
    entities: StructLookupType,
    bitsMode: boolean,
    isEvent: boolean
  ): string {
    let code = '';
    for (const name of Object.keys(entities)) {
      const params = entities[name];
      code += `${isEvent ? 'event' : 'struct'} ${name} ${
        isEvent ? '(' : '{\n'
      }${params
        .filter(param => param.name)
        .map(param => {
          const suffix = isEvent ? '' : ';\n';
          if (bitsMode) {
            if (param.type === 'string' && param.bits) {
              return `bytes${param.bits} ${param.name}${suffix}`;
            }
            if (param.bits) {
              return `${param.type}${param.bits} ${param.name}${suffix}`;
            }
            return `${param.type} ${param.name}${suffix}`;
          }
          return `${param.type} ${param.name}${suffix}`;
        })
        .join(isEvent ? ', ' : '')}${isEvent ? ')' : '}'}${
        isEvent ? ';' : ''
      }\n`;
    }
    return code;
  }

  formVars(variables: VariablesLookupType): string {
    let code = '';
    for (const name of Object.keys(variables)) {
      const type = variables[name];
      if (typeof type === 'object' && type.type === 'mapping') {
        code += type.inner
          ? `mapping(${type.from} => mapping(${
              type.inner === 'address payable' ? 'address' : type.inner
            } => ${type.to})) ${name};\n`
          : `mapping(${type.from} => ${type.to}) ${name};\n`;
      } else if (typeof type === 'string' && type) {
        code += `${type} private ${name};\n`;
      }
    }
    return code;
  }
}
