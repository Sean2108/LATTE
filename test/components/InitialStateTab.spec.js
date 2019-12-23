import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { createMount } from '@material-ui/core/test-utils';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ParamList from '../../app/components/build/build_components/ParamList';
import InitialStateTab from '../../app/components/build/InitialStateTab';
import StructList from '../../app/components/build/build_components/StructList';

Enzyme.configure({ adapter: new Adapter() });

function setup(emptyParamsList) {
  const updateEntities = jest.fn();
  const updateEvents = jest.fn();
  const updateParams = jest.fn();
  const component = createMount()(
    <InitialStateTab
      entities={{}}
      events={{}}
      params={emptyParamsList ? [] : [{ name: 'test1' }, { name: 'test2' }]}
      updateEntities={updateEntities}
      updateEvents={updateEvents}
      updateParams={updateParams}
      bitsMode={true}
    />
  );
  const structLists = component.find(StructList);
  const ParamLists = component.find(ParamList);
  return { structLists, ParamLists };
}

describe('InitialStateTab component', () => {
  it('initial state should be correct for empty params list', () => {
    const { structLists, ParamLists } = setup(true);
    expect(structLists).toHaveLength(2);
    expect(ParamLists).toHaveLength(0);
  });

  it('initial state should be correct for non empty params list', () => {
    const { structLists, ParamLists } = setup(false);
    expect(structLists).toHaveLength(2);
    expect(ParamLists).toHaveLength(1);
  });
});
