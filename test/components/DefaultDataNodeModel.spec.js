import { DiagramEngine } from 'storm-react-diagrams';
import DefaultDataNodeModel from '../../app/components/build/diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';
import DefaultDataNodeFactory from '../../app/components/build/diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeFactory';

describe('DefaultDataNodeModel', () => {

  it('should not change after serialising and deserialising', () => {
    const defaultDataNodeModel = new DefaultDataNodeModel('a = b', 'red', {
      var1: 'a',
      var2: 'b',
      operator: '='
    });
    const serialisedModel = defaultDataNodeModel.serialize();
    const deserialisedModel = new DefaultDataNodeModel();
    const engine = new DiagramEngine();
    engine.registerNodeFactory(new DefaultDataNodeFactory());
    deserialisedModel.deSerialize(serialisedModel, engine);
    expect(deserialisedModel).toEqual(defaultDataNodeModel);
  });
});
