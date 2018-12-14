import React, { Component } from 'react';
import eventEmitter from '../../../util/Events';
import Event from '../../../web/js/Event';
import Ipc from '../../../web/js/Ipc';
import LayoutHeader from '../LayoutHeader';
import ReactQuill, { Quill } from 'react-quill';
import Uuid from '../../../util/Uuid';
import { connect } from 'react-redux';
import { ImageDrop } from 'quill-image-drop-module';
import { Row, Col, Button, Modal, Skeleton, Spin, message } from 'antd';
//const confirm = Modal.confirm;
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

Quill.register('modules/imageDrop', ImageDrop);

class WorkPart extends Component {

  static defaultProps = {
    modules: {
      toolbar: [
        [{ header: 1 }, { header: 2 }],
        [{ 'color': [] }, { 'background': [] }, 'bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      history: { delay: 1000, maxStack: 500, userOnly: false },
      imageDrop: true
    },
    formats: [
      'header',
      'color', 'background', 'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet',
      'link', 'image',
    ],
  };
  
  constructor(props) {
    super(props);
    this.quillRef = null; // Quill instance
    this.reactQuillRef = null; // ReactQuill component
    this.state = {
      loading: false, // 加载中
      index: 0, // 光标索引
      selectLength: 0, // 选择长度
      currentArticalData: '', // 编辑器内文章内容
    };
  };

  componentWillMount() {
    // 注册事件
    eventEmitter.addListener(Event.WORK_PART.REFRESH, this.onUpdateArticalData);
    // 注册文章内容获取事件
    ipcRenderer.on(Ipc.FILE, (event, arg) => {
      if (Ipc.FILE_READ === arg.action && Ipc.FILE_READ_WORKPART === arg.callback) {
        arg.data.data = decodeURIComponent(arg.data.data);
        // 每打开新文件都清空编辑历史纪录
        this.quillRef.history.clear();
        // 设置数据
        this.setState({loading: false, currentArticalData: arg.data.data});
      }
    });
    // 注册右键处理事件
    ipcRenderer.on(Ipc.MENU_WORKPART, (event, arg) => {
      if (Ipc.MENU_WORKPART_PASTE === arg.action) { // 粘贴文本
        this.onGetPasteWord(arg.data);
      } else if (Ipc.MENU_WORKPART_PASTE_WITH_FORMATE === arg.action) { // 粘贴文本(带格式)
        this.onGetPasteWordWithFormat(arg.data);
      } else if (Ipc.MENU_WORKPART_PASTE_WITH_IMAGE === arg.action) { // 粘贴图片
        this.onGetPasteImage(arg.data);
      }
    });
    // 注册图片处理事件
    ipcRenderer.on(Ipc.IMAGE_END, (event, arg) => {
      // 获取页面内容
      let currentArticalData = this.state.currentArticalData;
      // 替换
      currentArticalData = currentArticalData.replace(arg.source, arg.target);
      // 更新数据
      this.setState({currentArticalData: currentArticalData});
    });
  }

  componentDidMount() {
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    this.quillRef = this.reactQuillRef.getEditor();
  }

  componentWillUnmount() {
    // 移除事件监听
    eventEmitter.removeListener(Event.WORK_PART.REFRESH, this.onUpdateArticalData);
  }

  /**
   * 广播事件-更新文章内容
   */
  onUpdateArticalData = (key) => {
    if (undefined !== key) {
      // 查看历史纪录确认是否有对文章经行修改
      //this.quillRef.history
      // if (this.state.defaultArticalData !== this.state.currentArticalData)
      //   return this.showConfirm();
      // 显示加载框
      this.setState({loading: true}, () => {
        setTimeout(() => {
          // 读取文章
          ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_READ, callback: Ipc.FILE_READ_WORKPART, dir: '/data/artical/' + key + '.cs'});
        }, 100);
      });
    } else {
      this.setState({currentArticalData: ''});
    }
  }

  /**
   * 粘贴文本
   */
  onGetPasteWord = (data) => {
    // 插入文本
    this.quillRef.insertText(this.state.index, data);
  }

  /**
   * 粘贴图文
   */
  onGetPasteWordWithFormat = (data) => {
    // 处理图片
    data = this.imageHandle(String(data));
    // 粘贴图文
    this.quillRef.clipboard.dangerouslyPasteHTML(this.state.index, data);
  }

  /**
   * 粘贴图片
   */
  onGetPasteImage = (data) => {
    if (false !== data) {
      // 插入图片
      this.quillRef.insertEmbed(this.state.index, 'image', data);
    } else {
      Modal.error({ title: '提示', content: '剪贴板未包含单个图片信息!', centered: true, closable: false, okText: '好的', width: 400, });
    }
  }

  /**
   * 保存按钮点击事件处理
   */
  onSaveClickHandle = () => {
    ipcRenderer.send(Ipc.CLIPBOARD, '');
    if (undefined !== this.props.selectOutline) {
      // 写入文件
      ipcRenderer.send(Ipc.FILE, {action: Ipc.FILE_WRITE, dir: '/data/artical/' + this.props.selectOutline + '.cs', data: '{"data":"' + encodeURIComponent(this.state.currentArticalData) + '"}'});
      // 发送记录预览广播
      eventEmitter.emit(Event.OUT_LINE.RECORD, this.quillRef.getText(0, 120).replace(/[\n\r]/g, ' '));
    } else {
      Modal.warning({ title: '提示', content: '请选择文章!', centered: true, closable: false, okText: '好的', width: 400, });
    }  
  }

  /**
   * 文本框输入事件
   * @param {*} content 真实的DOM节点
   * @param {*} delta 记录修改对象
   * @param {*} source 值为user或api
   * @param {*} editor 文本框对象(可以调用函数获取content, delta值)
   */
  onQuillChange(content, delta, source, editor) {
    // 检查是否含有//:0安全限制
    if (-1 === editor.getHTML().indexOf('//:0')) {
      // 正文处理
      this.setState({currentArticalData: editor.getHTML()});
      // 图片处理
      if ('user' === source)
        this.imageHandle(String(editor.getHTML()));
    } else {
      return Modal.error({ title: '提示', content: '剪贴板含有图文信息,请右键选择粘贴图文!', centered: true, closable: false, okText: '好的', width: 400, });
    }
  }

  /**
   * 图片处理
   * @param {*} data 数据
   */
  imageHandle(data) {
    // part 1 --- 预处理
    // 正则替换换行符,以便正则查找图片
    data = data.replace(/[\n\r]/g, ' ');
    // 如果是word的数据,则替换所有的判断条件
    data = data.replace('<![if !vml]>', '');
    data = data.replace('<![endif]>', '');
    // part 2 --- 图片处理
    // 正则查找剪贴板中是否含有图像文件
    let imgArray = data.match(/<img.*?(?:>|\/>)/gi);
    // 定义记录列表
    let tempImageSrcDataList = [];
    // 如果找到图像标签
    if (null !== imgArray) {
      // 遍历图像标签
      imgArray.map((item) => {
        // 提取src地址
        let imgSrc = item.match(/src=['"]?([^'"]*)['"]?/gi);
        // 如果找不到src,则返回
        if (0 === imgSrc.length)
          return false;
        // 去掉src=
        imgSrc = imgSrc[0].replace('src=', '');
        // 去掉头部和尾部的"
        imgSrc = imgSrc.substring(1, imgSrc.length - 1);
        // 如果是base64编码图片,则无需处理返回
        if (-1 !== String(imgSrc).indexOf('data:image/jpeg;base64,'))
          return false;
        // 如果是uuid标记图片,则无需处理返回
        if (null !== String(imgSrc).match(/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/))
          return false;
        // 定义id
        let id = imgSrc;
        // 如果是本地file文件,则替换避免v8引擎安全限制
        if (-1 !== imgSrc.indexOf('file:///')) {
          id = Uuid();
          data = data.replace(imgSrc, id);
        } else {
          // 提取并转义src
          imgSrc = this.escapeUrl(imgSrc);
        }
        // 添加数据
        return tempImageSrcDataList.push({id: id, src: imgSrc});
      });
    }
    // part 3 --- 请求后台下载图片并转换成base64
    tempImageSrcDataList.map((item) => {
      let fileName = Uuid();
      // 发送下载清透
      return ipcRenderer.send(Ipc.IMAGE, {
        id: item.id,
        url: item.src,
        fileName: fileName,
      });
    });
    // 返回修改后的数据
    return data;
  }

  /**
   * 转义url
   */
  escapeUrl = (url) => {
    let arrEntities = {'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    return url.replace(/&(lt|gt|nbsp|amp|quot);/ig, (all, t) => { return arrEntities[t]; });
  }

  /**
   * 文本框选择事件
   * @param {*} range 选择
   * @param {*} source 值为user或api
   * @param {*} editor 文本框对象(可以调用函数获取content, delta值)
   */
  onQuillSelectionChange(range, source, editor) {
    if (null !== range)
      this.setState({index: range.index, selectLength: range.length})
  }

  /**
   * 编辑器右键点击事件
   */
  onRightClick() {
    if (undefined !== this.props.selectOutline)
      ipcRenderer.send(Ipc.MENU, {action: Ipc.MENU_WORKPART, id: Uuid()});
    else
      message.info("请选择文章!");
  }

  render() {
    const width = this.props.width - 200 - 270;
    const height = this.props.height - 32 - 58;
    const skeletonDisplay = undefined === this.props.selectOutline ? 'block' : 'none';
    return (
      <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#f1f1f1', WebkitAppRegion: 'no-drag' }}>
        {/* 标题区域 */}
        <Row type="flex" justify="space-between" align="middle" style={{height: '48px', fontSize: '24px', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', WebkitAppRegion: 'drag'}}>
          <Col span={24} style={{padding: '8px'}}>{undefined !== this.props.selectOutlineTitle ? this.props.selectOutlineTitle : '标题'}</Col>
        </Row>
        {/* quill编辑区域 */}
        <div onContextMenu={() => this.onRightClick()}>
          <Spin spinning={this.state.loading} tip="载入中...">
            <ReactQuill
              ref={(e) => { this.reactQuillRef = e }}
              style={{ height: height }}
              theme="snow"
              modules={this.props.modules}
              formats={this.props.formats}
              value={undefined !== this.props.selectOutline ? this.state.currentArticalData : ''}
              placeholder="..."
              onChange={(content, delta, source, editor) => this.onQuillChange(content, delta, source, editor)}
              onChangeSelection={(range, source, editor) => this.onQuillSelectionChange(range, source, editor)}
            />
          </Spin>
        </div>
        {/* 保存区域 */}
        <div style={{position: 'fixed', bottom: '24px', right: '24px'}}>
          <Button type="primary" onClick={() => this.onSaveClickHandle()}>保存</Button>
        </div>
        {/* 鱼骨架区域 */}
        <div style={{position: 'fixed', width: width, height: height + 42, top: '48px', padding: '42px 16px', display: skeletonDisplay}}>
          <Skeleton style={{width: width - 16 * 2}}/>
        </div>
        {/* 窗口行为区域 */}
        <div style={{position: 'fixed', top: '0px', right: '0px'}}>
          <LayoutHeader style={{WebkitAppRegion: 'no-drag'}}/>
        </div>
      </div>
    )
  }
}

// mapStateToProps:将state映射到组件的props中
const mapStateToProps = (state) => {
  return {
    height: state.layout.height,
    width: state.layout.width,
    selectSiderMenu: state.csnote.selectSiderMenu,
    selectOutline: state.csnote.selectOutline,
    selectOutlineTitle: state.csnote.selectOutlineTitle,
  }
}

// mapDispatchToProps:将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch, ownProps) => {
  return { }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkPart);
