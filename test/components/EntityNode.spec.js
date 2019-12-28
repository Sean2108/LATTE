import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import ParamList from '../../app/components/build/build_components/ParamList';
import EntityNode from '../../app/components/build/diagram/diagram_node_options/EntityNode';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const close = jest.fn();
  const component = createMount()(
    <EntityNode
      submit={onchange}
      bitsMode
      close={close}
      varList={{
        structA: [
          { name: 'a', type: 'uint' },
          { name: 'b', type: 'string' },
          { name: 'c', type: 'bool' },
          { name: 'd', type: 'address' }
        ]
      }}
    />
  );
  const textField = component.find(TextField);
  const entity = component.find(Select);
  const buttons = component.find(Button);
  const isMemory = component.find(Switch);
  const closeButton = buttons.at(0);
  const button = buttons.at(1);
  return {
    component,
    textField,
    entity,
    isMemory,
    button,
    closeButton,
    onchange,
    close
  };
}

describe('EntityNode component', () => {
  it('should show correct initial values', () => {
    const { component, textField, entity, isMemory } = setup();
    expect(textField.props().value).toEqual('');
    expect(entity.props().value).toEqual('');
    expect(isMemory.props().checked).toEqual(true);
    const paramList = component.find(ParamList);
    expect(paramList).toHaveLength(0);
  });

  it('should submit when fields and params are populated', () => {
    const {
      component,
      textField,
      entity,
      isMemory,
      close,
      onchange,
      button
    } = setup();
    textField.props().onChange({
      target: {
        value: 'variable'
      }
    });
    entity.props().onChange({
      target: {
        value: 'structA'
      }
    });
    isMemory.props().onChange({
      target: {
        checked: false
      }
    });
    component.update();
    const paramList = component.find(ParamList);
    expect(paramList).toHaveLength(1);
    paramList
      .props()
      .updateParams([
        { name: 'a', type: 'uint', value: '10' },
        { name: 'b', type: 'string', value: '"paramStr"' },
        { name: 'c', type: 'bool', value: 'true' },
        { name: 'd', type: 'address', value: '0x00001' }
      ]);
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith(
      'variable = structA(10, "paramStr", true, 0x00001)',
      {
        assignVar: 'variable',
        variableSelected: 'structA',
        isMemory: false,
        params: ['10', '"paramStr"', 'true', '0x00001'],
        type: 'entity'
      }
    );
  });

  it('should submit when fields and params are not populated', () => {
    const {
      component,
      textField,
      entity,
      isMemory,
      close,
      onchange,
      button
    } = setup();
    textField.props().onChange({
      target: {
        value: 'variable'
      }
    });
    entity.props().onChange({
      target: {
        value: 'structA'
      }
    });
    isMemory.props().onChange({
      target: {
        checked: false
      }
    });
    component.update();
    const paramList = component.find(ParamList);
    expect(paramList).toHaveLength(1);
    paramList
      .props()
      .updateParams([
        { name: 'a', type: 'uint', value: '' },
        { name: 'b', type: 'string', value: '' },
        { name: 'c', type: 'bool', value: '' },
        { name: 'd', type: 'address', value: '' }
      ]);
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith(
      'variable = structA(0, "", false, an address)',
      {
        assignVar: 'variable',
        variableSelected: 'structA',
        isMemory: false,
        params: ['0', '""', 'false', 'an address'],
        type: 'entity'
      }
    );
  });

  it('should not submit when assignVar is not populated', () => {
    const {
      component,
      textField,
      entity,
      isMemory,
      close,
      onchange,
      button
    } = setup();
    textField.props().onChange({
      target: {
        value: ''
      }
    });
    entity.props().onChange({
      target: {
        value: 'structA'
      }
    });
    isMemory.props().onChange({
      target: {
        checked: false
      }
    });
    component.update();
    const paramList = component.find(ParamList);
    expect(paramList).toHaveLength(1);
    paramList
      .props()
      .updateParams([
        { name: 'a', type: 'uint', value: '' },
        { name: 'b', type: 'string', value: '' },
        { name: 'c', type: 'bool', value: '' },
        { name: 'd', type: 'address', value: '' }
      ]);
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not submit when entity is not populated', () => {
    const {
      textField,
      entity,
      isMemory,
      close,
      onchange,
      button
    } = setup();
    textField.props().onChange({
      target: {
        value: 'variable'
      }
    });
    entity.props().onChange({
      target: {
        value: ''
      }
    });
    isMemory.props().onChange({
      target: {
        checked: false
      }
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not submit when close button is clicked', () => {
    const {
      component,
      textField,
      entity,
      isMemory,
      close,
      onchange,
      closeButton
    } = setup();
    textField.props().onChange({
      target: {
        value: 'variable'
      }
    });
    entity.props().onChange({
      target: {
        value: 'structA'
      }
    });
    isMemory.props().onChange({
      target: {
        checked: false
      }
    });
    component.update();
    const paramList = component.find(ParamList);
    expect(paramList).toHaveLength(1);
    paramList
      .props()
      .updateParams([
        { name: 'a', type: 'uint', value: '10' },
        { name: 'b', type: 'string', value: '"paramStr"' },
        { name: 'c', type: 'bool', value: 'true' },
        { name: 'd', type: 'address', value: '0x00001' }
      ]);
    closeButton.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });
});
