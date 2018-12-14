import React, { Component } from 'react';
import eventEmitter from '../../../util/Events';
import Event from '../../../web/js/Event';
import Ipc from '../../../web/js/Ipc';
import Uuid from '../../../util/Uuid';
import { connect } from 'react-redux';
import { Row, Col, Button, List, Modal, Input } from 'antd';
import { setSelectOutline, setSelectOutlineTitle, setOutlineData } from '../../../redux/actions/CsnoteAction';
const confirm = Modal.confirm;
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class Outline extends Component {

  static defaultProps = { };
  
  constructor(props) {
    super(props);
    this.state = {
      canAddArtical: true, // 是否可以创建文章(解决回车触发新建文章的焦点问题)
      modalVisible: false, // 模态框显示状态
      modalInputText: '', // 模态框输入值
      modalAction: undefined, // 模态框行为(添加/重命名)
      currentHandleKey: '', // 正在处理的键值
    };
  };

  componentWillMount() {
    // 注册事件
    eventEmitter.addListener(Event.OUT_LINE.RECORD, this.onUpdateOutlineData);
    // 注册文章列表获取事件
    ipcRenderer.on(Ipc.FILE, (event, arg) => {
      if (Ipc.FILE_READ === arg.action && Ipc.FILE_READ_OUTLINE === arg.callback) {
        // 设置数据
        this.props.setOutlineData(arg.data);
      }
    });
    // 注册右键处理事件
    ipcRenderer.on(Ipc.MENU_OUTLINE, (event, arg) => {
      if (Ipc.MENU_OUTLINE_EDIT_ARTICAL === arg.action) { // 编辑文章
        // 打开文章
        this.onArticalClick(arg.key, arg.title);
      } else if (Ipc.MENU_OUTLINE_RENAME_ARTICAL === arg.action) { // 重命名文章标题
        // 设置行为,数据,打开模态框
        this.setState({canAddArtical: false, modalVisible: true, modalInputText: arg.title, modalAction: 'rename', currentHandleKey: arg.key});
      } else if (Ipc.MENU_OUTLINE_DELETE_ARTICAL === arg.action) { // 删除文章
        // 设置数据
        this.setState({canAddArtical: false, modalVisible: false, modalInputText: '', modalAction: undefined, currentHandleKey: arg.key}, () => {
          // 打开Modal框
          this.modalDeleteHandle();
        });
      }
    });
    // 读取文章
    ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_READ, callback: Ipc.FILE_READ_OUTLINE, dir: '/data/outLine.cs'});
  }

  componentWillUnmount() {
    // 移除事件监听
    eventEmitter.removeListener(Event.OUT_LINE.RECORD, this.onUpdateOutlineData);
  }

  /**
   * 广播事件-更新文章内容
   */
  onUpdateOutlineData = (data) => {
    // 获取文章列表(避免污染)
    let tempOutlineData = JSON.parse(JSON.stringify(this.props.outlineData));
    // 找到当前编辑的outline
    tempOutlineData.map((item) => {
      if (0 !== item.artical.length) {
        item.artical.map((childItem) => {
          if (childItem.key === this.props.selectOutline) {
            return childItem.preview = data;
          }
          return false;
        })
      }
      return false;
    })
    // 同步记录到本地
    ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_WRITE, dir: '/data/outLine.cs', data: JSON.stringify(tempOutlineData)});
    // 更新新数据,关闭对话框,清空临时数据
    this.props.setOutlineData(tempOutlineData);
  }

  /**
   * 新建文章事件处理
   */
  onCreateNewArticalHandle = () => {
    if (undefined !== this.props.selectSiderMenu && !this.state.modalVisible) {
      // 初始化数据,显示模态框
      this.setState({canAddArtical: false, modalVisible: true, modalInputText: '', modalAction: 'add'});
    } else {
      // 节点未选择警告
      Modal.warning({ title: '提示', content: '请选择文章存放的库!', centered: true, closable: false, okText: '好的', width: 400, });
    }
  }

  /**
   * Modal框确认事件
   */
  modalConfirmHandle = (event) => {
    // 新建文章索引
    let articalKey = Uuid();
    let articalTitle = this.state.modalInputText;
    // 获取文章索引(避免污染)
    let tempOutlineData = JSON.parse(JSON.stringify(this.props.outlineData));
    if ('add' === this.state.modalAction) { // 新建文章
      // 设置标记
      let tempTag = false;
      // 遍历获取当前所选择的目录
      for (let i = 0; i < tempOutlineData.length; i++) {
        if (this.props.selectSiderMenu === tempOutlineData[i].key) {
          // 更改标记
          tempTag = true;
          // 添加对象
          tempOutlineData[i]['artical'].push({key: articalKey, title: articalTitle});
          break;
        }
      }
      // 标记处理
      if (!tempTag) {
        // 新建对象
        let newIndex = {key: this.props.selectSiderMenu, artical: [{key: articalKey, title: articalTitle}]};
        // 添加对象
        tempOutlineData.push(newIndex);
      }
    } else { // 重命名文章
      // 遍历获取当前所选择的目录
      for (let i = 0; i < tempOutlineData.length; i++) {
        if (this.props.selectSiderMenu === tempOutlineData[i].key) {
          // 添加对象
          tempOutlineData[i]['artical'].map((item) => {
            return item.key === this.state.currentHandleKey ? item.title = articalTitle : '';
          });
          break;
        }
      }
    }
    // 更新新数据,关闭对话框,清空临时数据
    this.props.setSelectOutlineTitle(articalTitle);
    this.props.setOutlineData(tempOutlineData);
    this.setState({canAddArtical: true, modalVisible: false, modalInputText: ''}, () => {
      // 更新数据后同步记录到本地
      ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_WRITE, dir: '/data/outLine.cs', data: JSON.stringify(tempOutlineData)});
      // 创建新文件(同步)
      if ('add' === this.state.modalAction) {
        ipcRenderer.send(Ipc.FILE_SYNC, {action: Ipc.FILE_WRITE_SYNC, dir: '/data/artical/' + articalKey + '.cs', data: '{"data":""}'});
        this.onArticalClick(articalKey, articalTitle)
      }
    });
  }

  /**
   * Modal框取消事件
   */
  modalCancelHandle = (event) => {
    // 关闭Modal框
    this.setState({canAddArtical: true, modalVisible: false, modalInputText: ''});
  }

  /**
   * Modal框删除事件
   */
  modalDeleteHandle = () => {
    let that = this;
    // 确认框
    confirm({
      title: '文章操作',
      centered: true,
      closable: false,
      okText: '删除',
      cancelText: '取消',
      width: 400,
      content: '确认删除此文章?',
      okType: 'danger',
      onOk() {
        // 获取树(避免污染)
        let tempOutlineData = JSON.parse(JSON.stringify(that.props.outlineData));
        // 查找并删除
        for (let i = 0; i < tempOutlineData.length; i++) {
          if (that.props.selectSiderMenu === tempOutlineData[i].key) {
            // 设置标记
            let tempTag = undefined;
            // 查找对象
            tempOutlineData[i]['artical'].map((item, index) => {
              return item.key === that.state.currentHandleKey ? tempTag = index : '';
            });
            // 删除对象
            tempOutlineData[i]['artical'].splice(tempTag, 1);
            break;
          }
        }
        // 如果当前删除的文件已经打开
        if (that.state.currentHandleKey === that.props.selectOutline) {
          // 清空工作区数据
          that.props.setSelectOutline(undefined);
          that.props.setSelectOutlineTitle('标题');
        }
        // 同步记录到本地
        ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_WRITE, dir: '/data/outLine.cs', data: JSON.stringify(tempOutlineData)});
        // 删除文件
        ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_DELETE, dir: '/data/artical/' + that.state.currentHandleKey + '.cs'});
        // 更新新数据,关闭对话框,清空临时数据
        that.setState({canAddArtical: true, modalVisible: false, currentHandleKey: '' }, () => {
          that.props.setOutlineData(tempOutlineData);
        });
      },
      onCancel() { },
    });
  }

  /**
   * 文章点击事件处理
   */
  onArticalClick = (key, title) => {
    // 设置全局数据
    this.props.setSelectOutline(key);
    this.props.setSelectOutlineTitle(title);
    // 发送刷新工作区广播
    eventEmitter.emit(Event.WORK_PART.REFRESH, key);
  }

  /**
   * 文章右键事件处理
   */
  onRightClick = (key, title) => {
    ipcRenderer.send(Ipc.MENU, {action: Ipc.MENU_OUTLINE, key: key, title: title});
  }

  /**
   * 根据所选的目录找到该目录下的文章列表
   */
  getArtical = (outlineData, selectSiderMenu) => {
    // 初始化数组
    let dataList = [];
    // 遍历寻找所选择的目录
    outlineData.map((item) => {
      // 找到对应的目录
      if (item.key === selectSiderMenu) {
        // 遍历添加文章
        item.artical.map((item) => {
          // 添加文章到数组
          return dataList.push({key: item.key, title: item.title, preview: item.preview});
        });
        return true;
      } else {
        return false;
      }
    });
    // 返回数据
    return dataList;
  }

  render() {
    return (
      <div style={{ width: '100%', height: '100%', overflowY: 'auto', WebkitAppRegion: 'no-drag'}}>
        <Row type="flex" justify="space-between" align="middle" style={{height: '48px', padding: '8px', fontSize: '24px', WebkitAppRegion: 'drag'}}>
          <Col span={6}>文章</Col>
          <Col span={4} style={{textAlign: 'right'}}>
            <Button type="primary" shape="circle" icon="plus" style={{marginBottom: '6px', WebkitAppRegion: 'no-drag'}} disabled={!this.state.canAddArtical} onClick={() => this.onCreateNewArticalHandle()}/>
          </Col>
        </Row>
        <List
          style={{ paddingLeft: '8px', paddingRight: '8px' }}
          itemLayout='horizontal'
          locale={{emptyText: '暂无数据'}}
          dataSource={this.getArtical(this.props.outlineData, this.props.selectSiderMenu)}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '8px',
                background: this.props.selectOutline === item.key ? '#e8e8e8' : 'rgba(0, 0, 0, 0)',
              }}
            >
              <a
                href="#"
                style={{width: '100%', textDecoration: 'none'}}
                onClick={() => this.onArticalClick(item.key, item.title)}
                onContextMenu={() => this.onRightClick(item.key, item.title)} >
                <List.Item.Meta
                  title={<span style={{color: this.props.selectOutline === item.key ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'}}>{item.title}</span>}
                  description={
                    <span style={{display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: '3', overflow: 'hidden'}}>
                      {undefined !== item.preview && '' !== item.preview && ' ' !== item.preview ? item.preview : '暂无内容'}
                    </span>
                  }
                />
              </a>
            </List.Item>
          )}
        />
        <Modal
          title="文章操作"
          centered
          closable={false}
          okText={'确定'}
          cancelText={'取消'}
          width={400}
          visible={this.state.modalVisible}
          onOk={(event) => this.modalConfirmHandle(event)}
          onCancel={(event) => this.modalCancelHandle(event)}
        >
          <Input
            placeholder="请输入..."
            value={this.state.modalInputText}
            onChange={(event) => this.setState({modalInputText: event.target.value})}
            onPressEnter={(event) => this.modalConfirmHandle(event)}
          />
        </Modal>
      </div>
    )
  }
}

// mapStateToProps:将state映射到组件的props中
const mapStateToProps = (state) => {
  return {
    height: state.layout.height,
    selectSiderMenu: state.csnote.selectSiderMenu,
    selectOutline: state.csnote.selectOutline,
    outlineData: state.csnote.outlineData,
  }
}

// mapDispatchToProps:将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setSelectOutline (selectOutline) {
      dispatch(setSelectOutline(selectOutline));
    },
    setSelectOutlineTitle (selectOutlineTitle) {
      dispatch(setSelectOutlineTitle(selectOutlineTitle));
    },
    setOutlineData (outlineData) {
      dispatch(setOutlineData(outlineData));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Outline);
