import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {
  configureRequestOptions
} from 'builder-util-runtime';

var Web3 = require('web3');

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
  text: {
    color: 'black'
  }
});

class Connect extends React.Component {
    state = {
      addressEmpty: false,
      portEmpty: false,
      connectionFailed: false,
      protocol: 'http'
    };

    promiseTimeout = (ms, promise) => {
      // Create a promise that rejects in <ms> milliseconds
      let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
          clearTimeout(id);
          this.setState({
            connectionFailed: true
          })
        }, ms)
      })
      // Returns a race between our timeout and the passed in promise
      return Promise.race([
        promise,
        timeout
      ])
    }

    login = () => {
      const address = document.getElementById('address').value;
      const port = document.getElementById('port').value;
      this.setState({
        addressEmpty: !address,
        portEmpty: !port
      });
      if (!address || !port) {
        return;
      }
      let web3 = new Web3(new Web3.providers.HttpProvider(`${this.state.protocol}://${address}:${port}`));
      this.promiseTimeout(2000, web3.eth.net.isListening()
      .then(res => {
        this.setState({
          connectionFailed: !res
        });
        this.props.onclick(web3);
      })
      )

      
    }

    changeProtocol = event => {
      this.setState({
        protocol: event.target.value
      });
    };

    render() {
        const {
          classes,
          theme
        } = this.props;

        return ( <
            main align = "center"
            className = {
              classes.content
            } >
            <
            div className = {
              classes.toolbar
            }
            /> <
            Typography variant = "title"
            noWrap > Connect to blockchain < /Typography>

            <
            br / >
            <
            div >

            <
            FormControl error = {
              this.state.connectionFailed
            }
            className = {
              classes.formControl
            } >
            <
            InputLabel htmlFor = "protocol" > Protocol < /InputLabel> <
            Select value = {
              this.state.protocol
            }
            onChange = {
              this.changeProtocol
            }
            inputProps = {
              {
                name: 'Protocol',
                id: 'protocol',
              }
            } >
            <
            MenuItem value = "http" > HTTP < /MenuItem> <
            MenuItem value = "https" > HTTPS < /MenuItem> <
            /Select> {
              this.state.connectionFailed ? < FormHelperText > URL not found! < /FormHelperText> : null} <
                /FormControl> <
                span className = {
                  classes.text
                } > : //</span>
                <
                FormControl className = {
                  classes.formControl
                }
              error = {
                  this.state.addressEmpty || this.state.connectionFailed
                } >
                <
                InputLabel htmlFor = "name-simple" > Blockchain Address < /InputLabel> <
                Input id = "address" / > {
                  this.state.addressEmpty ? < FormHelperText > Address cannot be empty! < /FormHelperText> : null} <
                  /FormControl> <
                  span className = {
                    classes.text
                  } > : < /span> <
                    FormControl className = {
                      classes.formControl
                    }
                  error = {
                    this.state.portEmpty || this.state.connectionFailed
                  } >
                  <
                  InputLabel htmlFor = "name-simple" > Blockchain Port < /InputLabel> <
                  Input id = "port" / > {
                    this.state.portEmpty ? < FormHelperText > Port cannot be empty! < /FormHelperText> : null} <
                    /FormControl> <
                    br / >
                    <
                    br / >

                    <
                    Button variant = "contained"
                    color = "primary"
                    className = {
                      classes.button
                    }
                    onClick = {
                      this.login
                    } >
                    Connect <
                    /Button> <
                    /div> <
                    /main>
                  );
                }
            }

            Connect.propTypes = {
              classes: PropTypes.object.isRequired,
              theme: PropTypes.object.isRequired,
              onclick: PropTypes.func.isRequired,
            };

            export default withStyles(styles, {
              withTheme: true
            })(Connect);
