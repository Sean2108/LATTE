import { DefaultPortModel } from 'storm-react-diagrams';
import DiamondPortModel from '../../app/components/build/diagram/diagram_node_declarations/DiamondNode/DiamondPortModel';

describe('DiamondPortModel', () => {
  it('should construct correctly', () => {
    const diamondPortModel = new DiamondPortModel('right', false, 'true');
    expect(diamondPortModel.name).toEqual('right');
    expect(diamondPortModel.position).toEqual('right');
    expect(diamondPortModel.type).toEqual('diamond');
    expect(diamondPortModel.label).toEqual('true');
    expect(diamondPortModel.maximumLinks).toEqual(1);
  });

  it('should be able to link an input to output port', () => {
    const diamondPortModelOut = new DiamondPortModel('right', false, 'out');
    const diamondPortModelIn = new DiamondPortModel('left', true, 'in');
    expect(diamondPortModelOut.canLinkToPort(diamondPortModelIn)).toBe(true);
  })

  it('should not be able to link an output to output port', () => {
    const diamondPortModel1 = new DiamondPortModel('1', false, '1');
    const diamondPortModel2 = new DiamondPortModel('2', false, '2');
    expect(diamondPortModel1.canLinkToPort(diamondPortModel2)).toBe(false);
  })

  it('should not be able to link an input to input port', () => {
    const diamondPortModel1 = new DiamondPortModel('1', true, '1');
    const diamondPortModel2 = new DiamondPortModel('2', true, '2');
    expect(diamondPortModel1.canLinkToPort(diamondPortModel2)).toBe(false);
  })

  it('should be able to link an to a data port', () => {
    const diamondPortModelOut = new DiamondPortModel('right', false, 'out');
    const dataPort = new DefaultPortModel(true, 'data');
    expect(diamondPortModelOut.canLinkToPort(dataPort)).toBe(true);
  })
});
