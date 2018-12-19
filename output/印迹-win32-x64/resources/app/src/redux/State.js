/**
 * 声明默认值
 */
export default {
  // 用户信息数据
  user: {
    userId: undefined, // 用户id
    userNumber: undefined, // 用户名
    userNickname: undefined, // 用户名称
    userPassword: undefined, // 密码
    token: undefined, // token
    loginTime: undefined, // 登录时间
  },
  // 界面布局数据
  layout: {
    width: undefined, // 界面宽度
    height: undefined, // 界面高度
  },
  // 笔记本全局数据
  csnote: {
    // part 1
    selectSiderMenu: undefined, // 选择的笔记本
    selectOutline: undefined, // 选择的文章
    selectOutlineTitle: undefined, // 选择的文章标题
    // part 2
    outlineData: [], // 文章列表数据
  }
};