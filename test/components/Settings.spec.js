import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import { RadioGroup, FormControlLabel, Switch } from '@material-ui/core';
import Settings from '../../app/components/Settings';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const component = createMount()(
    <Settings
      settings={{ bitsMode: true, indentation: '    ' }}
      changeSettings={jest.fn()}
    />
  );
  return component;
}

describe('Settings component', () => {
  it('should have correct initial state', () => {
    const component = setup();
    const radioGroup = component.find(RadioGroup);
    expect(radioGroup.find(FormControlLabel)).toHaveLength(3);
    expect(radioGroup.props().value).toEqual('    ');
    const toggle = component.find(Switch);
    expect(toggle).toHaveLength(1);
    expect(toggle.props().checked).toBe(true);
  });

  it('should be able to change bitsMode', () => {
    const component = setup();
    const toggle = component.find(Switch);
    toggle.props().onChange({ currentTarget: { checked: false } });
    expect(component.props().changeSettings).toHaveBeenCalledWith({
      bitsMode: false
    });
    toggle.props().onChange({ currentTarget: { checked: true } });
    expect(component.props().changeSettings).toHaveBeenCalledWith({
      bitsMode: true
    });
  });

  it('should be able to change indentation', () => {
    const component = setup();
    const radioGroup = component.find(RadioGroup);
    radioGroup.props().onChange({ currentTarget: { value: '\t' } });
    expect(component.props().changeSettings).toHaveBeenCalledWith({
      indentation: '\t'
    });
    radioGroup.props().onChange({ currentTarget: { value: '  ' } });
    expect(component.props().changeSettings).toHaveBeenCalledWith({
      indentation: '  '
    });
    radioGroup.props().onChange({ currentTarget: { value: '    ' } });
    expect(component.props().changeSettings).toHaveBeenCalledWith({
      indentation: '    '
    });
  });
});
