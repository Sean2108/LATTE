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
import StateRow from './GlobalStateObjectRow';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxHeight: '20vw',
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class GlobalStateTab extends React.Component {
    state = {
      variables: [{name: '', type: 'int'}]
      }

      render() {
        const {
          classes,
          theme,
          header,
          updateVariables
        } = this.props;

        return ( <
            Paper className = {
              classes.paper
            } >
            <
            Typography variant = "title"
            noWrap > {
              header
            } < /Typography> {
            this.state.variables.map((element, index) => <StateRow key = {index} updateVariables={(val) => {
                let variables = this.state.variables;
                variables[index] = val;
                this.setState({variables: variables});
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
          () => this.setState({
              variables: [...this.state.variables, {name: '', type: 'int'}]
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

    GlobalStateTab.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      header: PropTypes.string.isRequired,
      updateVariables: PropTypes.func.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(GlobalStateTab);
