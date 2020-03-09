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
  submit: (string, State & { type: 'return' }) => void
};

type State = {
  variableSelected: string
};

class ReturnNode extends React.Component<Props, State> {
  state = {
    variableSelected: ''
  };

  render(): React.Node {
    const { classes, close, submit } = this.props;

    return (
      <FormControl className={classes.formControl}>
        <TextField
          id="standard-name"
          label="Return Variable"
          className={classes.textField}
          value={this.state.variableSelected}
          onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
            this.setState({ variableSelected: event.currentTarget.value })
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
              close();
              submit(this.state.variableSelected, {
                ...this.state,
                type: 'return'
              });
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
