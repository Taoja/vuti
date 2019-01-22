<p align="center">
  <img width=200 src="common/image/logo.png">
</p>
<p align="center">
  <a href="https://travis-ci.org/Taoja/vuti"><img src="https://travis-ci.org/Taoja/vuti.svg?branch=master" alt="autobuild"></a>
  <a href="https://npmcharts.com/compare/vuti?minimal=true"><img src="https://img.shields.io/npm/dm/vuti.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/vuti"><img src="https://img.shields.io/npm/v/vuti.svg" alt="Version"></a>
  <!-- <a href="https://github.com/taoja/vuti/releases"><img src="https://img.shields.io/github/release/taoja/vuti.svg" alt="Version"></a>
  <a href="https://github.com/taoja/vuti/issues"><img src="https://img.shields.io/github/issues/taoja/vuti.svg" alt="issues"></a> -->
  <a href="https://www.npmjs.com/package/vuti"><img src="https://img.shields.io/npm/l/vuti.svg" alt="License"></a>
  <a href="https://packagephobia.now.sh/result?p=vuti"><img src="https://packagephobia.now.sh/badge?p=vuti" alt="install size"></a>
  <a href="https://cdn.jsdelivr.net/npm/vuti@1/dist/vuti.min.js"><img src="https://data.jsdelivr.com/v1/package/npm/vuti/badge" alt="cdn"></a>
</p>
<p align="center">
  <img src="https://badgen.net/badge/platform/umd,browser/green?list=1" alt="platform">
</p>
vuti是一套基于vmin、var、calc等css3新特性的UI框架。通过变量复用、计算属性实现组件变量化。

## 特点

[![Greenkeeper badge](https://badges.greenkeeper.io/Taoja/vuti.svg)](https://greenkeeper.io/)

+ 高扩展性：通过修改css3全局变量，组件局部变量来达到变更主题风格。
+ 轻量：摒弃通过css扩展语言，组件主体使用标准js写法，减少代码编译成本。
+ 插件化：组件事件、参数上升，注册时可自定义组件事件与参数。
+ 风格统一：组件通过一套规范化、变量化属性组成。

## 使用

### umd用法

安装vuti依赖包
```bash
$ npm install vuti
```

在工程入口引入vuti或全局注册组件
```js
import Vue from 'vue'
import vuti from 'vuti'
import { plugins, tButton } from 'vuti'

/** 
 * 可使用插件模式调用组件
 */
Vue.use(plugins)

/** 
 * 全局注册组件
 */
Vue.component('tButton', tButton)

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

### browser用法

在页面入口引入js库
```html
// 引入vue
<script src="https://raw.githubusercontent.com/vuejs/vue/dev/dist/vue.min.js"></script>
// 引入vuti
<script src="https://cdn.jsdelivr.net/npm/vuti@1/dist/vuti.min.js"></script>
```

通过Vue注册公共组件来使用

```js
let {plugins, tCell, tButton, ...} = Vuti

Vue.use(plugins)

Vue.component('tCell', tCell)
Vue.component('tButton', tButton)
new Vue({
  ...
})
```
注册Vue局部组件

```js
let {tCell, tButton, ...} = Vuti
new Vue({
  components: {
    tCell,
    tButton
  },
  ...
})
```

## 文档与demo
使用文档请[访问](https://taoja.github.io/vuti), demo请[访问](https://taoja.github.io/vuti)

## Github
+ [源码](https://github.com/Taoja/vuti)
+ [issures](https://github.com/Taoja/vuti/issures)

