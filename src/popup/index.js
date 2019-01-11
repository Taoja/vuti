import './index.css'
import tMask from '../mask/index.js'
/**
 * 底部弹窗组件tPopup
 * @author 黄武韬<346792184@qq.com>
 * @prop {Boolean} visibility 组件开关 @default false
 * @prop {Boolean} tapHide 点击遮罩是否关闭弹窗 @default true
 * @prop {Boolean} autoHeight 是否自动高度，最低高度40vw @default false
 * @example
 * <t-popup v-model="popupSwitch" auto-height>123</t-popup>
 */
const component = {
  components: {
    tMask
  },
  props: {
    visibility: {
      type: Boolean,
      default: false
    },
    tapHide: {
      type: Boolean,
      default: true
    },
    autoHeight: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    hide() {
      this.$emit('hide')
    },
    maskClick() {
      this.$emit('maskClick')
    },
    show() {
      this.$emit('show')
    },
    afterShow() {
      this.$emit('afterShow')
    },
    afterHide() {
      this.$emit('afterHide')
    }
  },
  template: `
    <div>
      <t-mask
        :visibility="visibility"
        @hide="hide"
        @click="maskClick"
        @show="show"
      >
      </t-mask>
      <transition
        enter-active-class="vutiSlideInDown"
        leave-active-class="vutiSlideOutDown"
        @after-enter="afterShow"
        @after-leave="afterHide"
      >
        <div class="vuti-popup" :auto-height="autoHeight" v-if="visibility">
          <slot></slot>
        </div>
      </transition>
    </div>
  `
}

export default component
