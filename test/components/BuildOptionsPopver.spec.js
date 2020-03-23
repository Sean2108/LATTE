import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';
import { Popover, TextField, Button } from '@material-ui/core';
import BuildOptionsPopover from '../../app/components/build/build_components/popovers/BuildOptionsPopover';

Enzyme.configure({ adapter: new Adapter() });

function setup(dataOp, anchorEl = { getBoundingClientRect: () => ({}) }) {
  const functions = {
    handleChange: jest.fn(),
    handleClose: jest.fn(),
    saveData: jest.fn(),
    loadData: jest.fn(),
    saveContract: jest.fn(),
    innerHandleChange: jest.fn()
  };
  functions.handleChange.mockReturnValueOnce(functions.innerHandleChange);
  const component = createMount()(
    <BuildOptionsPopover
      anchorEl={anchorEl}
      dataOp={dataOp}
      fileName="test.json"
      files={['f1.json', 'f2.json', 'f3.json']}
      handleChange={functions.handleChange}
      handleClose={functions.handleClose}
      saveData={functions.saveData}
      loadData={functions.loadData}
      saveContract={functions.saveContract}
      DATA_OP={{
        LOAD_DATA: 1,
        SAVE_DATA: 2,
        SAVE_CONTRACT: 3
      }}
    />
  );
  return {
    component,
    functions
  };
}

describe('BuildOptionsPopover component', () => {
  it('should be closed if anchorEl is null', () => {
    const { component } = setup(1, null);
    expect(component.find(Popover).props().open).toBe(false);
  });

  it('should work correctly for saving data', () => {
    const { component, functions } = setup(2);
    expect(component.find(Popover).props().open).toBe(true);
    const textField = component.find(TextField);
    expect(textField).toHaveLength(1);
    expect(component.find(Select)).toHaveLength(0);
    expect(textField.props().value).toEqual('test.json');
    textField.props().onChange();
    expect(functions.handleChange).toHaveBeenCalledWith('fileName');
    expect(functions.innerHandleChange).toHaveBeenCalledTimes(1);
    const button = component.find(Button);
    button.props().onClick();
    expect(functions.saveData).toHaveBeenCalledTimes(1);
  });

  it('should work correctly for saving contracts', () => {
    const { component, functions } = setup(
      3
    );
    expect(component.find(Popover).props().open).toBe(true);
    const textField = component.find(TextField);
    expect(textField).toHaveLength(1);
    expect(component.find(Select)).toHaveLength(0);
    expect(textField.props().value).toEqual('test.json');
    textField.props().onChange();
    expect(functions.handleChange).toHaveBeenCalledWith('fileName');
    expect(functions.innerHandleChange).toHaveBeenCalledTimes(1);
    const button = component.find(Button);
    button.props().onClick();
    expect(functions.saveContract).toHaveBeenCalledTimes(1);
  });

  it('should work correctly for loading data', () => {
    const { component, functions } = setup(1);
    const select = component.find(Select);
    expect(select).toHaveLength(1);
    expect(component.find(TextField)).toHaveLength(0);
    expect(select.props().value).toEqual('test.json');
    select.props().onChange();
    expect(functions.handleChange).toHaveBeenCalledWith('fileName');
    expect(functions.innerHandleChange).toHaveBeenCalledTimes(1);
    const button = component.find(Button);
    button.props().onClick();
    expect(functions.loadData).toHaveBeenCalledTimes(1);
  });
});
