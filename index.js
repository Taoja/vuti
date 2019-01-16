import './common/css/var.css'
import './common/css/mixin.css'
import './common/css/iconfont.css'
window.$mask = []

import {install as dialogPlugin} from './src/dialog/index.js'
import {install as datepickerPlugin} from './src/datepicker/index.js'
import {install as toastPlugin} from './src/toast/index.js'
const plugins = {
  install: function(Vue) {
    dialogPlugin(Vue)
    datepickerPlugin(Vue)
    toastPlugin(Vue)
  }
}

import tButton from './src/button/index.js'
import tHeader from './src/header/index.js'
import tPage from './src/page/index.js'
import tMask from './src/mask/index.js'
import tDialog from './src/dialog/index.js'
import tScroll from './src/scroll/index.js'
import tPopup from './src/popup/index.js'
import tDatepicker from './src/datepicker/index.js'
import tPicker from './src/picker/index.js'
import tCell from './src/cell/index.js'
import tActionsheet from './src/actionSheet/index.js'
import tToast from './src/toast/index.js'
import tCellInput from './src/cellInput/index.js'
import tSwitch from './src/switch/index.js'
import tGroup from './src/group/index.js'
import tSort from './src/sort/index.js'
import tGrid from './src/grid/index.js'
import tCarousel from './src/carousel/index.js'
import tNotice from './src/notice/index.js'
import tRow from './src/row/index.js'

export {
  tButton,
  tHeader,
  tPage,
  tMask,
  tDialog,
  tScroll,
  tPopup,
  tDatepicker,
  tPicker,
  tCell,
  tActionsheet,
  plugins,
  tToast,
  tCellInput,
  tSwitch,
  tGroup,
  tSort,
  tGrid,
  tCarousel,
  tNotice,
  tRow
}