import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import StructList from './StructList';
import ParamList from './ParamList';

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

class InitialStateTab extends React.Component {

    render() {
        const {classes, theme, entities, events, updateEntities, updateEvents, params, updateParams} = this.props;
        return ( < div > 
        {/* < StructList header = {
            "Entities"
        } updateVariables = {updateEntities}
        initialVars = {entities}/ > <br/>  */}
        < StructList header = {
            "Events"
        } updateVariables = {updateEvents}
        initialVars = {events}/ > <br/>
        {params && params.length > 0 && <ParamList header = {"Constructor Parameters"}
        params={params}
        updateParams={updateParams}/>} < /div>
        );
      }
    }

    InitialStateTab.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
      entities: PropTypes.object.isRequired,
      events: PropTypes.object.isRequired,
      updateEntities: PropTypes.func.isRequired,
      updateEvents: PropTypes.func.isRequired,
      params: PropTypes.array.isRequired,
      updateParams: PropTypes.func.isRequired
    };

    export default withStyles(styles, {
      withTheme: true
    })(InitialStateTab);