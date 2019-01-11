import './index.css'
import tMask from '../mask/index.js'

/**
 * tDialog对话框组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} value 对话框显示开关
 * @prop {String} title 标题文案
 * @prop {String} text 内容文案
 * @prop {String} src 图片链接
 * @prop {Boolean} mask 是否显示遮罩 @default true 显示
 * @prop {Boolean} tapHide 是否点击遮罩隐藏 @default false
 * @prop {Array} buttons 主按钮列表
 *  @member {Object}
 *    {
 *      text 按钮文案,
 *      style 按钮风格, primary为主色风格
 *      close 是否点击关闭,为false时点击不关闭对话框
 *    }
 *  @default
 *    {
 *      text: '确认',
 *      style: 'primary',
 *      close: true
 *    }
 * @prop {Array} extButtons 拓展按钮列表
 *  @member {Object}
 *    {
 *      text 按钮文案,
 *      style 按钮风格, primary为主色风格
 *      close 是否点击关闭,为false时点击不关闭对话框
 *    }
 * @emits click 按钮点击事件，返回被点击按钮全部属性
 * @example 
 * <t-dialog v-model="dialogSwitch" title="标题单行" text="告知当前状态，信息和解决方法
最好不要超过两行。" :buttons="buttons" :src="img" :extButtons="buttons"></t-dialog>
 */
const component = {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    src: {
      type: String,
      default: ''
    },
    mask: {
      type: Boolean,
      default: true
    },
    tapHide: {
      type: Boolean,
      default: false
    },
    buttons: {
      type: Array,
      default() {
        return [{
          text: '确认',
          style: 'primary',
          close: true
        }]
      }
    },
    extButtons: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    click(item) {
      if (item.close !== false) {
        this.close()
      }
      this.$emit('click', item)
    },
    close() {
      this.$emit('input', false)
    },
    maskClick() {
      if (this.tapHide) {
        this.close()
      }
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
        @afterHide="afterHide"
      >
      </t-mask>
      <transition
        enter-active-class="vutiFadeIn"
        leave-active-class="vutiFadeOut"
      >
        <div class="vuti-dialog vuti" v-if="value">
          <slot>
            <div class="vuti-dialog-image" v-if="src">
              <img :src="src" />
            </div>
            <div class="vuti-dialog-title">{{title}}</div>
            <div class="vuti-dialog-text">{{text}}</div>
          </slot>
          <slot name="buttons">
            <div class="vuti-dialog-buttons">
              <div v-for="(item, index) in buttons" @click="click(item)" class="vuti-dialog-button" :class="'vuti-dialog-button-' + item.style">{{item.text}}</div>
            </div>
            <div class="vuti-dialog-buttons vuti-dialog-extends" v-for="(item, index) in extButtons">
              <div @click="click(item)" class="vuti-dialog-button" :class="'vuti-dialog-button-' + item.style">{{item.text}}</div>
            </div>
          </slot>
        </div>
      </transition>
    </div>
  `
}

/**
 * tDialog对话框组件(plugin用法)
 * @author 黄武韬<346792184@qq.com>
 * @param {Object} options 对话框参数
 *  @property {String} title 标题文案
 *  @property {String} text 内容文案
 *  @property {String} src 图片链接
 *  @property {Boolean} mask 是否显示遮罩 @default true 显示
 *  @property {Boolean} tapHide 是否点击遮罩隐藏 @default false
 *  @property {Array} buttons 主按钮列表
 *    @member {Object}
 *      {
 *        text 按钮文案,
 *        style 按钮风格, primary为主色风格
 *        close 是否点击关闭,为false时点击不关闭对话框
 *      }
 *  @property {Array} extButtons 拓展按钮列表
 *    @member {Object}
 *      {
 *        text 按钮文案,
 *        style 按钮风格, primary为主色风格
 *      }
 * @return {Promise.resolve} target 被点击按钮属性
 * @example 
 * this.$dialog({
    title: '示例',
    text: '告知当前状态，信息和解决方法
最好不要超过两行。',
    src: this.img,
    buttons: [
      {
        text: '取消',
      },
      {
        text: '确定',
        style: 'primary',
      }
    ]
  }).then(function(target) {
    console.log(target)
  })
 */
const install = function(Vue) {
  var ext = Vue.extend(component)
  Vue.prototype.$dialog = function (options) {
    return new Promise(function (resolve) {
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
      vm.click = function (item) {
        vm.value = false
        resolve(item)
      }
      document.body.appendChild(vm.$el)
    })
  }
}

export {
  install
}
export default component
