import { ipcRenderer } from 'electron';
import CodeGenUtils from './CodeGenUtils';

export default class Web3Utils {
  constructor(connection) {
    this.web3 = connection;
    this.codeGen = new CodeGenUtils();
  }

  getGasUsage(buildState, bitsMode, tabIndex, history, updateCompileError) {
    this.web3.eth.getAccounts((err, accs) => {
      if (err) {
        updateCompileError('There was an error fetching your accounts.');
        return;
      }
      const account = accs[0];
      this.web3.eth.defaultAccount = account;
      const code = this.codeGen.formCode(buildState, bitsMode);
      ipcRenderer.send('request-compile', code);
      ipcRenderer.on('request-compile-complete', (event, payload) => {
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
                return account;
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
      });
    });
  }

  deploySmartContract = (buildState, bitsMode, updateCompileError) => {
    this.web3.eth.getAccounts((err, accs) => {
      if (err) {
        alert('There was an error fetching your accounts.'); // eslint-disable-line no-alert
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
      console.log(code);
      ipcRenderer.send('request-compile', code);
      ipcRenderer.on('request-compile-complete', (event, payload) => {
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
        if (buildState.constructorParams.length) {
          deploymentJson.arguments = buildState.constructorParams.map(param =>
            param.type === 'int' ? parseInt(param.value, 10) : param.value
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
            updateCompileError(error); // eslint-disable-line no-alert
          })
          .on('transactionHash', transactionHash => {
            alert(`Transaction Hash: ${transactionHash}`); // eslint-disable-line no-alert
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
      });
    });
  };
}
