import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import VariableList from './VariableList';
import VariableBox from './VariableBox';
import BuildDiagram from './BuildDiagram';
import RequiresList from './RequiresList';

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        maxHeight: '20vw',
        overflow: 'auto'
    },
    button: {
        margin: theme.spacing.unit
    }
});

class DefaultBuildTab extends React.Component {

  state = {
    params: []
  }

  varList;

  componentDidMount() {
    this.varList = this.props.varList;
  }

  flattenParamsToObject() {
    return this.state.params
    .filter((element) => element.name)
    .reduce((result, currentObject) => {
        result[currentObject.name] = currentObject.type;
        return result;
    }, {});
  }

    render() {
        const {classes, theme, varList, events, onChangeLogic, onChangeParams, onVariablesChange, onChangeReturn} = this.props;
        let variables = this.flattenParamsToObject();
        return ( < div > <
         VariableList header = {
            "Function Inputs"
        }
        updateVariables = {
            (vars) => this.setState({params: vars}, () => onChangeParams(this.state.params))
        } / > < br / > < RequiresList header = {
            "Checking Phase"
        }
        vars = {
            {...varList, ...variables}
        } /> < br / > < BuildDiagram varList = {
            {...this.varList, ...variables}
        }
        events = {events}
        onChangeLogic = {onChangeLogic}
        onVariablesChange = {onVariablesChange}
        onChangeReturn = {onChangeReturn} / > < /div>
        );
      }
    }

    DefaultBuildTab.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      varList: PropTypes.object.isRequired,
      events: PropTypes.object.isRequired,
      onChangeLogic: PropTypes.func.isRequired,
      onChangeParams: PropTypes.func.isRequired,
      onVariablesChange: PropTypes.func.isRequired,
      onChangeReturn: PropTypes.func.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(DefaultBuildTab);