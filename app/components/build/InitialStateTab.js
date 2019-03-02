import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import StructList from './StructList';
import ParamList from './ParamList';

class InitialStateTab extends React.Component {
  render() {
    const {
      classes,
      theme,
      entities,
      events,
      updateEntities,
      updateEvents,
      params,
      updateParams
    } = this.props;
    return (
      <div>
        <StructList
          header={'Events'}
          updateVariables={updateEvents}
          initialVars={events}
        />{' '}
        <br />
        <StructList
          header={'Entities'}
          updateVariables={updateEntities}
          initialVars={entities}
        />{' '}
        <br />
        {params &&
          params.filter(param => param.name).length > 0 && (
            <ParamList
              header={'Constructor Parameters'}
              params={params}
              updateParams={updateParams}
            />
          )}{' '}
      </div>
    );
  }
}

InitialStateTab.propTypes = {
  entities: PropTypes.object.isRequired,
  events: PropTypes.object.isRequired,
  updateEntities: PropTypes.func.isRequired,
  updateEvents: PropTypes.func.isRequired,
  params: PropTypes.array.isRequired,
  updateParams: PropTypes.func.isRequired
};

export default InitialStateTab;
