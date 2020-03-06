import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { Radio, FormLabel, RadioGroup } from '@material-ui/core';

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
  },
  radioGroup: {
    display: 'flex',
    justifyContent: 'center'
  },
  formLabel: {
    paddingTop: theme.spacing.unit * 3
  }
});

class Settings extends React.Component {
  render() {
    const { classes, settings, changeSettings } = this.props;

    return (
      <main align="center" className={classes.content}>
        <div className={classes.toolbar} />
        <Typography variant="title" noWrap>
          Settings
        </Typography>
        <FormLabel className={classes.formLabel} component="legend">
          Indentation Settings
        </FormLabel>
        <RadioGroup
          className={classes.radioGroup}
          value={settings.indentation}
          aria-label="indent"
          name="indent"
          row
          onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
            changeSettings({ indentation: event.currentTarget.value })
          }
        >
          <FormControlLabel
            value="    "
            control={<Radio color="primary" />}
            label="4 Spaces"
          />
          <FormControlLabel
            value="  "
            control={<Radio color="primary" />}
            label="2 Spaces"
          />
          <FormControlLabel
            value="	"
            control={<Radio color="primary" />}
            label="Tabs"
          />
        </RadioGroup>
        <FormLabel className={classes.formLabel} component="legend">
          Advanced Settings
        </FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={settings.bitsMode}
              onChange={(event: SyntheticInputEvent<HTMLInputElement>) =>
                changeSettings({ bitsMode: event.currentTarget.checked })
              }
              value="bitsMode"
              color="primary"
            />
          }
          label="Gas Reduction Mode"
        />
      </main>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(Settings);
