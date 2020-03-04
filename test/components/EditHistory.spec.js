import EditHistory from '../../app/components/build/build_utils/EditHistory';

function setup() {
  const callback = jest.fn();
  const editHistory = new EditHistory(1, callback);
  return { editHistory, callback };
}

describe('EditHistory class', () => {
  it('should construct object correctly', () => {
    const { editHistory } = setup();
    expect(editHistory.head.data).toEqual(1);
    expect(editHistory.current.data).toEqual(1);
    expect(editHistory.head.next).toBe(null);
    expect(editHistory.current.next).toBe(null);
    expect(editHistory.head.prev).toBe(null);
    expect(editHistory.current.prev).toBe(null);
    expect(editHistory.length).toEqual(1);
  });

  it('should have 2 nodes when addNode is called', () => {
    const { editHistory } = setup();
    editHistory.addNode(2);
    expect(editHistory.head.data).toEqual(1);
    expect(editHistory.current.data).toEqual(2);
    expect(editHistory.head.next).toBe(editHistory.current);
    expect(editHistory.current.next).toBe(null);
    expect(editHistory.head.prev).toBe(null);
    expect(editHistory.current.prev).toBe(editHistory.head);
    expect(editHistory.length).toEqual(2);
  });

  it('should be able to undo', () => {
    const { editHistory, callback } = setup();
    editHistory.addNode(2);
    const next = editHistory.current;
    expect(editHistory.canUndo()).toBeTruthy();
    editHistory.undo();
    expect(callback).toHaveBeenCalledWith(1);
    expect(editHistory.canUndo()).toBeFalsy();
    expect(editHistory.head.data).toEqual(1);
    expect(editHistory.current.data).toEqual(1);
    expect(editHistory.head.next).toBe(next);
    expect(editHistory.current.next).toBe(next);
    expect(editHistory.head.prev).toBe(null);
    expect(editHistory.current.prev).toBe(null);
    expect(editHistory.length).toEqual(1);
  });

  it('should be at the same node after undoing and redoing', () => {
    const { editHistory, callback } = setup();
    editHistory.addNode(2);
    editHistory.undo();
    expect(callback).toHaveBeenCalledWith(1);
    expect(editHistory.canUndo()).toBeFalsy();
    expect(editHistory.canRedo()).toBeTruthy();
    editHistory.redo();
    expect(callback).toHaveBeenCalledWith(2);
    expect(editHistory.canUndo()).toBeTruthy();
    expect(editHistory.canRedo()).toBeFalsy();
    expect(editHistory.head.data).toEqual(1);
    expect(editHistory.current.data).toEqual(2);
    expect(editHistory.head.next).toBe(editHistory.current);
    expect(editHistory.current.next).toBe(null);
    expect(editHistory.head.prev).toBe(null);
    expect(editHistory.current.prev).toBe(editHistory.head);
    expect(editHistory.length).toEqual(2);
  });

  it('should change head after adding 10 items', () => {
    const { editHistory } = setup();
    for (let i = 2; i < 12; i += 1) {
      editHistory.addNode(i);
    }
    expect(editHistory.head.data).toEqual(2);
    expect(editHistory.length).toEqual(10);
    expect(editHistory.current.data).toEqual(11);
  });
});
