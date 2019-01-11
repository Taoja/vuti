import './index.css'
/**
 * 开关组件tSwitch
 * @author 黄武韬<346792184@qq.com>
 * @prop {Boolean} value v-model开关
 * @emits click 开关被点击
 * @example
 * <t-switch v-model="tswitch"></t-switch>
 */
const component = {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    click(e) {
      this.$emit('click', e)
      this.$emit('input', !this.value)
    }
  },
  template: `
    <div class="vuti-switch" :class="{'vuti-switch-open': value}" @click="click">
      <div class="vuti-switch-button"></div>
    </div>
  `
}

export default component
