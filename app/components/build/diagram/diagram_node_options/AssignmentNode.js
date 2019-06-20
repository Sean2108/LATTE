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
import { Typography } from '@material-ui/core';
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
  innerFormControl: {
    margin: theme.spacing.unit,
    minWidth: 130
  },
  button: {
    margin: theme.spacing.unit
  },
  equals: {
    margin: '5% auto'
  },
  varSelect: {
    margin: theme.spacing.unit,
    minWidth: 150
  },
  textField: {
    marginLeft: 0,
    marginRight: 0
  }
});

class ReturnNode extends React.Component {
  state = {
    variableSelected: '',
    assignment: '=',
    assignedVal: '',
    isMemory: this.props.bitsMode
  };

  render() {
    const { classes, close, submit, varList, bitsMode } = this.props;

    return (
      <FormControl className={classes.formControl}>
        <div>
          <TextField
            id="standard-name"
            label="Variable Name"
            className={classes.textField}
            multiline
            rowsMax="3"
            value={this.state.variableSelected}
            onChange={event =>
              this.setState({ variableSelected: event.target.value })
            }
            margin="dense"
          />
          <FormControl className={classes.innerFormControl}>
            <InputLabel htmlFor="assign">Assignment Type</InputLabel>
            <Select
              value={this.state.assignment}
              onChange={event =>
                this.setState({ assignment: event.target.value })
              }
              inputProps={{
                name: 'assign',
                id: 'assign'
              }}
            >
              <MenuItem value="=">Is</MenuItem>
              <MenuItem value="+=">Increase by</MenuItem>
              <MenuItem value="-=">Decrease by</MenuItem>
              <MenuItem value="*=">Multiply by</MenuItem>
              <MenuItem value="/=">Divided by</MenuItem>
            </Select>
          </FormControl>
          <TextField
            id="standard-name"
            label="Assigned Value"
            multiline
            rowsMax="3"
            className={classes.textField}
            onChange={event =>
              this.setState({ assignedVal: event.target.value })
            }
            value={this.state.assignedVal}
            margin="dense"
          />
        </div>
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
        {bitsMode &&
          !this.state.isMemory &&
          'Warning: Storing the variable globally costs significantly more gas! Store globally only if the variable is shared between functions.'}

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
              close();
              submit(
                `${this.state.variableSelected} ${this.state.assignment} ${
                  this.state.assignedVal
                }`,
                { ...this.state, type: 'assignment' }
              );
            }}
          >
            Done
            <DoneIcon />
          </Button>
        </div>
      </FormControl>
    );
  }
}

ReturnNode.propTypes = {
  classes: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  varList: PropTypes.object,
  bitsMode: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(ReturnNode);
