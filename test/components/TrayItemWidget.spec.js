import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import TrayItemWidget from '../../app/components/build/diagram/TrayItemWidget';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const component = createMount()(
    <TrayItemWidget color="primary" model={{ x: 'y' }} name="testNode" />
  );
  const div = component.find('div');
  return { component, div };
}

describe('TrayItemWidget component', () => {
  it('should have correct props', () => {
    const { div } = setup();
    expect(div.text()).toEqual('testNode');
    const { draggable, style, onDragStart } = div.props();
    expect(draggable).toBe(true);
    expect(style).toEqual({ borderColor: 'primary' });
    const setData = jest.fn();
    onDragStart({ dataTransfer: { setData } });
    expect(setData).toHaveBeenCalledWith('storm-diagram-node', '{"x":"y"}');
  });
});
