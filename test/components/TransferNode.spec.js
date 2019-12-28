import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import TransferNode from '../../app/components/build/diagram/diagram_node_options/TransferNode';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const close = jest.fn();
  const component = createMount()(
    <TransferNode submit={onchange} close={close} />
  );
  const textFields = component.find(TextField);
  const address = textFields.at(0);
  const value = textFields.at(1);
  const buttons = component.find(Button);
  const closeButton = buttons.at(0);
  const button = buttons.at(1);
  return {
    component,
    address,
    value,
    button,
    closeButton,
    onchange,
    close
  };
}
describe('TransferNode component', () => {
  it('should show correct initial values', () => {
    const { address, value } = setup();
    expect(address.props().value).toEqual('');
    expect(value.props().value).toEqual('');
  });

  it('should call submit when button is clicked and field is populated', () => {
    const { address, value, button, onchange, close } = setup();
    address.props().onChange({
      target: {
        value: 'an address'
      }
    });
    value.props().onChange({
      target: {
        value: '6'
      }
    });
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith('6 to an address', {
      variableSelected: 'an address',
      value: '6',
      type: 'transfer'
    });
  });

  it('should not call submit when address is empty', () => {
    const { address, value, button, onchange, close } = setup();
    address.props().onChange({
      target: {
        value: ''
      }
    });
    value.props().onChange({
      target: {
        value: '6'
      }
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not call submit when value is empty', () => {
    const { address, value, button, onchange, close } = setup();
    address.props().onChange({
      target: {
        value: 'an address'
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

  it('should not call submit when close button is clicked', () => {
    const { address, value, closeButton, onchange, close } = setup();
    address.props().onChange({
      target: {
        value: 'an address'
      }
    });
    value.props().onChange({
      target: {
        value: ''
      }
    });
    closeButton.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });
});
