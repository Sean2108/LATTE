import { ipcRenderer } from 'electron';
import CodeGenUtils from './CodeGenUtils';

export default class Web3Utils {
  constructor(connection) {
    this.web3 = connection;
    this.codeGen = new CodeGenUtils();
  }

  handleError = (error, updateCompileError) => {
    if (error === Object(error)) {
      updateCompileError(error.error ? error.error : error.toString());
    } else {
      updateCompileError(error);
    }
  };

  getGasUsage(buildState, settings, history, updateCompileError) {
    this.requestCompile(
      updateCompileError,
      false,
      buildState,
      settings,
      (accs, deploymentJsonParam, contract) =>
        this.gasUsageCallback(
          buildState,
          updateCompileError,
          accs,
          deploymentJsonParam,
          contract,
          history
        )
    );
  }

  gasUsageCallback = (
    buildState,
    updateCompileError,
    accs,
    deploymentJsonParam,
    contract,
    history
  ) => {
    const deploymentJson = deploymentJsonParam;
    if (buildState.constructorParams.length) {
      deploymentJson.arguments = buildState.constructorParams.map(param => {
        switch (param.type) {
          case 'int':
            return 0;
          case 'string':
            return '';
          case 'bool':
            return true;
          default:
            return accs[0];
        }
      });
    }

    this.web3.eth
      .estimateGas({
        data: contract.deploy(deploymentJson).encodeABI(),
        from: accs[1]
      })
      .then(estGas => {
        if (history[history.length - 1] !== estGas) {
          history.push(estGas);
        }
        return null;
      })
      .catch(error => this.handleError(error, updateCompileError));
  };

  deploySmartContract = (buildState, settings, updateCompileError) => {
    this.requestCompile(
      updateCompileError,
      true,
      buildState,
      settings,
      (accs, deploymentJsonParam, contract) =>
        this.deployCallback(
          buildState,
          updateCompileError,
          accs,
          deploymentJsonParam,
          contract
        )
    );
  };

  deployCallback = (
    buildState,
    updateCompileError,
    accs,
    deploymentJsonParam,
    contract
  ) => {
    const deploymentJson = deploymentJsonParam;
    if (buildState.constructorParams.length) {
      deploymentJson.arguments = buildState.constructorParams.map(param =>
        param.type === 'int' ? parseInt(param.value, 10) : param.value
      );
    }
    contract
      .deploy(deploymentJson)
      .send({
        from: accs[0],
        gas: 15000000,
        gasPrice: '30000000'
      })
      .on('error', error => this.handleError(error, updateCompileError))
      .on('transactionHash', transactionHash => {
        console.log(`Transaction Hash: ${transactionHash}`);
        updateCompileError('');
      })
      .on('receipt', receipt => {
        console.log(`Contract Address: ${receipt.contractAddress}`); // contains the new contract address
        updateCompileError('');
      })
      .on('confirmation', confirmationNumber => {
        console.log(`Confirmation Number: ${confirmationNumber}`);
        updateCompileError('');
      });
  };

  compileCode = (payload, accs, updateCompileError, callback) => {
    const compiledCode = JSON.parse(payload);
    if ('errors' in compiledCode) {
      const error = compiledCode.errors[0].formattedMessage;
      if (!error.includes('Warning:')) {
        updateCompileError(error);
        return;
      }
    }
    if (!('contracts' in compiledCode)) {
      updateCompileError('Compilation failed, please try again.');
      return;
    }
    const abiDefinition = compiledCode.contracts['code.sol'].Code.abi;
    const contract = new this.web3.eth.Contract(abiDefinition);
    const byteCode =
      compiledCode.contracts['code.sol'].Code.evm.bytecode.object;
    const deploymentJson = { data: byteCode };
    callback(accs, deploymentJson, contract);
  };

  requestCompile = async (
    updateCompileError,
    logCode,
    buildState,
    settings,
    callback
  ) => {
    const accs = await this.web3.eth.getAccounts();
    if (accs.length === 0) {
      updateCompileError(
        "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
      );
      return;
    }
    const account = accs[0];
    this.web3.eth.defaultAccount = account;
    const code = this.codeGen.formCode(buildState, settings);
    if (logCode) {
      console.log(code);
    }
    ipcRenderer.send('request-compile', code);
    ipcRenderer.once('request-compile-complete', (event, payload) =>
      this.compileCode(payload, accs, updateCompileError, callback)
    );
  };
}
