/**
 * 全局数据操作
 */
import TYPE from '../type/Type';

/**
 * 设置选择的笔记本
 */
export function setSelectSiderMenu (selectSiderMenu) {
  return (dispatch, getState) => {
    dispatch({ type: TYPE.CSNOTE.SET_SELECT_SIDERMENU, data: selectSiderMenu });
  }
};

/**
 * 设置选择的文章
 */
export function setSelectOutline (outline) {
  return (dispatch, getState) => {
    dispatch({ type: TYPE.CSNOTE.SET_SELECT_OUTLINE, data: outline });
  }
};

/**
 * 设置选择的文章标题
 */
export function setSelectOutlineTitle (outlineTitle) {
  return (dispatch, getState) => {
    dispatch({ type: TYPE.CSNOTE.SET_SELECT_OUTLINE_TITLE, data: outlineTitle });
  }
};

/**
 * 设置文章列表内容
 */
export function setOutlineData (outlineData) {
  return (dispatch, getState) => {
    dispatch({ type: TYPE.CSNOTE.SET_OUTLINE_DATA, data: outlineData });
  }
};