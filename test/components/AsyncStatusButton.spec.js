import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import { CircularProgress, Button, Tooltip } from '@material-ui/core';
import AsyncStatusButton from '../../app/components/build/build_components/AsyncStatusButton';

Enzyme.configure({ adapter: new Adapter() });

function setup(loading, success) {
  const onclick = jest.fn();
  const component = createMount()(
    <AsyncStatusButton
      onClick={onclick}
      tooltipText="test tooltip"
      loading={loading}
      success={success}
    >
      Test text
    </AsyncStatusButton>
  );
  const button = component.find(Button).at(0);
  const tooltip = component.find(Tooltip).at(0);
  return {
    component,
    onclick,
    button,
    tooltip
  };
}

describe('AsyncStatusButton component', () => {
  it('should have correct button and tooltip text', () => {
    const { button, tooltip } = setup(true, true);
    expect(button.text()).toEqual('Test text');
    expect(tooltip.props().title).toEqual('test tooltip');
  });

  it('should call onClick when button is clicked', () => {
    const { component, onclick } = setup(true, true);
    component.props().onClick();
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('should not have circular progress when loading is false', () => {
    const { component, button } = setup(false, true);
    expect(component.find(CircularProgress)).toHaveLength(0);
    expect(button.props().disabled).toBe(false);
    expect(button.props().className).toContain('buttonSuccess');
  });

  it('should have circular progress when loading is true', () => {
    const { component, button } = setup(true, false);
    expect(component.find(CircularProgress)).toHaveLength(1);
    expect(button.props().disabled).toBe(true);
    expect(button.props().className).toContain('buttonFailure');
  });
});
