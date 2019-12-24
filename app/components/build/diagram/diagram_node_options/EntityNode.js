import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import ParamList from '../../build_components/ParamList';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  },
  fab: {
    margin: theme.spacing.unit
  },
  rightIcon: {
    display: 'flex',
    'justify-content': 'flex-end'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 400
  },
  button: {
    margin: theme.spacing.unit
  }
});

class EntityNode extends React.Component {
  state = {
    variableSelected: '',
    assignVar: '',
    params: [],
    isMemory: this.props.bitsMode
  };

  render() {
    const { classes, close, submit, varList, bitsMode } = this.props;

    return (
      <div>
        <TextField
          id="standard-name"
          label="Entity Name"
          className={classes.formControl}
          value={this.state.assignVar}
          onChange={event => this.setState({ assignVar: event.target.value })}
          margin="none"
        />
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="var">Entity Type</InputLabel>
          <Select
            value={this.state.variableSelected}
            onChange={event =>
              this.setState({
                variableSelected: event.target.value,
                params: []
              })
            }
            inputProps={{
              name: 'var',
              id: 'var'
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {Object.keys(varList).map(element => (
              <MenuItem key={element} value={element}>
                {element}
              </MenuItem>
            ))}
          </Select>
          <br />

          {bitsMode && (
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.isMemory}
                  onChange={event =>
                    this.setState({
                      isMemory: event.target.checked
                    })
                  }
                  value="isMemory"
                  color="primary"
                />
              }
              label="Store Locally"
            />
          )}

          {this.state.variableSelected !== '' &&
            varList[this.state.variableSelected].length > 0 && (
              <ParamList
                header={'Entity Information'}
                params={varList[this.state.variableSelected]}
                tooltipText={'The information that the entity will contain'}
                updateParams={params =>
                  this.setState({
                    params: params.map(param =>
                      param.value
                        ? `${param.value}`
                        : param.type === 'uint'
                        ? '0'
                        : param.type === 'string'
                        ? '""'
                        : param.type === 'bool'
                        ? 'false'
                        : 'an address'
                    )
                  })
                }
              />
            )}

          <div className={classes.rightIcon}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={close}
            >
              Cancel
              <CancelIcon />
            </Button>

            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={() => {
                if (!this.state.variableSelected) {
                  return;
                }
                close();
                submit(
                  `${this.state.assignVar} = ${
                    this.state.variableSelected
                  }(${this.state.params.join(', ')})`,
                  { ...this.state, type: 'entity' }
                );
              }}
            >
              Done
              <DoneIcon />
            </Button>
          </div>
        </FormControl>
      </div>
    );
  }
}

EntityNode.propTypes = {
  classes: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  varList: PropTypes.object,
  bitsMode: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(EntityNode);
