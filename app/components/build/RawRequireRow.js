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
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 150
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
});

class RawStateRow extends React.Component {

      state = {
        comp: '==',
        var1: '',
        var2: '',
        requireMessage: '',
      }
      
      changeCondition = (newState) => {
        this.props.submit(`${newState.var1} ${newState.comp} ${newState.var2}`)
      };

      handleChange = name => event => {
        let newState = {
          ...this.state,
          [name]: event.target.value
        };
          this.setState(newState);
          this.changeCondition(newState);
      };

      render() {
        const {
          classes,
          theme,
          key,
          vars,
          showMessage,
          submit
        } = this.props;
        return ( <
          div >

          <
          FormControl className = {
            classes.formControl
          } >
          <TextField
            id="standard-name"
            label="Variable 1"
            className={classes.textField}
            value={this.state.var1}
            onChange={this.handleChange('var1')}
            margin="none"
          /> < /
          FormControl >

          <
          FormControl className = {
            classes.formControl
          } >
          <
          InputLabel htmlFor = "protocol" > Comparator < /InputLabel> <
          Select value = {
            this.state.comp
          }
          onChange = {this.handleChange('comp')}
          inputProps = {
            {
              name: 'Comparator',
              id: 'comp',
            }
          } >
          <
          MenuItem value = "==" > is < /MenuItem> <
          MenuItem value = ">" > greater than < /MenuItem> <
          MenuItem value = "<" > less than < /MenuItem> <
          MenuItem value = ">=" > greater than or equals to < /MenuItem> <
          MenuItem value = "<=" > less than or equals to < /MenuItem> < /
          Select > <
          /FormControl>

          <
          FormControl className = {
            classes.formControl
          } >
          <TextField
            id="standard-name"
            label="Variable 2"
            className={classes.textField}
            value={this.state.var2}
            onChange={this.handleChange('var2')}
            margin="none"
          /> < /
          FormControl >

          {showMessage && 
            <
            FormControl className = {
              classes.formControl
            } >
            <
            InputLabel htmlFor = "name-simple" > Failure Message < /InputLabel> <
            Input id = "requireMessage"
            multiline fullWidth onChange = {
              event => this.setState({ ...this.state,
                failureMessage: event.target.value
              })
            }
            /> < /
            FormControl >
          }
          <
          /div>

        );
      }
    }

    RawStateRow.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      key: PropTypes.any,
      vars: PropTypes.array.isRequired,
      showMessage: PropTypes.bool,
      submit: PropTypes.func
    };

    export default withStyles(styles, {
      withTheme: true
    })(RawStateRow);
