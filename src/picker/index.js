import './index.css'
import tScroll from '../scroll/index.js'
import iscroll from '../../common/js/iscroll.js'
/**
 * 选择器picker
 * @author 黄武韬<346792184@qq.com>
 * @prop {Number} value v-model双向绑定，对应当前选中的下标
 * @prop {Array} list 需要展示的数据
 * @prop {String} unit 单位 @default ''
 * @emits result 返回选中的下标
 */
const component = {
  data() {
    return {
      scrollOpt: {
        bindToWrapper: true
      },
      cellHeight: '',
      height: ''
    }
  },
  props: {
    value: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default() {
        return []
      }
    },
    unit: {
      type: String,
      default: ''
    }
  },
  watch: {
    value(e) {
      this.$refs.content.scroll.scrollTo(0, -e*this.cellHeight, 100, iscroll.utils.ease.back)
      this.$nextTick(function() {
        this.$refs.content.refresh()
      }.bind(this))
    }
  },
  components: {
    tScroll
  },
  methods: {
    _onScrollEnd(scroll) {
      var cell = Math.round(scroll.y/this.cellHeight)
      this.$emit('input', Math.abs(cell))
      this.$emit('result', Math.abs(cell))
    }
  },
  mounted() {
    this.cellHeight = window.innerWidth*0.09
    var bodyHeight = this.$refs.content.$el.clientHeight
    this.height = (bodyHeight - this.cellHeight)/2
    this.$refs.content.scroll.scrollTo(0, -this.value*this.cellHeight)
    this.$nextTick(function () {
      this.$refs.content.refresh()
    }.bind(this))
  },
  template: `
    <div class="vuti-picker-main">
      <t-scroll class="vuti-picker-content" ref="content" :options="scrollOpt" @scrollEnd="_onScrollEnd">
        <div :style="{height: height+'px'}"></div>
        <div class="vuti-picker-item" ref="item" v-for="(item, index) in list" :key="index">{{item}}{{unit}}</div>
        <div :style="{height: height+'px'}"></div>
      </t-scroll>
    </div>
  `
}

export default component
