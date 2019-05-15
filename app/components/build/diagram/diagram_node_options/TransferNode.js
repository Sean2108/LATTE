import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

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

class TransferNode extends React.Component {
  state = {
    variableSelected: '',
    value: ''
  };

  render() {
    const { classes, close, submit, varList } = this.props;

    return (
      <form>
        <FormControl className={classes.formControl}>
          <TextField
            label="Transfer to"
            className={classes.textField}
            value={this.state.variableSelected}
            onChange={event =>
              this.setState({ variableSelected: event.target.value })
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
            onChange={event => this.setState({ value: event.target.value })}
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
              onClick={() => {
                close();
                submit(`${this.state.value} to ${this.state.variableSelected}`, {...this.state, type: 'transfer'});
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

TransferNode.propTypes = {
  classes: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  varList: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(TransferNode);
