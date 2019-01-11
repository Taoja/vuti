import './index.css'
import tPopup from '../popup/index.js'
import tHeader from '../header/index.js'
import tPicker from '../picker/index.js'

/**
 * 日期选择器tDatepicker
 * @author 黄武韬<346792184@qq.com>
 * @prop {Boolean} value v-model 选择器开关
 * @prop {String} date 组件反显日期 格式要求 Y-M-D h:m:s
 * @prop {Boolean} tapHide 点击遮罩是否隐藏 @default true
 * @prop {Object} options 头部传参、参见头部组件
 * @prop {String} type 日期选择器类型 @default 'YMDhms'
 * @prop {String} startDate 开始日期格式要求 Y-M-D h:m:s @default '1900-05-01' 
 * @prop {String} endDate 结束日期格式要求 Y-M-D h:m:s @default '2050-12-31' 
 * @prop {Array} hours 支持小时列表 @default [1-23]
 * @prop {Array} minutes 支持分钟列表 @default [1-59]
 * @prop {Array} seconds 支持秒钟列表 @default [1-59]
 * @emits result 点击确认按钮回调 @argument {Object}
 * @emits hide 选择器关闭事件
 * @emits show 选择器打开事件
 * @emits afterShow 选择器打开动画完成事件
 */
const component = {
  data() {
    return {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tapHide: {
      type: Boolean,
      default: true
    },
    options: {
      type: Object,
      default() {
        return {
          title: '日期选择器',
          left: [
            {
              type: 'text',
              value: '取消'
            }
          ],
          right: [
            {
              type: 'text',
              value: '确认'
            }
          ]
        }
      }
    },
    type: {
      type: String,
      default: 'YMDhms'
    },
    startDate: {
      type: String,
      default: '1900-05-05'
    },
    endDate: {
      type: String,
      default: '2050-12-31',
      required: true
    },
    date: {
      type: String,
      default: '1991-03-03'
    },
    hours: {
      type: Array,
      default() {
        var i = 0,arr=[]
        while(i <= 23) {
          arr.push(i)
          i++
        }
        return arr
      }
    },
    minutes: {
      type: Array,
      default() {
        var i = 0,arr=[]
        while(i <= 59) {
          arr.push(i)
          i++
        }
        return arr
      }
    },
    seconds: {
      type: Array,
      default() {
        var i = 0,arr=[]
        while(i <= 59) {
          arr.push(i)
          i++
        }
        return arr
      }
    }
  },
  computed: {
    hasYear() {
      return this.type.includes('Y')
    },
    hasMonth() {
      return this.type.includes('M')
    },
    hasDay() {
      return this.type.includes('D')
    },
    hasHour() {
      return this.type.includes('h')
    },
    hasMinute() {
      return this.type.includes('m')
    },
    hasSecond() {
      return this.type.includes('s')
    },
    years() {
      var min = this.startDate.split('-')[0]*1
      var max = this.endDate.split('-')[0]*1
      var arr = []
      while(min <= max) {
        arr.push(min)
        min++
      }
      return arr
    },
    months() {
      var min = 1
      var max = 12
      if (this.year == 0) {
        min = this.startDate.split('-')[1] * 1
      }
      if (this.year == this.years.length - 1) {
        max = this.endDate.split('-')[1] * 1
      }
      var arr = []
      while(min <= max) {
        arr.push(min)
        min++
      }
      this.month = 0
      return arr
    },
    maxDay() {
      var d = new Date(this.years[this.year],this.months[this.month],0)
      return d.getDate()
    },
    days() {
      var min = 1
      var max = this.maxDay
      if (this.year == 0 && this.month == 0) {
        min = this.startDate.split('-')[2] * 1
      }
      if (this.year == this.years.length - 1 && this.month == this.months.length - 1) {
        var setMax = this.endDate.split('-')[2] * 1
        max = setMax >= max ? max : setMax
      }
      var arr = []
      while(min <= max) {
        arr.push(min)
        min++
      }
      this.day = 0
      return arr
    }
  },
  components: {
    tPopup,
    tHeader,
    tPicker
  },
  methods: {
    hide() {
      this.$emit('hide')
    },
    afterHide() {
      this.$emit('afterHide')
    },
    show() {
      this._setClear()
      this.$emit('show')
    },
    _setClear() {
      this.year = 0
      this.month = 0
      this.day = 0
      this.hour = 0
      this.minute = 0
      this.second = 0
    },
    afterShow() {
      this.$emit('afterShow')
      if ((new Date(this.date)) < (new Date(this.startDate))) {
        this.date = this.startDate
      } else if ((new Date(this.date)) > (new Date(this.endDate))) {
        this.date = this.endDate
      }
      var defaultDate = new Date(this.date)
      var year = defaultDate.getFullYear()
      var month = defaultDate.getMonth() + 1
      var day = defaultDate.getDate()
      var hour = defaultDate.getHours()
      var minute = defaultDate.getMinutes()
      var second = defaultDate.getSeconds()
      this._scroll('year', year)
      this._scroll('month', month)
      this._scroll('day', day)
      this._scroll('hour', hour)
      this._scroll('minute', minute)
      this._scroll('second', second)
    },
    _scroll(str, val) {
      this[str] = this[str + 's'].indexOf(this[str + 's'].find(function (e) {
        return e == val
      }))
    },
    result(e, choice) {
      var index = e[0]
      this[choice] = index
    },
    submit() {
      this.$emit('result', {
        year: this.hasYear ? this.years[this.year] : '',
        month: this.hasMonth ? this.months[this.month] : '',
        day: this.hasDay ? this.days[this.day] : '',
        hour: this.hasHour ? this.hours[this.hour] : '',
        minute: this.hasMinute ? this.minutes[this.minute] : '',
        second: this.hasSecond ? this.seconds[this.second] : '',
      })
      this.close()
    },
    close() {
      this.$emit('input', false)
      this.hide()
    },
    maskClick() {
      if (this.tapHide) {
        this.close()
      }
    }
  },
  template: `
    <t-popup
      :visibility="value"
      @maskClick="maskClick"
      @afterHide="afterHide"
      @show="show"
      @afterShow="afterShow"
      autoHeight
    >
      <t-header :options="options" @leftClick="close" @rightClick="submit"></t-header>
      <div class="vuti-datepicker-main vuti">
        <t-picker v-if="hasYear" v-model="year" :list="years" unit="年"></t-picker>
        <t-picker v-if="hasMonth" v-model="month" :list="months" unit="月"></t-picker>
        <t-picker v-if="hasDay" v-model="day" :list="days" unit="日"></t-picker>
        <t-picker v-if="hasHour" v-model="hour" :list="hours" unit="时"></t-picker>
        <t-picker v-if="hasMinute" v-model="minute" :list="minutes" unit="分"></t-picker>
        <t-picker v-if="hasSecond" v-model="second" :list="seconds" unit="秒"></t-picker>
      </div>
    </t-popup>
  `
}
/**
 * 日期选择器tDatepicker（plugin用法）
 * @author 黄武韬<346792184@qq.com>
 * @param {String} date 组件反显日期 格式要求 Y-M-D h:m:s
 * @param {Boolean} tapHide 点击遮罩是否隐藏 @default true
 * @param {Object} options 头部传参、参见头部组件
 * @param {String} type 日期选择器类型 @default 'YMDhms'
 * @param {String} startDate 开始日期格式要求 Y-M-D h:m:s @default '1900-05-01' 
 * @param {String} endDate 结束日期格式要求 Y-M-D h:m:s @default '2050-12-31' 
 * @param {Array} hours 支持小时列表 @default [1-23]
 * @param {Array} minutes 支持分钟列表 @default [1-59]
 * @param {Array} seconds 支持秒钟列表 @default [1-59]
 * @return {Promise.resolve} 选中日期json
 * @example
 * this.$datepicker({
     type: 'YMDhms',
     startDate: '2008-05-01',
     endDate: '2021-11-11 11:11:11',
     date: '2018-05-01'
   }).then(function(e) {
     console.log(e)
   })
 */
const install = function(Vue) {
  var ext = Vue.extend(component)
  Vue.prototype.$datepicker = function(options) {
    return new Promise(function(resolve, reject) {
      var vm = (new ext({
        propsData: options
      })).$mount()
      vm.value = true
      vm.close = function () {
        vm.value = false
      }
      vm.afterHide = function() {
        vm.$destroy(true)
        document.body.removeChild(vm.$el)
      }
      vm.submit = function() {
        vm.value = false
        resolve({
          year: vm.hasYear ? vm.years[vm.year] : '',
          month: vm.hasMonth ? vm.months[vm.month] : '',
          day: vm.hasDay ? vm.days[vm.day] : '',
          hour: vm.hasHour ? vm.hours[vm.hour] : '',
          minute: vm.hasMinute ? vm.minutes[vm.minute] : '',
          second: vm.hasSecond ? vm.seconds[vm.second] : '',
        })
      }
      document.body.appendChild(vm.$el)
    })
  }
}

export {
  install
}
export default component
