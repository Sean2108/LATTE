import * as _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { readdir, readFile, writeFile } from 'fs';
import { join } from 'path';
import Tooltip from '@material-ui/core/Tooltip';
import Web3Utils from './build_utils/Web3Utils';
import CodeGenUtils from './build_utils/CodeGenUtils';
import BuildOptionsPopover from './BuildOptionsPopover';
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
    5000
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

  getFiles() {
    readdir('saved_data', (err, items) =>
      this.setState({ files: items.filter(item => item.slice(-5) === '.json') })
    );
  }

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
    return compileError;
  }

  render() {
    const {
      classes,
      onback,
      buildState,
      loadState,
      settings,
      connection,
      loading
    } = this.props;
    const { anchorEl, dataOp, fileName, files, compileError } = this.state;

    const DATA_OP = {
      LOAD_DATA: 1,
      SAVE_DATA: 2,
      SAVE_CONTRACT: 3
    };

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
              console.log(JSON.parse(data));
              loadState(JSON.parse(data));
              console.log(`Data loaded from ${fileName}`);
            })
          }
          saveContract={() => {
            const code = this.codeGenUtils.formCode(buildState, settings);
            const filename = `${fileName.replace(/\s+/g, '_')}.sol`;
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
