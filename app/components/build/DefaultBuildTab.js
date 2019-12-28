import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import VariableList from './build_components/VariableList';
import BuildDiagram from './BuildDiagram';
import RequiresList from './build_components/RequiresList';
import GasDrawer from './diagram/GasDrawer';

const styles = {
  drawer: {
    width: '40%'
  }
};

class DefaultBuildTab extends React.Component {
  state = {
    drawerOpen: false
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

  render() {
    const {
      classes,
      varList,
      events,
      entities,
      onChangeLogic,
      onChangeParams,
      onChangeRequire,
      onVariablesChange,
      onChangeReturn,
      params,
      requires,
      diagram,
      onChangeView,
      updateDiagram,
      bitsMode,
      gasHistory,
      updateGasHistory,
      updateBuildError
    } = this.props;
    const { drawerOpen } = this.state;
    const variables = this.flattenParamsToObject(params, bitsMode);
    return (
      <div>
        <VariableList
          header="Function Inputs"
          updateVariables={vars => onChangeParams(vars)}
          vars={params}
          tooltipText="These are the names and types of information that will be provided to this function when an external user attempts to use it. This information can be used in the Checking and Action phases below."
          bitsMode={bitsMode}
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
          onChangeLogic={onChangeLogic}
          onVariablesChange={onVariablesChange}
          onChangeReturn={onChangeReturn}
          diagram={diagram}
          onChangeView={onChangeView}
          updateDiagram={updateDiagram}
          bitsMode={bitsMode}
          openDrawer={() => this.setState({ drawerOpen: true })}
          gasHistory={gasHistory}
          updateGasHistory={updateGasHistory}
          updateBuildError={updateBuildError}
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
      </div>
    );
  }
}

DefaultBuildTab.propTypes = {
  varList: PropTypes.object.isRequired,
  events: PropTypes.object.isRequired,
  entities: PropTypes.object.isRequired,
  onChangeLogic: PropTypes.func.isRequired,
  onChangeParams: PropTypes.func.isRequired,
  onChangeRequire: PropTypes.func.isRequired,
  onVariablesChange: PropTypes.func.isRequired,
  onChangeReturn: PropTypes.func.isRequired,
  params: PropTypes.array.isRequired,
  requires: PropTypes.array.isRequired,
  diagram: PropTypes.object.isRequired,
  onChangeView: PropTypes.func.isRequired,
  updateDiagram: PropTypes.func.isRequired,
  bitsMode: PropTypes.bool.isRequired,
  gasHistory: PropTypes.array.isRequired,
  updateGasHistory: PropTypes.func.isRequired,
  updateBuildError: PropTypes.func.isRequired
};

export default withStyles(styles)(DefaultBuildTab);
