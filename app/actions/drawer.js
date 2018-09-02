// @flow
import type { GetState, Dispatch } from '../reducers/types';

export const TOGGLE_DRAWER = 'TOGGLE_DRAWER';
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

export function increment() {
  return {
    type: TOGGLE_DRAWER
  };
}

export function decrement() {
  return {
    type: DECREMENT_COUNTER
  };
}

export function incrementIfOdd() {
    return (dispatch: Dispatch, getState: GetState) => {
      const { counter } = getState();
  
      if (counter % 2 === 0) {
        return;
      }
  
      dispatch(increment());
    };
  }
  
  export function incrementAsync(delay: number = 1000) {
    return (dispatch: Dispatch) => {
      setTimeout(() => {
        dispatch(increment());
      }, delay);
    };
  }
