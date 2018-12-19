import React, { Component } from 'react';
import Ipc from '../../web/js/Ipc';
import { connect } from 'react-redux';
import { Row, Col, Icon } from 'antd';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

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
    const hideStyle = this.state.hide ? '#cacaca' : 'rgb(0, 0, 0, 0)';
    const maxStyle = this.state.max ? '#cacaca' : 'rgb(0, 0, 0, 0)';
    const closeStyle = this.state.close ? '#ff4141' : 'rgb(0, 0, 0, 0)';
    return (
      <Col style={{ width: '135px', height: '32px', lineHeight: '32px', WebkitAppRegion: 'no-drag'}}>
        <Row type="flex" justify="space-around" align="middle">
          <Icon type='minus' style={{padding: '10px 16px', fontSize: '12px', background: hideStyle }} onClick={() => this.onIconClick('hide')} onMouseEnter={() => this.onMouseEnter('hide')} onMouseLeave={() => this.onMouseLeave()} />
          <Icon type='border' style={{padding: '10px 16px', fontSize: '12px', background: maxStyle }} onClick={() => this.onIconClick('max')} onMouseEnter={() => this.onMouseEnter('max')} onMouseLeave={() => this.onMouseLeave()} />
          <Icon type='close' style={{padding: '10px 16px', fontSize: '12px', background: closeStyle }} onClick={() => this.onIconClick('close')} onMouseEnter={() => this.onMouseEnter('close')} onMouseLeave={() => this.onMouseLeave()} />
        </Row>
      </Col>
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
