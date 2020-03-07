import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import { Snackbar, SnackbarContent } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { amber } from '@material-ui/core/colors';
import VariableList from './build_components/VariableList';
import BuildDiagram from './BuildDiagram';
import RequiresList from './build_components/RequiresList';
import GasDrawer from './diagram/GasDrawer';

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

class DefaultBuildTab extends React.Component {
  state = {
    drawerOpen: false,
    warning: ''
  };

  componentWillMount() {
    const { varList } = this.props;
    this.varList = varList;
  }

  varList;

  flattenParamsToObject(params, bitsMode) {
    return params
      .filter(element => element.name)
      .reduce((resultParam, currentObject) => {
        const result = resultParam;
        if (bitsMode && currentObject.bits) {
          if (currentObject.type === 'string') {
            result[currentObject.name] = `bytes${currentObject.bits}`;
          } else {
            result[
              currentObject.name
            ] = `${currentObject.type}${currentObject.bits}`;
          }
        } else {
          result[currentObject.name] = currentObject.type;
        }
        return result;
      }, {});
  }

  closeDrawer = () => this.setState({ drawerOpen: false });

  hideWarning = () => this.setState({ warning: '' });

  render() {
    const {
      classes,
      varList,
      events,
      entities,
      onParse,
      onChangeParams,
      onChangeRequire,
      onVariablesChange,
      params,
      requires,
      diagram,
      settings,
      gasHistory,
      updateGasHistory,
      updateBuildError,
      isConstructor,
      editHistory,
      updateLoading
    } = this.props;
    const { drawerOpen, warning } = this.state;
    const variables = this.flattenParamsToObject(params, settings.bitsMode);
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
          vars={{ ...varList, ...variables }}
          onChangeRequire={onChangeRequire}
          requires={requires}
          tooltipText="Theses are the conditions that must be met for the function to be run successfully by an external user. If the conditions are not met, the function will not be run and the failure message will be shown to the external user."
          entities={entities}
        />
        <br />
        <BuildDiagram
          varList={this.varList}
          functionParams={variables}
          events={events}
          entities={entities}
          onParse={onParse}
          onVariablesChange={onVariablesChange}
          diagram={diagram}
          settings={settings}
          openDrawer={() => this.setState({ drawerOpen: true })}
          gasHistory={gasHistory}
          updateGasHistory={updateGasHistory}
          updateBuildError={updateBuildError}
          isConstructor={isConstructor}
          editHistory={editHistory}
          updateLoading={updateLoading}
          showWarning={(newWarning: string) =>
            this.setState({ warning: newWarning })
          }
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

DefaultBuildTab.propTypes = {
  varList: PropTypes.object.isRequired,
  events: PropTypes.object.isRequired,
  entities: PropTypes.object.isRequired,
  onParse: PropTypes.func.isRequired,
  onChangeParams: PropTypes.func.isRequired,
  onChangeRequire: PropTypes.func.isRequired,
  onVariablesChange: PropTypes.func.isRequired,
  params: PropTypes.array.isRequired,
  requires: PropTypes.array.isRequired,
  diagram: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  gasHistory: PropTypes.array.isRequired,
  updateGasHistory: PropTypes.func.isRequired,
  updateBuildError: PropTypes.func.isRequired,
  isConstructor: PropTypes.bool.isRequired,
  editHistory: PropTypes.object.isRequired,
  updateLoading: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(DefaultBuildTab);
