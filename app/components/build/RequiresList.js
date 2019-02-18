import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import RawRequireRow from './RawRequireRow';
import { BuildParser } from './BuildParser';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxHeight: '40vw',
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class RequiresList extends React.Component {
    state = {
      variables: []
      }

      componentWillMount() {
        this.setState({variables: this.props.requires.length > 0 ? this.props.requires : [{var1: '', comp: '==', var2: '', requireMessage: ''}]});
      }

      buildParser = new BuildParser(null);

      render() {
        const {
          classes,
          theme,
          header,
          vars,
          onChangeRequire,
          requires
        } = this.props;
        this.buildParser.reset(this.props.vars);

        return ( <
            Paper className = {
              classes.paper
            } >
            <
            Typography variant = "title"
            noWrap > {
              header
            } < /Typography> {
              
            this.state.variables.map((element, index) => <RawRequireRow require = {element} key = {index} vars = {vars} showMessage = {true}
            updateRequire = {(val) => {
              let variables = this.state.variables;
              variables[index] = val;
              this.setState({variables: variables});
              onChangeRequire(variables);
            }}
            parseVariable = {this.buildParser.parseVariable}/>)
          }

          <
          Button variant = "contained"
        color = "primary"
        className = {
          classes.button
        }
        onClick = {
          () => this.setState({
              variables: [...this.state.variables, {var1: '', comp: '==', var2: '', requireMessage: ''}]
              })
          } >
          +
          <
          /Button> <
          br / >
          <
          /Paper>
        );
      }
    }

    RequiresList.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      header: PropTypes.string.isRequired,
      vars: PropTypes.object.isRequired,
      onChangeRequire: PropTypes.func.isRequired,
      requires: PropTypes.array.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(RequiresList);
