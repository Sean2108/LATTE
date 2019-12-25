import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ReturnNode from '../../app/components/build/diagram/diagram_node_options/ReturnNode';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const close = jest.fn();
  const component = createMount()(
    <ReturnNode submit={onchange} close={close} />
  );
  const textField = component.find(TextField);
  const buttons = component.find(Button);
  const closeButton = buttons.at(0);
  const button = buttons.at(1);
  return {
    component,
    textField,
    button,
    closeButton,
    onchange,
    close
  };
}

describe('ReturnNode component', () => {
  it('should show correct initial values', () => {
    const { textField } = setup();
    expect(textField.props().value).toEqual('');
  });

  it('should call submit when button is clicked and field is empty', () => {
    const { textField, button, onchange, close } = setup();
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith('', {
      variableSelected: '',
      type: 'return'
    });
  });

  it('should call submit when button is clicked and field is cleared', () => {
    const { textField, button, onchange, close } = setup();
    textField.props().onChange({
      target: {
        value: ''
      }
    });
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith('', {
      variableSelected: '',
      type: 'return'
    });
  });

  it('should call submit when button is clicked and field is not empty', () => {
    const { textField, button, onchange, close } = setup();
    textField.props().onChange({
      target: {
        value: 'testReturn'
      }
    });
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith('testReturn', {
      variableSelected: 'testReturn',
      type: 'return'
    });
  });
});
