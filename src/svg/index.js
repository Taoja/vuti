import './index.css'
import '../../common/js/iconfont.js'
/**
 * svg插件
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} logo logo编号
 */
const component = {
  props: {
    logo: {
      type: String,
      default: ''
    }
  },
  template: `
    <svg class="vuti-svg vuti">
        <use :xlink:href="'#icon-' + logo"></use>
    </svg>
  `
}

export default component
