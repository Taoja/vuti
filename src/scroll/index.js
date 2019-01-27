import './index.css'
import spinner from '../spinner/index.js'
import iscroll from '../../common/js/iscroll.js'
/**
 * 滚动组件tScroll
 * @author 黄武韬<346792184@qq.com>
 * @prop {Number} pullDownOffset 下拉刷新位移量 @default 50
 * @prop {Number} pullUpOffset 上拉加载位移量 @default 50
 * @prop {Object} options iscroll参数 @default {scrollbars:false}
 * @prop {String} loadTypeTop 下拉刷新loading样式 @default doubleRing
 * @prop {String} loadTypeBottom 上拉加载loading样式 @default ios
 * @prop {String} noMore 上拉加载没有更多开关 @default false
 * @prop {String} noMoreText 上拉加载没有更多提示文案 @default 没有更多了
 * @emits pullDown 下拉刷新绑定事件，如果绑定则可以下拉刷新
 * @emits pullUp 上拉加载绑定事件，如果绑定则可以上拉加载
 * @slot default 内容区域插槽
 * @slot pullDown 下拉刷新loading样式插槽
 * @slot pullUp 上拉加载loading样式插槽
 * @example
 * <t-scroll ref="tScroll" @pullDown="pullDown" @pullUp="addArr" :options="options">
    <div v-for="(item, index) in arr" :key="index">{{item}}</div>
  </t-scroll>
 */
const component = {
  components: {
    spinner
  },
  data() {
    return {
      scroll: '',
      onPullDown: false,
    }
  },
  props: {
    pullDownOffset: {
      type: Number,
      default: 50
    },
    pullUpOffset: {
      type: Number,
      default: 50
    },
    options: {
      type: Object,
      default() {
        return {
          scrollbars: false,
          click: true
        }
      }
    },
    loadTypeTop: {
      type: String,
      default: 'ios'
    },
    loadTypeBottom: {
      type: String,
      default: 'ios'
    },
    noMore: {
      type: Boolean,
      default: false
    },
    noMoreText: {
      type: String,
      default: '没有更多了'
    }
  },
  computed: {
    hasPullDown() {
      return this.$listeners.pullDown
    },
    hasPullUp() {
      return this.$listeners.pullUp
    },
    probeType() {
      let leve = 1
      if (this.hasPullDown) {
        leve = 2
      }
      if (this.hasPullUp) {
        leve = 3
      }
      return leve
    }
  },
  template: `
    <div ref="vutiScroll" class="vuti-scroll vuti">
      <div class="vuti-scroll-wrapper">
        <div class="vuti-scroll-pullDown" v-if="hasPullDown">
          <slot name="pullDown">
            <spinner class="vuti-scroll-svg" :type="loadTypeTop"></spinner>
          </slot>
        </div>
        <slot></slot>
        <div class="vuti-scroll-pullUp" v-if="hasPullUp">
          <slot name="pullUp">
            <spinner v-if="!noMore" class="vuti-scroll-svg" :type="loadTypeBottom"></spinner>
            <div v-else class="vuti-scroll-nomore">{{noMoreText}}</div>
          </slot>
        </div>
      </div>
    </div>
  `,
  methods: {
    refresh() {
      this.onPulling = false
      this.scroll.refresh()
      this.scroll.enable()
    },
    _onScroll(e) {
      if (this.$listeners.scroll) {
        this.$emit('scroll', e)
      }
      if (this.scroll.y > this.pullDownOffset && !this.onPulling && this.hasPullDown) {
        this.onPulling = true
        this.scroll.disable()
        this.$emit('pullDown')
      }
      if (this.hasPullUp) {
        var offset = this.scroll.y - this.scroll.maxScrollY
        if (offset < this.pullUpOffset && !this.onPulling) {
          if (!this.noMore) {
            this.onPulling = true
            this.$emit('pullUp')
          }
        }
      }
    },
    _onScrollEnd() {
      this.$emit('scrollEnd', this.scroll)
    }
  },
  mounted() {
    let scrollDom = this.$refs.vutiScroll
    let options = Object.assign(this.options, {
      probeType: this.probeType
    })
    this.scroll = new iscroll(scrollDom, options)
    if (this.hasPullDown || this.hasPullUp) {
      this.scroll.on('scroll', this._onScroll)
    }
    this.scroll.on('scrollEnd', this._onScrollEnd)
  },
}

export default component
