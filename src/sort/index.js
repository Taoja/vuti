import './index.css'
import Sortable from '../../common/js/sortable.js'
/**
 * tCell表单块组件
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} title 标题
 * @prop {String} tips 描述文字
 * @prop {Object} icon 标题栏图标
 *  @property {String} name 图标class名
 *  @property {String} color 图标颜色
 * @prop {Boolean} isLink 是否可以点击 @default false
 * @emits click 当isLink为true事的点击事件
 * @example
 * <t-cell is-link title="标题标题" tip="说明文字/描述信息" :icon="{name: 'icon-QRcode',color: 'red'}">内容</t-cell>
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
    }
  },
  mounted() {
    this.list = [].concat(this.data)
    this.sort = new Sortable(this.$refs.vutiSort, {
      animation: 150,
      ghostClass: 'vuti-sort-bg',
      onEnd: this.end
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
