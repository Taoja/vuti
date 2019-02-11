
import '../common/css/var.css'
import '../common/css/mixin.css'
import '../common/css/iconfont.css'
window.$mask = []

import {install as dialogPlugin} from './dialog/index.js'
import {install as datepickerPlugin} from './datepicker/index.js'
import {install as toastPlugin} from './toast/index.js'
const plugins = {
  install: function(Vue) {
    dialogPlugin(Vue)
    datepickerPlugin(Vue)
    toastPlugin(Vue)
  }
}
import tButton from './button/index.js'
import tHeader from './header/index.js'
import tPage from './page/index.js'
import tMask from './mask/index.js'
import tDialog from './dialog/index.js'
import tScroll from './scroll/index.js'
import tPopup from './popup/index.js'
import tDatepicker from './datepicker/index.js'
import tPicker from './picker/index.js'
import tCell from './cell/index.js'
import tActionsheet from './actionSheet/index.js'
import tToast from './toast/index.js'
import tCellInput from './cellInput/index.js'
import tSwitch from './switch/index.js'
import tGroup from './group/index.js'
import tSort from './sort/index.js'
import tGrid from './grid/index.js'
// import tCarousel from './carousel/index.js'
import tNotice from './notice/index.js'
import tRow from './row/index.js'
import tSearch from './search/index.js'
import tGestures from './gestures/index.js'
import tKeyboard from './keyboard/index.js'

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
  // tCarousel,
  tNotice,
  tRow,
  tSearch,
  tGestures,
  tKeyboard,
}