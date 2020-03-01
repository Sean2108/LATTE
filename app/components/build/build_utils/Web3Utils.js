import { ipcRenderer } from 'electron';
import CodeGenUtils from './CodeGenUtils';

export default class Web3Utils {
  constructor(connection) {
    this.web3 = connection;
    this.codeGen = new CodeGenUtils();
  }

  getGasUsage(buildState, bitsMode, history, updateCompileError) {
    this.requestCompile(
      updateCompileError,
      false,
      buildState,
      bitsMode,
      (accs, deploymentJsonParam, contract) => {
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
        this.web3.eth.estimateGas(
          { data: contract.deploy(deploymentJson).encodeABI(), from: accs[1] },
          (estGasErr, estGas) => {
            if (estGasErr) {
              updateCompileError(estGasErr);
            }
            if (history[history.length - 1] !== estGas) {
              history.push(estGas);
            }
          }
        );
      }
    );
  }

  deploySmartContract = (buildState, bitsMode, updateCompileError) => {
    this.requestCompile(
      updateCompileError,
      true,
      buildState,
      bitsMode,
      (accs, deploymentJsonParam, contract) => {
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
          .on('error', error => {
            if (error === Object(error)) {
              if (error.toString().includes('Exceeds block gas limit')) {
                updateCompileError(
                  'Error: Block gas limit exceeded, please increase gas limit'
                );
              } else {
                updateCompileError(error.error);
              }
            } else {
              updateCompileError(error);
            }
          })
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
      }
    );
  };

  requestCompile = (
    updateCompileError,
    logCode,
    buildState,
    bitsMode,
    callback
  ) => {
    this.web3.eth.getAccounts((err, accs) => {
      if (err) {
        return;
      }
      if (accs.length === 0) {
        console.log(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }
      const account = accs[0];
      this.web3.eth.defaultAccount = account;
      const code = this.codeGen.formCode(buildState, bitsMode);
      if (logCode) {
        console.log(code);
      }
      ipcRenderer.send('request-compile', code);
      ipcRenderer.once('request-compile-complete', (event, payload) => {
        const compiledCode = JSON.parse(payload);
        if ('errors' in compiledCode && !('contracts' in compiledCode)) {
          updateCompileError(compiledCode.errors[0].formattedMessage);
          return;
        }
        const abiDefinition = compiledCode.contracts['code.sol'].Code.abi;
        const contract = new this.web3.eth.Contract(abiDefinition);
        const byteCode =
          compiledCode.contracts['code.sol'].Code.evm.bytecode.object;
        const deploymentJson = { data: byteCode };
        callback(accs, deploymentJson, contract);
      });
    });
  };
}
