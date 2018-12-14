import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import './web/css/Index.css';
import Router from './Router';
import * as serviceWorker from './serviceWorker';
import store from './redux/Index'; // 引入创建好的store实例
import { Provider } from 'react-redux'; // Provider是react-redux两个核心工具之一,作用:将store传递到每个项目中的组件中

ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  //<Test />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
