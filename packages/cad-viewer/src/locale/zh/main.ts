export default {
  mainMenu: {
    new: '新建图纸',
    open: '打开图纸',
    export: '导出为SVG'
  },
  commandLine: {
    prompt: '输入命令...'
  },
  progress: {
    start: '开始解析文件...',
    parse: '正在解析文件 ...',
    font: '正在下载图纸所需字体...',
    ltype: '正在解析线形...',
    style: '正在解析文字样式...',
    dimstyle: '正在解析标注样式...',
    layer: '正在解析图层...',
    vport: '正在解析视口...',
    blockrecord: '正在解析BTRs...',
    header: '正在解析文件头...',
    block: '正在解析块..',
    entity: '正在解析图元...',
    object: '正在解析NODs...',
    end: '完成！'
  },
  verticalToolbar: {
    select: {
      text: '选择',
      description: '选择图元'
    },
    pan: {
      text: '移动',
      description: '平移视图'
    },
    zoomToExtent: {
      text: '范围缩放',
      description: '缩放以显示所有对象'
    },
    zoomToBox: {
      text: '矩形缩放',
      description: '缩放以显示矩形窗口内的对象'
    },
    layer: {
      text: '图层',
      description: '管理图层'
    }
  },
  statusBar: {
    setting: {
      tooltip: '显示设置',
      commandLine: '命令行',
      coordinate: '坐标',
      toolbar: '工具栏',
      stats: '性能面板'
    },
    pointStyle: {
      tooltip: '修改点样式'
    },
    fullScreen: {
      on: '切换到全屏模式',
      off: '退出全屏模式'
    },
    theme: {
      dark: '切换到暗黑主题',
      light: '切换到明亮主题'
    },
    warning: {
      font: '没有找到如下字体：'
    }
  },
  toolPalette: {
    layerManager: {
      title: '图层管理器',
      layerList: {
        name: '名称',
        on: '可见',
        color: '颜色'
      }
    }
  },
  entityInfo: {
    color: '颜色',
    layer: '图层',
    lineType: '线型'
  },
  message: {
    loadingFonts: '正在加载字体...',
    fontNotLoaded: '无法从"{url}"加载字体"{fontName}"！',
    failedToGetAvaiableFonts: '无法从"{url}"获取可用的字体信息!',
    failedToOpenFile: '无法打开文件"{fileName}"!'
  }
}
