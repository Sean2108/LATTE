import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import BuildOptionsPopover from './BuildOptionsPopover';
import { readdir, readFile, writeFile } from 'fs';
import { join } from 'path';
import Tooltip from '@material-ui/core/Tooltip';
import { Web3Utils } from './Web3Utils';

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

  componentWillMount() {
    this.web3Utils = new Web3Utils(this.props.connection);
    this.getFiles();    
  }

  toLowerCamelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
      })
      .replace(/\s+/g, '');
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

  getFiles() {
    readdir('saved_data', (err, items) =>
      this.setState({ files: items.filter(item => item.slice(-5) === '.json') })
    );
  }

  render() {
    const {
      classes,
      theme,
      onback,
      buildState,
      loadState,
      bitsMode
    } = this.props;
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
            let code = this.web3Utils.formCode(buildState, bitsMode);
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
          title={`Deploy smart contract to ${this.props.connection.currentProvider.host}`}
          classes={{ tooltip: classes.tooltipFont }}
        >
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => this.web3Utils.deploySmartContract(buildState, bitsMode)}
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
  loadState: PropTypes.func.isRequired,
  bitsMode: PropTypes.bool.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildOptions);
