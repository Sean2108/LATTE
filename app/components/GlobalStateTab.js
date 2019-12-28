import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import VariableList from './build/build_components/VariableList';

const styles = theme => ({
  paper: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxHeight: '20vw',
    overflow: 'auto'
  },
  button: {
    margin: theme.spacing.unit
  }
});

class GlobalStateTab extends React.Component {
  render() {
    return (
      <Grid container spacing={24}>
        <Grid item xs={6}>
          <VariableList header='Global State Objects' isInput={false} />
        </Grid>
        <Grid item xs={6}>
          <VariableList header='Constructor Parameters' isInput />
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })(GlobalStateTab);
