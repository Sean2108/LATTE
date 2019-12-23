import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { createMount } from '@material-ui/core/test-utils';
import StructList from '../../app/components/build/build_components/StructList';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import VariableList from '../../app/components/build/build_components/VariableList';

Enzyme.configure({ adapter: new Adapter() });

function noRowSetup() {
  const onchange = jest.fn();
  const component = createMount()(
    <StructList
      updateVariables={onchange}
      initialVars={{}}
      header="test header"
      tooltipText="test tooltip"
      varListTooltipText="test var list tooltip"
      bitsMode={true}
    />
  );
  const rows = component.find(VariableList);
  const button = component.find(Button);
  const nameInput = component.find(TextField);
  return { component, rows, button, onchange, nameInput };
}

function threeRowSetup() {
  const onchange = jest.fn();
  let oldRow = [
    {
      displayName: 'Test Int',
      name: 'test_int',
      type: 'uint',
      bits: '8'
    }
  ];
  let newRow = [
    {
      displayName: 'Test Str',
      name: 'test_str',
      type: 'string',
      bits: '16'
    }
  ];
  const component = createMount()(
    <StructList
      updateVariables={onchange}
      initialVars={{
        StructA: oldRow,
        StructB: oldRow,
        StructC: oldRow
      }}
      header="test header"
      tooltipText="test tooltip"
      varListTooltipText="test var list tooltip"
      bitsMode={true}
    />
  );
  const rows = component.find(VariableList);
  const button = component.find('#add-struct-button').find(Button);
  const nameInput = component.find('#name-input').find(TextField);
  return { component, rows, button, onchange, nameInput, oldRow, newRow };
}

describe('StructList component', () => {
  it('initial state should be correct', () => {
    const { component, rows } = noRowSetup();
    expect(rows).toHaveLength(0);
    const header = component.find(Typography);
    const tooltip = component.find(Tooltip);
    expect(header.text()).toBe('test header');
    expect(tooltip.props().title).toBe('test tooltip');
  });

  it('should not add new row when button is clicked if textbox is empty', () => {
    const { rows, button, onchange } = noRowSetup();
    expect(rows).toHaveLength(0);
    button.props().onClick();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should add new row when button is clicked if textbox is not empty', () => {
    const { rows, button, onchange, nameInput } = noRowSetup();
    expect(rows).toHaveLength(0);
    nameInput.props().onChange({ target: { value: 'test struct name' } });
    button.props().onClick();
    expect(onchange).toHaveBeenCalledWith({ TestStructName: [] });
  });

  it('should not add row if struct with same name already exists', () => {
    const { rows, button, onchange, nameInput } = threeRowSetup();
    expect(rows).toHaveLength(3);
    nameInput.props().onChange({ target: { value: 'struct a' } });
    button.props().onClick();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should change only the correct row when 1st row is altered', () => {
    const { rows, onchange, oldRow, newRow } = threeRowSetup();
    rows
      .at(0)
      .props()
      .updateVariables(newRow);
    expect(onchange).toHaveBeenCalledWith({StructA: newRow, StructB: oldRow, StructC: oldRow});
  });

  it('should change only the correct row when 2nd row is altered', () => {
    const { rows, onchange, oldRow, newRow } = threeRowSetup();
    rows
      .at(1)
      .props()
      .updateVariables(newRow);
      expect(onchange).toHaveBeenCalledWith({StructA: oldRow, StructB: newRow, StructC: oldRow});
  });

  it('should change only the correct row when 3rd row is altered', () => {
    const { rows, onchange, oldRow, newRow } = threeRowSetup();
    rows
      .at(2)
      .props()
      .updateVariables(newRow);
      expect(onchange).toHaveBeenCalledWith({StructA: oldRow, StructB: oldRow, StructC: newRow});
  });
});
