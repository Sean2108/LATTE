import React from 'react';
import PropTypes from 'prop-types';
import StructList from './build_components/StructList';
import ParamList from './build_components/ParamList';

class InitialStateTab extends React.Component {
  render() {
    const {
      entities,
      events,
      updateEntities,
      updateEvents,
      params,
      updateParams,
      settings
    } = this.props;
    return (
      <div>
        <StructList
          header="Events"
          tooltipText="Events are messages that contain information about an occurrence. For example, when an auction has ended, an event can be emitted that tells users that the auction ended, who purchased the item and at what price."
          updateVariables={updateEvents}
          initialVars={events}
          varListTooltipText="The names and types of information that will be announced with the event."
          bitsMode={settings.bitsMode}
        />
        <br />
        <StructList
          header="Entities"
          tooltipText="Entities are ways to logically group data and information together. For example, a car would be an entity containing information about its brand, its price, and its seller."
          updateVariables={updateEntities}
          initialVars={entities}
          varListTooltipText="The names and types of information that the entity will contain."
          bitsMode={settings.bitsMode}
        />
        <br />
        {params && params.filter(param => param.name).length > 0 && (
          <ParamList
            header="Constructor Parameters"
            params={params}
            updateParams={updateParams}
            tooltipText="These are the initial values of the parameters provided in the Initial State Tab. When the smart contract is deployed, these values will be used to initialise the smart contract."
          />
        )}
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
  updateParams: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
};

export default InitialStateTab;
