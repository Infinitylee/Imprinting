import defaultState from '../State';
import TYPE from '../type/Type';

/**
 * 页面布局数据处理
 * @param {*} state
 * @param {*} action
 */
let csnote = (state = defaultState.csnote, action) => {
  switch (action.type) {
    case TYPE.CSNOTE.SET_SELECT_SIDERMENU:
      return {
        selectSiderMenu: action.data,
        selectOutline: state.selectOutline,
        selectOutlineTitle: state.selectOutlineTitle,
        outlineData: state.outlineData,
      };
    case TYPE.CSNOTE.SET_SELECT_OUTLINE:
      return {
        selectSiderMenu: state.selectSiderMenu,
        selectOutline: action.data,
        selectOutlineTitle: state.selectOutlineTitle,
        outlineData: state.outlineData,
      };
    case TYPE.CSNOTE.SET_SELECT_OUTLINE_TITLE:
      return {
        selectSiderMenu: state.selectSiderMenu,
        selectOutline: state.selectOutline,
        selectOutlineTitle: action.data,
        outlineData: state.outlineData,
      };
    case TYPE.CSNOTE.SET_OUTLINE_DATA:
      return {
        selectSiderMenu: state.selectSiderMenu,
        selectOutline: state.selectOutline,
        selectOutlineTitle: state.selectOutlineTitle,
        outlineData: action.data,
      };
    default:
      return state;
  }
}

export default csnote;
