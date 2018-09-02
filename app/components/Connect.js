import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';

const fs = require('fs');

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
  formControl: {
    margin: theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class Connect extends React.Component {
  state = {
    addressEmpty: false,
    portEmpty: false,
    saveLocationEmpty: false,
    saveLocationInvalid: false
  };

  login = () => {
    const address = document.getElementById('address').value;
    const port = document.getElementById('port').value;
    const saveLocation = document.getElementById('saveLocation').value;
    this.setState({addressEmpty: !address, portEmpty: !port, saveLocationEmpty: !saveLocation, saveLocationInvalid: this.checkInvalidSaveLocation(saveLocation)});
    if (!address || !port || !saveLocation) {
      return;
    }
    console.log('logged in');
  }

  checkInvalidSaveLocation = (saveLocation) => {
    if (!saveLocation) return true;
    try {
      return !fs.lstatSync(saveLocation).isDirectory();
    } catch (e) {
      return true;
    }
  }

  render() {
    const { classes, theme } = this.props;

    return (
        <main align="center" className={classes.content}>
          <div className={classes.toolbar} />
          <Typography variant="title" noWrap>Connect to blockchain</Typography>

          <div>

        <FormControl className={classes.formControl} error={this.state.addressEmpty}>
        <InputLabel htmlFor="name-simple">Blockchain Address</InputLabel>
        <Input id="address" />
        {this.state.addressEmpty ? <FormHelperText>Address cannot be empty!</FormHelperText> : null}
        </FormControl>
        <br/>

        <FormControl className={classes.formControl} error={this.state.portEmpty}>
        <InputLabel htmlFor="name-simple">Blockchain Port</InputLabel>
        <Input id="port" />
        {this.state.portEmpty ? <FormHelperText>Port cannot be empty!</FormHelperText> : null}
        </FormControl>
        <br/>

      <FormControl className={classes.formControl} error={this.state.saveLocationEmpty || this.state.saveLocationInvalid}>
      <InputLabel htmlFor="name-simple">File save location</InputLabel>
      <Input id="saveLocation" />
      {this.state.saveLocationEmpty || this.state.saveLocationInvalid ? <FormHelperText>Save location {this.state.saveLocationEmpty ? 'cannot be empty!' : 'is invalid!'}</FormHelperText> : null}
      </FormControl>
      <br/>
      <br/>

      <Button variant="contained" color="primary" className={classes.button} onClick={this.login}>
        Connect
      </Button>
      </div>
        </main>
    );
  }
}

Connect.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Connect);