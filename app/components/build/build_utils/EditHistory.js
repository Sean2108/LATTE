// @flow

import { deepClone, objectEquals } from './TypeCheckFormattingUtils';

const MAX_NODES = 10;

class EditNode {
  data: {};

  prev: ?EditNode;

  next: ?EditNode;

  constructor(data: {}, prev: ?EditNode) {
    this.data = deepClone(data);
    this.prev = prev;
    this.next = null;
  }
}

export default class EditHistory {
  head: EditNode;

  current: EditNode;

  length: number;

  updateState: ({}) => void;

  constructor(firstNodeData: {}, updateState: ({}) => void) {
    this.head = new EditNode(firstNodeData, null);
    this.current = this.head;
    this.length = 1;
    this.updateState = updateState;
  }

  addNode = (data: {}): void => {
    if (objectEquals(data, this.current.data)) {
      return;
    }
    const next: EditNode = new EditNode(data, this.current);
    this.current.next = next;
    this.current = next;
    if (this.head.next && this.length >= MAX_NODES) {
      this.head = this.head.next;
      this.head.prev = null;
    } else {
      this.length += 1;
    }
  };

  canUndo = (): boolean => !!this.current.prev;

  canRedo = (): boolean => !!this.current.next;

  undo = (): void => {
    if (this.current.prev) {
      this.current = this.current.prev;
      this.length -= 1;
      this.updateState(this.current.data);
    }
  };

  redo = (): void => {
    if (this.current.next) {
      this.current = this.current.next;
      this.length += 1;
      this.updateState(this.current.data);
    }
  };
}
