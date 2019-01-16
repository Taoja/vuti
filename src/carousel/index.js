import './index.css'
import '../../common/css/swiper-4.4.1.min.css'
import Swiper from '../../common/js/swiper-4.4.1.min.js'
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
      paginationClass: (new Date()).getTime(),
      swiper: '',
      config: {
        type: 'normal',
        loop: true,
        initialSlide: 0,
        speed: 300,
        autoplay: {
          delay: 2000,
        },
        navigation: false,
      }
    }
  },
  props: {
    data: {
      type: Array,
      default: []
    },
    options: {
      type: Object,
      default: {}
    }
  },
  mounted () {
    this.config.pagination = {
      el: `.vuti-carousel-pagination${this.paginationClass}`,
      clickable: true
    }
    let options = Object.assign(this.config, this.options)
    console.log(options)
    this.swiper = new Swiper(`.vuti-carousel${this.paginationClass}`, options)
  },
  methods: {
    click (e) {
      this.$emit('click', e)
    }
  },
  template: `
    <div class="vuti-carousel swiper-container vuti" :class="'vuti-carousel-' + options.type + ' vuti-carousel' + paginationClass">
      <div class="vuti-carousel-wrapper swiper-wrapper">
        <div class="vuti-carousel-item swiper-slide" v-for="(item, index) in data" :key="index" @click="click(item)">
          <img :src="item.src">
        </div>
      </div>
      <div v-if="options.navigation" class="swiper-button-prev"></div><!--左箭头-->
      <div v-if="options.navigation" class="swiper-button-next"></div><!--右箭头-->
      <div class="vuti-carousel-pagination swiper-pagination" :class="'vuti-carousel-pagination' + paginationClass"></div>
    </div>
  `
}

export default component
