import React, { Component } from 'react';
import Ipc from '../../web/js/Ipc';
import Uuid from '../../util/Uuid';
import { connect } from 'react-redux';
import { Input, Tree, Icon, Modal } from 'antd';
import { setSelectSiderMenu } from '../../redux/actions/CsnoteAction';
import '../../web/css/SiderMenu.css';
const confirm = Modal.confirm;
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const Search = Input.Search;

class SiderMenu extends Component {

  static defaultProps = { };
  
  constructor(props) {
    super(props);
    this.state = {
      selectKey: [''], // 选择的叶子
      expandedKeys: [''], // 展开的树索引
      searchValue: '', // 搜索值
      autoExpandParent: true, // 自动张开标记
      treeData: [], // 树索引
      dataList: [], // 树数据
      modalVisible: false, // 模态框显示状态
      modalInputText: '', // 模态框输入值
      modalAction: undefined, // 模态框行为(添加/重命名)
      currentHandleKey: '', // 正在处理的键值
    };
  };

  componentWillMount() { };

  componentDidMount() {
    // 注册目录获取事件
    ipcRenderer.on(Ipc.FILE, (event, arg) => {
      if (Ipc.FILE_READ === arg.action && Ipc.FILE_READ_SIDERMENU === arg.callback) {
        // 定义临时列表
        let tempList = [];
        // 遍历树生成索引
        this.generateList(arg.data, tempList);
        // 设置数据
        this.setState({treeData: arg.data, dataList: tempList});
      }
    });
    // 注册右键处理事件
    ipcRenderer.on(Ipc.MENU_SIDERMENU, (event, arg) => {
      if (Ipc.MENU_SIDERMENU_CREATE_LEAF === arg.action) { // 新建目录
        // 设置数据,打开Modal框
        this.setState({modalVisible: true, modalInputText: '', modalAction: 'add', currentHandleKey: arg.key});
      } else if (Ipc.MENU_SIDERMENU_DELETE_LEAF === arg.action) { // 删除目录
        // 判断是否是根目录
        if ('b9205270-ddd9-4a84-b034-1eb5f797209e' === arg.key)
          return Modal.warning({ title: '提示', content: '此笔记本不允许删除!', centered: true, closable: false, okText: '好的', width: 400, });
        this.setState({modalVisible: false, modalInputText: '', modalAction: undefined, currentHandleKey: arg.key}, () => {
          // 打开Modal框
          this.modalDeleteHandle();
        });
      } else if (Ipc.MENU_SIDERMENU_RENAME_LEAF === arg.action) { // 重命名目录
        // 设置临时变量
        let tempTitle = undefined;
        // 遍历找到键值对应的中文
        this.state.dataList.map((item) => {
          return item.key === arg.key ? tempTitle = item.title : '';
        })
        // 设置数据,打开Modal框
        this.setState({modalVisible: true, modalInputText: tempTitle, modalAction: 'rename', currentHandleKey: arg.key});
      }
    });
    // 读取目录
    ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_READ, callback: Ipc.FILE_READ_SIDERMENU, dir: '/data/siderMenu.cs'});
  }

  /**
   * 遍历树获取所有子节点(生成索引)
   */
  generateList = (data, resultList) => {
    for (let i = 0; i < data.length; i++) {
      // 获取节点
      let node = data[i];
      // 根据是否是根节点,并设置是否为根标记
      if (undefined !== node.children && 0 !== node.children.length) {
        resultList.push({ title: node.title, key: node.key, isLeaf: false });
        this.generateList(node.children, resultList);
      } else {
        resultList.push({ title: node.title, key: node.key, isLeaf: true });
      } 
    }
  };

  /**
   * 搜索框输入事件处理
   */
  onSearchHandle = (event) => {
    let value = event.target.value;
    let expandedKeys = this.state.dataList.map((item) => {
      if (item.title.indexOf(value) > -1)
        return this.getParentKey(item.key, this.state.treeData);
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({ expandedKeys, searchValue: value, autoExpandParent: true });
  }

  /**
   * 获取父索引
   */
  getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      let node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key))
          parentKey = node.key;
        else if (this.getParentKey(key, node.children))
          parentKey = this.getParentKey(key, node.children);
      }
    }
    return parentKey;
  };

  /**
   * 树展开事件
   */
  onExpandHandle = (expandedKeys) => {
    this.setState({ expandedKeys, autoExpandParent: false });
  }

  /**
   * 树右键事件处理
   */
  onRightClick = (event, node) => {
    ipcRenderer.send(Ipc.MENU, {action: Ipc.MENU_SIDERMENU, key: event.node.props.eventKey});
  }

  /**
   * 树选择事件处理
   */
  onLeafSelect = (selectedKeys, event) => {
    // 更新数据
    this.setState({selectKey: selectedKeys});
    // 选择
    if (0 !== selectedKeys.length) {
      // 获取数据列表
      let tempDataList = this.state.dataList;
      // 设置标记
      let tag = undefined;
      for (let i = 0; i < tempDataList.length; i++) {
        if (tempDataList[i].key === selectedKeys[0] && tempDataList[i].isLeaf) {
          tag = tempDataList[i].key;
          break;
        }
      }
      this.props.setSelectSiderMenu(tag);
    } else {
      this.props.setSelectSiderMenu(undefined);
    }
  }

  /**
   * Modal框确认事件
   */
  modalConfirmHandle = (event) => {
    // 获取树(避免污染)
    let tempTreeData = JSON.parse(JSON.stringify(this.state.treeData));
    if ('add' === this.state.modalAction) { // 新建目录
      // 生成新的节点id
      let uuid = Uuid();
      // 获取新建节点的对象
      let newLeaf = {title: this.state.modalInputText, key: uuid};
      // 递归查找指定树节点并添加
      this.loopToAdd(tempTreeData, newLeaf);
    } else { // 重命名目录
      // 递归查找指定树节点并重命名
      this.loopToRename(tempTreeData, this.state.currentHandleKey, this.state.modalInputText);
    }
    // 定义临时列表
    let tempListData = [];
    // 遍历树生成索引
    this.generateList(tempTreeData, tempListData);
    // 更新新数据,关闭对话框,清空临时数据
    this.setState({ treeData: tempTreeData, dataList: tempListData, modalVisible: false, modalInputText: '', modalAction: undefined, currentHandleKey: '' }, () => {
      // 更新数据后同步记录到本地
      ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_WRITE, dir: '/data/siderMenu.cs', data: JSON.stringify(tempTreeData)});
    });
  }

  /**
   * Modal框取消事件
   */
  modalCancelHandle = (event) => {
    // 关闭Modal框
    this.setState({ modalVisible: false, modalInputText: '', modalAction: undefined });
  }

  /**
   * Modal框删除事件
   */
  modalDeleteHandle = () => {
    let that = this;
    // 确认框
    confirm({
      title: '节点操作',
      centered: true,
      closable: false,
      okText: '删除',
      cancelText: '取消',
      width: 400,
      content: '确认删除此节点?',
      okType: 'danger',
      onOk() {
        // 获取树(避免污染)
        let tempTreeData = JSON.parse(JSON.stringify(that.state.treeData));
        // 递归查找指定树节点并移除
        that.loopToDelete(tempTreeData);
        // 定义临时列表
        let tempListData = [];
        // 遍历树生成索引
        that.generateList(tempTreeData, tempListData);
        // 更新新数据,关闭对话框,清空临时数据
        that.setState({ treeData: tempTreeData, dataList: tempListData, currentHandleKey: '' }, () => {
          // 更新数据后同步记录到本地
          ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_WRITE, dir: '/data/siderMenu.cs', data: JSON.stringify(tempTreeData)});
        });
      },
      onCancel() { },
    });
  }

  /**
   * 递归操作判断
   */
  loopCheck(item) {
    // 设置标记
    let tag = true;
    // 判断分支下面是否有叶子
    if (undefined !== item.children && 0 !== item.children.length)
      tag = false;
    // 判断叶子下面是否含有文章
    this.props.outlineData.map((tempItem) => {
      if (tempItem.key === this.state.currentHandleKey && 0 !== tempItem.artical.length)
        return tag = false;
      return false;
    });
    // 返回检测结果
    return tag;
  }

  /**
   * 递归添加叶子
   */
  loopToAdd = (data, newLeaf) => {
    data.map((item) => {
      // 判断索引是否与当前操作的索引一致
      if (item.key === this.state.currentHandleKey) {
        // 判断是否能进行操作
        if (this.loopCheck(item)) {
          if (item.children)
            return item.children.push(newLeaf);
          else
            return item['children'] = new Array(newLeaf);
        } else {
          return Modal.warning({ title: '提示', content: '新建失败,该目录下含有内容!', centered: true, closable: false, okText: '好的', width: 400, });
        }
      } else if (item.children) {
        return this.loopToAdd(item.children, newLeaf);
      } else {
        return false;
      }
    })
  }

  /**
   * 递归重命名叶子
   */
  loopToRename = (data, key, title) => {
    data.map((item) => {
      // 判断索引是否与当前操作的索引一致
      if (item.key === key) {
        return item.title = title;
      } else if (item.children) {
        return this.loopToRename(item.children, key, title);
      } else {
        return false;
      }
    })
  }

  /**
   * 递归删除叶子
   */
  loopToDelete = (data) => {
    data.map((item, index) => {
      // 判断索引是否与当前操作的索引一致
      if (item.key === this.state.currentHandleKey) {
        // 判断是否能进行操作
        if (this.loopCheck(item))
          return data.splice(index, 1);
        else
          return Modal.warning({ title: '提示', content: '删除失败,该目录下含有内容!', centered: true, closable: false, okText: '好的', width: 400, });
      } else if (item.children) {
        return this.loopToDelete(item.children);
      } else {
        return false;
      }
    });
  }

  /**
   * 递归输出树节点
   */
  loopToRender = data => data.map((item) => {
    // 获取树索引
    let index = item.title.indexOf(this.state.searchValue);
    // 获取搜索关键字前的字符床
    let beforeString = item.title.substr(0, index);
    // 获取搜索关键字后的字符串
    let afterString = item.title.substr(index + this.state.searchValue.length);
    // 拼接标题,搜索的关键字用红字标出
    let title = index > -1 ? <span>{beforeString}<span style={{ color: '#f50' }}>{this.state.searchValue}</span>{afterString}</span> : <span>{item.title}</span>;
    // 如果树下有子节点,则进行递归遍历
    if (item.children)
      return <TreeNode key={item.key} title={title}>{this.loopToRender(item.children)}</TreeNode>;
    // 如果树下无子节点,则直接输出
    return <TreeNode
              icon={({ selected }) => <Icon type={selected ? 'read' : 'book'} />}
              key={item.key}
              title={title}
              isLeaf />;
  });

  render() {
    const height = this.props.height - 32;
    return (
      <div className="siderMenu" style={{height: height, overflow: 'auto'}}>
        <div style={{height: '32px', margin: '8px', fontSize: '24px'}} >库</div>
        <Search style={{ padding: '8px' }} placeholder="Search" onChange={(event) => this.onSearchHandle(event)} />
        <DirectoryTree
          //defaultExpandedKeys={['b9205270-ddd9-4a84-b034-1eb5f797209e']}
          selectedKeys={this.state.selectKey}
          expandedKeys={this.state.expandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          onExpand={(expandedKeys) => this.onExpandHandle(expandedKeys)}
          onRightClick={(event, node) => this.onRightClick(event, node)}
          onSelect={(selectedKeys, event) => this.onLeafSelect(selectedKeys, event)}
        >
          { this.loopToRender(this.state.treeData) }
        </DirectoryTree>
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
            onChange={(event) => this.setState({ modalInputText: event.target.value })}
            onPressEnter={(event) => this.modalConfirmHandle(event)} />
        </Modal>
      </div>
    );
  }
}

// mapStateToProps:将state映射到组件的props中
const mapStateToProps = (state) => {
  return {
    height: state.layout.height,
    selectSiderMenu: state.csnote.selectSiderMenu,
    outlineData: state.csnote.outlineData,
  }
}

// mapDispatchToProps:将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setSelectSiderMenu (selectSiderMenu) {
      dispatch(setSelectSiderMenu(selectSiderMenu));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SiderMenu);
