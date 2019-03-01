import * as React from "react";
import { NodeModel, DiagramEngine } from "storm-react-diagrams";
import { DiamondPortModel } from "./DiamondPortModel";

export class DiamondNodeModel extends NodeModel {

	outPortTrue; 
	outPortFalse;
	name;

	constructor(message) {
		super("diamond", message);
		this.name = message;
		this.createPorts();
	}

	deSerialize(object, engine: DiagramEngine) {
		super.deSerialize(object, engine);
		this.name = object.name;
		this.createPorts();
	}

	createPorts() {
		this.addPort(new DiamondPortModel("top", false, ""));
		this.addPort(new DiamondPortModel("left", false, ""));
		this.outPortTrue = this.addPort(new DiamondPortModel("bottom", true, <font color="white">True</font>));
		this.outPortFalse = this.addPort(new DiamondPortModel("right", true, <font color="white">False</font>));
	}

	serialize() {
		return _.merge(super.serialize(), {
			name: this.name,
			outPortTrue: this.outPortTrue.serialize(),
			outPortFalse: this.outPortFalse.serialize(),
			ports: Object.values(this.getPorts()).map(port => port.serialize())
		});
	}
}