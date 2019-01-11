import './index.css'
import tMask from '../mask/index.js'

/**
 * tToast提示框组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} value 提示框显示开关
 * @prop {String} text 内容文案
 * @prop {String} src 图片链接
 * @prop {String} icon 图标样式名
 * @prop {Boolean} mask 是否显示遮罩 @default false 不显示
 * @prop {Boolean} tapHide 是否点击背景关闭 @default false
 * @prop {Number || Boolean} duration 提示框持续时间（毫秒），false则不会自动关闭 @default 3000
 * @emits afterHide 关闭动画结束后回调
 * @emits afterShow 打开动画结束后回调
 * @example 
 * <t-toast
    v-model="toastSwitch"
    src="../../image.png"
    icon="icon-QRcode"
    text="文本内容文本内容文本内容文本内容文本内容文本内容文本内容"
   ></t-toast>
 */
const component = {
  data() {
    return {
      timeout: ''
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    src: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    mask: {
      type: Boolean,
      default: false
    },
    tapHide: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number || Boolean,
      default: 3000
    }
  },
  methods: {
    close() {
      this.$emit('input', false)
      clearTimeout(this.timeout)
    },
    maskClick() {
      if (this.tapHide) {
        this.close()
      }
    },
    afterShow() {
      this.$emit('afterShow')
      if (this.duration) this.timeout = setTimeout(this.close, this.duration)
    },
    afterHide() {
      this.$emit('afterHide')
    }
  },
  components: {
    tMask
  },
  template: `
    <div>
      <t-mask
        :mask="mask"
        :visibility="value"
        @click="maskClick"
        @afterShow="afterShow"
        @afterHide="afterHide"
      >
      </t-mask>
      <transition
        enter-active-class="vutiFadeIn"
        leave-active-class="vutiFadeOut"
      >
        <div class="vuti-toast vuti" v-if="value">
          <slot>
            <div v-if="src" class="vuti-toast-image">
              <img :src="src"/>
            </div>
            <div v-if="icon" class="vuti-toast-icon" :class="icon"></div>
            <div class="vuti-toast-text">{{text}}</div>
          </slot>
        </div>
      </transition>
    </div>
  `
}

/**
 * tToast提示框组件(plugin用法)
 * @author 黄武韬<346792184@qq.com>
 * @param {Object} options 提示框参数
 *  @property {String} text 内容文案
 *  @property {String} src 图片链接
 *  @property {String} icon 图标class名
 *  @property {Boolean} mask 是否显示遮罩 @default false 不显示
 *  @property {Boolean} tapHide 是否点击遮罩隐藏 @default false
 *  @property {Number || Boolean} duration 提示框持续时间（毫秒），false则不会自动关闭 @default 3000
 * @return {vm} 对话框示例，vm.close()可手动关闭对话框
 * @example 
 * this.$toast({
    text: '测试一下plugin',
    src: this.img,
    icon: 'icon-qrCode',
    duration: '1000'
   })
 */
const install = function(Vue) {
  var ext = Vue.extend(component)
  Vue.prototype.$toast = function (options) {
    var vm = (new ext({
      propsData: options
    })).$mount()
    vm.value = true
    vm.afterHide = function () {
      vm.$destroy(true)
      document.body.removeChild(vm.$el)
    }
    vm.close = function () {
      vm.value = false
    }
    document.body.appendChild(vm.$el)
    return vm
  }
}

export {
  install
}
export default component
