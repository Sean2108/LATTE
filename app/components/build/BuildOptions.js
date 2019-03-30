import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ipcRenderer } from 'electron';
import BuildOptionsPopover from './BuildOptionsPopover';
import { readdir, readFile, writeFile } from 'fs';
import { join } from 'path';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  tooltipFont: {
    fontSize: 14
  }
});

class BuildOptions extends React.Component {
  state = {
    anchorEl: null,
    dataOp: 1,
    fileName: '',
    files: []
  };

  web3 = this.props.connection;

  deploySmartContract = () => {
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

      let accounts = accs;
      let account = accounts[0];
      this.web3.eth.defaultAccount = account;
      let code = this.formCode();
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
        if (this.props.buildState.constructorParams.length) {
          deploymentJson[
            'arguments'
          ] = this.props.buildState.constructorParams.map(
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

  formCode() {
    let buildState = this.props.buildState;
    let code = 'pragma solidity ^0.5.4;\ncontract Code {\n';
    for (const [name, params] of Object.entries(buildState.entities)) {
      code += `struct ${name} {\n${params
        .filter(param => param.name)
        .map(param => `${param.type} ${param.name};\n`)
        .join('')}}\n`;
    }
    for (const [name, type] of Object.entries(buildState.variables)) {
      if (typeof type === 'object' && type.type === 'mapping') {
        code += 'inner' in type ? `mapping(${type.from} => mapping(${type.inner === 'address payable' ? 'address' : type.inner} => ${type.to})) ${name};\n` : `mapping(${type.from} => ${type.to}) ${name};\n`;
      } else if (type) {
        code += `${type} public ${name};\n`;
      }
    }
    for (const [name, params] of Object.entries(buildState.events)) {
      code += `event ${name}(${params
        .filter(param => param.name)
        .map(param => `${param.type} ${param.name}`)
        .join(', ')});\n`;
    }
    for (let i = 0; i < buildState.tabsCode.length; i++) {
      let functionName =
        buildState.tabs[i + 1] === 'Initial State'
          ? 'constructor'
          : `function ${this.toLowerCamelCase(buildState.tabs[i + 1])}`;
      let returnCode = buildState.tabsReturn[i]
        ? ['bool', 'address', 'address payable', 'uint', 'int'].includes(buildState.tabsReturn[i]) 
        ? `returns (${buildState.tabsReturn[i]})`
        : `returns (${buildState.tabsReturn[i]} memory)`
        : '';
      let requires = buildState.tabsRequire[i]
        .filter(req => req.var1 && req.var2 && req.comp)
        .map(req => {
          if (
            this.isString(req.var1) &&
            this.isString(req.var2) &&
            req.comp == '=='
          ) {
            return `require(keccak256(${req.var1}) == keccak256(${
              req.var2
            }), "${req.requireMessage}");\n`;
          }
          return `require(${req.var1} ${req.comp} ${req.var2}, "${
            req.requireMessage
          }");\n`;
        })
        .join('');
      code += `${functionName}(${buildState.tabsParams[i]
        .filter(element => element.name)
        .map(
          element =>
            element.type === 'string'
              ? `${element.type} memory ${element.name}`
              : `${element.type} ${element.name}`
        )
        .join(', ')}) public payable ${returnCode} {
      ${requires}${buildState.tabsCode[i]}}\n`;
    }
    return code + '}';
  }

  isString(variable) {
    variable = variable.trim();
    return (
      (variable[0] === '"' && variable[variable.length - 1] === '"') ||
      (variable[0] === "'" && variable[variable.length - 1] === "'") ||
      this.props.buildState.variables[variable] === 'string'
    );
  }

  handleClick = (event, dataOp) => {
    this.setState({
      anchorEl: event.currentTarget,
      dataOp: dataOp
    });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
      fileName: ''
    });
  };

  componentWillMount() {
    this.getFiles();
  }

  getFiles() {
    readdir('saved_data', (err, items) =>
      this.setState({ files: items.filter(item => item.slice(-5) === '.json') })
    );
  }

  render() {
    const { classes, theme, onback, buildState, loadState } = this.props;
    const { anchorEl, dataOp, fileName, files } = this.state;
    const open = Boolean(anchorEl);

    const DATA_OP = {
      LOAD_DATA: 1,
      SAVE_DATA: 2,
      SAVE_CONTRACT: 3
    };

    return (
      <div>
        <BuildOptionsPopover
          anchorEl={anchorEl}
          dataOp={dataOp}
          fileName={fileName}
          files={files}
          handleClose={this.handleClose}
          handleChange={this.handleChange}
          saveData={() => {
            let data = JSON.stringify(buildState);
            let filename = fileName.replace(/\s+/g, '_') + '.json';
            writeFile(join('saved_data', filename), data, err => {
              if (err) throw err;
              this.handleClose();
              console.log(`Data written to file ${filename}`);
              this.getFiles();
            });
          }}
          loadData={() =>
            readFile(join('saved_data', fileName), (err, data) => {
              if (err) throw err;
              this.handleClose();
              loadState(JSON.parse(data));
              console.log(`Data loaded from ${fileName}`);
            })
          }
          saveContract={() => {
            let code = this.formCode();
            console.log(code);
            let filename = fileName.replace(/\s+/g, '_') + '.sol';
            writeFile(join('saved_contracts', filename), code, err => {
              if (err) throw err;
              this.handleClose();
              console.log(`Contract written to file ${filename}`);
              this.getFiles();
            });
          }}
          DATA_OP={DATA_OP}
        />

        <Tooltip
          title="Return to connect page"
          classes={{ tooltip: classes.tooltipFont }}
        >
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={onback}
          >
            Back
          </Button>
        </Tooltip>

        <Tooltip
          title="Load saved progress"
          classes={{ tooltip: classes.tooltipFont }}
        >
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            onClick={event => {
              this.handleClick(event, DATA_OP.LOAD_DATA);
            }}
          >
            Load
          </Button>
        </Tooltip>

        <Tooltip
          title="Save current progress"
          classes={{ tooltip: classes.tooltipFont }}
        >
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            onClick={event => {
              this.handleClick(event, DATA_OP.SAVE_DATA);
            }}
          >
            Save
          </Button>
        </Tooltip>

        <Tooltip
          title="Generate and save smart contract code"
          classes={{ tooltip: classes.tooltipFont }}
        >
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={event => {
              this.handleClick(event, DATA_OP.SAVE_CONTRACT);
            }}
          >
            Generate Code
          </Button>
        </Tooltip>

        <Tooltip
          title={`Deploy smart contract to ${this.web3.currentProvider.host}`}
          classes={{ tooltip: classes.tooltipFont }}
        >
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={this.deploySmartContract}
          >
            Deploy
          </Button>
        </Tooltip>
      </div>
    );
  }
}

BuildOptions.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
  buildState: PropTypes.object.isRequired,
  loadState: PropTypes.func.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildOptions);
