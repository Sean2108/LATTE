import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import { Tab, Popover, Tabs, TextField, Button } from '@material-ui/core';
import BuildTabs from '../../app/components/build/BuildTabs';
import { setupEngine } from '../../app/components/build/build_utils/DiagramUtils';
import InitialStateTab from '../../app/components/build/InitialStateTab';
import DefaultBuildTab from '../../app/components/build/DefaultBuildTab';
import GlobalParser from '../../app/components/build/parsers/GlobalParser';

jest.mock('../../app/components/build/parsers/GlobalParser');

Enzyme.configure({ adapter: new Adapter() });

function setup(hasMoreTabs = false) {
  const buildState = hasMoreTabs
    ? {
        tabs: ['Global State', 'Initial State', 'New Tab'],
        tabsCode: ['code1', 'code2'],
        variables: {},
        tabsParams: [
          [{ name: 'testparam1', value: 'a', type: 'uint' }],
          [{ name: 'testparam2', value: 'a', type: 'uint' }]
        ],
        tabsReturn: [null],
        tabsRequire: [
          [{ var1: 'test1var1', comp: '==', var2: 'test1var2' }],
          [{ var1: 'test2var1', comp: '>', var2: 'test2var2' }]
        ],
        constructorParams: [],
        events: {},
        entities: {},
        isView: [true, false],
        diagrams: [{ testdiag: 'a' }, { testdiag: 'b' }],
        gasHistory: [0],
        buildError: ''
      }
    : {
        tabs: ['Global State', 'Initial State'],
        tabsCode: ['code1'],
        variables: { teststr: 'string', testnum: 'uint' },
        tabsParams: [[{ name: 'testparam', value: 'a', type: 'uint' }]],
        tabsReturn: [null],
        tabsRequire: [[{ var1: 'test1var1', comp: '==', var2: 'test1var2' }]],
        constructorParams: [],
        events: {},
        entities: {},
        isView: [true],
        diagrams: [{ testdiag: 'a' }],
        gasHistory: [0],
        buildError: ''
      };
  const component = createMount()(
    <BuildTabs
      onTabsChange={jest.fn()}
      buildState={buildState}
      settings={{ bitsMode: true, indentation: '    ' }}
      connection={{ currentProvider: { host: 'http://localhost:8545' } }}
      updateLoading={jest.fn()}
      engine={setupEngine()}
      startNodes={[{ node1: 'test' }]}
      updateStartNodes={jest.fn()}
    />
  );
  const tabs = component.find(Tabs);
  const tab = tabs.find(Tab);
  const initialStateTab = component.find(InitialStateTab);
  const defaultBuildTab = component.find(DefaultBuildTab);
  const popover = component.find(Popover);
  return { component, tabs, tab, initialStateTab, defaultBuildTab, popover };
}

describe('BuildTabs component', () => {
  beforeEach(() => {
    GlobalParser.mockClear();
    window.focus = jest.fn();
  });

  afterEach(() => {
    window.focus.mockClear();
  });

  it('should have correct initial values', () => {
    const { tab, initialStateTab, defaultBuildTab, popover } = setup();
    expect(tab).toHaveLength(3);
    expect(tab.at(0).props().label).toEqual('Global State');
    expect(tab.at(1).props().label).toEqual('Initial State');
    expect(tab.at(2).props().label).toEqual('+');
    expect(initialStateTab).toHaveLength(1);
    expect(defaultBuildTab).toHaveLength(0);
    expect(popover).toHaveLength(1);
    expect(popover.props().open).toBe(false);
  });

  describe('Tabs', () => {
    it('should be able to close popover', () => {
      const { component, tab } = setup();
      tab
        .at(2)
        .props()
        .onClick({ currentTarget: { getBoundingClientRect: () => ({}) } });
      component.update();
      expect(component.find(Popover).props().open).toBe(true);
      component
        .find(Popover)
        .props()
        .onClose();
      component.update();
      expect(component.find(Popover).props().open).toBe(false);
    });

    it('should add tab correctly', () => {
      const { component, tab } = setup();
      tab
        .at(2)
        .props()
        .onClick({ currentTarget: { getBoundingClientRect: () => ({}) } });
      component.update();
      expect(component.find(InitialStateTab)).toHaveLength(1);
      expect(component.find(DefaultBuildTab)).toHaveLength(0);
      const popover = component.find(Popover);
      expect(popover.props().open).toBe(true);
      popover
        .find(TextField)
        .props()
        .onChange({ currentTarget: { value: 'New Tab' } });
      popover
        .find(Button)
        .props()
        .onClick();
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        tabs: ['Global State', 'Initial State', 'New Tab'],
        tabsCode: ['code1', ''],
        tabsParams: [[{ name: 'testparam', value: 'a', type: 'uint' }], []],
        tabsRequire: [
          [{ var1: 'test1var1', comp: '==', var2: 'test1var2' }],
          []
        ],
        isView: [true, false],
        diagrams: [{ testdiag: 'a' }, {}]
      });
      expect(component.props().onTabsChange).toHaveBeenCalledTimes(1);
      expect(component.props().updateStartNodes).toHaveBeenCalledWith([
        { node1: 'test' },
        null
      ]);
    });

    it('should not add tab when tab already exists', () => {
      const { component, tab } = setup();
      tab
        .at(2)
        .props()
        .onClick({ currentTarget: { getBoundingClientRect: () => ({}) } });
      component.update();
      const popover = component.find(Popover);
      expect(popover.props().open).toBe(true);
      popover
        .find(TextField)
        .props()
        .onChange({ currentTarget: { value: 'INITIAL STATE' } });
      popover
        .find(Button)
        .props()
        .onClick();
      expect(component.props().onTabsChange).not.toHaveBeenCalled();
      expect(component.props().updateStartNodes).not.toHaveBeenCalled();
    });

    it('should not add tab when tab name is empty', () => {
      const { component, tab } = setup();
      tab
        .at(2)
        .props()
        .onClick({ currentTarget: { getBoundingClientRect: () => ({}) } });
      component.update();
      const popover = component.find(Popover);
      expect(popover.props().open).toBe(true);
      popover
        .find(TextField)
        .props()
        .onChange({ currentTarget: { value: '' } });
      popover
        .find(Button)
        .props()
        .onClick();
      expect(component.props().onTabsChange).not.toHaveBeenCalled();
      expect(component.props().updateStartNodes).not.toHaveBeenCalled();
    });
  });

  describe('InitialStateTab', () => {
    it('should be able to update entities', () => {
      const { component, initialStateTab } = setup();
      expect(initialStateTab.props().entities).toEqual({});
      initialStateTab.props().updateEntities({ testentity: ['test'] });
      expect(component.props().onTabsChange).toHaveBeenCalledWith(
        expect.objectContaining({ entities: { testentity: ['test'] } })
      );
    });

    it('should be able to update events', () => {
      const { component, initialStateTab } = setup();
      expect(initialStateTab.props().events).toEqual({});
      initialStateTab.props().updateEvents({ testevent: ['test'] });
      expect(component.props().onTabsChange).toHaveBeenCalledWith(
        expect.objectContaining({ events: { testevent: ['test'] } })
      );
    });

    it('should be able to update params', () => {
      const { component, initialStateTab } = setup();
      expect(initialStateTab.props().params).toEqual([]);
      initialStateTab.props().updateParams([{ name: 'testparams' }]);
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        constructorParams: [{ name: 'testparams' }]
      });
    });
  });

  describe('DefaultBuildTab', () => {
    it('should have correct initial state for constructor', () => {
      const { component, tabs } = setup();
      tabs.props().onChange({ currentTarget: { value: '' } }, 1);
      component.update();
      expect(component.find(InitialStateTab)).toHaveLength(0);
      const defaultBuildTab = component.find(DefaultBuildTab);
      expect(defaultBuildTab).toHaveLength(1);
      expect(defaultBuildTab.props().isConstructor).toBe(true);
    });

    it('should be able to update params for constructor', () => {
      const { component, tabs } = setup();
      tabs.props().onChange({ currentTarget: { value: '' } }, 1);
      component.update();
      const defaultBuildTab = component.find(DefaultBuildTab);
      expect(defaultBuildTab.props().params).toEqual([
        { name: 'testparam', value: 'a', type: 'uint' }
      ]);
      defaultBuildTab
        .props()
        .onChangeParams([{ name: 'testparam1', value: 'b', type: 'string' }]);
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        tabsParams: [[{ name: 'testparam1', value: 'b', type: 'string' }]]
      });
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        constructorParams: [{ name: 'testparam1', value: '', type: 'string' }]
      });
      expect(component.props().onTabsChange).toHaveBeenCalledTimes(2);
    });

    it('should be able to update params for non constructor', () => {
      const { component, tabs } = setup(true);
      tabs.props().onChange({ currentTarget: { value: '' } }, 2);
      component.update();
      const defaultBuildTab = component.find(DefaultBuildTab);
      expect(defaultBuildTab.props().params).toEqual([
        { name: 'testparam2', value: 'a', type: 'uint' }
      ]);
      defaultBuildTab
        .props()
        .onChangeParams([{ name: 'testparam2', value: 'b', type: 'string' }]);
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        tabsParams: [
          [{ name: 'testparam1', value: 'a', type: 'uint' }],
          [{ name: 'testparam2', value: 'b', type: 'string' }]
        ]
      });
      expect(component.props().onTabsChange).toHaveBeenCalledTimes(1);
    });

    it('should be able to update variables', () => {
      const { component, tabs } = setup();
      tabs.props().onChange({ currentTarget: { value: '' } }, 1);
      component.update();
      const defaultBuildTab = component.find(DefaultBuildTab);
      expect(defaultBuildTab.props().varList).toEqual({
        teststr: 'string',
        testnum: 'uint'
      });
      defaultBuildTab.props().onVariablesChange({
        teststr: 'string',
        testnum: 'uint',
        testbool: 'bool'
      });
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        variables: { teststr: 'string', testnum: 'uint', testbool: 'bool' }
      });
      expect(component.props().onTabsChange).toHaveBeenCalledTimes(1);
    });

    it('should be able to update build error', () => {
      const { component, tabs } = setup();
      tabs.props().onChange({ currentTarget: { value: '' } }, 1);
      component.update();
      const defaultBuildTab = component.find(DefaultBuildTab);
      defaultBuildTab.props().updateBuildError('test error');
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        buildError: 'test error'
      });
      expect(component.props().onTabsChange).toHaveBeenCalledTimes(1);
    });

    it('should be able to update requires', () => {
      const { component, tabs } = setup();
      tabs.props().onChange({ currentTarget: { value: '' } }, 1);
      component.update();
      const defaultBuildTab = component.find(DefaultBuildTab);
      expect(defaultBuildTab.props().requires).toEqual([
        { var1: 'test1var1', comp: '==', var2: 'test1var2' }
      ]);
      defaultBuildTab
        .props()
        .onChangeRequire([
          { var1: 'test1var1new', comp: '>=', var2: 'test1var2new' }
        ]);
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        tabsRequire: [
          [{ var1: 'test1var1new', comp: '>=', var2: 'test1var2new' }]
        ]
      });
      expect(component.props().onTabsChange).toHaveBeenCalledTimes(1);
    });

    it('should be able to update start nodes', () => {
      const { component, tabs } = setup();
      tabs.props().onChange({ currentTarget: { value: '' } }, 1);
      component.update();
      const defaultBuildTab = component.find(DefaultBuildTab);
      defaultBuildTab.props().updateStartNode({ node2: 'test2' });
      expect(component.props().updateStartNodes).toHaveBeenCalledWith([
        { node2: 'test2' }
      ]);
    });

    it('should be able to trigger parse', () => {
      const { component, tabs } = setup();
      const mockGlobalParserInstance = GlobalParser.mock.instances[0];
      tabs.props().onChange({ currentTarget: { value: '' } }, 1);
      component.update();
      const defaultBuildTab = component.find(DefaultBuildTab);
      defaultBuildTab.props().triggerParse({ newDiag: 'test' });
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        variables: {}
      });
      expect(component.props().onTabsChange).toHaveBeenCalledWith({
        diagrams: [{ newDiag: 'test' }]
      });
      expect(mockGlobalParserInstance.parse).toHaveBeenCalledWith(
        expect.objectContaining(component.props()),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});
