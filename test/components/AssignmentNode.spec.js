import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import AssignmentNode from '../../app/components/build/diagram/diagram_node_options/AssignmentNode';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const close = jest.fn();
  const component = createMount()(
    <AssignmentNode submit={onchange} bitsMode close={close} />
  );
  const textFields = component.find(TextField);
  const assignedTo = textFields.at(0);
  const value = textFields.at(1);
  const operator = component.find(Select);
  const buttons = component.find(Button);
  const isMemory = component.find(Switch);
  const closeButton = buttons.at(0);
  const button = buttons.at(1);
  return {
    component,
    assignedTo,
    operator,
    value,
    isMemory,
    button,
    closeButton,
    onchange,
    close
  };
}

describe('AssignmentNode component', () => {
  it('should show correct initial values', () => {
    const { assignedTo, operator, value } = setup();
    expect(assignedTo.props().value).toBe('');
    expect(operator.props().value).toBe('=');
    expect(value.props().value).toBe('');
  });
  it('should call submit when button is clicked and fields are populated', () => {
    const { assignedTo, operator, value, button, onchange, close } = setup();
    assignedTo.props().onChange({
      target: {
        value: 'testVar'
      }
    });
    operator.props().onChange({
      target: {
        value: '+='
      }
    });
    value.props().onChange({
      target: {
        value: 'testStr'
      }
    });
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith('testVar += testStr', {
      variableSelected: 'testVar',
      assignment: '+=',
      assignedVal: 'testStr',
      isMemory: true,
      type: 'assignment'
    });
  });

  it('should not call submit if assignedTo is empty', () => {
    const { assignedTo, value, button, onchange, close } = setup();
    assignedTo.props().onChange({
      target: {
        value: ''
      }
    });
    value.props().onChange({
      target: {
        value: 'testStr'
      }
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not call submit if value is empty', () => {
    const { assignedTo, value, button, onchange, close } = setup();
    assignedTo.props().onChange({
      target: {
        value: 'testVar'
      }
    });
    value.props().onChange({
      target: {
        value: ''
      }
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not call submit if both fields are empty', () => {
    const { assignedTo, value, button, onchange, close } = setup();
    assignedTo.props().onChange({
      target: {
        value: ''
      }
    });
    value.props().onChange({
      target: {
        value: ''
      }
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should call submit with isMemory false when switch is toggled', () => {
    const { assignedTo, value, isMemory, button, onchange, close } = setup();
    assignedTo.props().onChange({
      target: {
        value: 'testVar'
      }
    });
    value.props().onChange({
      target: {
        value: 'testStr'
      }
    });
    isMemory.props().onChange({
      target: {
        checked: false
      }
    });
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith('testVar = testStr', {
      variableSelected: 'testVar',
      assignment: '=',
      assignedVal: 'testStr',
      isMemory: false,
      type: 'assignment'
    });
  });

  it('should call not call submit when close button is clicked', () => {
    const { assignedTo, value, closeButton, onchange, close } = setup();
    assignedTo.props().onChange({
      target: {
        value: 'testVar'
      }
    });
    value.props().onChange({
      target: {
        value: 'testStr'
      }
    });
    closeButton.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });
});
