// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, MenuItem, clipboard, net } = require('electron');
// 声明一个全局变量
const fs = require('fs');
const path = require('path');
const url = require('url');
// 获取命令中带的参数
const argv = process.argv.slice(2);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let createWindow = () => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    minWidth: 1280,
    minHeight: 768,
    frame: false, // 指定无边框
  });

  // 对 createWindow 函数中的内容进行修改
  //判断是否是开发模式
  if (argv && argv[1] == 'dev') {
    mainWindow.loadURL("http://localhost:3000/");
  } else {
    // window 加载 build 好的 html.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
  // 加载 App 入口界面 index.html.
  //mainWindow.loadFile('index.html')

  // 引入 electron-reload 模块, 让本地文件更新后, 自动重新加载页面
  if (argv && argv[1] == 'dev') {
    require('electron-reload')(__dirname, {
      ignored: /node_modules|[\/\\]\./
    });
  }

  // 打开开发者工具
  if (argv && argv[1] == 'dev') {
    mainWindow.webContents.openDevTools();
  }

  // 当 window 被关闭,这个事件会被触发
  mainWindow.on('closed', () => {
    // 取消引用 window 对象,如果你的应用支持多窗口的话
    // 通常会把多个 window 对象存放在一个数组里面
    // 与此同时,你应该删除相应的元素
    mainWindow = null;
  });

  // 注册快捷键
  // globalShortcut.register('CommandOrControl+V', () => {
  //   console.log('CommandOrControl+V')
  // })
  // globalShortcut.register('CommandOrControl+D', () => {
  //   console.log('CommandOrControl+D')
  // })

  // 获取用户文件夹路径
  let configDir = app.getPath('userData');
  // 读取data文件夹
  fs.readdir(configDir + '/data', (err, files) => {
    // 如果找不到目录
    if (err) {
      // 创建目录
      fs.mkdirSync(configDir + '/data');
      console.log('create user data folder success!');
    } else {
      console.log('user data folder is existent!');
    }
  });
  fs.readdir(configDir + '/data/artical', (err, files) => {
    // 如果找不到目录
    if (err) {
      // 创建目录
      fs.mkdirSync(configDir + '/data/artical');
      console.log('create user data folder success!');
    } else {
      console.log('user data folder is existent!');
    }
  });
  fs.readdir(configDir + '/data/cache', (err, files) => {
    // 如果找不到目录
    if (err) {
      // 创建目录
      fs.mkdirSync(configDir + '/data/cache');
      console.log('create user data folder success!');
    } else {
      console.log('user data folder is existent!');
    }
  });
  // 初始化文件
  fs.exists(configDir + '/data' + '/siderMenu.cs', (exists) => {
    if (exists) {
      console.log('siderMenu.cs file is existent!');
    } else {
      fs.writeFileSync(configDir + '/data' + '/siderMenu.cs', '[{"title":"我的笔记本","key":"b9205270-ddd9-4a84-b034-1eb5f797209e"}]');
      console.log('init siderMenu.cs file success!');
    }
  });
  fs.exists(configDir + '/data' + '/outLine.cs', (exists) => {
    if (exists) {
      console.log('outLine.cs file is existent!');
    } else {
      fs.writeFileSync(configDir + '/data' + '/outLine.cs', '[]');
      console.log('init outLine.cs file success!');
    }
  });
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时,调用这个函数
// 部分 API 在 ready 事件触发后才能使用
app.on('ready', createWindow);

// 当全部窗口关闭时退出
app.on('window-all-closed', () => {
  // 在 macOS 上,除非用户用 Cmd + Q 确定地退出
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上,当单击 dock 图标并且没有其他窗口打开时
  // 通常在应用程序中重新创建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 续写应用剩下主进程代码
// 也可以拆分成几个文件,然后用 require 导入
ipcMain.on('WINDOWS', (event, arg) => {
  console.log(arg)
  if ('WINDOWS_HIDE' === arg)
    mainWindow.minimize();
  else if ('WINDOWS_MAX' === arg)
    mainWindow.maximize();
  else if ('WINDOWS_UNMAX' === arg)
    mainWindow.unmaximize();
  else if ('WINDOWS_CLOSE' === arg)
    app.quit();
})

ipcMain.on('FILE', (event, arg) => {
  let configDir = app.getPath('userData');
  if ('FILE_READ' === arg.action) {
    fs.readFile(configDir + arg.dir, 'utf8', (err, data) => {
      return !err ? event.sender.send('FILE', {action: 'FILE_READ', callback: arg.callback, data: JSON.parse(data)}) : console.log(err);
    });
  } else if ('FILE_WRITE' === arg.action) {
    fs.writeFile(configDir + arg.dir, arg.data, (err) => {
      return !err ? true : console.log(err);
    });
  } else if ('FILE_DELETE' === arg.action) {
    fs.unlink(configDir + arg.dir, (err) => {
      return !err ? true : console.log(err);
    });
  }
})

ipcMain.on('FILE_SYNC', (event, arg) => {
  let configDir = app.getPath('userData');
  if ('FILE_READ_SYNC' === arg.action) {
    event.returnValue = fs.readFileSync(configDir + arg.dir, 'utf8');
  } else if ('FILE_WRITE_SYNC' === arg.action) {
    fs.writeFileSync(configDir + arg.dir, arg.data);
  } else if ('FILE_DELETE_SYNC' === arg.action) {
    fs.unlinkSync(configDir + arg.dir);
  }
})

ipcMain.on('MENU', (event, arg) => {
  let configDir = app.getPath('userData');
  // 生成菜单
  let menu = new Menu();
  // 根据行为判断
  if ('MENU_SIDERMENU' === arg.action) {
    menu.append(new MenuItem({ label: '新建笔记本', click: () => {
      event.sender.send('MENU_SIDERMENU', {action: 'MENU_SIDERMENU_CREATE_LEAF', key: arg.key});
    } }));
    menu.append(new MenuItem({ label: '删除笔记本', click: () => {
      event.sender.send('MENU_SIDERMENU', {action: 'MENU_SIDERMENU_DELETE_LEAF', key: arg.key});
    } }));
	  menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: '重命名', click: () => {
      event.sender.send('MENU_SIDERMENU', {action: 'MENU_SIDERMENU_RENAME_LEAF', key: arg.key});
    } }));
  } else if ('MENU_OUTLINE' === arg.action) {
    menu.append(new MenuItem({ label: '编辑', click: () => {
      event.sender.send('MENU_OUTLINE', {action: 'MENU_OUTLINE_EDIT_ARTICAL', key: arg.key, title: arg.title});
    } }));
    menu.append(new MenuItem({ label: '重命名', click: () => {
      event.sender.send('MENU_OUTLINE', {action: 'MENU_OUTLINE_RENAME_ARTICAL', key: arg.key, title: arg.title});
    } }));
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: '删除', click: () => {
      event.sender.send('MENU_OUTLINE', {action: 'MENU_OUTLINE_DELETE_ARTICAL', key: arg.key});
    } }));
  } else if ('MENU_WORKPART' === arg.action) {
    menu.append(new MenuItem({ label: '粘贴文本(只保留文本)', click: () => {
      event.sender.send('MENU_WORKPART', {action: 'MENU_WORKPART_PASTE', data: clipboard.readText()});
    } }));
    menu.append(new MenuItem({ label: '粘贴图文(适用于网页,Word)', click: () => {
      event.sender.send('MENU_WORKPART', {action: 'MENU_WORKPART_PASTE_WITH_FORMATE', data: clipboard.readHTML()});
    } }));
    menu.append(new MenuItem({ label: '粘贴截图(适用于截图,Excel,PowerPoint)', click: () => {
      // 判断是否含有图片
      if (!clipboard.readImage().isEmpty()) {
        // 获取文件buffer对象
        let imageBuffer = clipboard.readImage().toPNG();
        // 写入缓存文件
        fs.writeFile(configDir + '/data/cache/' + arg.id, imageBuffer, (err) => {
          if (!err)
            event.sender.send('MENU_WORKPART', {action: 'MENU_WORKPART_PASTE_WITH_IMAGE', data: 'data:image/jpeg;base64,' + fs.readFileSync(configDir + '/data/cache/' + arg.id).toString("base64")});
          else
            console.log(err);
        });
      } else {
        event.sender.send('MENU_WORKPART', {action: 'MENU_WORKPART_PASTE_WITH_IMAGE', data: false});
      }
    } }));
  }
  // 显示菜单
	let window = BrowserWindow.fromWebContents(event.sender);
	menu.popup(window);
});

ipcMain.on('IMAGE', (event, arg) => {
  // 判断地址时网络或者本地
  if (-1 === arg.url.indexOf('file:///')) { // 网络图片
    // 定义用户文件夹
    let configDir = app.getPath('userData');
    // 定义接收的数据
    let receivedBytes = 0;
    let totalBytes = 0;
    // 定义数据流
    const out = fs.createWriteStream(path.join(configDir + '/data/cache/', arg.fileName));
    // 定义请求参数并请求下载
    let request = net.request(arg.url);
    // 响应事件
    request.on('response', (response) => {
      // 将文件流输出到文件中
      response.pipe(out);
      // 更新总文件字节大小
      totalBytes = parseInt(response.headers['content-length'], 10);
      // 发送消息事件
      event.sender.send('IMAGE_RESPONSE', totalBytes);
      //console.log(`STATUS: ${response.statusCode}`)
      //console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
      // 数据事件
      response.on('data', (chunk) => {
        // 更新下载的文件块字节大小
        receivedBytes += chunk.length;
        // 发送消息事件
        event.sender.send('IMAGE_DATA', (receivedBytes * 100) / totalBytes);
        //console.log(`BODY: ${chunk}`)
      })
      // 结束事件
      response.on('end', () => {
        // 读取下载的图片并转换成base64
        let imageBuf = fs.readFileSync(configDir + '/data/cache/' + arg.fileName);
        // 下载成功 发送消息事件
        event.sender.send('IMAGE_END', {source: arg.id, target: 'data:image/jpeg;base64,' + imageBuf.toString("base64")});
      })
    });
    // 关闭请求
    request.end()
  } else { // 本地图片
    // 读取下载的图片并转换成base64
    let imageBuf = fs.readFileSync(arg.url.replace('file:///', ''));
    // 下载成功 发送消息事件
    event.sender.send('IMAGE_END', {source: arg.id, target: 'data:image/jpeg;base64,' + imageBuf.toString("base64")});
  }
});
