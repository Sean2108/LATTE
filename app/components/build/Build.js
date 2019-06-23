import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: theme.spacing.unit * 3,
    margin: theme.spacing.unit * 3
  },
  formControl: {
    margin: theme.spacing.unit
  },
  button: {
    margin: theme.spacing.unit
  }
});

class Build extends React.Component {
  state = {
    tabs: ['Global State', 'Initial State'],
    tabsCode: [''],
    variables: {},
    tabsParams: [[]],
    tabsReturn: [null],
    tabsRequire: [[]],
    constructorParams: [],
    events: {},
    entities: {},
    isView: [false],
    diagrams: [{}],
    gasHistory: []
  };

  render() {
    const { classes, theme, onback, connection, bitsMode } = this.props;

    const { tabs, tabsCode, variables } = this.state;

    return (
      <main align="center" className={classes.content}>
        <div className={classes.toolbar} />
        <div>
          <div className={classes.root}>
            <BuildTabs
              variables={variables}
              onTabsChange={value => this.setState(value)}
              buildState={this.state}
              bitsMode={bitsMode}
              connection={connection}
            />
            <BuildOptions
              onback={onback}
              connection={connection}
              buildState={this.state}
              loadState={state => this.setState(state)}
              bitsMode={bitsMode}
            />
          </div>
        </div>
      </main>
    );
  }
}

Build.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
  bitsMode: PropTypes.bool.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(Build);
