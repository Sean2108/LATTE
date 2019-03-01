import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import BuildOptions from './BuildOptions';
import BuildDiagram from './BuildDiagram';
import BuildTabs from './BuildTabs';
import Button from '@material-ui/core/Button';
import VariableRow from './VariableRow';

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

class VariableList extends React.Component {

      render() {
        const {
          classes,
          theme,
          header,
          updateVariables,
          vars
        } = this.props;

        if (vars.length === 0) {
          vars.push({name: '', displayName: '', type: 'uint'});
        }

        return ( <
            Paper className = {
              classes.paper
            } >
            <
            Typography variant = "title"
            noWrap > {
              header
            } < /Typography> {
            vars.map((element, index) => <VariableRow val = {element} key = {index} updateVariables={(val) => {
                let variables = [...vars];
                variables[index] = val;
                updateVariables(variables);
            }}/>)
          }

          <
          Button variant = "contained"
        color = "primary"
        className = {
          classes.button
        }
        onClick = {
          () => updateVariables([...vars, {name: '', displayName: '', type: 'uint'}])} >
          +
          <
          /Button> <
          br / >
          <
          /Paper>
        );
      }
    }

    VariableList.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      header: PropTypes.string.isRequired,
      updateVariables: PropTypes.func.isRequired,
      vars: PropTypes.array.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(VariableList);
