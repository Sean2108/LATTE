import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    margin: theme.spacing.unit * 3,
  },
});

class Settings extends React.Component {

  render() {
    const { classes, theme } = this.props;

    return (
        <main align="center" className={classes.content}>
          <div className={classes.toolbar} />
          <Typography variant="title" noWrap>Settings</Typography>

          
        </main>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Settings);