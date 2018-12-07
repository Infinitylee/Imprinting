import React, { Component } from 'react';
import logo from '../../web/img/cansemitech.png';
import Ipc from '../../web/js/Ipc';
import { connect } from 'react-redux';
import { Layout, Row, Col, Icon } from 'antd';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const { Header } = Layout;

// const content = (
//   <div style={{background: '#b5b5b5'}}>
//     <p>Content</p>
//     <p>Content</p>
//   </div>
// );

class LayoutHeader extends Component {

  static defaultProps = { };
  
  constructor(props) {
    super(props);
    this.state = {
      hide: false, // 隐藏按钮背景
      max: false, // 最大化按钮背景
      close: false, // 关闭按钮背景
      isMax: false, // 窗口是否最大化
    };
  };

  componentDidMount() { };

  /**
   * 窗口按钮点击事件处理
   */
  onIconClick(action) {
    if ('hide' === action)
      ipcRenderer.send(Ipc.WINDOWS, Ipc.WINDOWS_HIDE);
    else if ('max' === action && false === this.state.isMax)
      this.setState({isMax: true}, () => {ipcRenderer.send(Ipc.WINDOWS, Ipc.WINDOWS_MAX);});
    else if ('max' === action && true === this.state.isMax)
      this.setState({isMax: false}, () => {ipcRenderer.send(Ipc.WINDOWS, Ipc.WINDOWS_UNMAX);});  
    else if ('close' === action)
      ipcRenderer.send(Ipc.WINDOWS, Ipc.WINDOWS_CLOSE);
  }

  /**
   * 窗口按钮背景
   */
  onMouseEnter(action) {
    if ('hide' === action)
      this.setState({hide: true, max: false, close: false});
    else if ('max' === action)
      this.setState({hide: false, max: true, close: false});
    else if ('close' === action)
      this.setState({hide: false, max: false, close: true});
  }

  /**
   * 重置窗口背景
   */
  onMouseLeave() {
    this.setState({hide: false, max: false, close: false});
  }

  render() {
    const hideStyle = this.state.hide ? '#2a3b52' : '#001529';
    const maxStyle = this.state.max ? '#2a3b52' : '#001529';
    const closeStyle = this.state.close ? '#d32f2f' : '#001529';
    return (
      <Header style={{ paddingLeft: '0px', paddingRight: '0px', position: 'fixed', zIndex: 2, width: '100%', height: '32px', WebkitAppRegion: 'drag' }} >
        <div style={{ width: '80px', height: '32px', float: 'left' }} >
          <img src={logo} style={{height: '12px', marginTop: '-36px', marginLeft: '8px'}} alt="logo"/>
        </div>
        <Row type="flex" justify="space-between" align="middle" style={{ height: '32px' }}>
          <Col style={{ width: '208px', height: '32px', lineHeight: '32px', WebkitAppRegion: 'no-drag'}}>
            {/* <Popover placement="bottomLeft" content={content} trigger="click">
              <a style={{color: '#b5b5b5'}}><div style={{width: '56px', textAlign: 'center'}}>BL</div></a>
            </Popover> */}
          </Col>
          <Col style={{ width: '135px', height: '32px', lineHeight: '32px', WebkitAppRegion: 'no-drag'}}>
            <Row type="flex" justify="space-around" align="middle">
              <Icon type='minus' style={{padding: '10px 16px', fontSize: '12px', color: '#fff', background: hideStyle }} onClick={() => this.onIconClick('hide')} onMouseEnter={() => this.onMouseEnter('hide')} onMouseLeave={() => this.onMouseLeave()} />
              <Icon type='border' style={{padding: '10px 16px', fontSize: '12px', color: '#fff', background: maxStyle }} onClick={() => this.onIconClick('max')} onMouseEnter={() => this.onMouseEnter('max')} onMouseLeave={() => this.onMouseLeave()} />
              <Icon type='close' style={{padding: '10px 16px', fontSize: '12px', color: '#fff', background: closeStyle }} onClick={() => this.onIconClick('close')} onMouseEnter={() => this.onMouseEnter('close')} onMouseLeave={() => this.onMouseLeave()} />
            </Row>
          </Col>
        </Row>
      </Header>
    );
  }
}

// mapStateToProps:将state映射到组件的props中
const mapStateToProps = (state) => {
  return { }
}

// mapDispatchToProps:将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch, ownProps) => {
  return { }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutHeader);
