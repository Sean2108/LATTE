import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import BuildOptions from './BuildOptions';
import BuildTabs from './BuildTabs';

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
});

class Build extends React.Component {
  state = {
      tabs: [],
      tabsCode : [],
      variables: {},
      tabsParams: [],
      tabsReturn: [],
      tabsRequire: []
  };

  render() {
    const {
      classes,
      theme,
      onback,
      connection
    } = this.props;

    const {
      tabs,
      tabsCode,
      variables
    } = this.state;

    return ( <
      main align = "center"
      className = {
        classes.content
      } >
      <
      div className = {
        classes.toolbar
      }
      /> {
        /* <Typography variant="title" noWrap>Build Your Smart Contract</Typography>
                    <br/> */
      } <
      div >

      <
      div className = {
        classes.root
      } >
      <
      BuildTabs variables = {variables} onVariablesChange = {(value) => this.setState({variables: value})} onTabsChange = {(value) => this.setState(value)} / >
      <
      BuildOptions onback = {
        onback
      }
      connection = {
        connection
      }
      buildState = {
        this.state
      }
      /> <
      /div>


      <
      /div> <
      /main>
    );
  }
}

Build.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(Build);