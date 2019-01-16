import './index.css'
/**
 * tCell表单块组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} title 标题
 * @prop {String} tips 描述文字
 * @prop {Object} icon 标题栏图标
 *  @property {String} name 图标class名
 *  @property {String} color 图标颜色
 * @prop {Boolean} isLink 是否可以点击 @default false
 * @emits click 当isLink为true事的点击事件
 * @example
 * <t-cell is-link title="标题标题" tip="说明文字/描述信息" :icon="{name: 'icon-QRcode',color: 'red'}">内容</t-cell>
 */
const component = {
  data() {
    return {
    }
  },
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  methods: {
    click(e) {
      if (!this.press && this.isLink) {
        this.press = true
        this.$emit('click', e)
        setTimeout(function() {
          this.press = false
        }.bind(this), 100)
      }
    }
  },
  template: `
    <div class="vuti vuti-block">
      <slot>
        <div class="vuti-block-text">{{text}}</div>
      </slot>
    </div>
  `
}

export default component
