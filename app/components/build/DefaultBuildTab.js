// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Snackbar, SnackbarContent } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { amber } from '@material-ui/core/colors';
import { DiagramEngine } from 'storm-react-diagrams';
import VariableList from './build_components/VariableList';
import BuildDiagram from './BuildDiagram';
import RequiresList from './build_components/RequiresList';
import GasDrawer from './diagram/GasDrawer';
import type {
  VariablesLookupType,
  StructLookupType,
  VariableObj,
  RequireObj,
  SettingsObj,
  Classes
} from '../../types';
import EditHistory from './build_utils/EditHistory';
import DefaultDataNodeModel from './diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';

const styles = theme => ({
  drawer: {
    width: '40%'
  },
  warning: {
    backgroundColor: amber[700],
    margin: theme.spacing.unit
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing.unit
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
});

type Props = {
  classes: Classes,
  varList: VariablesLookupType,
  events: StructLookupType,
  entities: StructLookupType,
  onChangeParams: Array<VariableObj> => void,
  onChangeRequire: Array<RequireObj> => void,
  onVariablesChange: VariablesLookupType => void,
  params: Array<VariableObj>,
  flattenedParams: VariablesLookupType,
  requires: Array<RequireObj>,
  diagram: {},
  settings: SettingsObj,
  gasHistory: Array<number>,
  updateBuildError: () => void,
  isConstructor: boolean,
  editHistory: EditHistory,
  updateLoading: boolean => void,
  engine: DiagramEngine,
  startNode: ?DefaultDataNodeModel,
  updateStartNode: (?DefaultDataNodeModel) => void,
  triggerParse: ({}) => void
};

type State = {
  drawerOpen: boolean,
  warning: string
};

class DefaultBuildTab extends React.Component<Props, State> {
  varList: VariablesLookupType;

  state = {
    drawerOpen: false,
    warning: ''
  };

  componentWillMount() {
    const { varList } = this.props;
    this.varList = varList;
  }

  closeDrawer = (): void => this.setState({ drawerOpen: false });

  hideWarning = (): void => this.setState({ warning: '' });

  render(): React.Node {
    const {
      classes,
      varList,
      events,
      entities,
      onChangeParams,
      onChangeRequire,
      onVariablesChange,
      params,
      flattenedParams,
      requires,
      diagram,
      settings,
      gasHistory,
      updateBuildError,
      isConstructor,
      editHistory,
      updateLoading,
      engine,
      startNode,
      updateStartNode,
      triggerParse
    } = this.props;
    const { drawerOpen, warning } = this.state;
    return (
      <div>
        <VariableList
          header="Function Inputs"
          updateVariables={onChangeParams}
          vars={params}
          tooltipText="These are the names and types of information that will be provided to this function when an external user attempts to use it. This information can be used in the Checking and Action phases below."
          bitsMode={settings.bitsMode}
        />
        <br />
        <RequiresList
          header="Checking Phase"
          vars={{ ...varList, ...flattenedParams }}
          onChangeRequire={onChangeRequire}
          requires={requires}
          tooltipText="Theses are the conditions that must be met for the function to be run successfully by an external user. If the conditions are not met, the function will not be run and the failure message will be shown to the external user."
          entities={entities}
        />
        <br />
        <BuildDiagram
          varList={this.varList}
          events={events}
          entities={entities}
          onVariablesChange={onVariablesChange}
          diagram={diagram}
          settings={settings}
          openDrawer={() => this.setState({ drawerOpen: true })}
          gasHistory={gasHistory}
          updateBuildError={updateBuildError}
          isConstructor={isConstructor}
          editHistory={editHistory}
          updateLoading={updateLoading}
          showWarning={(newWarning: string) =>
            this.setState({ warning: newWarning })
          }
          engine={engine}
          startNode={startNode}
          updateStartNode={updateStartNode}
          triggerParse={triggerParse}
        />

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={this.closeDrawer}
          className={classes.drawer}
          classes={{
            paper: classes.drawer
          }}
        >
          <div tabIndex={0} role="button">
            <GasDrawer history={gasHistory} />
          </div>
        </Drawer>
        <Snackbar
          open={!!warning}
          autoHideDuration={10000}
          onClose={this.hideWarning}
        >
          <SnackbarContent
            className={classes.warning}
            message={
              <span className={classes.message}>
                <WarningIcon />
                {warning}
              </span>
            }
          />
        </Snackbar>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DefaultBuildTab);
