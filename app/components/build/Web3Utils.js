import { ipcRenderer } from 'electron';

export class Web3Utils {
  constructor(connection) {
    this.web3 = connection;
  }

  getGasUsage(buildState, bitsMode, tabIndex, history) {
    let funcName = buildState.tabs[tabIndex + 1];
    let gas;
    this.web3.eth.getAccounts((err, accs) => {
      if (err) {
        alert('There was an error fetching your accounts.');
        return;
      }
      let account = accs[0];
      this.web3.eth.defaultAccount = account;
      let code = this.formCode(buildState, bitsMode);
      ipcRenderer.send('request-compile', code);
      ipcRenderer.on('request-compile-complete', (event, payload) => {
        let compiledCode = JSON.parse(payload);
        if ('errors' in compiledCode && !('contracts' in compiledCode)) {
          alert(compiledCode['errors'][0]['formattedMessage']);
          return;
        }
        let abiDefinition = compiledCode.contracts['code.sol']['Code'].abi;
        let contract = new this.web3.eth.Contract(abiDefinition);
        let byteCode =
          compiledCode.contracts['code.sol']['Code'].evm.bytecode.object;
        let deploymentJson = { data: byteCode };
        if (buildState.constructorParams.length) {
          deploymentJson['arguments'] = buildState.constructorParams.map(
            param => {
              switch (param.type) {
                case 'int':
                  return 0;
                case 'string':
                  return '';
                case 'bool':
                  return true;
                default:
                  return account;
              }
            }
          );
        }
        this.web3.eth.estimateGas(
          { data: contract.deploy(deploymentJson).encodeABI(), from: accs[1] },
          (err, gas) => {
            if (err) {
              console.log(err);
            }
            if (history[history.length - 1] !== gas) {
              history.push(gas);
            }
          }
        );
      });
    });
  }

  deploySmartContract = (buildState, bitsMode) => {
    this.web3.eth.getAccounts((err, accs) => {
      if (err) {
        alert('There was an error fetching your accounts.');
        return;
      }
      if (accs.length == 0) {
        alert(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }

      let account = accs[0];
      this.web3.eth.defaultAccount = account;
      let code = this.formCode(buildState, bitsMode);
      console.log(code);
      ipcRenderer.send('request-compile', code);
      ipcRenderer.on('request-compile-complete', (event, payload) => {
        let compiledCode = JSON.parse(payload);
        if ('errors' in compiledCode && !('contracts' in compiledCode)) {
          alert(compiledCode['errors'][0]['formattedMessage']);
          return;
        }
        let abiDefinition = compiledCode.contracts['code.sol']['Code'].abi;
        let contract = new this.web3.eth.Contract(abiDefinition);
        let byteCode =
          compiledCode.contracts['code.sol']['Code'].evm.bytecode.object;
        let deploymentJson = { data: byteCode };
        if (buildState.constructorParams.length) {
          deploymentJson['arguments'] = buildState.constructorParams.map(
            param =>
              param.type === 'int' ? parseInt(param.value) : param.value
          );
        }
        contract
          .deploy(deploymentJson)
          .send({
            from: account,
            gas: 15000000000,
            gasPrice: '30000000000000'
          })
          .on('error', error => {
            console.log(error);
          })
          .on('transactionHash', transactionHash => {
            alert(`Transaction Hash: ${transactionHash}`);
          })
          .on('receipt', receipt => {
            alert(`Contract Address: ${receipt.contractAddress}`); // contains the new contract address
          })
          .on('confirmation', (confirmationNumber, receipt) => {
            alert(`Confirmation Number: ${confirmationNumber}`);
          });
      });
    });
  };

  toLowerCamelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  formCode(buildState, bitsMode) {
    let code = 'pragma solidity ^0.5.4;\ncontract Code {\n';
    code += this.formStructsEvents(buildState.entities, bitsMode, false);
    code += this.formVars(buildState.variables);
    code += this.formStructsEvents(buildState.events, bitsMode, true);
    for (let i = 0; i < buildState.tabsCode.length; i++) {
      code += this.formFunctionBody(buildState, i, bitsMode);
    }
    return code + '}';
  }

  formFunctionBody(buildState, i, bitsMode) {
    let functionName =
      buildState.tabs[i + 1] === 'Initial State'
        ? 'constructor'
        : `function ${this.toLowerCamelCase(buildState.tabs[i + 1])}`;
    let returnCode = this.formReturnCode(buildState.tabsReturn[i]);
    let requires = this.formRequires(buildState.tabsRequire[i], buildState.variables);
    let params = this.formParams(buildState.tabsParams[i], bitsMode);
    return `${functionName}(${params}) public ${
      buildState.isView[i] && buildState.tabs[i + 1] !== 'Initial State'
        ? 'view'
        : 'payable'
    } ${returnCode} {
          ${requires}${buildState.tabsCode[i]}}\n`;
  }

  formReturnCode(returnType) {
    if (!returnType) {
      return '';
    }
    return ['bool', 'address', 'address payable'].includes(returnType) ||
      returnType.includes('bytes') ||
      returnType.includes('int')
      ? `returns (${returnType})`
      : `returns (${returnType} memory)`;
  }

  formRequires(requires, variables) {
    return requires
      .filter(req => req.var1 && req.var2 && req.comp)
      .map(req => {
        if (
          this.isString(req.var1, variables) &&
          this.isString(req.var2, variables) &&
          req.comp == '=='
        ) {
          return `require(keccak256(${req.var1}) == keccak256(${req.var2}), "${req.requireMessage}");\n`;
        }
        return `require(${req.var1} ${req.comp} ${req.var2}, "${req.requireMessage}");\n`;
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
            else {
              return `${element.type}${element.bits} ${element.name}`;
            }
          }
          if (element.type === 'string') {
            return `${element.type} memory ${element.name}`;
          }
          return `${element.type} ${element.name}`;
        }
      )
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
          let suffix = isEvent ? '' : ';\n';
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

  isString(variable, vars) {
    variable = variable.trim();
    return (
      (variable[0] === '"' && variable[variable.length - 1] === '"') ||
      (variable[0] === "'" && variable[variable.length - 1] === "'") ||
      vars[variable] === 'string'
    );
  }
}
