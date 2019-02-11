import './index.css'
import Sortable from '../../common/js/sortable.js'
/**
 * tSort托拉拽组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {Array} data 传入的排序数组
 * @prop {Number} delay 长按拖动延迟
 * @prop {String} handle 定义拖动手柄样式名
 * @emits result 返回拖动完成后排序数组
 * @example
 * <t-sort @result="result" :data="data"><div v-for="(item, index) in data">item {{item}}</div></t-sort>
 */
const component = {
  data() {
    return {
      sort: '',
      list: []
    }
  },
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    },
    delay: {
      type: Number,
      default: 150
    },
    handle: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.list = [].concat(this.data)
    this.sort = new (Sortable())(this.$refs.vutiSort, {
      animation: 150,
      ghostClass: 'vuti-sort-bg',
      onEnd: this.end,
      delay: this.delay,
      handle: this.handle
    })
  },
  methods: {
    end(e) {
      var target = this.list[e.oldIndex]
      if (e.oldIndex > e.newIndex) {
        this.list.splice(e.oldIndex, 1)
        this.list.splice(e.newIndex, 0, target)
      } else {
        this.list.splice(e.newIndex + 1, 0, target)
        this.list.splice(e.oldIndex, 1)
      }
      this.$emit('result', this.list)
    }
  },
  template: `
    <div class="vuti vuti-sort" ref="vutiSort">
      <slot></slot>
    </div>
  `
}

export default component
