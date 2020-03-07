// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Web3 from 'web3';
import type { Classes } from '../types';

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

type Props = {
  classes: Classes,
  onclick: Web3 => void
};

type State = {
  connectionFailed: boolean,
  protocol: string,
  address: string,
  port: string,
  submitted: boolean
};

class Connect extends React.Component<Props, State> {
  id: TimeoutID;

  constructor(...args) {
    super(...args);
    this.promiseTimeout = this.promiseTimeout.bind(this);
    this.login = this.login.bind(this);
  }

  state = {
    connectionFailed: false,
    protocol: 'http',
    address: '',
    port: '',
    submitted: false
  };

  promiseTimeout = (ms: number, promise: Promise<void>): Promise<?boolean> => {
    // Create a promise that rejects in <ms> milliseconds
    const timeout: Promise<void> = new Promise((): void => {
      this.id = setTimeout(() => {
        clearTimeout(this.id);
        this.setState({
          connectionFailed: true
        });
      }, ms);
    });
    // Returns a race between our timeout and the passed in promise
    return Promise.race([promise, timeout]);
  };

  login = (): void => {
    const { onclick } = this.props;
    const { protocol, address, port } = this.state;
    this.setState({ submitted: true });
    if (!address || !port) {
      return;
    }
    const web3: Web3 = new Web3(
      new Web3.providers.HttpProvider(`${protocol}://${address}:${port}`)
    );
    this.promiseTimeout(
      1000,
      web3.eth.net.isListening().then((res: boolean): null => {
        this.setState({
          connectionFailed: !res
        });
        clearTimeout(this.id);
        onclick(web3);
        return null;
      })
    );
  };

  handleKeyDown = (e: SyntheticKeyboardEvent<>): void => {
    if (e.key === 'Enter') {
      this.login();
    }
  };

  changeProtocol = (event: SyntheticInputEvent<HTMLInputElement>): void => {
    this.setState({
      protocol: event.currentTarget.value
    });
  };

  render(): React.Node {
    const { classes } = this.props;
    const { connectionFailed, protocol, address, submitted, port } = this.state;

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
              error={connectionFailed}
              className={classes.formControl}
            >
              <InputLabel htmlFor="protocol"> Protocol </InputLabel>
              <Select
                value={protocol}
                onChange={this.changeProtocol}
                inputProps={{
                  name: 'Protocol',
                  id: 'protocol'
                }}
              >
                <MenuItem value="http"> HTTP </MenuItem>
                <MenuItem value="https"> HTTPS </MenuItem>
              </Select>
              {connectionFailed ? (
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
              onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
                this.setState({ address: event.currentTarget.value })
              }
              value={address}
              margin="normal"
              onKeyDown={this.handleKeyDown}
              helperText={
                submitted && !address ? 'Address cannot be empty!' : ''
              }
            />
            <Typography variant="title" noWrap>
              :
            </Typography>
            <TextField
              id="port"
              label="Blockchain Port"
              className={classes.formControl}
              onChange={(event: SyntheticInputEvent<HTMLInputElement>): void =>
                this.setState({ port: event.target.value })
              }
              value={port}
              margin="normal"
              onKeyDown={this.handleKeyDown}
              helperText={submitted && !port ? 'Port cannot be empty!' : ''}
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

export default withStyles(styles, {
  withTheme: true
})(Connect);
