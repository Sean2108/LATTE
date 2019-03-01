import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {TrayWidget} from "./diagram/TrayWidget";
import {TrayItemWidget} from "./diagram/TrayItemWidget";
import {DiamondNodeModel} from "./diagram/DiamondNodeModel";
import {DiamondNodeFactory} from "./diagram/DiamondNodeFactory";
import {SimplePortFactory} from "./diagram/SimplePortFactory";
import {DiamondPortModel} from "./diagram/DiamondPortModel";
import {DiagramEngine, DiagramModel, DefaultNodeModel, LinkModel, DiagramWidget} from "storm-react-diagrams";
import DiagramModal from './diagram/DiagramModal';
import { BuildParser } from './BuildParser';

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: 'theme.palette.text.secondary'
    }
});

class BuildDiagram extends React.Component {
    state = {
        open: false,
        type: '',
        points: null
    }

    engine;
    start;
    model;
    buildParser;

    componentWillMount() {
        this.engine = new DiagramEngine();
        this
            .engine
            .installDefaultFactories();
        this
            .engine
            .registerPortFactory(new SimplePortFactory("diamond", config => new DiamondPortModel()));
        this
            .engine
            .registerNodeFactory(new DiamondNodeFactory());

        this.model = new DiagramModel();
        if (Object.entries(this.props.diagram).length > 0) {
            this.model.deSerializeDiagram(this.props.diagram, this.engine);
            this.start = this.findStart();
        }
        if (!this.start) {
            this.start = new DefaultNodeModel("Start", "rgb(0,192,255)");
            var startOut = this.start.addOutPort(" ");
            startOut.setMaximumLinks(1);
            this.start.setPosition(100, 100);
            this.model.addAll(this.start);
        }
        this.buildParser = new BuildParser(this.props.onVariablesChange);
        this.model.addListener({
            linksUpdated: () => {
                setTimeout(() => {
                    this.buildParser.reset(this.props.varList);
                    let code = this.buildParser.traverseNextNode(this.start);
                    this.props.onChangeLogic(code);
                    this.props.onChangeReturn(this.buildParser.getReturnVar());
                    this.props.updateDiagram(this.model.serializeDiagram());
                }, 5000);
            }
       });

        this
            .engine
            .setDiagramModel(this.model);
    }

    findStart() {
        for (let node of Object.values(this.model.getNodes())) {
            if (node.name === 'Start') {
                return node;
            }
        }
        return null;
    }

    createDefaultNode(label, color, isReturn) {
        var node = new DefaultNodeModel(label, color);
        node.addInPort(" ");
        if (!isReturn) {
            let outPort = node.addOutPort(" ");
            outPort.setMaximumLinks(1);
        }
        return node;
    }

    selectNode(type, desc) {
        switch (type) {
            case "assignment":
                return this.createDefaultNode(`Assignment: ${desc}`, "rgb(192,0,0)", false);
            case "event":
                return this.createDefaultNode(`Emit Event: ${desc}`, "rgb(0,192,0)", false);
            case "entity":
                return this.createDefaultNode(`New Entity: ${desc}`, "rgb(100,100,0)", false);
            case "transfer":
                return this.createDefaultNode(`Transfer: ${desc}`, "rgb(255,100,0)", false);
            case "return":
                return this.createDefaultNode(`Return: ${desc}`, "rgb(192,255,0)", true);
            case "conditional":
                return new DiamondNodeModel(`${desc}`);
        }
        return null;
    }

    addNode(info) {
        let node = this.selectNode(this.state.type, info);
        node.x = this.state.points.x;
        node.y = this.state.points.y;
        this
            .engine
            .getDiagramModel()
            .addNode(node);
        this.forceUpdate();
    }

    render() {
        const {classes, theme, varList, events, entities} = this.props;

        return (< Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > Action Phase < /Typography>
        <DiagramModal open={this.state.open} close={() => {this.setState({open: false})}} submit={(info)=>this.addNode(info)} 
        type={this.state.type} varList={varList} events={events} entities={entities} addNode={this.addNode}/ > 
        < div className = "body" > < div className = "header" > < div className = "title" > Nodes < /div > < /div > < div className = "content" > < TrayWidget > 
        < TrayItemWidget model = {
            {
                type: "assignment"
            }
        }
        name = "Assignment Node" color = "rgb(192,0,0)" /> < TrayItemWidget model = {
            {
                type: "event"
            }
        }
        name = "Event Node" color = "rgb(0,192,0)" /> < TrayItemWidget model = {
            {
                type: "entity"
            }
        }
        name = "New Entity Node" color = "rgb(100,100,0)" />< TrayItemWidget model = {
            {
                type: "transfer"
            }
        }
        name = "Transfer Node" color = "rgb(255,0,192)" /> < TrayItemWidget model = {
            {
                type: "return"
            }
        }
        name = "Return Node" color = "rgb(255,100,0)" /> < TrayItemWidget model = {
            {
                type: "conditional"
            }
        }
        name = "Conditional Node" color = "rgb(192,0,255)" /> < /TrayWidget> <
      div className="diagram-layer"
                    onDrop={
                      event => {
                        var data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));
                        this.setState({open: true, type: data.type, points: this.engine.getRelativeMousePoint(event)});
                        this.model.clearSelection();
                      }
                    }
                    onDragOver={
                      event => {
                        event.preventDefault();
                      }
                    } >
                    <
                      DiagramWidget diagramEngine={
                        this.engine
                      }
                      className="srd-canvas"
                      allowLooseLinks={
                        false
                      }
                    / > < /
      div > <
      /div > < /
      div >
              
      <
      /Paper >);
    }
}

BuildDiagram.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    varList: PropTypes.object.isRequired,
    events: PropTypes.object.isRequired,
    entities: PropTypes.object.isRequired,
    onChangeLogic: PropTypes.func.isRequired,
    onVariablesChange: PropTypes.func.isRequired,
    onChangeReturn: PropTypes.func.isRequired,
    diagram: PropTypes.object.isRequired,
    updateDiagram: PropTypes.func.isRequired
};

export default withStyles(styles, {withTheme: true})(BuildDiagram);
