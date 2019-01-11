import './index.css'
/**
 * 导航栏组件tHeader
 * @author 黄武韬<346792184@qq.com>
 * @prop {Object} options 传入参数
 *  @property {Array} left 左侧按钮参数
 *    @member
 *    {
 *      type 按钮类型icon或text
 *      value 按钮类型的值
 *    }
 *    @default
 *    [{
 *      type: 'icon',
 *      value: 'icon-left'
 *    }]
 *  @property {String} title 标题文字
 *  @property {Array} right 右侧按钮参数
 *    @member
 *    {
 *      type 按钮类型icon或text
 *      value 按钮类型的值
 *    }
 * @emits click title点击事件
 * @emits leftClick 左侧按钮点击事件
 * @emits rightClick 右侧按钮点击事件
 * @example
 * <t-header @leftClick="function" @rightClick="function" @click="function" :options="options"></t-header>
 */
const component = {
  computed: {
    defaultLeft() {
      var defaultLeft = [
        {
          type: 'icon',
          value: 'icon-left'
        }
      ]
      return typeof this.options.left == 'object' ? this.options.left : defaultLeft
    }
  },
  props: {
    options: {
      type: Object,
      default() {
        return {
          left: [
            {
              type: 'icon',
              value: 'icon-left'
            }
          ],
          title: '',
          right: []
        }
      }
    }
  },
  data() {
    return {
      prevent: false
    }
  },
  methods: {
    click(target, index) {
      if (!this.prevent) {
        this.prevent = target + index
        setTimeout(function () {
          this.prevent = false
        }.bind(this), 200)
        if (target == 'title') {
          this.$emit('click')
        } else {
          this.$emit(`${target}Click`, index)
        }
      }
    }
  },
  template: `
    <div class="vuti vuti-header">
      <slot name="left">
        <div @click="click('left', index)" class="vuti-header-btns" v-for="(item, index) in defaultLeft">
          <div class="vuti-header-btn" :prevent="prevent == 'left' + index" v-if="item.type == 'icon'" :class="item.value"></div>
          <div class="vuti-header-btn" :prevent="prevent == 'left' + index" v-else-if="item.type == 'text'">{{item.value}}</div>
        </div>
      </slot>
      <slot>
        <div @click="click('title')" :prevent="prevent == 'titleundefined'" class="vuti-header-center">{{options.title}}</div>
      </slot>
      <div class="vuti-header-right">
        <slot name="right">
          <div @click="click('right', index)" class="vuti-header-btns" v-for="(item, index) in options.right">
            <div class="vuti-header-btn" :prevent="prevent == 'right' + index" v-if="item.type == 'icon'" :class="item.value"></div>
            <div class="vuti-header-btn" :prevent="prevent == 'right' + index" v-else-if="item.type == 'text'">{{item.value}}</div>
          </div>
        </slot>
      </div>
    </div>
  `
}

export default component
