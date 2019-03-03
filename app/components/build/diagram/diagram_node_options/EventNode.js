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
import ParamList from '../../ParamList';

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

class EventNode extends React.Component {
  state = {
    variableSelected: '',
    emitStatement: ''
  };

  render() {
    const { classes, close, submit, varList } = this.props;

    return (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="var">Event to emit</InputLabel>
        <Select
          value={this.state.variableSelected}
          onChange={event =>
            this.setState({
              variableSelected: event.target.value,
              emitStatement: `${event.target.value}()`
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

        {this.state.variableSelected !== '' &&
          varList[this.state.variableSelected].length > 0 && (
            <ParamList
              header={'Event Information'}
              params={varList[this.state.variableSelected]}
              tooltipText={
                'The information that will be emitted together with the event'
              }
              updateParams={params =>
                this.setState({
                  emitStatement: `${this.state.variableSelected}(${params
                    .map(param => param.value)
                    .join(', ')})`
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
              submit(this.state.emitStatement);
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

EventNode.propTypes = {
  classes: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  varList: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(EventNode);
