import './index.css'
/**
 * 页面容器tPage
 * @author 黄武韬<346792184@qq.com>
 * @prop {Boolean} load 是否显示模糊页面 @default false
 */
const component = {
  props: {
    load: {
      type: Boolean,
      default: false //normal small big
    }
  },
  template: `
    <div class="vuti-page vuti" :load="load">
      <div class="vuti-page-top">
        <slot name="top"></slot>
      </div>
      <div class="vuti-page-middle">
        <slot></slot>
      </div>
      <div class="vuti-page-bottom">
        <slot name="bottom"></slot>
      </div>
    </div>
  `
}

export default component
