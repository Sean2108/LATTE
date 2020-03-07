import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';
import TextField from '@material-ui/core/TextField';
import VariableRow from '../../app/components/build/build_components/VariableRow';

Enzyme.configure({ adapter: new Adapter() });

function strSetup() {
  const onchange = jest.fn();
  const strComponent = createMount()(
    <VariableRow
      updateVariables={onchange}
      val={{
        displayName: 'Test Str',
        name: 'test_str',
        type: 'string',
        bits: '8'
      }}
      bitsMode
    />
  );
  return { strComponent, onchange };
}

function intSetup() {
  const onchange = jest.fn();
  const intComponent = createMount()(
    <VariableRow
      updateVariables={onchange}
      val={{
        displayName: 'Test Int',
        name: 'test_int',
        type: 'uint',
        bits: '8'
      }}
      bitsMode
    />
  );
  return { intComponent, onchange };
}

function noBitsSetup() {
  const onchange = jest.fn();
  const noBitsComponent = createMount()(
    <VariableRow
      updateVariables={onchange}
      val={{
        displayName: 'Test Str',
        name: 'test_str',
        type: 'string',
        bits: '8'
      }}
      bitsMode={false}
    />
  );
  return { noBitsComponent, onchange };
}

describe('VariableRow component', () => {
  it('should show correct initial values', () => {
    const { intComponent } = intSetup();
    const variableName = intComponent.find(TextField);
    expect(variableName).toHaveLength(1);
    const selects = intComponent.find(Select);
    expect(selects).toHaveLength(2);
    const variableType = selects.at(0);
    const variableBits = selects.at(1);
    expect(variableName.props().value).toBe('Test Int');
    expect(variableType.props().value).toBe('uint');
    expect(variableBits.props().value).toBe('8');
  });
  it(
    'should call updateVariables with new display name and formatted name when variab' +
      'le name changes',
    () => {
      const { intComponent, onchange } = intSetup();
      const variableName = intComponent.find(TextField);
      variableName.props().onChange({
        currentTarget: {
          value: '   Test Test    '
        }
      });
      expect(onchange).toHaveBeenCalledWith({
        bits: '8',
        displayName: '   Test Test    ',
        name: 'test_test',
        type: 'uint'
      });
    }
  );

  it(
    'should call updateVariables with type string and reset empty bits when variable ' +
      'type changes',
    () => {
      const { intComponent, onchange } = intSetup();
      const variableType = intComponent.find(Select).at(0);
      variableType.props().onChange({
        target: {
          value: 'string'
        }
      });
      expect(onchange).toHaveBeenCalledWith({
        displayName: 'Test Int',
        name: 'test_int',
        type: 'string',
        bits: ''
      });
    }
  );

  it('should call updateVariables with new bits when variable bits changes for int', () => {
    const { intComponent, onchange } = intSetup();
    const selects = intComponent.find(Select);
    expect(selects).toHaveLength(2);
    selects
      .at(1)
      .props()
      .onChange({
        target: {
          value: '32'
        }
      });
    expect(onchange).toHaveBeenCalledWith({
      displayName: 'Test Int',
      name: 'test_int',
      type: 'uint',
      bits: '32'
    });
  });

  it('should call updateVariables with new bits when variable bits changes for string', () => {
    const { strComponent, onchange } = strSetup();
    const selects = strComponent.find(Select);
    expect(selects).toHaveLength(2);
    selects
      .at(1)
      .props()
      .onChange({
        target: {
          value: '16'
        }
      });
    expect(onchange).toHaveBeenCalledWith({
      displayName: 'Test Str',
      name: 'test_str',
      type: 'string',
      bits: '16'
    });
  });

  it('should not show bits field when bits mode is off', () => {
    const { noBitsComponent } = noBitsSetup();
    const bits = noBitsComponent.find(Select);
    expect(bits).toHaveLength(1);
  });
});
