import './index.css'
/**
 * tGroup 表单组组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} title 标题
 * @emits click title被点击时触发
 * @example
 * <t-group title="标题标题" @click>
 *  <t-cell></t-cell>
 * </t-g>
 */
const component = {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    click(e) {
      this.$emit('click', e)
    }
  },
  template: `
    <div class="vuti vuti-group">
      <div class="vuti-group-title">{{title}}</div>
      <slot></slot>
    </div>
  `
}

export default component
