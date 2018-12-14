import React, { Component } from 'react';
import LayoutContent from './main/app/LayoutContent';
import LayoutHeader from './main/app/LayoutHeader';
import PropTypes from 'prop-types';
import SiderMenu from './main/app/SiderMenu';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { setLayoutHeight } from './redux/actions/LayoutAction';
import './web/css/Main.css';
import './web/css/SiderMenu.css';
const { Sider } = Layout;

class App extends Component {

  static defaultProps = { };
  
  constructor(props) {
    super(props);
    this.state = { };
  };

  componentWillMount() {
    // 窗口加载时初始化高度
    this.props.setLayoutHeight(document.body.clientHeight);
    // 注册窗口变化事件
    window.onresize = () => {
      this.props.setLayoutHeight(document.body.clientHeight);
    }
  }

  render() {
    return (
      <Layout style={{height: '100%'}}>
        <LayoutHeader />
        <Layout style={{height:'100%', marginTop:'32px'}}>
          <Sider
            className="siderMenu"
            style={{ zIndex: 1, height: '100%', position: 'fixed', left: 0 }}
            breakpoint="lg"
            collapsedWidth="0"
            collapsed={false} // 是否折叠 true:折叠 false:不折叠(换用display解决隐藏时,关闭tab后再显示中午子菜单bug)
          >
            <SiderMenu />
          </Sider>
          <Layout style={{ height: '100%', marginLeft: '200px'}}>
            <LayoutContent />
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

App.contextTypes = {
  router: PropTypes.object.isRequired
};

// mapStateToProps:将state映射到组件的props中
const mapStateToProps = (state) => {
  return {
    height: state.layout.height,
  }
}

// mapDispatchToProps:将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setLayoutHeight (height) {
      dispatch(setLayoutHeight(height))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
