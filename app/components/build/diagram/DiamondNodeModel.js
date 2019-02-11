import { NodeModel } from "storm-react-diagrams";
import { DiamondPortModel } from "./DiamondPortModel";

export class DiamondNodeModel extends NodeModel {

	outPortTrue; 
	outPortFalse;
	name;

	constructor(message) {
		super("diamond", message);
		this.name = message;
		this.addPort(new DiamondPortModel("top", true, ""));
		this.addPort(new DiamondPortModel("left", true, ""));
		this.outPortTrue = this.addPort(new DiamondPortModel("bottom", false, "True"));
		this.outPortFalse = this.addPort(new DiamondPortModel("right", false, "False"));
	}
}