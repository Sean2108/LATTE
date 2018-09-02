// @flow
import { TOGGLE_DRAWER } from '../actions/drawer';
import type { Action } from './types';

export default function counter(state: any = {
    drawerOpen: false
}, action: Action) {
  switch (action.type) {
    case TOGGLE_DRAWER:
      return {drawerOpen: action.payload};
    default:
      return state;
  }
}
