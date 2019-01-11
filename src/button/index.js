import './index.css'
/**
 * 蒙版组件tMask
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} size 按钮尺寸
 *  @enum normal small big
 *  @default normal
 * @prop {String} scheme 皮肤
 *  @enum default 其他皮肤可自定义
 *  @default default
 * @prop {Boolean} disabled 是否可用 @default false
 * @prop {Boolean} plain 是否使用反色 @default false
 */
const component = {
  data() {
    return {
      press: false
    }
  },
  props: {
    size: {
      type: String,
      default: 'normal'
    },
    scheme: {
      type: String,
      default: 'default'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plain: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    click(e) {
      if (!this.press && !this.disabled) {
        this.press = true
        this.$emit('click', e)
        setTimeout(function() {
          this.press = false
        }.bind(this), 100)
      }
    }
  },
  template: `
    <div class="vuti-button vuti" @click="click" :size="size" :scheme="scheme" :plain="plain" :press="press" :disabled="disabled">
      <slot></slot>
    </div>
  `
}

export default component
