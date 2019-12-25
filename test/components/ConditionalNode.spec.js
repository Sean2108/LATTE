import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import Button from '@material-ui/core/Button';
import RequireRow from '../../app/components/build/build_components/RequireRow';
import ConditionalNode from '../../app/components/build/diagram/diagram_node_options/ConditionalNode';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const close = jest.fn();
  const component = createMount()(
    <ConditionalNode submit={onchange} close={close} />
  );
  const requireRow = component.find(RequireRow);
  const buttons = component.find(Button);
  const closeButton = buttons.at(0);
  const button = buttons.at(1);
  return {
    component,
    requireRow,
    button,
    closeButton,
    onchange,
    close
  };
}

describe('ConditionalNode component', () => {
  it('should show correct initial value', () => {
    const { requireRow } = setup();
    expect(requireRow.props().require).toEqual({
      comp: '==',
      displayVar1: '',
      var1: '',
      displayVar2: '',
      var2: ''
    });
  });

  it('should submit when fields are populated', () => {
    const { requireRow, button, onchange, close } = setup();
    requireRow.props().updateRequire({
      comp: '>=',
      displayVar1: 'testVar1',
      var1: 'testVar1s',
      displayVar2: 'testVar2',
      var2: 'testVar2s'
    });
    button.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).toHaveBeenCalledWith('testVar1 >= testVar2', {
        comp: '>=',
        var1: 'testVar1',
        var2: 'testVar2',
        type: 'conditional'
    });
  });

  it('should not submit when var1 is empty', () => {
    const { requireRow, button, onchange, close } = setup();
    requireRow.props().updateRequire({
      comp: '>=',
      displayVar1: '',
      var1: '',
      displayVar2: 'testVar2',
      var2: 'testVar2s'
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not submit when var2 is empty', () => {
    const { requireRow, button, onchange, close } = setup();
    requireRow.props().updateRequire({
      comp: '>=',
      displayVar1: 'testVar1',
      var1: 'testVar1s',
      displayVar2: '',
      var2: ''
    });
    button.props().onClick();
    expect(close).not.toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });

  it('should not submit when close button is clicked', () => {
    const { requireRow, closeButton, onchange, close } = setup();
    requireRow.props().updateRequire({
      comp: '>=',
      displayVar1: 'testVar1',
      var1: 'testVar1s',
      displayVar2: 'testVar2',
      var2: 'testVar2s'
    });
    closeButton.props().onClick();
    expect(close).toHaveBeenCalled();
    expect(onchange).not.toHaveBeenCalled();
  });
});
