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

    render() {
        const {classes, theme, updateVariables, varList, events} = this.props;

        return ( < div > <
         VariableList header = {   "Function Parameters" } isInput = {   true }
        VariableBox header = {
            "Function Parameters"
        }
        updateVariables = {
            updateVariables
        } / > < br / > < RequiresList header = {
            "Checking Phase"
        }
        vars = {
            //placeholder, hardcoded before state implementation
            ["var1", "var2"]
        } /> < br / > < BuildDiagram varList = {
            varList
        }
        events = {events} / > < /div>
        );
      }
    }

    DefaultBuildTab.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      updateVariables: PropTypes.func.isRequired,
      varList: PropTypes.array.isRequired,
      events: PropTypes.object.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(DefaultBuildTab);