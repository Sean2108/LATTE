import * as _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { readdir, readFile, writeFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import Tooltip from '@material-ui/core/Tooltip';
import Web3Utils from './build_utils/Web3Utils';
import CodeGenUtils from './build_utils/CodeGenUtils';
import BuildOptionsPopover from './build_components/popovers/BuildOptionsPopover';
import AsyncStatusButton from './build_components/AsyncStatusButton';
import { objectEquals } from './build_utils/TypeCheckFormattingUtils';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  tooltipFont: {
    fontSize: 14
  }
});

const DATA_OP = {
  LOAD_DATA: 1,
  SAVE_DATA: 2,
  SAVE_CONTRACT: 3
};

class BuildOptions extends React.Component {
  state = {
    anchorEl: null,
    dataOp: 1,
    fileName: '',
    files: [],
    compileError: ''
  };

  componentWillMount() {
    const { connection } = this.props;
    this.web3Utils = new Web3Utils(connection);
    this.codeGenUtils = new CodeGenUtils();
    this.getFiles();
  }

  componentDidUpdate(prevProps) {
    if (!objectEquals(this.props.buildState, prevProps.buildState)) {
      this.debouncedCompile();
    }
  }

  debouncedCompile = _.debounce(
    () =>
      this.web3Utils.requestCompile(
        this.updateCompileError,
        false,
        this.props.buildState,
        this.props.settings,
        () => {}
      ),
    500
  );

  handleClick = (event, dataOp) => {
    this.setState({
      anchorEl: event.currentTarget,
      dataOp
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

  getFiles = async () => {
    const items = await promisify(readdir)('saved_data');
    this.setState({ files: items.filter(item => item.slice(-5) === '.json') });
  };

  loadData = async fileName => {
    const data = await promisify(readFile)(join('saved_data', fileName));
    this.handleClose();
    this.props.loadState(JSON.parse(data));
    console.log(`Data loaded from ${fileName}`);
  };

  saveFile = async (directory, filename, data) => {
    await promisify(writeFile)(join(directory, filename), data);
    this.handleClose();
    this.getFiles();
  };

  updateCompileError = compileErrorParam => {
    this.setState({ compileError: compileErrorParam });
  };

  parseCompileError(compileError: string): string {
    if (!compileError) {
      return '';
    }
    if (compileError.includes('var memory ')) {
      const searchTerm = 'var memory ';
      const afterVarMemory = compileError.slice(
        compileError.indexOf(searchTerm) + searchTerm.length
      );
      const indexOfEqualToken = afterVarMemory.indexOf(' = ');
      return `Could not infer the type of ${afterVarMemory.slice(
        0,
        indexOfEqualToken
      )}`;
    }
    if (compileError.includes('Exceeds block gas limit')) {
      return 'Block gas limit exceeded, please increase gas limit';
    }
    return compileError;
  }

  renderButtons(classes, onback) {
    const buttonsInfo = [
      {
        tooltipText: 'Return to connect page',
        color: 'primary',
        text: 'Back',
        variant: 'outlined',
        onClick: onback
      },
      {
        tooltipText: 'Load saved progress',
        text: 'Load',
        color: 'secondary',
        variant: 'outlined',
        onClick: event => this.handleClick(event, DATA_OP.LOAD_DATA)
      },
      {
        tooltipText: 'Save saved progress',
        text: 'Save',
        color: 'secondary',
        variant: 'outlined',
        onClick: event => this.handleClick(event, DATA_OP.SAVE_DATA)
      },
      {
        tooltipText: 'Generate and save smart contract code',
        text: 'Generate Code',
        color: 'primary',
        variant: 'contained',
        onClick: event => this.handleClick(event, DATA_OP.SAVE_CONTRACT)
      }
    ];

    return buttonsInfo.map(
      ({ tooltipText, variant, text, onClick, color }) => (
        <Tooltip
          title={tooltipText}
          classes={{ tooltip: classes.tooltipFont }}
          key={text}
        >
          <Button
            variant={variant}
            color={color}
            className={classes.button}
            onClick={onClick}
          >
            {text}
          </Button>
        </Tooltip>
      )
    );
  }

  render() {
    const {
      classes,
      onback,
      buildState,
      settings,
      connection,
      loading
    } = this.props;
    const { anchorEl, dataOp, fileName, files, compileError } = this.state;

    const showError =
      buildState.buildError || this.parseCompileError(compileError);

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
            const data = JSON.stringify(buildState);
            const filename = `${fileName.replace(/\s+/g, '_')}.json`;
            this.saveFile('saved_data', filename, data);
            console.log(`Data written to file ${filename}`);
          }}
          loadData={() => this.loadData(fileName)}
          saveContract={() => {
            const code = this.codeGenUtils.formCode(buildState, settings);
            const filename = `${fileName.replace(/\s+/g, '_')}.sol`;
            this.saveFile('saved_contracts', filename, code);
            console.log(`Contract written to file ${filename}`);
          }}
          DATA_OP={DATA_OP}
        />

        {this.renderButtons(classes, onback)}

        <AsyncStatusButton
          loading={loading}
          success={!showError}
          tooltipText={`Deploy smart contract to ${
            connection.currentProvider.host
          }${showError ? `\nError: ${showError}` : ''}`}
          onClick={() =>
            this.web3Utils.deploySmartContract(
              buildState,
              settings,
              this.updateCompileError
            )
          }
        >
          Deploy
        </AsyncStatusButton>
      </div>
    );
  }
}

BuildOptions.propTypes = {
  classes: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
  buildState: PropTypes.object.isRequired,
  loadState: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildOptions);
