import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { Drawer } from '@material-ui/core';
import DefaultBuildTab from '../../app/components/build/DefaultBuildTab';
import VariableList from '../../app/components/build/build_components/VariableList';
import RequiresList from '../../app/components/build/build_components/RequiresList';
import BuildDiagram from '../../app/components/build/BuildDiagram';

Enzyme.configure({ adapter: new Adapter() });

function setup(createComponentMount = true) {
  const createComponentFn = createComponentMount ? createMount : createShallow;
  const component = createComponentFn()(
    <DefaultBuildTab
      varList={{}}
      events={{}}
      entities={{}}
      onChangeLogic={jest.fn()}
      onChangeParams={jest.fn()}
      onChangeReturn={jest.fn()}
      onChangeRequire={jest.fn()}
      onVariablesChange={jest.fn()}
      params={[]}
      requires={[]}
      diagram={{}}
      onChangeView={jest.fn()}
      updateDiagram={jest.fn()}
      settings={{ bitsMode: false, indentation: '    ' }}
      gasHistory={[]}
      updateGasHistory={jest.fn()}
      updateBuildError={jest.fn()}
      isConstructor={false}
    />
  );
  const input = [
    { name: '', type: 'uint' },
    { name: 'some_uint', type: 'uint' },
    { name: 'some_uint_bits', type: 'uint', bits: '8' },
    { name: 'some_str', type: 'string' },
    { name: 'some_str_bits', type: 'string', bits: '16' },
    { name: 'some_addr', type: 'address' },
    { name: 'some_bool', type: 'bool' }
  ];
  const innerComponent = component.childAt(0);
  const variableList = component.find(VariableList);
  const requiresList = component.find(RequiresList);
  const buildDiagram = component.find(BuildDiagram);
  const drawer = component.find(Drawer);
  return {
    component,
    innerComponent,
    variableList,
    requiresList,
    buildDiagram,
    drawer,
    input
  };
}

describe('DefaultBuildTab component', () => {
  beforeEach(() => {
    window.focus = jest.fn();
  });

  afterEach(() => {
    window.focus.mockClear();
  });

  it('initial state should be correct', () => {
    const {
      innerComponent,
      variableList,
      requiresList,
      buildDiagram,
      drawer
    } = setup();
    expect(variableList).toHaveLength(1);
    expect(requiresList).toHaveLength(1);
    expect(buildDiagram).toHaveLength(1);
    expect(drawer).toHaveLength(1);
    expect(innerComponent.state().drawerOpen).toEqual(false);
  });

  it('drawer should be able to open and close', () => {
    const { innerComponent, buildDiagram, drawer } = setup();
    buildDiagram.props().openDrawer();
    expect(innerComponent.state().drawerOpen).toEqual(true);
    drawer.props().onClose();
    expect(innerComponent.state().drawerOpen).toEqual(false);
  });
});

describe('DefaultBuildTab flattenParamsToObject function', () => {
  it('should work with bitsMode on', () => {
    const { component, input } = setup(false);
    const expected = {
      some_uint: 'uint',
      some_uint_bits: 'uint8',
      some_str: 'string',
      some_str_bits: 'bytes16',
      some_addr: 'address',
      some_bool: 'bool'
    };
    expect(
      component
        .dive()
        .instance()
        .flattenParamsToObject(input, true)
    ).toEqual(expected);
  });

  it('should work with bitsMode off', () => {
    const { component, input } = setup(false);
    const expected = {
      some_uint: 'uint',
      some_uint_bits: 'uint',
      some_str: 'string',
      some_str_bits: 'string',
      some_addr: 'address',
      some_bool: 'bool'
    };
    expect(
      component
        .dive()
        .instance()
        .flattenParamsToObject(input, false)
    ).toEqual(expected);
  });
});
