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

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 150
  },
});

class StateRow extends React.Component {

  state = {
    varName: '',
    varType: 'int'
  }

  render() {
    const {
      classes,
      theme,
      updateVariables
    } = this.props;
    return ( <
      div >

      <
      FormControl className = {
        classes.formControl
      } >
      <
      InputLabel htmlFor = "name-simple" > Variable Name < /InputLabel> <
      Input id = "varName"
      onChange = {
        event => {
          this.setState({
          varName: event.target.value
        })
        updateVariables({name: event.target.value, type: this.state.varType});
      }
      }
      /> < /
      FormControl >

      <
      FormControl className = {
        classes.formControl
      } >
      <
      InputLabel htmlFor = "protocol" > Variable Type < /InputLabel> <
      Select value = {
        this.state.varType
      }
      onChange = {
        event => {
          this.setState({
          varType: event.target.value
        })
        updateVariables({name: this.state.varName, type: event.target.value});
      }
      }
      inputProps = {
        {
          name: 'Var Type',
          id: 'type',
        }
      } >
      <
      MenuItem value = "int" > Integer < /MenuItem> <
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

StateRow.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  updateVariables: PropTypes.func.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(StateRow);
