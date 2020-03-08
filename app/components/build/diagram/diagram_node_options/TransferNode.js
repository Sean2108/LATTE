// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
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
  button: {
    margin: theme.spacing.unit
  }
});

type Props = {
  classes: Classes,
  close: () => void,
  submit: (string, State & { type: 'transfer' }) => void
};

type State = {
  variableSelected: string,
  value: string
};

class TransferNode extends React.Component<Props, State> {
  state = {
    variableSelected: '',
    value: ''
  };

  render(): React.Node {
    const { classes, close, submit } = this.props;

    return (
      <form>
        <FormControl className={classes.formControl}>
          <TextField
            label="Transfer to"
            className={classes.textField}
            value={this.state.variableSelected}
            onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
              this.setState({ variableSelected: event.currentTarget.value })
            }
            margin="none"
          />
        </FormControl>
        <br />
        <FormControl className={classes.formControl}>
          <TextField
            label="Value"
            className={classes.textField}
            value={this.state.value}
            onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
              this.setState({ value: event.currentTarget.value })
            }
            margin="none"
          />
          <br />

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
                if (!this.state.value || !this.state.variableSelected) {
                  return;
                }
                close();
                submit(
                  `${this.state.value} to ${this.state.variableSelected}`,
                  { ...this.state, type: 'transfer' }
                );
              }}
            >
              Done
              <DoneIcon />
            </Button>
          </div>
        </FormControl>
      </form>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TransferNode);
