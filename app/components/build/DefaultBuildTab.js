import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import VariableList from './VariableList';
import BuildDiagram from './BuildDiagram';
import RequiresList from './RequiresList';

class DefaultBuildTab extends React.Component {

  varList;

  componentWillMount() {
    this.varList = this.props.varList;
  }

  flattenParamsToObject(params) {
    return params
    .filter((element) => element.name)
    .reduce((result, currentObject) => {
        result[currentObject.name] = currentObject.type;
        return result;
    }, {});
  }

    render() {
        const {classes, theme, varList, events, entities, onChangeLogic, onChangeParams, onChangeRequire, 
            onVariablesChange, onChangeReturn, params, requires, diagram, updateDiagram} = this.props;
        let variables = this.flattenParamsToObject(params);
        return ( < div > <
         VariableList header = {
            "Function Inputs"
        }
        updateVariables = {
            (vars) => onChangeParams(vars)
        }
        vars = {params} / > < br / > < RequiresList header = {
            "Checking Phase"
        }
        vars = {
            {...varList, ...variables}
        }
        onChangeRequire = {onChangeRequire}
        requires = {requires}
        /> < br / > < BuildDiagram 
        varList = {this.varList}
        functionParams = {variables}
        events = {events}
        entities = {entities}
        onChangeLogic = {onChangeLogic}
        onVariablesChange = {onVariablesChange}
        onChangeReturn = {onChangeReturn}
        diagram = {diagram}
        updateDiagram = {updateDiagram} / > < /div>
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
      updateDiagram: PropTypes.func.isRequired,
    };

    export default DefaultBuildTab;