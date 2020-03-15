// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Web3 from 'web3';
import { DiagramEngine } from 'storm-react-diagrams';
import BuildOptions from './BuildOptions';
import BuildTabs from './BuildTabs';
import DefaultDataNodeModel from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import { setupEngine, extractStartNodes } from './build_utils/DiagramUtils';
import type { SettingsObj, BuildState, Classes } from '../../types';

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

type Props = {
  classes: Classes,
  onback: () => void,
  connection: Web3,
  settings: SettingsObj
};

type State = {
  buildState: BuildState,
  engine: DiagramEngine,
  startNodes: Array<?DefaultDataNodeModel>,
  loading: boolean
};

class Build extends React.Component<Props, State> {
  state = {
    buildState: {
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
    },
    engine: null,
    startNodes: [null],
    loading: false
  };

  componentWillMount() {
    const engine = setupEngine();
    this.setState({ engine });
  }

  render(): React.Node {
    const { classes, onback, connection, settings } = this.props;
    const { buildState, engine, startNodes, loading } = this.state;
    const { variables } = buildState;

    return (
      <main align="center" className={classes.content}>
        <div className={classes.toolbar} />
        <div>
          <div className={classes.root}>
            <BuildTabs
              variables={variables}
              onTabsChange={(
                newBuildState: {},
                callback: ({}) => void = () => {}
              ): void =>
                this.setState(
                  prevState => ({
                    buildState: { ...prevState.buildState, ...newBuildState }
                  }),
                  () => callback(this.state.buildState)
                )
              }
              buildState={buildState}
              settings={settings}
              connection={connection}
              updateLoading={(newLoading: boolean): void =>
                this.setState({ loading: newLoading })
              }
              engine={engine}
              startNodes={startNodes}
              updateStartNodes={(
                newStartNodes: Array<?DefaultDataNodeModel>
              ): void => this.setState({ startNodes: newStartNodes })}
            />
            <BuildOptions
              onback={onback}
              connection={connection}
              buildState={buildState}
              loadState={(newBuildState: BuildState): void =>
                this.setState((prevState: State) => {
                  const extractedStartNodes: Array<?DefaultDataNodeModel> = extractStartNodes(
                    prevState.engine,
                    newBuildState.diagrams
                  );
                  return {
                    buildState: newBuildState,
                    startNodes: extractedStartNodes
                  };
                })
              }
              settings={settings}
              loading={loading}
            />
          </div>
        </div>
      </main>
    );
  }
}

export default withStyles(styles, {
  withTheme: true
})(Build);
