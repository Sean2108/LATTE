// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import drawer from './drawer';

const rootReducer = combineReducers({
  counter,
  router,
  drawer
});

export default rootReducer;
