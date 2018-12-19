import defaultState from '../State';
import TYPE from '../type/Type';

/**
 * 用户数据处理
 * @param {*} state
 * @param {*} action
 */
let user = (state = defaultState.user, action) => {
  switch (action.type) {
    case TYPE.USER.SET_USER:
      return {
        userId: action.data.userId,
        userNumber: action.data.userNumber,
        userNickname: action.data.userNickname,
        userPassword: action.data.userPassword,
        token: action.data.token,
        loginTime: action.data.loginTime,
      };
    case TYPE.USER.CLEAR_USER:
      return {
        userId: undefined,
        userNumber: undefined,
        userNickname: undefined,
        userPassword: undefined,
        token: undefined,
        loginTime: undefined,
      };
    default:
      return state;
  }
}

export default user;
