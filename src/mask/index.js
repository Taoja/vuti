import './index.css'
/**
 * 蒙版组件tMask
 * @author 黄武韬<346792184@qq.com>
 * @prop {Boolean} visibility 组件开关
 * @prop {Boolean} mask 背景色是否隐藏 @default true
 * @emits show mask显示时的回调
 * @emits hide mask隐藏时的回调
 * @emits click mask被点击时的回调
 */
const component = {
  data() {
    return {
      nobg: false
    }
  },
  props: {
    visibility: {
      type: Boolean,
      default: false
    },
    mask: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    visibility: {
      handler(e) {
        if (e) {
          if (window.$mask.length > 0) {
            this.nobg = true
          } 
          if (this.mask) {
            window.$mask.push(1)
          }
          this.$emit('show')
        } else {
          if (this.mask) {
            window.$mask.pop()
          }
          this.$emit('hide')
        }
      }
    }
  },
  methods: {
    click(e) {
      this.$emit('click', e)
    },
    afterEnter() {
      this.$emit('afterShow')
    },
    afterLeave() {
      this.$emit('afterHide')
    }
  },
  template: `
    <transition
      enter-active-class="vutiFadeIn"
      leave-active-class="vutiFadeOut"
      @after-enter="afterEnter"
      @after-leave="afterLeave"
    >
      <div class="vuti-mask vuti" v-if="visibility" :class="{'vuti-mask-nobg': nobg || !mask}" @click="click">
        <slot></slot>
      </div>
    </transition>
  `
}

export default component
