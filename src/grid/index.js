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
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    }
  },
  template: `
    <div class="vuti-grid vuti">
      <div class="vuti-grid-item" v-for="(item, index) in data" :key="index" @click="click(item)">
        <img :src="item.src" alt="">
      </div>
    </div>
  `,
  methods: {
    click(e) {
      this.$emit('click', e)
    }
  }
}

export default component
