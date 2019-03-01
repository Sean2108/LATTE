import { DiamondNodeModel } from "./diagram/DiamondNodeModel";

export class BuildParser {

    constructor(onVariablesChange) {
        this.reset({}, {});
        this.onVariablesChange = onVariablesChange;
    }

    reset(varList, functionParams) {
        this.variables = {};
        this.returnVar = null;
        this.varList = varList;
        this.functionParams = functionParams;
    }

    getReturnVar() {
        return this.returnVar;
    }

    traverseNextNode(node, stopNode = null) {
        if (stopNode && node === stopNode) {
            return '';
        }
        if (node instanceof DiamondNodeModel) {
            let falseNextNode = this.getNextNode(node.outPortFalse);
            let trueNextNode = this.getNextNode(node.outPortTrue);
            let trueWhileCode = this.generateCodeForCycle(node, true);
            if (trueWhileCode) {
                return `while (${this.parseNode('Compare: ' + node.name)}) {\n${trueWhileCode}}\n${this.traverseNextNode(falseNextNode, stopNode)}`;
            }
            let falseWhileCode = this.generateCodeForCycle(node, false);
            if (falseWhileCode) {
                return `while (!(${this.parseNode('Compare: ' + node.name)})) {\n${falseWhileCode}}\n${this.traverseNextNode(trueNextNode, stopNode)}`;
            }
            let intersection = this.getIntersection(trueNextNode, falseNextNode);
            if (intersection) {
                let elseCode = this.traverseNextNode(falseNextNode, intersection);
                return `if (${this.parseNode('Compare: ' + node.name)}) {\n${this.traverseNextNode(trueNextNode, intersection)}} ${elseCode !== '' ? `else {\n${elseCode}}`: ''}\n${this.traverseNextNode(intersection, stopNode)}`;
            }
            let elseCode = this.traverseNextNode(falseNextNode, stopNode);
            return `if (${this.parseNode('Compare: ' + node.name)}) {\n${this.traverseNextNode(trueNextNode, stopNode)}} ${elseCode !== '' ? `else {\n${elseCode}}`: ''}\n`;
        }
        if (!node) {
            return '';
        }
        let curNodeCode = node.name === 'Start' ? '' : this.parseNode(node.name) + '\n';
        let nextNode = this.getNextNodeForDefaultNode(node);
        if (!nextNode) {
            return curNodeCode;
        }
        return curNodeCode + this.traverseNextNode(nextNode, stopNode);
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
        // TODO: find better way to get next node for diamond
        if (node instanceof DiamondNodeModel) {
            return this.getNextNode(node.outPortTrue);
        }
        if (node.getOutPorts().length === 0) {
            return null;
        }
        return this.getNextNode(node.getOutPorts()[0]);
    }

    parseNode(nodeCode) {
        let type, code, lhs, rhs, parsedLhs, parsedRhs, params;
        [type, code] = nodeCode.split(': ');
        switch (type) {
            case "Assignment":
                [lhs, rhs] = code.split(' = ');
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if ('mapName' in parsedLhs) {
                    let lhsType = parsedLhs.keyType === 'address payable' ? 'address' : parsedLhs.keyType;
                    this.variables[parsedLhs.mapName] = {type: 'mapping', from: lhsType, to: parsedRhs.type};
                    this.onVariablesChange({...this.variables, ...this.varList});
                }
                else if (parsedLhs.type === 'var' || !(parsedLhs.name in this.variables || parsedLhs.name in this.functionParams)) {
                    this.variables[parsedLhs.name] = parsedRhs.type;
                    this.onVariablesChange({...this.variables, ...this.varList});
                }
                else if (parsedLhs.type !== parsedRhs.type) {
                    alert(`invalid assignment at node ${nodeCode}`);
                }
                return `${parsedLhs.name} = ${parsedRhs.name};`;
            case "Emit Event":
                let eventName;
                [eventName, params] = code.split('(');
                params = params.replace(')', '').split(', ').map(param => this.parseVariable(param).name).join(', ');
                return `emit ${eventName}(${params});`;
            case "New Entity":
                let entityName;
                [lhs, rhs] = code.split(' = ');
                [entityName, params] = rhs.split('(');
                parsedLhs = this.parseVariable(lhs);
                this.variables[parsedLhs.name] = entityName;
                this.onVariablesChange({...this.variables, ...this.varList});
                params = params.replace(')', '').split(', ').map(param => this.parseVariable(param).name).join(', ');
                return `${parsedLhs.name} = ${entityName}(${params});`;
            case "Transfer":
                [lhs, rhs] = code.split(' to ');
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== 'uint') {
                    alert(`value should be an integer at node ${nodeCode}`);
                }
                if (parsedRhs.type !== 'address payable') {
                    alert(`transfer target should be a payable address at node ${nodeCode}`);
                }
                return `${parsedRhs.name}.transfer(${parsedLhs.name});`;
            case "Return":
                let returnVar = this.parseVariable(code);
                this.returnVar = returnVar.type;
                return `return ${returnVar.name};`;
            case "Compare":
                let comp;
                [lhs, comp, rhs] = code.split(/ ([!><=]=|>|<) /);
                parsedLhs = this.parseVariable(lhs);
                parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== parsedRhs.type) {
                    let mismatch = this.checkIntUintMismatch(parsedLhs, parsedRhs, 
                        `uint(${parsedLhs.name}) ${comp} ${parsedRhs.name}`,
                        `${parsedLhs.name} ${comp} uint(${parsedRhs.name})`);
                    if (mismatch) {
                        return mismatch;
                    }
                    alert(`comparing different types at node ${nodeCode}`);
                }
                if (parsedLhs.type === 'string' && parsedRhs.type === 'string' && comp === '==') {
                    return `keccak256(${parsedLhs.name}) == keccak256(${parsedRhs.name})`;
                }
                return `${parsedLhs.name} ${comp} ${parsedRhs.name}`;
        }
        return '';
    }

    parseVariable(variable) {
        let variables = {...this.varList, ...this.variables, ...this.functionParams};
        if (variable[0] === '\"' && variable[variable.length - 1] === '\"' || variable[0] === "\'" && variable[variable.length - 1] === "\'") {
            return {name: variable, type: 'string'};
        }
        if (!isNaN(variable)) {
            if (parseInt(variable) < 0) {
                return {name: variable.trim(), type: 'int'};
            }
            return {name: variable.trim(), type: 'uint'};
        }
        for (let operator of ['*', '/', '+', '-']) {
            if (variable.indexOf(operator) > 0) {
                let lhs, rhs;
                [lhs, rhs] = variable.split(operator);
                let parsedLhs = this.parseVariable(lhs);
                let parsedRhs = this.parseVariable(rhs);
                if (parsedLhs.type !== parsedRhs.type) {
                    // one of them is a uint
                    let mismatch = this.checkIntUintMismatch(parsedLhs, parsedRhs, 
                        {name: `uint(${parsedLhs.name}) ${operator} ${parsedRhs.name}`, type: 'uint'},
                        {name: `${parsedLhs.name} ${operator} uint(${parsedRhs.name})`, type: 'uint'});
                    if (mismatch) {
                        return mismatch;
                    }
                    if (parsedLhs.type === 'map' || parsedRhs.type === 'map') {
                        return {name: `${parsedLhs.name} ${operator} ${parsedRhs.name}`, type: parsedLhs.type === 'map' ? parsedRhs.type : parsedLhs.type};
                    }
                    alert(`invalid types ${parsedLhs.type} and ${parsedRhs.type}`);
                    return {name: `${parsedLhs.name} ${operator} ${parsedRhs.name}`, type: 'invalid'};
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
        if (/('s | for )/.test(variable)) {
            let map, key;
            if (variable.indexOf('\'s ') > 0) {
                [key, map] = variable.split('\'s ');
            }
            else {
                [map, key] = variable.split(' for ');
            }
            let parsedMap = this.parseVariable(map);
            let parsedKey = this.parseVariable(key);
            let type = variables[parsedMap.name] ? variables[parsedMap.name]['to'] : 'map';
            return {name: `${parsedMap.name}[${parsedKey.name}]`, mapName: parsedMap.name, keyType: parsedKey.type, type: type};
        }
        let varName = variable.toLowerCase().trim().replace(/\s/g, '_');
        const keywords = [
            {name: 'msg.sender', type: 'address payable', strings: ['message_sender', 'msg_sender', 'sender']},
            {name: 'msg.value', type: 'uint', strings: ['message_value', 'msg_value', 'value']},
            {name: 'address(this).balance', type: 'uint', strings: ['current_balance', 'contract_balance', 'balance']},
            {name: 'now', type: 'uint', strings: ['current_time', 'today', 'now']},
            {name: 'address(uint160(0))', type: 'address payable', strings: ['address', 'type_address', 'address_type', 'an_address']},
            {name: 'true', type: 'bool', strings: ['true']},
            {name: 'false', type: 'bool', strings: ['false']}
        ]
        for (const keyword of keywords) {
            if (keyword.strings.includes(varName)) {
                return {name: keyword.name, type: keyword.type};
            }
        }
        if (!(varName in variables)) {
            return {name: varName, type: 'var'};
        }
        return {name: varName, type: variables[varName]};
    }

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

    checkIntUintMismatch(parsedLhs, parsedRhs, leftIntReturn, rightIntReturn) {
        if (parsedLhs.type.slice(-3) === 'int' && parsedRhs.type.slice(-3) === 'int') {
            return parsedLhs.type === 'int' ? leftIntReturn : rightIntReturn;
        }
        return null;
    }

    getIntersection(nodeA, nodeB) {
        let lengthDifference = this.getCount(nodeA) - this.getCount(nodeB);
        if (lengthDifference > 0) {
            return this.getIntersectionNodeTraversal(lengthDifference, nodeA, nodeB);
        }
        return this.getIntersectionNodeTraversal(-lengthDifference, nodeB, nodeA);
    }

    getCount(node) {
        let count = 0;
        while (node) {
            count += 1;
            node = this.getNextNodeForDefaultNode(node);
        }
        return count;
    }

    getIntersectionNodeTraversal(diff, longerNode, shorterNode) {
        for(let i = 0; i < diff; i++) { 
            if(!longerNode) 
                return null; 
            longerNode = this.getNextNodeForDefaultNode(longerNode);
        } 
        
        while(longerNode && shorterNode) { 
            if(longerNode == shorterNode) 
                return longerNode; 
            longerNode = this.getNextNodeForDefaultNode(longerNode); 
            shorterNode = this.getNextNodeForDefaultNode(shorterNode);
        } 
        
        return null; 
    }
}