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

    render() {
        const {classes, theme, varList, events} = this.props;

        return ( < div > <
         VariableBox header = {
            "Function Inputs"
        }
        updateVariables = {
            (vars) => this.setState({params: vars})
        }
        initialVars = {this.state.params} / > < br / > < RequiresList header = {
            "Checking Phase"
        }
        vars = {
            varList.concat(this.state.params)
        } /> < br / > < BuildDiagram varList = {
            varList.concat(this.state.params)
        }
        events = {events} / > < /div>
        );
      }
    }

    DefaultBuildTab.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      varList: PropTypes.array.isRequired,
      events: PropTypes.object.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(DefaultBuildTab);