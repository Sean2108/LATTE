import * as React from "react";
import { NodeModel } from "storm-react-diagrams";
import { DiamondPortModel } from "./DiamondPortModel";

export class DiamondNodeModel extends NodeModel {

	outPortTrue; 
	outPortFalse;
	name;

	constructor(message) {
		super("diamond", message);
		this.name = message;
		this.addPort(new DiamondPortModel("top", false, ""));
		this.addPort(new DiamondPortModel("left", false, ""));
		this.outPortTrue = this.addPort(new DiamondPortModel("bottom", true, <font color="white">True</font>));
		this.outPortFalse = this.addPort(new DiamondPortModel("right", true, <font color="white">False</font>));
	}
}