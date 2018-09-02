import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: theme.spacing.unit * 3,
    margin: theme.spacing.unit * 3,
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});

class BuildOptions extends React.Component {

  render() {
    const { classes, theme, onback } = this.props;

    return (
          <Paper className={classes.paper}>
          
          <Button variant="outlined" color="primary" className={classes.button} onClick={onback}>
        Back
      </Button>

      <Button variant="contained" color="primary" className={classes.button}>
        Build
      </Button>
          
          </Paper>
    );
  }
}

BuildOptions.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(BuildOptions);