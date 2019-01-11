import tCell from '../cell/index.js'
import './index.css'
/**
 * tCellInput表单输入栏
 * @author 黄武韬<346792184@qq.com>
 * @prop {Number || String} value v-model绑定数据
 * @prop {String} title 标题
 * @prop {String} tips 描述文字
 * @prop {String} type 输入框类型(参考input type类型)
 * @prop {Number} maxlength 输入内容最大长度
 * @prop {Boolean} readonly 是否可以输入
 * @prop {Object} icon 标题栏图标
 *  @property {String} name 图标class名
 *  @property {String} color 图标颜色
 * @prop {String} placeholder 输入框默认词
 * @emits click 当isLink为true事的点击事件
 * @emits change
 * @emits focus
 * @emits blur
 * @emits keydown
 * @emits keyup
 * @example
 * <t-cell is-link title="标题标题" tip="说明文字/描述信息" :icon="{name: 'icon-QRcode',color: 'red'}">内容</t-cell>
 */
const component = {
  data() {
    return {
      press: false,
      src: require('../../common/image/isLink.png')
    }
  },
  props: {
    value: {
      type: Number || String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    tips: {
      type: String,
      default: ''
    },
    icon: {
      type: Object,
      default() {
        return {}
      }
    },
    placeholder: {
      type: String,
      default: '请输入'
    },
    type: {
      type: String,
      default: 'text'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number
    }
  },
  methods: {
    input() {
      this.$emit('input', this.value)
    },
    change(e) {
      this.$emit('change', e)
    },
    focus(e) {
      this.$emit('focus', e)
    },
    blur(e) {
      this.$emit('blur', e)
    },
    keyup(e) {
      this.$emit('keyup', e)
    },
    keydown(e) {
      this.$emit('keydown', e)
    },
    click(e) {
      this.$emit('click', e)
    }
  },
  template: `
    <t-cell
      :title="title"
      :tips="tips"
      :icon="icon"
    >
      <input v-model="value" :maxlength="maxlength" :readonly="readonly" :type="type" class="vuti-cellInput-input" :placeholder="placeholder" @focus="focus" @blur="blur" @keyup="keyup" @keydown="keydown" @click="click" @focus="focus" @input="input" @change="change" type="text"/>
    </t-cell>
  `,
  components: {
    tCell
  }
}

export default component
