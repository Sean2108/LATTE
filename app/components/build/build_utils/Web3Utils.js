import { ipcRenderer } from 'electron';
import { CodeGenUtils } from './CodeGenUtils';

export class Web3Utils {
  constructor(connection) {
    this.web3 = connection;
    this.codeGen = new CodeGenUtils();
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
      let code = this.codeGen.formCode(buildState, bitsMode);
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
      let code = this.codeGen.formCode(buildState, bitsMode);
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
}
