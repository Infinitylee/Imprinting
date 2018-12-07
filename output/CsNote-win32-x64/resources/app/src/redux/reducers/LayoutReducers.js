import defaultState from '../State';
import TYPE from '../type/Type';

/**
 * 页面布局数据处理
 * @param {*} state
 * @param {*} action
 */
let layout = (state = defaultState.layout, action) => {
  switch (action.type) {
    case TYPE.LAYOUT.SET_HEIGHT:
      return {
        height: action.data,
        //modal: state.modal,
      };
    default:
      return state;
  }
}

export default layout;
