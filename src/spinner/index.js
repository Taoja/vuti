import iosSrc from '../../common/svg/ios.svg'
/**
 * spinner加载器
 * @author 黄武韬<346792184@qq.com>
 * @prop {String} type loading样式 @default ios
 * @example
 * <spinner type="ios"></spinner>
 */
const component = {
  props: {
    type: {
      type: String,
      default: 'ios'
    }
  },
  computed: {
    spinner() {
      return iosSrc
    }
  },
  template: `
    <img :src="spinner"/>
  `
}

export default component
