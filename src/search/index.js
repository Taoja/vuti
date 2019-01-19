import './index.css'
/**
 * tSearch搜索栏组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {String | Number} value v-model绑定数据
 * @prop {String} placeholder 提示语
 * @prop {String} type 输入框类型
 * @prop {Number} maxlength 输入框允许长度
 * @emits focus 获取焦点回调
 * @emits blur 失去焦点回调
 * @emits change 输入完成事件
 * @emits open 输入状态开启事件
 * @emits close 输入状态关闭事件
 * @example
 * <t-search v-model="search"></t-search>
 */
const component = {
  data() {
    return {
      sort: '',
      list: [],
      onfocus: false,
      src: require('../../common/image/close.png')
    }
  },
  props: {
    value: {
      type: String | Number,
      default: ''
    },
    placeholder: {
      type: String,
      default: '搜索'
    },
    type: {
      type: String,
      default: 'text'
    },
    maxlength: {
      type: Number
    }
  },
  watch: {
    onfocus(e) {
      if (e) {
        this.$emit('open')
      } else {
        this.$emit('close')
      }
    }
  },
  methods: {
    focus(e) {
      this.onfocus = true
      this.$emit('focus', e)
    },
    blur(e) {
      if (!this.value) {
        this.onfocus = false
      }
      this.$emit('blur', e)
    },
    input(e) {
      this.$emit('input', this.value)
    },
    change(e) {
      this.$emit('change', e)
    },
    searchClick() {
      this.$refs.input.focus()
    },
    close() {
      this.$emit('input', '')
      this.$refs.input.focus()
    }
  },
  mounted() {
    if (this.value) {
      this.onfocus = true
    }
  },
  template: `
    <div class="vuti vuti-search">
      <div class="vuti-search-area">
        <div class="icon-search vuti-search-icon" :class="{'vuti-search-focus': onfocus}" @click="searchClick"></div>
        <div class="vuti-search-body">
          <input ref="input" :type="type" :maxlength="maxlength" @focus="focus" @blur="blur" v-model="value" @change="change" @input="input" class="vuti-search-input" :placeholder="placeholder"/>
        </div>
      </div>
      <div class="vuti-search-close" @click="close" v-if="value"><img :src="src"/></div>
    </div>
  `
}

export default component
