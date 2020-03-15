import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import { Drawer, Snackbar } from '@material-ui/core';
import DefaultBuildTab from '../../app/components/build/DefaultBuildTab';
import VariableList from '../../app/components/build/build_components/VariableList';
import RequiresList from '../../app/components/build/build_components/RequiresList';
import BuildDiagram from '../../app/components/build/BuildDiagram';
import EditHistory from '../../app/components/build/build_utils/EditHistory';
import { setupEngine } from '../../app/components/build/build_utils/DiagramUtils';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const component = createMount()(
    <DefaultBuildTab
      varList={{}}
      events={{}}
      entities={{}}
      onParse={jest.fn()}
      onChangeParams={jest.fn()}
      onChangeRequire={jest.fn()}
      onVariablesChange={jest.fn()}
      params={[]}
      requires={[]}
      diagram={{}}
      settings={{ bitsMode: false, indentation: '    ' }}
      gasHistory={[]}
      updateGasHistory={jest.fn()}
      updateBuildError={jest.fn()}
      isConstructor={false}
      editHistory={new EditHistory(1)}
      updateLoading={jest.fn()}
      engine={setupEngine()}
      startNode={null}
      updateStartNode={jest.fn()}
    />
  );
  const innerComponent = component.childAt(0);
  const variableList = component.find(VariableList);
  const requiresList = component.find(RequiresList);
  const buildDiagram = component.find(BuildDiagram);
  const drawer = component.find(Drawer);
  const snackbar = component.find(Snackbar);
  return {
    component,
    innerComponent,
    variableList,
    requiresList,
    buildDiagram,
    drawer,
    snackbar
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
      drawer,
      snackbar
    } = setup();
    expect(variableList).toHaveLength(1);
    expect(requiresList).toHaveLength(1);
    expect(buildDiagram).toHaveLength(1);
    expect(drawer).toHaveLength(1);
    expect(snackbar).toHaveLength(1);
    expect(innerComponent.state().drawerOpen).toEqual(false);
  });

  it('drawer should be able to open and close', () => {
    const { innerComponent, buildDiagram, drawer } = setup();
    buildDiagram.props().openDrawer();
    expect(innerComponent.state().drawerOpen).toEqual(true);
    drawer.props().onClose();
    expect(innerComponent.state().drawerOpen).toEqual(false);
  });

  it('snackbar should be able to open and close', () => {
    const { innerComponent, buildDiagram, snackbar } = setup();
    buildDiagram.props().showWarning('test warning');
    expect(innerComponent.state().warning).toEqual('test warning');
    snackbar.props().onClose();
    expect(innerComponent.state().warning).toEqual('');
  });
});
