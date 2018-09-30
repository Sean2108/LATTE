import * as SRD from "storm-react-diagrams";
import {
  DiamonNodeWidget
} from "./DiamondNodeWidget";
import {
  DiamondNodeModel
} from "./DiamondNodeModel";
import * as React from "react";

export class DiamondNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super("diamond");
  }

  generateReactWidget(diagramEngine, node) {
    return <DiamonNodeWidget node = {
      node
    }
    size = {
      50
    }
    />;
  }

  getNewInstance() {
    return new DiamondNodeModel();
  }
}
