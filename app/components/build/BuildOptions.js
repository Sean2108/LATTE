import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ipcRenderer } from 'electron';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { readdir, readFile, writeFile } from 'fs';
import { join } from 'path';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
});

class BuildOptions extends React.Component {

  state = {
    anchorEl: null,
    isSave: false,
    fileName: '',
    files: []
  };

  web3 = this.props.connection;

  deploySmartContract = () => {
    this.web3.eth.getAccounts((err, accs) => {
      if (err) {
        alert("There was an error fetching your accounts.");
        return;
      }
      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
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
        let byteCode = compiledCode.contracts['code.sol']['Code'].evm.bytecode.object;
        let deploymentJson = {data: byteCode};
        if (this.props.buildState.constructorParams.length) {
          deploymentJson['arguments'] = this.props.buildState.constructorParams.map(param => param.type === 'int' ? parseInt(param.value) : param.value);
        }
        contract.deploy(deploymentJson)
        .send({
          from: account,
          gas: 1500000,
          gasPrice: '30000000000000'
        })
        .on('error', (error) => { console.log(error) })
        .on('transactionHash', (transactionHash) => { alert(transactionHash) })
        .on('receipt', (receipt) => {
          console.log(receipt.contractAddress) // contains the new contract address
        })
        .on('confirmation', (confirmationNumber, receipt) => { alert(confirmationNumber) })
        .then((newContractInstance) => {
            console.log(newContractInstance.options.address) // instance with the new contract address
        });
        });
    });
  }

  toLowerCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
  }

  formCode() {
    let buildState = this.props.buildState;
    let code = 'pragma solidity ^0.5.4;\ncontract Code {\n';
    for (const [name, params] of Object.entries(buildState.entities)) {
      code += `struct ${name} {\n${params.filter(param => param.name).map(param => `${param.type} ${param.name};\n`).join('')}}\n`;
    }
    for (const [name, type] of Object.entries(buildState.variables)) {
      if (typeof type === 'object' && type.type === 'mapping') {
        code += `mapping(${type.from} => ${type.to}) ${name};\n`;
      }
      else {
        code += `${type} public ${name};\n`;
      }
    }
    for (const [name, params] of Object.entries(buildState.events)) {
      code += `event ${name} (${params.filter(param => param.name).map(param => `${param.type} ${param.name}`).join(', ')});\n`;
    }
    for (let i = 0; i < buildState.tabsCode.length; i++) {
      let functionName = buildState.tabs[i + 1] === 'Initial State' ? 'constructor' : `function ${this.toLowerCamelCase(buildState.tabs[i + 1])}`;
      let returnCode = buildState.tabsReturn[i] ? `returns (${buildState.tabsReturn[i]})` : '';
      let requires = buildState.tabsRequire[i].filter(req => req.var1 && req.var2 && req.comp).map(req => {
        if (this.isString(req.var1) && this.isString(req.var2) && req.comp == '==') {
          return `require(keccak256(${req.var1}) == keccak256(${req.var2}), "${req.requireMessage}");\n`;
        }
        return `require(${req.var1} ${req.comp} ${req.var2}, "${req.requireMessage}");\n`;
      }).join('');
      code += `${functionName}(${buildState.tabsParams[i].filter(element => element.name).map(element => element.type === 'string' ? `${element.type} memory ${element.name}` : `${element.type} ${element.name}`).join(', ')}) public payable ${returnCode} {
      ${requires}${buildState.tabsCode[i]}}\n`;
    }
    return code + '}';
  }

  isString(variable) {
    variable = variable.trim();
    return variable[0] === '\"' && variable[variable.length - 1] === '\"' || variable[0] === "\'" && variable[variable.length - 1] === "\'" ||
    this.props.buildState.variables[variable] === 'string';
  }

  handleClick = (event, isSave) => {
    this.setState({
      anchorEl: event.currentTarget,
      isSave: isSave
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
    readdir('reference_contracts', (err, items) => this.setState({files: items.filter(item => item.slice(-5) === '.json')}));
  }

  render() {
    const {
      classes,
      theme,
      onback,
      buildState,
      loadState
    } = this.props;
    const { anchorEl, isSave, fileName, files } = this.state;
    const open = Boolean(anchorEl);
    return ( <
      div >

      <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {isSave ? 
            <TextField
              id="standard-name"
              label="File Name"
              className={classes.textField}
              value={this.state.fileName}
              onChange={this.handleChange('fileName')}
              margin="normal"
            />
            : 
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="filename-simple">File Name</InputLabel>
              <Select
                value={this.state.fileName}
                onChange={this.handleChange('fileName')}
                inputProps={{
                  name: 'filename',
                  id: 'filename-simple',
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {files.map(item => <MenuItem value={item} key={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          }
            <
            Button variant = "contained"
            color = "primary"
            className = {
              classes.button
            }
            onClick = {
              () => {
                if (isSave) {
                  let data = JSON.stringify(buildState);
                  writeFile(join('reference_contracts', fileName.replace(/\s+/g,"_") + '.json'), data, (err) => {  
                    if (err) throw err;
                    console.log('Data written to file');
                    this.getFiles();
                    this.handleClose();
                  });
                }
                else if (!isSave) {
                  readFile(join('reference_contracts', fileName), (err, data) => {  
                    if (err) throw err;
                    loadState(JSON.parse(data));
                    console.log('Data loaded');
                    this.handleClose();
                  });
                }
              }
            } >
            Done <
            /Button>
      </Popover>

      <
      Button variant = "outlined"
      color = "primary"
      className = {
        classes.button
      }
      onClick = {
        onback
      } >
      Back <
      /Button>

      <
      Button variant = "outlined"
      color = "secondary"
      className = {
        classes.button
      }
      onClick = {
        (event) => {
          this.handleClick(event, false);
        }
      } >
      Load <
      /Button>

      <
      Button variant = "outlined"
      color = "secondary"
      className = {
        classes.button
      }
      onClick = {
        (event) => {
          this.handleClick(event, true);
        }
      } >
      Save <
      /Button>

      <
      Button variant = "contained"
      color = "primary"
      className = {
        classes.button
      }
      onClick = {
        () => console.log(this.formCode())
      } >
      Generate Code <
      /Button>

      <
      Button variant = "contained"
      color = "primary"
      className = {
        classes.button
      }
      onClick = {
        this.deploySmartContract
      } >
      Deploy <
      /Button> <
      /div>

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
