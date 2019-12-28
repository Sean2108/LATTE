import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMount } from '@material-ui/core/test-utils';
import Button from '@material-ui/core/Button';
import { DiagramModel } from 'storm-react-diagrams';
import BuildDiagram from '../../app/components/build/BuildDiagram';
import DiagramModal from '../../app/components/build/diagram/DiagramModal';

Enzyme.configure({ adapter: new Adapter() });

function setup(emptyDiagram = true) {
  window.focus = () => {};
  const diagram = emptyDiagram
    ? {}
    : {
        id: '44b58239-f42e-414d-9e15-2688bea289cb',
        offsetX: 0,
        offsetY: 0,
        zoom: 100,
        gridSize: 0,
        links: [
          {
            id: '399f0a29-d410-48a6-8306-713b577d01d1',
            type: 'default',
            selected: false,
            source: '48357b2b-bba5-498a-ab5e-b5bbf2cdf47b',
            sourcePort: 'c9de436e-086c-4b09-abc4-0d9ebc11fbef',
            target: '04029a0d-04b3-403a-87e4-b71ef078e293',
            targetPort: '878c8369-1671-45a9-9bf4-2af2e6bff5a9',
            points: [
              {
                id: '2cf8229b-a4f0-46e9-9ec5-7520f543fca1',
                selected: false,
                x: 127.75,
                y: 140.5
              },
              {
                id: '5c01f0ba-820c-44fd-8759-339b97609ee3',
                selected: false,
                x: 218.5,
                y: 139.15625
              }
            ],
            extras: {},
            labels: [],
            width: 3,
            color: 'rgba(255,255,255,0.5)',
            curvyness: 50
          }
        ],
        nodes: [
          {
            id: '48357b2b-bba5-498a-ab5e-b5bbf2cdf47b',
            type: 'data',
            selected: false,
            x: 100,
            y: 100,
            extras: {},
            ports: [
              {
                id: 'c9de436e-086c-4b09-abc4-0d9ebc11fbef',
                type: 'default',
                selected: false,
                name: '2b7348ec-25ab-45c5-9e20-1fc251d47920',
                parentNode: '48357b2b-bba5-498a-ab5e-b5bbf2cdf47b',
                links: ['399f0a29-d410-48a6-8306-713b577d01d1'],
                maximumLinks: 1,
                in: false,
                label: ' '
              }
            ],
            name: 'Start',
            color: 'rgb(0,192,255)',
            data: {}
          },
          {
            id: '04029a0d-04b3-403a-87e4-b71ef078e293',
            type: 'data',
            selected: false,
            x: 209,
            y: 98.66665649414062,
            extras: {},
            ports: [
              {
                id: '878c8369-1671-45a9-9bf4-2af2e6bff5a9',
                type: 'default',
                selected: false,
                name: '209e22ed-68d5-4dd4-ba62-5b84541af708',
                parentNode: '04029a0d-04b3-403a-87e4-b71ef078e293',
                links: ['399f0a29-d410-48a6-8306-713b577d01d1'],
                in: true,
                label: ' '
              },
              {
                id: 'b786089c-7589-468d-9797-803fd6e60af7',
                type: 'default',
                selected: false,
                name: '9de87160-f60a-4ce9-b867-183922e8040d',
                parentNode: '04029a0d-04b3-403a-87e4-b71ef078e293',
                links: [],
                maximumLinks: 1,
                in: false,
                label: ' '
              }
            ],
            name: 'Assignment: a = 5',
            color: 'rgb(192,0,0)',
            data: {
              variableSelected: 'a',
              assignment: '=',
              assignedVal: '5',
              isMemory: true,
              type: 'assignment'
            }
          }
        ]
      };
  const component = createMount()(
    <BuildDiagram
      varList={{}}
      functionParams={{}}
      events={{}}
      entities={{}}
      onChangeLogic={jest.fn()}
      onVariablesChange={jest.fn()}
      onChangeReturn={jest.fn()}
      diagram={diagram}
      onChangeView={jest.fn()}
      updateDiagram={jest.fn()}
      bitsMode
      openDrawer={jest.fn()}
      gasHistory={[]}
      updateGasHistory={jest.fn()}
      updateBuildError={jest.fn()}
    />
  );
  const buttons = component.find(Button);
  const diagramLayer = component.find('div.diagram-layer');
  return {
    component,
    buttons,
    diagramLayer
  };
}

describe('BuildDiagram component', () => {
  it('should be able to setup diagram successfully', () => {
    expect(() => setup(false)).not.toThrow();
    expect(() => setup(true)).not.toThrow();
  });

  it('should open gas drawer when button is clicked', () => {
    const { component, buttons } = setup();
    buttons
      .at(0)
      .props()
      .onClick();
    expect(component.props().openDrawer).toHaveBeenCalled();
  });

  it('should add assignment node correctly', () => {
    const { component, diagramLayer } = setup();
    const addNodeFn = jest.spyOn(DiagramModel.prototype, 'addNode');
    JSON.parse = jest.fn().mockReturnValueOnce({ type: 'assignment' });
    diagramLayer.props().onDrop({
      dataTransfer: {
        getData: jest.fn()
      }
    });
    component.update();
    let modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(true);
    expect(modal.props().type).toEqual('assignment');
    modal.props().submit('desc', { testData1: 'a', testData2: 1 });
    expect(addNodeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Assignment: desc',
        color: 'rgb(192,0,0)',
        data: { testData1: 'a', testData2: 1 },
        type: 'data'
      })
    );
    modal.props().close();
    component.update();
    modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(false);
  });

  it('should add event node correctly', () => {
    const { component, diagramLayer } = setup();
    const addNodeFn = jest.spyOn(DiagramModel.prototype, 'addNode');
    JSON.parse = jest
      .fn()
      .mockReturnValueOnce({ type: 'event' })
      .mockReturnValue({});
    diagramLayer.props().onDrop({
      dataTransfer: {
        getData: jest.fn()
      }
    });
    component.update();
    let modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(true);
    expect(modal.props().type).toEqual('event');
    modal.props().submit('desc', { testData1: 'a', testData2: 1 });
    expect(addNodeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Emit Event: desc',
        color: 'rgb(0,192,0)',
        data: { testData1: 'a', testData2: 1 },
        type: 'data'
      })
    );
    modal.props().close();
    component.update();
    modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(false);
  });

  it('should add entity node correctly', () => {
    const { component, diagramLayer } = setup();
    const addNodeFn = jest.spyOn(DiagramModel.prototype, 'addNode');
    JSON.parse = jest
      .fn()
      .mockReturnValueOnce({ type: 'entity' })
      .mockReturnValue({});
    diagramLayer.props().onDrop({
      dataTransfer: {
        getData: jest.fn()
      }
    });
    component.update();
    let modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(true);
    expect(modal.props().type).toEqual('entity');
    modal.props().submit('desc', { testData1: 'a', testData2: 1 });
    expect(addNodeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Entity: desc',
        color: 'rgb(100,100,0)',
        data: { testData1: 'a', testData2: 1 },
        type: 'data'
      })
    );
    modal.props().close();
    component.update();
    modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(false);
  });

  it('should add transfer node correctly', () => {
    const { component, diagramLayer } = setup();
    const addNodeFn = jest.spyOn(DiagramModel.prototype, 'addNode');
    JSON.parse = jest.fn().mockReturnValueOnce({ type: 'transfer' });
    diagramLayer.props().onDrop({
      dataTransfer: {
        getData: jest.fn()
      }
    });
    component.update();
    let modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(true);
    expect(modal.props().type).toEqual('transfer');
    modal.props().submit('desc', { testData1: 'a', testData2: 1 });
    expect(addNodeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Transfer: desc',
        color: 'rgb(255,100,0)',
        data: { testData1: 'a', testData2: 1 },
        type: 'data'
      })
    );
    modal.props().close();
    component.update();
    modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(false);
  });

  it('should add return node correctly', () => {
    const { component, diagramLayer } = setup();
    const addNodeFn = jest.spyOn(DiagramModel.prototype, 'addNode');
    JSON.parse = jest.fn().mockReturnValueOnce({ type: 'return' });
    diagramLayer.props().onDrop({
      dataTransfer: {
        getData: jest.fn()
      }
    });
    component.update();
    let modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(true);
    expect(modal.props().type).toEqual('return');
    modal.props().submit('desc', { testData1: 'a', testData2: 1 });
    expect(addNodeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Return: desc',
        color: 'rgb(192,255,0)',
        data: { testData1: 'a', testData2: 1 },
        type: 'data'
      })
    );
    modal.props().close();
    component.update();
    modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(false);
  });

  it('should add conditional node correctly', () => {
    const { component, diagramLayer } = setup();
    const addNodeFn = jest.spyOn(DiagramModel.prototype, 'addNode');
    JSON.parse = jest.fn().mockReturnValueOnce({ type: 'conditional' });
    diagramLayer.props().onDrop({
      dataTransfer: {
        getData: jest.fn()
      }
    });
    component.update();
    let modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(true);
    expect(modal.props().type).toEqual('conditional');
    modal.props().submit('desc', { testData1: 'a', testData2: 1 });
    expect(addNodeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'desc',
        data: { testData1: 'a', testData2: 1 },
        type: 'diamond',
        outPortTrue: expect.objectContaining({
          name: 'bottom',
          position: 'bottom',
          in: false
        }),
        outPortFalse: expect.objectContaining({
          name: 'right',
          position: 'right',
          in: false
        })
      })
    );
    modal.props().close();
    component.update();
    modal = component.find(DiagramModal);
    expect(modal.props().open).toEqual(false);
  });
});
