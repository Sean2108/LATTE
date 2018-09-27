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
        nextKey: 1,
        variables: [<StateRow key={0} isConstructor={this.props.isConstructor}/>]
    }

  render() {
    const { classes, theme, header, isConstructor } = this.props;

    return (
        <Paper className={classes.paper}>
          <Typography variant="title" noWrap>{header}</Typography>
          {this.state.variables.map(element => element)}
          
    <Button variant="contained" color="primary" className={classes.button} 
    onClick={() => this.setState(
        {
            variables: [...this.state.variables, <StateRow key={this.state.nextKey} isConstructor={isConstructor}/>],
            nextKey: this.state.nextKey + 1
        })
            }>
            +
        </Button>
            <br/>
            </Paper>
    );
  }
}

GlobalStateTab.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  header: PropTypes.string.isRequired,
  isConstructor: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(GlobalStateTab);