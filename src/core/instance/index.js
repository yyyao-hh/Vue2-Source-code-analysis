import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

/**
 * Vue 构造函数
 * @param {Object} options - Vue 的选项对象
 */
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) { // 如果不是通过 new关键字调用 Vue构造函数, 则发出警告
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // 带着配置项初始化实例
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
