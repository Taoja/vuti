<p align="center">
  <img width=200 src="common/image/logo.png">
</p>
<p align="center">
  <a href="https://npmcharts.com/compare/vuti?minimal=true"><img src="https://img.shields.io/npm/dm/vuti.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/vuti"><img src="https://img.shields.io/npm/v/vuti.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/vuti"><img src="https://img.shields.io/npm/l/vuti.svg" alt="License"></a>
</p>
vuti是一套基于vmin、var、calc等css3新特性的UI框架。通过变量复用、计算属性实现组件变量化。

## 特点
+ 高扩展性：通过修改css3全局变量，组件局部变量来达到变更主题风格。
+ 轻量：摒弃通过css扩展语言，组件主体使用标准js写法，减少代码编译成本。
+ 插件化：组件事件、参数上升，注册时可自定义组件事件与参数。
+ 风格统一：组件通过一套规范化、变量化属性组成。

## 安装

```bash
$ npm run install vuti --save
```

## 使用

在工程入口引入vuti
```js
import Vue from 'vue'
import vuti from 'vuti'
import { plugins } from 'vuti'

/** 
 * 可使用插件模式调用组件
 */
Vue.use(plugins)

/** 
 * vuti.set设置全局变量
 */
vuti.set({
  '--color-t1': 'red',
  ...
})
```

在页面引入vuti

```js
import { tCell, vPopup as tPopup } from 'vuti'

...,
  components: {
    tCell,
    vPopup
  },
...
```

## 文档与demo
使用文档请[访问](https://taoja.github.io/vuti), demo请[访问](https://taoja.github.io/vuti)

## Github
+ [源码](https://github.com/Taoja/vuti)
+ [issures](https://github.com/Taoja/vuti/issures)

