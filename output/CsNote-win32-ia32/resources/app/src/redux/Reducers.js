/**
 * 数据操作
 */

import { combineReducers } from 'redux';
import user from './reducers/UserReducers';
import layout from './reducers/LayoutReducers';
import csnote from './reducers/CsnoteReducers';

/**
 * 导出所有reducer
 */
export default combineReducers({
  user,
  layout,
  csnote,
});