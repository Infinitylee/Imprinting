/**
 * 界面布局操作
 */
import TYPE from '../type/Type';

/**
 * 设置窗口宽度
 */
export function setLayoutWidth (width) {
  return (dispatch, getState) => {
    dispatch({ type: TYPE.LAYOUT.SET_WIDTH, data: width });
  }
};

/**
 * 设置窗口高度
 */
export function setLayoutHeight (height) {
  return (dispatch, getState) => {
    dispatch({ type: TYPE.LAYOUT.SET_HEIGHT, data: height });
  }
};
