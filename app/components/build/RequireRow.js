import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 250
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  }
});

class RequireRow extends React.Component {
  validate() {
    let lhs = this.props.buildParser.parseVariable(this.props.var1);
    let rhs = this.props.buildParser.parseVariable(this.props.var2);
    if (lhs.type === 'var') {
      alert('left variable type is unknown');
    }
    if (rhs.type === 'var') {
      alert('right variable type is unknown');
    }
    if (lhs.type !== rhs.type) {
      alert('left and right variables are of differing types');
    }
  }

  handleChange = name => event => {
    let state = { ...this.props.require, [name]: event.target.value };
    if (this.props.buildParser) {
      try {
        state.var1 = this.props.buildParser.parseVariable(
          state.displayVar1
        ).name;
        state.var2 = this.props.buildParser.parseVariable(
          state.displayVar2
        ).name;
      } catch (err) {
        console.log(err);
      }
    }
    this.props.updateRequire(state);
  };

  render() {
    const {
      classes,
      theme,
      key,
      vars,
      showMessage,
      submit,
      require
    } = this.props;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            id="standard-name"
            label="Variable 1"
            className={classes.textField}
            value={require.displayVar1}
            onChange={this.handleChange('displayVar1')}
            margin="none"
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="protocol"> Comparator </InputLabel>
          <Select
            value={require.comp}
            onChange={this.handleChange('comp')}
            inputProps={{
              name: 'Comparator',
              id: 'comp'
            }}
          >
            <MenuItem value="=="> is </MenuItem>
            <MenuItem value="!="> is not </MenuItem>
            <MenuItem value=">"> greater than </MenuItem>
            <MenuItem value="<"> less than </MenuItem>
            <MenuItem value=">="> greater than or equals to </MenuItem>
            <MenuItem value="<="> less than or equals to </MenuItem>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField
            id="standard-name"
            label="Variable 2"
            className={classes.textField}
            value={require.displayVar2}
            onChange={this.handleChange('displayVar2')}
            margin="none"
          />
        </FormControl>

        {showMessage && (
          <FormControl className={classes.formControl}>
            <TextField
              id="standard-name"
              label="Failure Message"
              className={classes.textField}
              value={require.requireMessage}
              onChange={this.handleChange('requireMessage')}
              margin="none"
            />
          </FormControl>
        )}
      </div>
    );
  }
}

RequireRow.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  key: PropTypes.any,
  vars: PropTypes.object.isRequired,
  showMessage: PropTypes.bool,
  updateRequire: PropTypes.func.isRequired,
  buildParser: PropTypes.object,
  require: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(RequireRow);
