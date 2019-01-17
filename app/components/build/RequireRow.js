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
        comp: '==',
        var1: '',
        var2: '',
        requireMessage: '',
      }
      
      changeCondition = (newState) => {
        this.props.submit(`${newState.var1} ${newState.comp} ${newState.var2}`)
      };

      wrapMenuItems = (vars) => {
        return [...vars.map((element, index) => < MenuItem key = {
          index
        }
        value = {
          element
        } > {
          element
        } < /MenuItem>), <MenuItem key={this.props.vars.length} value="msg.sender">Message sender</MenuItem >,
        <MenuItem key={this.props.vars.length + 1} value="msg.value">Message value</MenuItem >,
        <MenuItem key={this.props.vars.length + 2} value="raw">Raw...</MenuItem > ];
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
        let varMenuItems = this.wrapMenuItems(vars);
        return ( <
          div >

          <
          FormControl className = {
            classes.formControl
          } >
          <
          InputLabel htmlFor = "protocol" > Variable 1 < /InputLabel> <
          Select value = {
            this.state.var1
          }
          onChange = {
            event => {
              let newState = {
                ...this.state,
                var1: event.target.value
              }
              this.setState(newState);
              this.changeCondition(newState);
            }
          }
          inputProps = {
            {
              name: 'Variable 1',
              id: 'var1',
            }
          } > {
            varMenuItems
          } <
          /Select> < /
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
          onChange = {
            event => {
              let newState = {
                ...this.state,
                comp: event.target.value
              };
              this.setState(newState);
              this.changeCondition(newState);
            }
          }
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
          <
          InputLabel htmlFor = "protocol" > Variable 2 < /InputLabel> <
          Select value = {
            this.state.var2
          }
          onChange = {
            event => {
              let newState = {
                ...this.state,
                var2: event.target.value
              }
              this.setState(newState);
              this.changeCondition(newState);
            }
          }
          inputProps = {
            {
              name: 'Variable 2',
              id: 'var2',
            }
          } > {
            varMenuItems
          } <
          /Select> < /
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

    StateRow.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      key: PropTypes.any,
      vars: PropTypes.array.isRequired,
      showMessage: PropTypes.bool,
      submit: PropTypes.func
    };

    export default withStyles(styles, {
      withTheme: true
    })(StateRow);
