// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import type { Classes } from '../../../../types';

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

type Props = {
  classes: Classes,
  close: () => void,
  submit: (string, State & { type: 'assignment' }) => void,
  bitsMode: boolean
};

type State = {
  variableSelected: string,
  assignment: string,
  assignedVal: string,
  isMemory: boolean
};

class ReturnNode extends React.Component<Props, State> {
  state = {
    variableSelected: '',
    assignment: '=',
    assignedVal: '',
    isMemory: this.props.bitsMode
  };

  render(): React.Node {
    const { classes, close, submit, bitsMode } = this.props;

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
            onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
              this.setState({ variableSelected: event.currentTarget.value })
            }
            margin="dense"
          />
          <FormControl className={classes.innerFormControl}>
            <InputLabel htmlFor="assign">Assignment Type</InputLabel>
            <Select
              value={this.state.assignment}
              onChange={(event: SyntheticInputEvent<>) =>
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
            onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
              this.setState({ assignedVal: event.currentTarget.value })
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
                onChange={(event: SyntheticInputEvent<>): void =>
                  this.setState({
                    isMemory: event.target.checked
                  })
                }
                value={this.state.isMemory}
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
            onClick={(): void => {
              if (!this.state.variableSelected || !this.state.assignedVal) {
                return;
              }
              close();
              submit(
                `${this.state.variableSelected} ${this.state.assignment} ${this.state.assignedVal}`,
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

export default withStyles(styles, { withTheme: true })(ReturnNode);
