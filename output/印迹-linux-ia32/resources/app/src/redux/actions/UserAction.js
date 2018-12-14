/**
 * 用户操作
 */
import Config from '../../web/js/Config';
import TYPE from '../type/Type';

/**
 * 设置用户数据
 */
export function setUser (userNumber, token, loginTime) {
  return (dispatch, getState) => {
    fetch(Config.URL + '/dbsys/dict/find?tableName=sys_user&selectCol=username&selectColVals=' + userNumber, {
      // mode: "cors", // 设置跨域
      // credentials: 'same-origin', // 设置跨域携带cookie
      headers: {
        'token': token,
      },
      method: 'get',
    })
    .then((response) => {
      return response.json().then((result) => {
        let user = result[0];
        dispatch({
          type: TYPE.USER.SET_USER,
          data: {
            userId: user.id, // 用户id
            userNumber: userNumber, // 用户名
            userNickname: user.nick_name, // 用户名称
            userPassword: user.password, // 密码
            token: token, // token
            loginTime: loginTime, // 登录时间
          },
        });
      });
    })
    .catch(error => { console.log('error:', error) });
  }
};

/**
 * 清除用户数据
 */
export function clearUser () {
  return (dispatch, getState) => {
    dispatch({
      type: TYPE.USER.CLEAR_USER,
      data: { userId: undefined, userNumber: undefined, userNickname: undefined, userPassword: undefined, token: undefined, loginTime: undefined },
    });
  }
};
