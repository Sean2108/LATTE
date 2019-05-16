import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const styles = theme => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: theme.spacing.unit * 3,
    margin: theme.spacing.unit * 3
  }
});

class Settings extends React.Component {
  render() {
    const { classes, theme, bitsMode, changeBitsMode } = this.props;

    return (
      <main align="center" className={classes.content}>
        <div className={classes.toolbar} />
        <Typography variant="title" noWrap>
          Settings
        </Typography>
        <FormControlLabel
            control={
              <Switch
                checked={bitsMode}
                onChange={event =>
                  changeBitsMode(event.target.checked)
                }
                value="bitsMode"
                color="primary"
              />
            }
            label="Advanced Feature: Gas Reduction Mode"
          />
      </main>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  bitsMode: PropTypes.bool.isRequired,
  changeBitsMode: PropTypes.func.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(Settings);
