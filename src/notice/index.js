import './index.css'
/**
 * 宫格组件grid
 * @author 黄武韬<346792184@qq.com>
 * @prop {Array} data 宫格数据组
 * @emits click 返回点击的宫格对象
 * @example
 * <t-grid :data="data"></t-grid>
 */
const component = {
  data () {
    return {
      config: {
        delay: 3000
      },
      activeIndex: 0
    }
  },
  computed: {
    activeNotice () {
      return this.data[this.activeIndex]
    }
  },
  props: {
    options: {
      type: Object,
      default: {}
    },
    data: {
      type: Array,
      default: []
    }
  },
  mounted () {
    this.config = Object.assign(this.config, this.options)
    this.loop()
  },
  methods: {
    loop () {
      this.activeIndex = this.activeIndex === this.data.length - 1 ? 0 : this.activeIndex + 1
      setTimeout(() => {
        this.loop()
      }, this.config.delay)
    },
    click (e) {
      this.$emit('click', e)
    }
  },
  template: `
  <div class="vuti-notice vuti" :style="'padding: ' + options.padding">
    <div class="vuti-notice-title">
      <span v-for="(item, index) in options.title" :key="index">
        <span v-if="item.text" :style="'color: '+item.color">{{item.text}}</span>
        <span v-if="item.icon" :style="'color: '+item.color" class="iconfont" :class="item.icon"></span>
        <img class="vuti-notice-pic" v-if="item.src" :style="'width: '+item.width" :src="item.src" />
      </span>
    </div>
    <div class="vuti-notice-body">
      <transition
      enter-active-class="faster animated slideInUp"
      leave-active-class="faster animated slideOutUp"
      >
        <div class="vuti-notice-item" v-if="index === activeIndex" v-for="(item, index) in data" :key="index" @click="click(item)">
          <span class="vuti-notice-txt">{{item.text}}</span>
        </div>
      </transition>
    </div>
  </div>
  `
}

export default component
