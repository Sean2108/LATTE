import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import { Typography } from '@material-ui/core';
import { VictoryChart, VictoryLine } from 'victory';
import GasDrawer from '../../app/components/build/diagram/GasDrawer';

Enzyme.configure({ adapter: new Adapter() });

function setup(emptyHistory = false) {
  const component = createMount()(
    <GasDrawer history={emptyHistory ? [] : [0, 20000, 50000, 90000, 500200]} />
  );
  const currentGas = component.find(Typography).at(1);
  const chart = component.find(VictoryChart);
  return {
    currentGas,
    chart
  };
}

describe('GasDrawer component', () => {
  it('should show correct values when there is no history', () => {
    const { currentGas, chart } = setup(true);
    expect(currentGas.text()).toEqual('Current gas usage: None');
    expect(chart).toHaveLength(0);
  });

  it('should show correct values when there is history', () => {
    const { currentGas, chart } = setup();
    expect(currentGas.text()).toEqual('Current gas usage: 500200');
    expect(chart).toHaveLength(1);
    const line = chart.find(VictoryLine);
    expect(line.props().data).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 20 },
      { x: 2, y: 50 },
      { x: 3, y: 90 },
      { x: 4, y: 500.2 }
    ]);
  });
});
