import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import BuildOptions from './BuildOptions';
import BuildDiagram from './BuildDiagram';
import BuildTabs from './BuildTabs';
import Button from '@material-ui/core/Button';
import StateRow from './GlobalStateObjectRow';
import VariableList from './VariableList';

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
        globalVars: [0],
        constructorVars: [0]
    }

  render() {
    const { classes, theme } = this.props;

    return (
      <Grid container spacing={24}>
        <Grid item xs={6}>
        <VariableList header={"Global State Objects"} isConstructor={false}/>
        </Grid>
        <Grid item xs={6}>
        <VariableList header={"Constructor Parameters"} isConstructor={true}/>
        </Grid>
      </Grid>
    );
  }
}

GlobalStateTab.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(GlobalStateTab);