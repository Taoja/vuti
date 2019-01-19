import './index.css'
import gestures from '../../common/js/gestures.js'
/**
 * tGestures 手势组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {Object} color 组件颜色
 *  @default {circle:'#0096ff',line:'#0096ff'}
 * @emits result 返回解锁结果
 * @example
 * <t-gestures @result="result"></t-gestures>
 */
const component = {
  data() {
    return {
      locker: ''
    }
  },
  props: {
    color: {
      type: Object,
      default() {
        return {
          circle: '#0096ff',
          line: '#0096ff'
        }
      }
    }
  },
  methods: {
    result(e) {
      this.$emit('result', e)
      this.locker.clear()
    }
  },
  mounted() {
    this.locker = new gestures({
      sideLength: 300,
      containner: this.$refs.gestures,
      circleColor: this.color.circle,
      lineColor: this.color.line,
      callback: this.result
    })
  },
  template: `
    <div class="vuti-gestures" ref="gestures"></div>
  `
}

export default component
