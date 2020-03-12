// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Web3 from 'web3';
import BuildOptions from './BuildOptions';
import BuildTabs from './BuildTabs';
import {
  DiagramEngine,
  DiagramModel,
  DefaultPortModel
} from 'storm-react-diagrams';
import DiamondPortModel from './diagram/diagram_node_declarations/DiamondNode/DiamondPortModel';
import DiamondNodeFactory from './diagram/diagram_node_declarations/DiamondNode/DiamondNodeFactory';
import DefaultDataNodeFactory from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeFactory';
import SimplePortFactory from './diagram/SimplePortFactory';
import DefaultDataNodeModel from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import { setupDiagram, extractDiagramState } from './build_utils/DiagramUtils';
import type {
  SettingsObj,
  BuildState,
  DiagramState,
  Classes
} from '../../types';

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
  diagramState: DiagramState,
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
    diagramState: {
      models: [null],
      startNodes: [null],
      engine: null
    },
    loading: false
  };

  componentWillMount() {
    const { engine, model, startNode } = setupDiagram();
    this.setState({
      diagramState: { models: [model], startNodes: [startNode], engine: engine }
    });
  }

  render(): React.Node {
    const { classes, onback, connection, settings } = this.props;
    const { variables } = this.state.buildState;

    return (
      <main align="center" className={classes.content}>
        <div className={classes.toolbar} />
        <div>
          <div className={classes.root}>
            <BuildTabs
              variables={variables}
              onTabsChange={(
                buildState: {},
                callback: ({}) => void = () => {}
              ): void =>
                this.setState(
                  prevState => ({
                    buildState: { ...prevState.buildState, ...buildState }
                  }),
                  () => callback(this.state.buildState)
                )
              }
              buildState={this.state.buildState}
              settings={settings}
              connection={connection}
              updateLoading={(loading: boolean): void =>
                this.setState({ loading })
              }
              diagramState={this.state.diagramState}
              onDiagramChange={(diagramState: {}): void =>
                this.setState((prevState: State) => ({
                  diagramState: { ...prevState.diagramState, ...diagramState }
                }))
              }
            />
            <BuildOptions
              onback={onback}
              connection={connection}
              buildState={this.state.buildState}
              loadState={(buildState: BuildState): void =>
                this.setState((prevState: State) => {
                  const diagramState = extractDiagramState(
                    prevState.diagramState.engine,
                    buildState.diagrams
                  );
                  return { buildState, diagramState };
                })
              }
              settings={settings}
              loading={this.state.loading}
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
