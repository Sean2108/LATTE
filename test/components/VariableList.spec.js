import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import VariableList from '../../app/components/build/build_components/VariableList';
import VariableRow from '../../app/components/build/build_components/VariableRow';

Enzyme.configure({ adapter: new Adapter() });

function singleRowSetup() {
  const onchange = jest.fn();
  const component = createMount()(
    <VariableList
      updateVariables={onchange}
      vars={[]}
      tooltipText="test tooltip"
      header="test header"
      bitsMode
    />
  );
  const rows = component.find(VariableRow);
  const button = component.find(Button);
  const emptyRow = {
    displayName: '',
    name: '',
    type: 'uint',
    bits: ''
  };
  return { component, rows, button, onchange, emptyRow };
}

function threeRowSetup() {
  const oldRow = {
    displayName: 'Test Int',
    name: 'test_int',
    type: 'uint',
    bits: '8'
  };
  const newRow = {
    displayName: 'Test Str',
    name: 'test_str',
    type: 'string',
    bits: '16'
  };
  const onchange = jest.fn();
  const component = createMount()(
    <VariableList
      updateVariables={onchange}
      vars={[oldRow, oldRow, oldRow]}
      tooltipText="test tooltip"
      header="test header"
      bitsMode
    />
  );
  const rows = component.find(VariableRow);
  return { component, rows, onchange, oldRow, newRow };
}

describe('VariableList component', () => {
  it('initial state should be correct', () => {
    const { component, rows, emptyRow } = singleRowSetup();
    expect(rows).toHaveLength(1);
    const header = component.find(Typography);
    const tooltip = component.find(Tooltip);
    expect(header.text()).toBe('test header');
    expect(tooltip.props().title).toBe('test tooltip');
    expect(rows.at(0).props().val).toEqual(emptyRow);
  });

  it('should add new row when button is clicked', () => {
    const { rows, button, emptyRow, onchange } = singleRowSetup();
    expect(rows).toHaveLength(1);
    expect(rows.at(0).props().val).toEqual(emptyRow);
    button.props().onClick();
    expect(onchange).toHaveBeenCalledWith([emptyRow, emptyRow]);
  });

  it('should update variable correctly when row is altered', () => {
    const { rows, onchange } = singleRowSetup();
    const updatedRow = {
      displayName: 'Test Str',
      name: 'test_str',
      type: 'string',
      bits: '16'
    };
    rows
      .at(0)
      .props()
      .updateVariables(updatedRow);
    expect(onchange).toHaveBeenCalledWith([updatedRow]);
  });

  it('should change only the correct row when 1st row is altered', () => {
    const { rows, onchange, oldRow, newRow } = threeRowSetup();
    rows
      .at(0)
      .props()
      .updateVariables(newRow);
    expect(onchange).toHaveBeenCalledWith([newRow, oldRow, oldRow]);
  });

  it('should change only the correct row when 2nd row is altered', () => {
    const { rows, onchange, oldRow, newRow } = threeRowSetup();
    rows
      .at(1)
      .props()
      .updateVariables(newRow);
    expect(onchange).toHaveBeenCalledWith([oldRow, newRow, oldRow]);
  });

  it('should change only the correct row when 3rd row is altered', () => {
    const { rows, onchange, oldRow, newRow } = threeRowSetup();
    rows
      .at(2)
      .props()
      .updateVariables(newRow);
    expect(onchange).toHaveBeenCalledWith([oldRow, oldRow, newRow]);
  });
});
