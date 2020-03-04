import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import BuildOptions from './BuildOptions';
import BuildTabs from './BuildTabs';

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
    tabs: ['Global State', 'Initial State'], // eslint-disable-line react/no-unused-state
    tabsCode: [''], // eslint-disable-line react/no-unused-state
    variables: {},
    tabsParams: [[]], // eslint-disable-line react/no-unused-state
    tabsReturn: [null], // eslint-disable-line react/no-unused-state
    tabsRequire: [[]], // eslint-disable-line react/no-unused-state
    constructorParams: [], // eslint-disable-line react/no-unused-state
    events: {}, // eslint-disable-line react/no-unused-state
    entities: {}, // eslint-disable-line react/no-unused-state
    isView: [false], // eslint-disable-line react/no-unused-state
    diagrams: [{}], // eslint-disable-line react/no-unused-state
    gasHistory: [0], // eslint-disable-line react/no-unused-state
    buildError: '' // eslint-disable-line react/no-unused-state
  };

  render() {
    const { classes, onback, connection, settings } = this.props;

    const { variables } = this.state;

    return (
      <main align="center" className={classes.content}>
        <div className={classes.toolbar} />
        <div>
          <div className={classes.root}>
            <BuildTabs
              variables={variables}
              onTabsChange={(value, callback = () => {}) =>
                this.setState(value, () => callback(this.state))
              }
              buildState={this.state}
              settings={settings}
              connection={connection}
            />
            <BuildOptions
              onback={onback}
              connection={connection}
              buildState={this.state}
              loadState={state => this.setState(state)}
              settings={settings}
            />
          </div>
        </div>
      </main>
    );
  }
}

Build.propTypes = {
  classes: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(Build);
