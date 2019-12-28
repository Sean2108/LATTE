import { DiagramEngine } from 'storm-react-diagrams';
import DiamondNodeModel from '../../app/components/build/diagram/diagram_node_declarations/DiamondNode/DiamondNodeModel';
import SimplePortFactory from '../../app/components/build/diagram/SimplePortFactory';
import DiamondPortModel from '../../app/components/build/diagram/diagram_node_declarations/DiamondNode/DiamondPortModel';
import DiamondNodeFactory from '../../app/components/build/diagram/diagram_node_declarations/DiamondNode/DiamondNodeFactory';

describe('DiamondNodeModel', () => {
  it('should construct correctly', () => {
    const diamondNodeModel = new DiamondNodeModel('a == b', {
      var1: 'a',
      var2: 'b',
      comp: '=='
    });
    expect(diamondNodeModel.name).toEqual('a == b');
    expect(diamondNodeModel.data).toEqual({
      var1: 'a',
      var2: 'b',
      comp: '=='
    });
    expect(Object.keys(diamondNodeModel.getPorts())).toHaveLength(4);
    expect(diamondNodeModel.outPortTrue).toEqual(
      expect.objectContaining({
        name: 'bottom',
        position: 'bottom',
        in: true
      })
    );
    expect(diamondNodeModel.outPortFalse).toEqual(
      expect.objectContaining({
        name: 'right',
        position: 'right',
        in: true
      })
    );
  });

  it('should not change after serialising and deserialising', () => {
    const diamondNodeModel = new DiamondNodeModel('a == b', {
      var1: 'a',
      var2: 'b',
      comp: '=='
    });
    const serialisedModel = diamondNodeModel.serialize();
    const deserialisedModel = new DiamondNodeModel('');
    const engine = new DiagramEngine();
    engine.registerPortFactory(
      new SimplePortFactory('diamond', () => new DiamondPortModel())
    );
    engine.registerNodeFactory(new DiamondNodeFactory());
    deserialisedModel.deSerialize(serialisedModel, engine);
    expect(deserialisedModel).toEqual(diamondNodeModel);
  });
});
