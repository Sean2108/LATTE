// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Web3 from 'web3';
import { DiagramEngine } from 'storm-react-diagrams';
import InitialStateTab from './InitialStateTab';
import Web3Utils from './build_utils/Web3Utils';
import DefaultBuildTab from './DefaultBuildTab';
import EditHistory from './build_utils/EditHistory';
import DefaultDataNodeModel from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import GlobalParser from './parsers/GlobalParser';
import { flattenParamsToObject } from './build_utils/TypeCheckFormattingUtils';
import type {
  VariablesLookupType,
  BuildState,
  SettingsObj,
  VariableObj,
  RequireObj,
  StructLookupType,
  Classes
} from '../../types';
import BuildTabsPopover from './build_components/popovers/BuildTabsPopover';
import { TabContainer } from './build_utils/ContainerUtils';
import TabBar from './build_components/TabBar';

const styles = theme => ({
  buildtabs: {
    flexGrow: 1,
    width: '97%',
    backgroundColor: theme.palette.background.paper
  },
  tabs: {
    width: '100%',
    maxWidth: '80vw'
  }
});

type Props = {
  classes: Classes,
  onTabsChange: ({}, ?({}) => void) => void,
  buildState: BuildState,
  settings: SettingsObj, // eslint-disable-line react/no-unused-prop-types
  connection: Web3,
  updateLoading: boolean => void, // eslint-disable-line react/no-unused-prop-types
  engine: DiagramEngine, // eslint-disable-line react/no-unused-prop-types
  startNodes: Array<?DefaultDataNodeModel>,
  updateStartNodes: (Array<?DefaultDataNodeModel>) => void
};

type State = {
  value: number,
  anchorEl: ?{}
};

class BuildTabs extends React.Component<Props, State> {
  web3Utils: Web3Utils;

  editHistory: EditHistory;

  globalParser: GlobalParser;

  state = {
    value: 0,
    anchorEl: null
  };

  componentWillMount() {
    const { buildState, connection, onTabsChange } = this.props;
    this.web3Utils = new Web3Utils(connection);
    this.editHistory = new EditHistory(buildState, onTabsChange);
    this.globalParser = new GlobalParser(
      this.onVariablesChange,
      this.updateBuildError
    );
  }

  handleChange = (event: {}, value: number): void => {
    this.setState({
      value
    });
  };

  handleOnChange = (
    newState: Array<VariableObj> | Array<RequireObj> | {},
    i: number,
    state: string
  ) => {
    const { buildState, onTabsChange } = this.props;
    const tabsState = [...buildState[state]];
    tabsState[i] = newState;
    onTabsChange({ [state]: tabsState });
  };

  handleChangeParams = (newState: Array<VariableObj>, i: number): void => {
    const { onTabsChange } = this.props;
    this.handleOnChange(newState, i, 'tabsParams');
    if (i === 0) {
      const newParams = newState.map(param => ({ ...param, value: '' }));
      onTabsChange({ constructorParams: newParams });
    }
  };

  onVariablesChange = (newVariables: VariablesLookupType): void =>
    this.props.onTabsChange({ variables: newVariables });

  updateBuildError = (buildError: string): void => {
    this.props.onTabsChange({ buildError });
  };

  setAnchorEl = (newAnchorEl: ?{}): void =>
    this.setState({ anchorEl: newAnchorEl });

  renderInitialStateTab({ buildState, settings, onTabsChange }): React.Node {
    return (
      <InitialStateTab
        entities={buildState.entities}
        events={buildState.events}
        updateEntities={(entities: StructLookupType): void =>
          onTabsChange({ entities })
        }
        updateEvents={(events: StructLookupType): void =>
          onTabsChange({ events })
        }
        params={buildState.constructorParams}
        updateParams={(params: Array<VariableObj>): void =>
          onTabsChange({
            constructorParams: params
          })
        }
        settings={settings}
      />
    );
  }

  renderDefaultBuildTab(
    i: number,
    {
      buildState,
      settings,
      updateLoading,
      engine,
      startNodes,
      updateStartNodes
    }
  ): React.Node {
    return (
      <DefaultBuildTab
        varList={buildState.variables}
        events={buildState.events}
        entities={buildState.entities}
        onChangeParams={(newParams: Array<VariableObj>): void =>
          this.handleChangeParams(newParams, i)
        }
        onChangeRequire={(newRequire: Array<RequireObj>): void =>
          this.handleOnChange(newRequire, i, 'tabsRequire')
        }
        onVariablesChange={this.onVariablesChange}
        params={buildState.tabsParams[i]}
        flattenedParams={flattenParamsToObject(
          buildState.tabsParams[i],
          settings.bitsMode
        )}
        requires={buildState.tabsRequire[i]}
        diagram={buildState.diagrams[i]}
        settings={settings}
        gasHistory={buildState.gasHistory}
        updateBuildError={this.updateBuildError}
        isConstructor={i === 0}
        editHistory={this.editHistory}
        updateLoading={updateLoading}
        engine={engine}
        startNode={startNodes[i]}
        updateStartNode={(startNode: DefaultDataNodeModel): void => {
          const newStartNodes = [...startNodes];
          newStartNodes[i] = startNode;
          updateStartNodes(newStartNodes);
        }}
        triggerParse={serializedDiagram => {
          this.onVariablesChange({});
          this.handleOnChange(serializedDiagram, i, 'diagrams');
          this.globalParser.parse(this.props, this.web3Utils, this.editHistory);
        }}
      />
    );
  }

  render(): React.Node {
    const {
      classes,
      buildState,
      startNodes,
      updateStartNodes,
      onTabsChange
    } = this.props;
    const { value, anchorEl } = this.state;

    return (
      <div className={classes.buildtabs}>
        <AppBar position="static" color="default">
          <TabBar
            value={value}
            tabs={buildState.tabs}
            setAnchorEl={this.setAnchorEl}
            changeTab={this.handleChange}
          />
        </AppBar>
        {value === 0 && (
          <TabContainer>{this.renderInitialStateTab(this.props)}</TabContainer>
        )}
        {[...Array(buildState.tabs.length - 1).keys()].map(
          i =>
            value === i + 1 && (
              <TabContainer key={i}>
                {this.renderDefaultBuildTab(i, this.props)}
              </TabContainer>
            )
        )}
        <BuildTabsPopover
          anchorEl={anchorEl}
          setAnchorEl={this.setAnchorEl}
          buildState={buildState}
          onTabsChange={onTabsChange}
          startNodes={startNodes}
          updateStartNodes={updateStartNodes}
        />
      </div>
    );
  }
}

export default withStyles(styles)(BuildTabs);
