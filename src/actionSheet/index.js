import './index.css'
import tPopup from '../popup/index.js'
/**
 * tActionsheet动作面板组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {Boolean} value 动作面板开关
 * @prop {Boolean} tapHide 点击背景是否关闭动作面板 @default true
 * @prop {String} title 动作面板标题
 * @prop {Array} buttons 按钮数组
 */
const component = {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    mask: {
      type: Boolean,
      default: true
    },
    tapHide: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    buttons: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    hide() {
      this.$emit('input', false)
      this.$emit('hide')
    },
    maskClick() {
      if (this.tapHide) {
        this.hide()
      }
    },
    cancel() {
      this.hide()
    },
    submit(item) {
      this.hide()
      this.$emit('result', item)
    }
  },
  template: `
    <t-popup
      :visibility="value"
      auto-height
      :mask="mask"
      @maskClick="maskClick"
    >
      <div class="vuti vuti-as">
        <div class="vuti-as-title" v-if="title">{{title}}</div>
        <div class="vuti-as-btn vuti-border-top" @click="submit(item)" :style="{'color': item.color}" v-for="(item, index) in buttons" :key="index">{{item.text}}</div>
        <div class="vuti-as-cancel" @click="cancel">取消</div>
      </div>
    </t-popup>
  `,
  components: {
    tPopup
  }
}

export default component
