import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';
import Button from '@material-ui/core/Button';
import ParamList from '../../app/components/build/build_components/ParamList';
import EventNode from '../../app/components/build/diagram/diagram_node_options/EventNode';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const close = jest.fn();
  const component = createMount()(
    <EventNode
      submit={onchange}
      close={close}
      varList={{
        eventA: [
          { name: 'a', type: 'uint' },
          { name: 'b', type: 'string' },
          { name: 'c', type: 'bool' },
          { name: 'd', type: 'address' }
        ]
      }}
    />
  );
  const event = component.find(Select);
  const buttons = component.find(Button);
  const closeButton = buttons.at(0);
  const button = buttons.at(1);
  return {
    component,
    event,
    button,
    closeButton,
    onchange,
    close
  };
}

describe('EventNode component', () => {
  it('should show correct initial values', () => {
    const { component, event } = setup();
    expect(event.props().value).toEqual('');
    const paramList = component.find(ParamList);
    expect(paramList).toHaveLength(0);
  });

  it('should submit when fields and params are populated', () => {
    const {
      component,
      event,
      close,
      onchange,
      button
    } = setup();
    event.props().onChange({
      target: {
        value: 'eventA'
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
      'eventA(10, "paramStr", true, 0x00001)',
      {
        variableSelected: 'eventA',
        params: ['10', '"paramStr"', 'true', '0x00001'],
        type: 'event'
      }
    );
  });

  it('should submit when fields and params are not populated', () => {
    const {
      component,
      event,
      close,
      onchange,
      button
    } = setup();
    event.props().onChange({
      target: {
        value: 'eventA'
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
      'eventA(0, "", false, an address)',
      {
        variableSelected: 'eventA',
        params: ['0', '""', 'false', 'an address'],
        type: 'event'
      }
    );
  });

  it('should not submit when event is not populated', () => {
    const {
      component,
      event,
      close,
      onchange,
      button
    } = setup();
    event.props().onChange({
      target: {
        value: ''
      }
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not submit when close button is clicked', () => {
    const {
      component,
      event,
      close,
      onchange,
      closeButton
    } = setup();
    event.props().onChange({
      target: {
        value: 'eventA'
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
