import { deepClone } from "./TypeCheckFormattingUtils";

const MAX_NODES = 10;

class EditNode {
  constructor(data, prev) {
    this.data = deepClone(data);
    this.prev = prev;
    this.next = null;
  }
}

export default class EditHistory {
  constructor(firstNodeData, updateState) {
    this.head = new EditNode(firstNodeData, null);
    this.current = this.head;
    this.length = 1;
    this.updateState = updateState;
  }

  addNode(data) {
    const next = new EditNode(data, this.current);
    this.current.next = next;
    this.current = next;
    if (this.length >= MAX_NODES) {
      this.head = this.head.next;
      this.head.prev = null;
    } else {
      this.length += 1;
    }
  }

  canUndo() {
    return this.current.prev;
  }

  canRedo() {
    return this.current.next;
  }

  undo() {
    this.current = this.current.prev;
    this.length -= 1;
    this.updateState(this.current.data);
  }

  redo() {
    this.current = this.current.next;
    this.length += 1;
    this.updateState(this.current.data);
  }
}
