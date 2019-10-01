import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';

const Web3 = require('web3');

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
  connectionLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formControl: {
    margin: theme.spacing.unit
  },
  button: {
    margin: theme.spacing.unit
  },
  tooltipFont: {
    fontSize: 14
  }
});

class Connect extends React.Component {
  state = {
    connectionFailed: false,
    protocol: 'http',
    address: '',
    port: '',
    submitted: false
  };
  id;

  constructor(...args) {
    super(...args);
    this.promiseTimeout = this.promiseTimeout.bind(this);
    this.login = this.login.bind(this);
  }

  promiseTimeout(ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
      this.id = setTimeout(() => {
        clearTimeout(this.id);
        this.setState({
          connectionFailed: true
        });
      }, ms);
    });
    // Returns a race between our timeout and the passed in promise
    return Promise.race([promise, timeout]);
  }

  login() {
    this.setState({ submitted: true });
    const { protocol, address, port } = this.state;
    if (!address || !port) {
      return;
    }
    let web3 = new Web3(
      new Web3.providers.HttpProvider(`${protocol}://${address}:${port}`)
    );
    this.promiseTimeout(
      1000,
      web3.eth.net.isListening().then(res => {
        this.setState({
          connectionFailed: !res
        });
        clearTimeout(this.id);
        this.props.onclick(web3);
      })
    );
  }

  _handleKeyDown = e => {
    if (e.key === 'Enter') {
      this.login();
    }
  };

  changeProtocol = event => {
    this.setState({
      protocol: event.target.value
    });
  };

  render() {
    const { classes, theme } = this.props;

    return (
      <main align="center" className={classes.content}>
        <div className={classes.toolbar} />
        <div>
          <Tooltip
            title="Enter a valid blockchain address to connect to it."
            classes={{ tooltip: classes.tooltipFont }}
          >
            <Typography variant="title" noWrap>
              Connect to blockchain
            </Typography>
          </Tooltip>
          <br />
          <div className={classes.connectionLine}>
            <FormControl
              error={this.state.connectionFailed}
              className={classes.formControl}
            >
              <InputLabel htmlFor="protocol"> Protocol </InputLabel>
              <Select
                value={this.state.protocol}
                onChange={this.changeProtocol}
                inputProps={{
                  name: 'Protocol',
                  id: 'protocol'
                }}
              >
                <MenuItem value="http"> HTTP </MenuItem>
                <MenuItem value="https"> HTTPS </MenuItem>
              </Select>
              {this.state.connectionFailed ? (
                <FormHelperText> URL not found! </FormHelperText>
              ) : null}
            </FormControl>
            <Typography variant="title" noWrap>
              : //
            </Typography>
            <TextField
              id="address"
              label="Blockchain Address"
              className={classes.formControl}
              onChange={event => this.setState({ address: event.target.value })}
              value={this.state.address}
              margin="normal"
              onKeyDown={this._handleKeyDown}
              helperText={
                this.state.submitted && !this.state.address
                  ? 'Address cannot be empty!'
                  : ''
              }
            />
            <Typography variant="title" noWrap>
              :
            </Typography>
            <TextField
              id="port"
              label="Blockchain Port"
              className={classes.formControl}
              onChange={event => this.setState({ port: event.target.value })}
              value={this.state.port}
              margin="normal"
              onKeyDown={this._handleKeyDown}
              helperText={
                this.state.submitted && !this.state.port
                  ? 'Port cannot be empty!'
                  : ''
              }
            />
          </div>
          <br />
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={this.login}
          >
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
  onclick: PropTypes.func.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(Connect);
