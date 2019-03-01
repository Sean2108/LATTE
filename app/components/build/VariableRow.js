import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  formControl: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 150
  },
  textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
  },
});

class VariableRow extends React.Component {

  render() {
    const {
      classes,
      theme,
      updateVariables,
      val
    } = this.props;
    return ( <
      div >

      <
      FormControl className = {
        classes.formControl
      } >
      <TextField
          label="Variable Name"
          className={classes.textField}
          value={val.displayName}
          onChange={event => updateVariables({...val, displayName: event.target.value, name: event.target.value.toLowerCase().trim().replace(/\s/g, '_')})}
          margin="normal"
        /> < /
      FormControl >

      <
      FormControl className = {
        classes.formControl
      } >
      <
      InputLabel htmlFor = "protocol" > Variable Type < /InputLabel> <
      Select value = {
        val.type
      }
      onChange = {
        event => updateVariables({...val, type: event.target.value})
      }
      inputProps = {
        {
          name: 'Var Type',
          id: 'type',
        }
      } >
      <
      MenuItem value = "uint" > Integer < /MenuItem> <
      MenuItem value = "bool" > Boolean < /MenuItem> <
      MenuItem value = "address" > Address < /MenuItem> <
      MenuItem value = "string" > String < /MenuItem> < /
      Select > <
      /FormControl>

      <
      /div>

    );
  }
}

VariableRow.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  updateVariables: PropTypes.func.isRequired,
  val: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(VariableRow);
