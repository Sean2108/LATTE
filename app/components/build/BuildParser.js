import { DiamondNodeModel } from "./diagram/DiamondNodeModel";

export class BuildParser {

    constructor(onVariablesChange) {
        this.reset();
        this.onVariablesChange = onVariablesChange;
    }

    reset(varList) {
        this.variables = {};
        this.returnVar = null;
        this.varList = varList;
    }

    getReturnVar() {
        return this.returnVar;
    }

    traverseNextNode(node) {
        if (node instanceof DiamondNodeModel) {
            let falseNextNode = this.getNextNode(node.outPortFalse);
            let trueNextNode = this.getNextNode(node.outPortTrue);
            if (!falseNextNode || !trueNextNode) {
                return '';
            }
            let trueWhileCode = this.generateCodeForCycle(node, true);
            if (trueWhileCode) {
                return `while (${this.parseNode('Compare: ' + node.name)}) {\n${trueWhileCode}}\n${this.traverseNextNode(falseNextNode)}`;
            }
            let falseWhileCode = this.generateCodeForCycle(node, false);
            if (falseWhileCode) {
                return `while (!(${this.parseNode('Compare: ' + node.name)})) {\n${falseWhileCode}}\n${this.traverseNextNode(trueNextNode)}`;
            }
            return `if (${this.parseNode('Compare: ' + node.name)}) {\n${this.traverseNextNode(trueNextNode)}} else {\n${this.traverseNextNode(falseNextNode)}}\n`;
        }
        if (!node) {
            return '';
        }
        let curNodeCode = node.name === 'Start' ? '' : this.parseNode(node.name) + '\n';
        let nextNode = this.getNextNodeForDefaultNode(node);
        if (!nextNode) {
            return curNodeCode;
        }
        return curNodeCode + this.traverseNextNode(nextNode);
    }
    
    getNextNode(outPort) {
        let links = Object.values(outPort.getLinks());
        if (links.length === 0 || !links[0].targetPort) {
            return null;
        }
        else {
            return links[0].targetPort.getNode();
        }
    }

    getNextNodeForDefaultNode(node) {
        if (node.getOutPorts().length === 0) {
            return null;
        }
        return this.getNextNode(node.getOutPorts()[0]);
    }

    parseNode(nodeCode) {
        let type, code, lhs, rhs, parsedLhs, parsedRhs;
        [type, code] = nodeCode.split(': ');
        switch (type) {
            case "Assignment":
                [lhs, rhs] = code.split(' = ');
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type === 'var') {
                    this.variables[parsedLhs.name] = parsedRhs.type;
                    this.onVariablesChange(this.variables);
                    return `${parsedLhs.name} = ${parsedRhs.name};`;
                }
                if (parsedLhs.type !== parsedRhs.type) {
                    alert('invalid assignment');
                }
                return `${parsedLhs.name} = ${parsedRhs.name};`;
            case "Emit Event":
                let eventName, params;
                [eventName, params] = code.split('(');
                params = params.replace(')', '').split(', ').map(param => this.parseVariable(param).name).join(', ');
                return `emit ${eventName}(${params});`
            case "Transfer":
                [lhs, rhs] = code.split(' to ');
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== 'int') {
                    alert('value should be an integer');
                }
                if (parsedRhs.type !== 'address') {
                    alert('transfer target should be an address');
                }
                return `${parsedRhs.name}.transfer(${parsedLhs.name});`;
            case "Return":
                let returnVar = this.parseVariable(code);
                this.returnVar = returnVar.type;
                return `return ${returnVar.name};`;
            case "Compare":
                let comp;
                [lhs, comp, rhs] = code.split(/ ([><=]=|>|<) /);
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== parsedRhs.type) {
                    alert('comparing different types');
                }
                return `${parsedLhs.name} ${comp} ${parsedRhs.name}`;
        }
        return '';
    }

    parseVariable(variable) {
        let variables = {...this.varList, ...this.variables};
        if (variable[0] === '\"' && variable[variable.length - 1] === '\"' || variable[0] === "\'" && variable[variable.length - 1] === "\'") {
            return {name: variable, type: 'string'};
        }
        if (!isNaN(variable)) {
            return {name: variable.trim(), type: 'int'};
        }
        for (let operator of ['*', '/', '+', '-']) {
            if (variable.indexOf(operator) > 0) {
                let lhs, rhs;
                [lhs, rhs] = variable.split(operator);
                let parsedLhs = this.parseVariable(lhs);
                let parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== parsedRhs.type) {
                    alert('invalid types');
                    return {name: variable, type: 'invalid'};
                }
                if (parsedLhs === 'string' && operator !== '+') {
                    let varName = `${parsedLhs.name}_${parsedRhs.name}`;
                    if (!(varName in variables)) {
                        return {name: varName, type: 'var'};
                    }
                    return {name: varName, type: variables[varName]};
                }
                return {name: `${parsedLhs.name} ${operator} ${parsedRhs.name}`, type: parsedLhs.type};
            }
        }
        let varName = variable.toLowerCase().trim().replace(/\s/g, '_');
        if (varName === 'message_sender' || varName === 'msg_sender' || varName === 'sender') {
            return {name: 'msg.sender', type: 'address'};
        }
        if (varName === 'message_value' || varName === 'msg_value' || varName === 'value') {
            return {name: 'msg.value', type: 'int'};
        }
        if (!(varName in variables)) {
            return {name: varName, type: 'var'};
        }
        return {name: varName, type: variables[varName]};
    }

    // TODO: allow traversal for diamond nodes
    generateCodeForCycle(start, isTrue) {
        let outPort = isTrue ? start.outPortTrue : start.outPortFalse;
        let node = this.getNextNode(outPort);
        let code = '';
        while (node) {
            if (node === start) {
                return code;
            }
            code += this.parseNode(node.name) + '\n';
            node = this.getNextNodeForDefaultNode(node);
        }
        return null;
    }
}