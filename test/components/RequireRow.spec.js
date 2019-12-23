import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import RequireRow from '../../app/components/build/build_components/RequireRow';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';
import TextField from '@material-ui/core/TextField';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const component = createMount()(
    <RequireRow
      updateRequire={onchange}
      showMessage={true}
      require={{
        displayVar1: 'Test Str',
        var1: 'test_str',
        displayVar2: 'string',
        var2: 'string',
        requireMessage: 'test msg',
        comp: '=='
      }}
      variables={{}}
      structList={{}}
    />
  );
  const textFields = component.find(TextField);
  const operator = component.find(Select);
  const var1 = textFields.at(0);
  const var2 = textFields.at(1);
  const msg = textFields.at(2);
  return { component, var1, operator, var2, msg, onchange };
}

describe('RequireRow component', () => {
  it('initial state should be correct', () => {
    const { var1, operator, var2, msg } = setup();
    expect(var1.props().value).toBe('Test Str');
    expect(operator.props().value).toBe('==');
    expect(var2.props().value).toBe('string');
    expect(msg.props().value).toBe('test msg');
  });

  it('should have correct onchange call on var1 change', () => {
    const { component, var1, onchange } = setup();
    var1.props().onChange({
      target: {
        value: 'Test Int'
      }
    });
    expect(onchange).toHaveBeenCalledWith({
      displayVar1: 'Test Int',
      var1: 'test_int',
      displayVar2: 'string',
      var2: 'string',
      requireMessage: 'test msg',
      comp: '=='
    });
  });

  it('should have correct onchange call on var2 change', () => {
    const { component, var2, onchange } = setup();
    var2.props().onChange({
      target: {
        value: '100'
      }
    });
    expect(onchange).toHaveBeenCalledWith({
      displayVar1: 'Test Str',
      var1: 'test_str',
      displayVar2: '100',
      var2: '100',
      requireMessage: 'test msg',
      comp: '=='
    });
  });

  it('should have correct onchange call on operator change', () => {
    const { component, operator, onchange } = setup();
    operator.props().onChange({
      target: {
        value: '!='
      }
    });
    expect(onchange).toHaveBeenCalledWith({
      displayVar1: 'Test Str',
      var1: 'test_str',
      displayVar2: 'string',
      var2: 'string',
      requireMessage: 'test msg',
      comp: '!='
    });
  });

  it('should have correct onchange call on msg change', () => {
    const { component, msg, onchange } = setup();
    msg.props().onChange({
      target: {
        value: 'new msg'
      }
    });
    expect(onchange).toHaveBeenCalledWith({
      displayVar1: 'Test Str',
      var1: 'test_str',
      displayVar2: 'string',
      var2: 'string',
      requireMessage: 'new msg',
      comp: '=='
    });
  });

  it('should have not show failure message if showMessage is false', () => {
    const component = createMount()(
      <RequireRow
        updateRequire={() => {}}
        showMessage={false}
        require={{
          displayVar1: 'Test Str',
          var1: 'test_str',
          displayVar2: 'string',
          var2: 'string',
          requireMessage: 'test msg',
          comp: '=='
        }}
        buildParser={null}
      />
    );
    expect(component.find(TextField)).toHaveLength(2);
  });
});
