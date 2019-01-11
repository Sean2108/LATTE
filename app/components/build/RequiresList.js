import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import RequireRow from './RequireRow';

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

class RequiresList extends React.Component {
    state = {
      nextKey: 1,
      variables: [ < RequireRow key = {
          0
        }
        //bug here???
        vars = {
          this.props.vars
        }
        showMessage = {true}
        />]
      }

      render() {
        const {
          classes,
          theme,
          header,
          vars
        } = this.props;

        return ( <
            Paper className = {
              classes.paper
            } >
            <
            Typography variant = "title"
            noWrap > {
              header
            } < /Typography> {
            this.state.variables.map(element => element)
          }

          <
          Button variant = "contained"
        color = "primary"
        className = {
          classes.button
        }
        onClick = {
          () => this.setState({
              variables: [...this.state.variables, < RequireRow key = {
                  this.state.nextKey
                }
                vars = {
                  vars
                }
                showMessage = {true}
                />],
                nextKey: this.state.nextKey + 1
              })
          } >
          +
          <
          /Button> <
          br / >
          <
          /Paper>
        );
      }
    }

    RequiresList.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      header: PropTypes.string.isRequired,
      vars: PropTypes.array.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(RequiresList);
