import './index.css'
/**
 * tKeyboard 键盘组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {Boolean} value 开关
 * @prop {String} type 键盘类型
 *  @enum number simple IDCard
 *  @default number
 * @prop {Number} maxlength 可输入长度
 * @prop {String} word.sync 输入值双向绑定
 * @emits result 返回结果
 * @emits close 组件关闭
 * @example
 * <t-keyboard v-model="open" :word.sync="result" @result="output"></t-keyboard>
 */
const component = {
  data() {
    return {
      hidesrc: require('../../common/image/hidekeyboard.png'),
      backsrc: require('../../common/image/backspace.png'),
      target: ''
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    word: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'number'
    },
    maxlength: {
      type: Number,
      default: ''
    }
  },
  computed: {
    list() {
      if (this.type == 'number') {
        return ['1','2','3','4','5','6','7','8','9','.','0']
      }
      if (this.type == 'IDCard') {
        return ['1','2','3','4','5','6','7','8','9','X','0']
      }
      if (this.type == 'simple') {
        return ['1','2','3','4','5','6','7','8','9','','0']
      }
    }
  },
  watch: {
    target(e) {
      if (e === '') {
        return
      } else if (e === 'hide') {
        this.word = ''
        setTimeout(function() {
          this.$emit('input', false)
        }.bind(this), 100)
        this.$emit('close')
      } else if (e === 'ok') {
        this.word = ''
        setTimeout(function() {
        this.$emit('input', false)
        }.bind(this), 100)
        this.$emit('close')
      } else if (e === 'back') {
        if (this.word) {
          var arr = Array.from(this.word)
          arr.pop()
          this.word = arr.join('')
        }
        this.$emit('update:word', this.word)
      } else {
        if (this.maxlength && this.word.length >= this.maxlength*1) {
        } else {
          this.word = this.word + this.list[e]
        }
        this.$emit('update:word', this.word)
      }
      this.$emit('result', this.word)
      setTimeout(function() {
        this.target = ''
      }.bind(this), 100)
    }
  },
  methods: {
    result(e) {
      this.$emit('result', e)
      this.locker.clear()
    },
    enter() {
      document.addEventListener('click', this.event)
    },
    event(e) {
      if (this.$refs && this.$refs.keyboard && e.path.includes(this.$refs.keyboard)) {
      } else {
        this.word = ''
        this.$emit('input', false)
        this.$emit('result', this.word)
        this.$emit('close')
      }
    },
    leave() {
      document.removeEventListener('click', this.event)
    }
  },
  template: `
    <transition
      enter-active-class="vutiSlideInDown"
      leave-active-class="vutiSlideOutDown"
      @after-enter="enter"
      @after-leave="leave"
    >
      <div class="vuti-keyboard vuti" v-if="value" ref="keyboard">
        <div class="vuti-keyboard-left">
          <div @click="target = index" :class="{'vuti-keyboard-press': target === index && item}" class="vuti-keyboard-item" v-for="(item, index) in list" :key="index">{{item}}</div>
          <div @click="target = 'hide'" :class="{'vuti-keyboard-press': target === 'hide'}" class="vuti-keyboard-item"><img :src="hidesrc" /></div>
        </div>
        <div class="vuti-keyboard-right">
          <div @click="target = 'back'" :class="{'vuti-keyboard-press': target === 'back'}" class="vuti-keyboard-item vuti-keyboard-item2"><img :src="backsrc" /></div>
          <div @click="target = 'ok'" :class="{'vuti-keyboard-press': target === 'ok'}" class="vuti-keyboard-item vuti-keyboard-item2 vuti-keyboard-ok">确认</div>
        </div>
      </div>
    </transition>
  `
}

export default component
