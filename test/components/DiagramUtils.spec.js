import {
  setupEngine,
  extractStartNodes,
  getNewStartNode
} from '../../app/components/build/build_utils/DiagramUtils';
import { DiagramEngine } from 'storm-react-diagrams';

describe('DiagramUtils component', () => {
  const serializedDiagram = {
    id: 'e3dd5760-5c4d-4a4f-9765-fb677bc7c412',
    offsetX: 0,
    offsetY: 0,
    zoom: 100,
    gridSize: 0,
    links: [
      {
        id: '94096f63-6073-4a0b-9565-09be384f71e7',
        type: 'default',
        selected: false,
        source: '13e6c386-0eb5-4294-bb77-d05fc0d8d8e3',
        sourcePort: 'f9b82658-ca41-47af-b772-60f6be4a812f',
        target: '1c698966-b8dc-46cf-bdb3-5c6b92b1d5ce',
        targetPort: 'f9ffde5a-3b8f-45ba-8760-e51259d97317',
        points: [
          {
            id: '500c0b09-c8e1-4e05-9e5c-35929bc2cae8',
            selected: false,
            x: 123.75,
            y: 132.5
          },
          {
            id: 'fd0b59a5-74a8-4b71-9091-3dadbc26b58d',
            selected: true,
            x: 282.5,
            y: 131.15625
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
        id: '1c698966-b8dc-46cf-bdb3-5c6b92b1d5ce',
        type: 'data',
        selected: false,
        x: 273,
        y: 90.66665649414062,
        extras: {},
        ports: [
          {
            id: 'f9ffde5a-3b8f-45ba-8760-e51259d97317',
            type: 'default',
            selected: false,
            name: '6bf21437-af75-4ac8-8d8b-4096bcf9875e',
            parentNode: '1c698966-b8dc-46cf-bdb3-5c6b92b1d5ce',
            links: ['94096f63-6073-4a0b-9565-09be384f71e7'],
            in: true,
            label: ' '
          },
          {
            id: '5d7d4024-aa92-4aab-b190-942d83fd735c',
            type: 'default',
            selected: false,
            name: '28bb91a3-d6a7-4461-8ee9-a19f68aebfa9',
            parentNode: '1c698966-b8dc-46cf-bdb3-5c6b92b1d5ce',
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
      },
      {
        id: '13e6c386-0eb5-4294-bb77-d05fc0d8d8e3',
        type: 'data',
        selected: false,
        x: 96,
        y: 92,
        extras: {},
        ports: [
          {
            id: 'f9b82658-ca41-47af-b772-60f6be4a812f',
            type: 'default',
            selected: false,
            name: 'f4774dbe-0d16-4ef7-90b8-4f2ba177fa86',
            parentNode: '13e6c386-0eb5-4294-bb77-d05fc0d8d8e3',
            links: ['94096f63-6073-4a0b-9565-09be384f71e7'],
            maximumLinks: 1,
            in: false,
            label: ' '
          }
        ],
        name: 'Start',
        color: 'rgb(0,192,255)',
        data: {}
      }
    ]
  };

  it('extractStartNodes should return start nodes correctly', () => {
    const engine = setupEngine();
    const res = extractStartNodes(engine, [{}, serializedDiagram]);
    expect(res).toHaveLength(2);
    expect(res).toEqual([
      null,
      expect.objectContaining({ name: 'Start', color: 'rgb(0,192,255)' })
    ]);
  });

  it('getNewStartNode constructs new start node correctly', () => {
    const startNode = getNewStartNode();
    expect(startNode).toEqual(
      expect.objectContaining({
        name: 'Start',
        color: 'rgb(0,192,255)',
        x: 100,
        y: 100
      })
    );
    const ports = startNode.ports;
    expect(Object.keys(ports)).toHaveLength(1);
    expect(Object.values(ports)[0]).toEqual(
      expect.objectContaining({ maximumLinks: 1, in: false })
    );
  });
});
