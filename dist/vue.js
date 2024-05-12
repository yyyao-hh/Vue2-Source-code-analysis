/*!
 * yyyao
 * Vue.js v2.6.14
 * (c) 2014-2021 Evan You
 * Released under the MIT License.
 */
(function (global, factory) { // 将Vue.js的API暴露给不同环境
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : // 检查是否是CommonJS模块化
  typeof define === 'function' && define.amd ? define(factory) : // 检测是否使用AMD模块化
  (global = global || self, global.Vue = factory()); // 检查全局变量
}(this, function () {

  'use strict'; // 严格模式

  var emptyObject = Object.freeze({}); // 冻结的对象无法修改

  function isUndef (v) { // 判断值是否未定义或为null
    return v === undefined || v === null
  }

  function isDef (v) { // 判断值是否定义
    return v !== undefined && v !== null
  }

  function isTrue (v) { // 判断值是否为true
    return v === true
  }

  function isFalse (v) { // 判断值是否为false
    return v === false
  }

  function isPrimitive (value) { // 检查值是否为基本类型
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  function isObject (obj) { // 判断值是否为对象 (例: 数组也为对象)
    return obj !== null && typeof obj === 'object'
  }

  var _toString = Object.prototype.toString; // 获取值的原始类型字符串

  function toRawType (value) { // 获取值类型 (例: 'Bob' => [object String] => String)
    return _toString.call(value).slice(8, -1) // slice: 切割引用类型得到后面的基本类型
  }

  function isPlainObject (obj) { // 判断值是否是普通对象 (例: [object Object])
    return _toString.call(obj) === '[object Object]'
  }

  function isRegExp (v) { // 判断值是否为正则
    return _toString.call(v) === '[object RegExp]'
  }

  function isValidArrayIndex (val) { // 判断值是否为一个有效数组索引 (非负, 非无穷大， 非NAN)
    var n = parseFloat(String(val)); // 将值转化为字符串, 再通过parseFloat解析并返回一个浮点数
    // isFinite: 参数是NaN, 正无穷大或者负无穷大, 返回false
    // Math.floor: 总是返回小于等于一个给定数字的最大整数
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }

  /**
   * 判断值是否为Promise (但是未检测构造函数是否为Promise, 可用以下方法判断)
   * 1. Object.prototype.toString.call(val) === '[object Promise]'
   * 2. val instanceof Promise
   */
  function isPromise (val) {
    return (
      isDef(val) &&
      typeof val.then === 'function' && // 拥有then函数
      typeof val.catch === 'function'   // 拥有catch函数
    )
  }

  function toString (val) { // 将值转化为字符串
    return val == null
      ? '' // null返回空字符串
      : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString) // 数组, 普通对象使用JSON.stringify方法转化为字符串
        ? JSON.stringify(val, null, 2)
        : String(val) // 基本类型使用String方法转化为字符串
  }

  function toNumber (val) { // 将值转化为数字 (转化失败则返回原字符串)
    var n = parseFloat(val); // parseFloat: 解析字符串并返回浮点数
    return isNaN(n) ? val : n
  }

  /**
   * 返回一个函数: 用于判断值是否在字符串分割构建出的对象中(区分大小写)
   * @param {String} str - 用于构建分割的字符串
   * @param {Boolean} expectsLowerCase - 字符是否区分大小写
   * @returns {Function} 用于判断的函数
   */
  function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null); // 创建一个空对象
    var list = str.split(','); // 通过 ',' 字符分割
    for (var i = 0; i < list.length; i++) { // 将每一项的值作为键名, 键值为true
      map[list[i]] = true;
    }
    return expectsLowerCase // 返回函数: 用于判断值是否在对象中
      ? function (val) { return map[val.toLowerCase()]; } // 判断全小写的值是否在对象中
      : function (val) { return map[val]; } // 判断值是否在对象中
  }

  var isBuiltInTag = makeMap('slot,component', true); // 检测是否为内置标签 (slot, component标签)

  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is'); // 检测是否为保留属性 (key, ref, slot, slot-scope, is属性)

  /**
   * 数组移除元素的方法
   * @param {Array} arr - 被删除元素的数组
   * @param {*} item - 需要删除的元素
   * @returns {Array} 被删除元素的数组
   */
  function remove (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item); // 元素是否存在
      if (index > -1) {
        return arr.splice(index, 1) // 删除元素
      }
    }
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty; // 判断对象是否含有某个属性
  /**
   * 判断对象是否含有某个属性
   * @param {Object} obj - 对象
   * @param {String} key - 判断存在的属性
   * @returns {Boolean}
   */
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  function cached (fn) { // 创建带缓存的函数 (使用闭包对函数运行结果进行缓存)
    var cache = Object.create(null); // 存放缓存值
    return (function cachedFn (str) {
      var hit = cache[str]; // 获取缓存值
      return hit || (cache[str] = fn(str)) // 如果缓存值存在,直接返回; 不存在调用fn,然后将结果存放到缓存对象中
    })
  }

  var camelizeRE = /-(\w)/g; // 表示匹配任何连字符 '-' 后面跟着一个或多个字符的序列
  var camelize = cached(function (str) { // 将横线命名的字符串转换为驼峰命名
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  var capitalize = cached(function (str) { // 将字符串首字母大写 (帕斯卡命名法)
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  var hyphenateRE = /\B([A-Z])/g; // 匹配非单词边界的大写字母
  var hyphenate = cached(function (str) { // 将驼峰命名的字符串转换为横线命名
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * 兼容操作实现的bind方法
   * @param {Function} fn - 需要改变this指向的函数
   * @param {*} ctx - 新的this指向
   * @returns {Function} 改变this指向后的新函数
   */
  function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length; // 参数个数
      return l
        ? l > 1
          ? fn.apply(ctx, arguments) // 调用apply函数改变this指向
          : fn.call(ctx, a) // 调用call函数改变this指向
        : fn.call(ctx)
    }

    boundFn._length = fn.length; // 保留原始函数的length属性(fn.length: 形参的个数)
    return boundFn
  }

  /**
   * 原生bind方法
   * @param {Function} fn - 需要改变this指向的函数
   * @param {*} ctx - 新的this指向
   * @returns {Function} 改变this指向后的新函数
   */
  function nativeBind (fn, ctx) {
    return fn.bind(ctx) // 调用原生bind方法
  }

  var bind = Function.prototype.bind // 不同环境对bind方法实现兼容
    ? nativeBind // 原生bind
    : polyfillBind; // 兼容环境实现bind
  
  /**
   * 将类数组转化为数组
   * @param {Array-like} list - 类数组
   * @param {Number} start - 开始转化的位置索引
   * @returns {Array} 数组
   */
  function toArray (list, start) {
    start = start || 0; // 转化的起始位置
    var i = list.length - start;
    var ret = new Array(i); // 创建数组
    while (i--) {
      ret[i] = list[i + start]; // 给数组每一项赋值
    }
    return ret
  }

  /**
   * 将源对象中的属性合并到目标对象 (浅拷贝)
   * @param {Object} to - 目标对象
   * @param {Object} _from - 源对象
   * @returns {Object} 目标对象
   */
  function extend (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  function toObject (arr) { // 将对象数组合并为一个对象
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]); // 将数组中每个对象的属性覆盖到res对象
      }
    }
    return res
  }

  function noop (a, b, c) {} // 不执行任何操作

  var no = function (a, b, c) { return false; }; // 任何情况都返回false

  var identity = function (_) { return _; }; // 返回参数本身

  /**
   * 从编译器模块生成包含静态键的字符串 (将modules中的每个模块的staticKeys属性合并成一个由逗号分隔的字符串)
   * @param {Array} modules - 例: [{ staticKeys: ["staticClass"] }, { staticKeys: ["staticStyle"] }]
   * @returns {String} 例: "staticClass,staticStyle"
   */
  function genStaticKeys (modules) {
    return modules.reduce(function (keys, m) {
      return keys.concat(m.staticKeys || []) // 将静态键合并成一个数组
    }, []).join(',') // 将数组中的静态键合并成字符串
  }

  function looseEqual (a, b) { // 简单比较两个值是否相等
    if (a === b) { return true } // 两个值相等返回true
    var isObjectA = isObject(a); // 判断值是否为对象
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) { // 值都为对象
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) { // 值都为数组, 比较数组长度以及递归地比较数组中的每个元素
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i]) // 递归地比较数组中的每个元素
          })
        } else if (a instanceof Date && b instanceof Date) { // 值都为Date对象, 比较时间的格林威治时间数值
          return a.getTime() === b.getTime() // getTime: 返回1970/1/1午夜到指定日期之间的毫秒数
        } else if (!isArrayA && !isArrayB) { // 值都为非数组的对象, 比较属性个数以及递归地比较对象中的每个元素
          var keysA = Object.keys(a); // 得到对象属性名组成的数组
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key]) // 递归地比较对象中的每个元素
          })
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    } else if (!isObjectA && !isObjectB) { // 值都不为对象, 转化为字符串进行比较
      return String(a) === String(b)
    } else {
      return false
    }
  }

  /**
   * 返回值在数组中的位置, 没找到返回-1
   * @param {Array} arr - 数组
   * @param {*} val - 判断的值
   * @returns {Number} 索引
   */
  function looseIndexOf (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) { return i } // looseEqual: 比较两个值是否相等
    }
    return -1
  }

  function once (fn) { // 确保函数函数只调用一次 (使用闭包缓存变量控制执行)
    var called = false; // 控制执行的变量
    return function () {
      if (!called) { // 执行过一次后called的值就变为true, 不会再执行函数
        called = true;
        fn.apply(this, arguments); // 执行函数
      }
    }
  }

  var SSR_ATTR = 'data-server-rendered'; // 是否是服务端渲染的标识

  var ASSET_TYPES = [ // 全局API
    'component', // 自定义组件
    'directive', // 自定义指令
    'filter' // 自定义过滤器
  ];

  var LIFECYCLE_HOOKS = [ // 生命周期
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured',
    'serverPrefetch'
  ];

  var config = ({ // 全局配置TODO

    optionMergeStrategies: Object.create(null), // Vue中选项合并策略 (主要用于mixin, Vue.extend())

    silent: false, // 控制台是否打印提示和警告

    productionTip: "development" !== 'production', // 启动时是否显示生产模式的提示消息

    devtools: "development" !== 'production', // 是否允许vue-devtools检查代码

    performance: false, // 是否记录性能 (在浏览器Performance面板中启用对组件初始化、编译、渲染和打补丁的性能追踪)

    /**
     * Error handler for watcher errors
     */
    errorHandler: null, // 指定组件的渲染和观察期间未捕获错误的处理函数。这个处理函数被调用时，可获取错误信息和 Vue 实例

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,

    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Custom user key aliases for v-on
     */
    keyCodes: Object.create(null),

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * Perform updates asynchronously. Intended to be used by Vue Test Utils
     * This will significantly reduce performance if set to false.
     */
    async: true,

    _lifecycleHooks: LIFECYCLE_HOOKS // 生命周期
  });

  // 用于解析html标记、组件名称和属性路径的unicode字母
  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

  function isReserved (str) { // 检查字符串是否以'$'或'_'开头
    var c = (str + '').charCodeAt(0); // 获取首字符 (不是字符串先转化为字符串)
    return c === 0x24 || c === 0x5F
  }

  /**
   * 在对象上定义属性
   * @param {Object} obj - 对象
   * @param {String} key - 属性名
   * @param {*} val - 属性值
   * @param {Boolean} enumerable - 是否可枚举
   */
  function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true, // 是否能修改属性的值
      configurable: true // false: 不能通过delete删除属性、不能更改其描述符的其他属性、该属性的类型不能在数据属性和访问器属性之间更改
    });
  }

  var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]")); // 匹配一些认为是异常值的符号
  /**
   * 解析路径字符串并返回一个函数用于获取路径对应的属性值 (用于watch监听)
   * @param {String} path - 路径字符串
   * @returns {Function} 用于取值的函数 
   */
  function parsePath (path) {
    if (bailRE.test(path)) { // 边界处理 (防止传入异常值, 例: '~', '/', '*')
      return
    }
    var segments = path.split('.'); // 解析路径字符串 解析过程例: "person.name" =>  ["person", "name"]
    return function (obj) { // 返回一个用于取值的函数 例: 相当于值为this.person.name
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]]; // 递归深层取值
      }
      return obj
    }
  }

  var hasProto = '__proto__' in {}; // 当前浏览器是否支持'__proto__'

  var inBrowser = typeof window !== 'undefined'; // 是否是浏览器环境
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform; // 是否是weex环境
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase(); // 获取到weex平台信息
  var UA = inBrowser && window.navigator.userAgent.toLowerCase(); // 获取到浏览器信息
  var isIE = UA && /msie|trident/.test(UA); // 是否是IE浏览器
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0; // 是否是IE9浏览器
  var isEdge = UA && UA.indexOf('edge/') > 0; // 是否是Edge浏览器
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android'); // 是否是安卓环境
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios'); // 是否是IOS环境
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge; // 是否是Chrome浏览器
  var isPhantomJS = UA && /phantomjs/.test(UA); // 是否是PhantomJS (提供一个浏览器环境的命令行接口)
  var isFF = UA && UA.match(/firefox\/(\d+)/); // 是否是火狐浏览器

  var nativeWatch = ({}).watch; // 火狐浏览器原生Object.prototype.watch方法 (用于初始化watch监听的判断, 非火狐原生watch方法则继续初始化watch监听, 防止冲突)

  /* 判断当前浏览器环境下的addEventListener方法是否支持参数的passive属性 */
  var supportsPassive = false;
  if (inBrowser) { // 浏览器环境
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () { // 通过触发opts对象的passive属性来证明addEventListener是否支持参数的passive属性
          supportsPassive = true;
        }
      }));
      // 当addEventListener第三个参数一般为Boolean, 当为对象时候,会读取其中的属性 (包括passive属性)
      // 当浏览器支持参数的passive属性, 就会读取passive属性从而触发opts对象的get方法
      // 当浏览器不支持, 则不会触发
      window.addEventListener('test-passive', null, opts);
    } catch (e) {}
  }

  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer;
  /**
   * 判断是否是服务端渲染 (SSR)
   * @returns {Boolean} 是否是服务端渲染
   */
  var isServerRendering = function () { // TODO
    if (_isServer === undefined) {
      // 标记非微信环境, 非浏览器环境, node环境下, 根据Vue的环境变量判断是否是ssr
      if (!inBrowser && !inWeex && typeof global !== 'undefined') {
        _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer = false;
      }
    }
    return _isServer
  };

  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__; // 检测是否开发工具环境

  function isNative (Ctor) { // 判断是否是JavaScript内置方法
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol = // 检测当前环境是否支持原生symbol, Reflect.ownKeys
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys); // Reflect.ownKeys: 返回一个由目标对象自身的属性键组成的数组

  var _Set;
  /* 检测当前环境是否支持Set方法, 支持就使用原生Set, 反之则使用一个非标准的Setpolyfill */
  if (typeof Set !== 'undefined' && isNative(Set)) { // 使用原生Set
    _Set = Set;
  } else { // 兼容环境实现Set (仅适用于原始键)
    _Set = /*@__PURE__*/(function () {
      function Set () { // 创建一个Set对象
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) { // 检查Set对象中是否存在某个键
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) { // 将某个键添加到Set对象中
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () { // 清空Set对象
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  var warn = noop; // noop: 不执行任何操作 (主要在调试中使用, 生产环境不执行任何操作)
  var tip = noop;
  var generateComponentTrace = (noop);
  var formatComponentName = (noop);

  if ("development" !== 'production') { // 开发环境下打开检测、警告等非必要的提示
    var hasConsole = typeof console !== 'undefined'; // 是否支持控制台打印功能
    var classifyRE = /(?:^|[-_])(\w)/g; // 此正则表达式有三个捕获组: 1.匹配单词首字母; 2.匹配连字符'-'或下划线'_'; 3.匹配其他字符

    /* 将字符的首字母以及连字符'-'和下划线'_'后的字母转为大写并删除'-'和'_' (用于组件名转化: 'ab_cd-ef' => 'AbCdEf') */
    var classify = function (str) { return str
      .replace(classifyRE, function (c) { return c.toUpperCase(); }) // 将匹配到的字母转为大写 (首字母以及'-'和'_'后的字母)
      .replace(/[-_]/g, ''); }; // 删除'-'和'_'

    /**
     * 控制台警告
     * @param {String} msg - 警告信息
     * @param {Vue|VueComponent} vm - 组件实例
     */
    warn = function (msg, vm) {
      var trace = vm ? generateComponentTrace(vm) : ''; // 获取组件完整路径 (例: <Card><Demo><Root>)

      if (config.warnHandler) { // 用户自定义的警告提示函数
        config.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole && (!config.silent)) { // 支持控制台且允许执行打印操作
        console.error(("[Vue warn]: " + msg + trace));
      }
    };

    /**
     * 控制台提示
     * @param {String} msg - 提示信息
     * @param {Vue|VueComponent} vm - 组件实例 
     */
    tip = function (msg, vm) {
      if (hasConsole && (!config.silent)) { // 支持控制台且允许执行打印操作
        console.warn("[Vue tip]: " + msg + (
          vm ? generateComponentTrace(vm) : '' // generateComponentTrace: 获取组件完整路径 (例: <Card><Demo><Root>)
        ));
      }
    };

    /**
     * 获取'组件名 + 组件的文件路径'
     * @param {Vue|VueComponent} vm - 组件实例
     * @param {Boolean} includeFile - 是否打印组件的文件路径
     * @returns {String}
     */
    formatComponentName = function (vm, includeFile) {
      if (vm.$root === vm) { // 为根组件时, 直接返回为'<Root>'
        return '<Root>'
      }
      var options = typeof vm === 'function' && vm.cid != null // 获取组件选项
        ? vm.options
        : vm._isVue
          ? vm.$options || vm.constructor.options
          : vm;
      var name = options.name || options._componentTag; // 组件名
      var file = options.__file; // 组件的文件路径
      if (!name && file) { // name不存在则使用文件名
        var match = file.match(/([^/\\]+)\.vue$/); // 得到两个捕获组 ['xx.vue', 'xx']
        name = match && match[1]; // 得到文件名
      }

      return (
        (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") + // classify: 将组件名改为大驼峰
        (file && includeFile !== false ? (" at " + file) : '') // includeFile: 是否打印组件的文件地址 (由vue-loader注入到组件的__file属性上/猜的)
      )
    };

    /**
     * 将一个字符串重复指定的次数 (利用二进制表示中数字的性质, 通过位运算来判断重复的次数, 循环次数从n次优化到log2(n)次)
     * @param {String} str - 需要重复的字符串
     * @param {Number} n - 重复的次数
     * @returns {String}
     */
    var repeat = function (str, n) { // TODO
      var res = '';
      while (n) {
        if (n % 2 === 1) { res += str; } // 检查n的最低位(二进制表示的最后一位即n除以2的余数), 如果为1, 则将str添加到result中
        if (n > 1) { str += str; } // n大于1, 则将str自身加倍, 以便在下一次迭代中使用
        n >>= 1; // 将n向右移动一位(相当于除以2)
      }
      return res
    };

    /**
     * 拼接组件完整路径信息返回 (例: <Card><Demo><Root>)
     * @param {Vue|VueComponent} vm - 组件实例
     * @returns {String} 
     */
    generateComponentTrace = function (vm) {
      if (vm._isVue && vm.$parent) { // 判断是否为根组件
        var tree = []; // 记录组件路径的数组
        var currentRecursiveSequence = 0; // 记录组件递归调用次数
        while (vm) { // 不断向上寻找组件的父组件拼接完整路径
          if (tree.length > 0) {
            var last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) { // 判断是否是同一类型组件 (组件是否在递归调用)
              currentRecursiveSequence++; // 递归次数加一
              vm = vm.$parent; // 父组件
              continue
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence]; // 递归的组件会记录递归调用的次数
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return '\n\nfound in\n\n' + tree // 拼接组件完整路径信息
          .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
              ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)") // 记录递归的组件递归调用的次数
              : formatComponentName(vm))); })
          .join('\n')
      } else {
        return ("\n\n(found in " + (formatComponentName(vm)) + ")") // 仅有根组件则处理对应组件名返回
      }
    };
  }

  var uid = 0; // Dep 实例的唯一标识

  var Dep = function Dep () { // 用于收集数据的相关依赖项 (Dep是一个可观察对象, 用于管理依赖项和订阅者之间的关系)
    this.id = uid++; // 唯一标识
    this.subs = []; // 存储依赖于当前 Dep实例的所有订阅者(Watcher)的数组
  };

  Dep.prototype.addSub = function addSub (sub) { // 添加订阅者
    this.subs.push(sub); // 向订阅者数组(subs)中添加订阅者(Watcher)
  };

  Dep.prototype.removeSub = function removeSub (sub) { // 移除订阅者
    remove(this.subs, sub); // 从订阅者数组(subs)中移除订阅者(Watcher)
  };

  Dep.prototype.depend = function depend () { // 订阅者的依赖收集
    if (Dep.target) { // 如果当前渲染Watcher(即Dep.target)存在, 则将当前 Dep实例添加到其依赖列表中
      Dep.target.addDep(this); // 触发订阅者的依赖收集 (即Watcher.prototype.addDep方法)
    }
  };

  Dep.prototype.notify = function notify () { // 派发更新: 通知所有订阅者(也称为观察者)更新
    var subs = this.subs.slice(); // 订阅者列表
    if (!config.async) { // 如果不是异步模式, 则对订阅者列表排序
      subs.sort(function (a, b) { return a.id - b.id; }); // 进行排序, 确保它们按照正确的顺序触发更新
    }
    for (var i = 0, l = subs.length; i < l; i++) { // 遍历所有订阅者, 触发它们的更新方法
      subs[i].update(); // 触发订阅者的更新 (即Watcher.prototype.update方法)
    }
  };

  Dep.target = null; // 用于存储当前正在评估的目标 Watcher (全局唯一, 因为一次只能评估一个 Watcher)
  var targetStack = []; // 用于存储 Watcher 的堆栈信息 (可能会出现嵌套的 Watcher 执行过程, 为了确保 Watcher 的执行顺序正确)
  
  function pushTarget (target) { // 将目标 Watcher 推入堆栈中, 并设置 Dep.target为当前目标 Watcher
    targetStack.push(target); // 将目标 Watcher 推入堆栈
    Dep.target = target; // 将目标 Watcher挂载到 Dep的静态属性上
  }

  function popTarget () { // 从堆栈中弹出目标 Watcher, 并设置 Dep.target为上一个目标 Watcher
    targetStack.pop(); // 从堆栈中弹出目标 Watcher
    Dep.target = targetStack[targetStack.length - 1]; // 设置 Dep.target为上一个目标 Watcher
  }
  
  /**
   * 虚拟节点 (表示虚拟DOM树中的每个节点)
   * @param {String} tag - 标签名
   * @param {Object} data - 节点的数据 (包括属性、指令等信息)
   * @param {Array} children - 子节点数组
   * @param {String} text - 节点的文本内容
   * @param {HTMLElement} elm - 节点对应的真实DOM元素
   * @param {VueComponent} context - 节点的上下文环境 (即创建该节点的Vue实例)
   * @param {Object} componentOptions - 组件选项
   * @param {Function} asyncFactory - 异步组件工厂函数 (用于异步加载组件)
   */
  var VNode = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag; // 标签名
    this.data = data; // 节点数据
    this.children = children; // 子节点数组
    this.text = text; // 节点的文本内容
    this.elm = elm; // 节点对应的真实DOM元素
    this.ns = undefined; // 命名空间
    this.context = context; // 节点的上下文环境
    this.fnContext = undefined; // 函数式组件的上下文环境
    this.fnOptions = undefined; // 函数式组件的选项
    this.fnScopeId = undefined; // 函数式组件的作用域Id
    this.key = data && data.key; // 节点的唯一标识符 (用以优化Diff算法)
    this.componentOptions = componentOptions;// 组件选项
    this.componentInstance = undefined; // 节点对应的组件实例
    this.parent = undefined; // 父节点
    this.raw = false; // 是否为原始HTML内容 (innerHTML 时true, textContent 时为false)
    this.isStatic = false; // 是否是静态节点
    this.isRootInsert = true; // 是否是作为根节点插入
    this.isComment = false; // 是否是注释节点
    this.isCloned = false; // 是否是克隆节点 (通过 cloneVNode方法创建的节点为克隆节点)
    this.isOnce = false; // 是否只渲染一次
    this.asyncFactory = asyncFactory; // 异步组件工厂函数
    this.asyncMeta = undefined; // 异步组件元数据
    this.isAsyncPlaceholder = false; // 是否是异步组件占位符
  };
  var prototypeAccessors = { child: { configurable: true } }; // 定义配置对象 (configurable: 表示可以重新定义、修改或删除该属性)

  prototypeAccessors.child.get = function () { // 向后兼容的组件实例的别名
    return this.componentInstance
  };

  Object.defineProperties( VNode.prototype, prototypeAccessors ); // 允许通过 child属性访问 VNode上的组件实例

  var createEmptyVNode = function (text) { // 创建一个空节点/注释节点 (虚拟节点)
    if ( text === void 0 ) text = ''; // 注释内容

    var node = new VNode(); // 创建虚拟节点
    node.text = text; // 注释内容
    node.isComment = true; // 是否是注释节点
    return node
  };

  function createTextVNode (val) { // 创建一个文本节点 (虚拟节点)
    return new VNode(undefined, undefined, undefined, String(val)) // 创建虚拟节点
  }

  /**
   * 克隆虚拟节点
   * @param {VNode} vnode - 被克隆的虚拟节点
   * @returns {VNode}
   */
  function cloneVNode (vnode) {
    var cloned = new VNode( // 创建虚拟节点
      vnode.tag, // 标签名
      vnode.data, // 节点数据
      vnode.children && vnode.children.slice(), // 子节点数组
      vnode.text, // 节点的文本内容
      vnode.elm, // 节点对应的真实DOM元素
      vnode.context, // 节点的上下文环境
      vnode.componentOptions, // 组件选项
      vnode.asyncFactory // 异步组件工厂函数
    );
    cloned.ns = vnode.ns; // 命名空间
    cloned.isStatic = vnode.isStatic; // 是否是静态节点
    cloned.key = vnode.key; // 节点的唯一标识符 (用以优化Diff算法)
    cloned.isComment = vnode.isComment; // 是否是注释节点

    cloned.fnContext = vnode.fnContext; // 函数式组件的上下文环境
    cloned.fnOptions = vnode.fnOptions; // 函数式组件的选项
    cloned.fnScopeId = vnode.fnScopeId; // 函数式组件的作用域Id
    cloned.asyncMeta = vnode.asyncMeta; // 异步组件元数据

    cloned.isCloned = true; // 是否是克隆节点
    return cloned
  }

  // 用于重写数组的原生方法, 实现对数组的响应式监听和更新, 同时确保数组的原生方法不被破坏
  var arrayProto = Array.prototype; // 保存原生数组的原型对象, 以便后续引用原生数组方法
  var arrayMethods = Object.create(arrayProto); // 创建一个新的对象, 使其原型指向原生数组的原型对象

  var methodsToPatch = [ // 需要重写的数组方法
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  methodsToPatch.forEach(function (method) { // 用于拦截数组变异方法并触发更新
    var original = arrayProto[method]; // 缓存原始方法
    def(arrayMethods, method, function mutator () { // 使用 Object.defineProperty 将拦截方法定义到arrayMethods对象上
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ]; // 收集参数

      var result = original.apply(this, args); // 调用原始方法
      var ob = this.__ob__; // __ob__ 属性指向了一个 Observer 实例, 该实例负责监听当前对象的变化, 并进行相应的通知和处理
      var inserted; // 新插入元素
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); } // 如果有新插入的元素, 观测这些新元素
      ob.dep.notify(); // 通知依赖进行更新
      return result // 返回原始方法的执行结果
    });
  });

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods); // 数组需要增强的方法名集合

  var shouldObserve = true; // 标志, 用于表示是否应该启用响应式化 (全局变量)
  function toggleObserving (value) { // 用于在组件的更新计算中启用或禁用响应式化
    shouldObserve = value;
  }

  /**
   * 数据的观察者, 监听数据对象的读写操作, 以收集依赖项并分派更新
   * @param {Object|Array} value - 要观察的值。
   */
  var Observer = function Observer (value) {
    this.value = value; // 要观察的值
    this.dep = new Dep(); // 用于收集依赖项和分派更新的依赖项
    this.vmCount = 0; // 实例计数器 (用于避免将观察对象添加到 Vue 实例或其根数据对象 $data 中)
    def(value, '__ob__', this); // 将Observer实例绑定到数据的 __ob__ 属性上 (用于判断当前数据是否已经存在观察者)
    if (Array.isArray(value)) { // 对数组类型的数据进行处理
      if (hasProto) { // 如果支持原型链的原生数组方法, 则使用原型链方式增强数组
        protoAugment(value, arrayMethods);
      } else { // 否则，使用拷贝方式增强数组
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value); // 观察一个数组中的每一项
    } else { // 如果值是对象, 则遍历观察对象的每个属性
      this.walk(value); // 将对象的每个属性转化为响应式属性
    }
  };

  /**
   * 将对象的每个属性转化为响应式属性
   * @param {Object} obj - 要遍历的对象
   */
  Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) { // 遍历对象, 将其每个属性转换为响应式属性 (即为每个属性添加 getter 和 setter)
      defineReactive$$1(obj, keys[i]); // 将属性转化为响应式属性
    }
  };

  /**
   * 观察一个数组中的每一项
   * @param {Array} items - 要观察的数组
   */
  Observer.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) { // 遍历数组, 处理每一个数据的响应式
      observe(items[i]);
    }
  };

  /**
   * 通过使用 __proto__ 拦截原型链来增强目标数组
   * @param {Array} target - 要增强的数组
   * @param {Object} src - 源对象或数组, 用于拦截原型链 (数组变异方法)
   */
  function protoAugment (target, src) {
    target.__proto__ = src; // 将目标对象的原型链指向源对象或数组，以拦截原型链
  }

  /**
   * 用于将源对象中指定的属性复制到目标对象 (因为响应式, 增加数组变异方法)
   * @param {Object} target - 目标对象
   * @param {Object} src - 源对象 (数组变异方法)
   * @param {Array} keys - 要复制的属性名列表
   */
  function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]; // 属性名
      def(target, key, src[key]); // 在目标对象上定义属性
    }
  }

  /**
   * 观察一个值并将其转换为响应式对象
   * @param {Object|Array} value - 要观察的值
   * @param {Boolean} asRootData - 是否作为根数据进行观察
   * @returns {Observer}
   */
  function observe (value, asRootData) {
    if (!isObject(value) || value instanceof VNode) { // 如果值不是对象或值是虚拟节点, 则直接返回
      return
    }
    var ob; // 如果不存在 Observer实例则新建一个 Observer实例, 如果存在则直接返回现有实例
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) { // __ob__: 用于判断是否已经存在 Observer实例
      ob = value.__ob__;
    } else if (
      shouldObserve && // 启用响应式化
      !isServerRendering() && // 当前非服务器端渲染
      (Array.isArray(value) || isPlainObject(value)) && // 值是数组或者普通对象
      Object.isExtensible(value) && // 值是可扩展的
      !value._isVue // 值不是 Vue 实例
    ) {
      ob = new Observer(value); // 创建一个观察者对象
    }
    if (asRootData && ob) { // 存在观察者对象且数据为根数据, 则将观察者对象的 vmCount 属性加一
      ob.vmCount++;
    }
    return ob
  }

  /**
   * 给对象上添加一个响应式属性
   * @param {Object} obj - 需要定义响应式属性的对象
   * @param {string} key - 属性名
   * @param {Any} val - 属性的初始值
   * @param {Function} customSetter - 自定义 setter函数
   * @param {Boolean} shallow - 是否进行浅观察
   */
  function defineReactive$$1 (
    obj,
    key,
    val,
    customSetter,
    shallow
  ) {
    var dep = new Dep(); // 实例化依赖收集器

    var property = Object.getOwnPropertyDescriptor(obj, key); // 获取属性的描述符
    if (property && property.configurable === false) { // 如果属性定义不可配置, 则直接返回
      return
    }

    // 获取属性的原始 getter 和 setter
    var getter = property && property.get;
    var setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) { // 没有 getter 但存在 setter, 则从目标对象中获取属性的初始值
      val = obj[key];
    }

    var childOb = !shallow && observe(val); // 对属性值进行观测, 并返回其 Observer 对象
    Object.defineProperty(obj, key, {
      enumerable: true, // 可枚举
      configurable: true, // 可配置
      get: function reactiveGetter () { // getter
        var value = getter ? getter.call(obj) : val; // 调用 getter 获取属性值
        if (Dep.target) { // 如果存在正在进行依赖收集的 Watcher 对象, 则进行依赖收集
          dep.depend(); // 将当前 Watcher 对象添加到属性的依赖收集器中
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) { // 如果属性值为数组, 则进行数组元素的依赖收集
              dependArray(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) { // setter
        var value = getter ? getter.call(obj) : val; // 调用 getter 获取属性值
        if (newVal === value || (newVal !== newVal && value !== value)) { // 如果新值与旧值相同(或都为 NaN), 则直接返回
          return
        }
        if (customSetter) { // 执行自定义setter函数
          customSetter();
        }
        if (getter && !setter) { return } // 如果只有 getter 没有 setter, 则直接返回
        if (setter) { // 调用 setter 设置新值
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = !shallow && observe(newVal); // 对新值进行观察, 并更新 childOb 为新获取的 Observer 对象 (因为闭包属性, 每个属性会保留其对应的 Observer)
        dep.notify(); // 通知属性的依赖收集器进行更新
      }
    });
  }

  /**
   * 设置响应式对象的属性值 (Vue.$set)
   * @param {Object| Array} target - 要设置属性值的目标对象
   * @param {String|Number} key - 要设置的属性名或数组索引
   * @param {Any} val - 要设置的属性值
   * @returns {Any}
   */
  function set (target, key, val) {
    if (isUndef(target) || isPrimitive(target) // 如果目标对象是 undefined, null或原始值, 则发出警告
    ) {
      warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) { // 如果目标对象是数组, 并且数组索引有效, 则使用 splice方法设置属性值
      target.length = Math.max(target.length, key); // 确保数组能够容纳要设置的索引
      target.splice(key, 1, val);
      return val
    }
    if (key in target && !(key in Object.prototype)) { // 如果属性已经存在于目标对象中, 则直接设置属性值
      target[key] = val;
      return val
    }
    var ob = (target).__ob__; // 获取目标对象的 Observer实例
    if (target._isVue || (ob && ob.vmCount)) { // 如果目标对象是 Vue实例或根数据对象(vm.$data), 则发出警告
      warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      );
      return val
    }
    if (!ob) { // 如果目标对象不是响应式的, 则直接设置属性值
      target[key] = val;
      return val
    }
    defineReactive$$1(ob.value, key, val); // 将新的属性值添加到响应式对象中
    ob.dep.notify(); // 通知依赖更新
    return val
  }

  /**
   * 删除响应式对象的属性值 (Vue.$delete)
   * @param {Object|Array} target - 要删除属性值的目标对象
   * @param {String|Number} key - 要删除的属性名或数组索引
   */
  function del (target, key) {
    if (isUndef(target) || isPrimitive(target) // 如果目标对象是 undefined, null或原始值, 则发出警告
    ) {
      warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) { // 如果目标对象是数组, 并且数组索引有效, 则使用 splice方法删除属性值
      target.splice(key, 1);
      return
    }
    var ob = (target).__ob__; // 获取目标对象的 Observer实例
    if (target._isVue || (ob && ob.vmCount)) { // 如果目标对象是 Vue实例或根数据对象(vm.$data), 则发出警告
      warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      );
      return
    }
    if (!hasOwn(target, key)) { // 如果属性不存在于目标对象中, 则直接返回 (hasOwn: 判断对象自身是否有指定属性)
      return
    }
    delete target[key]; // 删除对象指定属性
    if (!ob) { // 目标对象没有 Observer实例, 不需要通知依赖, 则直接返回
      return
    }
    ob.dep.notify(); // 通知依赖更新
  }

  /**
   * 数组的依赖收集 (因为我们不能像属性 getters 那样拦截数组元素的访问)
   * @param {Array} value 
   */
  function dependArray (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) { // 遍历该数组去收集子元素的依赖
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend(); // 如果数组元素存在且具有 Observer实例, 则触发该数组元素的依赖收集
      if (Array.isArray(e)) { // 如果数组元素是数组, 则递归调用 dependArray, 继续收集依赖
        dependArray(e);
      }
    }
  }

  var strats = config.optionMergeStrategies; // 选项合并策略

  /**
   * el选项和 propsData选项的合并策略函数
   * @param {*} parent - 父级选项值
   * @param {*} child - 子级选项值
   * @param {Vue} vm - Vue实例
   * @param {String} key - 选项键名
   * @returns {*}
   */
  {
    strats.el = strats.propsData = function (parent, child, vm, key) {
      if (!vm) { // 如果没有传入 Vue实例
        warn( // 警告: 提示选项只能在使用`new`关键字创建实例时使用
          "option \"" + key + "\" can only be used during instance " +
          'creation with the `new` keyword.'
        );
      }
      return defaultStrat(parent, child) // 使用默认的合并策略合并父级和子级选项值
    };
  }

  /**
   * 数据对象的合并策略函数
   * @param {Object} to - 目标数据对象
   * @param {Object} from - 源数据对象
   * @returns {Object}
   */
  function mergeData (to, from) {
    if (!from) { return to } // 如果源数据对象为 null或未定义, 则返回目标数据对象
    var key, toVal, fromVal;

    var keys = hasSymbol // 获取源数据对象的键
      ? Reflect.ownKeys(from)
      : Object.keys(from);

    for (var i = 0; i < keys.length; i++) { // 遍历源数据对象中的每个键
      key = keys[i];
      if (key === '__ob__') { continue } // 如果键为 __ob__ 则跳过, 表示对象已经被观察
      toVal = to[key]; // 目标数据对象中当前键对应的值
      fromVal = from[key]; // 源数据对象中当前键对应的值
      if (!hasOwn(to, key)) { // 如果目标数据对象中没有当前键, 则将其设置为源数据对象中的值
        set(to, key, fromVal);
      } else if ( // 如果两个值都是对象且不严格相等, 则递归合并它们
        toVal !== fromVal &&
        isPlainObject(toVal) &&
        isPlainObject(fromVal)
      ) {
        mergeData(toVal, fromVal); // 递归合并
      }
    }
    return to
  }

  /**
   * 用于合并父级和子级的数据或函数
   * @param {Any} parentVal - 父级值
   * @param {Any} childVal - 子级值
   * @param {VueComponent} vm - 组件实例
   * @returns {Function}
   */
  function mergeDataOrFn (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) { // 如果没有传入组件实例
      // 在 Vue.extend合并中, 父级和子级应都是函数
      if (!childVal) { // 如果子级的值不存在, 返回父级的值
        return parentVal
      }
      if (!parentVal) { // 如果父级的值不存在, 返回子级的值
        return childVal
      }

      return function mergedDataFn () {
        return mergeData( // 返回合并后的结果
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else { // 如果传入组件实例
      return function mergedInstanceDataFn () {
        var instanceData = typeof childVal === 'function' // 调用子级函数获取子级数据
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function' // 调用父级函数获取父级数据
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) { // 如果子级数据存在, 则合并子级和父级数据并返回结果, 否则返回父级数据
          return mergeData(instanceData, defaultData) // 合并子级和父级数据, 并返回结果
        } else {
          return defaultData // 返回父级数据
        }
      }
    }
  }

  /**
   * data选项的合并策略函数
   * @param {Function} parentVal - 父级的值
   * @param {Function} childVal - 子级的值
   * @param {VueComponent} vm - 组件实例
   * @returns {Function}
   */
  strats.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') { // 如果子级的数据存在且不是函数类型, 则控制台输出警告
        warn( // 警告: data选项应该是一个函数
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        );

        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal) // 合并父级和子级的数据, 并返回结果
    }

    return mergeDataOrFn(parentVal, childVal, vm)  // 合并父级和子级的数据, 并返回结果
  };

  /**
   * 将钩子函数和属性合并为数组
   * @param {Array} parentVal - 父级的值
   * @param {Array} childVal - 子级的值
   * @returns {Array}
   */
  function mergeHook (
    parentVal,
    childVal
  ) {
    var res = childVal
      ? parentVal
        ? parentVal.concat(childVal) // 父级和子级都存在, 将它们合并为一个数组
        : Array.isArray(childVal) // 只有子级存在且子级是数组, 则直接使用子级数组
          ? childVal
          : [childVal] // 将子级包裹为数组
      : parentVal; // 只有父级存在, 则直接使用父级的值
    return res
      ? dedupeHooks(res) // 对合并后的数组进行去重操作
      : res
  }

  /**
   * 去重钩子函数数组
   * @param {Array} hooks - 包含钩子函数的数组
   * @returns {Array}
   */
  function dedupeHooks (hooks) {
    var res = []; // 存储去重后的钩子函数数组
    for (var i = 0; i < hooks.length; i++) { // 遍历钩子函数数组
      if (res.indexOf(hooks[i]) === -1) { // 检查当前钩子函数是否已经存在于结果数组中
        res.push(hooks[i]); // 如果不存在，则将其添加到结果数组中
      }
    }
    return res
  }

  LIFECYCLE_HOOKS.forEach(function (hook) { // 设置生命周期的合并策略函数
    strats[hook] = mergeHook;
  });

  /**
   * 将父组件的选项挂载到空对象原型上, 将子组件的选项合并到空对象上, 并返回
   * @param {Object} parentVal - 父组件的选项
   * @param {Object} childVal - 子组件的选项
   * @param {Object} vm - 实例的上下文对象(this)
   * @param {String} key - 选项的属性名 
   * @returns 
   */
  function mergeAssets (
    parentVal,
    childVal,
    vm,
    key
  ) {
    var res = Object.create(parentVal || null); // 将父组件的选项挂载到空对象原型上
    if (childVal) {
      assertObjectType(key, childVal, vm); // 对 childVal进行对象类型断言
      return extend(res, childVal) // 将 childVal对象的属性合并到 res对象上
    } else {
      return res
    }
  }

  ASSET_TYPES.forEach(function (type) { // 设置 component/directive/filter选项的合并规则
    strats[type + 's'] = mergeAssets;
  });


  /**
   * watch选项的合并策略函数
   * @param {Any} parentVal - 父级值
   * @param {Any} childVal - 子级值
   * @param {Vue} vm - Vue实例
   * @param {string} key - 属性名
   * @returns {Object}
   */
  strats.watch = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    // 解决Firefox的Object.prototype.watch的问题
    if (parentVal === nativeWatch) { parentVal = undefined; }
    if (childVal === nativeWatch) { childVal = undefined; }

    if (!childVal) { return Object.create(parentVal || null) } // 如果子级值不存在, 则返回以父级值为原型的新对象
    { // 断言子级值是否为普通对象
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal } // 如果父级值不存在, 则直接返回子级值
    var ret = {};
    extend(ret, parentVal); // 创建一个新对象并复制父级值的属性到其中
    for (var key$1 in childVal) { // 遍历子级值的每个属性, 进行合并 (观察者不应该相互覆盖, 所以我们将它们合并为数组)
      var parent = ret[key$1]; // 父级属性值
      var child = childVal[key$1]; // 子级属性值
      if (parent && !Array.isArray(parent)) { // 如果父级属性值已经存在且不是数组, 则转换为数组
        parent = [parent];
      }
      ret[key$1] = parent // 将父级属性值和子级属性值合并
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * props/methods/inject/computed选项的合并策略函数
   * @param {Any} parentVal - 父级值
   * @param {Any} childVal - 子级值
   * @param {Vue} vm - Vue实例
   * @param {string} key - 属性名
   * @returns {Object}
   */
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    if (childVal && "development" !== 'production') { // 如果子级值存在且当前非生产环境, 则断言子级值是一个对象
      assertObjectType(key, childVal, vm); // 断言值是否为普通对象
    }
    if (!parentVal) { return childVal } // 如果父级值不存在, 则直接返回子级值
    var ret = Object.create(null); // 创建一个新的对象
    extend(ret, parentVal); // 将父级值的属性扩展到新对象中
    if (childVal) { extend(ret, childVal); } // 如果子级值存在, 则也将子级值的属性扩展到新对象中
    return ret
  };
  strats.provide = mergeDataOrFn; // provide选项的合并策略函数

  /**
   * 默认的选项合并策略函数
   * @param {Any} parentVal - 父组件选项的值
   * @param {Any} childVal - 子组件选项的值
   * @returns {Any}
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined // 如果子组件选项未定义, 则返回父组件选项; 否则返回子组件选项
      ? parentVal
      : childVal
  };

  /**
   * 校验组件名称是否符合
   * @param {Object} options - 组件选项
   */
  function checkComponents (options) {
    for (var key in options.components) { // 校验局部注册组件的组件名
      validateComponentName(key); // 判断组件名是否符合规则
    }
  }

  function validateComponentName (name) { // 判断组件名是否符合规则
    if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) { // 判断组件名是否合法
      warn(
        'Invalid component name: "' + name + '". Component names ' +
        'should conform to valid custom element name in html5 specification.'
      );
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) { // isBuiltInTag: 检测是否为内置标签; isReservedTag: 是否是保留标签
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + name
      );
    }
  }

  /**
   * 将 props选项规范化为对象格式
   * 例: ['firstName'] => { firstName: { type: null } }
   * @param {Object} options - 组件选项
   * @param {Vue} vm - Vue实例 
   */
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) { return } // 未传入props, 则返回
    var res = {}; // 存放规范化后的props
    var i, val, name;
    if (Array.isArray(props)) { // 当props是(数组/Array)类型, 则数组元素应该为(字符/String)类型
      i = props.length;
      while (i--) {
        val = props[i]; // props项的属性名
        if (typeof val === 'string') { // props项为字符类型, 正确
          name = camelize(val); // 将横线命名的字符串转换为驼峰命名
          res[name] = { type: null }; // 将每个props对应的配置项统一为对象格式
        } else { // 不是字符类型则控制台抛出警告
          warn('props must be strings when using array syntax.');
        }
      }
    } else if (isPlainObject(props)) { // 当props是(对象/Object)类型
      for (var key in props) {
        val = props[key]; // props项对应的配置项
        name = camelize(key); // 将横线命名的字符串转换为驼峰命名
        res[name] = isPlainObject(val) // 将props项对应的配置项统一为对象格式 (isPlainObject: 判断是否为普通对象)
          ? val
          : { type: val }; // props项的配置项为字符类型则处理为对象格式
      }
    } else { // props既不是数组类型, 也不是对象类型, 则控制台抛出警告
      warn(
        "Invalid value for option \"props\": expected an Array or an Object, " +
        "but got " + (toRawType(props)) + ".", //  toRawType: 获取值类型
        vm
      );
    }
    options.props = res;
  }

  /**
   * 将(注入/inject)选项规范化为对象格式
   * @param {Object} options - 组件选项
   * @param {Vue} vm - Vue实例 
   */
  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) { return } // 未传入inject, 则返回
    var normalized = options.inject = {};
    if (Array.isArray(inject)) { // 当inject是(数组/Array)类型
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] }; // 处理为对象格式
      }
    } else if (isPlainObject(inject)) { // 当inject是(对象/Object)类型
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val) // 处理为对象格式 (isPlainObject: 判断是否为普通对象)
          ? extend({ from: key }, val) // 将属性合并到目标对象 (extend: 将属性合并到目标对象)
          : { from: val };
      }
    } else { // inject既不是数组类型, 也不是对象类型, 则控制台抛出警告
      warn(
        "Invalid value for option \"inject\": expected an Array or an Object, " +
        "but got " + (toRawType(inject)) + ".", //  toRawType: 获取值类型
        vm
      );
    }
  }

  /**
   * 将配置项为函数的(指令/directives)选项规范化为对象格式
   * @param {Object} options 
   */
  function normalizeDirectives (options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def$$1 = dirs[key]; // 指令对应的配置项
        if (typeof def$$1 === 'function') { // 当指令的配置项为函数 (规定此时函数为bind和update触发的行为)
          dirs[key] = { bind: def$$1, update: def$$1 }; // 处理为对象格式
        }
      }
    }
  }

  /**
   * 断言值是否为普通对象
   * @param {String} name - 选项的属性名
   * @param {Object} value - 选项的属性值
   * @param {Vue} vm - Vue实例
   */
  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) { // 选项的属性值不为普通对象则抛出警告 (isPlainObject: 判断是否为普通对象)
      warn(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType(value)) + ".", //  toRawType: 获取值类型
        vm
      );
    }
  }

  /**
   * 将两个选项对象合并成一个新对象
   * @param {Object} parent - 父组件选项对象
   * @param {Object|Function} child - 子组件选项对象或者子组件构造函数
   * @param {vue} vm - Vue 实例
   * @returns {Object}
   */
  function mergeOptions (
    parent,
    child,
    vm
  ) {
    {
      checkComponents(child); // 校验组件名称是否符合
    }

    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps(child, vm); // 将props选项规范化为对象格式
    normalizeInject(child, vm); // 将(注入/inject)选项规范化为对象格式
    normalizeDirectives(child); // 将配置项为函数的(指令/directives)选项规范化为对象格式

    if (!child._base) { // 对子组件的 extends 和 mixins 进行递归合并
      if (child.extends) { // 如果子组件有 extends 选项, 则递归合并 extends 选项
        parent = mergeOptions(parent, child.extends, vm);
      }
      if (child.mixins) { // 如果子组件有 mixins 选项, 则递归合并 mixins 选项
        for (var i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions(parent, child.mixins[i], vm);
        }
      }
    }

    var options = {}; // 合并后的选项
    var key;
    for (key in parent) { // 遍历父组件选项, 进行选项合并
      mergeField(key);
    }
    for (key in child) { // 遍历子组件选项, 进行选项合并 (仅合父组件中不存在的选项)
      if (!hasOwn(parent, key)) { // 父组件没有该选项
        mergeField(key);
      }
    }
    
    function mergeField (key) { // 用于对单个选项进行合并
      var strat = strats[key] || defaultStrat; // 不同选项使用合适的合并策略 (strats: 合并策略集)
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * 该函数用于在组件选项中查找特定类型的资源
   * @param {Object} options - 组件选项对象 (包含了注册的组件、指令、过滤器等资源)
   * @param {String} type - 要解析的资源类型 (例: 'components', 'directives', 'filters' 等)。
   * @param {String} id - 要解析的资源标识符
   * @param {Boolean} warnMissing - 当未找到资源时是否发出警告
   * @returns {Any} 解析到的资源
   */
  function resolveAsset (
    options,
    type,
    id,
    warnMissing
  ) {
    if (typeof id !== 'string') { // 解析的资源标识符不为字符, 则直接返回
      return
    }
    var assets = options[type]; // 获取指定类型的资源对象
    if (hasOwn(assets, id)) { return assets[id] } // 如果资源以当前标识符注册, 则直接返回该资源
    var camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] } // 如果资源以驼峰命名格式的标识符注册, 则返回该资源
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] } // 如果资源以帕斯卡命名格式的标识符注册, 则返回该资源

    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId]; // 如果以上都未找到, 则尝试通过原型链查找
    if (warnMissing && !res) { // 如果未找到资源且允许警告, 则发出警告
      warn(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      );
    }
    return res
  }

  /**
   * 验证并处理传入的 props 数据 (处理包括获取默认值以及为其创建观察者)
   * @param {String} key - props对象中的属性名称
   * @param {Object} propOptions - 组件选项中的 props 对象
   * @param {Object} propsData - 组件实例中的 props 数据
   * @param {VueComponent} vm - 组件实例
   */
  function validateProp (
    key,
    propOptions,
    propsData,
    vm
  ) {
    var prop = propOptions[key]; // 获取指定属性在组件选项中的属性定义
    var absent = !hasOwn(propsData, key); // 属性在组件实例中未定义, 则设置标识`缺失`
    var value = propsData[key]; // 属性的值
    var booleanIndex = getTypeIndex(Boolean, prop.type); // 查找Boolean类型在属性类型中的索引
    if (booleanIndex > -1) { // 属性类型中存在布尔类型
      if (absent && !hasOwn(prop, 'default')) { // 属性`缺失`且属性未定义默认值, 则将属性值设置为false
        value = false;
      } else if (value === '' || value === hyphenate(key)) { // 属性值为空字符或与属性名称相同 (hyphenate: 将驼峰命名的字符串转换为横线命名)
        var stringIndex = getTypeIndex(String, prop.type); // 查找String类型在属性类型中的索引
        if (stringIndex < 0 || booleanIndex < stringIndex) { // Boolean 类型定义的优先级高于 String 类型, 则将属性值设置为true
          value = true;
        }
      }
    }
    if (value === undefined) { // 属性值未定义, 则获取属性的默认值
      value = getPropDefaultValue(vm, prop, key); // 获取Props属性的默认值
      var prevShouldObserve = shouldObserve; // 用于表示是否应该在组件的更新计算中启用响应式化
      toggleObserving(true); // 在组件的更新计算中启用观察者
      observe(value); // 为其创建观察者 (以便在默认值发生变化时触发响应式更新)
      toggleObserving(prevShouldObserve); // 在组件的更新计算中禁用响应式化
    }
    {
      assertProp(prop, key, value, vm, absent); // 断言prop属性是否有效
    }
    return value
  }

  /**
   * 获取Props属性的默认值
   * @param {VueComponent} vm - 组件实例
   * @param {Object} prop - 属性定义对象
   * @param {String} key - 属性名
   * @returns {*}
   */
  function getPropDefaultValue (vm, prop, key) {
    if (!hasOwn(prop, 'default')) { // 没有设置默认值, 则直接返回 undefined
      return undefined
    }
    var def = prop.default; // 默认值
    if (isObject(def)) { // 如果默认值是一个对象或数组, 则发出警告 (因为对象和数组类型的默认值必须使用工厂函数返回, 默认值不能是引用类型的值)
      warn(
        'Invalid default value for prop "' + key + '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
        vm
      );
    }
    // 原始属性值在之前的渲染中也未定义, 返回之前的默认值以避免不必要的观察器触发
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined && // 上一次渲染时该属性未定义
      vm._props[key] !== undefined // 并且在当前渲染时该属性的值仍未定义
    ) {
      return vm._props[key]
    }

    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm) // 如果默认值是一个函数且属性的类型规定不是函数类型, 则调用该函数并返回其结果作为默认值
      : def // 如果默认值不是函数, 或者属性的类型是函数类型, 则直接返回默认值
  }

  /**
   * 断言prop属性是否有效
   * @param {Object} prop - 属性定义
   * @param {String} name - 属性名
   * @param {*} value - 属性值
   * @param {VueComponent} vm - 组件实例
   * @param {Boolean} absent - 该属性是否在 props 数据中缺失
   */
  function assertProp (
    prop,
    name,
    value,
    vm,
    absent
  ) {
    if (prop.required && absent) { // 属性为必需属性但是属性缺失, 则发出警告
      warn(
        'Missing required prop: "' + name + '"',
        vm
      );
      return
    }
    if (value == null && !prop.required) { // 属性值为空但是属性不是必需的, 则直接返回
      return
    }
    var type = prop.type; // prop的类型规定
    var valid = !type || type === true;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) { // 类型规定的数据格式统一为数组类型
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType(value, type[i], vm); // 对值进行类型断言
        expectedTypes.push(assertedType.expectedType || ''); // 期望的值类型
        valid = assertedType.valid; // 校验是否通过
      }
    }

    var haveExpectedTypes = expectedTypes.some(function (t) { return t; }); // 是否有期望的值类型
    if (!valid && haveExpectedTypes) { // 如果校验失败为且存在非空元素, 则控制台警告
      warn(
        getInvalidTypeMessage(name, value, expectedTypes), // getInvalidTypeMessage: 生成类型不匹配的警告消息
        vm
      );
      return
    }
    var validator = prop.validator; // 自定义校验方法
    if (validator) {
      if (!validator(value)) { // 执行自定义校验方法
        warn(
          'Invalid prop: custom validator check failed for prop "' + name + '".',
          vm
        );
      }
    }
  }

  var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/; // 用于匹配原始数据类型名称
  /**
   * 根据传入Props的值和期望的类型进行类型断言
   * @param {*} value - 要进行类型断言的值
   * @param {Function} type - 期望的类型
   * @param {VueComponent} vm - 组件实例
   * @returns {Object}
   */
  function assertType (value, type, vm) {
    var valid;
    var expectedType = getType(type); // 获取期望的类型名称
    if (simpleCheckRE.test(expectedType)) { // 期望类型是原始类型, 则获取值类型进行比较
      var t = typeof value; // 获取值类型
      valid = t === expectedType.toLowerCase(); // 与期望类型进行比较
      if (!valid && t === 'object') { // 对于对象类型的原始包装器 (String, Number等), 则通过 instanceof 检查确保值是该类型的实例
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') { // 期望类型是对象, 则检查值是否是普通对象
      valid = isPlainObject(value);
    } else if (expectedType === 'Array') { // 期望类型是对象, 则检查值是否是数组
      valid = Array.isArray(value);
    } else { // 期望类型是其他复杂类型, 尝试使用 instanceof 运算符检查值是否是该类型的实例
      try {
        valid = value instanceof type;
      } catch (e) {
        warn('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
        valid = false;
      }
    }
    return {
      valid: valid,
      expectedType: expectedType
    }
  }

  var functionTypeCheckRE = /^\s*function (\w+)/; // 用于匹配函数的类型名称

  function getType (fn) { // 用于获取函数的类型名称
    var match = fn && fn.toString().match(functionTypeCheckRE); // functionTypeCheckRE: 用于匹配函数的类型名称
    return match ? match[1] : ''
  }

  /**
   * 用于比较两个函数的类型是否相同
   * 使用函数字符串名称检查内置类型, 因为在不同的虚拟机/iframe之间运行时, 简单的相等性检查将会失败
   */
  function isSameType (a, b) {
    return getType(a) === getType(b) // getType: 获取函数的类型名称
  }

  /**
   * 用于查找给定类型在期望类型数组中的索引
   * @param {Function} type - 要查找的类型
   * @param {Function|Array} expectedTypes - 期望的类型数组
   * @returns {Number}
   */
  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) { // 不是数组, 则直接比较给定类型和期望类型是否相同
      return isSameType(expectedTypes, type) ? 0 : -1 // isSameType: 比较两个函数的类型是否相同
    }
    for (var i = 0, len = expectedTypes.length; i < len; i++) { // 数组则遍历去比较给定类型和数组中的每个类型, 返回匹配的类型在数组中的索引
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1 // 未找到匹配的类型, 则返回 -1
  }

  /**
   * 生成类型不匹配的警告消息 (根据属性名称、属性值以及期望的类型)
   * @param {String} name - 属性名 
   * @param {*} value - 属性值
   * @param {Array} expectedTypes - 期望的属性类型
   * @returns {String}
   */
  function getInvalidTypeMessage (name, value, expectedTypes) {
    var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
      " Expected " + (expectedTypes.map(capitalize).join(', ')); // 构建警告消息的基础部分
    var expectedType = expectedTypes[0];
    var receivedType = toRawType(value); // toRawType: 获取值类型
    if (
      expectedTypes.length === 1 &&
      isExplicable(expectedType) && // isExplicable: 判断给定值是否可以被格式化为字符串形式
      isExplicable(typeof value) &&
      !isBoolean(expectedType, receivedType)
    ) {
      message += " with value " + (styleValue(value, expectedType)); // styleValue: 将属性值转化成字符串形式
    }
    message += ", got " + receivedType + " ";
    if (isExplicable(receivedType)) {
      message += "with value " + (styleValue(value, receivedType)) + ".";
    }
    return message
  }

  /**
   * 根据属性值的类型将其格式转化成字符串形式
   * @param {*} value - 要格式化的属性值
   * @param {String} type - 属性值的类型
   * @returns {String}
   */
  function styleValue (value, type) {
    if (type === 'String') { // String型则直接双引号包裹
      return ("\"" + value + "\"")
    } else if (type === 'Number') { // Number型则将数字处理成字符后返回
      return ("" + (Number(value)))
    } else { // 其他类型则直接转化为字符返回
      return ("" + value)
    }
  }

  var EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
  function isExplicable (value) { // 判断给定值是否可以被格式化为字符串形式
    return EXPLICABLE_TYPES.some(function (elem) { return value.toLowerCase() === elem; })
  }

  function isBoolean () { // 判断参数中是否有布尔值
    var args = [], len = arguments.length; // 获取所有参数
    while ( len-- ) args[ len ] = arguments[ len ];

    return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
  }

  /**
   * 处理错误的函数, 用于在 Vue组件中捕获错误并进行处理
   * @param {Error} err - 抛出的错误对象
   * @param {Vue|VueComponent} vm - 组件实例
   * @param {String} info - 附加的错误信息
   */
  function handleError (err, vm, info) {
    pushTarget();  // 设置当前正在处理的响应式依赖目标, 以便 Vue能够追踪其依赖项
    try {
      if (vm) {
        var cur = vm;
        while ((cur = cur.$parent)) {
          var hooks = cur.$options.errorCaptured; // 获取当前父组件的 errorCaptured钩子数组
          if (hooks) {
            for (var i = 0; i < hooks.length; i++) {
              try {
                var capture = hooks[i].call(cur, err, vm, info) === false; // 调用错误捕获钩子函数
                if (capture) { return } // 如果错误捕获钩子返回 false, 表示已经捕获并处理了错误, 直接返回, 不再继续执行后续钩子
              } catch (e) {
                globalHandleError(e, cur, 'errorCaptured hook'); // 捕获错误并调用全局的错误处理函数来处理错误
              }
            }
          }
        }
      }
      globalHandleError(err, vm, info); // 未传入组件实例, 则调用全局的错误处理函数来处理错误
    } finally {
      popTarget(); // 恢复之前设置的响应式依赖目标, 以便 Vue继续追踪依赖项
    }
  }

  /**
   * 用于执行事件处理函数, 并在执行过程中进行错误处理
   * @param {Function} handler - 要执行的事件处理函数
   * @param {Vue|VueComponent} context - 事件处理函数执行时的上下文
   * @param {Array} args - 传递给事件处理函数的参数数组
   * @param {Vue|VueComponent} vm - 组件实例
   * @param {String} info - 用于错误提示的信息
   * @returns {*} 处理函数的返回值
   */
  function invokeWithErrorHandling (
    handler,
    context,
    args,
    vm,
    info
  ) {
    var res;
    try {
      res = args ? handler.apply(context, args) : handler.call(context); // 尝试执行事件处理函数
      if (res && !res._isVue && isPromise(res) && !res._handled) { // 当存在返回值且不是 Vue实例, 并且返回值是一个未被处理过 Promise对象 (即没有设置`_handled`标志)
        res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); }); // 使用 catch方法捕获异常, 并调用 handleError函数处理错误
        res._handled = true; // 设置标识避免嵌套调用时多次触发 catch方法
      }
    } catch (e) {
      handleError(e, vm, info); // 处理错误
    }
    return res
  }

  /**
   * 全局错误处理函数，用于在出现未捕获的错误时进行处理 
   * @param {Error} err - 抛出的错误对象
   * @param {Vue|VueComponent} vm - 组件实例
   * @param {String} info - 附加的错误信息
   */
  function globalHandleError (err, vm, info) {
    if (config.errorHandler) { // 如果配置了全局的错误处理函数, 则尝试调用该函数处理错误
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        if (e !== err) {// 如果在错误处理函数中抛出了错误, 则检查是否与原始错误对象相同, 避免重复记录错误
          logError(e, null, 'config.errorHandler'); // 记录错误日志
        }
      }
    }
    logError(err, vm, info); // 如果没有配置全局的错误处理函数, 则调用 logError函数记录错误日志
  }

  /**
   * 记录错误日志函数 (用于在控制台输出错误信息或抛出错误)
   * @param {Error} err - 抛出的错误对象
   * @param {Vue|VueComponent} vm - 组件实例
   * @param {string} info - 附加的错误信息
   */
  function logError (err, vm, info) {
    { // 在开发环境下, 通过警告函数输出错误信息和附加信息
      warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    
    if ((inBrowser || inWeex) && typeof console !== 'undefined') { // 如果在浏览器环境或 Weex环境下且控制台存在, 则将错误信息输出到控制台
      console.error(err); // 输出错误到控制台
    } else {
      throw err // 抛出错误
    }
  }

  var isUsingMicroTask = false; // 标识是否正在使用微任务 (microtask)

  var callbacks = []; // 存储待执行的回调函数
  var pending = false; // 标识是否有更新操作正在等待执行

  function flushCallbacks () { // 执行回调函数队列中的所有回调函数
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  var timerFunc;// 选择合适的异步执行方式

  if (typeof Promise !== 'undefined' && isNative(Promise)) { // 如果支持原生的 Promise, 则使用 Promise.then来执行回调函数
    var p = Promise.resolve();
    timerFunc = function () {
      p.then(flushCallbacks);
      if (isIOS) { setTimeout(noop); } // 解决在 UIWebView中 Promise.then的问题
    };
    isUsingMicroTask = true;
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) { // 如果支持 MutationObserver, 则使用 MutationObserver来执行回调函数
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
    isUsingMicroTask = true;
  } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) { // 如果支持 setImmediate, 则使用 setImmediate来执行回调函数
    timerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else { // 否则, 使用 setTimeout来执行回调函数
    timerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  /**
   * 将回调函数推入下一个 DOM更新周期的待执行队列中
   * @param {Function} cb - 回调函数
   * @param {Object} ctx - 回调函数执行的上下文
   * @returns {Promise|undefined}  如果没有回调函数但支持 Promise则返回一个 Promise对象, 否则返回 undefined
   */
  function nextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () { // 将回调函数推入 callbacks数组中
      if (cb) { // 如果存在回调函数 cb, 则执行它, 并捕获可能的错误
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) { // 如果不存在回调函数 cb, 但存在 _resolve, 则调用 Promise的 resolve函数
        _resolve(ctx);
      }
    });
    if (!pending) { // 如果没有待执行的更新操作, 则将 pending置为 true, 并立即执行 timerFunc函数
      pending = true;
      timerFunc();
    }
    
    if (!cb && typeof Promise !== 'undefined') { // 如果不存在回调函数 cb, 并且当前环境支持 Promise, 则创建一个新的 Promise对象
      return new Promise(function (resolve) {
        _resolve = resolve; // 将 Promise的 resolve函数存储在 _resolve中
      })
    }
  }
  
  var mark; // 用于在性能条目(Performance)中添加一个时间戳标记
  var measure; // 用于计算两个标记之间的时间间隔

  { // 在浏览器环境中检查是否支持 Performance API
    var perf = inBrowser && window.performance;
    if (
      perf && // 检查 performance 对象中是否存在所需的方法
      perf.mark &&
      perf.measure &&
      perf.clearMarks &&
      perf.clearMeasures
    ) {
      mark = function (tag) { return perf.mark(tag); }; // 用于在性能条目中添加一个时间戳标记
      measure = function (name, startTag, endTag) { // 用于计算两个标记之间的时间间隔
        perf.measure(name, startTag, endTag); // 计算时间间隔
        perf.clearMarks(startTag); // 清除起始标记
        perf.clearMarks(endTag); // 清除结束标记
        // perf.clearMeasures(name)
      };
    }
  }

  var initProxy; // 在渲染阶段对不合法的数据做判断筛选

  {
    var allowedGlobals = makeMap( // 判断模板上出现的变量是否合法 (包含全局对象和常用全局方法的映射)
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
      'require' // for Webpack/Browserify
    );

    var warnNonPresent = function (target, key) { // 判断模板中是否使用了未定义的变量
      warn(
        "Property or method \"" + key + "\" is not defined on the instance but " +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        target
      );
    };

    var warnReservedPrefix = function (target, key) { // 定义的数据不允许出现 "$" or "_" 开头的变量
      warn( // 以 "$" or "_" 开头的属性不会被 Vue实例代理, 以防止与 Vue 内部保留属性冲突
        "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
        'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
        'prevent conflicts with Vue internals. ' +
        'See: https://vuejs.org/v2/api/#data',
        target
      );
    };

    var hasProxy =
      typeof Proxy !== 'undefined' && isNative(Proxy); // 当前环境是否支持 Proxy对象

    if (hasProxy) { // 用于检查是否正在尝试覆盖内置的按键修饰符
      var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
      config.keyCodes = new Proxy(config.keyCodes, { // 使用 Proxy对象代理 config.keyCodes, 拦截属性的设置操作
        set: function set (target, key, value) {
          if (isBuiltInModifier(key)) { // 如果覆盖了内置的按键修饰符, 则发出警告
            warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
            return false // 阻止属性的设置操作
          } else {
            target[key] = value; // 允许设置属性
            return true
          }
        }
      });
    }

    var hasHandler = { // 判断代理对象是否拥有某个属性时触发该操作 (with关键字也可以触发)
      has: function has (target, key) { // proxy中用于捕获 in 运算符的操作
        var has = key in target;
        var isAllowed = allowedGlobals(key) || // 判断模板上出现的变量是否合法
          (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
        if (!has && !isAllowed) {
          if (key in target.$data) { warnReservedPrefix(target, key); } // 定义的数据不允许出现 "$" or "_" 开头的变量
          else { warnNonPresent(target, key); } // 判断模板中是否使用了未定义的变量
        }
        return has || !isAllowed
      }
    };

    var getHandler = { // 读取代理对象的某个属性时触发该操作
      get: function get (target, key) { // proxy中用于捕获对象的属性访问操作
        if (typeof key === 'string' && !(key in target)) {
          if (key in target.$data) { warnReservedPrefix(target, key); } // 定义的数据不允许出现 "$" or "_" 开头的变量
          else { warnNonPresent(target, key); } // 判断模板中是否使用了未定义的变量
        }
        return target[key]
      }
    };

    initProxy = function initProxy (vm) { // 在渲染阶段对不合法的数据做判断筛选
      if (hasProxy) { // 当前环境支持 Proxy对象
        var options = vm.$options;
        var handlers = options.render && options.render._withStripped // 在 vue-loader/webpack 等编译工具下 _withStripped属性为 true
          ? getHandler // 读取代理对象的某个属性时触发该操作
          : hasHandler; // 判断代理对象是否拥有某个属性时触发该操作 (with关键字也可以触发)
        vm._renderProxy = new Proxy(vm, handlers); // 对实例进行代理, 在模板渲染时对非法或不存在的字符串进行判断, 做数据的过滤筛选
      } else {
        vm._renderProxy = vm; // 当前环境不支持 Proxy对象, 则直接将 Vue实例赋值给 _renderProxy属性
      }
    };
  }

  var seenObjects = new _Set(); // 存储已遍历对象的 id
  /**
   * 递归遍历一个对象, 调用所有已经转换过的 getter (这样该对象内的每个嵌套属性都作为一个"深度"依赖项被收集)
   * @param {Any} val 
   */
  function traverse (val) {
    _traverse(val, seenObjects); // 使用 _traverse函数进行递归遍历, 并传入一个空 Set对象存储已经遍历过对象的 id
    seenObjects.clear(); // 清空存储已遍历对象 id的 Set对象, 以便下次遍历时重新使用
  }

  /**
   * 深度遍历传入的值 (并在遍历过程中避免循环引用)
   * @param {Any} val - 要遍历的值
   * @param {Set} seen - 存储已经遍历过的值的集合 (用于检测循环引用)
   */
  function _traverse (val, seen) {
    var i, keys;
    var isA = Array.isArray(val); // 是否是数组
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) { // 如果既不是数组也不是对象, 或是冻结的对象, 或是 VNode实例, 则直接返回
      return
    }
    if (val.__ob__) { // 如果是响应式对象, 则记录其 id, 用于检测循环引用
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) { // id 已存在则无需记录
        return
      }
      seen.add(depId); // 记录 id
    }
    if (isA) { // 如果是数组, 遍历每一项继续递归调用 _traverse函数
      i = val.length;
      while (i--) { _traverse(val[i], seen); }
    } else { // 如果是对象, 遍历每一项继续递归调用 _traverse函数
      keys = Object.keys(val);
      i = keys.length;
      while (i--) { _traverse(val[keys[i]], seen); }
    }
  }

  /**
   * 规范化事件名得到事件信息对象 (事件名, 修饰符)
   * @param {String} name - 事件名
   * @returns {Object}
   */
  var normalizeEvent = cached(function (name) {
    var passive = name.charAt(0) === '&'; // 是否使用`.passive`修饰符
    name = passive ? name.slice(1) : name; // 去除`&`字符
    var once$$1 = name.charAt(0) === '~'; // 是否使用`.once`修饰符
    name = once$$1 ? name.slice(1) : name; // 去除`~`字符
    var capture = name.charAt(0) === '!'; // 是否使用`.capture`修饰符
    name = capture ? name.slice(1) : name; // 去除`!`字符
    return {
      name: name, // 规范化后的事件名
      once: once$$1, // 表示是否为一次性事件
      capture: capture, // 表示是否为捕获模式
      passive: passive // 表示listener永远不会调用preventDefault
    }
  });

  /**
   * 用于创建一个函数调用器
   * @param {Function|Array} fns - 包含一个或多个事件处理函数的数组, 或者是单个事件处理函数
   * @param {Vue|VueComponent} vm - 组件实例 
   * @returns {Function}
   */
  function createFnInvoker (fns, vm) {
    function invoker () {
      var arguments$1 = arguments; // 处理函数的参数

      var fns = invoker.fns; // 将处理函数取出来
      if (Array.isArray(fns)) { // 有多个事件处理函数, 需要依次执行这些函数
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler"); // 执行事件处理函数, 并在执行过程中进行错误处理
        }
      } else { // 单个事件处理函数则执行并返回返回值
        return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
      }
    }
    invoker.fns = fns; // 将处理函数存起来
    return invoker
  }

  /**
   * 更新事件监听器
   * @param {Object} on - 新节点的事件监听器对象
   * @param {Object} oldOn - 旧节点的事件监听器对象
   * @param {Function} add - 添加事件监听器的函数
   * @param {Function} remove$$1 - 移除事件监听器的函数
   * @param {Function} createOnceHandler - 创建一次性事件处理器的函数
   * @param {Vue|VueComponent} vm - 组件实例
   */
  function updateListeners (
    on,
    oldOn,
    add,
    remove$$1,
    createOnceHandler,
    vm
  ) {
    var name, def$$1, cur, old, event;
    for (name in on) { // 遍历新事件监听器对象
      def$$1 = cur = on[name]; // 当前事件监听器
      old = oldOn[name]; // 旧的事件监听器
      event = normalizeEvent(name); // 规范化事件名得到事件信息对象 (事件名, 修饰符)
      if (isUndef(cur)) { // 如果当前事件监听器`cur`未定义, 则给出警告, 因为事件处理函数不能为空
        warn(
          "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
          vm
        );
      } else if (isUndef(old)) { // 如果旧事件监听器`old`未定义, 则表示该事件监听器是新增的, 需要进行添加操作
        if (isUndef(cur.fns)) { // 判断是否创建过
          cur = on[name] = createFnInvoker(cur, vm); // 用于创建一个函数调用器 (cur.fns也会存在, 用于标识防止多次创建)
        }
        if (isTrue(event.once)) { // 用于创建一个一次性事件函数调用器
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params); // 为元素添加事件监听器
      } else if (cur !== old) { // 当前事件监听器和旧事件监听器不相等, 则更新旧事件监听器的函数列表为当前事件监听器
        old.fns = cur; // 更新旧事件监听器
        on[name] = old; // 存储到新事件监听器对象中
      }
    }
    for (name in oldOn) { // 遍历旧事件监听器对象
      if (isUndef(on[name])) { // 如果在新事件监听器对象中未定义该事件名, 则表示该事件已被移除, 需要进行移除操作
        event = normalizeEvent(name); // 规范化事件名得到事件信息对象 (事件名, 修饰符)
        remove$$1(event.name, oldOn[name], event.capture); // 为元素移除事件监听器
      }
    }
  }

  /**
   * 合并 VNode钩子函数的方法
   * @param {VNode|Object} def - VNode对象或包含钩子函数的对象
   * @param {String} hookKey - 钩子函数的键名
   * @param {Function} hook - 要合并的钩子函数
   */
  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) { // 如果传入的是 VNode对象, 则获取其钩子函数对象
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey]; // 旧的钩子函数

    function wrappedHook () { // 创建新的钩子函数
      hook.apply(this, arguments); // 调用传入的钩子函数
      remove(invoker.fns, wrappedHook); // 移除当前钩子函数, 确保它只被调用一次, 防止内存泄漏
    }

    /* 根据已有的钩子函数决定如何合并 */
    if (isUndef(oldHook)) { // 如果没有已有的钩子函数, 则创建一个新的函数调用器
      invoker = createFnInvoker([wrappedHook]); // createFnInvoker: 用于创建一个函数调用器
    } else {
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) { // 如果已有的钩子函数是已经合并过的函数调用器, 则直接在调用链上添加当前钩子函数
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else { // 如果已有的钩子函数是一个普通的函数, 则创建一个新的函数调用器, 并将已有的钩子函数和当前钩子函数都添加到调用链上
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true; // 标记为已合并
    def[hookKey] = invoker; // 通过键名存储起来
  }

  /**
   * 从 VNode数据中提取 props的方法
   * @param {Object} data - VNode数据对象
   * @param {Function} Ctor - 组件构造函数
   * @param {string} tag - 组件标签名
   * @returns {Object} - 提取的 props对象
   */
  function extractPropsFromVNodeData (
    data,
    Ctor,
    tag
  ) {
    /* 只提取原始值, 验证和默认值在子组件本身处理 */
    var propOptions = Ctor.options.props;
    if (isUndef(propOptions)) { // 只提取原始值，验证和默认值在子组件本身处理
      return
    }
    var res = {}; // 用于返回结果的对象
    /* props编译后的结果有两种 */
    var attrs = data.attrs; // 1. 用户使用 DOM模板生成的属性值
    var props = data.props; // 2. 用户传入 render函数的属性值
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) { // 组件的 props选项
        var altKey = hyphenate(key); // 转为横线命名
        { // 开发环境下, 检查是否传入了正确的 prop名称 (小驼峰命名应该改为横线命名)
          var keyInLowerCase = key.toLowerCase(); // 命名全小写
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn(attrs, keyInLowerCase)
          ) {  // HTML对大小写是不敏感的, 浏览器会把大写字符解释为小写字符, 因此我们在使用 DOM中的模板时, cameCase(驼峰命名)的 props名需要使用其等价的 kebab-case(横线命名)代替
            tip(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        checkProp(res, props, key, altKey, true) ||  // 检查属性是否存在并将其添加到结果对象(res)中
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  /**
   * 检查属性是否存在并将其添加到结果对象(res)中返回
   * @param {Object} res - 结果对象, 用于存储检查到的属性
   * @param {Object} hash - 属性哈希表, 包含要检查的属性
   * @param {String} key - 要检查的属性名称
   * @param {String} altKey - 要检查的替代属性名称 (横向命名后的属性)
   * @param {Boolean} preserve - 是否保留属性 (不在哈希表中删除属性)
   * @returns {Boolean} 如果找到属性并成功添加到结果对象中, 则返回 true, 否则返回 false
   */
  function checkProp (
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef(hash)) { // 检查哈希表是否存在
      if (hasOwn(hash, key)) { // 检查是否存在 key属性
        res[key] = hash[key]; // 保存属性
        if (!preserve) { // 删除哈希表中的属性
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) { // 检查哈希表是否存在替代属性
        res[key] = hash[altKey]; // 保存属性
        if (!preserve) { // 删除哈希表中的属性
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /**
   * 调用场景是 render函数是编译生成的, 理论上编译生成的 children都已经是 VNode类型的,
   * 但有一个例外,就是 functional component函数式组件返回的是一个数组而不是一个根节点,
   * 所以会通过 Array.prototype.concat方法把整个 children数组打平
   */

  /**
   * 对子节点进行简单的规范化 TODO
   * 保证深度只有一层, 因为功能组件已经规范化了它们自己的子组件
   * @param {Array} children - 要规范化的子节点数组
   * @returns {Array}
   */
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) { // 遍历子节点数组, 若子节点为数组, 则将其扁平化
      if (Array.isArray(children[i])) { 
        return Array.prototype.concat.apply([], children) // 扁平化处理
      }
    }
    return children
  }

  /**
   * 调用场景有 2种,
   * 一个场景是 render函数为用户手写, 当 children只有一个节点的时候,
   * Vue 从接口层面允许用户把 children写成基础类型用来创建单个简单的文本节点, 这种情况会调用 createTextVNode创建一个文本节点的 VNode
   * 
   * 另一个场景是当编译 slot、v-for 的时候会产生嵌套数组的情况, 会调用 normalizeArrayChildren方法
   */

  /**
   * 对子节点进行完全的规范化
   * @param {Array|String|Number|Boolean} children - 要规范化的子节点
   * @returns {Array}
   */
  function normalizeChildren (children) {
    return isPrimitive(children) // 如果子节点是基本类型
      ? [createTextVNode(children)] // 创建一个文本节点的 VNode数组
      : Array.isArray(children) // 如果子节点是数组
        ? normalizeArrayChildren(children) // 则调用 normalizeArrayChildren函数处理数组形式的子节点
        : undefined // 如果子节点既不是基本类型也不是数组, 则返回 undefined
  }

  /**
   * 判断节点是否为文本节点
   * @param {Object} node - 虚拟节点
   * @returns {Boolean}
   */
  function isTextNode (node) {
    // 如果节点被定义且具有文本属性, 并且不是注释节点, 则视为文本节点
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
  }

  /**
   * 将数组形式的子节点标准化为 VNode数组
   * @param {Array} children - 子节点数组
   * @param {Number} nestedIndex - 嵌套索引
   * @returns {Array}
   */
  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) { // 遍历子节点数组
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue } // 如果当前节点不存在或是布尔值, 则跳过当前循环
      lastIndex = res.length - 1;
      last = res[lastIndex]; // 获取当前结果数组的最后一个元素
      if (Array.isArray(c)) { // 如果当前子节点是数组
        if (c.length > 0) { // 如果子数组不为空
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)); // 递归调用 normalizeArrayChildren处理子数组, 并传入嵌套索引
          if (isTextNode(c[0]) && isTextNode(last)) { // 合并相邻的文本节点
            res[lastIndex] = createTextVNode(last.text + (c[0]).text); // 创建一个新的文本节点, 将相邻文本节点合并到一起
            c.shift(); // 移除已合并的第一个文本节点
          }
          res.push.apply(res, c); // 将处理后的子数组添加到结果数组中
        }
      } else if (isPrimitive(c)) { // 如果当前子节点是基本类型
        if (isTextNode(last)) { // 如果前是文本节点, 合并相邻的文本节点
          res[lastIndex] = createTextVNode(last.text + c); // 创建一个新的文本节点，将当前文本节点和上一个文本节点合并到一起
        } else if (c !== '') { // 如果当前子节点不为空字符串
          res.push(createTextVNode(c)); // 将基本类型转换为 VNode, 并添加到结果数组中
        }
      } else { // 如果当前子节点是对象
        if (isTextNode(c) && isTextNode(last)) { // 合并相邻的文本节点
          res[lastIndex] = createTextVNode(last.text + c.text); // 创建一个新的文本节点, 将当前文本节点和上一个文本节点合并到一起
        } else {
          // 为嵌套数组子节点设置默认的 key (通常由 v-for生成)
          if (isTrue(children._isVList) && // 如果子节点数组是虚拟列表
            isDef(c.tag) && // 如果当前子节点有标签
            isUndef(c.key) && // 如果当前子节点没有设置 key
            isDef(nestedIndex)) { // 如果存在嵌套索引
            c.key = "__vlist" + nestedIndex + "_" + i + "__"; // 生成默认的 key
          }
          res.push(c); // 将当前子节点添加到结果数组中
        }
      }
    }
    return res // 返回标准化后的 VNode数组
  }

  /**
   * 初始化 provide选项
   * @param {VueComponent} vm - 组件实例
   */
  function initProvide (vm) {
    var provide = vm.$options.provide; // 获取 provide 选项
    if (provide) { // 如果 provide选项存在
      vm._provided = typeof provide === 'function' //  将 provide赋值给 vm._provided
        ? provide.call(vm)
        : provide;
    }
  }

  /**
   * 初始化 inject选项
   * @param {VueComponent} vm - 组件实例
   */
  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm); // 解析注入选项并获取结果
    if (result) { // 如果解析结果存在
      toggleObserving(false); // 关闭观察者
      Object.keys(result).forEach(function (key) { // 遍历解析结果的每个属性
        {
          defineReactive$$1(vm, key, result[key], function () { // 为属性定义 setter函数, 避免直接修改注入值
            warn( // 发出警告: 避免直接修改注入值
              "Avoid mutating an injected value directly since the changes will be " +
              "overwritten whenever the provided component re-renders. " +
              "injection being mutated: \"" + key + "\"",
              vm
            );
          });
        }
      });
      toggleObserving(true); // 重新开启观察者
    }
  }

  /**
   * 解析 inject选项
   * @param {Object} inject - 注入选项对象
   * @param {VueComponent} vm - 组件实例
   * @returns {Object}
   */
  function resolveInject (inject, vm) {
    if (inject) {
      var result = Object.create(null);
      var keys = hasSymbol // 获取对象自身属性键的数组
        ? Reflect.ownKeys(inject) // 如果支持 Symbol, 使用 Reflect.ownKeys
        : Object.keys(inject); // 否则使用 Object.keys

      for (var i = 0; i < keys.length; i++) { // 遍历所有的注入属性键
        var key = keys[i]; // 当前属性键
        if (key === '__ob__') { continue } // 跳过响应式系统添加的属性键
        var provideKey = inject[key].from; // 获取注入源的键名
        var source = vm; // 设置起始源为当前组件实例
        while (source) { // 循环查找注入源
          if (source._provided && hasOwn(source._provided, provideKey)) { // 如果找到了注入源
            result[key] = source._provided[provideKey]; // 将提供的值赋给结果对象中的属性
            break
          }
          source = source.$parent; // 如果没找到, 继续查找父级实例
        }
        if (!source) { // 如果未找到注入源
          if ('default' in inject[key]) { // 检查是否存在默认值
            var provideDefault = inject[key].default; // 获取默认值
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm) // 如果是函数, 则调用函数获取默认值
              : provideDefault; // 否则直接使用默认值
          } else {
            warn(("Injection \"" + key + "\" not found"), vm); // 发出警告: 未找到注入
          }
        }
      }
      return result // 返回解析后的注入对象
    }
  }

  /**
   * 用于将原始的子节点 VNodes解析为一个 slot对象 (运行时工具)
   * @param {Array} children - 子节点 VNodes数组
   * @param {Object} context - 上下文对象
   * @returns {Object}
   */
  function resolveSlots (
    children,
    context
  ) {
    if (!children || !children.length) { // 如果子节点不存在或为空, 则返回空的 slot对象
      return {}
    }
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) { // 遍历子节点数组
      var child = children[i]; // 当前子节点
      var data = child.data; // 子节点的 data属性
      if (data && data.attrs && data.attrs.slot) { // 如果节点被解析为一个插槽节点, 则移除 slot属性
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) && // 如果 vnode渲染在相同的上下文中
        data && data.slot != null // 具有 slot属性
      ) {
        var name = data.slot; // 插槽名
        var slot = (slots[name] || (slots[name] = [])); // 获取或创建该插槽名对应的数组
        if (child.tag === 'template') { // 如果子节点的标签是模板
          slot.push.apply(slot, child.children || []); // 将模板的子节点添加到插槽中
        } else {
          slot.push(child); // 将子节点添加到插槽中
        }
      } else {
        (slots.default || (slots.default = [])).push(child); // 否则将子节点添加到默认插槽中
      }
    }

    for (var name$1 in slots) { // 忽略只包含空白字符的插槽
      if (slots[name$1].every(isWhitespace)) { // 如果插槽中的所有节点都是空白字符, 则删除该插槽
        delete slots[name$1];
      }
    }
    return slots // 返回解析后的 slot对象
  }

  /**
   * 判断节点是否为空白节点
   * @param {Object} node - 虚拟节点
   * @returns {Boolean}
   */
  function isWhitespace (node) {
    // 如果节点是注释节点且不是异步工厂创建的节点， 或者节点的文本内容是单个空格字符, 则视为空白节点
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  /**
   * 判断节点是否为异步占位符节点
   * @param {Object} node - 虚拟节点
   * @returns {Boolean}
   */
  function isAsyncPlaceholder (node) {
    // 如果节点是注释节点且是异步工厂创建的节点, 则视为异步占位符节点
    return node.isComment && node.asyncFactory
  }
 
  /**
   * 规范化作用域插槽
   * @param {Object} slots - 作用域插槽的对象
   * @param {Object} normalSlots - 普通插槽的对象
   * @param {Object} prevSlots - 之前的作用域插槽对象 (上一次规范化的作用域插槽对象)
   * @returns {Object} 返回标准化后的作用域插槽对象
   */
  function normalizeScopedSlots (
    slots,
    normalSlots,
    prevSlots
  ) {
    var res; // 存储规范化后的插槽对象
    var hasNormalSlots = Object.keys(normalSlots).length > 0; // 检查普通插槽是否存在
    var isStable = slots ? !!slots.$stable : !hasNormalSlots; // 判断作用域插槽是否稳定
    var key = slots && slots.$key; // 获取作用域插槽的key值
    if (!slots) { // 用域插槽不存在, 则初始化 res 为空对象
      res = {};
    } else if (slots._normalized) { // 已规范化过, 则直接返回已经规范化过的插槽对象
      return slots._normalized
    } else if (
      isStable && // 作用域插槽稳定并且
      prevSlots && // 上一次规范化后的插槽对象存在并且
      prevSlots !== emptyObject && // 上一次规范化后的插槽对象不为空对象并且
      key === prevSlots.$key && // 上一次规范化后的插槽对象的 key 与当前作用域插槽的 key 相同并且 (确保两次插槽内容相同)
      !hasNormalSlots && // 当前没有普通插槽并且
      !prevSlots.$hasNormal // 上一次规范化后的插槽对象也没有普通插槽
    ) { // 则直接返回上一次的结果
      return prevSlots
    } else {
      res = {};
      for (var key$1 in slots) { // 遍历作用域插槽对象, 对每个作用域插槽进行规范化 (需要排除以 $ 开头的特殊键)
        if (slots[key$1] && key$1[0] !== '$') {
          res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
        }
      }
    }
    for (var key$2 in normalSlots) { // 历普通插槽对象, 将普通插槽合并到规范化后的插槽对象中
      if (!(key$2 in res)) {
        res[key$2] = proxyNormalSlot(normalSlots, key$2);
      }
    }

    if (slots && Object.isExtensible(slots)) { // 将标准化后的作用域插槽对象保存在原始作用域插槽对象中
      (slots)._normalized = res;
    }
    def(res, '$stable', isStable); // 稳定性
    def(res, '$key', key); // key值
    def(res, '$hasNormal', hasNormalSlots); // 是否存在正常插槽的属性
    return res
  }

  /**
   * 标准化作用域插槽
   * @param {Object} normalSlots - 正常插槽对象
   * @param {String} key - 插槽的名称
   * @param {Function} fn - 作用域插槽的渲染函数
   * @returns {Function} 返回标准化后的作用域插槽渲染函数
   */
  function normalizeScopedSlot(normalSlots, key, fn) { // TODO
    var normalized = function () { // 处理作用域插槽的内容
      var res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === 'object' && !Array.isArray(res) // 调用作用域插槽的渲染函数，并处理返回的结果
        ? [res] // single vnode
        : normalizeChildren(res);
      var vnode = res && res[0];
      // 如果作用域插槽的结果为空或只有一个注释节点且不是异步占位符, 则返回undefined, 否则返回处理后的结果
      return res && (
        !vnode ||
        (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode)) // #9658, #10391
      ) ? undefined
        : res
    };
    if (fn.proxy) { // 如果作用域插槽函数 fn上存在 proxy属性, 表示这是一个使用新的 v-slot语法但未带作用域的插槽, 需要将其添加到 normalSlots中
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized
  }

  function proxyNormalSlot(slots, key) { // 返回一个闭包函数, 用于返回插槽内容
    return function () { return slots[key]; } // 返回插槽内容
  }

  /**
   * 渲染 v-for 列表 (v-for的运行时工具)
   * @param {Array|Number|Object} val - 要渲染的值
   * @param {Function} render - 渲染函数
   * @return {Array} - 包含渲染元素的数组
   */
  function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    // 以下的操作总结为: 遍历子项, 对其调用渲染函数, 并将结果存储到数组中返回
    if (Array.isArray(val) || typeof val === 'string') { // 如果值是数组或字符串, 则遍历每个元素, 对其调用渲染函数
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i); // 对子项调用渲染函数, 并将结果存储
      }
    } else if (typeof val === 'number') { // 如果值是数字, 则从 1到 val进行迭代
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i); // 对子项调用渲染函数, 并将结果存储
      }
    } else if (isObject(val)) { // 如果值是对象
      if (hasSymbol && val[Symbol.iterator]) { // 检查值是否具有 Symbol.iterator (ES6 迭代器)
        ret = [];
        var iterator = val[Symbol.iterator](); // 迭代器
        var result = iterator.next();
        while (!result.done) { // 使用迭代器遍历每个项
          ret.push(render(result.value, ret.length)); // 对子项调用渲染函数, 并将结果存储
          result = iterator.next();
        }
      } else { // 普通对象
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) { // 遍历对象的每个键
          key = keys[i];
          ret[i] = render(val[key], key, i); // 对子项调用渲染函数, 并将结果存储
        }
      }
    }
    if (!isDef(ret)) { // 如果处理后 ret依旧为 null, 则将其初始化为空数组
      ret = [];
    }
    (ret)._isVList = true; // 标记为 VList (v-for渲染标识)
    return ret
  }

  /**
   * 渲染插槽内容 (slot的运行时工具) TODO
   * @param {String} name - 插槽名称
   * @param {Function} fallbackRender - 当未找到插槽内容时，用于渲染默认内容的函数
   * @param {Object} props - 传递给插槽内容的属性对象
   * @param {Object} bindObject - 用于动态绑定插槽内容的属性对象
   * @returns {VNode|Array} - 返回渲染出的插槽内容
   */
  function renderSlot (
    name,
    fallbackRender,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name]; // 获取作用域插槽函数
    var nodes;
    if (scopedSlotFn) { // 如果存在作用域插槽函数, 则渲染作用域插槽内容
      // scoped slot
      props = props || {};
      if (bindObject) { // 合并动态绑定的属性对象
        if (!isObject(bindObject)) { // 如果 bindObject不是对象, 发出警告
          warn('slot v-bind without argument expects an Object', this);
        }
        props = extend(extend({}, bindObject), props); // 合并属性对象
      }
      nodes =
        scopedSlotFn(props) || // 渲染作用域插槽内容, 若未定义, 则渲染默认内容
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    } else { // 如果不存在作用域插槽函数, 则尝试渲染普通插槽内容, 若未定义, 则渲染默认内容
      nodes =
        this.$slots[name] ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    }

    var target = props && props.slot;
    if (target) { // 如果 props中存在 slot属性, 则为渲染结果创建一个 template元素 ,并指定 slot属性
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /**
   * 解析过滤器 (filter的运行时工具)
   * @param {String} id - 过滤器的标识符
   * @returns {Function} 返回解析到的过滤器函数, 如果未找到则返回一个恒等函数
   */
  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  /**
   * 比较值是否符合预期
   * @param {*} expect - 期望的值 (单独的值或数组)
   * @param {*} actual - 实际的值
   * @returns {Boolean}
   */
  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) { // 当有多个期望值, 查找实际值是否在期望值数组中
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual // 判断实际值是否等于期望值
    }
  }

  /**
   * 用于比较给定的按键码、按键名和内置的按键码、按键名是否匹配 (检查键码的运行时助手, 通过Vue.prototype._k的形式暴露)
   * @param {Number} eventKeyCode - 按键码
   * @param {String} key - Vue的按键别名
   * @param {Array} builtInKeyCode - 内置按键码
   * @param {String} eventKeyName - 按键名
   * @param {String} builtInKeyName - 内置按键名
   * @returns {Boolean}
   */
  function checkKeyCodes (
    eventKeyCode,
    key,
    builtInKeyCode,
    eventKeyName,
    builtInKeyName
  ) {
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode; // 获取与按键名相关联的按键码
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) { // 比较按键名
      return isKeyNotMatch(builtInKeyName, eventKeyName) // 按键名是否符合预期(isKeyNotMatch: 比较值是否符合预期)
    } else if (mappedKeyCode) {  // 比较按键码
      return isKeyNotMatch(mappedKeyCode, eventKeyCode) // 按键码是否符合预期
    } else if (eventKeyName) { 
      return hyphenate(eventKeyName) !== key // (hyphenate: 将驼峰命名的字符串转换为横线命名)
    }
    return eventKeyCode === undefined
  }

  /**
   * 用于将 v-bind="object" 合并到虚拟节点的数据对象中 (运行时助手函数)
   * @param {Object} data - VNode 数据对象
   * @param {string} tag - 标签名
   * @param {Object|Array} value - 要绑定的对象或数组值。
   * @param {boolean} asProp - 是否作为 prop 绑定
   * @param {boolean} isSync - 是否为同步绑定
   * @returns {Object}
   */
  function bindObjectProps (
    data,
    tag,
    value,
    asProp,
    isSync
  ) {
    if (value) {
      if (!isObject(value)) { // 如果绑定值不是对象或数组, 则发出警告
        warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) { // 如果绑定值是数组, 则将其转换为对象
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) { // 处理绑定的每一个属性
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute(key)
          ) { // 如果是 class, style 或保留属性, 则直接保存到 data 上
            hash = data;
          } else { // 反之则根据情况, 保存到 data 中不同的属性存储对象上
            var type = data.attrs && data.attrs.type; // 标签的类型
            hash = asProp || config.mustUseProp(tag, type, key) // 是否作为 prop 绑定
              ? data.domProps || (data.domProps = {}) // 保存到 domProps 中
              : data.attrs || (data.attrs = {}); // 保存到 attrs 中
          }
          var camelizedKey = camelize(key); // 将属性名转为驼峰式
          var hyphenatedKey = hyphenate(key); // 将属性名转为连字符格式
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) { // 属性不存在, 则进行保存
            hash[key] = value[key];

            if (isSync) { // 如果是同步绑定, 则为属性添加更新事件监听器
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) { // 更新事件监听器
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) loop( key ); // 遍历对象处理绑定的每一个属性
      }
    }
    return data
  }

  /**
   * 根据给定的索引渲染静态树 (运行时工具)
   * @param {Number} index - 表示静态树在静态渲染函数数组中的索引
   * @param {Boolean} isInFor - 表示当前节点是否在 v-for 循环内
   * @returns {VNode}
   */
  function renderStatic (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index]; // 从缓存中获取已经渲染的静态树
    if (tree && !isInFor) { // 如果已经渲染了静态树并且不在v-for内, 可复用同一个树
      return tree
    }
    tree = cached[index] = this.$options.staticRenderFns[index].call( // 否则渲染一颗新静态树, 并将渲染结果缓存起来
      this._renderProxy,
      null,
      this // 用于函数式组件模板生成的渲染函数
    );
    markStatic(tree, ("__static__" + index), false); // 标记了静态节点树 (以便在后续的虚拟 DOM 更新中能够正确地识别和处理静态节点)
    return tree
  }

  /**
   * 标记一次性节点 (v-once的运行时工具)
   * @param {VNode|Array} tree - 要标记的一次性节点
   * @param {Number} index - 表示标记的索引
   * @param {String} key - 标记的键名
   */
  function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true); // 标记静态节点
    return tree
  }

  /**
   * 标记静态节点
   * @param {VNode|Array} tree - 要标记的静态节点
   * @param {String} key - 标记的键名
   * @param {Boolean} isOnce - 表示该节点是否只会渲染一次
   */
  function markStatic (
    tree,
    key,
    isOnce
  ) {
    if (Array.isArray(tree)) { // 遍历数组对节点进行静态标记
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') { // 节点存在且不是字符串类型, 则进行静态标记
          markStaticNode(tree[i], (key + "_" + i), isOnce); // 对节点静态标记
        }
      }
    } else {
      markStaticNode(tree, key, isOnce); // 对节点静态标记
    }
  }

  /**
   * 对节点进行静态标记
   * @param {VNode} node - AST 节点对象 (包含有关节点的信息)
   * @param {String} key - 标识节点的key值
   * @param {Boolean} isOnce - 表示该节点是否只会渲染一次
   */
  function markStaticNode (node, key, isOnce) {
    node.isStatic = true; // 标记为静态节点
    node.key = key; // 记录标识节点的key值
    node.isOnce = isOnce; // 记录节点是否只会渲染一次的标识
  }

  /**
   * 处理 v-on 指令的参数绑定 (_g)
   * @param {Object} data - 数据对象 (包含了组件的一些配置和状态)
   * @param {Object} value - v-on指令的参数值
   * @returns {Object}
   */
  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) { // value不是对象则控制台抛出警告 (isPlainObject： 是否是普通对象)
        warn(
          'v-on without argument expects an Object value',
          this
        );
      } else {
        var on = data.on = data.on ? extend({}, data.on) : {}; // extend: 将源对象中的属性合并到目标对象
        for (var key in value) {
          var existing = on[key]; // 事件是否已经存在
          var ours = value[key];  // 当前v-on指令的参数值
          on[key] = existing ? [].concat(existing, ours) : ours; // 将事件进行合并
        }
      }
    }
    return data
  }

  /**
   * 解析作用域插槽
   * @param {Array} fns - 作用域插槽函数数组
   * @param {Object} res - 结果对象, 包含解析后的作用域插槽
   * @param {boolean} hasDynamicKeys - 是否存在动态键
   * @param {string} contentHashKey - 内容哈希键
   */
  function resolveScopedSlots (
    fns,
    res,
    hasDynamicKeys,
    contentHashKey
  ) {
    res = res || { $stable: !hasDynamicKeys };
    for (var i = 0; i < fns.length; i++) { // 遍历作用域插槽函数数组
      var slot = fns[i]; // 初始化结果对象
      if (Array.isArray(slot)) { // 如果当前插槽是数组, 则递归解析作用域插槽
        resolveScopedSlots(slot, res, hasDynamicKeys);
      } else if (slot) { // 如果插槽存在且不是数组, 则处理当前插槽
        if (slot.proxy) { // 如果插槽有 proxy标记, 则将插槽函数的代理标记设为 true
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn; // 将当前插槽函数存入结果对象中, 键名为插槽的 key
      }
    }
    if (contentHashKey) { // 如果存在 contentHashKey, 则将其作为 $key存入结果对象中
      (res).$key = contentHashKey;
    }
    return res
  }

  /**
   * 处理动态指令的参数绑定
   * @param {Object} baseObj - 基础对象
   * @param {Array} values - 包含交替出现的键值对 (例: ['name', 'yyyao', 'age', '20'])
   * @returns {Object} (例: {name: 'yyyao', age: '20'})
   */
  function bindDynamicKeys (baseObj, values) {
    for (var i = 0; i < values.length; i += 2) {
      var key = values[i]; // 键名
      if (typeof key === 'string' && key) { // 键名满足非空字符串
        baseObj[values[i]] = values[i + 1]; // 将键值对添加到基础对象中
      } else if (key !== '' && key !== null) { // 键名为 null, 是显式移除绑定的特殊值
        warn(
          ("Invalid value for dynamic directive argument (expected string or null): " + key),
          this
        );
      }
    }
    return baseObj
  }

  /**
   * 在事件名称前动态添加修饰符运行时标记的辅助函数 (确保仅在值已经为字符串时才进行添加, 否则会被转换为字符串并导致类型检查失败)
   * @param {Any} value - 要添加修饰符的值
   * @param {String} symbol - 修饰符标记符号
   * @returns {Any}
   */
  function prependModifier (value, symbol) {
    return typeof value === 'string' ? symbol + value : value // 如果 value是字符串, 则在其前面添加 symbol
  }

  function installRenderHelpers (target) { // 安装渲染相关的函数
    target._o = markOnce; // 标记一个节点只渲染一次
    target._n = toNumber; // 将值转换为数字
    target._s = toString; // 将值转换为字符串
    target._l = renderList; // 渲染数组
    target._t = renderSlot; // 渲染插槽
    target._q = looseEqual; // 松散相等判断
    target._i = looseIndexOf; // 在数组中查找元素
    target._m = renderStatic; // 渲染静态节点
    target._f = resolveFilter; // 解析过滤器
    target._k = checkKeyCodes; // 检查按键码
    target._b = bindObjectProps; // 绑定对象属性
    target._v = createTextVNode; // 创建文本节点
    target._e = createEmptyVNode; // 创建空节点
    target._u = resolveScopedSlots; // 解析作用域插槽
    target._g = bindObjectListeners; // 绑定对象监听器
    target._d = bindDynamicKeys; // 处理动态指令的参数绑定
    target._p = prependModifier; // 增加前置修饰符标记
  }

  /**
   * 用于创建函数式组件的渲染上下文对象
   * @param {Object} data - 组件的数据
   * @param {Object} props - 组件的 props 数据
   * @param {Array} children - 子节点
   * @param {Vue} parent - 父级实例
   * @param {VueComponent} Ctor - 组件的构造函数 (包含组件选项)
   */
  function FunctionalRenderContext (
    data,
    props,
    children,
    parent,
    Ctor
  ) {
    var this$1 = this;

    var options = Ctor.options; // 从组件的构造函数中获取组件的选项
    var contextVm;
    if (hasOwn(parent, '_uid')) { // 据父级实例是否具有 _uid属性来确定函数式渲染上下文对象的实际父级实例 (以确保在功能组件中使用的 createElement函数获取到唯一的上下文)
      contextVm = Object.create(parent);
      contextVm._original = parent;
    } else { // 如果传入的父级实例也是函数式上下文, 需要确保能获取到真正的上下文实例
      contextVm = parent;
      parent = parent._original;
    }
    var isCompiled = isTrue(options._compiled); // 检查组件是否经过编译
    var needNormalization = !isCompiled; // 根据组件是否经过编译确定是否需要对组件进行标准化处理

    this.data = data; // 保存上下文信息到上下文对象上
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent); // 解析注入的依赖, 保存到渲染上下文对象上
    this.slots = function () { // 定义 slots方法, 用于获取插槽内容
      if (!this$1.$slots) {
        normalizeScopedSlots( // 解析并规范化作用域插槽
          data.scopedSlots,
          this$1.$slots = resolveSlots(children, parent) // 解析插槽内容, 将结果保存到 $slots中
        );
      }
      return this$1.$slots
    };

    Object.defineProperty(this, 'scopedSlots', ({ // 规范化 scopedSlots属性
      enumerable: true,
      get: function get () {
        return normalizeScopedSlots(data.scopedSlots, this.slots())
      }
    }));

    if (isCompiled) { // 如果组件经过编译
      this.$options = options; // 保存 $options用于 renderStatic()
      this.$slots = this.slots(); // 预解析插槽用于 renderSlot()
      this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots); // 规范化 scopedSlots属性, 以便在渲染函数中能够直接访问到 scopedSlots对象
    }

    if (options._scopeId) { // 如果组件有作用域 ID
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization); // 创建 VNode
        if (vnode && !Array.isArray(vnode)) { // 将作用域 ID和父级上下文添加到 vnode的相关属性中
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else { // 否则直接创建 VNode
      this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
    }
  }

  installRenderHelpers(FunctionalRenderContext.prototype); // 为 FunctionalRenderContext的原型对象安装渲染辅助函数

  /**
   * 创建一个函数式组件
   * @param {VueComponent} Ctor - 组件的构造函数 (包含组件选项)
   * @param {Object} propsData - 组件的 props 数据
   * @param {Object} data - 组件的数据
   * @param {Vue} contextVm - 上下文 Vue 实例
   * @param {Array} children - 子节点
   * @returns {VNode|Array} 返回生成的虚拟节点或虚拟节点数组
   */
  function createFunctionalComponent (
    Ctor,
    propsData,
    data,
    contextVm,
    children
  ) {
    var options = Ctor.options; // 组件的选项
    var props = {};
    var propOptions = options.props; // 组件的 props选项
    if (isDef(propOptions)) { // 定义了 props选项, 则验证并处理
      for (var key in propOptions) { // 遍历 props选项进行验证以及处理
        props[key] = validateProp(key, propOptions, propsData || emptyObject); // 验证并处理传入的 props数据 (处理包括获取默认值以及创建观察者)
      }
    } else { // props选项未定义, 则直接合并到 props对象中
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); } // 合并属性 (mergeProps: 合并属性)
      if (isDef(data.props)) { mergeProps(props, data.props); } // 合并 props
    }

    var renderContext = new FunctionalRenderContext( // 创建函数式渲染上下文
      data,
      props,
      children,
      contextVm,
      Ctor
    );

    var vnode = options.render.call(null, renderContext._c, renderContext); // 调用组件的 render函数, 获取 VNode

    /* 处理 render返回的 VNode或 VNode数组 */
    if (vnode instanceof VNode) { // 如果 render返回单个 VNode
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext) // 克隆 VNode并标记函数式组件结果
    } else if (Array.isArray(vnode)) { // 如果 render返回 VNode数组
      var vnodes = normalizeChildren(vnode) || []; // 规范化子节点数组
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) { // 遍历处理每个子节点的 VNode, 克隆 VNode并标记函数式组件结果
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
      }
      return res
    }
  }

  /**
   * 克隆 vnode并标记函数式组件结果
   * @param {VNode} vnode - 要克隆的 VNode
   * @param {Object} data - VNode的数据对象
   * @param {Vue} contextVm - 函数式组件的上下文 Vue实例
   * @param {Object} options - 函数式组件的选项
   * @param {Object} renderContext - 渲染上下文
   * @returns {VNode}
   */
  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
    // 在设置 fnContext之前克隆节点, 否则如果节点被重用
    // (例如来自缓存的普通插槽), fnContext会导致不应该匹配的命名插槽被匹配
    var clone = cloneVNode(vnode); // 克隆 vnode
    clone.fnContext = contextVm; // 将函数式组件的上下文赋值给克隆节点的 fnContext属性
    clone.fnOptions = options; // 将函数式组件的选项赋值给克隆节点的 fnOptions属性
    { // 开发环境下, 设置克隆节点的 devtoolsMeta.renderContext属性为传入的 renderContext
      (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
    }
    if (data.slot) { // 如果 data中存在 slot属性, 则将其赋值给克隆节点的 data.slot属性
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  /**
   * 合并props属性的方法 (将源对象中的属性合并到目标对象)
   * @param {Object} to - 目标对象
   * @param {Object} from - 源对象
   */
  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key]; // camelize: 将横线命名的字符串转换为驼峰命名
    }
  }

  var componentVNodeHooks = { // 组件 VNode在 patch过程中要调用的内联钩子
    init: function init (vnode, hydrating) { // 初始化组件 VNode
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) { // 如果当前 vnode是一个组件且没有被销毁, 并且被设置了 keepAlive
        // 对于被 keep-alive的组件, 视为 patch
        // 由于组件被 keep-alive, 所以我们需要将其视为一个 patch操作
        var mountedNode = vnode; // 为了符合 flow的要求
        componentVNodeHooks.prepatch(mountedNode, mountedNode); // 然后调用 prepatch钩子，用来处理组件的更新
      } else { // 如果没有组件实例或者组件实例已被销毁, 则创建一个新的组件实例并挂载
        var child = vnode.componentInstance = createComponentInstanceForVnode( // 创建一个新的组件实例
          vnode,
          activeInstance
        );
        child.$mount(hydrating ? vnode.elm : undefined, hydrating); // 将新的组件实例挂载到 DOM上
      }
    },

    prepatch: function prepatch (oldVnode, vnode) { // 在更新之前进行预补丁操作
      var options = vnode.componentOptions; // 获取组件的选项
      var child = vnode.componentInstance = oldVnode.componentInstance; // 获取组件实例
      updateChildComponent( // 更新子组件
        child,
        options.propsData, // 更新后的 props数据
        options.listeners, // 更新后的监听器
        vnode, // 新的父级 VNode
        options.children // 新的子节点
      );
    },

    insert: function insert (vnode) { // 在 VNode插入到 DOM中时调用
      var context = vnode.context; // 获取当前上下文
      var componentInstance = vnode.componentInstance; // 获取组件实例
      if (!componentInstance._isMounted) { // 如果组件尚未挂载
        componentInstance._isMounted = true; // 设置组件实例为已挂载状态
        callHook(componentInstance, 'mounted'); // 调用组件的 mounted钩子函数
      }
      if (vnode.data.keepAlive) { // 如果组件被设置为 keepAlive
        if (context._isMounted) { // 如果父组件已经挂载
          // 由于在更新期间, 保持活动状态的组件的子组件可能会变化,
          // 因此直接遍历整个树可能会调用错误的 activated钩子,
          // 相反, 我们将它们推入队列中, 在整个 patch过程结束后处理
          queueActivatedComponent(componentInstance);
        } else { // 如果父组件尚未挂载, 则直接激活组件
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },

    destroy: function destroy (vnode) { // 在组件销毁时调用
      var componentInstance = vnode.componentInstance; // 获取组件实例
      if (!componentInstance._isDestroyed) { // 如果组件实例未被销毁
        if (!vnode.data.keepAlive) {// 如果组件没有设置 keepAlive, 则销毁组件
          componentInstance.$destroy();
        } else { // 否则直接停用组件
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks); // 收集组件的所有钩子函数的名称 (以便后续的合并操作)
 
  /**
   * 创建组件 VNode
   * @param {Component} Ctor - 组件构造函数
   * @param {Object} data - VNode数据
   * @param {Component} context - 组件实例上下文
   * @param {Array} children - 子节点
   * @param {String} tag - 标签名
   * @returns {VNode}
   */
  function createComponent (
    Ctor,
    data,
    context,
    children,
    tag
  ) {
    if (isUndef(Ctor)) { // 如果组件构造函数未定义, 直接返回
      return
    }

    var baseCtor = context.$options._base; // 获取基础构造函数

    if (isObject(Ctor)) { // 如果组件配置为普通对象, 则转换为构造函数
      Ctor = baseCtor.extend(Ctor);
    }

    if (typeof Ctor !== 'function') { // 如果此时不是构造函数或异步组件工厂函数, 则发出警告并返回
      {
        warn(("Invalid Component definition: " + (String(Ctor))), context);
      }
      return
    }

    var asyncFactory; // 异步组件
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor; // 将组件构造函数赋值给异步组件的工厂函数
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor); // 通过异步组件的工厂函数解析获取组件构造函数 (确保 Ctor是一个有效的组件构造函数)
      if (Ctor === undefined) {
        return createAsyncPlaceholder( // 返回一个异步组件的占位符节点, 以注释节点渲染, 但保留节点的所有原始信息 (该信息将用于异步服务器端渲染和水合作用)
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {}; // 初始化 data

    resolveConstructorOptions(Ctor); // 解析构造函数的选项, 以便处理全局混入项

    if (isDef(data.model)) { // 将组件 VNode数据中的 v-model转换为 props和 事件处理程序/event
      transformModel(Ctor.options, data);
    }

    var propsData = extractPropsFromVNodeData(data, Ctor, tag); // 从 VNode数据中提取 props

    if (isTrue(Ctor.options.functional)) { // 函数式组件: 使组件无状态(没有 data)和无实例(没有 this上下文)
      return createFunctionalComponent(Ctor, propsData, data, context, children) // 创建函数式组件
    }

    var listeners = data.on; // 从 VNode数据中提取事件监听器, 由于这些需要被视为子组件的监听器而不是 DOM监听器
    data.on = data.nativeOn; // 使用 .native修饰符替换监听器, 以便在父组件的补丁期间处理

    if (isTrue(Ctor.options.abstract)) { // 抽象组件 (仅保留 props, 监听器和插槽)
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    installComponentHooks(data); // 安装组件管理钩子到占位符节点

    var name = Ctor.options.name || tag; // 创建一个占位符 vnode
    var vnode = new VNode(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    return vnode
  }

  /**
   * 为 vnode创建组件实例
   * @param {VNode} vnode - 虚拟节点
   * @param {Vue|VueComponent} vm - 父级组件实例
   * @returns {VueComponent}
   */
  function createComponentInstanceForVnode (vnode, parent) {
    var options = { // 创建组件实例的选项对象
      _isComponent: true, // 标记为组件实例
      _parentVnode: vnode, // 当前 vnode
      parent: parent // 父组件实例
    };
    var inlineTemplate = vnode.data.inlineTemplate; // 检查是否存在内联模板的渲染函数
    if (isDef(inlineTemplate)) { // 如果存在内联模板, 则设置渲染函数和静态渲染函数
      options.render = inlineTemplate.render; // 设置渲染函数
      options.staticRenderFns = inlineTemplate.staticRenderFns; // 设置静态渲染函数
    }
    return new vnode.componentOptions.Ctor(options) // 使用 vnode的组件构造函数来创建一个新的组件实例返回
  }

  /**
   * 安装组件的钩子函数
   * @param {Object} data - 组件的数据对象
   */
  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {}); // 获取组件的钩子函数对象
    for (var i = 0; i < hooksToMerge.length; i++) { // 遍历需要合并的钩子函数列表
      var key = hooksToMerge[i]; // 获取当前需要合并的钩子函数名称
      var existing = hooks[key]; // 获取已存在的钩子函数
      var toMerge = componentVNodeHooks[key]; // 获取要合并的组件 VNode钩子函数
      if (existing !== toMerge && !(existing && existing._merged)) { // 如果已存在的钩子函数不等于要合并的钩子函数, 并且已存在的钩子函数不是已合并过的
        hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge; // 合并钩子函数
      }
    }
  }

  /**
   * 合并两个钩子函数
   * @param {Function} f1 - 第一个钩子函数
   * @param {Function} f2 - 第二个钩子函数
   * @returns {Function}
   */
  function mergeHook$1 (f1, f2) {
    var merged = function (a, b) { // 合并两个钩子函数, 同时执行它们
      f1(a, b);
      f2(a, b);
    };
    merged._merged = true; // 标记这个钩子函数已经被合并过
    return merged // 返回合并后的钩子函数
  }

  /**
   * 将组件的 v-model指令转换为 prop和 事件处理程序/event
   * @param {Object} options - 包含模型信息的选项对象
   * @param {Object} data - 表示组件数据的数据对象
   */
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value'; // 确定 v-model的 prop名称 (默认为 value)
    var event = (options.model && options.model.event) || 'input' // // 确定 v-model的事件名称 (默认为 input)
    ;(data.attrs || (data.attrs = {}))[prop] = data.model.value; // 将 v-model的值分配给指定的 prop
    var on = data.on || (data.on = {}); // 初始化事件处理程序对象
    var existing = on[event]; // 检查事件是否已存在处理程序
    var callback = data.model.callback; // 获取 v-model的回调函数
    if (isDef(existing)) { // 如果事件已存在处理程序
      if (
        Array.isArray(existing)
          ? existing.indexOf(callback) === -1
          : existing !== callback
      ) { // 检查回调函数是否已添加到现有的事件处理程序中
        on[event] = [callback].concat(existing); // 将回调函数添加到数组中
      }
    } else { // 如果事件处理程序不存在, 则直接赋值回调函数
      on[event] = callback;
    }
  }

  var SIMPLE_NORMALIZE = 1; // 表示简单的规范化模式 (不会对子节点进行深层次的遍历和处理, 而只是简单地将子节点的数组扁平化, 去除其中的空白节点)
  var ALWAYS_NORMALIZE = 2; // 表示始终规范化模式 (无论子节点的类型是什么, 都会进行深层次的遍历和处理, 以确保所有子节点都符合一定的格式)

  /**
   * 创建虚拟节点 (VNode)
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {String|Object} tag - VNode 的标签名或组件配置对象
   * @param {Object} data - VNode 数据对象
   * @param {Array} children - 子节点数组
   * @param {Number} normalizationType - 子节点规范化类型
   * @param {Boolean} alwaysNormalize - 是否总是规范化子节点
   * @returns {VNode}
   */
  function createElement (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive(data)) { // 如果 data是数组或者是原始值(字符串, 数字等), 则将它视为 children, data重置为 undefined
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) { // 如果 alwaysNormalize参数设置为 true, 则强制进行规范化处理
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType) // 创建虚拟节点
  }

  /**
   * 建一个虚拟节点 (VNode)
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {String|Object} tag - VNode 的标签名或组件配置对象
   * @param {Object} data - VNode 的数据对象
   * @param {Array} children - VNode 的子节点数组
   * @param {Number} normalizationType - 规范化的类型
   * @param {Boolean} alwaysNormalize - 是否始终规范化
   * @returns {VNode}
   */
  function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) { // 如果 data是响应式数据对象, 则发出警告, 并返回一个注释节点的虚拟节点
      warn(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode() // 创建一个注释节点的虚拟节点
    }
    if (isDef(data) && isDef(data.is)) { // 如果 data中有 is属性, 则将 tag更新为 is的值
      tag = data.is;
    }
    if (!tag) { // 如果 tag不存在, 则返回一个注释节点的虚拟节点
      return createEmptyVNode() // 创建一个注释节点的虚拟节点
    }
    if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)
    ) { // 如果 data中定义了非基本类型的 key, 则发出警告
      {
        warn(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) { // 如果 children是一个函数, 则认为是默认作用域插槽, 并将其转换为作用域插槽对象
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) { // 根据 normalizationType对 children进行规范化处理
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') { // 标签名存在, 当前节点是一个普通的 HTML元素或者组件的标签名
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag); // 获取命名空间
      if (config.isReservedTag(tag)) { // 平台内置标签
        if (isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') { // 在非组件上使用 v-on的修饰符 native, 控制台发出警告
          warn(
            ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
            context
          );
        }
        vnode = new VNode( // 创建 VNode对象
          config.parsePlatformTagName(tag), data, children, // parsePlatformTagName: 解析平台标签名
          undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) { // 组件
        vnode = createComponent(Ctor, data, context, children, tag); // 创建组件 VNode对象
      } else { // 未知元素或未列出的命名空间元素
        vnode = new VNode( // 创建 VNode对象
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else { // 直接使用组件选项或构造函数
      vnode = createComponent(tag, data, context, children); // 创建组件 VNode对象
    }
    if (Array.isArray(vnode)) { // 如果 vnode是数组, 则直接返回数组
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); } // 如果存在命名空间, 则应用命名空间
      if (isDef(data)) { registerDeepBindings(data); } // 如果 data存在, 则注册深度绑定
      return vnode
    } else {
      return createEmptyVNode() // 创建一个注释节点的虚拟节点
    }
  }

  /**
   * 在 VNode 树中应用命名空间
   * @param {VNode} vnode - 虚拟节点
   * @param {String} ns - 命名空间
   * @param {Boolean} force - 是否强制应用命名空间
   */
  function applyNS (vnode, ns, force) {
    vnode.ns = ns; // 设置当前 VNode的命名空间
    if (vnode.tag === 'foreignObject') { // 对于 <foreignObject>标签, 需要使用默认命名空间
      ns = undefined; // 在 <foreignObject>标签内部使用默认命名空间
      force = true; // 强制重新应用命名空间
    }
    if (isDef(vnode.children)) { // 如果当前 VNode有子节点, 则递归应用命名空间
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        // 对于子节点, 如果它没有命名空间, 或需要强制重新应用命名空间, 并且不是 <svg>标签, 则递归应用命名空间
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  /**
   * 注册深层绑定 (以确保当在插槽节点上使用了深层绑定 (例: `:style`, `:class`), 父组件能够正确地重新渲染)
   * @param {Object} data - AST 节点对象中的数据
   */
  function registerDeepBindings (data) {
    if (isObject(data.style)) { // 检查 style是对象类型, 对其进行深度遍历
      traverse(data.style);
    }
    if (isObject(data.class)) { // 检查 class是对象类型, 对其进行深度遍历
      traverse(data.class);
    }
  }

  /**
   * 初始化渲染相关属性和方法
   * @param {Vue} vm - Vue 实例
   */
  function initRender (vm) {
    vm._vnode = null; // 子树的根节点
    vm._staticTrees = null; // v-once缓存的树
    var options = vm.$options; // 获取 Vue实例的选项
    var parentVnode = vm.$vnode = options._parentVnode; // 获取父树中的占位符节点, 即当前组件在父组件中的 VNode
    var renderContext = parentVnode && parentVnode.context; // 渲染上下文
    vm.$slots = resolveSlots(options._renderChildren, renderContext); // 解析插槽
    vm.$scopedSlots = emptyObject; // 作用域插槽为空对象
    vm._c = function (a, b, c, d) { // 绑定 createElement函数到 Vue实例, 以获取正确的渲染上下文
      return createElement(vm, a, b, c, d, false);
    };
    vm.$createElement = function (a, b, c, d) { // 对于用户编写的渲染函数, 始终进行规范化处理
      return createElement(vm, a, b, c, d, true);
    };

    var parentData = parentVnode && parentVnode.data; // 获取父 VNode数据

    { //  $attrs和 $listeners暴露出来, 以便更容易地创建高阶组件, 它们需要是响应式的, 以便使用它们的 HOC总是更新
      // 定义 $attrs属性, 用于存放父组件传递过来的非 prop特性
      defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
        !isUpdatingChildComponent && warn("$attrs is readonly.", vm); // 非正在更新的子组件下, 警告 $attrs是只读的
      }, true);
      // 定义 $listeners属性, 用于存放父组件传递过来的监听事件
      defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
        !isUpdatingChildComponent && warn("$listeners is readonly.", vm); // 非正在更新的子组件下, 警告 $listeners是只读的
      }, true);
    }
  }

  var currentRenderingInstance = null; // 用于存储当前正在渲染的 Vue实例
  /**
   * 将渲染相关的方法添加到 Vue原型上
   * @param {VueConstructor} Vue - Vue构造函数
   */
  function renderMixin (Vue) {
    installRenderHelpers(Vue.prototype); // 安装运行时辅助函数

    Vue.prototype.$nextTick = function (fn) { // 用于在 DOM更新之后执行回调
      return nextTick(fn, this)
    };

    Vue.prototype._render = function () { // 用于生成虚拟 DOM
      var vm = this;
      var ref = vm.$options;
      var render = ref.render; // 渲染函数
      var _parentVnode = ref._parentVnode; // 父级 VNode

      if (_parentVnode) { // 处理作用域插槽
        vm.$scopedSlots = normalizeScopedSlots(
          _parentVnode.data.scopedSlots,
          vm.$slots,
          vm.$scopedSlots
        );
      }

      vm.$vnode = _parentVnode; // 设置当前组件的父级 vnode, 这允许渲染函数访问占位符节点上的数据
      var vnode;
      // 渲染自身
      try {
        currentRenderingInstance = vm;// 设置当前渲染的实例
        vnode = render.call(vm._renderProxy, vm.$createElement); // 调用渲染函数, 渲染视图
      } catch (e) { // 处理渲染错误
        handleError(e, vm, "render");
        if (vm.$options.renderError) { // 返回错误渲染结果, 或者之前的 vnode以防止渲染错误导致空白组件
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError(e, vm, "renderError"); // 处理渲染错误
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance = null; // 清空当前渲染实例
      }
      if (Array.isArray(vnode) && vnode.length === 1) { // 如果返回的数组中只包含一个节点, 设置它为根节点
        vnode = vnode[0];
      }
      if (!(vnode instanceof VNode)) { // 如果渲染函数发生错误, 则返回一个空的 VNode
        if (Array.isArray(vnode)) { // 如果渲染结果是一个数组, 则发出警告
          warn(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
          );
        }
        vnode = createEmptyVNode(); // 创建一个空的 VNode
      }

      vnode.parent = _parentVnode;  // 设置父级
      return vnode
    };
  }

  /**
   * 确保组件构造器的正确性
   * @param {Object|Function} comp - 组件对象或构造函数
   * @param {Function} base - Vue 的基础构造函数
   * @returns {Function} - 返回合适的 Vue构造函数
   */
  function ensureCtor (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol && comp[Symbol.toStringTag] === 'Module')
    ) { // 如果组件是一个 ES模块对象, 则取其 default属性作为组件
      comp = comp.default;
    }
    return isObject(comp) // 如果 comp是一个对象, 则使用 base.extend(comp)来创建一个 Vue构造函数
      ? base.extend(comp)
      : comp // 否则直接返回 comp
  }

  /**
   * 创建异步组件的占位符 VNode
   * @param {Function} factory - 异步组件工厂函数
   * @param {Object} data - VNode数据
   * @param {Component} context - 组件实例上下文
   * @param {Array} children - 子节点
   * @param {string} tag - 标签名
   * @returns {VNode}
   */
  function createAsyncPlaceholder (
    factory,
    data,
    context,
    children,
    tag
  ) {
    var node = createEmptyVNode(); // 创建一个空的 VNode
    node.asyncFactory = factory; // 将异步组件工厂函数保存在 VNode上
    node.asyncMeta = { // 保存异步组件的元数据 (包括数据, 上下文, 子节点和标签名)
      data: data, context: context, children: children, tag: tag
    };
    return node
  }

  /**
   * 解析异步组件, 返回组件构造函数 TODO
   * @param {Function} factory - 异步组件的工厂函数
   * @param {Object} baseCtor - Vue基本构造函数
   * @returns {Function} 
   */
  function resolveAsyncComponent (
    factory,
    baseCtor
  ) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) { // 如果异步组件工厂函数的 error属性为 true, 并且存在 errorComp, 则返回 errorComp
      return factory.errorComp
    }

    if (isDef(factory.resolved)) { // 如果异步组件已经解析完毕, 则直接返回解析后的组件构造函数
      return factory.resolved
    }

    var owner = currentRenderingInstance; // 获取当前渲染的 Vue实例
    // 如果当前渲染的 Vue实例存在, 且异步组件的所有者列表中不存在当前实例, 则将当前实例加入到所有者列表中
    if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
      factory.owners.push(owner); // 添加到 owners数组中
    }

    if (isTrue(factory.loading) && isDef(factory.loadingComp)) { // 异步组件当前正在加载中且存在加载组件
      return factory.loadingComp // 则返回加载组件, 以便在组件加载过程中显示加载状态
    }

    if (owner && !isDef(factory.owners)) { // 如果当前渲染的 Vue实例存在, 并且异步组件的所有者列表不存在, 则初始化所有者列表
      var owners = factory.owners = [owner]; // 初始化所有者列表
      var sync = true; // 是否为同步解析
      var timerLoading = null; // loading的计时器
      var timerTimeout = null; // 超时的计时器

      (owner).$on('hook:destroyed', function () { return remove(owners, owner); }); // Vue实例销毁时, 从 owners数组中移除

      var forceRender = function (renderCompleted) { // 强制重新渲染组件
        for (var i = 0, l = owners.length; i < l; i++) {
          (owners[i]).$forceUpdate(); // 手动触发强制更新
        }

        if (renderCompleted) {
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };

      var resolve = once(function (res) { // 解析成功的回调函数, 用于缓存解析结果, 并触发重新渲染
        factory.resolved = ensureCtor(res, baseCtor); // 缓存解析结果
        if (!sync) { // 如果不是同步解析, 则触发重新渲染
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });

      var reject = once(function (reason) { // 解析失败的回调函数, 用于发出警告, 并且如果存在 errorComp, 则设置 error为 true, 并触发重新渲染
        warn(
          "Failed to resolve async component: " + (String(factory)) +
          (reason ? ("\nReason: " + reason) : '')
        );
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });

      var res = factory(resolve, reject); // 执行异步组件工厂函数, 并传入 resolve和 reject函数

      if (isObject(res)) { // 如果返回值是一个对象
        if (isPromise(res)) { // 如果返回值是一个 Promise
          if (isUndef(factory.resolved)) { // 如果还没有解析成功, 则通过 then方法继续等待解析结果
            res.then(resolve, reject);
          }
        } else if (isPromise(res.component)) { // 如果返回值是一个包含 component的 Promise
          res.component.then(resolve, reject);

          if (isDef(res.error)) { // 如果返回值中包含 error, 则缓存 errorComp
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }

          if (isDef(res.loading)) { // 如果返回值中包含 loading, 则缓存 loadingComp, 并设置 loading为 true
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else { // 设置 loading为 true, 并设置 loading延迟
              timerLoading = setTimeout(function () {
                timerLoading = null;
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }

          if (isDef(res.timeout)) { // 如果返回值中包含 timeout, 则设置超时
            timerTimeout = setTimeout(function () {
              timerTimeout = null;
              if (isUndef(factory.resolved)) {
                reject(
                  "timeout (" + (res.timeout) + "ms)"
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false; // 标记异步解析完成

      return factory.loading // 如果是 loading状态, 则返回 loadingComp; 否则返回 resolved
        ? factory.loadingComp
        : factory.resolved
    }
  }

 /**
   * 从子组件数组中获取第一个真实的子组件
   * @param {Array} children - 子组件数组
   * @returns {VNode}
   */
  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) { // 遍历子组件数组
        var c = children[i];
        // 检查当前子组件是否已定义且是一个组件, 或是一个异步组件的占位符
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c // 返回第一个真实的子组件
        }
      }
    }
  }

  /**
   * 初始化组件事件
   * @param {Vue} vm - Vue 实例
   */
  function initEvents (vm) {
    vm._events = Object.create(null); // 创建一个空对象作为事件容器
    vm._hasHookEvent = false; // 标记当前组件是否有钩子事件
    var listeners = vm.$options._parentListeners; // 获取父组件绑定的事件
    if (listeners) { // 更新组件的事件监听器
      updateComponentListeners(vm, listeners);
    }
  }

  var target; // 事件的目标对象
  /**
   * 向目标对象添加事件监听器
   * @param {SVGAnimateTransformElementtring} event - 事件名称
   * @param {Function} fn - 事件处理函数
   */
  function add (event, fn) {
    target.$on(event, fn);
  }

  /**
   * 从目标对象移除事件监听器
   * @param {String} event - 事件名称
   * @param {Function} fn - 事件处理函数
   */
  function remove$1 (event, fn) {
    target.$off(event, fn);
  }

  /**
   * 创建一个一次性事件处理函数
   * @param {string} event - 事件名称
   * @param {Function} fn - 事件处理函数
   * @returns {Function}
   */
  function createOnceHandler (event, fn) {
    var _target = target; // 获取事件的目标对象
    return function onceHandler () { // 返回一个闭包函数, 作为一次性事件处理函数
      var res = fn.apply(null, arguments); // 调用原始的事件处理函数, 并传入参数
      if (res !== null) { // 如果事件处理函数返回的结果不为 null, 则在事件目标对象上移除该事件处理函数
        _target.$off(event, onceHandler);
      }
    }
  }

  /**
   * 更新组件的事件监听器
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Object} listeners - 新的事件监听器
   * @param {Object} [oldListeners] - 旧的事件监听器
   */
  function updateComponentListeners (
    vm,
    listeners,
    oldListeners
  ) {
    target = vm; // 将当前组件作为事件的目标对象
    updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm); // 更新事件监听器
    target = undefined; // 重置事件的目标对象
  }

  /**
   * 事件系统的 mixin, 在 Vue的原型上添加了 $on, $once, $off, $emit方法
   * @param {Vue} Vue - Vue 构造函数
   */
  function eventsMixin (Vue) {
    var hookRE = /^hook:/; // 用于匹配钩子事件的正则表达式
    Vue.prototype.$on = function (event, fn) { // 用于添加监听事件
      var vm = this;
      if (Array.isArray(event)) { // 如果事件名是数组, 则递归调用 $on方法
        for (var i = 0, l = event.length; i < l; i++) {
          vm.$on(event[i], fn);
        }
      } else { // 不是数组, 则将事件处理函数添加到事件数组中
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        if (hookRE.test(event)) { // 如果事件是钩子事件, 设置标志位为 true
          vm._hasHookEvent = true;
        }
      }
      return vm // 链式调用
    };

    Vue.prototype.$once = function (event, fn) { // 用于添加监听事件, 但事件只触发一次, 触发后即被移除
      var vm = this;
      function on () { // 定义一次性事件处理函数
        vm.$off(event, on); // 移除事件监听器
        fn.apply(vm, arguments); // 调用原始的事件处理函数
      }
      on.fn = fn; // 将原始事件处理函数保存在 on.fn中
      vm.$on(event, on); // 添加事件监听器
      return vm // 链式调用
    };

    Vue.prototype.$off = function (event, fn) { // 用于移除事件监听器
      var vm = this;
      if (!arguments.length) { // 移除所有事件
        vm._events = Object.create(null);
        return vm
      }
      if (Array.isArray(event)) { // 移除多个事件
        for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
          vm.$off(event[i$1], fn);
        }
        return vm
      }
      var cbs = vm._events[event]; // 移除特定事件
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      var cb; // 移除特定事件处理函数
      var i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break
        }
      }
      return vm // 链式调用
    };

    Vue.prototype.$emit = function (event) { // 用于触发事件
      var vm = this;
      {
        var lowerCaseEvent = event.toLowerCase(); // 将事件名转为小写
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) { // 如果事件名与小写事件名不同, 并且小写事件名对应的事件监听器存在, 则发出警告
          tip(
            "Event \"" + lowerCaseEvent + "\" is emitted in component " +
            (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
            "Note that HTML attributes are case-insensitive and you cannot use " +
            "v-on to listen to camelCase events when using in-DOM templates. " +
            "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
          );
        }
      }
      var cbs = vm._events[event]; // 获取事件监听器数组
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs; // 如果存在多个事件监听器, 则转为数组
        var args = toArray(arguments, 1); // 获取传递给事件处理函数的参数
        var info = "event handler for \"" + event + "\"";
        for (var i = 0, l = cbs.length; i < l; i++) { // 遍历事件监听器数组, 执行事件处理函数
          invokeWithErrorHandling(cbs[i], vm, args, vm, info);
        }
      }
      return vm // 链式调用
    };
  }

  var activeInstance = null; // 当前活动的 Vue实例
  var isUpdatingChildComponent = false; // 是否正在更新子组件
  /**
   * 设置当前活动的 Vue 实例
   * @param {Vue|VueComponent} vm - 当前活动的 Vue实例或组件实例
   * @returns {Function} 返回一个函数, 用于恢复之前的活动 Vue实例
   */
  function setActiveInstance(vm) {
    var prevActiveInstance = activeInstance; // 保存之前的活动实例
    activeInstance = vm; // 设置当前活动的 Vue实例为参数 vm
    return function () { // 返回一个函数, 用于恢复之前的活动 Vue实例
      activeInstance = prevActiveInstance;
    }
  }

  /**
   * 初始化 Vue实例的生命周期相关属性
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   */
  function initLifecycle (vm) {
    var options = vm.$options; // 获取 Vue实例的选项对象

    var parent = options.parent;
    if (parent && !options.abstract) { // 查找第一个非抽象的父级组件
      while (parent.$options.abstract && parent.$parent) { // 如果存在父级组件, 并且当前组件不是抽象的
        parent = parent.$parent; // 循环查找非抽象的父级组件
      }
      parent.$children.push(vm); // 将当前组件添加到父级组件的 $children数组中
    }

    vm.$parent = parent; // 设置当前组件的父级组件
    vm.$root = parent ? parent.$root : vm; // 设置当前组件的根组件

    vm.$children = []; // 子组件数组
    vm.$refs = {}; // ref 引用对象

    /* 初始化一些状态标志 */
    vm._watcher = null; // 观察者对象
    vm._inactive = null; // 非活动状态
    vm._directInactive = false; // 直接非活动状态
    vm._isMounted = false; // 是否已挂载
    vm._isDestroyed = false; // 是否已销毁
    vm._isBeingDestroyed = false; // 是否正在销毁
  }

  /**
   * Vue 生命周期相关的混入 (包含更新视图, 强制更新, 销毁组件的方法)
   * @param {Vue} Vue - Vue 构造函数
   */
  function lifecycleMixin (Vue) {
    /**
     * 更新视图方法, 用于更新组件的 DOM结构
     * @param {VNode} vnode - 新的虚拟节点
     * @param {Boolean} hydrating - 是否是服务端渲染的激活阶段
     */
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      var prevEl = vm.$el; // 之前的根 DOM元素
      var prevVnode = vm._vnode; // 之前的虚拟节点, 可判断是否是第一次渲染
      var restoreActiveInstance = setActiveInstance(vm); // 设置当前活动的 Vue实例, 并返回一个恢复函数
      vm._vnode = vnode; // 将组件第一次产生的虚拟 DOM保存到 _vnode上 (是否初次渲染的标识)
      if (!prevVnode) { // 如果之前的虚拟节点不存在, 表示是首次渲染
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */); // 调用 Vue的渲染函数 __patch__进行更新
      } else { // 否则表示是更新渲染
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      restoreActiveInstance(); // 恢复之前的活动 Vue实例
      /* 更新 __vue__ 引用 */
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) { // 如果父组件是高阶组件, 则也需要更新其 $el属性
        vm.$parent.$el = vm.$el;
      }
      // updated 钩子会被调用, 确保子组件在父组件的 updated钩子中被更新
    };

    Vue.prototype.$forceUpdate = function () { // 强制更新视图
      var vm = this;
      if (vm._watcher) { // 主动触发当前视图的更新方法 (update)
        vm._watcher.update();
      }
    };

    Vue.prototype.$destroy = function () { // 销毁组件实例
      var vm = this;
      if (vm._isBeingDestroyed) { // 如果已经在销毁中, 则直接返回
        return
      }
      callHook(vm, 'beforeDestroy'); // 调用 beforeDestroy钩子
      vm._isBeingDestroyed = true; // 设置正在销毁标志为 true
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) { // 从父组件的 $children数组中移除自身
        remove(parent.$children, vm);
      }
      /* 销毁观察者 */
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      if (vm._data.__ob__) { // 从数据观察对象中移除对当前实例的引用
        vm._data.__ob__.vmCount--;
      }
      vm._isDestroyed = true; // 设置销毁标志为 true
      vm.__patch__(vm._vnode, null); // 调用 __patch__方法销毁当前组件的渲染树
      callHook(vm, 'destroyed'); // 调用 destroyed钩子
      vm.$off(); // 移除所有实例监听器
      if (vm.$el) { // 移除 __vue__引用
        vm.$el.__vue__ = null;
      }
      if (vm.$vnode) { // 解除 $vnode的父组件引用
        vm.$vnode.parent = null;
      }
    };
  }

  /**
   * 挂载 Vue 组件到 DOM 元素上
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Element} el - 要挂载的 DOM元素
   * @param {Boolean} hydrating - 是否为服务端渲染
   * @returns {Vue}
   */
  function mountComponent (vm, el, hydrating) {
    vm.$el = el; // 将 DOM元素挂载到 Vue实例的 $el属性上
    if (!vm.$options.render) { // 如果 Vue实例的选项中没有 render函数, 则设置一个空的渲染函数
      vm.$options.render = createEmptyVNode;
      { // 如果 template或 el选项没有定义, 给出警告信息
        if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
          vm.$options.el || el) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook(vm, 'beforeMount'); // 调用生命周期钩子函数 beforeMount

    var updateComponent; // 定义更新组件的函数
    if (config.performance && mark) { // 如果启用了性能监控且支持 performance API, 则使用性能监控
      updateComponent = function () {
        var name = vm._name; // 获取组件名称
        var id = vm._uid; // 获取组件唯一标识
        var startTag = "vue-perf-start:" + id;
        var endTag = "vue-perf-end:" + id;

        mark(startTag); // 开始性能监控
        var vnode = vm._render(); // 生成虚拟 DOM
        mark(endTag); // 结束性能监控
        measure(("vue " + name + " render"), startTag, endTag); // 记录性能

        mark(startTag); // 开始性能监控
        vm._update(vnode, hydrating); // 更新 DOM
        mark(endTag); // 结束性能监控
        measure(("vue " + name + " patch"), startTag, endTag); // 记录性能
      };
    } else { // 如果没有启用性能监控, 则直接更新组件
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    new Watcher(vm, updateComponent, noop, { // 创建渲染 watcher
      before: function before () {
        if (vm._isMounted && !vm._isDestroyed) { // 在更新之前调用 beforeUpdate钩子函数
          callHook(vm, 'beforeUpdate');
        }
      }
    }, true /* isRenderWatcher */);
    hydrating = false; // 标记为非服务端渲染

    if (vm.$vnode == null) { // 如果 $vnode为空, 表示当前是根 Vue实例, 需要手动调用 mounted钩子函数
      vm._isMounted = true; // 标记为已挂载
      callHook(vm, 'mounted'); // 调用 mounted钩子函数
    }
    return vm
  }

   /**
   * 更新子组件
   * @param {Vue} vm - Vue 实例
   * @param {Object} propsData - 组件的 props数据
   * @param {Object} listeners - 组件的监听器
   * @param {VNode} parentVnode - 父级 VNode
   * @param {VNode[]} renderChildren - 组件的渲染子节点
   */
  function updateChildComponent (
    vm,
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    { // 标记正在更新子组件
      isUpdatingChildComponent = true;
    }

    /* 获取父级 VNode中的静态插槽和动态作用域插槽 */
    var newScopedSlots = parentVnode.data.scopedSlots; // 新的作用域插槽
    var oldScopedSlots = vm.$scopedSlots; // 旧的作用域插槽
    var hasDynamicScopedSlot = !!( // 判断组件是否具有动态作用域插槽
      (newScopedSlots && !newScopedSlots.$stable) || // 检查是否有新的动态作用域插槽
      (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) || // 检查是否有旧的动态作用域插槽
      (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) || // 检查新旧作用域插槽的 key是否相同
      (!newScopedSlots && vm.$scopedSlots.$key) // 检查是否有被删除的动态作用域插槽
    );

    var needsForceUpdate = !!( // 如果具有新的静态插槽, 旧的静态插槽或动态作用域插槽已更改, 则需要强制更新以确保正确性
      renderChildren ||               // 具有新的静态插槽
      vm.$options._renderChildren ||  // 具有旧的静态插槽
      hasDynamicScopedSlot
    );

    vm.$options._parentVnode = parentVnode; // 更新组件的父级 VNode
    vm.$vnode = parentVnode; // 更新 Vue实例的占位符节点, 不重新渲染

    if (vm._vnode) { // 更新子树的父级
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren; // 更新组件的渲染子节点

    /* 更新 $attrs和 $listeners哈希表 (这些也是响应式的, 因此如果在渲染期间子组件使用它们, 可能会触发子组件的更新) */
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    if (propsData && vm.$options.props) { // 更新 props
      toggleObserving(false); // 禁用观察者以在组件的更新计算中使用
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props;
        props[key] = validateProp(key, propOptions, propsData, vm); // 验证并处理传入的 props数据 (处理包括获取默认值以及创建观察者)
      }
      toggleObserving(true); // 启用观察者
      vm.$options.propsData = propsData; // 保留原始 propsData的副本
    }

    listeners = listeners || emptyObject; // 更新监听器
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    if (needsForceUpdate) { // 解析插槽并强制更新子节点
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate(); // 强制更新视图
    }

    { // 更新子组件完成
      isUpdatingChildComponent = false;
    }
  }

  /**
   * 检查组件是否位于非活动树中
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @returns {Boolean}
   */
  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) { // 从当前组件开始向上遍历父组件
      if (vm._inactive) { return true } // 如果遇到一个父级组件是非活动状态, 返回 true
    }
    return false
  }

  /**
   * 激活子组件
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Boolean} direct - 是否是直接激活的标志
   */
  function activateChildComponent (vm, direct) {
    if (direct) { // 如果是直接激活, 则设置组件为非活动状态
      vm._directInactive = false;
      if (isInInactiveTree(vm)) { // 如果组件位于非活动树中, 则直接返回
        return
      }
    } else if (vm._directInactive) { // 如果不是直接激活, 但组件的 _directInactive为 true, 说明组件之前被直接设置为非活动状态, 直接返回
      return
    }
    if (vm._inactive || vm._inactive === null) { // 如果组件处于非活动状态或者未设置为活动状态
      vm._inactive = false; // 表示组件被激活
      for (var i = 0; i < vm.$children.length; i++) { // 遍历子组件, 逐个激活子组件
        activateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'activated'); // 调用组件的 activated钩子函数
    }
  }

  /**
   * 将子组件设置为非活动状态
   * @param {Vue|VueComponent} vm - Vue 实例或组件实例
   * @param {Boolean} direct - 是否直接设置为非活动状态
   */
  function deactivateChildComponent (vm, direct) {
    if (direct) { // direct为 true, 直接设置为非活动状态
      vm._directInactive = true; // 标记为直接非活动状态
      if (isInInactiveTree(vm)) {// 如果组件在非活动树中, 直接返回
        return
      }
    }
    if (!vm._inactive) { // 如果组件之前不是非活动状态
      vm._inactive = true; // 设置为非活动状态
      for (var i = 0; i < vm.$children.length; i++) { // 遍历子组件, 递归设置为非活动状态
        deactivateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'deactivated'); // 触发 deactivated生命周期钩子
    }
  }

  /**
   * 调用 Vue实例或组件的生命周期钩子函数
   * @param {Vue|VueComponent} vm - Vue 实例或组件实例
   * @param {String} hook - 生命周期钩子名称
   */
  function callHook (vm, hook) {
    pushTarget(); // 禁用依赖收集, 以防在调用生命周期钩子时收集不必要的依赖
    var handlers = vm.$options[hook]; // 获取生命周期钩子函数数组
    var info = hook + " hook"; // 定义错误信息
    if (handlers) { // 遍历执行生命周期钩子函数
      for (var i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling(handlers[i], vm, null, vm, info); // 执行事件处理函数, 并在执行过程中进行错误处理
      }
    }
    if (vm._hasHookEvent) { // 如果组件实例有注册生命周期钩子的事件, 也触发相应事件
      vm.$emit('hook:' + hook);
    }
    popTarget(); // 恢复依赖收集
  }

  var MAX_UPDATE_COUNT = 100; // 定义了更新的最大次数 (用于避免无限循环更新)

  var queue = []; // 用于存储需要执行的 watcher
  var activatedChildren = []; // 存储激活的子组件
  var has = {}; // 存储已经存在于队列中的 watcher
  var circular = {}; // 用于检测循环依赖的 watcher
  var waiting = false; // 表示是否有 watcher正在等待被处理
  var flushing = false; // 示是否正在执行 flushSchedulerQueue函数
  var index = 0; // 表示当前处理的 watcher的索引

  /**
   * 重置调度器的状态
   */
  function resetSchedulerState () {
    index = queue.length = activatedChildren.length = 0; // 清空队列和激活的子组件列表
    has = {}; // 置空存储已经存在于队列中的 watcher
    { // 置空用于检测循环依赖的watcher
      circular = {};
    }
    waiting = flushing = false; // 重置等待和刷新的状态
  }

  var currentFlushTimestamp = 0; // 用于存储当前刷新时的时间戳

  var getNow = Date.now;// 初始获取当前时间的函数

  if (inBrowser && !isIE) { // 检查浏览器是否支持高性能时间戳，并选择性能更好的获取时间戳的方法
    var performance = window.performance;
    if (
      performance &&
      typeof performance.now === 'function' &&
      getNow() > document.createEvent('Event').timeStamp
    ) { // 检查是否存在 performance对象以及是否支持 performance.now() 方法
      getNow = function () { return performance.now(); }; // 浏览器支持高性能时间戳, 则将 getNow函数重新赋值
    }
  }

  /**
   * 刷新调度队列并运行观察者
   */
  function flushSchedulerQueue () {
    currentFlushTimestamp = getNow(); // 获取当前刷新的时间戳
    flushing = true; // 设置刷新状态为 true
    var watcher, id;

    /**
     * 在刷新之前对队列进行排序, 这确保了:
     * 1. 组件更新从父级到子级 (因为父级在子级之前创建)
     * 2. 组件的用户观察者在渲染观察者之前运行 (因为用户观察者在渲染观察者之前创建)
     * 3. 如果在父组件的观察者运行期间销毁了组件, 则可以跳过它的观察者
     */
    queue.sort(function (a, b) { return a.id - b.id; });

    /* // 不缓存长度, 因为在运行现有观察者时可能会添加更多的观察者 */
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      if (watcher.before) { // 在运行观察者之前调用 before钩子函数
        watcher.before();
      }
      id = watcher.id;
      has[id] = null; // 重置 has对象中的 id对应的值
      watcher.run(); // 运行观察者的 run方法
      if (has[id] != null) { // 在开发环境中, 检查并停止循环更新
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) { // 如果循环更新次数超过最大更新次数, 则输出警告信息
          warn(
            'You may have an infinite update loop ' + (
              watcher.user
                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                : "in a component render function."
            ),
            watcher.vm
          );
          break
        }
      }
    }

    /* 在重置状态之前保留 post 队列的副本 */
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice();

    resetSchedulerState(); // 重置调度器的状态

    callActivatedHooks(activatedQueue); // 调用组件的 updated钩子函数
    callUpdatedHooks(updatedQueue); // 调用组件的 activated钩子函数

    if (devtools && config.devtools) { // 触发开发工具的 flush事件
      devtools.emit('flush');
    }
  }

  /**
   * 调用已更新的组件的钩子函数
   * @param {Array} queue - 包含已更新的观察者的队列
   */
  function callUpdatedHooks (queue) {
    var i = queue.length;
    while (i--) { // 逆序遍历观察者队列
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) { // 如果观察者是该 Vue实例的根观察者, 且该 Vue实例已挂载且未销毁
        callHook(vm, 'updated'); // 调用 Vue实例的 updated钩子函数
      }
    }
  }

  /**
   * 将被激活的 keep-alive组件加入队列, 在整个树被打补丁后进行处理
   * @param {Vue|VueComponent} vm - 被激活的Vue组件实例
   */
  function queueActivatedComponent (vm) {
    vm._inactive = false; // 用于在渲染函数中可以检查它是否在非活动树中 (例: router-view)
    activatedChildren.push(vm); // 将组件实例加入到 activatedChildren队列中
  }

  /**
   * 调用激活钩子函数, 用于处理激活的组件
   * @param {VueComponent[]} queue - 待处理的激活组件队列
   */
  function callActivatedHooks (queue) {
    for (var i = 0; i < queue.length; i++) { // 遍历激活队列中的每个组件实例
      queue[i]._inactive = true; // 表示组件已经激活
      activateChildComponent(queue[i], true /* true */); // 激活子组件, 参数为组件实例和 true表示直接激活
    }
  }

  /**
   * 将一个观察者对象推入观察者队列 (具有重复 ID的任务将被跳过, 除非在队列正在刷新时推送)
   * @param {Watcher} watcher - 要推入队列的观察者对象
   */
  function queueWatcher (watcher) {
    var id = watcher.id;
    if (has[id] == null) { // 如果观察者队列中没有当前观察者的 ID, 则添加进队列
      has[id] = true; // 将观察者 ID标记为已存在
      if (!flushing) { // 如果队列未处于刷新状态, 则将观察者直接推入队列
        queue.push(watcher);
      } else { // 如果队列正在刷新, 则按照观察者的 ID插入队列, 确保按顺序执行; 如果已经过了观察者的 ID, 则立即执行下一个观察者
        var i = queue.length - 1;
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }

      if (!waiting) {
        waiting = true; // 标记为等待刷新队列

        if (!config.async) { // 如果不是异步刷新, 则立即执行刷新队列
          flushSchedulerQueue();
          return
        }
        nextTick(flushSchedulerQueue); // 使用 nextTick异步执行刷新队列
      }
    }
  }

  var uid$2 = 0; // 用于批量处理的唯一标识
  /**
   * Watcher 构造函数
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Function|string} expOrFn - 表达式或者函数
   * @param {Function} cb - 回调函数
   * @param {Object} options - 选项对象
   * @param {Boolean} isRenderWatcher - 是否是渲染Watcher
   */
  var Watcher = function Watcher (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    if (isRenderWatcher) { // 如果是渲染 Watcher, 则将其保存到 Vue实例的 _watcher属性中
      vm._watcher = this;
    }
    vm._watchers.push(this); // 将该观察者对象推入 Vue实例的观察者数组中
    if (options) { // 解析选项
      this.deep = !!options.deep; // 是否深度监听
      this.user = !!options.user; // 是否为用户自定义观察者
      this.lazy = !!options.lazy; // 是否为懒执行
      this.sync = !!options.sync; // 是否同步执行回调
      this.before = options.before; // 在更新之前执行的钩子函数
    } else { // 默认选项
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb; // 设置回调函数
    this.id = ++uid$2; // 用于批量处理的唯一标识
    this.active = true; // 是否激活状态
    this.dirty = this.lazy; // 是否为懒执行的观察者
    this.deps = []; // 依赖项数组
    this.newDeps = []; // 新的依赖项数组
    this.depIds = new _Set(); // 依赖项的 ID集合
    this.newDepIds = new _Set(); // 新的依赖项的 ID集合
    this.expression = expOrFn.toString(); // 观察的表达式, 将表达式转换为字符串
    if (typeof expOrFn === 'function') { // 解析表达式以获取 getter函数
      this.getter = expOrFn;
    } else { // 如果解析失败, 则使用空函数作为 getter, 并发出警告
      this.getter = parsePath(expOrFn); // 解析表达式路径
      if (!this.getter) {
        this.getter = noop;
        warn(
          "Failed watching path: \"" + expOrFn + "\" " +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    this.value = this.lazy // 初始化执行观察者的 getter函数, 如果是懒执行的话则初始值为 undefined
      ? undefined
      : this.get();
  };

  /**
   * 评估 getter, 并重新收集依赖项
   */
  Watcher.prototype.get = function get () {
    pushTarget(this); // 将当前观察者对象压入全局的观察者栈中
    var value;
    var vm = this.vm;
    try { // 调用 getter函数获取值
      value = this.getter.call(vm, vm);
    } catch (e) { // 捕获 getter函数的执行错误, 并根据用户设置的标志进行处理
      if (this.user) {
        handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally { // 如果开启了深度监听, 需要对获取的值进行深度遍历, 确保所有属性都被追踪为依赖项
      if (this.deep) { // 深度手机依赖
        traverse(value);
      }
      popTarget(); // 弹出全局的观察者栈
      this.cleanupDeps(); // 清理依赖项
    }
    return value // 返回获取的值
  };

  /**
   * 将一个依赖项添加到该观察者
   */
  Watcher.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) { // 如果新的依赖项集合中没有当前依赖项的 ID
      this.newDepIds.add(id); // 添加到新的依赖项 ID集合中
      this.newDeps.push(dep); // 添加到新的依赖项列表中
      if (!this.depIds.has(id)) { // 如果旧的依赖项集合中也没有当前依赖项的 ID
        dep.addSub(this); // 将当前观察者添加到依赖项的订阅列表中
      }
    }
  };

  /**
   * 清理依赖项收集 (在依赖项收集过程中清理)
   */
  Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var i = this.deps.length;
    while (i--) { // 遍历当前依赖项列表
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) { // 如果新的依赖项列表中不包含当前依赖项, 则移除当前观察者
        dep.removeSub(this);
      }
    }
    /* 更新依赖项列表为新的依赖项列表 */
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear(); // 清空新的依赖项集合
    /* 更新依赖列表为新的依赖列表 */
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0; // 清空新的依赖列表
  };

  /**
   * 订阅者接口 (当依赖项发生变化时将被调用)
   */
  Watcher.prototype.update = function update () {
    if (this.lazy) { // 如果是计算属性 Watcher (lazy watcher), 设置标记为脏, 表示需要重新计算值
      this.dirty = true;
    } else if (this.sync) { // 如果是同步执行的观察者, 立即执行观察者的运行方法
      this.run();
    } else { // 否则将观察者加入到观察者队列中, 等待调度器调度执行
      queueWatcher(this);
    }
  };

  /**
   * 调度器任务接口, 将由调度器调用
   */
  Watcher.prototype.run = function run () {
    if (this.active) { // 如果观察者处于激活状态
      var value = this.get(); // 获取新的值
      if (
        value !== this.value ||
        isObject(value) ||
        this.deep
      ) { // 如果新值与旧值不同, 或是深度观察者, 或新值是对象或数组 (因为它们可能发生了变化)
        var oldValue = this.value; // 保存旧值
        this.value = value; // 更新值
        if (this.user) { // 如果是用户定义的观察者
          var info = "callback for watcher \"" + (this.expression) + "\""; // 构建错误信息
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info); // 执行观察者的回调函数, 并进行错误处理
        } else { // 如果是内部观察者, 直接调用回调函数
          this.cb.call(this.vm, value, oldValue); // 调用监听属性的回调
        }
      }
    }
  };

  /**
   * 评估观察者的值 (仅用于惰性观察者)
   */
  Watcher.prototype.evaluate = function evaluate () {
    this.value = this.get(); // 获取观察者的值
    this.dirty = false; // 表示该观察者的值已经被计算过
  };

  /**
   * 依赖该观察者收集到的所有依赖项
   */
  Watcher.prototype.depend = function depend () {
    var i = this.deps.length;
    while (i--) { // 调用每一个依赖项的 depend方法, 通知依赖项收集当前观察者
      this.deps[i].depend();
    }
  };

  /**
   * 从所有依赖项的订阅者列表中移除自身
   */
  Watcher.prototype.teardown = function teardown () {
    if (this.active) { // 如果观察者是激活状态
      if (!this.vm._isBeingDestroyed) { // 从 Vue实例的观察者列表中移除当前观察者对象
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) { // 从依赖项的订阅者列表中移除当前观察者对象
        this.deps[i].removeSub(this);
      }
      this.active = false; // 将观察者标记为非激活状态
    }
  };

  var sharedPropertyDefinition = { // 定义一个共享的属性描述对象
    enumerable: true, // 可枚举
    configurable: true, // 可配置
    get: noop,
    set: noop
  };

  /**
   * Vue 实例上的属性代理
   * @param {Object} target - 目标对象 (即需要添加代理属性的对象)
   * @param {String} sourceKey - 源对象的键名 (即存储需要代理的属性的对象的键名)
   * @param {String} key - 需要代理的属性的键名
   */
  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () { // 定义 get方法, 用于获取代理属性的值
      return this[sourceKey][key] // 返回源对象的属性值
    };
    sharedPropertyDefinition.set = function proxySetter (val) { // 定义 get方法, 用于设置代理属性的值
      this[sourceKey][key] = val; // 设置源对象的属性值
    };
    Object.defineProperty(target, key, sharedPropertyDefinition); // 定义目标对象的属性
  }

  /**
   * 对props, data, methods, watch, computed等属性进行初始化
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   */
  function initState (vm) {
    vm._watchers = []; // 初始化存储 Watcher实例的数组
    var opts = vm.$options; // 实例的选项对象
    if (opts.props) { initProps(vm, opts.props); } // 初始化 props选项
    if (opts.methods) { initMethods(vm, opts.methods); } // 初始化方法 (methods)
    if (opts.data) { // 如果存在 data选项, 则初始化 data选项; 否则创建一个空的响应式对象
      initData(vm); // 初始化数据
    } else {
      observe(vm._data = {}, true /* asRootData */); // 创建一个空响应式对象
    }
    if (opts.computed) { initComputed(vm, opts.computed); } // 初始化计算属性 (computed)
    if (opts.watch && opts.watch !== nativeWatch) { // 初始watch监听 (排除火狐原生watch方法的影响)
      initWatch(vm, opts.watch);
    }
  }

  /**
   * 初始化组件的 props选项
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Object} propsOptions - props选项
   */
  function initProps (vm, propsOptions) {
    var propsData = vm.$options.propsData || {}; // 获取 props数据, 默认为空对象
    var props = vm._props = {}; // 存储 props的地方
    var keys = vm.$options._propKeys = []; // 缓存 props的键, 以便将来的 props更新可以使用数组而不是动态对象键枚举
    var isRoot = !vm.$parent; // 是否是根组件
    if (!isRoot) { // 如果不是根组件, 则禁用观察者功能
      toggleObserving(false); // 禁用观察者
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp(key, propsOptions, propsData, vm); // 验证并处理传入的 props数据 (处理包括获取默认值以及为其创建观察者)
      {
        var hyphenatedKey = hyphenate(key); // 将属性名转为横线命名格式
        if (isReservedAttribute(hyphenatedKey) || // 检查 prop名是否是保留属性名, 是则发出警告
            config.isReservedAttr(hyphenatedKey)) {
          warn(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive$$1(props, key, value, function () { // 将 props的属性转化为响应式属性, 并附带自定义 setter函数
          if (!isRoot && !isUpdatingChildComponent) { // 如果不是根实例且不是正在更新子组件, 则发出警告, 因为直接修改 props可能导致数据被覆盖
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // 在 Vue.extend时, 静态属性已经在组件的原型上被代理, 这里我们只需要代理实例化时定义的属性
      if (!(key in vm)) { // 如果 prop不在 vm实例中, 则代理到 _props上
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key ); // 遍历 propsOptions对象, 初始化props
    toggleObserving(true); // 启用观察者
  }

  /**
   * 初始化组件的 data选项
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   */
  function initData (vm) {
    var data = vm.$options.data; // data选项
    data = vm._data = typeof data === 'function' // 如果 data选项是函数, 则执行该函数获取数据对象, 否则直接使用 data选项
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) { // 如果 data选项不是普通对象, 则警告并将其设置为空对象
      data = {};
      warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }

    var keys = Object.keys(data); // data选项的属性名集合
    var props = vm.$options.props; // props选项
    var methods = vm.$options.methods; // methods选项
    var i = keys.length;
    while (i--) { // 属性名校验以及实例的属性代理
      var key = keys[i]; // 属性名
      {
        if (methods && hasOwn(methods, key)) { // 检查属性名是否与方法名冲突
          warn(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) { // 检查属性名是否与 prop名称冲突
        warn(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) { // 将数据属性代理到 Vue实例上 (非'$'或'_'开头的内部变量)
        proxy(vm, "_data", key);
      }
    }

    observe(data, true /* asRootData */); // 观察数据, 使其具有响应式特性
  }

  /**
   * 调用函数格式的 data选项, 返回执行结果
   * @param {Function} data - data函数
   * @param {Vue|VueComponent} vm 
   */
  function getData (data, vm) {
    pushTarget(); // 禁用依赖收集
    try { // 调用 data函数, 获取返回值
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget(); // 恢复依赖收集
    }
  }

  var computedWatcherOptions = { lazy: true }; // 计算属性选项对象, 表示计算属性是惰性求值
  /**
   * 初始化组件的计算属性
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Object} computed - 计算属性选项
   */
  function initComputed (vm, computed) {
    var watchers = vm._computedWatchers = Object.create(null); // 用于存储计算属性的 Watcher实例
    var isSSR = isServerRendering(); // 判断是否为服务端渲染

    for (var key in computed) {
      var userDef = computed[key]; // 计算属性的定义
      var getter = typeof userDef === 'function' ? userDef : userDef.get; // 如果计算属性是一个函数, 则将其设置为 getter; 否则使用其定义的 getter函数
      if (getter == null) { // 如果 getter函数不存在, 则发出警告
        warn(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      if (!isSSR) { // 如果不是服务端渲染, 则为计算属性创建内部的 Watcher实例
        watchers[key] = new Watcher( // 为每一个计算属性分配一个 Watcher
          vm,
          getter || noop,
          noop,
          computedWatcherOptions // 选项对象, 标记为 lazy, 表示计算属性是惰性求值的
        );
      }

      if (!(key in vm)) { // 如果计算属性在实例中不存在, 则定义它
        defineComputed(vm, key, userDef);
      } else { // 重复定义属性警告
        if (key in vm.$data) { // data中定过的属性名不能在 computed中重复定义
          warn(("The computed property \"" + key + "\" is already defined in data."), vm);
        } else if (vm.$options.props && key in vm.$options.props) { // props中定过的属性名不能在 computed中重复定义
          warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        } else if (vm.$options.methods && key in vm.$options.methods) { // methods定义过的的属性名不能在 computed中重复定义
          warn(("The computed property \"" + key + "\" is already defined as a method."), vm);
        }
      }
    }
  }

  /**
   * 用于定义计算属性
   * @param {Object} target - 目标对象 (即需要定义计算属性的对象)
   * @param {String} key - 计算属性的键名
   * @param {Function|Object} userDef - 计算属性的定义 (可以是一个函数或者包含 get/set方法的对象)
   */
  function defineComputed (
    target,
    key,
    userDef
  ) {
    var shouldCache = !isServerRendering(); // 在非服务端渲染情况下应该缓存计算属性的值
    if (typeof userDef === 'function') { // 如果计算属性的定义是一个函数
      sharedPropertyDefinition.get = shouldCache // 根据是否应该缓存计算属性的值创建对应的 getter函数
        ? createComputedGetter(key) // 创建一个可以缓存的计算属性的 getter函数
        : createGetterInvoker(userDef); // 创建一个调用计算属性函数的 getter函数
      sharedPropertyDefinition.set = noop;
    } else { // 如果计算属性的定义不是一个函数
      sharedPropertyDefinition.get = userDef.get // 根据是否定义 get函数以及是否应该缓存计算属性的值创建对应的 getter函数
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key) // 创建一个可以缓存的计算属性的 getter函数
          : createGetterInvoker(userDef.get) // 创建一个调用用户定义的 get方法的 getter函数
        : noop;
      sharedPropertyDefinition.set = userDef.set || noop;
    }
    if (sharedPropertyDefinition.set === noop) { // 如果处理后 set方法仍然为空函数, 则设置一个用于警告的 setter函数
      sharedPropertyDefinition.set = function () {
        warn(
          ("Computed property \"" + key + "\" was assigned to but it has no setter."),
          this
        );
      };
    }
    Object.defineProperty(target, key, sharedPropertyDefinition); // 定义计算属性
  }

  /**
   * 创建一个计算属性的 getter函数
   * 计算属性不会收集依赖, 只会让自己的依赖属性去收集依赖
   * @param {String} key - 计算属性的键名
   * @returns {Function}
   */
  function createComputedGetter (key) {
    return function computedGetter () { // 返回一个函数作为计算属性的 getter
      var watcher = this._computedWatchers && this._computedWatchers[key]; // 获取计算属性的 Watcher对象
      if (watcher) {
        if (watcher.dirty) { // 如果标记为脏(dirty), 就重新执行 getter函数更新计算属性的值
          watcher.evaluate();
        }
        if (Dep.target) { // 如果当前正在进行依赖收集, 将当前的 Watcher对象添加到依赖中
          watcher.depend();
        }
        return watcher.value // 返回计算属性的值
      }
    }
  }

  /**
   * 创建一个计算属性的 getter函数
   * @param {Function} fn - 用户定义的计算属性的 getter函数
   * @returns {Function}
   */
  function createGetterInvoker(fn) {
    return function computedGetter () { // 返回一个函数作为计算属性的 getter
      return fn.call(this, this) // 调用用户定义的计算属性 getter函数
    }
  }

  /**
   * 初始化组件的方法
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Object} methods - 方法对象
   */
  function initMethods (vm, methods) {
    var props = vm.$options.props; // 获取实例的 props 选项
    for (var key in methods) { // 遍历传入的方法对象
      {
        if (typeof methods[key] !== 'function') { // 如果当前方法不是函数类型, 则发出警告
          warn(
            "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn(props, key)) { // 如果当前方法名已经在 props中定义, 则发出警告
          warn(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved(key)) { // 如果当前方法名已经在实例中存在且为保留字段("$", "_"开头), 则发出警告
          warn(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm); // 将方法绑定到实例上
    }
  }

  /**
   * 初始化组件的 Watch选项
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Object} watch - 要监听的属性和对应的处理函数或处理函数数组
   */
  function initWatch (vm, watch) {
    for (var key in watch) { // 遍历传入的 watch对象
      var handler = watch[key];
      if (Array.isArray(handler)) { // 遍历每个处理函数, 为其创建观察者
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]); // 创建观察者并添加到组件实例中
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  /**
   * 创建一个观察者 (Watcher)
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {String|Function} expOrFn - 要观察的表达式或函数
   * @param {Function|Object} handler - 观察者的处理函数或配置对象
   * @param {Object} options - 观察者的选项
   * @returns {Watcher}
   */
  function createWatcher (
    vm,
    expOrFn,
    handler,
    options
  ) {
    if (isPlainObject(handler)) { // 如果 handler是一个普通对象, 则将其作为配置对象, 并获取处理函数
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') { // 如果 handler是一个字符串, 则从实例中获取对应的方法
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options) // 创建观察者, 并返回观察者实例
  }

  /**
   * 在 Vue构造函数上添加状态相关方法
   * @param {Function} Vue - Vue构造函数 
   */
  function stateMixin (Vue) {
    var dataDef = {};
    dataDef.get = function () { return this._data }; //  // 通过 getter获取实例上的 _data属性
    var propsDef = {};
    propsDef.get = function () { return this._props };// 通过 getter获取实例上的 _props属性
    { // 开发环境下设置根数据对象 $data和 根props属性 $props的 setter函数 (禁止替换实例的根 $data/$props)
      dataDef.set = function () {
        warn(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        );
      };
      propsDef.set = function () {
        warn("$props is readonly.", this);
      };
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef); // 在 Vue原型上定义 $data属性 (获取实例的数据)
    Object.defineProperty(Vue.prototype, '$props', propsDef); // 在 Vue原型上定义 $props 属性 (获取实例的 props对象)

    Vue.prototype.$set = set; // 向响应式对象中添加一个属性
    Vue.prototype.$delete = del; // 删除响应式对象的属性

    /**
     * 在组件实例上创建一个观察者 (用于监测数据的变化)
     * @param {string|Function} expOrFn - 要观察的表达式或函数
     * @param {Function|Object} cb - 回调函数或者回调函数的配置对象
     * @param {Object} options - 观察者的选项
     * @returns {Function} - 返回一个用于取消观察的函数
     */
    Vue.prototype.$watch = function (
      expOrFn,
      cb,
      options
    ) {
      var vm = this;
      if (isPlainObject(cb)) { // 如果回调函数是一个普通对象, 则调用 createWatcher方法创建观察者并返回
        return createWatcher(vm, expOrFn, cb, options) // 此处 createWatcher会处理函数后带着参数再次来到 $watch函数
      }
      options = options || {};
      options.user = true; // 标记为用户创建的观察者
      var watcher = new Watcher(vm, expOrFn, cb, options); // 创建观察者实例
      if (options.immediate) { // 如果设置了 immediate选项, 则立即执行一次回调函数
        var info = "callback for immediate watcher \"" + (watcher.expression) + "\"";
        pushTarget(); // 将当前观察者对象推入栈中
        invokeWithErrorHandling(cb, vm, [watcher.value], vm, info); // 执行回调函数, 并在执行过程中进行错误处理
        popTarget(); // 弹出栈顶的观察者对象
      }
      return function unwatchFn () { // 返回一个用于取消观察的函数
        watcher.teardown(); // 调用观察者的 teardown方法取消观察
      }
    };
  }

  var uid$3 = 0; // 实例的唯一的标识符
  /**
   * 初始化 Vue 实例的初始化方法
   * @param {Function} Vue - Vue 构造函数
   */
  function initMixin (Vue) {
    /**
     * Vue 实例的初始化方法
     * @param {Object} options - Vue 的选项对象
     */
    Vue.prototype._init = function (options) {
      var vm = this; // 当前实例
      vm._uid = uid$3++; // 唯一的标识符

      var startTag, endTag;
      if (config.performance && mark) { // 性能分析 (可忽略)
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark(startTag);
      }

      vm._isVue = true; // 防止实例自身被观察的标识
      if (options && options._isComponent) { // 如果是组件的选项对象
        initInternalComponent(vm, options); // 初始内部组件
      } else {
        vm.$options = mergeOptions( // 合并构造函数的选项和传入的选项
          resolveConstructorOptions(vm.constructor), // 解析构造函数的选项, 并确保它们是最新的
          options || {},
          vm
        );
      }
      {
        initProxy(vm); // 在渲染阶段对不合法的数据做判断筛选
      }

      vm._self = vm; // 暴露真实的组件实例
      initLifecycle(vm); // 初始化生命周期
      initEvents(vm); // 初始化事件中心
      initRender(vm); // 初始化渲染函数
      callHook(vm, 'beforeCreate'); // 调用生命周期钩子函数 - beforeCreate
      initInjections(vm); // 初始化注入的内容
      initState(vm); // 初始化状态 (props, data, methods, watch, computed等选项)
      initProvide(vm); // 初始化提供的内容
      callHook(vm, 'created'); // 调用生命周期钩子函数 - created

      if (config.performance && mark) { // 性能分析 (可忽略)
        vm._name = formatComponentName(vm, false);
        mark(endTag);
        measure(("vue " + (vm._name) + " init"), startTag, endTag);
      }

      if (vm.$options.el) { // 如果挂载目标存在, 则开始挂载组件
        vm.$mount(vm.$options.el);;
      }
    };
  }

  /**
   * 初始化内部组件
   * @param {Vue|VueComponent} vm - Vue实例或组件实例
   * @param {Object} options - 组件的选项对象
   */
  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options); // 创建一个原型指向实例选项对象的新对象, 并赋值给实例的 $options属性
    var parentVnode = options._parentVnode; // 获取父虚拟节点
    opts.parent = options.parent; // 将父组件实例设置为当前组件实例的父组件
    opts._parentVnode = parentVnode; // 将父虚拟节点设置为当前组件实例的父虚拟节点

    var vnodeComponentOptions = parentVnode.componentOptions; // 获取父虚拟节点的组件选项
    // 将父虚拟节点的 propsData/listeners/children/tag分别设置为当前组件实例的相应属性
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {// 如果选项中存在 render函数, 则将选项的 render, staticRenderFns属性设置为当前组件实例的属性
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  /**
   * 解析构造函数的选项, 并确保它们是最新的
   * @param {Object} Ctor - 构造函数
   * @returns {Object}
   */
  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options; // 获取构造函数的选项对象
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions(Ctor.super); // 解析父级构造函数的选项
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) { // 如果父级构造函数的选项发生了变化, 则需要解析新的选项
        Ctor.superOptions = superOptions; // 更新缓存的父级构造函数选项
        var modifiedOptions = resolveModifiedOptions(Ctor); // 检查是否有任何后期修改或附加的选项
        if (modifiedOptions) { // 更新基本扩展选项
          extend(Ctor.extendOptions, modifiedOptions); // extend: 将源对象中的属性合并到目标对象
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions); // 合并父级选项和扩展选项, 并更新到构造函数的选项中
        if (options.name) { // 如果选项有名称, 则将构造函数添加到选项的 components对象中
          options.components[options.name] = Ctor;
        }
      }
    }

    return options
  }

  /**
   * 解析已修改的选项
   * @param {Object} Ctor - 组件构造函数
   * @returns {Object}
   */
  function resolveModifiedOptions (Ctor) {
    var modified; // 存储已修改的选项
    var latest = Ctor.options; // 获取最新的选项
    var sealed = Ctor.sealedOptions; // 获取封闭的选项
    for (var key in latest) { // 遍历最新选项
      if (latest[key] !== sealed[key]) { // 如果最新选项中的某个属性与封闭选项中不相等
        if (!modified) { modified = {}; } // 初始化已修改的选项集合
        modified[key] = latest[key]; // 将已修改的选项添加
      }
    }
    return modified
  }

  /**
   * Vue 构造函数
   * @param {Object} options - Vue 的选项对象
   */
  function Vue (options) {
    if (!(this instanceof Vue)) { // 如果不是通过 new关键字调用 Vue构造函数, 则发出警告
      warn('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options); // 带着配置项初始化实例
  }

  initMixin(Vue); // 将 Vue实例初始化的方法挂载到 Vue原型上 ( _init )
  stateMixin(Vue); // 将状态管理功能挂载到 Vue原型上 ( $data/$props/$set/$delete/$watch )
  eventsMixin(Vue); // 将事件处理功能挂载到 Vue原型上 ( $on/$once/$off/$emit )
  lifecycleMixin(Vue); // 将生命周期管理功能挂载到 Vue原型上 ( _update/$forceUpdate/$destroy )
  renderMixin(Vue); // 将渲染功能挂载到 Vue原型上 ( $nextTick/_render )

  /**
   * 初始化 Vue.use方法 (用于注册插件)
   * @param {Function} Vue - Vue构造函数
   */
  function initUse (Vue) {
    /**
     * 注册 Vue插件
     * @param {Object|Function} plugin - 要注册的插件
     * @returns {Function} - Vue构造函数
     */
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = [])); // 获取已安装的插件列表 (不存在则初始化为空数组)
      if (installedPlugins.indexOf(plugin) > -1) { // 如果插件已注册过, 则直接返回 Vue构造函数
        return this
      }

      var args = toArray(arguments, 1); // 获取额外的参数
      args.unshift(this); // 将 Vue构造函数插入参数列表
      if (typeof plugin.install === 'function') { // 如果插件具有 install方法, 则传递参数调用该方法
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') { // 如果插件本身是一个函数, 则直接传递参数执行该函数
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin); // 将插件添加到已安装插件列表中
      return this
    };
  }

  /**
   * Vue 的初始化混入函数
   * @param {Function} Vue - Vue构造函数
   */
  function initMixin$1 (Vue) {
    Vue.mixin = function (mixin) { // 定义 Vue的全局混入方法
      this.options = mergeOptions(this.options, mixin); // 将 mixin选项与当前组件的选项合并
      return this // 返回 Vue构造函数, 以便链式调用
    };
  }

  /**
   * Vue 的扩展函数 (用于创建子类组件)
   * @param {Object} extendOptions - 扩展的选项 (用于创建子类组件)
   * @returns {Function}
   */
  function initExtend (Vue) {
    Vue.cid = 0;
    var cid = 1;

    Vue.extend = function (extendOptions) { // 扩展 Vue组件, 实现组件的继承
      extendOptions = extendOptions || {};
      var Super = this; // 获取父类构造函数
      var SuperId = Super.cid; // 获取父类的唯一标识
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {}); // 获取已缓存的构造函数, 如果没有则初始化为空对象
      if (cachedCtors[SuperId]) { // 如果已缓存，则直接返回
        return cachedCtors[SuperId]
      }

      var name = extendOptions.name || Super.options.name;
      if (name) { // 判断组件名是否符合规则
        validateComponentName(name);
      }

      var Sub = function VueComponent (options) { // 调用 _init方法初始化组件实例
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype); // 继承父类的原型链
      Sub.prototype.constructor = Sub; // 修正构造函数指向 (继承 Vue原型链后 constructor变成 Vue)
      Sub.cid = cid++; // 生成唯一标识
      Sub.options = mergeOptions( // 合并选项 (子类为主)
        Super.options,
        extendOptions
      );
      Sub['super'] = Super;

      /* 对于 props, computed属性, 在扩展时在扩展的原型上定义代理 getter, 这样可以避免为每个创建的实例调用 Object.defineProperty */
      if (Sub.options.props) { // 初始化 props
        initProps$1(Sub);
      }
      if (Sub.options.computed) { // 初始化计算属性
        initComputed$1(Sub);
      }

      // 允许进一步的扩展, 混入和插件使用
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      ASSET_TYPES.forEach(function (type) { // 创建组件私有资源注册 (以便扩展类也可以具有自己的私有资源)
        Sub[type] = Super[type];
      });

      if (name) { // 把当前组件也加入自身的 components属性中, 实现组件可递归
        Sub.options.components[name] = Sub;
      }

      Sub.superOptions = Super.options; // 保存对父类选项的引用 (在实例化时, 我们可以检查 Super的选项是否已更新)
      Sub.extendOptions = extendOptions; // 保存扩展选项
      Sub.sealedOptions = extend({}, Sub.options); // 保存封闭的选项, 即扩展时的选项快照

      cachedCtors[SuperId] = Sub; // 缓存构造函数
      return Sub
    };
  }

  /**
   * 初始化组件的 props
   * @param {VueComponent} Comp - 组件构造函数
   */
  function initProps$1 (Comp) {
    var props = Comp.options.props; // 获取 props选项
    for (var key in props) { // 遍历 props选项
      proxy(Comp.prototype, "_props", key); // 将 props中的每一个属性代理到组件实例的 _props属性上
    }
  }

  /**
   * 初始化组件的计算属性
   * @param {VueComponent} Comp - 组件构造函数
   */
  function initComputed$1 (Comp) {
    var computed = Comp.options.computed; // 获取计算属性选项
    for (var key in computed) { // 遍历计算属性选项
      defineComputed(Comp.prototype, key, computed[key]); // 定义计算属性
    }
  }

  /**
   * 初始化资源注册方法 (component/directive/filter)
   * @param {Function} Vue - Vue构造函数
   */
  function initAssetRegisters (Vue) {
    ASSET_TYPES.forEach(function (type) { // 创建资源注册方法 (注册或获取资源)
      Vue[type] = function (
        id,
        definition
      ) { // 定义 Vue的组件, 指令等资源注册方法
        if (!definition) { // 如果没有提供资源, 则获取已注册的资源
          return this.options[type + 's'][id]
        } else { // 如果提供资源, 则注册该资源
          if (type === 'component') { // 如果是组件类型, 检查组件名称的合法性
            validateComponentName(id);
          }
          if (type === 'component' && isPlainObject(definition)) { // 如果是组件类型, 并且传入的资源是一个纯对象, 则转换为 Vue.extend的组件构造器
            definition.name = definition.name || id; // 设置 name属性
            definition = this.options._base.extend(definition);// 将纯对象定义转换为组件构造器
          }
          if (type === 'directive' && typeof definition === 'function') { // 如果是指令类型并且传入的资源是一个函数, 则将其转换为具有 bind和 update方法的对象
            definition = { bind: definition, update: definition };
          }
          this.options[type + 's'][id] = definition; // 将新注册的资源添加到 Vue实例上
          return definition
        }
      };
    });
  }

  /**
   * 获取组件的名称
   * @param {Object} opts - 组件的选项
   * @returns {String}
   */
  function getComponentName (opts) {
    // 如果`组件选项`存在且`组件构造函数的选项`中存在 name属性, 则返回该 name属性; 否则返回组件选项的标签名
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  /**
   * 检查一个名称是否匹配指定的模式
   * @param {String|Array|RegExp} pattern - 要匹配的模式 (字符串/字符串数组/正则表达式)
   * @param {String} name - 要检查匹配的名称
   * @returns {Boolean}
   */
  function matches (pattern, name) {
    if (Array.isArray(pattern)) { // 如果模式是数组, 则检查是否名称在数组中
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') { // 如果模式是字符串, 则将字符串以逗号分隔成数组, 然后检查是否名称在数组中
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) { // 如果模式是正则表达式, 则使用正则表达式匹配名称
      return pattern.test(name)
    }
    return false // 匹配失败
  }

  /**
   * 根据过滤条件从缓存中移除不符合条件的缓存项
   * @param {KeepAlive} keepAliveInstance - KeepAlive 组件实例
   * @param {Function} filter - 过滤条件函数, 返回 true表示保留, false表示移除
   */
  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache; // 缓存对象
    var keys = keepAliveInstance.keys; // 缓存项的键数组
    var _vnode = keepAliveInstance._vnode; // 当前 VNode
    for (var key in cache) { // 遍历缓存对象
      var entry = cache[key]; // 获取缓存项
      if (entry) {
        var name = entry.name; // 缓存项的名称
        if (name && !filter(name)) { // 如果缓存项有名称, 并且不符合过滤条件, 则移除缓存项
          pruneCacheEntry(cache, key, keys, _vnode); // 移除缓存项
        }
      }
    }
  }

  /**
   * 从缓存中移除指定的缓存项, 并销毁对应的组件实例
   * @param {Object} cache - 缓存对象
   * @param {String} key - 要移除的缓存项的键
   * @param {Array} keys - 缓存项的键数组
   * @param {VNode} current - 当前 VNode
   */
  function pruneCacheEntry (
    cache,
    key,
    keys,
    current
  ) {
    var entry = cache[key]; // 获取缓存项
    if (entry && (!current || entry.tag !== current.tag)) { // 如果存在缓存项且当前 VNode不存在, 或缓存项的标签与当前 VNode的标签不同, 则销毁组件实例
      entry.componentInstance.$destroy(); // 销毁组件实例
    }
    cache[key] = null; // 从缓存项置空
    remove(keys, key); // 从键数组中移除对应的键
  }

  var patternTypes = [String, RegExp, Array]; // KeepAlive 组件的类型匹配

  /**
   * 定义 Vue内置的 KeepAlive组件 (用于缓存动态组件, 以便在组件切换时保留其状态)
   */
  var KeepAlive = {
    name: 'keep-alive', // 组件名称
    abstract: true, // 抽象组件 (不会在 DOM中渲染)

    props: {
      include: patternTypes, // 需要缓存组件的类型规定
      exclude: patternTypes, // 不要缓存组件的类型规定
      max: [String, Number]  // 缓存最大数量的类型规定
    },

    methods: {
      cacheVNode: function cacheVNode() { // 缓存组件的方法
        var ref = this;
        var cache = ref.cache; // 获取缓存对象
        var keys = ref.keys;  // 获取 keys数组 (存储每一个缓存组件的键)
        var vnodeToCache = ref.vnodeToCache; // 待缓存的组件
        var keyToCache = ref.keyToCache; // 待缓存的组件对应的键
        if (vnodeToCache) { // 如果待缓存的组件存在, 则进行缓存
          var tag = vnodeToCache.tag; // 组件的标签名
          var componentInstance = vnodeToCache.componentInstance; // 组件实例
          var componentOptions = vnodeToCache.componentOptions; // 组件选项
          cache[keyToCache] = { // 将待缓存组件的相关信息存入缓存对象中
            name: getComponentName(componentOptions), // 组件名称
            tag: tag, // 组件的标签名
            componentInstance: componentInstance, // 组件实例
          };
          keys.push(keyToCache); // 将键存入键数组中
          if (this.max && keys.length > parseInt(this.max)) { // 如果缓存数量超出最大值, 则移除最早存入的缓存
            pruneCacheEntry(cache, keys[0], keys, this._vnode); // 移除最早存入的缓存
          }
          this.vnodeToCache = null; // 清空待缓存的组件
        }
      }
    },

    created: function created () { // 生命周期 created: 组件创建的时候
      this.cache = Object.create(null); // 初始化缓存对象
      this.keys = []; // 存储每一个缓存组件的键 (对应 this.cache对象中的键)
    },

    destroyed: function destroyed () { // 生命周期 destroyed: 组件销毁的时候
      for (var key in this.cache) { // 清除所有缓存
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },

    mounted: function mounted () { // 生命周期 mounted: 组件挂载的时候
      var this$1 = this;

      this.cacheVNode(); // 缓存初始组件
      this.$watch('include', function (val) { // 监听`需要缓存`的组件的变化, 动态更新缓存的组件
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      this.$watch('exclude', function (val) { // 监听`不要缓存`的组件的变化, 动态更新缓存的组件
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    updated: function updated () { // 生命周期 updated: 组件更新的时候
      this.cacheVNode(); // 更新缓存的组件
    },

    render: function render () { // 构建组件的虚拟DOM
      var slot = this.$slots.default; // 获取默认插槽的内容
      var vnode = getFirstComponentChild(slot); // 获取默认插槽的第一个子组件的 VNode
      var componentOptions = vnode && vnode.componentOptions; // 获取组件选项
      if (componentOptions) {
        /* 检查是否需要缓存 */
        var name = getComponentName(componentOptions); // 组件名称
        var ref = this;
        var include = ref.include; // 需要缓存的组件
        var exclude = ref.exclude; // 不要缓存的组件
        if (
          (include && (!name || !matches(include, name))) ||
          (exclude && name && matches(exclude, name))
        ) { // 如果组件不需要被缓存, 则直接返回其 VNode
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache; // 获取缓存对象
        var keys = ref$1.keys; // 获取 keys数组 (存储每一个缓存组件的键)
        var key = vnode.key == null // 获取缓存组件的键 (对于相同构造函数的不同局部组件可能注册为不同的组件, 所以仅靠 cid不足以区分)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) { // 如果组件已经被缓存, 则直接使用缓存中的组件实例
          vnode.componentInstance = cache[key].componentInstance;
          remove(keys, key); // 更新 keys数组, 将当前的键移动到末尾, 表示最新使用的
          keys.push(key);
        } else { // 如果组件尚未被缓存, 则延迟设置缓存, 到组件更新时再进行缓存
          this.vnodeToCache = vnode;
          this.keyToCache = key;
        }

        vnode.data.keepAlive = true; // 标记该组件为缓存的组件
      }
      return vnode || (slot && slot[0]) // 返回 VNode或默认插槽中的第一个子元素
    }
  };

  var builtInComponents = { // 内置组件对象
    KeepAlive: KeepAlive
  };

  /**
   * 初始化全局API
   * @param {Function} Vue - Vue构造函数  
   */
  function initGlobalAPI (Vue) {
    var configDef = {};
    configDef.get = function () { return config; }; // 读取时直接返回 config
    {
      configDef.set = function () { // 设置 config的值时控制台抛出警告
        warn(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    Object.defineProperty(Vue, 'config', configDef); // 对 Vue构造函数身上的 config属性进行读取写入操作的拦截

    Vue.util = { // 挂在 Vue构造函数上对外暴露的工具方法
      warn: warn, // 控制台警告
      extend: extend, // 将属性合并到目标对象
      mergeOptions: mergeOptions, // 合并组件配置选项
      defineReactive: defineReactive$$1 // 定义响应式数据
    };

    Vue.set = set; // Vue.set 方法: 用于设置响应式对象的属性
    Vue.delete = del; // Vue.delete 方法: 用于删除响应式对象的属性
    Vue.nextTick = nextTick; // Vue.nextTick 方法: 用于异步执行回调函数

    Vue.observable = function (obj) { // 用于将一个普通对象转换为响应式对象, 使其具有响应式特性
      observe(obj);
      return obj
    };

    Vue.options = Object.create(null); // 创建 Vue.options对象用于存储全局配置和选项
    ASSET_TYPES.forEach(function (type) { // 创建对全局组件(components), 全局指令(directives), 过滤器filter的存储
      Vue.options[type + 's'] = Object.create(null);
    });

    Vue.options._base = Vue; // 将 Vue自身作为 _base属性存储在 options中 (用于多实例场景下扩展纯对象组件)
    extend(Vue.options.components, builtInComponents); // 将内置组件扩展到全局组件中

    initUse(Vue); // Vue.use 方法: 安装插件
    initMixin$1(Vue); // Vue.mixin 方法: 全局混入
    initExtend(Vue); // Vue.extend 方法: 创建子类
    initAssetRegisters(Vue); // 用于注册全局指令、过滤器和组件 (component, directive, filter)
  }

  initGlobalAPI(Vue); // 初始化全局 API

  Object.defineProperty(Vue.prototype, '$isServer', { // 在 Vue原型上定义 $isServer方法 (用于判断当前是否处于服务器端渲染环境)
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', { // 在 Vue原型上定义 $ssrContext方法 (用于获取当前的服务器端渲染上下文)
    get: function get () {
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  Object.defineProperty(Vue, 'FunctionalRenderContext', { // 在 Vue构造函数上定义 FunctionalRenderContext方法 (用于 ssr运行时助手的安装)
    value: FunctionalRenderContext
  });

  Vue.version = '2.6.14'; // 当前 Vue版本

  var isReservedAttr = makeMap('style,class');  // 用于标识保留属性 (模板编译时, 这些属性直接被编译器处理, 因此只保留在 Web平台)

  var acceptValue = makeMap('input,textarea,option,select,progress'); // 对于需要使用 props进行绑定的属性
  /**
   * 通过给定的标签, 类型和属性判断是否需要作为 prop 绑定
   * @param {String} tag - 标签名
   * @param {String} type - 标签类型
   * @param {String} attr - 属性
   * @returns {Boolean}
   */
  var mustUseProp = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck'); // 用于检查属性是否为枚举属性的函数 (makeMap: 返回一个函数, 用于判断值是否在字符串分割构建出的对象中)

  var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only'); // 用于检查`contenteditable`属性值是否有效的函数

  /**
   * 将枚举属性的值转换为字符串 'true/false'
   * @param {String} key - 属性名
   * @param {*} value - 属性值
   * @returns {String}
   */
  var convertEnumeratedValue = function (key, value) {
    return isFalsyAttrValue(value) || value === 'false' // 检查属性值是否为假值或等于字符串'false', 是返回字符串'false', 表示属性值为假。
      ? 'false'
      : key === 'contenteditable' && isValidContentEditableValue(value) // 特定的枚举属性`contenteditable`, 如果值是有效的, 则保留原始值 (contenteditable: 元素是否可编辑)
        ? value
        : 'true'
  };

  var isBooleanAttr = makeMap( // 用于检查属性是否为布尔属性 (makeMap: 返回一个函数, 用于判断值是否在字符串分割构建出的对象中)
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,' +
    'truespeed,typemustmatch,visible'
  );

  var xlinkNS = 'http://www.w3.org/1999/xlink'; // 代表了命名空间 xlink 的标准 URL

  var isXlink = function (name) { // 用于检查属性名是否以 xlink 命名空间开头
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  var getXlinkProp = function (name) { // 获取 xlink 属性真正的属性名
    return isXlink(name) ? name.slice(6, name.length) : ''
  };

  var isFalsyAttrValue = function (val) { // 检查传入参数是否为`null`或`false`
    return val == null || val === false
  };

  /**
   * 用于生成虚拟节点对应的类名
   * @param {VNode} vnode - 虚拟节点
   * @returns {String}
   */
  function genClassForVnode (vnode) {
    var data = vnode.data; // 虚拟节点的数据对象
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef(childNode.componentInstance)) { // 不断向下寻找组件实例合并样式 (组件的根节点依旧为一个组件)
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data); // 合并父子节点的类名信息
      }
    }
    while (isDef(parentNode = parentNode.parent)) { // 不断向上寻找父节点合并样式 (节点的父组件是组件)
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data); // 合并父子节点的类名信息
      }
    }
    return renderClass(data.staticClass, data.class) // 拼接静态类名和动态类名
  }

  /**
   * 合并父子节点的类名信息
   * @param {Object} child - 子节点的数据对象
   * @param {Object} parent - 父节点的数据对象
   * @returns {Object}
   */
  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass), // 静态类名设置为合并父子节点的静态类名
      class: isDef(child.class) // 根据子节点的动态类名是否定义
        ? [child.class, parent.class] // 使用父子节点的动态类名合并后的数组
        : parent.class // 使用父节点的动态类名
    }
  }

  /**
   * 拼接静态类名和动态类名
   * @param {String} staticClass - 静态类名
   * @param {String|Array|Object} dynamicClass - 动态类名
   * @returns {String}
   */
  function renderClass (
    staticClass,
    dynamicClass
  ) {
    if (isDef(staticClass) || isDef(dynamicClass)) { // 拼接静态类名类名和动态类名
      return concat(staticClass, stringifyClass(dynamicClass)) // concat: 拼接传入的参数; stringifyClass: 将动态类名统一为字符格式
    }
    return ''
  }

  function concat (a, b) { // 拼接传入的参数
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass (value) { // 将动态类名统一为字符格式
    if (Array.isArray(value)) { // 处理数组类型的动态类名
      return stringifyArray(value) // 统一为字符格式
    }
    if (isObject(value)) { // 处理对象类型的动态类名
      return stringifyObject(value) // 统一为字符格式
    }
    if (typeof value === 'string') { // 处理字符格式的动态类名则直接返回
      return value
    }
    return ''
  }

  function stringifyArray (value) { // 将数组类型的动态类名统一为字符格式
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject (value) { // 将对象类型的动态类名统一为字符格式
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  var namespaceMap = { // 命名空间映射关系
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isHTMLTag = makeMap( // 是否是HTML标签 (makeMap: 返回一个函数, 用于判断值是否在字符串分割构建出的对象中)
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  var isSVG = makeMap( // 是否是SVG标签 (makeMap: 返回一个函数, 用于判断值是否在字符串分割构建出的对象中)
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );

  var isPreTag = function (tag) { return tag === 'pre'; }; // 判断是否是<pre/>标签

  var isReservedTag = function (tag) { // 判断是否是平台保留标签
    return isHTMLTag(tag) || isSVG(tag) // HTML标签和 SVG标签
  };

  function getTagNamespace (tag) { // 获取标签的命名空间
    if (isSVG(tag)) { // SVG标签的命名空间是'svg'
      return 'svg'
    }

    if (tag === 'math') { // MathML标签的命名空间是'math' (MathML标签不能作为根组件)
      return 'math'
    }
  }

  var unknownElementCache = Object.create(null); // 创建一个空对象作为未知元素的缓存
  /**
   * 检测是否为未知元素
   * @param {String} tag - 要检测的元素标签名
   * @returns {Boolean}
   */
  function isUnknownElement (tag) {
    if (!inBrowser) { // 如果不在浏览器环境中, 则默认为未知元素
      return true
    }
    if (isReservedTag(tag)) { // 如果是保留标签, 则认为不是未知元素
      return false
    }
    tag = tag.toLowerCase(); // 将标签名转换为小写
    if (unknownElementCache[tag] != null) { // 如果在未知元素缓存中有相应的记录, 则直接返回缓存中的结果
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag); // 创建一个指定标签名的元素实例
    if (tag.indexOf('-') > -1) { // 如果标签名中包含 '-', 则判断元素实例的构造函数是否为 HTMLUnknownElement或 HTMLElement
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      // 如果标签名中不包含 '-', 则判断字符化后的元素实例是否包含 "HTMLUnknownElement"字符
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType = makeMap('text,number,password,search,email,tel,url'); // 判断input标签的类型是否是文本输入控件 (makeMap: 返回一个函数, 用于判断值是否在字符串分割构建出的对象中)

  /**
   * 查询DOM元素
   * @param {String|HTMLElement} el 
   * @returns {HTMLElement}
   */
  function query (el) {
    if (typeof el === 'string') { // 参数若为字符, 则进行查询
      var selected = document.querySelector(el);
      if (!selected) { // 元素不存在, 控制台抛出警告并创建一个div标签返回
        warn( // 控制台警告
          'Cannot find element: ' + el
        );
        return document.createElement('div') // 创建div标签返回
      }
      return selected
    } else { // 参数非字符, 返回参数
      return el
    }
  }

  /**
   * 创建DOM节点
   * @param {String} tagName - 标签名
   * @param {VNode} vnode - 虚拟节点
   * @returns {HTMLElement}
   */
  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName); // 创建节点
    if (tagName !== 'select') { // 对select标签特殊处理 TODO
      return elm
    }
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) { // false或null将删除multiple属性, 但undefined不会
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  /**
   * 创建具有的命名空间的节点
   * @param {String} namespace 
   * @param {String} tagName 
   * @returns {HTMLElement}
   */
  function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
  }

  function createTextNode (text) { // 创建一个文本节点
    return document.createTextNode(text)
  }

  function createComment (text) { // 创建一个注释节点
    return document.createComment(text)
  }

  /**
   * 在参考节点之前插入一个拥有指定父节点的子节点
   * @param {*} parentNode - 新插入节点的父节点
   * @param {*} newNode - 用于插入的新节点
   * @param {*} referenceNode - 参考节点 (新节点将要插在这个节点之前)
   */
  function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild (node, child) { // 删除元素的子节点
    node.removeChild(child);
  }

  function appendChild (node, child) { // 向节点的子节点列表的末尾添加新的子节点
    node.appendChild(child);
  }

  function parentNode (node) { // 获取元素的父节点
    return node.parentNode
  }

  function nextSibling (node) { // 返回同层级的下一个节点
    return node.nextSibling
  }

  function tagName (node) { // 获取元素标签名
    return node.tagName
  }

  function setTextContent (node, text) { // 获取节点及其后代的文本内容 (和innerText, innerHTML有些许区别, 可自行了解)
    node.textContent = text;
  }

  function setStyleScope (node, scopeId) { // 给节点设置scopeId属性 (样式作用域)
    node.setAttribute(scopeId, '');
  }

  var nodeOps = /*#__PURE__*/Object.freeze({ // 操作 DOM节点的方法集合 (Object.freeze: 防止修改对象属性)
    createElement: createElement$1, // 创建DOM节点
    createElementNS: createElementNS, // 创建具有的命名空间的节点
    createTextNode: createTextNode, // 创建一个文本节点
    createComment: createComment, // 创建一个注释节点
    insertBefore: insertBefore, // 在参考节点之前插入一个拥有指定父节点的子节点
    removeChild: removeChild, // 删除元素的子节点
    appendChild: appendChild, // 向节点的子节点列表的末尾添加新的子节点
    parentNode: parentNode, // 获取元素的父节点
    nextSibling: nextSibling, // 返回同层级的下一个节点
    tagName: tagName, // 获取元素标签名
    setTextContent: setTextContent, // 获取节点及其后代的文本内容
    setStyleScope: setStyleScope // 给节点设置 scopeId属性 (样式作用域)
  });

  var ref = { // ref对象: 用于处理 Vue组件中的 ref特性
    /**
     * 创建 vnode时调用的方法
     * @param {any} _ - 占位符参数, 不使用
     * @param {VNode} vnode - 当前创建的虚拟节点
     */
    create: function create (_, vnode) {
      registerRef(vnode); // 注册 vnode的 ref
    },
    /**
     * 更新 vnode时调用的方法
     * @param {VNode} oldVnode - 旧的虚拟节点
     * @param {VNode} vnode - 新的虚拟节点
     */
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true); // 注销旧 vnode的 ref
        registerRef(vnode); // 注册新 vnode的 ref
      }
    },
    /**
     * 销毁 vnode时调用的方法
     * @param {VNode} vnode - 当前销毁的虚拟节点
     */
    destroy: function destroy (vnode) {
      registerRef(vnode, true); // 注销 vnode的 ref
    }
  };

  /**
   * 注册/注销 ref
   * @param {VNode} vnode - 虚拟节点
   * @param {boolean} isRemoval - 是否为注销操作 (默认为false)
   */
  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref; // 获取 ref的键值
    if (!isDef(key)) { return } // 如果没有 ref, 则直接返回

    var vm = vnode.context; // 当前组件实例
    var ref = vnode.componentInstance || vnode.elm; // 获取组件实例或 DOM元素
    var refs = vm.$refs; // 获取组件实例上的 $refs对象
    if (isRemoval) { // 如果是注销操作
      if (Array.isArray(refs[key])) { // 如果当前 ref的引用是数组, 即多个组件, 则从数组中移除当前 ref
        remove(refs[key], ref);
      } else if (refs[key] === ref) { // 如果不是数组, 则将其置为 undefined
        refs[key] = undefined;
      }
    } else { // 如果是注册操作
      if (vnode.data.refInFor) { // 如果虚拟节点处于 v-for循环中
        if (!Array.isArray(refs[key])) { // 如果当前 ref的引用不是数组, 则初始化为数组
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) { // 如果当前 ref的引用是数组但不包含当前 ref, 则添加到数组中
          refs[key].push(ref);
        }
      } else { // 如果不处于 v-for循环中, 则直接通过键值赋值给 refs对象
        refs[key] = ref;
      }
    }
  }

  var emptyNode = new VNode('', {}, []); // 创建一个空的虚拟节点, 不包含任何内容

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy']; // 包含一组钩子函数的数组 (用于管理组件的生命周期)

  /**
   * 判断两个虚拟节点是否相等
   * @param {Vnode} a - 虚拟节点a
   * @param {Vnode} b - 虚拟节点b
   * @returns {Boolean}
   */
  function sameVnode (a, b) {
    return (
      a.key === b.key && // key属性相等 (当无key属性时, 则都为undefined, 相等)
      a.asyncFactory === b.asyncFactory && (
        (
          a.tag === b.tag && // 标签名相等
          a.isComment === b.isComment && // 
          isDef(a.data) === isDef(b.data) &&
          sameInputType(a, b)
        ) || (
          isTrue(a.isAsyncPlaceholder) &&
          isUndef(b.asyncFactory.error)
        )
      )
    )
  }

  /**
   * 判断两个虚拟节点的输入类型是否相同
   * @param {VNode} a - 虚拟节点 a
   * @param {VNode} b - 虚拟节点 b
   * @returns {Boolean}
   */
  function sameInputType (a, b) {
    if (a.tag !== 'input') { return true } // 不是 input标签则退出
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type; // 获取节点 a的 type属性值
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type; // 获取节点 b的 type属性值
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB) // 如果 type类型相同或它们都是文本输入控件类型, 则返回 true
  }

  /**
   * 创建一个从子节点的 key到旧索引的映射对象
   * @param {Array} children - 子节点数组
   * @param {Number} beginIdx - 开始索引
   * @param {Number} endIdx - 结束索引
   * @returns {Object}
   */
  function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {}; // 存储 key到索引的映射关系
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key; // 获取子节点的 key
      if (isDef(key)) { map[key] = i; } // 将 key映射到其在子节点数组中的索引位置
    }
    return map
  }

  /**
   * 创建 patch函数
   * @param {Object} backend 
   */
  function createPatchFunction (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    /**
     * 处理后的cbs
     * {
     *   activate: [_enter]
     *   create: [updateAttrs, updateClass, updateDOMListeners, updateDOMProps, updateStyle, _enter, create, updateDirectives],
     *   destroy: [destroy, unbindDirectives],
     *   remove: [remove$$1],
     *   update: [updateAttrs, updateClass, updateDOMListeners, updateDOMProps, updateStyle, update, updateDirectives]
     * }
     */
    for (i = 0; i < hooks.length; ++i) { // 遍历钩子数组, 为每个钩子创建一个空数组
      cbs[hooks[i]] = [];
      for (j = 0; j < modules.length; ++j) { // 遍历模块数组, 将模块中定义的钩子函数添加到对应的数组中
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }
    }

    /**
     * 将真实 DOM生成虚拟节点
     * @param {HTMLElement} elm - 真实 DOM
     * @returns 虚拟节点对象
     */
    function emptyNodeAt (elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    /**
     * 创建一个移除回调函数 (用于在所有事件监听器都被移除时移除子元素)
     * @param {HTMLElement} childElm - 要移除的子元素
     * @param {Number} listeners - 子元素上的事件监听器数量
     * @returns {Function} 返回一个用于移除子元素的函数
     */
    function createRmCb (childElm, listeners) {
      function remove$$1 () { // 移除函数
        if (--remove$$1.listeners === 0) { // 当所有事件监听器都被移除时才移除子元素
          removeNode(childElm); // 移除子元素
        }
      }
      remove$$1.listeners = listeners; // 记录事件监听器数量
      return remove$$1
    }

    /**
     * 从 DOM中移除给定的元素。
     * @param {HTMLElement} el - 要移除的元素
     */
    function removeNode (el) {
      var parent = nodeOps.parentNode(el); // 获取父元素
      if (isDef(parent)) { // 如果父元素存在 (可能已经由于 v-html/v-text被移除)
        nodeOps.removeChild(parent, el); // 从父元素中移除当前元素
      }
    }

    /**
     * 检查给定的虚拟节点是否为未知元素
     * @param {VNode} vnode - 虚拟节点
     * @param {Boolean} inVPre - 是否在 v-pre指令内
     * @returns {Boolean}
     */
    function isUnknownElement$$1 (vnode, inVPre) {
      return (
        !inVPre && // 不在 v-pre指令内
        !vnode.ns && // 没有命名空间
        !( // 没有被忽略
          config.ignoredElements.length &&
          config.ignoredElements.some(function (ignore) {
            return isRegExp(ignore) // 如果是正则表达式, 检查是否匹配
              ? ignore.test(vnode.tag)
              : ignore === vnode.tag  // 否则检查是否相等
          })
        ) &&
        config.isUnknownElement(vnode.tag) // 是未知元素
      )
    }

    var creatingElmInVPre = 0; // 用于跟踪在 v-pre指令中创建的元素数量
    /**
     * 创建元素并将其插入 DOM中
     * @param {VNode} vnode - 要为其创建元素的虚拟 DOM节点
     * @param {Array} insertedVnodeQueue - 用于跟踪已插入的虚拟节点的数组
     * @param {Element} parentElm - 要在其中插入新元素的父级 DOM元素
     * @param {Element} refElm - 在其前面插入新元素的参考 DOM元素
     * @param {Boolean} nested - 是否嵌套在另一个元素创建中
     * @param {Array} ownerArray - 虚拟节点所属的数组, 用于跟踪虚拟节点的使用情况
     * @param {Number} index - 虚拟节点在其所属数组中的索引
     */
    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm,
      nested,
      ownerArray,
      index
    ) {
      if (isDef(vnode.elm) && isDef(ownerArray)) { // 如果 VNode的真实 DOM存在并且它属于某个数组, 则需要克隆该 VNode
        // 这个 VNode在之前的渲染中已经被使用过了 ！
        // 现在它被用作新的节点, 直接覆盖它的 elm可能会导致后续的补丁错误,
        // 因此在创建关联的 DOM元素之前, 我们会按需克隆该节点
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      vnode.isRootInsert = !nested; // 标记是否是根节点的插入, 用于过渡动画检查
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) { // 如果 VNode是一个组件, 则尝试创建组件实例并挂载
        return
      }

      var data = vnode.data; // VNode的数据对象
      var children = vnode.children; // VNode的子节点数组
      var tag = vnode.tag; // VNode的标签名
      if (isDef(tag)) { // 如果 VNode有标签名
        {
          if (data && data.pre) { // 标记处于 v-pre中创建节点的数量
            creatingElmInVPre++;
          }
          if (isUnknownElement$$1(vnode, creatingElmInVPre)) { // 如果是未知的自定义元素, 给出警告提示
            warn(
              'Unknown custom element: <' + tag + '> - did you ' +
              'register the component correctly? For recursive components, ' +
              'make sure to provide the "name" option.',
              vnode.context
            );
          }
        }

        vnode.elm = vnode.ns // 创建具有指定标签名的元素节点
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode); // 设置 VNode的作用域

        { // 创建 VNode的子节点并递归创建它们的 DOM元素, 并将它们插入到父级节点中
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef(data)) { // 调用创建钩子
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm); // 将 VNode的真实 DOM插入到父级元素中
        }

        if (data && data.pre) { // 更新 v-pre中创建节点的数量
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) { // 如果是注释节点
        vnode.elm = nodeOps.createComment(vnode.text); // 创建注释节点
        insert(parentElm, vnode.elm, refElm); // 将注释节点插入到父级元素中
      } else { // 如果是文本节点
        vnode.elm = nodeOps.createTextNode(vnode.text); // 创建文本节点
        insert(parentElm, vnode.elm, refElm); // 将文本节点插入到父级元素中
      }
    }

    /**
     * 创建组件
     * @param {VNode} vnode - 组件的虚拟节点
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     * @param {Element} parentElm - 组件的父元素
     * @param {Element} refElm - 参考元素, 在该元素之前插入组件
     * @returns {Boolean} 如果成功创建了组件, 则返回 true
     */
    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data; // 虚拟节点的数据对象
      if (isDef(i)) { // 如果数据对象已定义
        var isReactivated = isDef(vnode.componentInstance) && i.keepAlive; // 是否需要重新激活
        if (isDef(i = i.hook) && isDef(i = i.init)) { // 如果定义了 init钩子函数, 则调用 init钩子函数进行组件的初始化
          i(vnode, false /* hydrating */);
        }
        // 在调用 init钩子函数后, 如果虚拟节点是一个子组件
        // 它应该已经创建了一个子实例并挂载了它, 子组件也设置了占位符虚拟节点的 elm属性
        // 在这种情况下, 我们只需返回该元素并完成操作
        if (isDef(vnode.componentInstance)) { // 如果成功创建了子组件实例
          initComponent(vnode, insertedVnodeQueue); // 初始化组件
          insert(parentElm, vnode.elm, refElm); // 将组件插入到父元素中
          if (isTrue(isReactivated)) { // 如果需要重新激活组件
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm); // 重新激活组件
          }
          return true // 表示成功创建了组件
        }
      }
    }

    /**
     * 初始化组件
     * @param {VNode} vnode - 虚拟节点
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     */
    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) { // 如果组件有待插入的虚拟节点队列
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert); // 将待插入的虚拟节点队列中的节点添加到全局的插入队列中
        vnode.data.pendingInsert = null; // 清空组件的待插入队列
      }
      vnode.elm = vnode.componentInstance.$el; // 将组件的 elm属性指向组件实例的根 DOM元素
      if (isPatchable(vnode)) { // 如果虚拟节点是可打补丁的
        invokeCreateHooks(vnode, insertedVnodeQueue); // 调用组件的 create钩子函数
        setScope(vnode); // 设置组件的作用域
      } else {
        // 空组件根节点
        // 跳过除 ref外的所有与元素相关的模块
        registerRef(vnode); // 注册 ref
        insertedVnodeQueue.push(vnode); // 确保调用插入钩子函数
      }
    }

    /**
     * 重新激活组件
     * @param {VNode} vnode - 虚拟节点
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     * @param {Element} parentElm - 父级 DOM元素
     * @param {Element} refElm - 参考的 DOM元素
     */
    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // 为了解决 #4339: 重新激活的带有内部过渡的组件, 之所以不会触发是因为内部节点的创建钩子没有再次调用
      var innerNode = vnode;
      while (innerNode.componentInstance) { // 遍历组件的内部节点
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) { // 如果内部节点定义了过渡
          for (i = 0; i < cbs.activate.length; ++i) { // 触发激活钩子函数
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode); // 将内部节点添加到插入的虚拟节点队列中
          break
        }
      }
      // 与新创建的组件不同, 重新激活的 keep-alive组件不会自行插入
      insert(parentElm, vnode.elm, refElm); // 将组件插入到父级 DOM元素中
    }

    /**
     * 将元素插入到父级元素中
     * @param {Element} parent - 父级元素
     * @param {Element} elm - 要插入的元素
     * @param {Element} ref$$1 - 参考的元素
     */
    function insert (parent, elm, ref$$1) {
      if (isDef(parent)) {
        if (isDef(ref$$1)) { // 如果参考元素存在并且是父级元素的子元素, 则在参考元素之前插入元素
          if (nodeOps.parentNode(ref$$1) === parent) {
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else { // 如果没有参考元素, 则将元素追加到父级元素的末尾
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    /**
     * 创建子节点并将它们插入到父元素中
     * @param {VNode} vnode - 虚拟节点
     * @param {Array} children - 子节点数组
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     */
    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        { // 检查是否有重复的 key
          checkDuplicateKeys(children);
        }
        for (var i = 0; i < children.length; ++i) { // 遍历子节点数组, 逐个创建并插入到父元素中
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i); // 创建子节点
        }
      } else if (isPrimitive(vnode.text)) { // 如果 vnode.text是基本类型(字符串, 数字等), 则创建文本节点并插入到父元素中
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    /**
     * 检查虚拟节点是否可以进行修补 (patch)
     * @param {VNode} vnode - 虚拟节点
     * @returns {Boolean}
     */
    function isPatchable (vnode) {
      while (vnode.componentInstance) { // 当存在子组件时, 将 VNode更新为其子组件的根节点 VNode
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag) // 检查更新后的 VNode是否有定义标签名, 如果有则可以进行修补
    }

    /**
     * 调用创建钩子函, 执行 VNode的 create钩子以及全局的 create钩子
     * @param {VNode} vnode - 虚拟节点
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     */
    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) { // 遍历全局的 create钩子函数数组, 执行每个钩子函数
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook;
      if (isDef(i)) { // 如果 VNode的 hook存在
        if (isDef(i.create)) { i.create(emptyNode, vnode); } // 如果 VNode 的 hook中有 create钩子, 则执行 create钩子
        if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); } // 如果 VNode的 hook中有 insert钩子, 则将 VNode添加到插入的虚拟节点队列中
      }
    }

    /**
     * 为作用域 CSS设置作用域 id属性
     * @param {VNode} vnode - 虚拟节点
     */
    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) { // 如果 vnode的 fnScopeId存在, 则为 vnode的元素设置样式作用域
        nodeOps.setStyleScope(vnode.elm, i);
      } else { // 否则, 遍历 vnode的祖先节点
        var ancestor = vnode;
        while (ancestor) { // 如果祖先节点的上下文存在, 并且上下文的选项中存在 _scopeId, 则为 vnode的元素设置样式作用域
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent; // 移动到祖先节点的父级
        }
      }
      // 对于插槽内容, 还应该从主机实例获取作用域 id
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) { // 如果激活的实例存在且不是 vnode的上下文或函数上下文, 并且选项中存在 _scopeId, 则为 vnode的元素设置样式作用域
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    /**
     * 向父元素添加一组新的虚拟节点
     * @param {Element} parentElm - 父元素节点
     * @param {Element} refElm - 参考节点, 在其之前插入新节点
     * @param {Array<VNode>} vnodes - 要添加的虚拟节点数组
     * @param {Number} startIdx - 起始索引
     * @param {Number} endIdx - 结束索引
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     */
    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) { // 从 startIdx到 endIdx遍历虚拟节点数组
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx); // 创建虚拟节点对应的真实 DOM元素, 并将其插入到父元素中
      }
    }

    /**
     * 调用销毁钩子函数, 用于销毁虚拟节点及其子节点
     * @param {VNode} vnode - 虚拟节点
     */
    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef(data)) { // 如果虚拟节点有相关数据
        if (isDef(i = data.hook) && isDef(i = i.destroy)) { // 调用 destroy钩子函数
          i(vnode);
        }
        for (i = 0; i < cbs.destroy.length; ++i) { // 遍历执行全局 destroy钩子函数
          cbs.destroy[i](vnode);
        }
      }
      if (isDef(i = vnode.children)) { // 递归调用子节点的销毁钩子函数
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    /**
     * 移除一组虚拟节点
     * @param {Array} vnodes - 虚拟节点数组
     * @param {Number} startIdx - 开始索引
     * @param {Number} endIdx - 结束索引
     */
    function removeVnodes (vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) { // 从 startIdx到 endIdx遍历虚拟节点数组
        var ch = vnodes[startIdx];
        if (isDef(ch)) { // 检查虚拟节点是否存在
          if (isDef(ch.tag)) { // 如果是元素节点
            removeAndInvokeRemoveHook(ch); // 移除元素节点并调用相关的移除钩子函数
            invokeDestroyHook(ch); // 调用销毁钩子函数
          } else { // 如果是文本节点
            removeNode(ch.elm); // 直接移除文本节点
          }
        }
      }
    }

    /**
     * 移除元素节点并触发相关的移除钩子函数
     * @param {Object} vnode - 虚拟节点
     * @param {Function} rm - 移除回调函数
     */
    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) { // 检查移除回调函数或者虚拟节点数据是否存在
        var i;
        var listeners = cbs.remove.length + 1; // 移除监听器数量
        if (isDef(rm)) { // 如果存在递归传递的移除回调函数, 则增加监听器数量
          rm.listeners += listeners;
        } else { // 如果不存在递归传递的移除回调函数, 则创建一个移除回调函数
          rm = createRmCb(vnode.elm, listeners);
        }
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) { // 递归地在子组件根节点上触发钩子函数
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) { // 触发移除钩子函数
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) { // 调用移除钩子函数或直接移除节点
          i(vnode, rm);
        } else {
          rm();
        }
      } else { // 如果既没有移除回调函数也没有虚拟节点数据, 则直接移除节点
        removeNode(vnode.elm);
      }
    }

    /** 
     * 更新父节点下的子节点列表 TODO TODO
     * @param {Element} parentElm - 父节点的 DOM元素
     * @param {Array} oldCh - 旧的子节点数组
     * @param {Array} newCh - 新的子节点数组
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     * @param {Boolean} removeOnly - 是否仅删除
    */
    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0; // 旧节点的头指针
      var newStartIdx = 0; // 新节点的头指针
      var oldEndIdx = oldCh.length - 1; // 旧节点的尾指针
      var oldStartVnode = oldCh[0]; // 旧节点的头节点
      var oldEndVnode = oldCh[oldEndIdx]; // 旧节点的尾节点
      var newEndIdx = newCh.length - 1; // 新节点的尾指针
      var newStartVnode = newCh[0]; // 新节点的头节点
      var newEndVnode = newCh[newEndIdx]; // 新节点的尾节点
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      var canMove = !removeOnly; // removeOnly 是一个特殊的标志, 仅在 <transition-group>中使用 (确保在离开过渡期间, 已删除的元素保持正确的相对位置)

      { // 检查是否存在重复的 key
        checkDuplicateKeys(newCh);
      }

      // 双端指针Diff
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) { // 如果旧节点的头节点为空, 说明该节点已经在新节点列表中找到了位置, 需要将旧节点的头指针向后移动
          oldStartVnode = oldCh[++oldStartIdx];
        } else if (isUndef(oldEndVnode)) { // 如果旧节点的尾节点为空, 说明该节点已经在新节点列表中找到了位置, 需要将旧节点的尾指针向前移动
          oldEndVnode = oldCh[--oldEndIdx];
        // 旧节点的头节点与新节点的头节点进行比较
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx]; // 移动旧节点的头指针以及更新旧节点的头节点
          newStartVnode = newCh[++newStartIdx]; // 移动新节点的头指针以及更新新节点的头节点
        // 旧节点的尾节点与新节点的尾节点进行比较
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx]; // 移动旧节点的尾指针以及更新旧节点的尾节点
          newEndVnode = newCh[--newEndIdx]; // 移动新节点的尾指针以及更新新节点的尾节点
        // 旧节点的头节点与新节点的尾节点进行比较
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm)); // 将旧节点的头节点移动到旧节点的尾节点之后
          oldStartVnode = oldCh[++oldStartIdx]; // 移动旧节点的头指针以及更新旧节点的头节点
          newEndVnode = newCh[--newEndIdx];     // 移动新节点的尾指针以及更新新节点的尾节点
        // 旧节点的尾节点与新节点的头节点进行比较
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm); // 将旧节点的尾节点移动到旧节点的头节点之前
          oldEndVnode = oldCh[--oldEndIdx];     // 移动旧节点的尾指针以及更新旧节点的尾节点
          newStartVnode = newCh[++newStartIdx]; // 移动新节点的头指针以及更新新节点的头节点
        } else {
          // 生成旧节点映射表, 根据新节点的 key 查找对应的旧节点在旧节点列表中的索引
          if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) { // 如果在映射表中找不到对应的索引, 则说明这是一个新节点, 需要创建
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else { // 在映射表中找到了对应的旧节点, 尝试复用或者移动
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) { // 如果找到的旧节点和新节点是同一个节点, 则尝试复用
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx); // 复用旧节点
              oldCh[idxInOld] = undefined; // 将旧节点置为 undefined, 表示已经被复用
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm); // 将复用的节点移动到旧节点的头节点之前
            } else { // 如果 key 相同但节点不同, 按照新节点处理, 创建新节点并插入父级节点
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx]; // 移动新节点的头指针以及更新新节点的头节点
        }
      }
      if (oldStartIdx > oldEndIdx) { // 当新节点有剩余元素, 则插入
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm; // 通过判断剩余节点的下一个节点是否有值, 来判断插入位置
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue); // 插入DOM元素
      } else if (newStartIdx > newEndIdx) { // 当旧节点有剩余元素, 则删除
        removeVnodes(oldCh, oldStartIdx, oldEndIdx); // 删除 DOM元素
      }
    }

    /**
     * 检查子节点数组中的重复 key (如果存在重复的 key, 就会抛出错误, 每个虚拟节点在其父节点下必须具有唯一的 key属性)
     * @param {Array} children - 子节点数组
     */
    function checkDuplicateKeys (children) {
      var seenKeys = {}; // 用于存储已经出现的键值对
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i]; // 获取当前子节点
        var key = vnode.key; // 获取当前子节点的键值
        if (isDef(key)) { // 检查是否已经存在于 seenKeys对象中
          if (seenKeys[key]) {// 如果存在相同的键值, 则发出警告
            warn(
              ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
              vnode.context
            );
          } else { // 反之将当前键值标记为已出现过
            seenKeys[key] = true;
          }
        }
      }
    }

    /**
     * 在旧节点数组中查找与给定节点相同的节点的索引
     * @param {VNode} node - 给定的节点
     * @param {Array} oldCh - 旧节点数组
     * @param {Number} start - 开始搜索的索引
     * @param {Number} end - 结束搜索的索引 (不包括)
     * @returns {Number}
     */
    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i]; // 获取旧节点数组中的当前节点
        if (isDef(c) && sameVnode(node, c)) { // 检查当前节点是否存在且与给定节点相同
          return i // 如果是相同节点, 则返回索引
        }
      }
    }

    /**
     * 对比新旧虚拟节点, 并根据差异进行相应的更新操作
     * @param {VNode} oldVnode - 旧虚拟节点
     * @param {VNode} vnode - 新虚拟节点
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     * @param {Array} ownerArray - 虚拟节点的拥有者数组
     * @param {Number} index - 虚拟节点在拥有者数组中的索引
     * @param {Boolean} removeOnly - 是否只是移除节点
     */
    function patchVnode (
      oldVnode,
      vnode,
      insertedVnodeQueue,
      ownerArray,
      index,
      removeOnly
    ) {
      if (oldVnode === vnode) { // 新旧节点完全相同, 则不需要进行任何操作, 直接返回
        return
      }

      if (isDef(vnode.elm) && isDef(ownerArray)) { // 如果新节点有 elm属性, 并且 ownerArray存在，则将 VNode克隆一份赋给 ownerArray[index]
        vnode = ownerArray[index] = cloneVNode(vnode); // 在 key重用时, 如果新旧节点的 key相同, 且有在 ownerArray中, 可以避免重复创建新节点, 而是复用旧节点, 这有助于减少 DOM操作
      }

      var elm = vnode.elm = oldVnode.elm; // 将旧 VNode的 DOM元素引用赋值给新 VNode (这样可以保持新旧 VNode的 DOM元素引用一致)

      // 这个过程主要是用于处理异步组件, 如果一个组件是异步加载的, 
      // 它会先使用一个异步占位符作为初始的 vnode, 然后当异步加载完成后,
      // 这个占位符会被替换成真正的组件 vnode, 在这个替换过程中,
      // 如果新组件已经被解析了, 就直接挂载到 DOM上, 否则保持异步占位符的状态
      if (isTrue(oldVnode.isAsyncPlaceholder)) { // 如果旧 VNode是异步占位符, 则判断新 VNode是否已经被解析
        if (isDef(vnode.asyncFactory.resolved)) { // 如果已经被解析, 则调用 hydrate方法将新 VNode和它的子节点挂载到 DOM上
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else { // 如果未被解析, 则将新 VNode标记为异步占位符
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      /* 静态节点的处理 */
      if (isTrue(vnode.isStatic) && // 如果新旧节点都是静态节点
        isTrue(oldVnode.isStatic) && 
        vnode.key === oldVnode.key && // 并且具有相同的 key
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce)) // 且是克隆节点或使用了 v-once指令
      ) { // 则复用旧节点的组件实例
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) { // 执行prepatch钩子函数
        i(oldVnode, vnode);
      }

      /* 节点属性的处理 */
      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef(data) && isPatchable(vnode)) { // 如果 VNode是可打补丁的节点, 则执行 patch钩子函数
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); } // 执行update钩子函数
      }

      /* 对子节点的处理 */
      if (isUndef(vnode.text)) { // 新节点非文本节点
        if (isDef(oldCh) && isDef(ch)) { // 如果旧节点的子节点存在, 并且新节点的子节点也存在
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); } // 如果旧节点的子节点列表不等于新节点的子节点列表, 则更新子节点列表
        } else if (isDef(ch)) { // 如果旧节点的子节点不存在, 新节点的子节点存在
          { // 检查是否有重复的 key
            checkDuplicateKeys(ch);
          }
          if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); } // 如果旧节点的文本存在, 则清空旧节点的文本内容
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue); // 创建新节点并添加到父节点
        } else if (isDef(oldCh)) { // 如果旧节点的子节点存在, 新节点的子节点不存在
          removeVnodes(oldCh, 0, oldCh.length - 1); // 移除旧节点的子节点
        } else if (isDef(oldVnode.text)) { // 如果旧节点的文本存在
          nodeOps.setTextContent(elm, ''); // 清空旧节点的文本内容
        }
      } else if (oldVnode.text !== vnode.text) { // 新旧节点都为文本节点且文本不一样, 则更新文本内容
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) { // 如果 VNode的 data属性存在, 并且具有 postpatch钩子函数
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); } // 执行 postpatch钩子函数
      }
    }

    /**
     * 调用插入钩子函数
     * @param {VNode} vnode - 虚拟节点
     * @param {Array} queue - 待执行的插入钩子队列
     * @param {Boolean} initial - 是否为初始调用
     */
    function invokeInsertHook (vnode, queue, initial) {
      if (isTrue(initial) && isDef(vnode.parent)) { // 如果是初始调用, 并且 vnode的父节点存在
        vnode.parent.data.pendingInsert = queue; // 则将待执行的插入钩子队列存储在 VNode的父节点的 pendingInsert属性中, 以便稍后执行
      } else { // 否则遍历插入钩子队列, 逐个调用钩子函数
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false; // 标记是否跳过了水合
    // 以下模块在水合过程中可以跳过 create钩子, 因为它们已经在客户端上渲染或不需要初始化 (style模块被排除, 因为它依赖于初始克隆以进行未来的深度更新)
    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    /**
     * 用于将 `虚拟节点/VNode` 与 `真实 DOM元素/elm` 进行匹配 (从而完成 `SSR/服务器端渲染` 的重用和激活)
     * @param {Element} elm - 真实DOM元素
     * @param {VNode} vnode - 虚拟节点
     * @param {Array} insertedVnodeQueue - 插入的虚拟节点队列
     * @param {Boolean} inVPre - 是否在 v-pre环境中
     * @returns {Boolean}
     */
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag; // 虚拟节点的标签名
      var data = vnode.data; // 虚拟节点的数据
      var children = vnode.children; // 虚拟节点的子节点数组
      inVPre = inVPre || (data && data.pre); // 是否在 v-pre环境中
      vnode.elm = elm; // 设置虚拟节点的 elm属性为对应的真实 DOM元素

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) { // 如果是异步组件的占位符, 并且具有异步工厂函数, 则设置为异步占位符, 并返回 true
        vnode.isAsyncPlaceholder = true; // 设置为异步占位符
        return true
      }
      { // 判断真实 DOM和虚拟节点是否匹配, 不匹配则返回 false
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false
        }
      }
      if (isDef(data)) { // 如果虚拟节点具有 data属性
        if (isDef(i = data.hook) && isDef(i = i.init)) { // 如果 data具有 init钩子函数, 则执行该函数
          i(vnode, true /* hydrating */);
        }
        if (isDef(i = vnode.componentInstance)) { // 如果 VNode具有组件实例, 说明是子组件, 则初始化子组件并返回 true
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) { // 如果虚拟节点的标签名存在
        if (isDef(children)) { // 如果虚拟节点存在子节点
          if (!elm.hasChildNodes()) { // 如果真实 DOM元素没有子节点, 则创建并插入子节点
            createChildren(vnode, children, insertedVnodeQueue);
          } else { // 如果真实 DOM元素有子节点
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) { // 如果存在 innerHTML, 则比较服务器和客户端 innerHTML是否一致, 不一致则返回 false
              if (i !== elm.innerHTML) {
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else { // 逐个比较子节点列表是否匹配
              var childrenMatch = true; // 用于标记子节点是否匹配
              var childNode = elm.firstChild; // 获取实际 DOM元素的第一个子节点
              for (var i$1 = 0; i$1 < children.length; i$1++) { // 遍历虚拟节点的子节点数组
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) { // 如果真实 DOM元素没有子节点或虚拟节点的子节点与实际 DOM元素的子节点不匹配
                  childrenMatch = false; // 标记子节点不匹配, 跳出循环
                  break
                }
                childNode = childNode.nextSibling; // 获取真实 DOM元素的下一个兄弟节点, 用于下一轮循环
              }
              if (!childrenMatch || childNode) { // 如果子节点不匹配或真实 DOM元素的子节点数量多于虚拟节点的子节点数量, 则返回 false
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef(data)) { // 如果虚拟节点具有 data属性存在
          var fullInvoke = false;
          for (var key in data) { // 遍历 data, 如果没有渲染模块, 则执行 create钩子函数
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) { // 如果不存在渲染模块, 并且 data中有 class, 则为深度监听 class
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) { // 如果 elm.data与 vnode.text不相等, 则更新 elm.data为 vnode.text
        elm.data = vnode.text;
      }
      return true
    }

    /**
     * 判断真实 DOM和虚拟节点是否匹配
     * @param {Element} node - 真实DOM元素
     * @param {VNode} vnode - 虚拟节点
     * @param {Boolean} inVPre - 是否在 v-pre环境中
     * @returns {Boolean}
     */
    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef(vnode.tag)) { // 如果虚拟节点的标签已定义
        return vnode.tag.indexOf('vue-component') === 0 || ( // 如果虚拟节点的标签以 'vue-component' 开头
          !isUnknownElement$$1(vnode, inVPre) && // 或不是未知元素
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase()) // 且标签名与真实DOM的标签名匹配
        )
      } else { // 如果虚拟节点的标签未定义, 则判断真实DOM的节点类型是否与虚拟节点的注释标记匹配 (如果是注释节点则返回 8, 文本节点返回 3)
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    /**
     * 对比新旧 VNode, 将变化应用到 DOM上
     * @param {VNode} oldVnode - 旧的 VNode对象
     * @param {VNode} vnode - 新的 VNode对象
     * @param {Boolean} hydrating - 是否在水合过程中 (服务端渲染时使用)
     * @param {Boolean} removeOnly - 是否只执行删除操作
     * @returns {Element} - 返回更新后的根 DOM元素
     */
    return function patch (oldVnode, vnode, hydrating, removeOnly) {
      if (isUndef(vnode)) { // 当新的 VNode不存在时, 执行销毁钩子 (例: patch(vnode, null)) 
        if (isDef(oldVnode)) {
          invokeDestroyHook(oldVnode); // destroy方法
        }
        return
      }

      var isInitialPatch = false; // 是否为初始 patch操作
      var insertedVnodeQueue = []; // 插入的 VNode队列

      if (isUndef(oldVnode)) { // 当旧的 VNode不存在时, 表示组件挂载的初始 patch操作
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue); // 创建新的 DOM元素并将其插入到 DOM中
      } else {
        var isRealElement = isDef(oldVnode.nodeType); // 是否为真实 DOM (是否拥有nodeType属性)
        // sameVnode: 新旧节点是否相等, 此处的相等表示 Vnode的 tag(标签名)属性和 key(节点标识)属性相等
        // 旧节点为虚拟节点且新旧节点相同 (使用 Diff算法更新)
        if (!isRealElement && sameVnode(oldVnode, vnode)) { // 当旧节点不是真实 DOM元素且新旧节点相同时, 执行更新操作
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        // 旧节点为虚拟节点且新旧节点不相同 或 旧节点为真实节点(创建并插入新节点, 移除旧节点)
        } else {
          if (isRealElement) {
            // SSR_ATTR: 'data-server-rendered' 是否是服务端渲染
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR); // 移除节点上的服务端渲染标识属性
              hydrating = true;
            }
            if (isTrue(hydrating)) { // 在水合过程中尝试将服务端渲染的 VNode转换为客户端渲染的 VNode
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else { // 水合失败, 警告用户并进行全量客户端渲染
                warn(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                );
              }
            }

            oldVnode = emptyNodeAt(oldVnode); // 不是服务端渲染或水合失败, 则创建一个空节点(虚拟节点)并替换它
          }

          var oldElm = oldVnode.elm; // 旧节点的真实DOM
          var parentElm = nodeOps.parentNode(oldElm); // 旧节点的父节点

          createElm( // 创建新节点(真实DOM)并插入父节点
            vnode,
            insertedVnodeQueue,
            oldElm._leaveCb ? null : parentElm, // 避免在离开过渡中插入新节点
            nodeOps.nextSibling(oldElm) // 插入到旧节点的下一个兄弟节点之前
          );

          if (isDef(vnode.parent)) { // 递归更新父占位符节点元素
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) { // 调用父节点的销毁钩子
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) { // 调用父节点的创建钩子
                  cbs.create[i$1](emptyNode, ancestor);
                }
                var insert = ancestor.data.hook.insert; // 对于已合并的插入钩子, 逐个执行插入操作
                if (insert.merged) {
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // 销毁旧节点
          if (isDef(parentElm)) {
            removeVnodes([oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) { // 当父节点不存在时, 调用销毁钩子
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch); // 调用插入钩子
      return vnode.elm // 返回更新后的根 DOM元素
    }
  }

  var directives = { // 指令的生命周期钩子函数
    create: updateDirectives, // 指令的 create钩子函数 (用于在虚拟节点创建时执行指令的创建逻辑)
    update: updateDirectives, // 指令的 update钩子函数 (用于在虚拟节点更新时执行指令的更新逻辑)
    destroy: function unbindDirectives (vnode) { // 指令的 destroy钩子函数 (用于在虚拟节点销毁时执行指令的销毁逻辑)
      updateDirectives(vnode, emptyNode); // 执行销毁逻辑 (updateDirectives: 更新指令)
    }
  };

  /**
   * 更新指令
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {VNode} vnode - 新的虚拟节点
   */
  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) { // 如果旧节点或新节点存在指令
      _update(oldVnode, vnode); // 更新指令
    }
  }

  /**
   * 更新指令
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {VNode} vnode - 新的虚拟节点
   */
  function _update (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode; // 判断是否为创建新节点
    var isDestroy = vnode === emptyNode; // 判断是否为销毁节点
    /* 标准化指令对象 */
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = []; // 用于存储需要调用 inserted钩子的指令
    var dirsWithPostpatch = []; // 用于存储需要调用 componentUpdated钩子的指令

    var key, oldDir, dir;
    for (key in newDirs) { // 遍历新指令对象, 进行处理
      oldDir = oldDirs[key]; // 旧节点中的指令
      dir = newDirs[key]; // 新节点中的指令
      if (!oldDir) {// 如果不存在旧指令, 则说明是新指令, 执行 bind钩子
        callHook$1(dir, 'bind', vnode, oldVnode); // 执行 bind钩子
        if (dir.def && dir.def.inserted) { // 如果有定义 inserted钩子函数, 将该指令添加到 dirsWithInsert数组中
          dirsWithInsert.push(dir);
        }
      } else { // 如果存在旧指令, 则执行 update钩子
        dir.oldValue = oldDir.value; // 保存旧值
        dir.oldArg = oldDir.arg; // 保存旧参数
        callHook$1(dir, 'update', vnode, oldVnode); // 执行 update钩子
        if (dir.def && dir.def.componentUpdated) { // 如果有定义 componentUpdated钩子函数, 将该指令添加到 dirsWithPostpatch数组中
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) { // 执行所有 dirsWithInsert数组中的指令的 inserted钩子
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode); // 执行 insert钩子
        }
      };
      if (isCreate) { // 如果是创建新节点, 将 callInsert函数合并到 vnode的 insert钩子函数中
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else { // 否则执行 insert钩子
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) { // 执行所有 dirsWithPostpatch数组中的指令的 componentUpdated钩子
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode); // 执行 componentUpdated钩子
        } 
      });
    }

    if (!isCreate) { // 如果不是创建新节点, 则处理需要销毁的旧指令
      for (key in oldDirs) {
        if (!newDirs[key]) { // 不存在于新节点中的指令, 执行 unbind钩子函数
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy); // 执行 unbind钩子
        }
      }
    }
  }

  var emptyModifiers = Object.create(null); // 为指令添加空修饰符对象
  /**
   * 规范化指令对象数组，返回一个规范化后的指令对象字典
   * @param {Array} dirs - 指令对象数组
   * @param {Vue} vm - Vue 实例
   * @returns {Object} - 规范化后的指令对象字典
   */
  function normalizeDirectives$1 (
    dirs,
    vm
  ) {
    var res = Object.create(null); // 创建一个空对象作为结果
    if (!dirs) { // 如果指令数组为空, 则直接返回空对象
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) { // 遍历指令数组
      dir = dirs[i];
      if (!dir.modifiers) { // 如果指令没有修饰符
        dir.modifiers = emptyModifiers; // 添加空的修饰符
      }
      res[getRawDirName(dir)] = dir; // 将指令对象添加到结果对象中, 使用指令名称作为键
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true); // 解析指令的定义, 并添加到指令对象的 def属性中
    }
    return res
  }

  /**
   * 获取指令对象的原始名称
   * @param {Object} dir - 指令对象
   * @returns {String}
   */
  function getRawDirName (dir) {
    // 如果指令对象的 rawName属性存在, 则直接返回该属性值; 否则将指令名称和修饰符连接成字符串返回
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  /**
   * 执行指令钩子函数
   * @param {Object} dir - 指令对象
   * @param {String} hook - 钩子函数名称
   * @param {VNode} vnode - 虚拟节点
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {Boolean} isDestroy - 是否为销毁阶段
   */
  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook]; // 获取指令定义对象中对应钩子函数的引用
    if (fn) { // 如果存在对应的钩子函数
      try { // 执行钩子函数
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) { // 捕获钩子函数执行过程中的错误
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook")); // 处理错误: 通常是输出错误信息到控制台, 并给出指令名称和钩子函数名称
      }
    }
  }

  var baseModules = [ // 基本模块数组
    ref, // 引用模块
    directives // 指令模块
  ];

  /**
   * 更新虚拟节点的属性 (更新虚拟DOM时同步更新真实DOM的属性)
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {VNode} vnode - 新的虚拟节点
   */
  function updateAttrs (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) { // 如果组件选项中设置了`inheritAttrs = false`, 则不进行属性继承, 直接返回
      return
    }
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) { // 如果新旧虚拟节点都没有属性, 则直接返回
      return
    }
    var key, cur, old;
    var elm = vnode.elm; // 新节点对应的真实DOM
    var oldAttrs = oldVnode.data.attrs || {}; // 旧节点的属性
    var attrs = vnode.data.attrs || {}; // 新节点的属性

    // 如果新节点的属性数据对象具有响应性(即 __ob__ 存在), 则进行克隆确保后续操作不会影响到原始数据对象
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend({}, attrs);
    }

    for (key in attrs) { // 遍历新节点的属性对象 (添加新属性)
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) { // 如果新旧属性值不相同, 则更新属性
        setAttr(elm, key, cur, vnode.data.pre); // 设置 DOM 元素属性
      }
    }
    /**
     * `IE9`中`input[type=radio]`设置type可能会重置`value`
     * `IE/Edge`设置`max`属性可能会将进度值强制设为 1
     */
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) { // 当前浏览器是`IE/Edge`, 且`value`属性值不同, 则单独设置`value`属性
      setAttr(elm, 'value', attrs.value); // 设置 DOM 元素属性
    }
    for (key in oldAttrs) { // 遍历旧虚拟节点的属性对象 (移除旧属性)
      if (isUndef(attrs[key])) {
        if (isXlink(key)) { // 检查属性名是否以`xlink`命名空间开头
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key)); // 使用命名空间方式移除属性
        } else if (!isEnumeratedAttr(key)) { // 如果不是枚举属性
          elm.removeAttribute(key); // 移除属性
        }
      }
    }
  }

  /**
   * 设置 DOM 元素属性
   * @param {HTMLElement} el - 需要设置属性的元素
   * @param {String} key - 属性名
   * @param {String} value - 属性值
   * @param {Boolean} isInPre - 元素是否使用`v-pre`指令跳过编译
   */
  function setAttr (el, key, value, isInPre) {
    if (isInPre || el.tagName.indexOf('-') > -1) { // TODO
      baseSetAttr(el, key, value); // 用于设置 DOM 元素的属性并处理一些特殊情况
    } else if (isBooleanAttr(key)) { // 属性是否为布尔属性
      if (isFalsyAttrValue(value)) { // 检查属性值为假值, 则移除该属性
        el.removeAttribute(key);
      } else {
        /**
         * 从技术上讲, `allowfullscreen`是 <iframe> 标签的布尔属性
         * 但是 Flash 在 <embed> 标签上使用时要求值为 true
         */
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value); // 设置属性
      }
    } else if (isEnumeratedAttr(key)) { // 属性是否为枚举属性
      el.setAttribute(key, convertEnumeratedValue(key, value)); // 设置属性 (convertEnumeratedValue: 将枚举属性的值转换为字符串)
    } else if (isXlink(key)) { // 属性是否以`xlink`命名空间开头
      if (isFalsyAttrValue(value)) { // 检查属性值为假值, 则使用命名空间方式移除属性
        el.removeAttributeNS(xlinkNS, getXlinkProp(key)); // getXlinkProp: 获取 xlink 属性真正的属性名
      } else {
        el.setAttributeNS(xlinkNS, key, value); // 设置属性（带命名空间）
      }
    } else {
      baseSetAttr(el, key, value); // 用于设置 DOM 元素的属性时处理一些特殊情况
    }
  }

  /**
   * 用于设置 DOM 元素的属性并处理一些特殊情况
   * @param {HTMLElement} el - 需要设置属性的元素
   * @param {String} key - 属性名
   * @param {String} value - 属性值
   */
  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) { // 检查属性值为假值, 则移除该属性
      el.removeAttribute(key);
    } else {
      /**
       * IE10 和 IE11, 在设置 <textarea> 元素的 placeholder 属性时会触发
       * input 事件, 即使 placeholder 属性的值为空, 这可能导致不必要的行为
       */
      if (
        isIE && !isIE9 && // IE10 和 IE11
        el.tagName === 'TEXTAREA' && // <textarea> 元素
        key === 'placeholder' && value !== '' && !el.__ieph // placeholder 属性值不为空且没被`__ieph`属性标记 (是否修补)
      ) {
        var blocker = function (e) { // 创建一个事件监听器 blocker，用于阻止后续的 input 事件并立即移除这个阻止器
          e.stopImmediatePropagation(); // 阻止监听同一事件的其他事件监听器被调用
          el.removeEventListener('input', blocker); // 移除监听器
        };
        el.addEventListener('input', blocker); // 添加监听事件
        el.__ieph = true; // 设置修补标识
      }
      el.setAttribute(key, value); // 设置属性
    }
  }

  var attrs = { // 属性的生命周期处理函数
    create: updateAttrs, // 更新虚拟节点的属性
    update: updateAttrs
  };

  /**
   * 更新元素的类名
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {VNode} vnode - 新的虚拟节点
   */
  function updateClass (oldVnode, vnode) {
    var el = vnode.elm; // 新节点对应的真实DOM
    var data = vnode.data; // 新节点的数据对象
    var oldData = oldVnode.data; // 旧节点的数据对象
    if (
      isUndef(data.staticClass) && // 新旧节点的静态类和动态类以及旧数据对象未完整定义, 直接返回
      isUndef(data.class) && (
        isUndef(oldData) || (
          isUndef(oldData.staticClass) &&
          isUndef(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode(vnode); // 生成虚拟节点对应的类名

    // 如果元素具有过渡效果, 则获取元素上存储的过渡类名, 并将其合并到新生成的类名中
    var transitionClass = el._transitionClasses; // 过渡效果的类名
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass)); // 将过度效果的类名合并到新类名中
    }

    if (cls !== el._prevClass) { // 判断新生成的类名是否与之前类名不同
      el.setAttribute('class', cls); // 设置新类名
      el._prevClass = cls; // 保存新类名
    }
  }

  var klass = { // 类名的生命周期处理函数
    create: updateClass, // 更新元素的类名
    update: updateClass
  };

  var validDivisionCharRE = /[\w).+\-_$\]]/;

  /**
   * 解析模板表达式中的过滤器/filters TODO
   * 假设原始表达式: "{{ age | toNumber }}" (传入的参数与原始表达式不同, 是处理后的字符)
   * @param {String} exp - 表达式 ("age | toNumber")
   * @returns {String} 解析后的表达式 ("_f("toNumber")(age)")
   */
  function parseFilters (exp) {
    var inSingle = false; // 在单引号内
    var inDouble = false; // 在双引号内
    var inTemplateString = false; // 在模板字符串内
    var inRegex = false; // 在正则表达式内
    var curly = 0;
    var square = 0;
    var paren = 0;
    var lastFilterIndex = 0;
    var c, prev, i, expression, filters;

    for (i = 0; i < exp.length; i++) { // 遍历表达式的每个字符, 解析过程中根据不同的情况更新状态
      prev = c;
      c = exp.charCodeAt(i);
      if (inSingle) { // 在单引号内
        if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
      } else if (inDouble) { // 在双引号内
        if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
      } else if (inTemplateString) { // 在模板字符串内
        if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
      } else if (inRegex) { // 在正则表达式内
        if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
      } else if (
        c === 0x7C && // pipe
        exp.charCodeAt(i + 1) !== 0x7C &&
        exp.charCodeAt(i - 1) !== 0x7C &&
        !curly && !square && !paren
      ) {
        if (expression === undefined) {
          // first filter, end of expression
          lastFilterIndex = i + 1;
          expression = exp.slice(0, i).trim();
        } else {
          pushFilter();
        }
      } else {
        switch (c) {
          case 0x22: inDouble = true; break         // "
          case 0x27: inSingle = true; break         // '
          case 0x60: inTemplateString = true; break // `
          case 0x28: paren++; break                 // (
          case 0x29: paren--; break                 // )
          case 0x5B: square++; break                // [
          case 0x5D: square--; break                // ]
          case 0x7B: curly++; break                 // {
          case 0x7D: curly--; break                 // }
        }
        if (c === 0x2f) { // /
          var j = i - 1;
          var p = (void 0);
          // find first non-whitespace prev char
          for (; j >= 0; j--) {
            p = exp.charAt(j);
            if (p !== ' ') { break }
          }
          if (!p || !validDivisionCharRE.test(p)) {
            inRegex = true;
          }
        }
      }
    }

    if (expression === undefined) {
      expression = exp.slice(0, i).trim();
    } else if (lastFilterIndex !== 0) {
      pushFilter();
    }

    function pushFilter () {
      (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
      lastFilterIndex = i + 1;
    }

    if (filters) {
      for (i = 0; i < filters.length; i++) {
        expression = wrapFilter(expression, filters[i]);
      }
    }

    return expression
  }

  /**
   * 将表达式包装在过滤器函数中
   * @param {string} exp - 表达式
   * @param {string} filter - 过滤器
   * @returns {string}
   */
  function wrapFilter (exp, filter) {
    var i = filter.indexOf('('); // 获取过滤器中第一个左括号的索引
    if (i < 0) { // 如果没有左括号
      return ("_f(\"" + filter + "\")(" + exp + ")") // _f: resolveFilter: 解析过滤器
    } else { // 如果存在左括号
      var name = filter.slice(0, i); // 获取过滤器的名称部分
      var args = filter.slice(i + 1); // 获取过滤器的参数部分
      return ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args)) // 生成解析器的调用函数
    }
  }

  function baseWarn (msg, range) { // 输出编译器警告信息到控制台
    console.error(("[Vue compiler]: " + msg));
  }

  /**
   * 从模块数组中提取特定键名对应的函数 (通常在 Vue 的各个模块中, 会定义一系列钩子函数或者其他类型的函数, 这个函数可以帮助快速提取出所需的函数, 方便后续处理)
   * @param {Array} modules - 模块数组 
   * @param {String} key - 要提取的键名
   * @returns {Array}
   */
  function pluckModuleFunction (
    modules,
    key
  ) {
    // map 方法遍历模块数组, 返回键名为 key 的属性值, 形成一个新的数组
    // filter 方法过滤掉数组中的假值, 即 undefined null false 0 等
    return modules
      ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
      : []
  }

  /**
   * 用于向元素添加props属性 (el.props)
   * @param {Object} el - 要添加属性的元素对象
   * @param {String} name - 要添加的属性名
   * @param {String} value - 要添加的属性值
   * @param {Object} range - 属性值所在的字符范围
   * @param {Boolean} dynamic - 属性值是否为动态的
   */
  function addProp (el, name, value, range, dynamic) {
    (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range)); // 添加属性, 同时设置属性的范围
    el.plain = false; // 用于表示元素是否是一个纯文本节点或者静态节点, 而不包含任何动态绑定或事件监听器
  }

  /**
   * 向元素添加属性
   * @param {Object} el - 元素对象
   * @param {String} name - 属性名
   * @param {String} value - 属性值
   * @param {Object} range - 属性的范围
   * @param {Boolean} dynamic - 是否是动态属性
   */
  function addAttr (el, name, value, range, dynamic) {
    var attrs = dynamic
      ? (el.dynamicAttrs || (el.dynamicAttrs = [])) // 动态属性添加到 el.dynamicAttrs
      : (el.attrs || (el.attrs = [])); // 静态属性添加到 el.attrs
    attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range)); // 将属性信息添加到 attrs 数组中, 同时设置属性的范围
    el.plain = false; // 用于表示元素是否是一个纯文本节点或者静态节点, 而不包含任何动态绑定或事件监听器
  }

  /**
   * 向元素添加原始属性 (use this in preTransforms)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {String} name - 属性名
   * @param {String} value - 属性值
   * @param {Object} range - 属性的范围
   */
  function addRawAttr (el, name, value, range) {
    el.attrsMap[name] = value; // 将属性名和值添加到元素对象的 attrsMap 中
    el.attrsList.push(rangeSetItem({ name: name, value: value }, range)); // 将属性名和值添加到元素对象的 attrsList 中, 同时设置属性的范围
  }

  /**
   * 向元素添加指令信息
   * @param {Object} el - 元素对象
   * @param {string} name - 指令名称
   * @param {string} rawName - 原始指令名称
   * @param {string} value - 指令的绑定值
   * @param {string} arg - 指令的参数
   * @param {boolean} isDynamicArg - 是否是动态参数
   * @param {Object} modifiers - 修饰符对象
   * @param {Range} range - 指令的范围
   */
  function addDirective (
    el,
    name,
    rawName,
    value,
    arg,
    isDynamicArg,
    modifiers,
    range
  ) {
    // rangeSetItem: 根据(给定范围/range)设置对象的start和end属性
    (el.directives || (el.directives = [])).push(rangeSetItem({ // 将指令信息添加到元素的directives属性中
      name: name,
      rawName: rawName,
      value: value,
      arg: arg,
      isDynamicArg: isDynamicArg,
      modifiers: modifiers
    }, range));
    el.plain = false; // 用于表示元素是否是一个纯文本节点或者静态节点, 而不包含任何动态绑定或事件监听器
  }

  /**
   * 前置修饰符标记
   * 例: symbol: '~', name: 'eventName'
   * 静态事件名: '~eventName' 
   * 动态事件名: '_p(eventName, "~")'
   * @param {String} symbol - 修饰符标记 (capture: '!', once: '~', passive: '&')
   * @param {String} name - 事件名
   * @param {Boolean} dynamic - 是否是动态事件名
   * @returns {String}
   */
  function prependModifierMarker (symbol, name, dynamic) {
    return dynamic
      ? ("_p(" + name + ",\"" + symbol + "\")") // 处理动态事件名情况
      : symbol + name // 处理静态事件名情况
  }

  /**
   * 将事件处理方法添加到节点对象上
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {String} name - 事件名
   * @param {String} value - 事件处理函数
   * @param {Object} modifiers - 修饰符
   * @param {Boolean} important - 事件处理函数插入顺序
   * @param {Function} warn - 错误警告函数
   * @param {Object} range - 截取(事件绑定)字符时的相关信息 (start: 截取开始位置, end:截取结束位置)
   * @param {Boolean} dynamic - 是否是动态事件名
   */
  function addHandler (
    el,
    name,
    value,
    modifiers,
    important,
    warn,
    range,
    dynamic
  ) {
    modifiers = modifiers || emptyObject; // 修饰符对象 (emptyObject: 不可修改的空对象)
    /**
     * prevent修饰符和passive修饰符不能同时使用, 原因如下:
     * prevent: 阻止事件的默认行为
     * passive: 滚动事件的默认行为(scrolling)将立即发生而非等待onScroll完成, 以防其中包含event.preventDefault
     * 在传统的事件监听模型中, 当事件被触发时, 浏览器会等待事件处理函数执行完毕后再继续执行默认的操作.
     * 而passive事件监听器是一种新的事件处理机制, 它允许开发者在事件处理函数执行之前告诉浏览器不要等
     * 待事件处理函数执行完毕就可以继续执行默认的操作, 这样可以提高页面的响应性能. 因此两种修饰符存在
     * 冲突行为, 不能同时使用
     */
    if (
      warn &&
      modifiers.prevent && modifiers.passive
    ) {
      warn(
        'passive and prevent can\'t be used together. ' +
        'Passive handler can\'t prevent default event.',
        range
      );
    }

    /**
     * 处理事件名处理 (使用点击事件修饰符: right, middle)
     * 尽管Vue提供了这些事件(右键点击和中键点击)的处理能力, 但它们实际上并不一定会在所有浏览器中被触发, 因此需要谨慎处理
     */
    if (modifiers.right) { // 鼠标右键点击
      if (dynamic) { // 处理动态事件名情况
        name = "(" + name + ")==='click'?'contextmenu':(" + name + ")";
      } else if (name === 'click') { // 处理静态事件名情况
        name = 'contextmenu'; // 设置为右键菜单事件
        delete modifiers.right; // 删除此修饰符属性
      }
    } else if (modifiers.middle) { // 鼠标中键点击
      if (dynamic) {
        name = "(" + name + ")==='click'?'mouseup':(" + name + ")";
      } else if (name === 'click') {
        name = 'mouseup'; // 设置为鼠标抬起事件
      }
    }

    /* 处理事件名 (使用修饰符: capture, once, passive)*/
    if (modifiers.capture) { // 带有capture修饰符 (capture: 用于事件捕获)
      delete modifiers.capture; // 删除此修饰符属性
      name = prependModifierMarker('!', name, dynamic); // 前置修饰符标记
    }
    if (modifiers.once) { // 带有once修饰符 (once: 事件只执行一次)
      delete modifiers.once;
      name = prependModifierMarker('~', name, dynamic);
    }
    if (modifiers.passive) { // 带有passive修饰符 (passive: 滚动事件的默认行为(scrolling)将立即发生而非等待onScroll完成, 以防其中包含event.preventDefault)
      delete modifiers.passive;
      name = prependModifierMarker('&', name, dynamic);
    }

    /* 选择事件列表存储对象 */
    var events;
    if (modifiers.native) { // 判断修饰符中是否存在native
      delete modifiers.native; // 删除此修饰符属性
      events = el.nativeEvents || (el.nativeEvents = {}); // 把事件放在nativeEvents对象中
    } else {
      events = el.events || (el.events = {}); // 把事件存放在events对象中
    }

    var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range); // 根据(给定范围/range)设置对象的start和end属性
    if (modifiers !== emptyObject) {
      newHandler.modifiers = modifiers;
    }

    /* 将事件处理函数进行存储 */
    var handlers = events[name];
    if (Array.isArray(handlers)) { // 处理函数为数组, 根据important参数选择添加到数组头部还是尾部
      important ? handlers.unshift(newHandler) : handlers.push(newHandler);
    } else if (handlers) { // 不是数组, 存在处理函数, 则处理为数组形式
      events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
    } else { // 不是数组, 不存在处理函数, 将处理函数进行存储
      events[name] = newHandler;
    }

    el.plain = false; // 用于表示元素是否是一个纯文本节点或者静态节点, 而不包含任何动态绑定或事件监听器
  }

  /**
   * 获取元素的原始绑定属性值
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {String} name - 属性名
   * @returns {String}
   */
  function getRawBindingAttr (
    el,
    name
  ) {
    return el.rawAttrsMap[':' + name] || // 属性为动态绑定 (语法糖)
      el.rawAttrsMap['v-bind:' + name] || // 属性为动态绑定
      el.rawAttrsMap[name] // 属性为静态绑定
  }

  /**
   * 获取动态绑定属性值并删除属性
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {String} name - 属性名
   * @param {Boolean} getStatic - 动态属性不存在时是否允许获取静态属性 (仅getStatic为false时不允许)
   * @returns {String}
   */
  function getBindingAttr (
    el,
    name,
    getStatic
  ) {
    var dynamicValue =
      getAndRemoveAttr(el, ':' + name) || // 获取':xx'属性并删除属性
      getAndRemoveAttr(el, 'v-bind:' + name); // 获取'v-bind:xx'属性并删除属性
    if (dynamicValue != null) {
      return parseFilters(dynamicValue) // 解析模板表达式中的过滤器/filters (例: "age | toNumber" => "_f("toNumber")(age)")
    } else if (getStatic !== false) { // 动态属性不存在允许获取静态属性
      var staticValue = getAndRemoveAttr(el, name); // 获取'xx'属性并删除属性
      if (staticValue != null) {
        return JSON.stringify(staticValue) // 返回属性值
      }
    }
  }

  /**
   * 获取属性后从(数组/attrsList)中删除属性
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {String} name - 属性名
   * @param {Boolean} removeFromMap -  是否同时移除(映射/attrsMap)中的属性
   * @returns {String}
   */
  function getAndRemoveAttr (
    el,
    name,
    removeFromMap
  ) {
    var val;
    if ((val = el.attrsMap[name]) != null) { // 获取属性值
      var list = el.attrsList;
      for (var i = 0, l = list.length; i < l; i++) {
        if (list[i].name === name) {
          list.splice(i, 1); // 删除(数组/attrsList)属性 (就不会被processAttrs处理)
          break
        }
      }
    }
    if (removeFromMap) { // 删除(映射/attrsMap)中的属性 (不删除是因为在codegen期间需要该映射)
      delete el.attrsMap[name];
    }
    return val // 返回属性值
  }

  /**
   * 通过正则匹配删除 属性数组/attrsList 中的属性
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   * @param {RegExp} name - 用于匹配属性
   * @returns {Object}
   */
  function getAndRemoveAttrByRegex (
    el,
    name
  ) {
    var list = el.attrsList; // 属性信息列表 (Array)
    for (var i = 0, l = list.length; i < l; i++) {
      var attr = list[i];
      if (name.test(attr.name)) { // 通过正则匹配属性名
        list.splice(i, 1); // 在属性信息列表中删除
        return attr
      }
    }
  }

  /**
   * 根据(给定范围/range)更新(范围设置对象/item)的start和end属性
   * @param {Object} item - 范围设置对象
   * @param {Object} range - 给定的范围对象
   * @returns {Object}
   */
  function rangeSetItem (
    item,
    range
  ) {
    if (range) {
      if (range.start != null) { // 设置star属性
        item.start = range.start;
      }
      if (range.end != null) { // 设置end属性
        item.end = range.end;
      }
    }
    return item
  }

  /**
   * 生成组件的 v-model 相关代码
   * @param {Object} el -  - AST 节点对象 (包含有关节点的信息) 
   * @param {string} value - v-model 的值
   * @param {Object} modifiers - 修饰符对象
   */
  function genComponentModel (
    el,
    value,
    modifiers
  ) {
    var ref = modifiers || {}; // 修饰符
    var number = ref.number;
    var trim = ref.trim;

    var baseValueExpression = '$$v'; // 创建形参处理 v-model 绑定的值
    var valueExpression = baseValueExpression;
    if (trim) { // 如果有.trim修饰符, 则清除两端空格
      valueExpression =
        "(typeof " + baseValueExpression + " === 'string'" +
        "? " + baseValueExpression + ".trim()" +
        ": " + baseValueExpression + ")";
    }
    if (number) { // 如果有.number修饰符, 则对值进行数字转换
      valueExpression = "_n(" + valueExpression + ")"; // _n: toNumber: 将值转化为数字
    }
    var assignment = genAssignmentCode(value, valueExpression); // 生成 v-model 的值的赋值代码

    el.model = { // 将 v-model 相关信息添加到元素对象的 model 属性中
      value: ("(" + value + ")"),
      expression: JSON.stringify(value),
      callback: ("function (" + baseValueExpression + ") {" + assignment + "}") // 创建回调函数, 用于执行赋值操作
    };
  }

  /**
   * 生成 v-model 的值的赋值代码
   * @param {string} value - v-model 绑定的属性值 (例: test.name)
   * @param {string} assignment - 要分配给 v-model 的表达式 (例: "$event.target.value")
   * @returns {string}
   */
  function genAssignmentCode (
    value,
    assignment
  ) {
    var res = parseModel(value); // 解析 v-model 绑定的属性值 (例: {exp: 'test', key: 'name'})
    if (res.key === null) { // 如果属性键为 null, 则表示 v-model 的值是一个简单的基本路径表达式 (例: v-model="test")
      return (value + "=" + assignment)  // 返回一个简单的赋值语句 (例: "value = $event.target.value")
    } else { // 属性键值不为null, 则表示 v-model 的值包含属性键 (例: v-model="test.name")
      // 返回一个调用 $set 方法的赋值语句, 用于确保 Vue 对象的响应性 (例: "$set(test, 'name', $event.target.value")
      return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
    }
  }

  var len, str, chr, index$1, expressionPos, expressionEndPos;
  /**
   * 解析 v-model 绑定的属性值 (提取基本路径表达式和属性键, 处理点路径和可能的方括号)
   * 可能出现的情况:
   *
   * - test
   * - test[key]
   * - test[test1[key]]
   * - test["a"][key]
   * - xxx.test[a[a].test1[key]]
   * - test.xxx.a["asa"][test1[key]]
   * 
   * @param {String} val - v-model 绑定的属性值
   * @returns {Object}
   */
  function parseModel (val) {
    val = val.trim(); // 去除两端的空格
    len = val.length;

    if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) { // 如果字符串中不包含 '[' 或 ']' (例: test.xxx.key)
      index$1 = val.lastIndexOf('.');
      if (index$1 > -1) { // 如果存在点, 则基本路径表达式是点之前的部分, 属性键是点之后的部分
        return {
          exp: val.slice(0, index$1), // 基本路径表达式
          key: '"' + val.slice(index$1 + 1) + '"' // 属性键
        }
      } else {
        return {
          exp: val, // 基本路径表达式
          key: null // 属性键
        }
      }
    }

    // 如果字符串中包含 '[' 和 ']'
    str = val;
    index$1 = expressionPos = expressionEndPos = 0; // 初始化位置为 0

    while (!eof()) { // 遍历字符串, 解析属性键的起始位置和结束位置
      chr = next(); // 获取下一个字符的 Unicode 编码
      if (isStringStart(chr)) { // 如果是字符串的起始字符, 则解析字符串
        parseString(chr); // 跳过字符串中的内容直到遇到字符串结束的引号
      } else if (chr === 0x5B) { // 如果是左方括号, 则解析方括号内的内容
        parseBracket(chr); // 跳过字符串中包含的方括号中的内容
      }
    }

    return {
      exp: val.slice(0, expressionPos), // 基础路径表达式部分
      key: val.slice(expressionPos + 1, expressionEndPos) // 属性键
    }
  }

  function next () { // 用于获取字符串`str`中下一个字符的 Unicode 编码
    return str.charCodeAt(++index$1)
  }

  function eof () { // 用于检查是否已经到达字符串的末尾
    return index$1 >= len
  }

  function isStringStart (chr) { // 用于检查给定的 Unicode 编码是否表示字符串的起始字符
    return chr === 0x22 || chr === 0x27 // 是双引号(0x22)或单引号(0x27), 则表示是字符串的起始字符
  }

  function parseBracket (chr) { // 用于跳过字符串中包含的方括号中的内容
    var inBracket = 1; // 记录当前所在的方括号层级，初始值为 1，表示已经进入了第一个方括号
    expressionPos = index$1; // 记录方括号内的表达式的起始位置
    while (!eof()) { // 循环直到字符串末尾
      chr = next(); // 获取下一个字符的 Unicode 编码
      if (isStringStart(chr)) { // 如果是字符串的起始字符, 则解析字符串
        parseString(chr); // 跳过字符串中的内容直到遇到字符串结束的引号
        continue
      }
      if (chr === 0x5B) { inBracket++; } // 如果是左方括号，则方括号层级加一
      if (chr === 0x5D) { inBracket--; } // 如果是右方括号，则方括号层级减一
      if (inBracket === 0) { // 如果方括号层级变为 0，表示当前方括号结束
        expressionEndPos = index$1; // 记录方括号内的表达式的结束位置
        break
      }
    }
  }

  function parseString (chr) { // 用于跳过字符串中的内容直到遇到字符串结束的引号
    var stringQuote = chr; // 记录字符串的起始字符 (即左引号或右引号)
    while (!eof()) { // 循环直到字符串末尾
      chr = next(); // 获取下一个字符的 Unicode 编码
      if (chr === stringQuote) { // 如果是相同的引号, 则表示字符串结束, 循环结束
        break
      }
    }
  }

  var warn$1;
  var RANGE_TOKEN = '__r'; // 在某些情况下, 事件的使用必须在运行时确定, 因此在编译期间使用了一些预留的令牌
  var CHECKBOX_RADIO_TOKEN = '__c';
  /**
   * 处理元素的 v-model 指令
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} dir - 指令对象 (包含有关指令的信息)
   * @param {Function} _warn - 警告函数
   * @returns {Boolean}
   */
  function model (
    el,
    dir,
    _warn
  ) {
    warn$1 = _warn; // 警告函数
    var value = dir.value; // v-model绑定的值
    var modifiers = dir.modifiers; // 修饰符
    var tag = el.tag; // 标签名
    var type = el.attrsMap.type; // 标签的type属性

    {
      if (tag === 'input' && type === 'file') { // `<input type="file">`是只读的, 设置输入值将引发错误
        warn$1(
          "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
          "File inputs are read only. Use a v-on:change listener instead.",
          el.rawAttrsMap['v-model']
        );
      }
    }

    if (el.component) { // 如果当前元素是组件, 则生成组件的 v-model 相关代码
      genComponentModel(el, value, modifiers);
      return false // 组件的 v-model 不需要额外的运行时指令
    } else if (tag === 'select') { // 如果当前元素是 select 标签, 则生成 <select> 元素的 v-model 相关代码
      genSelect(el, value, modifiers);
    } else if (tag === 'input' && type === 'checkbox') {// 如果当前元素是 checkbox, 则生成 <input type="checkbox"> 元素的 v-model 相关代码
      genCheckboxModel(el, value, modifiers);
    } else if (tag === 'input' && type === 'radio') { // 如果当前元素是 radio, 则生成 <input type="radio"> 元素的 v-model 相关代码
      genRadioModel(el, value, modifiers);
    } else if (tag === 'input' || tag === 'textarea') { // 如果当前元素是 input 或 textarea, 则生成默认元素的 v-model 相关代码
      genDefaultModel(el, value, modifiers);
    } else if (!config.isReservedTag(tag)) { // 如果当前元素不是保留标签, 则生成组件的 v-model 相关代码
      genComponentModel(el, value, modifiers);
      return false
    } else { // 其他情况报警告
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "v-model is not supported on this element type. " +
        'If you are working with contenteditable, it\'s recommended to ' +
        'wrap a library dedicated for that purpose inside a custom component.',
        el.rawAttrsMap['v-model']
      );
    }

    return true // 确保运行时指令元数据
  }

  /**
   * 生成 <input type="checkbox"> 元素的 v-model 相关代码
   * @param {Object} el -  - AST 节点对象 (包含有关节点的信息) 
   * @param {string} value - v-model 的值
   * @param {Object} modifiers - 修饰符对象
   */
  function genCheckboxModel (
    el,
    value,
    modifiers
  ) {
    var number = modifiers && modifiers.number; // 检查是否存在 number 修饰符
    var valueBinding = getBindingAttr(el, 'value') || 'null'; // 获取值的绑定属性 (例: :value="xxx")
    var trueValueBinding = getBindingAttr(el, 'true-value') || 'true'; // 获取 true-value 属性的值, 不存在则默认为 true
    var falseValueBinding = getBindingAttr(el, 'false-value') || 'false'; // 获取 false-value 属性的值, 不存在则默认为 false
    addProp(el, 'checked', // 生成获取 checked 属性的值的代码
      "Array.isArray(" + value + ")" +
      "?_i(" + value + "," + valueBinding + ")>-1" + (
        trueValueBinding === 'true'
          ? (":(" + value + ")")
          : (":_q(" + value + "," + trueValueBinding + ")") //  _q: looseEqual: 简单比较两个值是否相等
      )
    );
    addHandler(el, 'change', // 添加 change 事件处理函数的代码, 用于更新 v-model 的值
      "var $$a=" + value + "," +
          '$$el=$event.target,' +
          "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
      'if(Array.isArray($$a)){' +
        "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," + // _n: toNumber: 将值转化为数字
            '$$i=_i($$a,$$v);' +
        "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" + // genAssignmentCode: 生成 v-model 的值的赋值代码
        "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
      "}else{" + (genAssignmentCode(value, '$$c')) + "}",
      null, true
    );
  }

  /**
   * 生成 <input type="radio"> 元素的 v-model 相关代码
   * @param {Object} el -  - AST 节点对象 (包含有关节点的信息) 
   * @param {string} value - v-model 的值
   * @param {Object} modifiers - 修饰符对象
   */
  function genRadioModel (
    el,
    value,
    modifiers
  ) {
    var number = modifiers && modifiers.number; // 检查是否存在 number 修饰符
    var valueBinding = getBindingAttr(el, 'value') || 'null'; // 获取值的绑定属性 (例: :value="xxx")
    valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding; // 如果存在.number修饰符, 对值绑定进行数字转换 (_n: toNumber: 将值转化为数字)
    addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")")); // 将 checked 属性添加到元素上, 使用 _q 函数来判断是否选中 (_q: looseEqual: 简单比较两个值是否相等)
    addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true); // 将 change 事件处理程序添加到元素上, 当选中状态发生变化时执行生成的赋值代码 (genAssignmentCode: 生成 v-model 的值的赋值代码)
  }

  /**
   * 生成 <select> 元素的 v-model 相关代码
   * @param {Object} el -  - AST 节点对象 (包含有关节点的信息) 
   * @param {string} value - v-model 的值
   * @param {Object} modifiers - 修饰符对象
   */
  function genSelect (
    el,
    value,
    modifiers
  ) {
    var number = modifiers && modifiers.number; // 检查是否存在 number 修饰符
    var selectedVal = "Array.prototype.filter" + // 生成获取选中值的代码
      ".call($event.target.options,function(o){return o.selected})" +
      ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
      "return " + (number ? '_n(val)' : 'val') + "})"; // _n: toNumber: 将值转化为数字

    var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]'; // 生成赋值语句
    var code = "var $$selectedVal = " + selectedVal + ";";
    code = code + " " + (genAssignmentCode(value, assignment)); // genAssignmentCode: 生成 v-model 的值的赋值代码 (例: "value = $event.target.value")
    addHandler(el, 'change', code, null, true); // 将事件处理程序添加到元素上, 当 <select> 元素的值发生变化时, 执行生成的代码
  }

  /**
   * 生成默认元素的 v-model 相关代码 (input/textarea)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   * @param {string} value - 指令的值
   * @param {Object} modifiers - 修饰符对象
   */
  function genDefaultModel (
    el,
    value,
    modifiers
  ) {
    var type = el.attrsMap.type; // 获取元素类型 (text, number等)

    { // 检查是否存在与 v-model 同时使用的 v-bind:value 属性, 控制台警告
      var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
      var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
      if (value$1 && !typeBinding) {
        var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
        warn$1(
          binding + "=\"" + value$1 + "\" conflicts with v-model on the same element " +
          'because the latter already expands to a value binding internally',
          el.rawAttrsMap[binding]
        );
      }
    }

    // 解构修饰符对象
    var ref = modifiers || {};
    var lazy = ref.lazy; // 懒加载v-model的数据同步 (input => change)
    var number = ref.number; // 将输入转换为数字
    var trim = ref.trim; // 去除首尾空白
    var needCompositionGuard = !lazy && type !== 'range'; // 是否需要组合事件的保护
    var event = lazy // 根据.lazy修饰符来确定事件类型
      ? 'change'
      : type === 'range'
        ? RANGE_TOKEN
        : 'input';

    var valueExpression = '$event.target.value';
    if (trim) {  // 如果存在.trim修饰符, 则在表达式中去除首尾空白
      valueExpression = "$event.target.value.trim()";
    }
    if (number) { // 如果存在.number修饰符, 则将表达式转换为数字
      valueExpression = "_n(" + valueExpression + ")"; // _n: toNumber: 将值转化为数字
    }

    var code = genAssignmentCode(value, valueExpression); // 生成 v-model 的值的赋值代码 (例: "value = $event.target.value")
    if (needCompositionGuard) {
      code = "if($event.target.composing)return;" + code;
    }

    addProp(el, 'value', ("(" + value + ")")); // 给元素添加 value 属性
    addHandler(el, event, code, null, true); // 给元素添加事件处理函数
    if (trim || number) { // 如果存在 trim 或 number 修饰符, 则在 blur 事件时强制更新组件
      addHandler(el, 'blur', '$forceUpdate()');
    }
  }

  /**
   * 规范化事件监听器
   * @param {Object} on 
   */
  function normalizeEvents (on) {
    if (isDef(on[RANGE_TOKEN])) { // 当前事件对象中包含`<input type="range">`元素的事件监听器
      var event = isIE ? 'change' : 'input'; // 事件兼容IE (IE中输入框`[type=range]`仅支持`change`事件)
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []); // 将事件合并到合并到`change/input`事件下
      delete on[RANGE_TOKEN]; // 删除原有的RANGE_TOKEN属性
    }
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) { // 当前事件对象中包含了`<input type="checkbox">`和`<input type="radio">`元素的事件监听器
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []); // 将事件合并到合并到`change`事件下
      delete on[CHECKBOX_RADIO_TOKEN]; // 删除原有的CHECKBOX_RADIO_TOKEN属性
    }
  }

  var target$1; // 当前目标元素
  /**
   * 用于创建一个一次性事件函数调用器
   * @param {String} event - 事件名
   * @param {Function} handler - 要执行的事件处理函数
   * @param {Boolean} capture - 表示是否使用捕获模式
   * @returns {Function}
   */
  function createOnceHandler$1 (event, handler, capture) {
    var _target = target$1; // 当前目标元素
    return function onceHandler () {
      var res = handler.apply(null, arguments); // 执行事件处理函数
      if (res !== null) { // 返回值不为null, 则为元素移除事件监听器
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  /**
   * 用于判断是否使用微任务修复
   * isUsingMicroTask: 表示当前环境是否使用了微任务
   * isFF: 检测当前浏览器是否为 Firefox (并检查 Firefox 浏览器的版本号是否小于等于 53)
   */
  var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

  /**
   * 用于向指定元素添加事件监听 TODO
   * @param {String} name - 事件名
   * @param {Function} handler - 要添加的事件处理函数 
   * @param {Boolean} capture - 表示是否使用捕获模式
   * @param {Boolean} passive - 表示listener永远不会调用preventDefault
   */
  function add$1 (
    name,
    handler,
    capture,
    passive
  ) {
    /**
     * 具体情况: 当内部的点击事件触发Vue的`patch`过程, 而在`patch`过程中又向外部元素附加了事件处理函数, 结果再次触发了事件, 是因为浏览器在事件传播过程中会触发微任务
     * 解决方案: 在事件处理函数附加时保存一个时间戳, 只有当事件触发的时间晚于事件处理函数附加的时间时, 才会触发事件处理函数
     */
    if (useMicrotaskFix) { // 是否需要使用微任务修复
      var attachedTimestamp = currentFlushTimestamp; // 获取当前的刷新时间戳
      var original = handler;
      handler = original._wrapper = function (e) { // 重新定义事件处理函数
        if (
          e.target === e.currentTarget || // 检查事件的目标元素是否和事件的当前目标元素相同
          e.timeStamp >= attachedTimestamp || // 检查事件触发的时间是否晚于事件处理函数添加的时间
          /**
           * 1. iOS 9: `event.timeStamp`在`history.pushState`后为0
           * 2. `QtWebEngine`事件, 时间戳为负值
           */
          e.timeStamp <= 0 || // 时间戳是否合理
          e.target.ownerDocument !== document // 检查事件的目标元素是否属于当前文档 (事件可能会在多页`electron/nw.js`应用程序中的另一个文档中触发)
        ) {
          return original.apply(this, arguments) // 调用原始的事件处理函数
        }
      };
    }
    target$1.addEventListener( // 添加事件监听器
      name,
      handler,
      supportsPassive // 当前环境是否支持passive选项
        ? { capture: capture, passive: passive }
        : capture
    );
  }

  /**
   * 用于移除由addEventListener方法添加的事件监听
   * @param {String} name - 事件名
   * @param {Function} handler - 要移除的事件处理函数 
   * @param {Boolean} capture - 表示是否使用捕获模式
   * @param {HTMLElement} _target - 事件目标元素
   */
  function remove$2 (
    name,
    handler,
    capture,
    _target
  ) {
    (_target || target$1).removeEventListener( // 获取事件目标元素并移除事件监听器
      name,
      handler._wrapper || handler,
      capture
    );
  }

  /**
   * 更新DOM事件监听器
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {VNode} vnode - 新的虚拟节点
   */
  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) { // 新旧虚拟节点的监听器数据都未定义则退出
      return
    }
    var on = vnode.data.on || {}; // 新节点的监听器数据
    var oldOn = oldVnode.data.on || {}; // 旧节点的监听器数据
    target$1 = vnode.elm; // 设置当前目标元素为新节点对应的真实DOM
    normalizeEvents(on); // 规范化事件监听器
    updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context); // 更新事件监听器
    target$1 = undefined; // 清空当前目标元素
  }

  var events = { // 事件的生命周期处理函数
    create: updateDOMListeners, // 更新DOM事件监听器
    update: updateDOMListeners
  };

  var svgContainer; // 存储svg的临时容器
  /**
   * 更新元素的属性
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {VNode} vnode - 新的虚拟节点
   */
  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) { // 新旧虚拟节点的属性数据都未定义则退出
      return
    }
    var key, cur;
    var elm = vnode.elm; // 新节点对应的真实DOM元素
    var oldProps = oldVnode.data.domProps || {}; // 旧节点的属性
    var props = vnode.data.domProps || {}; // 新节点的属性

    // 如果新节点的属性数据对象具有响应性(即 __ob__ 存在), 则进行克隆确保后续操作不会影响到原始数据对象
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend({}, props);
    }

    for (key in oldProps) { // 遍历旧节点的属性数据对象, 如果某个属性在新节点的属性数据中不存在, 则将该属性置空
      if (!(key in props)) {
        elm[key] = ''; // 置空
      }
    }

    for (key in props) {
      cur = props[key]; // 新属性值
      if (key === 'textContent' || key === 'innerHTML') { // 属性为textContent或innerHTML
        if (vnode.children) { vnode.children.length = 0; } // 节点具有子节点, 则清空子节点
        if (cur === oldProps[key]) { continue } // 新旧属性值相等, 则继续处理下一个属性
      
        // 处理Chrome <= 55的bug, 单个文本节点由innerHTML/textContent替换后, 该文本节点的parentNode属性并没有正确地被移除
        if (elm.childNodes.length === 1) { // 移除文本节点
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value' && elm.tagName !== 'PROGRESS') { // 属性为value且当前节点不是progress标签
        elm._value = cur; // 将值存储起来, 因为非字符串值将被字符串化
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) { // 判断是否需要更新输入框的值 (值相同时避免重置光标位置)
          elm.value = strCur; // 更新输入框的值
        }
      } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) { // 属性为innerHTML, 且当前节点是SVG标签, 并且不支持innerHTML (IE)
        svgContainer = svgContainer || document.createElement('div'); // 创建一个div容器
        svgContainer.innerHTML = "<svg>" + cur + "</svg>"; // 在该容器中解析svg字符串
        var svg = svgContainer.firstChild; // 将解析后的svg子节点插入到当前节点中
        while (elm.firstChild) { // 清空元素子节点
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) { // 将svg元素的所有子节点追加到元素中
          elm.appendChild(svg.firstChild);
        }
      } else if (cur !== oldProps[key]) { // 新旧属性值不同
        try {
          elm[key] = cur; // 直接设置属性值
        } catch (e) {}
      }
    }
  }

  /**
   * 用于判断是否应该更新输入框的值
   * @param {HTMLElement} elm -   - 输入框元素
   * @param {String} checkVal - 需要检查的值
   * @returns {Boolean}
   */
  function shouldUpdateValue (elm, checkVal) {
    return (!elm.composing && ( // 当前元素不在正在进行输入的状态或
      elm.tagName === 'OPTION' || // 当前元素是option标签或
      isNotInFocusAndDirty(elm, checkVal) || // 当前元素失去焦点并且值发生了改变或
      isDirtyWithModifiers(elm, checkVal) // 当前元素的值在特定修饰符的影响下发生了改变
    ))
  }

  /**
   * 用于判断当前输入框是否失去焦点且值发生了改变
   * @param {HTMLElement} elm - 输入框元素
   * @param {String} checkVal - 需要检查的值
   * @returns {Boolean}
   */
  function isNotInFocusAndDirty (elm, checkVal) {
    var notInFocus = true; // 文本框是否聚焦
    try { notInFocus = document.activeElement !== elm; } catch (e) {} // 文档当前获得焦点的元素是否是当前输入框 (即输入框是否处于焦点状态)
    return notInFocus && elm.value !== checkVal // 输入框失去焦点且值不等于更新后的值时返回true
  }

  /**
   * 用于检查当前输入框在使用了特定修饰符后是否发生了值的改变
   * @param {HTMLElement} elm 
   * @param {String} newVal 
   * @returns {Boolean}
   */
  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value; // 当前输入框的值
    var modifiers = elm._vModifiers; // 修饰符 (通过v-model运行时注入, 用于跟踪v-model中的修饰符)
    if (isDef(modifiers)) {
      if (modifiers.number) { // 将值转换为数字比较是否相等
        return toNumber(value) !== toNumber(newVal)
      }
      if (modifiers.trim) { // 将值去除空格比较是否相等
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal // 如果没有修饰符，则直接比较原始值和新值是否相等
  }

  var domProps = { // DOM属性的生命周期处理函数
    create: updateDOMProps, // 更新元素的属性
    update: updateDOMProps
  };

  /**
   * 解析 CSS 文本并将其转换为对象格式
   * @param {String} cssText - CSS文本 
   * @returns {Object}
   */
  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g; // 用于匹配分号, 但排除括号内的分号 (用于将CSS文本分割成多个样式属性字符串)
    var propertyDelimiter = /:(.+)/; // 匹配冒号后面的内容 (用于将样式属性字符串分割成属性名和属性值)
    cssText.split(listDelimiter).forEach(function (item) { // 将CSS文本分割成多个样式字符串, 然后遍历处理为对象格式
      if (item) {
        var tmp = item.split(propertyDelimiter); // 将样式属性字符串分割成属性名和属性值
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim()); // 将属性保存到对象中
      }
    });
    return res
  });

  /**
   * 合并虚拟节点的静态样式和动态样式
   * @param {Object} data - AST 节点对象 (包含有关节点的信息)
   * @returns {Object}
   */
  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style); // 规范化样式绑定 (将不同形式的样式数据统一为对象格式)
    return data.staticStyle
      ? extend(data.staticStyle, style) // 将样式合并后返回
      : style
  }

  /**
   * 规范化样式绑定 (将不同形式的样式数据统一为对象格式)
   * @param {Object} bindingStyle 
   * @returns {String}
   */
  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) { // 将存放样式的对象数组合并为一个对象
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') { // 解析CSS文本并将其转换为对象格式
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * 获取节点完整样式 (父组件样式应该在子组件样式之后, 以便父组件样式可以覆盖它) TODO
   * @param {VNode} vnode - 虚拟节点, 表示获取样式的节点
   * @param {Boolean} checkChild - 是否检查子组件样式
   * @returns {Object}
   */
  function getStyle (vnode, checkChild) {
    var res = {}; // 保存最终样式的变量
    var styleData;

    if (checkChild) { // 检查子组件样式
      var childNode = vnode;
      while (childNode.componentInstance) { // 不断向下寻找组件实例合并样式 (组件的根节点依旧为一个组件)
        childNode = childNode.componentInstance._vnode; // 组件实例的虚拟节点
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data)) // normalizeStyleData: 合并虚拟节点的静态样式和动态样式
        ) { // 将子组件绑定的样式合并到res对象中
          extend(res, styleData); // extend: 将源对象中的属性合并到目标对象
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) { // 将节点本身的样式合并到res对象中
      extend(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) { // 不断向上寻找父节点合并样式 (节点的父组件是组件)
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) { // 将父组件传递的样式合并到res对象中
        extend(res, styleData);
      }
    }
    return res
  }

  var cssVarRE = /^--/; // 用于检测CSS属性名, 是否是以"--"开头的CSS变量
  var importantRE = /\s*!important$/; // 用于检测CSS属性值, 是否是以"!important"结尾的, 表示CSS中的重要性声明
  /**
   * 设置元素的属性值
   * @param {HTMLElement} el - 设置属性的元素
   * @param {String} name - 属性名
   * @param {String|Array} val - 属性值
   */
  var setProp = function (el, name, val) {
    if (cssVarRE.test(name)) { // 检查属性名否匹配CSS变量的命名规则
      el.style.setProperty(name, val); // 设置属性值
    } else if (importantRE.test(val)) { // 检查属性值是否是以"!important"结尾
      el.style.setProperty(hyphenate(name)/** 驼峰转横线 */, val.replace(importantRE, ''), 'important'); // 设置属性值, 并加上"!important"
    } else {
      var normalizedName = normalize(name); // 规范化CSS属性名, 以适应不同浏览器的前缀
      if (Array.isArray(val)) { // 当属性值为数组
        for (var i = 0, len = val.length; i < len; i++) { // 遍历设置属性值
          el.style[normalizedName] = val[i]; // 设置属性值
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  /**
   * 常见的浏览器厂商前缀
   * Webkit：WebKit 内核的浏览器 (Chrome, Safari)
   * Moz：Mozilla 内核的浏览器 (Firefox)
   * ms：Microsoft 内核的浏览器 (Internet Explorer, Edge)
   */
  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle; // 提供完整的样式对象 (用于检测当前浏览器环境是否支持特定的CSS属性)
  /**
   * 规范化CSS属性名, 以适应不同浏览器的前缀
   * @param {String} prop - 属性名
   * @returns {String}
   */
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style; // 提供完整的样式对象 (用于检测当前浏览器环境是否支持特定的CSS属性)
    prop = camelize(prop); // 将横线命名的字符串转换为驼峰命名
    if (prop !== 'filter' && (prop in emptyStyle)) { // 检查浏览器是否支持当前CSS属性 (排除filter属性的特殊情况)
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1); // 将属性名首字符大写
    for (var i = 0; i < vendorNames.length; i++) { // 遍历给属性添加浏览器前缀, 检查浏览器是否支持
      var name = vendorNames[i] + capName; // 给属性添加浏览器前缀 ("transform" => "WebkitTransform")
      if (name in emptyStyle) { // 检查浏览器是否支持当前CSS属性
        return name
      }
    }
  });

  /**
   * 更新元素的样式
   * @param {VNode} oldVnode - 旧的虚拟节点
   * @param {VNode} vnode - 新的虚拟节点
   */
  function updateStyle (oldVnode, vnode) {
    var data = vnode.data; // 新节点的数据
    var oldData = oldVnode.data; // 旧节点的数据

    if (isUndef(data.staticStyle) && isUndef(data.style) && // 新旧虚拟节点均无静态样式和动态样式则退出  
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm; // 新节点对应的真实DOM元素
    var oldStaticStyle = oldData.staticStyle; // 旧节点的静态样式
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {}; // 旧节点的动态样式

    // 如果静态样式存在, 则在执行normalizeStyleData时stylebinding已经合并到其中
    var oldStyle = oldStaticStyle || oldStyleBinding; // 旧节点的完整样式

    var style = normalizeStyleBinding(vnode.data.style) || {}; // 规范化样式绑定 (将不同形式的样式数据统一为对象格式)

    // 如果样式是响应式的((即 __ob__ 存在)), 则克隆一份样式对象存储起来, 以确保后续可以修改
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend({}, style)
      : style;

    var newStyle = getStyle(vnode, true); // 获取节点完整样式

    for (name in oldStyle) { // 遍历旧样式对象中的每个属性, 如果在新样式中不存在这个属性, 则将该样式属性置空
      if (isUndef(newStyle[name])) { // 元素的属性值置空
        setProp(el, name, '');
      }
    }
    for (name in newStyle) { // 遍历新样式对象中的每个属性, 如果旧样式中对应的属性值与新样式中不同, 则将新样式应用到真实DOM元素上
      cur = newStyle[name];
      if (cur !== oldStyle[name]) { // 设置元素的属性值
        setProp(el, name, cur == null ? '' : cur); // IE9设置为null没有效果, 必须使用空字符串
      }
    }
  }

  var style = { // 样式的生命周期处理函数
    create: updateStyle, // 更新元素的样式
    update: updateStyle
  };

  var whitespaceRE = /\s+/; // 匹配空白字符

  /**
   * DOM元素添加类名 (兼容在IE中给SVG元素添加类名)
   * @param {HTMLElement} el - 添加类名的DOM元素
   * @param {String} cls - 要添加的类名
   */
  function addClass (el, cls) {
    if (!cls || !(cls = cls.trim())) { // 确保添加的类名有效
      return
    }

    if (el.classList) { // 通过classList属性将新的类名添加到元素上
      if (cls.indexOf(' ') > -1) { // 添加多个类名
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); }); // 遍历依次将类名添加到元素上
      } else {
        el.classList.add(cls); // 将类名添加到元素上
      }
    } else { // 通过setAttribute方法将新的类名添加到元素上
      var cur = " " + (el.getAttribute('class') || '') + " "; // 获取元素当前类名
      if (cur.indexOf(' ' + cls + ' ') < 0) { // 检查要添加的类名是否存在于元素当前类名中
        el.setAttribute('class', (cur + cls).trim()); // 将类名拼接后添加到元素上
      }
    }
  }

  /**
   * DOM元素移除类名 (兼容在IE中给SVG元素移除类名)
   * @param {HTMLElement} el - 移除类名的DOM元素
   * @param {String} cls - 要移除的类名
   */
  function removeClass (el, cls) {
    if (!cls || !(cls = cls.trim())) { // 确保添加的类名有效
      return
    }

    if (el.classList) { // 通过classList属性将元素类名移除
      if (cls.indexOf(' ') > -1) { // 移除多个类名
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); }); // 遍历依次将元素类名移除
      } else {
        el.classList.remove(cls); // 将元素类名移除
      }
      if (!el.classList.length) { // 如果移除后元素不再具有任何类名, 则移除元素的class属性
        el.removeAttribute('class');
      }
    } else { // 通过setAttribute方法将处理后的类名添加到元素上
      var cur = " " + (el.getAttribute('class') || '') + " "; // 获取元素当前类名
      var tar = ' ' + cls + ' '; // 需要移除的类名
      while (cur.indexOf(tar) >= 0) { // 从当前类名字符串中移除要删除的类名
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) { // 将处理后的类名添加到元素上
        el.setAttribute('class', cur);
      } else { // 如果移除后元素不再具有任何类名, 则移除元素的class属性
        el.removeAttribute('class');
      }
    }
  }

  /**
   * 将过渡定义解析为过渡对象
   * @param {Object|String} def$$1 - 过渡定义 (可以是对象或字符串)
   * @returns {Object}
   */
  function resolveTransition (def$$1) {
    if (!def$$1) { // 如果过渡定义未定义, 则直接返回
      return
    }

    if (typeof def$$1 === 'object') { // 如果过渡定义是对象
      var res = {};
      if (def$$1.css !== false) { // 如果定义中的 CSS属性不为 false, 则生成自动的 CSS过渡对象
        extend(res, autoCssTransition(def$$1.name || 'v'));
      }
      extend(res, def$$1); // 将定义中的属性合并到结果对象中
      return res
    } else if (typeof def$$1 === 'string') { // 如果是字符串, 则生成自动的 CSS过渡对象
      return autoCssTransition(def$$1)
    }
  }

  /**
   * Transition 组件过渡类名对象
   * @param {String} name - 过渡名称 (通常是与过渡效果相关的名字)
   * @returns {Object}
   */
  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"), // 进入过渡的类名
      enterToClass: (name + "-enter-to"), // 进入结束后的类名
      enterActiveClass: (name + "-enter-active"), // 进入过渡的活动类名
      leaveClass: (name + "-leave"), // 离开过渡的类名
      leaveToClass: (name + "-leave-to"), // 离开结束后的类名
      leaveActiveClass: (name + "-leave-active") // 离开过渡的活动类名
    }
  });

  var hasTransition = inBrowser && !isIE9; // 判断是否在浏览器环境中, 并且不是 IE9
  var TRANSITION = 'transition'; // 定义过渡和动画的常量
  var ANIMATION = 'animation';

  var transitionProp = 'transition'; // 过渡属性
  var transitionEndEvent = 'transitionend'; // 过渡结束事件
  var animationProp = 'animation'; // 动画属性
  var animationEndEvent = 'animationend'; // 动画结束事件
  if (hasTransition) { // 如果浏览器支持过渡和动画
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) { // 如果浏览器不支持 transitionend事件但支持 WebkitTransitionEnd事件 (主要针对旧版本的 Safari)
      transitionProp = 'WebkitTransition'; // 将过渡属性和事件设置为 Webkit前缀
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) { //  如果浏览器不支持 animationend事件但支持 WebkitAnimationEnd事件 (主要针对旧版本的 Safari)
      animationProp = 'WebkitAnimation'; // 将动画属性和事件设置为 Webkit前缀
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  /* 提供一个用于执行动画函数的函数 */
  var raf = inBrowser // 如果在浏览器中
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window) // 使用 requestAnimationFrame函数
      : setTimeout // 否则使用 setTimeout函数
    : function (fn) { return fn(); }; // 非浏览器环境下的兜底函数

  /**
   * 在下一帧执行指定的函数
   * @param {Function} fn - 要执行的函数
   */
  function nextFrame (fn) {
    raf(function () { // 在下一帧执行
      raf(fn); // 在下一帧再次调用
    });
  }

  /**
   * 给元素添加过渡类名, 并在内部记录已添加的过渡类名, 避免重复添加
   * @param {Element} el - 要添加过渡类名的元素
   * @param {String} cls - 要添加的过渡类名
   */
  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []); // 获取元素的过渡类名数组
    if (transitionClasses.indexOf(cls) < 0) { // 如果要添加的过渡类名不在已添加的过渡类名数组中
      transitionClasses.push(cls); // 将要添加的过渡类名添加到数组中
      addClass(el, cls); // 给元素添加过渡类名
    }
  }

  /**
   * 从元素中移除指定的过渡类名
   * @param {Element} el - 要移除过渡类名的元素
   * @param {String} cls - 要移除的过渡类名
   */
  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) { // 如果元素存在过渡类名数组
      remove(el._transitionClasses, cls); // 从数组中移除指定的类名
    }
    removeClass(el, cls); // 从元素中移除指定的类名
  }

  /**
   * 当过渡或动画结束时执行回调函数
   * @param {Element} el - 目标元素
   * @param {String} expectedType - 期望的过渡或动画类型
   * @param {Function} cb - 回调函数
   */
  function whenTransitionEnds (
    el,
    expectedType,
    cb
  ) {
    var ref = getTransitionInfo(el, expectedType); // 获取过渡信息
    var type = ref.type; // 过渡或动画类型
    var timeout = ref.timeout; // 过渡或动画超时时间
    var propCount = ref.propCount; // 过渡或动画属性数量
    if (!type) { return cb() } // 如果没有过渡或动画类型, 则直接执行回调函数
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent; // 确定过渡或动画结束事件类型
    var ended = 0; // 已结束的过渡或动画数量
    var end = function () { // 结束函数 (用于移除事件监听器并执行回调函数)
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) { // 监听过渡或动画结束事件
      if (e.target === el) { // 如果事件目标是目标元素
        if (++ended >= propCount) { // 增加已结束的过渡或动画数量
          end(); // 执行结束函数
        }
      }
    };
    setTimeout(function () { // 设置超时时间, 如果超时未触发过渡或动画结束事件, 也执行结束函数
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd); // 添加事件监听器
  }

  var transformRE = /\b(transform|all)(,|$)/; // 匹配 CSS 中的过渡属性或 all
  /**
   * 获取元素的过渡或动画相关信息
   * @param {Element} el - 目标元素
   * @param {String} expectedType - 期望的过渡或动画类型 ("transition" 或 "animation")
   * @returns {Object}
   */
  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el); // 获取元素的计算样式
    var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', '); // 获取过渡延迟时间和持续时间
    var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations); // 计算过渡超时时间
    var animationDelays = (styles[animationProp + 'Delay'] || '').split(', '); // 获取动画延迟时间和持续时间
    var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations); // 计算动画超时时间

    var type; // 过渡或动画类型
    var timeout = 0; // 超时时间
    var propCount = 0; // 过渡属性数量
    if (expectedType === TRANSITION) { // 根据期望的过渡或动画类型确定要获取的信息
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else { // 如果未指定类型，则根据超时时间判断类型
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null;
      propCount = type
        ? type === TRANSITION
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    var hasTransform = // 判断是否有 transform属性的过渡
      type === TRANSITION &&
      transformRE.test(styles[transitionProp + 'Property']);
    return { // 返回过渡或动画相关信息的对象
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  /**
   * 计算过渡或动画的超时时间
   * @param {Array} delays - 过渡或动画的延迟时间数组
   * @param {Array} durations - 过渡或动画的持续时间数组
   * @returns {Number}
   */
  function getTimeout (delays, durations) {
    // 如果延迟时间数组的长度小于持续时间数组的长度, 则将延迟时间数组重复拼接, 直到长度与持续时间数组相等
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) { // 返回持续时间和延迟时间之和的最大值
      return toMs(d) + toMs(delays[i]) // 将持续时间和延迟时间都转换成毫秒, 并求和
    }))
  }

  /**
   * 将秒数转换为毫秒数
   * @param {String} s - 表示秒数的字符串
   * @returns {Number} - 表示毫秒数的数字
   */
  function toMs (s) {
    // 将秒数字符串中最后一位的百分号去除, 然后将逗号替换为点号, 再转换为数字, 并乘以1000, 得到毫秒数
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  /**
   * 处理元素进入过渡的逻辑
   * @param {VNode} vnode - 虚拟节点
   * @param {Function} toggleDisplay - 切换显示状态的函数
   */
  function enter (vnode, toggleDisplay) {
    var el = vnode.elm; // 获取元素节点

    if (isDef(el._leaveCb)) { // 调用离开回调函数 (如果存在)
      el._leaveCb.cancelled = true; // 取消离开回调
      el._leaveCb();
    }

    var data = resolveTransition(vnode.data.transition); // 解析过渡数据
    if (isUndef(data)) { // 如果没有过渡数据, 直接返回
      return
    }

    if (isDef(el._enterCb) || el.nodeType !== 1) { // 如果元素已经设置了进入回调函数, 或者是非元素节点, 则直接返回
      return
    }

    var css = data.css;  // 是否启用 CSS 过渡效果
    var type = data.type; // 过渡类型
    var enterClass = data.enterClass; // 元素进入过渡的起始类名
    var enterToClass = data.enterToClass; // 元素进入过渡的结束类名
    var enterActiveClass = data.enterActiveClass; // 元素进入过渡的激活类名
    var appearClass = data.appearClass; // 元素初次渲染时进入过渡的起始类名
    var appearToClass = data.appearToClass; // 元素初次渲染时进入过渡的结束类名
    var appearActiveClass = data.appearActiveClass; // 元素初次渲染时进入过渡的激活类名
    var beforeEnter = data.beforeEnter; // 元素进入过渡前的钩子函数
    var enter = data.enter; // 元素进入过渡时的钩子函数
    var afterEnter = data.afterEnter; // 元素进入过渡后的钩子函数
    var enterCancelled = data.enterCancelled; // 元素进入过渡被取消时的钩子函数
    var beforeAppear = data.beforeAppear; // 元素初次渲染时进入过渡前的钩子函数
    var appear = data.appear; // 元素初次渲染时进入过渡时的钩子函数
    var afterAppear = data.afterAppear; // 元素初次渲染时进入过渡后的钩子函数
    var appearCancelled = data.appearCancelled; // 元素初次渲染时进入过渡被取消时的钩子函数
    var duration = data.duration; // 过渡持续时间

    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) { // 循环会沿着 $vnode的父节点链向上移动, 确保 context指向了正确的过渡实例
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert; // 确定是否为初始渲染时的过渡

    if (isAppear && !appear && appear !== '') { // 如果是初始渲染时的过渡, 但是未设置 appear回调函数, 则直接返回
      return
    }

    var startClass = isAppear && appearClass // 过渡开始时应用的类名
      ? appearClass
      : enterClass;
    var activeClass = isAppear && appearActiveClass // 过渡过程中应用的激活类名
      ? appearActiveClass
      : enterActiveClass;
    var toClass = isAppear && appearToClass // 过渡结束时应用的类名
      ? appearToClass
      : enterToClass;

    var beforeEnterHook = isAppear // 过渡开始前的钩子函数
      ? (beforeAppear || beforeEnter)
      : beforeEnter;
    var enterHook = isAppear // 过渡进行中的钩子函数
      ? (typeof appear === 'function' ? appear : enter)
      : enter;
    var afterEnterHook = isAppear // 过渡结束后的钩子函数
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook = isAppear // 过渡被取消时的钩子函数
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    var explicitEnterDuration = toNumber( // 获取明确的进入持续时间
      isObject(duration)
        ? duration.enter
        : duration
    );

    if (explicitEnterDuration != null) { // 检查明确的持续时间是否有效
      checkDuration(explicitEnterDuration, 'enter', vnode);
    }

    var expectsCSS = css !== false && !isIE9; // 确定是否需要 CSS过渡效果
    var userWantsControl = getHookArgumentsLength(enterHook);

    var cb = el._enterCb = once(function () { // 定义回调函数
      if (expectsCSS) { // 移除过渡类名
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) { // 如果回调被取消, 则执行取消回调函数
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else { // 否则执行完成回调函数
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null; // 清除回调函数
    });

    if (!vnode.data.show) {// 如果元素不是初始渲染, 而是动态显示
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {  // 检查是否有潜在的离开过渡未完成
          pendingNode.elm._leaveCb(); // 执行潜在的离开过渡的回调函数
        }
        enterHook && enterHook(el, cb); // 执行进入过渡的钩子函数
      });
    }

    beforeEnterHook && beforeEnterHook(el); // 执行进入过渡前的钩子函数
    if (expectsCSS) {
      addTransitionClass(el, startClass); // 添加进入过渡的起始类名
      addTransitionClass(el, activeClass); // 添加进入过渡的激活类名
      nextFrame(function () { // 下一帧执行
        removeTransitionClass(el, startClass); // 移除起始类名
        if (!cb.cancelled) { // 如果过渡未被取消
          addTransitionClass(el, toClass); // 添加结束类名
          if (!userWantsControl) { // 如果没有手动控制过渡
            if (isValidDuration(explicitEnterDuration)) { // 根据指定的过渡持续时间设置延迟执行回调
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb); // 监听过渡结束事件执行回调
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay(); // 显示元素
      enterHook && enterHook(el, cb); // 执行进入过渡的钩子函数
    }

    if (!expectsCSS && !userWantsControl) { // 处理非 CSS过渡和手动控制
      cb(); // 直接执行回调
    }
  }

  /**
   * 执行离开过渡
   * @param {VNode} vnode - 虚拟节点
   * @param {Function} rm - 移除函数
   */
  function leave (vnode, rm) {
    var el = vnode.elm; // 获取元素节点

    if (isDef(el._enterCb)) { // 如果元素正处于进入过渡中, 立即调用进入过渡的回调函数并取消
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition); // 解析过渡相关的数据
    if (isUndef(data) || el.nodeType !== 1) { // 如果没有过渡相关的数据, 或元素不是元素节点, 直接执行移除函数并返回
      return rm()
    }

    if (isDef(el._leaveCb)) { // 如果元素已经存在离开过渡的回调函数, 直接返回
      return
    }

    var css = data.css; // 是否使用 CSS过渡
    var type = data.type; // 过渡类型
    var leaveClass = data.leaveClass; // 离开过渡的起始类名
    var leaveToClass = data.leaveToClass; // 离开过渡的结束类名
    var leaveActiveClass = data.leaveActiveClass; // 离开过渡的激活类名
    var beforeLeave = data.beforeLeave; // 执行离开过渡前的钩子函数
    var leave = data.leave; // 执行离开过渡的函数
    var afterLeave = data.afterLeave; // 离开过渡后的钩子函数
    var leaveCancelled = data.leaveCancelled; // 离开过渡被取消时的钩子函数
    var delayLeave = data.delayLeave; // 延迟执行离开过渡的函数
    var duration = data.duration; // 过渡持续时间

    var expectsCSS = css !== false && !isIE9; // 判断是否需要 CSS过渡
    var userWantsControl = getHookArgumentsLength(leave); // 判断是否用户手动控制过渡

    var explicitLeaveDuration = toNumber( // 获取明确指定的离开过渡持续时间
      isObject(duration)
        ? duration.leave
        : duration
    );

    if (isDef(explicitLeaveDuration)) { // 检查明确指定的过渡持续时间是否合法
      checkDuration(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once(function () { // 离开过渡的回调函数
      if (el.parentNode && el.parentNode._pending) { // 移除父节点上的挂起状态
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) { // 移除过渡类名
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) { // 如果回调被取消, 执行取消回调
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else { // 否则执行移除函数和离开过渡后的钩子函数
        rm(); // 执行移除函数
        afterLeave && afterLeave(el); // 执行离开过渡后的钩子函数
      }
      el._leaveCb = null; // 重置回调函数为 null
    });

    if (delayLeave) { // 如果有延迟离开函数, 先执行延迟离开函数
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () { // 执行离开过渡
      if (cb.cancelled) { // 如果回调已经被取消, 直接返回
        return
      }
      if (!vnode.data.show && el.parentNode) { // 如果元素不是显示状态, 并且有父节点, 记录挂起状态
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el); // 执行离开过渡前的钩子函数
      if (expectsCSS) { // 如果需要 CSS过渡
        addTransitionClass(el, leaveClass); // 添加离开过渡的结束类名
        addTransitionClass(el, leaveActiveClass); // 添加离开过渡的激活类名
        nextFrame(function () { // 下一帧执行移除过渡类名的操作
          removeTransitionClass(el, leaveClass); // 移除离开过渡的起始类名
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass); // 添加离开过渡的结束类名
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) { // 如果有指定有效的过渡持续时间
                setTimeout(cb, explicitLeaveDuration); // 通过定时器执行回调
              } else {
                whenTransitionEnds(el, type, cb); // 等待过渡结束事件来执行回调
              }
            }
          }
        });
      }
      leave && leave(el, cb); // 执行离开过渡函数
      if (!expectsCSS && !userWantsControl) { // 如果不使用 CSS过渡且没有指定过渡持续时间
        cb(); // 立即执行回调
      }
    }
  }

  /**
   * 在开发模式下检查过渡动画持续时间是否合法
   * @param {Any} val - 持续时间值
   * @param {String} name - 持续时间的名称
   * @param {VNode} vnode - 虚拟节点
   */
  function checkDuration (val, name, vnode) {
    if (typeof val !== 'number') { // 如果传入的持续时间值不是数字类型
      warn( // 输出警告, 说明指定的过渡动画持续时间不是一个有效的数字
        "<transition> explicit " + name + " duration is not a valid number - " +
        "got " + (JSON.stringify(val)) + ".",
        vnode.context
      );
    } else if (isNaN(val)) { // 如果传入的持续时间值是 NaN
      warn( // 输出警告, 说明指定的过渡动画持续时间是 NaN, 可能是表达式错误导致
        "<transition> explicit " + name + " duration is NaN - " +
        'the duration expression might be incorrect.',
        vnode.context
      );
    }
  }

  /**
   * 检查值是否是有效的持续时间
   * @param {Any} val - 要检查的值
   * @returns {Boolean}
   */
  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val) // 如果传入参数是一个数字, 并且不是 NaN, 则被认为是有效的持续时间
  }

  /**
   * 规范化过渡钩子函数的参数长度, 这些钩子函数可能是:
   * - 合并的钩子函数 (调用者) 带有原始钩子函数在 .fns中
   * - 包装的组件方法 (检查 ._length)
   * - 普通的函数 (.length)
   * @param {Function} fn - 要检查的钩子函数
   * @returns {Boolean}
   */
  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) { // 如果函数未定义, 则返回 false
      return false
    }
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) { // 如果是合并的钩子函数, 则递归获取第一个钩子函数的参数长度
      // invoker
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0] // 如果是数组, 则取第一个函数
          : invokerFns // 否则直接取函数
      )
    } else { // 如果不是合并的钩子函数, 则获取函数的参数长度
      return (fn._length || fn.length) > 1
    }
  }

  /**
   * 进入过渡的钩子函数
   * @param {Any} _  -保留参数
   * @param {VNode} vnode - 虚拟节点
   */
  function _enter (_, vnode) {
    if (vnode.data.show !== true) { // 如果虚拟节点的 data属性中的 show不等于 true
      enter(vnode); // 调用 enter函数, 开始进入过渡
    }
  }

  var transition = inBrowser ? { // 过度效果的生命周期处理函数
    create: _enter, // 过渡开始前的钩子函数
    activate: _enter, // 激活过渡效果的钩子函数
    remove: function remove$$1 (vnode, rm) { // 过渡结束后的钩子函数
      if (vnode.data.show !== true) { // 如果节点不是显示状态
        leave(vnode, rm); // 调用离开过渡的函数
      } else {
        rm(); // 直接移除节点
      }
    }
  } : {}; // 如果不在浏览器环境下, 则空对象

  var platformModules = [ // 平台相关的模块 (包括属性, 类, 事件, DOM属性, 样式, 过渡效果等模块)
    attrs,      // 处理 HTML属性的模块
    klass,      // 处理 class的模块
    events,     // 处理事件的模块
    domProps,   // 处理 DOM属性的模块
    style,      // 处理内联样式的模块
    transition  // 过渡效果的生命周期处理函数
  ];

  var modules = platformModules.concat(baseModules); // 指令模块应该在所有内置模块之后应用, 因此将其添加到最

  var patch = createPatchFunction({ // 创建一个用于虚拟 DOM补丁的函数
    nodeOps: nodeOps, // 封装对 DOM节点的操作 (比如创建, 插入, 删除等)
    modules: modules  // 包含了一系列模块 (用于处理不同类型的节点属性, 事件等)
  });

  if (isIE9) { // 如果是 IE9浏览器
    document.addEventListener('selectionchange', function () { // 添加一个事件监听器, 用于处理 selectionchange事件
      var el = document.activeElement; // 获取当前获得焦点的元素
      if (el && el.vmodel) { // 如果当前元素存在且有 v-model属性
        trigger(el, 'input'); // 触发该元素的 input事件
      }
    });
  }

  var directive = { // 指令的钩子函数
    /**
     * 指令插入到 DOM 时调用的钩子函数
     * @param {HTMLElement} el - 指令绑定的元素
     * @param {Object} binding - 指令的绑定对象
     * @param {VNode} vnode - Vue 编译生成的虚拟节点
     * @param {VNode} oldVnode - 上一个虚拟节点
     */
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') { // 如果指令所在的元素是 <select>元素
        if (oldVnode.elm && !oldVnode.elm._vOptions) { // 如果旧的虚拟节点存在且没有设置选项
          mergeVNodeHook(vnode, 'postpatch', function () { // 在节点更新后执行的钩子函数中, 执行下面的函数
            directive.componentUpdated(el, binding, vnode); // 手动调用 componentUpdated钩子函数
          });
        } else { // 如果旧的虚拟节点不存在或者设置了选项
          setSelected(el, binding, vnode.context); // 设置选中项
        }
        el._vOptions = [].map.call(el.options, getValue); // 将 <select>元素的所有选项存储到 _vOptions属性中
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) { // 如果指令所在的元素是 <textarea>元素或者输入框
        el._vModifiers = binding.modifiers; // 存储指令的修饰符
        if (!binding.modifiers.lazy) { // 如果指令没有使用 lazy修饰符
          /* 添加事件监听器, 用于处理中文输入法输入时的问题 */
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
          el.addEventListener('change', onCompositionEnd); // 监听输入框的 change事件
          if (isIE9) { // 如果是 IE9浏览器
            el.vmodel = true; // 给元素设置 vmodel属性, 用于标识其为 v-model绑定的元素
          }
        }
      }
    },

    /**
     * 组件更新时调用的钩子函数
     * @param {HTMLElement} el - 指令绑定的元素
     * @param {Object} binding - 指令的绑定对象
     * @param {VNode} vnode - Vue 编译生成的虚拟节点
     */
    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') { // 如果指令所在的元素是 <select>元素
        setSelected(el, binding, vnode.context); // 设置选中项
        // 在渲染的选项发生变化后, 可能导致 value值和渲染的选项不一致
        var prevOptions = el._vOptions; // 在这种情况下, 触发 change事件
        var curOptions = el._vOptions = [].map.call(el.options, getValue);
        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          // trigger change event if
          // no matching option found for at least one value
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, 'change');
          }
        }
      }
    }
  };

  /**
   * 设置 <select>元素的选中项
   * @param {HTMLElement} el - <select> 元素
   * @param {Object} binding - 指令的绑定对象
   * @param {Vue} vm - Vue 实例
   */
  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm); // 调用实际的选中项设置函数
    if (isIE || isEdge) { // 如果是 IE或 Edge浏览器
      setTimeout(function () { // 使用 setTimeout进行延迟处理
        actuallySetSelected(el, binding, vm); // 再次调用实际的选中项设置函数
      }, 0);
    }
  }

  /**
   * 实际设置 <select> 元素的选中项的函数
   * @param {HTMLElement} el - <select> 元素
   * @param {Object} binding - 指令的绑定对象
   * @param {Vue} vm - Vue 实例
   */
  function actuallySetSelected (el, binding, vm) {
    var value = binding.value; // 获取绑定值
    var isMultiple = el.multiple; // 是否为多选
    if (isMultiple && !Array.isArray(value)) { // 如果是多选而值不是数组, 则发出警告
      warn(
        "<select multiple v-model=\"" + (binding.expression) + "\"> " +
        "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
        vm
      );
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) { // 循环处理每个选项
      option = el.options[i];
      if (isMultiple) { // 如果是多选
        selected = looseIndexOf(value, getValue(option)) > -1; // 判断该选项是否在绑定值中
        if (option.selected !== selected) { // 如果选项的选中状态与预期不符, 则设置选项的选中状态
          option.selected = selected;
        }
      } else { // 单选
        if (looseEqual(getValue(option), value)) { // 判断选项的值与绑定值是否相等
          if (el.selectedIndex !== i) { // 相等, 则设置选项为选中状态
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    if (!isMultiple) { // 如果是单选且未找到匹配项, 则重置选择
      el.selectedIndex = -1;
    }
  }

  /**
   * 检查给定的值在一组选项中是否没有匹配项
   * @param {Any} value - 要检查的值
   * @param {Array} options - 选项数组
   * @returns {Boolean}
   */
  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { // 检查是否所有选项都与给定值不相等
      return !looseEqual(o, value);
    })
  }

   /**
   * 获取 option参数中的值
   * @param {Object} option - 元素对象
   * @returns {Any}
   */
  function getValue (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  /**
   * 当输入法开始输入时触发的事件处理函数
   * @param {Event} e - 输入法事件对象
   */
  function onCompositionStart (e) {
    e.target.composing = true; // 设置标志置, 表示输入法组合已开始
  }

  /**
   * 当输入法结束输入时触发的事件处理函数
   * @param {Event} e - 输入法事件对象
   */
  function onCompositionEnd (e) {
    /* 防止无故触发输入事件 */
    if (!e.target.composing) { return } // 如果目标元素没有处于输入法组合状态, 则直接返回
    e.target.composing = false; // 设置标志置为 false, 表示输入法组合已结束
    trigger(e.target, 'input'); // 触发 input事件
  }

  /**
   * 触发指定元素的事件
   * @param {HTMLElement} el - 目标元素
   * @param {String} type - 触发的事件类型
   */
  function trigger (el, type) {
    var e = document.createEvent('HTMLEvents'); // 创建一个新的事件对象
    e.initEvent(type, true, true); // 初始化事件对象 (设置事件类型: 是否冒泡, 是否可取消)
    el.dispatchEvent(e); // 触发目标元素的指定事件
  }

  /**
   * 递归搜索可能在组件根部定义的过渡效果
   * @param {VNode} vnode - 虚拟节点
   * @returns {VNode}
   */
  function locateNode (vnode) {
    // 如果虚拟节点具有组件实例并且未定义过渡效果, 则继续搜索其子组件根部的过渡效果
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode(vnode.componentInstance._vnode) // 继续搜索子组件根部的过渡效果
      : vnode // 返回找到的节点
  }

  var show = { // Vue 指令: v-show
    /**
     * 指令第一次绑定到元素时调用
     * @param {HTMLElement} el - 元素对象
     * @param {Object} ref - 指令的值和修饰符
     * @param {Object} vnode - Vue 虚拟节点
     */
    bind: function bind (el, ref, vnode) {
      var value = ref.value; // 获取指令的值

      vnode = locateNode(vnode); // 获取定位的节点
      var transition$$1 = vnode.data && vnode.data.transition; // 获取过渡属性
      var originalDisplay = el.__vOriginalDisplay = // 获取原始的 display样式
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) { // 如果指令的值为真且存在过渡效果
        vnode.data.show = true;
        enter(vnode, function () { // 执行进入过渡效果
          el.style.display = originalDisplay; // 显示元素
        });
      } else {
        el.style.display = value ? originalDisplay : 'none'; // 根据指令的值设置元素的 display样式
      }
    },

    /**
     * 指令所在元素的绑定值更新时调用
     * @param {HTMLElement} el - 元素对象
     * @param {Object} ref - 更新后的指令的值和旧值
     * @param {Object} vnode - Vue 虚拟节点
     */
    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      if (!value === !oldValue) { return } // 如果新值和旧值都为空, 则直接返回
      vnode = locateNode(vnode); // 获取定位的节点
      var transition$$1 = vnode.data && vnode.data.transition; // 获取过渡属性
      if (transition$$1) { // 如果存在过渡效果
        vnode.data.show = true;
        if (value) {  // 如果新值为真
          enter(vnode, function () { // 执行进入过渡效果
            el.style.display = el.__vOriginalDisplay; // 显示元素
          });
        } else { // 否则
          leave(vnode, function () { // 执行离开过渡效果
            el.style.display = 'none'; // 隐藏元素
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none'; // 根据新值设置元素的 display样式
      }
    },

    /**
     * 指令所在元素解绑时调用
     * @param {HTMLElement} el - 元素对象
     * @param {Object} binding - 指令的绑定对象
     * @param {Object} vnode - Vue 虚拟节点
     * @param {Object} oldVnode - 旧的 Vue 虚拟节点
     * @param {Boolean} isDestroy - 是否是销毁
     */
    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) { // 如果不是销毁状态
        el.style.display = el.__vOriginalDisplay; // 还原元素的 display样式
      }
    }
  };

  var platformDirectives = { // 平台指令对象, 包含了一些平台内置的指令
    model: directive, // 将 model指令添加到平台指令对象中
    show: show // 将 show指令添加到平台指令对象中
  };

  var transitionProps = { // 用于定义过渡的属性对象
    name: String, // 过渡的名称
    appear: Boolean, // 是否在初始渲染时使用过渡效果
    css: Boolean, // 是否使用 CSS 过渡
    mode: String, // 过渡模式
    type: String, // 过渡的类型 (transition 或 animation)
    enterClass: String, // 进入过渡的类名
    leaveClass: String, // 离开过渡的类名
    enterToClass: String, // 进入过渡结束时的类名
    leaveToClass: String, // 离开过渡结束时的类名
    enterActiveClass: String, // 触发进入过渡时的类名
    leaveActiveClass: String, // 触发离开过渡时的类名
    appearClass: String, // 初始渲染时的进入过渡类名
    appearActiveClass: String, // 初始渲染时触发进入过渡时的类名
    appearToClass: String, // 初始渲染时的进入过渡结束类名
    duration: [Number, String, Object] // 过渡持续时间
  };

  /**
   * 递归地获取真实的子组件 (以防子组件也是抽象组件, 例如 <keep-alive>)
   * 我们希望递归地检索要渲染的真实组件
   * @param {VNode} vnode - 虚拟节点
   * @returns {VNode}
   */
  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions; // 获取虚拟节点的组件选项
    if (compOptions && compOptions.Ctor.options.abstract) { // 如果组件是抽象组件
      return getRealChild(getFirstComponentChild(compOptions.children)) // 递归获取第一个真实子组件
    } else { // 如果组件不是抽象组件, 则直接返回该虚拟节点
      return vnode
    }
  }

  /**
   * 提取过渡数据
   * @param {Component} comp - 组件实例
   * @returns {Object}
   */
  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options; // 获取组件实例的选项对象

    for (var key in options.propsData) { // 提取组件实例的 props数据
      data[key] = comp[key];
    }
    /* 提取组件实例的事件监听器, 并将它们直接传递给过渡方法 */
    var listeners = options._parentListeners; // 获取父级组件传递的监听器对象
    for (var key$1 in listeners) { // 转换事件名称为驼峰式并存储到过渡数据中
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  /**
   * 创建占位符节点
   * @param {Function} h - createElement 函数
   * @param {VNode} rawChild - 原始子节点
   * @returns {VNode}
   */
  function placeholder (h, rawChild) {
    /* 检查原始子节点的标签名是否以数字结尾且包含 "-keep-alive", 例如: "comp-keep-alive" */
    if (/\d-keep-alive$/.test(rawChild.tag)) { // 如果满足条件, 创建一个 keep-alive组件作为占位符
      return h('keep-alive', { // 并将原始子节点的 props作为 props传递给 keep-alive
        props: rawChild.componentOptions.propsData
      })
    }
  }

  /**
   * 检查节点是否具有父级过渡
   * @param {VNode} vnode - 节点
   * @returns {Boolean}
   */
  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) { // 循环向上遍历节点的父节点
      if (vnode.data.transition) { // 如果父节点存在过渡数据, 则返回 true
        return true
      }
    }
  }

  /**
   * 检查两个子节点是否相同
   * @param {VNode} child - 新节点
   * @param {VNode} oldChild - 旧节点
   * @returns {Boolean}
   */
  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  /**
   * 检查节点是否不是文本节点
   * @param {VNode} c - 节点
   * @returns {Boolean}
   */
  var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

  /**
   * 检查指令是否为 v-show
   * @param {Object} d - 指令对象
   * @returns {Boolean}
   */
  var isVShowDirective = function (d) { return d.name === 'show'; };

  var Transition = { // Transition 组件对象
    name: 'transition', // 组件的名称为 'transition'
    props: transitionProps, // 组件的 props (具体内容在其他地方定义)
    abstract: true, // 抽象组件 (不会被直接渲染到 DOM中)

    render: function render (h) { // 渲染函数
      var this$1 = this;

      var children = this.$slots.default; // 获取默认插槽中的子节点
      if (!children) { // 如果没有子节点, 则返回
        return
      }

      children = children.filter(isNotTextNode); // 过滤掉文本节点
      if (!children.length) { // 如果过滤后没有子节点, 则返回
        return
      }

      if (children.length > 1) { // 如果有多个子节点, 则发出警告
        warn(
          '<transition> can only be used on a single element. Use ' +
          '<transition-group> for lists.',
          this.$parent
        );
      }

      var mode = this.mode; // 获取过渡模式

      if (mode && mode !== 'in-out' && mode !== 'out-in'
      ) { // 如果有指定过渡模式, 则检查模式的有效性, 并发出警告
        warn(
          'invalid <transition> mode: ' + mode,
          this.$parent
        );
      }

      var rawChild = children[0]; // 获取第一个子节点

      if (hasParentTransition(this.$vnode)) { // 如果子节点存在父级过渡组件, 则直接返回子节点
        return rawChild
      }

      var child = getRealChild(rawChild); // 应用过渡数据到子节点
      if (!child) {
        return rawChild
      }

      if (this._leaving) { // 如果组件正在离开过渡状态, 则返回占位符节点
        return placeholder(h, rawChild)
      }

      var id = "__transition-" + (this._uid) + "-"; // 确保每个节点都有唯一的 key
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData(this); // 提取过渡数据
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      // 如果子节点有 directives属性, 并且其中包含 v-show指令
      if (child.data.directives && child.data.directives.some(isVShowDirective)) {
        child.data.show = true; // 标记具有 v-show 指令的子节点, 这样过渡模块就能将控制权交给指令
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) &&
        !isAsyncPlaceholder(oldChild) &&
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) { // 如果旧节点存在且不同于新节点, 则替换旧节点的过渡数据
        // replace old child transition data with fresh one
        // important for dynamic transitions!
        var oldData = oldChild.data.transition = extend({}, data);
        // handle transition mode
        if (mode === 'out-in') { // 如果是 out-in 模式, 则返回占位符节点, 并在离开结束后强制更新
          this._leaving = true;
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') { // 如果是 in-out模式, 则设置延迟离开并在进入后执行离开
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }

      return rawChild
    }
  };

  var props = extend({ // 将 transitionProps对象的属性合并到 props中
    tag: String, // 用于指定渲染的元素标签名 (默认 div)
    moveClass: String // 用于指定移动过渡时所使用的类名
  }, transitionProps);

  delete props.mode; // 删除过渡模式 (由于一组子节点可能同时存在多个过渡效果, 而不同子节点的过渡模式可能是不一样的, 因此不再需要 mode属性)

  var TransitionGroup = { // TransitionGroup 组件对象
    props: props, // 组件的 props

    beforeMount: function beforeMount () { // 组件挂载之前的钩子函数
      var this$1 = this;

      var update = this._update; // 保存原始的更新函数
      this._update = function (vnode, hydrating) { // 重新定义更新函数, 以便在过渡生命周期中执行必要的操作
        var restoreActiveInstance = setActiveInstance(this$1);
        this$1.__patch__( // 强制移除节点, 但保留已经过渡完成的节点
          this$1._vnode,
          this$1.kept,
          false,
          true // 仅移除 (避免不必要的移动)
        );
        this$1._vnode = this$1.kept;
        restoreActiveInstance();
        update.call(this$1, vnode, hydrating);
      };
    },

    render: function render (h) { // 渲染函数
      var tag = this.tag || this.$vnode.data.tag || 'span'; // 获取渲染的标签名 (默认为 'span')
      var map = Object.create(null);
      var prevChildren = this.prevChildren = this.children;
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      var transitionData = extractTransitionData(this);

      for (var i = 0; i < rawChildren.length; i++) { // 遍历子节点, 处理过渡相关的操作
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c); // 将子节点添加到 children数组中
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          } else { // 如果子节点没有指定 key, 则发出警告
            var opts = c.componentOptions;
            var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
            warn(("<transition-group> children must be keyed: <" + name + ">"));
          }
        }
      }

      if (prevChildren) { // 处理已保留的节点和被移除的节点
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          c$1.data.transition = transitionData;
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        this.kept = h(tag, null, kept); // 保留已过渡完成的节点
        this.removed = removed; // 保存被移除的节点
      }

      return h(tag, null, children) // 返回渲染结果
    },

    updated: function updated () { // 组件更新完成时的钩子函数
      var children = this.prevChildren;
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      // 如果没有子节点或子节点没有移动类, 则直接返回
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      /* 分三个循环执行操作, 避免读写混合, 减少布局抖动 */
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);

      // 强制重绘以确保所有元素的位置正确
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          addTransitionClass(el, moveClass); // 添加过渡类
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) { // 添加过渡结束事件监听器
            if (e && e.target !== el) {
              return
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass); // 移除过渡类
            }
          });
        }
      });
    },

    methods: { // 判断是否有过渡效果
      hasMove: function hasMove (el, moveClass) {
        if (!hasTransition) {
          return false
        }
        if (this._hasMove) {
          return this._hasMove
        }
        var clone = el.cloneNode(); // 检测带有移动类的元素是否有 CSS过渡效果
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
        }
        addClass(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        var info = getTransitionInfo(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  /**
   * 用于调用元素的移动回调和进入回调的函数
   * @param {VNode} c - 包含元素信息的 VNode对象
   */
  function callPendingCbs (c) {
    if (c.elm._moveCb) { // 如果存在移动回调函数, 则调用
      c.elm._moveCb();
    }

    if (c.elm._enterCb) { // 如果存在进入回调函数, 则调用
      c.elm._enterCb();
    }
  }

  /**
   * 记录元素的位置信息到虚拟节点的 data中
   * @param {VNode} c - 包含元素信息的 VNode对象
   */
  function recordPosition (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  /**
   * 将元素移动到新位置
   * @param {VNode} c - 包含元素信息的 VNode对象
   */
  function applyTranslation (c) {
    var oldPos = c.data.pos; // 获取旧位置和新位置信息
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left; // 计算位置的变化量
    var dy = oldPos.top - newPos.top;
    if (dx || dy) { // 如果位置有变化
      c.data.moved = true; // 标记元素已移动
      var s = c.elm.style; // 应用位移样式
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s'; // 取消过渡动画效果
    }
  }

  var platformComponents = { // 用于定义平台级组件, 包括 Transition和 TransitionGroup
    Transition: Transition,
    TransitionGroup: TransitionGroup
  };

  /* 安装平台特定的工具函数 */
  Vue.config.mustUseProp = mustUseProp; // 确定标签属性是否必须使用 props进行绑定
  Vue.config.isReservedTag = isReservedTag; // 检查标签是否为保留标签 (即内置 HTML元素)
  Vue.config.isReservedAttr = isReservedAttr; // 检查属性是否为保留属性
  Vue.config.getTagNamespace = getTagNamespace; // 获取标签的命名空间
  Vue.config.isUnknownElement = isUnknownElement; // 检测是否为未知元素 (未注册的组件)

  extend(Vue.options.directives, platformDirectives); // 将平台指令添加到Vue的全局指令选项中
  extend(Vue.options.components, platformComponents); // 将平台组件添加到Vue的全局组件选项中

  Vue.prototype.__patch__ = inBrowser ? patch : noop; // 将补丁函数挂载到Vue原型上 (用于将虚拟 DOM渲染成真实 DOM)

  Vue.prototype.$mount = function (el, hydrating) { // 用于将 Vue实例挂载到 DOM元素上
    el = el && inBrowser ? query(el) : undefined; // 将 el转换为对应的 DOM元素对象
    return mountComponent(this, el, hydrating) // 调用 mountComponent函数进行挂载
  };

  if (inBrowser) { // 在浏览器环境中执行
    setTimeout(function () { // 将后续代码推迟到下一个事件循环执行
      if (config.devtools) {
        if (devtools) { // 如果开启了 devtools
          devtools.emit('init', Vue); // 如果 devtools存在, 发送 init事件
        } else { // 如果 devtools不存在, 提示用户下载 Vue Devtools浏览器插件
          console[console.info ? 'info' : 'log'](
            'Download the Vue Devtools extension for a better development experience:\n' +
            'https://github.com/vuejs/vue-devtools'
          );
        }
      }
      if (config.productionTip !== false &&
        typeof console !== 'undefined'
      ) { // 如果未禁用生产环境提示, 则输出开发环境提示信息
        console[console.info ? 'info' : 'log'](
          "You are running Vue in development mode.\n" +
          "Make sure to turn on production mode when deploying for production.\n" +
          "See more tips at https://vuejs.org/guide/deployment.html"
        );
      }
    }, 0);
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 正则表达式用于匹配插值表达式, 即双大括号 {{}} 包裹的内容
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;  // 正则表达式用于对字符串中的特殊字符进行转义
  /**
   * 构建用于解析插值表达式的正则表达式
   * @param {Array} delimiters - 插值表达式的定界符 (如: ['{{', '}}'])
   * @returns {RegExp}
   */
  var buildRegex = cached(function (delimiters) {
    var open = delimiters[0].replace(regexEscapeRE, '\\$&'); // 对定界符中的特殊字符进行转义
    var close = delimiters[1].replace(regexEscapeRE, '\\$&');
    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
  });

  /**
   * 解析文本中的插值表达式
   * @param {String} text - 要解析的文本
   * @param {Array<String>} delimiters - 自定义的插值定界符数组
   * @returns {Object}
   */
  function parseText (
    text,
    delimiters
  ) {
    var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE; // 构建正则表达式
    if (!tagRE.test(text)) { // 如果文本中没有匹配到插值表达式, 则直接返回
      return
    }
    var tokens = []; // 存储处理后的 tokens
    var rawTokens = []; // 存储原始 tokens
    var lastIndex = tagRE.lastIndex = 0; // 设置正则的匹配起始位置为 0
    var match, index, tokenValue;
    while ((match = tagRE.exec(text))) { // 循环匹配插值表达式
      index = match.index; // 获取匹配到的表达式在文本中的起始位置
      if (index > lastIndex) { // 处理插值表达式之前的文本 (普通文本)
        rawTokens.push(tokenValue = text.slice(lastIndex, index)); // 将普通文本添加到原始 token中
        tokens.push(JSON.stringify(tokenValue)); // 将普通文本转换为字符串形式, 并添加到 tokens中
      }

      /* 处理插值表达式 */
      var exp = parseFilters(match[1].trim()); // 解析模板表达式中的过滤器 (例: "age | toNumber" => "_f("toNumber")(age)")
      tokens.push(("_s(" + exp + ")")); // 将表达式字符串转换为 "_s(exp)" 形式, 并添加到 tokens中
      rawTokens.push({ '@binding': exp }); // 将表达式添加到原始 tokens 中
      lastIndex = index + match[0].length; // 更新 lastIndex, 保证下一轮循环时, 只从插值表达式的结尾后开始匹配
    }

    if (lastIndex < text.length) { // 处理最后一个插值表达式之后的文本 (普通文本)
      rawTokens.push(tokenValue = text.slice(lastIndex)); // 将最后的普通文本添加到原始 token中
      tokens.push(JSON.stringify(tokenValue)); // 将最后的普通文本转换为字符串形式, 并添加到 tokens中
    }
    return {
      expression: tokens.join('+'), // 将 tokens连接成一个表达式字符串
      tokens: rawTokens // 返回原始 tokens数组
    }
  }

  /**
   * 转换节点
   * @param {Object} el - AST 节点对象
   * @param {Object} options - 编译器选项
   */
  function transformNode (el, options) {
    var warn = options.warn || baseWarn; // 获取警告函数
    var staticClass = getAndRemoveAttr(el, 'class'); // 获取并删除节点的静态 class属性
    if (staticClass) { // 如果存在静态 class属性
      var res = parseText(staticClass, options.delimiters); // 解析静态 class属性中的插值表达式
      if (res) { // 如果解析结果存在, 说明静态 class属性中包含了插值表达式
        warn( // 输出警告信息, 提示用户插值表达式不再支持在属性中使用, 应该使用 v-bind 或简写方式
          "class=\"" + staticClass + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div class="{{ val }}">, use <div :class="val">.',
          el.rawAttrsMap['class']
        );
      }
    }
    if (staticClass) { // 如果存在静态 class属性
      el.staticClass = JSON.stringify(staticClass); // 将静态 class属性转换为字符串形式并赋给节点的 staticClass属性
    }
    var classBinding = getBindingAttr(el, 'class', false /* getStatic */); // 获取绑定的 class属性值
    if (classBinding) { // 如果存在绑定的 class属性值
      el.classBinding = classBinding; // 赋值给节点的 classBinding 属性
    }
  }

  /**
   * 生成用于创建 VNode 的类名字符串
   * @param {Object} el - 元素对象
   * @returns {String}
   */
  function genData (el) {
    var data = ''; // 用于存储生成的类名字符串
    if (el.staticClass) { // 检查元素对象是否有静态类名, 如果有则添加到类名字符串中
      data += "staticClass:" + (el.staticClass) + ",";
    }
    if (el.classBinding) { // 检查元素对象是否有动态类名, 如果有则添加到类名字符串中
      data += "class:" + (el.classBinding) + ",";
    }
    return data
  }

  var klass$1 = { // 包含了用于处理静态 class的一些方法
    staticKeys: ['staticClass'], // 定义了静态 class的关键字
    transformNode: transformNode,// 定义了处理节点的方法 (一般用于修改节点的属性或数据)
    genData: genData // 定义了生成节点数据的方法 (用于生成 vnode数据对象)
  };

  /**
   * 处理元素节点的 style属性, 将静态和动态 style属性转换为相应的 vnode数据
   * @param {Object} el - 元素 AST节点对象
   * @param {Object} options - 编译选项对象
   */
  function transformNode$1 (el, options) {
    var warn = options.warn || baseWarn; // 获取警告函数
    var staticStyle = getAndRemoveAttr(el, 'style'); // 获取 style属性并删除属性
    if (staticStyle) { // 如果存在静态 style属性
      {
        var res = parseText(staticStyle, options.delimiters); // 静态 style属性中存在插值表达式
        if (res) { // 则发出警告
          warn(
            "style=\"" + staticStyle + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div style="{{ val }}">, use <div :style="val">.',
            el.rawAttrsMap['style']
          );
        }
      }
      el.staticStyle = JSON.stringify(parseStyleText(staticStyle)); // 将静态 style属性转换为静态样式对象
    }

    var styleBinding = getBindingAttr(el, 'style', false /* getStatic */); // 获取元素节点的动态 style属性
    if (styleBinding) { // 如果存在动态 style属性, 则将其存储在元素上
      el.styleBinding = styleBinding;
    }
  }

  /**
   * 生成虚拟节点的 style 属性的数据字符串
   * @param {Object} el - vnode 元素
   * @returns {string}
   */
  function genData$1 (el) {
    var data = ''; // 初始化一个空字符串, 用于存储生成的数据字符串
    if (el.staticStyle) { // 如果存在静态样式, 将其添加到数据字符串中
      data += "staticStyle:" + (el.staticStyle) + ",";
    }
    if (el.styleBinding) { // 如果存在样式绑定, 将其添加到数据字符串中
      data += "style:(" + (el.styleBinding) + "),";
    }
    return data
  }

  var style$1 = { // 定义一个用于处理样式相关内容的对象
    staticKeys: ['staticStyle'], // staticKeys 属性指定了静态样式的键名
    transformNode: transformNode$1, // 用于处理节点的转换
    genData: genData$1 // 用于生成节点的数据
  };

  var decoder; // 定义一个解码器变量

  var he = { // 用于提供 HTML字符串的解码功能
    decode: function decode (html) {
      decoder = decoder || document.createElement('div'); // 如果解码器不存在, 创建一个 div元素作为解码器
      decoder.innerHTML = html; // 将 HTML字符串设置为元素的 innerHTML属性, 从而解码 HTML
      return decoder.textContent // 返回解码后的文本内容
    }
  };

  var isUnaryTag = makeMap( // 一元标签 
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
  );

  var canBeLeftOpenTag = makeMap( // 可以故意不闭合的元素 (并且会自行关闭)
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
  );

  var isNonPhrasingTag = makeMap( // 列举了非短语内容标签的列表
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
  );

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配常规属性的正则表达式, 包括属性名和属性值
  var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配动态参数的属性的正则表达式 (如 v-bind @ : #)
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*"; // // 匹配 XML名称的正则表达式
  var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")"; // 用于匹配标签名和命名空间
  var startTagOpen = new RegExp(("^<" + qnameCapture)); // 用于匹配开始标签的标签名
  var startTagClose = /^\s*(\/?)>/; // 匹配开始标签结尾的正则表达式
  var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>")); // 匹配闭合标签
  var doctype = /^<!DOCTYPE [^>]+>/i; // 匹配 <!DOCTYPE>
  var comment = /^<!\--/; // 匹配注释的起始部分( <!-- )
  var conditionalComment = /^<!\[/; // 匹配条件注释的起始部分( <![ )

  var isPlainTextElement = makeMap('script,style,textarea', true); // 特殊标签, 可以包含任何内容 (script, style, textarea标签)
  var reCache = {}; // 处理正则表达式时的缓存

  var decodingMap = { // 解码 HTML实体字符的映射表, 将实体字符转换为对应的特殊字符
    '&lt;': '<',   // 将 &lt; 解码为 <
    '&gt;': '>',   // 将 &gt; 解码为 >
    '&quot;': '"', // 将 &quot; 解码为 "
    '&amp;': '&',  // 将 &amp; 解码为 &
    '&#10;': '\n', // 将 &#10; 解码为换行符 \n
    '&#9;': '\t',  // 将 &#9; 解码为制表符 \t
    '&#39;': "'"   // 将 &#39; 解码为单引号 '
  };
  var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g; // 匹配 HTML实体字符的正则表达式
  var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g; // 匹配带换行符的 HTML实体字符的正则表达式

  var isIgnoreNewlineTag = makeMap('pre,textarea', true); // 忽略换行符的标签名映射表
  var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; }; // 判断是否应该忽略标签的第一个换行符

  /**
   * 解码属性值中的 HTML 实体编码
   * @param {String} value - 属性值
   * @param {Boolean} shouldDecodeNewlines - 是否解码换行符
   * @returns {String} 解码后的属性值
   */
  function decodeAttr (value, shouldDecodeNewlines) {
    var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr; // 选择相应的正则表达式
    // 使用正则表达式匹配属性值中的 HTML实体编码, 并替换为对应的字符
    return value.replace(re, function (match) { return decodingMap[match]; })
  }

  function parseHTML (html, options) {
    var stack = []; // 标签栈 (用于跟踪未闭合的标签)
    var expectHTML = options.expectHTML;
    var isUnaryTag$$1 = options.isUnaryTag || no;
    var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
    var index = 0; // 当前解析的HTML字符串的位置
    var last, lastTag; // 上一次解析的HTML片段和标签
    while (html) { // 不断截取、处理模板字符
      last = html; // 保存当前的 HTML片段

      if (!lastTag || !isPlainTextElement(lastTag)) { // 处理非script, style, textarea标签 (isPlainTextElement: 特殊标签, 可以包含任何内容)
        var textEnd = html.indexOf('<');
        /* 以 '<' 开头, 则为标签 (可能为注释节点、文档声明节点以及开始结束标签) */
        if (textEnd === 0) {

          /* 1. 匹配到注释节点 */
          if (comment.test(html)) {
            var commentEnd = html.indexOf('-->'); // 判断注释节点的结束标签是否存在

            if (commentEnd >= 0) {
              if (options.shouldKeepComment) { // 判断是否保留注释节点
                options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
              }
              advance(commentEnd + 3); // 删除注释节点
              continue
            }
          }

          /* 2. 匹配到条件注释节点 */
          if (conditionalComment.test(html)) {
            var conditionalEnd = html.indexOf(']>'); // 判断条件注释节点的结束标签是否存在

            if (conditionalEnd >= 0) {
              advance(conditionalEnd + 2); // 删除条件注释节点
              continue
            }
          }

          /* 3. 匹配到文档类型声明节点 */
          var doctypeMatch = html.match(doctype);
          if (doctypeMatch) {
            advance(doctypeMatch[0].length); // 删除文档类型声明节点
            continue
          }

          /* 4. 匹配到结束标签 */
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            var curIndex = index;
            advance(endTagMatch[0].length);
            parseEndTag(endTagMatch[1], curIndex, index);
            continue
          }

          /* 5. 匹配到开始标签 */
          var startTagMatch = parseStartTag();
          if (startTagMatch) {
            handleStartTag(startTagMatch);
            // 如果应该忽略第一个换行符, 则前进1步
            if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
              advance(1);
            }
            continue
          }
        }

        /* 文本 */
        var text = (void 0), rest = (void 0), next = (void 0);
        if (textEnd >= 0) { // 大于等于 0, 说明存在文本节点
          rest = html.slice(textEnd); // 获取剩余未处理的字符串
          while (
            !endTag.test(rest) && // 不是结束标签
            !startTagOpen.test(rest) && // 不是开始标签
            !comment.test(rest) && // 不是注释
            !conditionalComment.test(rest) // 不是条件注释
          ) { // 循环直到找到下一个标签, 注释或条件注释
            next = rest.indexOf('<', 1); // 查找下一个 <
            if (next < 0) { break } // 如果找不到下一个 <, 结束循环
            textEnd += next; // 更新文本结束位置
            rest = html.slice(textEnd); // 更新剩余字符串
          }
          text = html.substring(0, textEnd); // 截取文本节点内容
        }

        if (textEnd < 0) { // 如果没有找到 <, 说明模板解析完毕
          text = html; // 将整个字符串作为文本节点
        }

        if (text) { // 如果存在文本节点
          advance(text.length); // 删除已处理的文本内容
        }

        if (options.chars && text) { // 处理文本节点
          options.chars(text, index - text.length, index);
        }
      } else { // 处理特殊标签内的文本节点
        var endTagLength = 0; // 结束标签的长度
        var stackedTag = lastTag.toLowerCase(); // 标签名 (小写)
        // 用于匹配特定标签的正则表达式 (如: </tagname>)
        var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
        var rest$1 = html.replace(reStackedTag, function (all, text, endTag) { // 通过正则替换匹配到的结束标签, 对文本进行处理
          endTagLength = endTag.length; // 记录结束标签的长度
          if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {// 如果不是普通文本标签, 且不是 noscript标签
            text = text // 去除注释和 CDATA标记
              .replace(/<!\--([\s\S]*?)-->/g, '$1')
              .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
          }
          if (shouldIgnoreFirstNewline(stackedTag, text)) { // 如果文本以换行符开头, 则去掉第一个字符
            text = text.slice(1);
          }
          if (options.chars) { // 处理文本节点
            options.chars(text);
          }
          return '' // 返回空字符串, 表示替换为文本节点的内容已处理
        });
        index += html.length - rest$1.length; // 更新 index和 html, 去掉处理过的内容
        html = rest$1;
        parseEndTag(stackedTag, index - endTagLength, index); // 解析结束标签
      }

      if (html === last) { // 如果循环结束时 html和 last相等, 表示已经处理完整个 HTML字符串
        options.chars && options.chars(html);
        if (!stack.length && options.warn) { // 如果此时栈为空, 则发出警告, 指示可能存在格式错误的标签
          options.warn(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
        }
        break
      }
    }

    parseEndTag(); // 确保栈中没有剩余的未闭合标签

    /**
     * 前进模板字符串(删除字符串)
     * @param {Number} n - 前进的步数
     */
    function advance (n) {
      index += n;
      html = html.substring(n); // 前进字符串 (截取字符串)
    }

    /**
     * 解析开始标签
     * @returns {Object} 开始标签的信息
     */
    function parseStartTag () {
      var start = html.match(startTagOpen); // 匹配开始标签的正则
      if (start) { // 如果匹配到开始标签
        var match = {
          tagName: start[1], // 标签名
          attrs: [], // 属性
          start: index // 标签的开始位置
        };
        advance(start[0].length); // 删除开始标签的开始( <div )
        var end, attr;
        // 如果不是开始标签的闭合符 就一直遍历取出标签属性
        while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
          attr.start = index; // 属性的开始位置
          advance(attr[0].length); // 删除属性
          attr.end = index; // 属性的结束位置
          match.attrs.push(attr); // 将属性进行存储
        }
        if (end) {
          match.unarySlash = end[1]; // 是否为一元标签
          advance(end[0].length); // 删除开始标签的闭合符( > )
          match.end = index; // 开始标签的闭合符位置
          return match
        }
      }
    }

    /**
     * 处理开始标签
     * @param {Object} match - 开始标签相关信息
     */
    function handleStartTag (match) {
      var tagName = match.tagName; // 标签名
      var unarySlash = match.unarySlash; // 是否为一元标签

      if (expectHTML) { // 如果当前期望的 HTML结构是文本流式
        /* 如果上一个标签是 <p>并且当前标签是不可置于 <p>内的非语义标签, 闭合上一个 <p>标签 */
        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
          parseEndTag(lastTag);
        }
        /* 如果当前标签可以自动闭合并且与上一个标签相同, 则闭合上一个同名标签 */
        if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
          parseEndTag(tagName);
        }
      }

      var unary = isUnaryTag$$1(tagName) || !!unarySlash; // 判断是否为一元标签

      var l = match.attrs.length;
      var attrs = new Array(l); // 创建一个属性数组
      for (var i = 0; i < l; i++) {
        var args = match.attrs[i];
        var value = args[3] || args[4] || args[5] || ''; // 获取属性值
        var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' // 根据标签不同, 设置是否需要解码换行符
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines;
        attrs[i] = { // 解析属性值, 并保存到属性数组中
          name: args[1], // 属性名
          value: decodeAttr(value, shouldDecodeNewlines) // 解码属性值
        };
        if (options.outputSourceRange) { // 如果需要输出源码范围, 则记录属性的开始和结束位置
          attrs[i].start = args.start + args[0].match(/^\s*/).length;
          attrs[i].end = args.end;
        }
      }

      if (!unary) { // 一元标签不压入栈中, 其余标签压入栈中等待匹配闭合标签
        stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
        lastTag = tagName; // 更新上一个标签为当前标签
      }

      if (options.start) { // 调用开始标签处理函数, 通知解析器遇到开始标签
        options.start(tagName, attrs, unary, match.start, match.end);
      }
    }

    /**
     * 解析闭合标签
     * @param {String} tagName - 标签名
     * @param {Number} start - 闭合标签的开始位置
     * @param {Number} end - 闭合标签的结束位置
     */
    function parseEndTag (tagName, start, end) {
      var pos, lowerCasedTagName;
      if (start == null) { start = index; } //  设置默认的开始和结束位置为当前索引位置
      if (end == null) { end = index; }

      if (tagName) { // 找到栈中第一个和当前闭合标签匹配的元素的位置下标
        lowerCasedTagName = tagName.toLowerCase();
        for (pos = stack.length - 1; pos >= 0; pos--) { // 在栈中从后往前查找与当前闭合标签匹配的元素
          if (stack[pos].lowerCasedTag === lowerCasedTagName) {
            break
          }
        }
      } else { // 如果不存在标签名, 默认将 pos设为 0
        pos = 0;
      }

      if (pos >= 0) { // 如果找到了匹配的开始标签
        for (var i = stack.length - 1; i >= pos; i--) { // 闭合栈中从当前标签到栈顶的所有标签
          if (i > pos || !tagName &&
            options.warn
          ) { // 如果当前标签不是与之对应的闭合标签, 则发出警告
            options.warn(
              ("tag <" + (stack[i].tag) + "> has no matching end tag."),
              { start: stack[i].start, end: stack[i].end }
            );
          }
          if (options.end) { // 调用结束标签处理函数
            options.end(stack[i].tag, start, end);
          }
        }

        stack.length = pos; // 将与闭合标签对应的开始标签从栈中移除
        lastTag = pos && stack[pos - 1].tag; // 更新 lastTag为栈中倒数第二个元素的标签名

      // 对p标签、br标签特殊处理, 因为浏览器会将</P>解析为<p></p>, 将</br>解析为<br>
      } else if (lowerCasedTagName === 'br') { // 对 br标签特殊处理, 进行开始标签处理
        if (options.start) { // 直接调用开始标签处理函数
          options.start(tagName, [], true, start, end);
        }
      } else if (lowerCasedTagName === 'p') { // 对 p标签特殊处理, 进行闭合标签处理
        if (options.start) { // 直接调用开始标签处理函数
          options.start(tagName, [], false, start, end);
        }
        if (options.end) { // 然后调用结束标签处理函数
          options.end(tagName, start, end);
        }
      }
    }
  }

  var onRE = /^@|^v-on:/; // 判断是否是使用 @ 或 v-on: 绑定事件 ('v-on:' 以及语法糖 '@'; 注意: v-on="{}" 的多事件绑定不会匹配)
  var dirRE = /^v-|^@|^:|^#/; // 判断是否是指令 (以 'v-', '@', ':', '#' 开头的属性)
  var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/; // 用于匹配 v-for 表达式的别名和循环对象
  var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/; // 匹配 v-for 指令中的迭代器部分
  var stripParensRE = /^\(|\)$/g; // 用于去除字符串开头和结尾的括号
  var dynamicArgRE = /^\[.*\]$/; // 判断是否是动态参数 ('[]'包裹的参数)

  var argRE = /:(.*)$/; // 匹配以冒号开头的字符串, 并捕获冒号后的所有字符
  var bindRE = /^:|^\.|^v-bind:/; // 判断是否是动态绑定指令 ('v-bind:'以及语法糖':')
  var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g; // 匹配修饰符

  var slotRE = /^v-slot(:|$)|^#/; // 判断是不是插槽 ('v-slot:'以及语法糖'#')

  var lineBreakRE = /[\r\n]/; // 用于匹配回车符 (\r)和换行符 (\n)
  var whitespaceRE$1 = /[ \f\t\r\n]+/g; // 用于匹配空白字符, 包括空格 (' '), 换页符 (\f), 制表符 (\t), 回车符 (\r), 换行符 (\n)

  var invalidAttributeRE = /[\s"'<>\/=]/; // 用于匹配无效的属性字符, 包括空格 (\s), 单引号 ('), 双引号 ("), 小于号 (<), 大于号 (>), 斜杠 (/), 等号 (=)

  var decodeHTMLCached = cached(he.decode); // 用于解码 HTML实体的函数 (如 &amp; &lt; &gt; 等解码为对应的字符)

  var emptySlotScopeToken = "_empty_"; // 表示一个空的插槽作用域

  var warn$2; // 用于警告的函数
  var delimiters; // 模板中的插值分隔符 (例: {{ }})
  var transforms; // 转换器数组, 在编译模板之前对 AST进行转换
  var preTransforms; // 预转换器数组, 在编译模板之前对 AST进行预转换
  var postTransforms; // 后转换器数组, 在编译模板之后对 AST进行转换
  var platformIsPreTag; // 用于检查标签是否为原生的 pre标签
  var platformMustUseProp; // 用于检查标签上的属性是否必须作为属性绑定来使用
  var platformGetTagNamespace; // 用于获取标签的命名空间
  var maybeComponent; // 用于检查是否是组件
  /**
   * 创建 AST节点对象
   * @param {String} tag - 元素标签名
   * @param {Array} attrs - 属性列表
   * @param {Object} parent - 父级 AST节点对象
   * @returns {Object}
   */
  function createASTElement (
    tag,
    attrs,
    parent
  ) {
    return {
      type: 1, // 元素节点
      tag: tag, // 标签名
      attrsList: attrs, // 属性列表
      attrsMap: makeAttrsMap(attrs), // 创建属性名和属性值的映射对象
      rawAttrsMap: {}, // 原始属性名和属性值的映射对象
      parent: parent, // 父级 AST节点对象
      children: [] // 子节点
    }
  }

  /**
   * 将HTML字符串转换为 AST 抽象语法树
   * @param {String} template - HTML模板字符串
   * @param {Object} options - 选项对象 (包含编译器的配置)
   * @returns {Object}
   */
  function parse (
    template,
    options
  ) {
    warn$2 = options.warn || baseWarn; // 警告函数

    platformIsPreTag = options.isPreTag || no; // 判断是否为 <pre> 标签的函数
    platformMustUseProp = options.mustUseProp || no; // 判断是否必须使用 prop的函数
    platformGetTagNamespace = options.getTagNamespace || no; // 获取标签命名空间的函数
    var isReservedTag = options.isReservedTag || no; // 判断是否为保留标签的函数
    maybeComponent = function (el) { return !!( // 判断元素是否可能是组件
      el.component || // 元素有 component属性
      el.attrsMap[':is'] || // 或元素有 :is属性
      el.attrsMap['v-bind:is'] || // 或元素有 v-bind:is属性
      !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag)) // 或元素没有 is属性, 则判断其标签名是否是保留标签
    ); };
    transforms = pluckModuleFunction(options.modules, 'transformNode'); // 节点转换的钩子函数 (pluckModuleFunction: 从模块数组中提取特定键名对应的函数)
    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode'); // 节点预转换的钩子函数 TODO
    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode'); // 节点后转换的钩子函数

    delimiters = options.delimiters; // 获取插值表达式的分隔符

    var stack = []; // 用于管理解析过程中的元素栈
    var preserveWhitespace = options.preserveWhitespace !== false; // 是否保留空白字符 (默认为 true)
    var whitespaceOption = options.whitespace; // 空白字符选项 (用于指定处理空白字符的方式)
    var root; // 根节点
    var currentParent; // 当前父级元素
    var inVPre = false; // 是否在 v-pre 环境中
    var inPre = false;  // 是否在 <pre> 标签中
    var warned = false; // 是否已经发出警告

    /**
     * 触发警告函数, 确保只会警告一次
     * @param {String} msg - 警告消息
     * @param {Object} range - 警告消息的范围
     */
    function warnOnce (msg, range) {
      if (!warned) {
        warned = true;
        warn$2(msg, range); // 触发警告
      }
    }

    /**
     * 关闭一个元素节点
     * @param {Object} element - 要关闭的元素节点
     */
    function closeElement (element) {
      trimEndingWhitespace(element); // 去除元素末尾的空白文本节点
      if (!inVPre && !element.processed) { // 如果不在 v-pre环境下且元素尚未被处理过, 则处理该元素
        element = processElement(element, options);
      }
      if (!stack.length && element !== root) { // 树的管理
        if (root.if && (element.elseif || element.else)) { // 允许带有 v-if, v-else-if, v-else的根元素
          {
            checkRootConstraints(element);
          }
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else { // 提示只能包含一个根元素, 或使用 v-else-if 进行链接
          warnOnce(
            "Component template should contain exactly one root element. " +
            "If you are using v-if on multiple elements, " +
            "use v-else-if to chain them instead.",
            { start: element.start }
          );
        }
      }
      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent); // 保存 v-else-if, v-else 指令的信息到对应的 v-if 指令的节点中
        } else {
          if (element.slotScope) { // 如果元素是具有作用域的插槽, 则将它添加到当前父元素的作用域插槽中
            var name = element.slotTarget || '"default"'
            ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
          }
          currentParent.children.push(element); // 将元素添加到当前父元素的 children中
          element.parent = currentParent; // 设置元素的父元素
        }
      }

      element.children = element.children.filter(function (c) { // 最终的 children清理, 过滤掉作用域插槽
        return !(c).slotScope;
      });
      trimEndingWhitespace(element); // 再次去除元素末尾的空白文本节点

      /* 检查 pre状态 */
      if (element.pre) {
        inVPre = false;
      }
      if (platformIsPreTag(element.tag)) {
        inPre = false;
      }
      for (var i = 0; i < postTransforms.length; i++) { // 执行后置转换
        postTransforms[i](element, options);
      }
    }

    /**
     * 去除元素末尾的空白文本节点
     * @param {Object} el - 要检查的元素节点
     */
    function trimEndingWhitespace (el) {
      if (!inPre) { // 如果不在 <pre>标签内部, 则去除末尾的空白文本节点
        var lastNode;
        while (
          (lastNode = el.children[el.children.length - 1]) && // 获取末尾的子节点
          lastNode.type === 3 && // 如果是文本节点
          lastNode.text === ' ' // 且文本内容是单个空格
        ) {
          el.children.pop(); // 移除末尾的空白文本节点
        }
      }
    }

    /**
     * 检查组件根元素的约束条件
     * @param {Object} el - 要检查的元素节点
     */
    function checkRootConstraints (el) {
      if (el.tag === 'slot' || el.tag === 'template') { // 如果根元素是 <slot> 或 <template>, 发出警告, 因为它们可能包含多个节点
        warnOnce(
          "Cannot use <" + (el.tag) + "> as component root element because it may " +
          'contain multiple nodes.',
          { start: el.start }
        );
      }
      if (el.attrsMap.hasOwnProperty('v-for')) { // 如果根元素使用了 v-for指令, 发出警告, 因为它渲染多个元素
        warnOnce(
          'Cannot use v-for on stateful component root element because ' +
          'it renders multiple elements.',
          el.rawAttrsMap['v-for']
        );
      }
    }

    parseHTML(template, { // 解析 HTML 模板
      warn: warn$2, // 给出警告的函数
      expectHTML: options.expectHTML, // 是否期望 HTML (用于判断是否在特定环境下, 如在一个 table标签内处理特定的元素)
      isUnaryTag: options.isUnaryTag, // 判断标签是否是自闭合的
      canBeLeftOpenTag: options.canBeLeftOpenTag, // 判断标签是否可以不闭合
      shouldDecodeNewlines: options.shouldDecodeNewlines, // 是否应该解码换行符
      shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,  // 是否应该解码 href属性中的换行符
      shouldKeepComment: options.comments, // 是否应该保留注释
      outputSourceRange: options.outputSourceRange, // 是否输出源码范围
      /**
       * 开始处理元素标签, 创建 AST 节点对象并对其进行预处理
       * @param {String} tag - 元素的标签名
       * @param {Array<Object>} attrs - 元素的属性数组
       * @param {Boolean} unary - 元素是否是自闭合的
       * @param {Number} start$1 - 元素的起始位置
       * @param {Number} end - 元素的结束位置
       */
      start: function start (tag, attrs, unary, start$1, end) {
        var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag); // 检查命名空间，并继承父级的命名空间

        if (isIE && ns === 'svg')  {// 处理 IE浏览器中的 SVG bug
          attrs = guardIESVGBug(attrs); // 移除 XML 命名空间前缀
        }

        var element = createASTElement(tag, attrs, currentParent); // 创建 AST节点对象
        if (ns) {
          element.ns = ns; // 设置命名空间
        }

        {
          if (options.outputSourceRange) { // 如果启用了源码范围输出
            element.start = start$1; // 设置起始位置
            element.end = end; // 设置结束位置
            element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) { // 创建属性名到属性对象的映射
              cumulated[attr.name] = attr;
              return cumulated
            }, {});
          }
          attrs.forEach(function (attr) { // 属性名合法性校验
            if (invalidAttributeRE.test(attr.name)) {
              warn$2(
                "Invalid dynamic argument expression: attribute names cannot contain " +
                "spaces, quotes, <, >, / or =.",
                {
                  start: attr.start + attr.name.indexOf("["),
                  end: attr.start + attr.name.length
                }
              );
            }
          });
        }

        if (isForbiddenTag(element) && !isServerRendering()) { // 如果是被禁止的标签而且非服务端渲染, 则为元素增加禁止的标识
          element.forbidden = true;
          warn$2(
            'Templates should only be responsible for mapping the state to the ' +
            'UI. Avoid placing tags with side-effects in your templates, such as ' +
            "<" + tag + ">" + ', as they will not be parsed.',
            { start: element.start }
          );
        }

        for (var i = 0; i < preTransforms.length; i++) { // 执行预转换操作
          element = preTransforms[i](element, options) || element;
        }

        if (!inVPre) { // 如果不在 v-pre环境中
          processPre(element); // 处理 v-pre指令
          if (element.pre) {
            inVPre = true;
          }
        }
        if (platformIsPreTag(element.tag)) { // 判断是否是 <pre>标签, 设置标识
          inPre = true;
        }
        if (inVPre) { // 当存在 v-pre属性, 元素及其子元素不会被编译, 处理原生属性
          processRawAttrs(element);
        } else if (!element.processed) { // 处理 v-for, v-if, v-once 等指令
          processFor(element);
          processIf(element);
          processOnce(element);
        }

        if (!root) { // 将第一个处理的元素设置为根节点
          root = element;
          {
            checkRootConstraints(root);
          }
        }

        if (!unary) { // 非自闭和标签
          currentParent = element;
          stack.push(element); // 将元素压入栈中
        } else { // 自闭合标签, 直接关闭
          closeElement(element);
        }
      },

      /**
     * 处理元素结束标签, 结束当前元素的处理
     * @param {String} tag - 元素的标签名
     * @param {Number} start - 元素的起始位置
     * @param {Number} end$1 - 元素的结束位置
     */
      end: function end (tag, start, end$1) {
        var element = stack[stack.length - 1]; // 获取当前处理的元素
        stack.length -= 1; // 弹出堆栈, 表示当前元素处理结束
        currentParent = stack[stack.length - 1];
        if (options.outputSourceRange) { // 如果启用了源码范围输出
          element.end = end$1; // 设置元素结束位置
        }
        closeElement(element); // 处理元素的闭合
      },

      /**
       * 对文本的节点处理
       */
      chars: function chars (text, start, end) {
        if (!currentParent) { // 当前不存在父节点, 则表示当前文本节点为组件的根节点, 报错
          {
            if (text === template) { // 如果文本内容与模板相同, 报错: 组件模板需要一个根元素, 而不是文本
              warnOnce(
                'Component template requires a root element, rather than just text.',
                { start: start }
              );
            } else if ((text = text.trim())) { // 如果文本内容存在且去除空格后不为空, 则报错: 组件只能有一个根元素, 且不能为文本
              warnOnce(
                ("text \"" + text + "\" outside root element will be ignored."),
                { start: start }
              );
            }
          }
          return
        }

        if (isIE &&
          currentParent.tag === 'textarea' &&
          currentParent.attrsMap.placeholder === text
        ) { // 处理 IE浏览器的 textarea的 placeholder bug
          return
        }
        var children = currentParent.children; // 获取当前父节点的子节点数组
        if (inPre || text.trim()) { // 如果当前正在处理 <pre>标签内的内容, 或文本内容去除空格后不为空
          text = isTextTag(currentParent) ? text : decodeHTMLCached(text); // 如果当前父节点为纯文本标签, 则不需要对文本内容进行 HTML解码, 否则需要解码
        } else if (!children.length) { // 如果当前父节点没有子节点, 则去除首尾空格后的文本为空
          text = '';
        } else if (whitespaceOption) { // 如果设置了空白选项
          if (whitespaceOption === 'condense') { // 在压缩模式下, 如果文本内容包含换行符, 则去除文本内容
            text = lineBreakRE.test(text) ? '' : ' ';
          } else { // 否则, 将文本内容替换为单个空格
            text = ' ';
          }
        } else { // 如果没有设置空白选项, 则根据是否保留空白来决定是否添加空格
          text = preserveWhitespace ? ' ' : '';
        }
        if (text) { // 如果文本内容不为空
          if (!inPre && whitespaceOption === 'condense') { // 如果不在 <pre>标签内, 且为压缩模式
            text = text.replace(whitespaceRE$1, ' '); // 将连续的空白字符替换为单个空格
          }
          var res;
          var child;
          /**
           * type: 文本类型(2为含有表达式, 3为纯文本)
           * expression ? : 表达式
           * tokens  ? : 令牌
           * text: 文本内容
           */
          if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) { // 如果当前不在 <v-pre>标签内, 且文本内容不是单个空格, 且文本内容可以解析出表达式
            child = { // 创建一个包含表达式的文本节点
              type: 2,
              expression: res.expression,
              tokens: res.tokens,
              text: text
            };
          } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') { // 如果文本内容不是单个空格, 或当前没有子节点, 或最后一个子节点不是空格文本节点
            child = { // 创建一个纯文本节点
              type: 3,
              text: text
            };
          }
          if (child) { // 将新创建的节点添加到父节点的 children数组中
            if (options.outputSourceRange) {
              child.start = start;
              child.end = end;
            }
            children.push(child);
          }
        }
      },

      /**
       * 添加注释节点到抽象语法树 (AST) 中
       * @param {String} text - 注释文本
       * @param {Number} start - 注释在源码中的起始位置
       * @param {Number} end - 注释在源码中的结束位置
       */
      comment: function comment (text, start, end) {
        if (currentParent) { // 如果当前存在父节点, 则可以添加注释节点
          var child = { // 创建一个注释节点对象
            type: 3, // 节点类型为注释节点
            text: text,
            isComment: true
          };
          if (options.outputSourceRange) { // 如果需要输出源码范围信息, 则保存注释节点的起始位置和结束位置
            child.start = start;
            child.end = end;
          }
          currentParent.children.push(child);// 将创建的注释节点添加到当前父节点的子节点列表中
        }
      }
    });
    return root
  }

  /**
   * 处理 v-pre指令 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   */
  function processPre (el) {
    if (getAndRemoveAttr(el, 'v-pre') != null) { // 判断是否使用v-pre指令 (getAndRemoveAttr: 获取属性后删除属性)
      el.pre = true; // 标记使用了v-pre
    }
  }

  /**
   * 处理原始属性列表 (将属性值转换为字符存在元素对象的 attrs 数组中)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   */
  function processRawAttrs (el) {
    var list = el.attrsList; // 属性列表
    var len = list.length;
    if (len) {
      var attrs = el.attrs = new Array(len);
      for (var i = 0; i < len; i++) { // 遍历属性列表进行处理
        attrs[i] = { // 将属性处理后存储
          name: list[i].name,
          value: JSON.stringify(list[i].value) // 将属性值转化为字符
        };
        if (list[i].start != null) { // 存储属性的范围
          attrs[i].start = list[i].start;
          attrs[i].end = list[i].end;
        }
      }
    } else if (!el.pre) { // 对于在 pre 块中没有属性的非根节点, 将其标记为纯节点
      el.plain = true;
    }
  }

  /**
   * 处理元素节点 (包括处理 key 属性、 ref、插槽内容、插槽出口、组件，以及处理属性列表)
   * @param {Object} element  - AST 节点对象 (包含有关节点的信息)
   * @param {Object} options - 选项对象
   * @returns {Object}
   */
  function processElement (
    element,
    options
  ) {
    processKey(element); // 处理元素的 key 属性

    element.plain = ( // 确定在移除结构属性后, 此节点是否是纯节点
      !element.key &&
      !element.scopedSlots &&
      !element.attrsList.length
    );

    processRef(element); // 处理 ref 属性
    processSlotContent(element); // 处理作为插槽传递给组件的内容
    processSlotOutlet(element); // 处理 slot标签
    processComponent(element); // 处理组件特有属性并设置标记
    for (var i = 0; i < transforms.length; i++) { // 节点转换函数, 并遍历处理属性列表
      element = transforms[i](element, options) || element;
    }
    processAttrs(element); // 处理元素的属性(指令/事件/属性)列表
    return element
  }

  /**
   * 处理元素的 key 属性 (保存相关信息到 AST 节点对象上以及对错误使用的警告)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   */
  function processKey (el) {
    var exp = getBindingAttr(el, 'key'); // 获取元素 key 属性的值并删除属性
    if (exp) {
      {
        if (el.tag === 'template') { // 如果是 <template> 标签, 则发出警告, <template> 不能被添加 key 属性
          warn$2(
            "<template> cannot be keyed. Place the key on real elements instead.",
            getRawBindingAttr(el, 'key') // 获取 key 属性的原始绑定属性值
          );
        }
        if (el.for) { // 如果元素有 v-for 指令且父元素为 <transition-group>, 而且 key 属性的属性值为迭代器变量, 则发出警告
          var iterator = el.iterator2 || el.iterator1; // 迭代器变量
          var parent = el.parent;
          if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
            warn$2(
              "Do not use v-for index as key on <transition-group> children, " +
              "this is the same as not using keys.",
              getRawBindingAttr(el, 'key'),
              true
            );
          }
        }
      }
      el.key = exp;
    }
  }

  /**
   * 处理 ref 属性 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   */
  function processRef (el) {
    var ref = getBindingAttr(el, 'ref'); // 获取 ref 属性的值并删除属性
    if (ref) {
      el.ref = ref;
      el.refInFor = checkInFor(el); // 检查当前元素是否在 v-for 指令内
    }
  }

  /**
   * 处理 v-for 指令 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   */
  function processFor (el) {
    var exp;
    if ((exp = getAndRemoveAttr(el, 'v-for'))) { // 获取 v-for 属性的值并删除属性
      var res = parseFor(exp); // 解析 v-for 表达式
      if (res) { // 解析结果存在, 则扩展到元素对象上
        extend(el, res);
      } else { // 否则发出警告, 提示 v-for 表达式无效
        warn$2(
          ("Invalid v-for expression: " + exp),
          el.rawAttrsMap['v-for']
        );
      }
    }
  }

  /**
   * 解析 v-for 表达式
   * @param {String} exp 
   * @returns {Object}
   */
  function parseFor (exp) {
    var inMatch = exp.match(forAliasRE); // 通过正则匹配 v-for 表达式, 得到别名和循环对象
    if (!inMatch) { return }
    var res = {};
    res.for = inMatch[2].trim(); // 循环对象 (例: "(item, index) in list" => "list")
    var alias = inMatch[1].trim().replace(stripParensRE, ''); // 全部别名 (例: "(item, index) in list" => "item, index")
    var iteratorMatch = alias.match(forIteratorRE); // 正则匹配到的迭代器信息
    if (iteratorMatch) {
      res.alias = alias.replace(forIteratorRE, '').trim(); // 别名 (例: "(item, index) in list" => "item")
      res.iterator1 = iteratorMatch[1].trim(); // 迭代器1 (例: "(item, index) in list" => "index")
      if (iteratorMatch[2]) { // 迭代器2 (例: "(item, index, key) in list" => "key")
        res.iterator2 = iteratorMatch[2].trim();
      }
    } else {
      res.alias = alias; // 别名 (例: "item in list" => "item")
    }
    return res
  }

  /**
   * 处理 v-if, v-else-if, v-else 指令 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   */
  function processIf (el) {
    var exp = getAndRemoveAttr(el, 'v-if'); // 获取 v-if 属性的值并删除属性
    if (exp) { // 如果存在 v-if 属性, 则添加到元素的条件块集合中
      el.if = exp;
      addIfCondition(el, { // 将当前元素作为一个 v-if 语句条件块添加到元素的条件块集合中
        exp: exp,
        block: el
      });
    } else { // 如果没有 v-if 属性, 则检查是否存在 v-else-if, v-else 属性
      if (getAndRemoveAttr(el, 'v-else') != null) { // 判断是否使用 v-else 指令并删除属性
        el.else = true;
      }
      var elseif = getAndRemoveAttr(el, 'v-else-if'); // 判断是否使用 v-else-if 指令并删除属性
      if (elseif) {
        el.elseif = elseif;
      }
    }
  }

  /**
   * 保存 v-else-if, v-else 指令的信息到对应的 v-if 指令的节点中
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} parent - 父级的 AST 节点对象
   */
  function processIfConditions (el, parent) {
    var prev = findPrevElement(parent.children); // 查找当前节点同级的上一个元素节点
    if (prev && prev.if) { // 如果上一个节点存在且具有 v-if 指令, 则将当前节点作为一个 v-else-if 语句条件块添加到节点的条件块集合中
      addIfCondition(prev, {
        exp: el.elseif, // v-else-if 的条件表达式 (v-else 的表达式为 undefined)
        block: el
      });
    } else { // 否则警告当前节点的 v-else-if/v-else 指令未找到对应的 v-if 指令
      warn$2(
        "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
        "used on element <" + (el.tag) + "> without corresponding v-if.",
        el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
      );
    }
  }

  /**
   * 在给定的 AST 节点数组中查找上一个元素节点
   * @param {Array} children - AST 节点数组
   * @returns {Object}
   * 
   * 1. 为何不传当前节点就可以查找到他的上一个节点 ? 
   * 因为当前节点还没处理结束, 还未放到 AST 节点数组中, 所以数组从末尾向前查找即可
   */
  function findPrevElement (children) {
    var i = children.length;
    while (i--) { // 从数组末尾向前遍历
      if (children[i].type === 1) { // 如果当前为元素节点, 则返回该节点
        return children[i]
      } else { // 如果当前为文本节点但内容不为空, 则发出警告并移出子节点数组
        if (children[i].text !== ' ') {
          warn$2( // 条件块 v-if, v-else(-if) 中间的文本将会被忽略
            "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
            "will be ignored.",
            children[i]
          );
        }
        children.pop(); // 将文本节点移除子节点数组
      }
    }
  }

  /**
   * 向元素的 条件块集合/ifConditions 中添加条件块
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} condition - 条件块对象 (包含表达式和对应的元素块)
   */
  function addIfCondition (el, condition) {
    if (!el.ifConditions) { // 如果元素不存在 ifConditions 数组, 则进行初始化
      el.ifConditions = [];
    }
    el.ifConditions.push(condition); // 将条件块存到数组中
  }

  /**
   * 处理 V-once 指令 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   */
  function processOnce (el) {
    var once$$1 = getAndRemoveAttr(el, 'v-once'); // 获取 v-once 属性的值并删除属性
    if (once$$1 != null) { // 存在, 则标记该元素使用了 v-once
      el.once = true;
    }
  }

  /**
   * 处理作为插槽传递给组件的内容 TODO
   * 例如：<template slot="xxx">, <div slot-scope="xxx">
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   */
  function processSlotContent (el) {
    var slotScope;
    if (el.tag === 'template') { // 节点是 template 标签的情况
      slotScope = getAndRemoveAttr(el, 'scope'); // 获取并删除 scope 属性
      if (slotScope) { // 作用域插槽的 scope 属性已经废弃, 使用则抛出警告
        warn$2(
          "the \"scope\" attribute for scoped slots have been deprecated and " +
          "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
          "can also be used on plain elements in addition to <template> to " +
          "denote scoped slots.",
          el.rawAttrsMap['scope'], // 获取'scope'属性
          true
        );
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope'); // 获取并保存 slot-scope 属性后删除属性
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) { // slot-scope 属性已废弃, 推荐2.6.0新增的 v-slot
      if (el.attrsMap['v-for']) { // 使用 slot-scope 属性同时使用 v-for 指令, 则控制台抛出警告
        warn$2(
          "Ambiguous combined usage of slot-scope and v-for on <" + (el.tag) + "> " +
          "(v-for takes higher priority). Use a wrapper <template> for the " +
          "scoped slot to make it clearer.",
          el.rawAttrsMap['slot-scope'], // 获取'slot-scope'属性
          true
        );
      }
      el.slotScope = slotScope; // 保存 slot-scope 属性
    }

    var slotTarget = getBindingAttr(el, 'slot'); // 获取 slot 属性并删除属性
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget; // 插槽名称
      el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']); // 是否是动态名
      if (el.tag !== 'template' && !el.slotScope) { // 将 slot 属性作为原生 Shadow DOM 兼容的属性保留下来 (仅针对非作用域插槽的元素)
        addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot')); // 向元素添加属性 (获取 slot 属性的原始绑定属性值)
      }
    }
    
    { // 2.6 v-slot 语法
      if (el.tag === 'template') { // 节点是 template 标签的情况, 处理 v-slot
        var slotBinding = getAndRemoveAttrByRegex(el, slotRE); // 从节点的 属性数组/attrsList 中删除 v-slot/# 属性
        if (slotBinding) {
          {
            if (el.slotTarget || el.slotScope) { // 如果同时使用了其他插槽语法(slot/scope-slot), 则发出警告
              warn$2(
                "Unexpected mixed usage of different slot syntaxes.",
                el
              );
            }
            if (el.parent && !maybeComponent(el.parent)) { // 如果父元素不是组件, 则发出警告
              warn$2(
                "<template v-slot> can only appear at the root level inside " +
                "the receiving component",
                el
              );
            }
          }
          var ref = getSlotName(slotBinding); // 获取插槽名称 (return {dynamic: 是否是动态名称, name: 插槽名称})
          var name = ref.name;
          var dynamic = ref.dynamic;
          el.slotTarget = name; // 插槽名称
          el.slotTargetDynamic = dynamic; // 是否是动态名
          el.slotScope = slotBinding.value || emptySlotScopeToken; // 强制将其设置为作用域插槽, 以提高性能
        }
      } else { // 对于组件, 处理 v-slot (表示默认插槽, 将组件的子节点添加到默认插槽中进行处理)
        var slotBinding$1 = getAndRemoveAttrByRegex(el, slotRE); // 从节点的 属性数组/attrsList 中删除 v-slot/# 属性
        if (slotBinding$1) {
          {
            if (!maybeComponent(el)) { // 如果不是组件, 则发出警告
              warn$2(
                "v-slot can only be used on components or <template>.",
                slotBinding$1
              );
            }
            if (el.slotScope || el.slotTarget) { // 如果同时使用了其他插槽语法, 则发出警告
              warn$2(
                "Unexpected mixed usage of different slot syntaxes.",
                el
              );
            }
            if (el.scopedSlots) { // 如果存在命名插槽, 则发出警告
              warn$2(
                "To avoid scope ambiguity, the default slot should also use " +
                "<template> syntax when there are other named slots.",
                slotBinding$1
              );
            }
          }
          // add the component's children to its default slot
          var slots = el.scopedSlots || (el.scopedSlots = {});
          var ref$1 = getSlotName(slotBinding$1); // 获取插槽名称 (返回值: {dynamic: 是否是动态名称, name: 插槽名称})
          var name$1 = ref$1.name; // 插槽名称
          var dynamic$1 = ref$1.dynamic; // 是否是动态名称
          var slotContainer = slots[name$1] = createASTElement('template', [], el); // 创建一个默认插槽容器 (createASTElement: 创建 AST节点对象)
          slotContainer.slotTarget = name$1; // 插槽名称
          slotContainer.slotTargetDynamic = dynamic$1; // 是否是动态名称
          slotContainer.children = el.children.filter(function (c) { // 过滤组件的子节点, 将不具有 slotScope 属性的节点添加到默认插槽的子节点中
            if (!c.slotScope) {
              c.parent = slotContainer;
              return true
            }
          });
          slotContainer.slotScope = slotBinding$1.value || emptySlotScopeToken;
          el.children = []; // 将组件的子节点清空, 因为它们现在已经被移动到了默认插槽的子节点中
          el.plain = false;  // 用于表示元素是否是一个纯文本节点或者静态节点, 而不包含任何动态绑定或事件监听器
        }
      }
    }
  }

  /**
   * 获取插槽名称
   * @param {Object} binding - 插槽属性信息
   * @returns {Object} dynamic: 是否是动态名称; name: 插槽名称
   */
  function getSlotName (binding) {
    var name = binding.name.replace(slotRE, ''); // 获取插槽名称
    if (!name) { // 用户未设置插槽名称
      if (binding.name[0] !== '#') { // 使用'v-slot:', 则设置插槽名称为'default'
        name = 'default';
      } else { // 使用'#', 则控制台抛出异常
        warn$2(
          "v-slot shorthand syntax requires a slot name.",
          binding
        );
      }
    }

    return dynamicArgRE.test(name) // 判断是否是动态参数 ('[]'包裹的参数)
      ? { name: name.slice(1, -1), dynamic: true } // 动态名称
      : { name: ("\"" + name + "\""), dynamic: false } // 静态名称
  }

  /**
   * 处理 slot标签
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   */
  function processSlotOutlet (el) {
    if (el.tag === 'slot') { // 处理slot标签
      el.slotName = getBindingAttr(el, 'name'); // 获取slot标签的name属性 (getBindingAttr: 获取动态绑定属性值)
      if (el.key) { // slot标签不能拥有key属性, 控制台抛出警告 (因为slot是抽象出口, 并可能扩展为多个元素)
        warn$2(
          "`key` does not work on <slot> because slots are abstract outlets " +
          "and can possibly expand into multiple elements. " +
          "Use the key on a wrapping element instead.",
          getRawBindingAttr(el, 'key') // 获取元素的原始绑定属性值
        );
      }
    }
  }

  /**
   * 处理组件特有属性并设置标记
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   */
  function processComponent (el) {
    var binding;
    if ((binding = getBindingAttr(el, 'is'))) { // 判断是否使用(is/动态组件渲染)属性 (getAndRemoveAttr: 获取属性后删除属性)
      el.component = binding; // 记录组件原始标签名
    }
    if (getAndRemoveAttr(el, 'inline-template') != null) { // 判断组件是否使用(inline-template/内联模板) (getAndRemoveAttr: 获取属性后删除属性)
      el.inlineTemplate = true; // 标记使用了内联模板
    }
  }

  /**
   * 处理元素的属性(指令/事件/属性)列表 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   */
  function processAttrs (el) {
    var list = el.attrsList; // 获取保存元素属性的对象
    var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
    for (i = 0, l = list.length; i < l; i++) {
      name = rawName = list[i].name;
      value = list[i].value;
      if (dirRE.test(name)) { // 处理指令 (dirRE: 匹配以 'v-', '@', ':', '#' 开头的属性)
        el.hasBindings = true; // 标记为动态绑定的节点

        // name.replace(dirRE, ''): 提取指令和修饰符 (例: 'v-model.number' => 'model.number'; ':id' => 'id')
        // parseModifiers: 将指令的修饰符处理成对象格式 (例: 'model.number.trim' => {number: true, trim: true})
        modifiers = parseModifiers(name.replace(dirRE, ''));
        if (modifiers) { // 将修饰符删除
          name = name.replace(modifierRE, '');
        }
        if (bindRE.test(name)) { // 处理动态绑定指令v-bind (bindRE: 判断是否是使用 :/v-bind: 绑定变量)
          name = name.replace(bindRE, ''); // 提取绑定的参数 (例: 'v-bind:[fullName]' => '[fullName]'; ':id' => 'id')
          value = parseFilters(value); // 解析模板表达式中的过滤器/filters (例: "age | toNumber" => "_f("toNumber")(age)")
          isDynamic = dynamicArgRE.test(name); // 判断是否是动态参数 (使用'[]'包裹的参数)
          if (isDynamic) { // 获取动态参数中的参数 (例: '[fullName]' => 'fullName')
            name = name.slice(1, -1);
          }
          if ( // v-bind表达式的值不能为空, 为空控制台抛出警告
            value.trim().length === 0 // trim: 去除空格
          ) {
            warn$2(
              ("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"")
            );
          }
          if (modifiers) {
            if (modifiers.prop && !isDynamic) { // 处理 .prop 修饰符 (非动态参数的情况下)
              name = camelize(name); // 转换为驼峰命名
              if (name === 'innerHtml') { name = 'innerHTML'; } // 兼容特殊属性名
            }
            if (modifiers.camel && !isDynamic) { // 处理 .camel 修饰符 (非动态参数的情况下)
              name = camelize(name); // 转换为驼峰命名
            }
            if (modifiers.sync) { // 处理 .sync 修饰符
              syncGen = genAssignmentCode(value, "$event"); // 生成 v-model 的值的赋值代码
              if (!isDynamic) { // 非动态参数, 直接添加事件监听器
                addHandler(
                  el,
                  ("update:" + (camelize(name))),
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i]
                );
                if (hyphenate(name) !== camelize(name)) { // 转换为横线命名, 再添加一次监听器
                  addHandler(
                    el,
                    ("update:" + (hyphenate(name))), // 转换为横线命名
                    syncGen,
                    null,
                    false,
                    warn$2,
                    list[i]
                  );
                }
              } else { // 动态参数的情况, 添加动态事件监听器
                addHandler(
                  el,
                  ("\"update:\"+(" + name + ")"),
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i],
                  true // dynamic
                );
              }
            }
          }
          // prop修饰符: 作为一个 DOM property 绑定而不是作为 attribute 绑定
          if ((modifiers && modifiers.prop) || ( // 使用 .prop 修饰符且不是一个组件
            !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name) // platformMustUseProp: 判断是否必须使用prop的函数
          )) {
            addProp(el, name, value, list[i], isDynamic); // 向元素添加属性
          } else {
            addAttr(el, name, value, list[i], isDynamic); // 向元素添加属性绑定
          }
        } else if (onRE.test(name)) { // 处理v-on (onRE: 判断是否是使用 '@'/'v-on:' 绑定事件; 注意: v-on="{}" 的多事件绑定不会匹配)
          name = name.replace(onRE, ''); // 提取绑定的参数 (例: 'v-on:[eventName]' => '[eventName]'; '@click' => 'click')
          isDynamic = dynamicArgRE.test(name); // 检查是否有动态参数
          if (isDynamic) { // 去除动态参数的方括号
            name = name.slice(1, -1);
          }
          addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic); // 添加事件监听器
        } else { // 如果是其他指令 (包括 v-on="{}" 的多事件绑定以及 v-bind="{}" 的多属性绑定)
          name = name.replace(dirRE, ''); // 提取绑定的参数 (移除指令标识符)
          var argMatch = name.match(argRE); // 解析参数
          var arg = argMatch && argMatch[1];
          isDynamic = false;
          if (arg) { // 判断是否有动态参数
            name = name.slice(0, -(arg.length + 1));
            if (dynamicArgRE.test(arg)) {
              arg = arg.slice(1, -1);
              isDynamic = true;
            }
          }
          addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]); // 向元素添加指令
          if (name === 'model') { // 如果是 v-model 指令, 检查 v-model 绑定值的合理性
            checkForAliasModel(el, value);
          }
        }
      } else { // 处理普通属性
        {
          var res = parseText(value, delimiters); // 解析插值表达式
          if (res) { // 属性中使用差值表达式, 发出警告
            warn$2(
              name + "=\"" + value + "\": " +
              'Interpolation inside attributes has been removed. ' +
              'Use v-bind or the colon shorthand instead. For example, ' +
              'instead of <div id="{{ val }}">, use <div :id="val">.',
              list[i]
            );
          }
        }
        addAttr(el, name, JSON.stringify(value), list[i]); // 向元素添加属性
        if (!el.component && // Firefox 不会在元素创建后立即更新 muted 属性的状态, 即使通过属性设置它, 所以在此处再次添加属性
            name === 'muted' &&
            platformMustUseProp(el.tag, el.attrsMap.type, name)) { // platformMustUseProp: 判断是否必须使用prop的函数
          addProp(el, name, 'true', list[i]);
        }
      }
    }
  }

  function checkInFor (el) { // 检查节点的祖先节点是否使用v-for指令
    var parent = el;
    while (parent) {
      if (parent.for !== undefined) { // 是否使用v-for指令
        return true
      }
      parent = parent.parent; // 不断向上寻找父节点
    }
    return false
  }

  /**
   * 将指令的修饰符处理成对象格式
   * 例: 'model.number.trim' => {number: true, trim: true} - (v-model指令为例)
   * @param {String} name - 指令和修饰符组成的字符 (例: 'model.number.trim')
   * @returns {Object}
   */
  function parseModifiers (name) {
    var match = name.match(modifierRE); // 匹配修饰符 ('model.number.trim' => ['.number', '.trim'])
    if (match) { // 指令存在修饰符, 处理为对象格式
      var ret = {};
      match.forEach(function (m) { ret[m.slice(1)] = true; }); // 处理为对象格式 (['.number', '.trim'] => {number: true, trim: true})
      return ret
    }
  }

  /**
   * 创建属性名和属性值的映射对象
   * @param {Array} attrs - 包含属性对象的数组
   * @returns {Object}
   */
  function makeAttrsMap (attrs) {
    var map = {};
    for (var i = 0, l = attrs.length; i < l; i++) { // 遍历数组, 创造映射关系
      if (
        map[attrs[i].name] && !isIE && !isEdge
      ) { // 检查是否存在重复属性名, 并在非 IE/Edge 环境下发出警告
        warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
      }
      map[attrs[i].name] = attrs[i].value; // 将属性名和属性值存储在映射对象中
    }
    return map
  }

  /**
   * 检查元素是否为文本标签 (例: script/style)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   * @returns {Boolean}
   */
  function isTextTag (el) {
    return el.tag === 'script' || el.tag === 'style'
  }

  /**
   * 检查是否为禁止的标签 (主要针对 style/script 标签)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   * @returns {boolean}
   */
  function isForbiddenTag (el) {
    return (
      el.tag === 'style' || // style标签
      (el.tag === 'script' && ( // script 标签 (无 type 类型或 type 类型为 `text/javascript`)
        !el.attrsMap.type ||
        el.attrsMap.type === 'text/javascript'
      ))
    )
  }

  var ieNSBug = /^xmlns:NS\d+/; // 用于匹配 IE 下的 XML 命名空间 bug 的属性名
  var ieNSPrefix = /^NS\d+:/; // 用于匹配 XML 命名空间前缀 (匹配 NS 开头的字符串)
  /**
   * 移除 XML 命名空间前缀 (IE浏览器 SVG bug)
   * @param {Array} attrs - 属性数组
   * @returns {Array}
   */
  function guardIESVGBug (attrs) {
    var res = [];
    for (var i = 0; i < attrs.length; i++) { // 遍历属性
      var attr = attrs[i];
      if (!ieNSBug.test(attr.name)) { // 检查属性名是否匹配IE下的 XML 命名空间bug
        attr.name = attr.name.replace(ieNSPrefix, ''); // 移除XML命名空间前缀
        res.push(attr); // 保存处理后的属性
      }
    }
    return res
  }

  /**
   * 用于检查 v-model 绑定值的合理性
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   * @param {string} value - 绑定的值
   */
  function checkForAliasModel (el, value) {
    var _el = el;
    while (_el) { // 逐级向上遍历父级元素
      if (_el.for && _el.alias === value) { // 父级存在 v-for 指令, 并且迭代别名与绑定的值相同, 抛出警告
        warn$2(
          "<" + (el.tag) + " v-model=\"" + value + "\">: " +
          "You are binding v-model directly to a v-for iteration alias. " +
          "This will not be able to modify the v-for source array because " +
          "writing to the alias is like modifying a function local variable. " +
          "Consider using an array of objects and use v-model on an object property instead.",
          el.rawAttrsMap['v-model']
        );
      }
      _el = _el.parent;
    }
  }

  /**
   * 预处理输入元素节点, 根据 v-model 绑定的值动态设置其类型 TODO
   * @param {Object} el - AST 节点对象 (包含有关节点的信息) 
   * @param {Object} options - 编译选项
   * @returns {Object}
   */
  function preTransformNode (el, options) {
    if (el.tag === 'input') { // 仅处理 input 标签
      var map = el.attrsMap;
      if (!map['v-model']) { // 无 v-model 属性, 则直接返回
        return
      }

      var typeBinding;
      if (map[':type'] || map['v-bind:type']) { // 获取动态绑定的 type 属性值
        typeBinding = getBindingAttr(el, 'type');
      }
      if (!map.type && !typeBinding && map['v-bind']) {
        typeBinding = "(" + (map['v-bind']) + ").type";
      }

      if (typeBinding) {
        // 处理 v-if、v-else-if 和 v-else 指令
        var ifCondition = getAndRemoveAttr(el, 'v-if', true);
        var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
        var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
        var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
        // 1. checkbox
        var branch0 = cloneASTElement(el); // 克隆 AST节点对象, 分别处理不同的类型
        processFor(branch0); // 处理 v-for 指令
        addRawAttr(branch0, 'type', 'checkbox'); // 向元素添加原始属性 type 为 checkbox
        processElement(branch0, options); // 处理元素节点
        branch0.processed = true; // 防止重复处理
        branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
        addIfCondition(branch0, { // 向元素的 条件块集合/ifConditions 中添加条件块
          exp: branch0.if,
          block: branch0
        });
        // 2. add radio else-if condition
        // 处理 radio 类型的分支
        var branch1 = cloneASTElement(el); // 克隆 AST节点对象
        getAndRemoveAttr(branch1, 'v-for', true); //移除 v-for 属性
        addRawAttr(branch1, 'type', 'radio'); // 向元素添加原始属性 type 为 radio
        processElement(branch1, options); // 处理元素节点
        addIfCondition(branch0, { // 向元素的 条件块集合/ifConditions 中添加条件块
          exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
          block: branch1
        });
        // 3. other
        var branch2 = cloneASTElement(el); // 克隆 AST节点对象
        getAndRemoveAttr(branch2, 'v-for', true); //移除 v-for 属性
        addRawAttr(branch2, ':type', typeBinding); // 向元素添加原始属性 type 为其它
        processElement(branch2, options); // 处理元素节点
        addIfCondition(branch0, { // 向元素的 条件块集合/ifConditions 中添加条件块
          exp: ifCondition,
          block: branch2
        });

        if (hasElse) { // 处理 else-if 和 else 分支
          branch0.else = true;
        } else if (elseIfCondition) {
          branch0.elseif = elseIfCondition;
        }

        return branch0
      }
    }
  }

  /**
   * 克隆 AST节点对象
   * @param {Object} el - 要克隆的 AST节点对象
   * @returns {Object}
   */
  function cloneASTElement (el) {
    return createASTElement(el.tag, el.attrsList.slice(), el.parent) // 创建 AST节点对象
  }

  var model$1 = { // v-model的预转化处理
    preTransformNode: preTransformNode // 用于对节点进行预处理转换 (主要用于将输入元素转换为渲染函数的抽象语法树节点)
  };

  var modules$1 = [ // 用于处理特定的功能或特性的模块数组 (class/style/v-model)
    klass$1, // 处理元素的 class 相关操作
    style$1, // 处理元素的 style 相关操作
    model$1 // 处理元素的双向绑定操作
  ];

  /**
   * 处理 v-text 指令 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} dir - 指令对象
   */
  function text (el, dir) {
    if (dir.value) {
      addProp(el, 'textContent', ("_s(" + (dir.value) + ")"), dir); // 将指令绑定的值, 设置为元素的 textContent属性 (_s: toString: 将值转化为字符串)
    }
  }

  /**
   * 处理 v-html 指令 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} dir - 指令对象
   */
  function html (el, dir) {
    if (dir.value) {
      addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"), dir); // 将指令绑定的值, 设置为元素的 innerHTML属性 (_s: toString: 将值转化为字符串)
    }
  }

  var directives$1 = { // 对特殊指令的处理函数 (v-model/v-text/v-html)
    model: model, // 处理 v-model 指令的函数
    text: text, // 处理 v-text 指令的函数
    html: html // 处理 v-html 指令的函数
  };

  var baseOptions = { // 编译时的基本选项配置
    expectHTML: true, // 表示预期输入的模板是否为 HTML
    modules: modules$1, // 用于处理特定的功能或特性的模块数组 (class/style/v-model)
    directives: directives$1, // 对特殊指令的处理函数 (v-model/v-text/v-html)
    isPreTag: isPreTag, // 用于判断是否为 <pre> 标签
    isUnaryTag: isUnaryTag, // 用于判断是否为自闭合标签
    mustUseProp: mustUseProp, // 用于判断在给定的标签上绑定属性是否必须使用 prop 进行绑定
    canBeLeftOpenTag: canBeLeftOpenTag, // 用于判断给定的标签是否可以不闭合
    isReservedTag: isReservedTag, // 用于判断是否是平台保留标签
    getTagNamespace: getTagNamespace, // 用于获取标签的命名空间
    staticKeys: genStaticKeys(modules$1) // 用于生成静态键的列表 (优化渲染性能)
  };

  var isStaticKey; // 判断抽象的节点对象的属性是否是静态属性
  var isPlatformReservedTag; // 判断是否是平台保留标签的方法

  var genStaticKeysCached = cached(genStaticKeys$1); // 判断抽象的节点对象的属性是否是静态属性 (带缓存)

  /**
   * 标记静态节点和静态根节点 (优化器)
   * 遍历生成的模板AST树并检测完全静态的子树(渲染过程中不发生变化的节点), 然后:
   * 1. 将它们提升到常量中, 不再需要每次重新渲染时创建新的节点
   * 2. 在修补过程中完全跳过它们
   * @param {Object} root - AST 节点对象 (包含有关节点的信息) (根节点以及组件根节点)
   * @param {Object} options - 配置项
   */
  function optimize (root, options) {
    if (!root) { return } // 根节点不存在, 直接返回
    isStaticKey = genStaticKeysCached(options.staticKeys || ''); // 判断抽象的节点对象的属性是否是静态属性
    isPlatformReservedTag = options.isReservedTag || no; // 判断是否是平台保留标签的方法
    markStatic$1(root); // 标记静态节点
    markStaticRoots(root, false); // 标记静态根节点
  }

  /**
   * 判断抽象的节点对象的属性是否是静态属性
   * @param {String} keys - 新增的静态属性名
   * @returns {Function}
   */
  function genStaticKeys$1 (keys) {
    return makeMap( // makeMap: 返回一个函数, 用于判断值是否在字符串分割构建出的对象中
      'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
      (keys ? ',' + keys : '')
    )
  }

  /**
   * 标记节点及其子节点是否为静态节点
   * @param {Object} node - AST 节点对象 (包含有关节点的信息)
   */
  function markStatic$1 (node) {
    node.static = isStatic(node); // 判断是否是静态节点
    if (node.type === 1) { // 元素节点
      /**
       * 不将组件的插槽内容标记为静态, 因为 TODO
       * 1. 避免组件无法更改插槽节点
       * 2. 避免静态插槽内容在热重载时出现问题
       */
      if (
        !isPlatformReservedTag(node.tag) && // 不是平台保留标签
        node.tag !== 'slot' && // 不是slot标签
        node.attrsMap['inline-template'] == null // 组件使用(inline-template/内联模板)
      ) {
        return
      }
      for (var i = 0, l = node.children.length; i < l; i++) { // 遍历当前节点的子节点, 并递归调用markStatic$1方法标记子节点是否为静态节点
        var child = node.children[i];
        markStatic$1(child); // 子节点是否为静态节点 
        if (!child.static) { // 子节点中有一个不是静态节点, 则标记当前节点不是静态节点
          node.static = false;
        }
      }
      if (node.ifConditions) { // 当前节点有条件渲染 (v-if, v-else-if, v-else)
        for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) { // 遍历条件渲染的每个节点, 并标记它们是否为静态节点
          var block = node.ifConditions[i$1].block;
          markStatic$1(block); // 条件渲染的节点是否为静态节点
          if (!block.static) { // 条件渲染的节点中有一个不是静态节点, 则标记当前节点不是静态节点
            node.static = false;
          }
        }
      }
    }
  }

  /**
   * 标记静态根节点
   * @param {Object} node - AST 节点对象 (包含有关节点的信息)
   * @param {Boolean} isInFor - 当前节点是否处于v-for循环中
   */
  function markStaticRoots (node, isInFor) {
    if (node.type === 1) { // 元素节点
      if (node.static || node.once) { // 节点被标记为静态或使用v-once, 则将其staticInFor属性设置为传入的isInFor参数 TODO
        node.staticInFor = isInFor;
      }
      if (node.static && node.children.length && !( // 当前节点是静态节点且拥有子节点且
        node.children.length === 1 && // 子节点不仅仅是文本节点
        node.children[0].type === 3
      )) {
        node.staticRoot = true; // 标记为静态根节点
        return
      } else {
        node.staticRoot = false;
      }
      if (node.children) { // 遍历当前节点的子节点, 并递归调用markStaticRoots方法标记子节点是否为静态根节点
        for (var i = 0, l = node.children.length; i < l; i++) {
          markStaticRoots(node.children[i], isInFor || !!node.for);
        }
      }
      if (node.ifConditions) { // 遍历条件渲染的每个节点, 并标记它们是否为静态根节点
        for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
          markStaticRoots(node.ifConditions[i$1].block, isInFor);
        }
      }
    }
  }

  /**
   * 是否是静态节点 (是指在渲染过程中不会发生变化的节点)
   * @param {Object} node - AST 节点对象 (包含有关节点的信息)
   * @returns {Boolean}
   */
  function isStatic (node) {
    if (node.type === 2) { // 文本表达式
      return false
    }
    if (node.type === 3) { // 纯文本
      return true
    }
    return !!(node.pre || ( // 使用v-pre指令的节点或 (跳过元素和其子元素的编译过程)
      !node.hasBindings && // 非动态绑定的节点且
      !node.if && !node.for && // 不含v-if, v-for指令且 (通常导致节点的动态变化)
      !isBuiltInTag(node.tag) && // 非slot, component等内置标签且 (内置组件通常具有动态行为)
      isPlatformReservedTag(node.tag) && // 是平台保留的标签且 (例：HTML标签通常是静态的)
      !isDirectChildOfTemplateFor(node) && // 祖先节点不是使用v-for指令的<template>且
      Object.keys(node).every(isStaticKey) // 确保所有属性都是静态属性 (type, tag, attrsList等)
    ))
  }

  /**
   * 判断节点的祖先节点是否是使用v-for指令的<template>
   * @param {Object} node - 节点编译后的信息
   * @returns {Boolean}
   */
  function isDirectChildOfTemplateFor (node) {
    while (node.parent) { // 不断向上寻找父节点(祖先节点)
      node = node.parent;
      if (node.tag !== 'template') { // 是否为template标签
        return false
      }
      if (node.for) { // 是否使用v-for指令
        return true
      }
    }
    return false
  }

  /**
   * 匹配函数表达式
   * fnExpRE.test("a => a") === true (箭头函数)
   * fnExpRE.test("() => {}") === true (箭头函数)
   * fnExpRE.test("function() {}") === true (普通匿名函数)
   * fnExpRE.test("function $name(a, b) {}") === true (普通函数)
   */
  var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
  /**
   * 匹配结尾的括号 (可以包括';')
   * "click(a, b);".replace(fnInvokeRE, "") == "click";
   */
  var fnInvokeRE = /\([^)]*?\);*$/;
  /**
   * 匹配对象属性的简单路径
   * 正例:
   * simplePathRE.test("_clickEvent") === true (单个属性路径)
   * simplePathRE.test("eventMap.$clickEvent") === true (简单的多级属性路径)
   * simplePathRE.test("eventMap.$clickEvent[0]") === true (包含方括号访问的路径)
   * 反例:
   * simplePathRE.test("clickEvent()") === false (包含函数调用)
   * simplePathRE.test("clickEvent[0]()") === false (包含函数调用)
   * simplePathRE.test("clickEvent!") === false (包含特殊字符)
   */
  var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

  var keyCodes = { // 通过按键名称获取对应的键码
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46] // 8: Backspace, 46: Delete 
  };

  var keyNames = { // 键盘事件的别名 (主要用于标准化键盘按键的名称, 以便在处理键盘事件时能够跨浏览器地进行匹配和处理, 确保一致的行为)
    esc: ['Esc', 'Escape'], // IE11使用'Esc'
    tab: 'Tab',
    enter: 'Enter',
    space: [' ', 'Spacebar'], // IE11使用'Spacebar'
    up: ['Up', 'ArrowUp'], // IE11不使用使用'Arrow'前缀的名称 (up, left, right, down)
    left: ['Left', 'ArrowLeft'],
    right: ['Right', 'ArrowRight'],
    down: ['Down', 'ArrowDown'],
    'delete': ['Backspace', 'Delete', 'Del'] // IE11使用'Del'
  };

  // 阻止侦听器执行的修饰符需要显式返回null, 以便我们可以确定是否删除侦听器一次 TODO
  /**
   * 用来生成一种条件保护机制, 当某个条件满足时, 提前结束当前的处理流程
   * @param {String} condition 
   * @returns {String}
   */
  var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

  var modifierCode = { // 修饰符在处理事件时执行相应的代码
    stop: '$event.stopPropagation();', // 阻止事件的传播
    prevent: '$event.preventDefault();', // 阻止事件的默认行为
    self: genGuard("$event.target !== $event.currentTarget"), // 限制事件只在触发元素自身时触发
    ctrl: genGuard("!$event.ctrlKey"), // 事件只在按下 Ctrl 键时触发
    shift: genGuard("!$event.shiftKey"), // 事件只在按下 Shift 键时触发
    alt: genGuard("!$event.altKey"), // 事件只在按下 Alt 键时触发
    meta: genGuard("!$event.metaKey"), // 事件只在按下 Meta 键时触发
    left: genGuard("'button' in $event && $event.button !== 0"), // 事件只在按下鼠标左键时触发
    middle: genGuard("'button' in $event && $event.button !== 1"), // 事件只在按下鼠标中键时触发
    right: genGuard("'button' in $event && $event.button !== 2") // 事件只在按下鼠标右键时触发
  };

  /**
   * 生成动态事件名和动态事件监听 TODO
   * @param {Object} events - 事件对象集合
   * @param {Boolean} isNative - 是否是原生事件
   * @returns {String}
   */
  function genHandlers (
    events,
    isNative
  ) {
    var prefix = isNative ? 'nativeOn:' : 'on:'; // 事件前缀 (是否是原生事件 .native修饰符)
    var staticHandlers = "";  // 编译后的静态事件名的事件处理函数代码
    var dynamicHandlers = ""; // 编译后的动态事件名的事件处理函数代码
    for (var name in events) {
      var handlerCode = genHandler(events[name]);
      if (events[name] && events[name].dynamic) { // 动态事件名的事件处理函数会被处理为 "click, function(){}, blur, function(){}" 的形式
        dynamicHandlers += name + "," + handlerCode + ",";
      } else { // 静态事件名的事件处理函数会被处理为 "click: function(){}, blur: function(){}" 的形式
        staticHandlers += "\"" + name + "\":" + handlerCode + ",";
      }
    }
    staticHandlers = "{" + (staticHandlers.slice(0, -1)) + "}"; // 将静态事件处理函数的字符串表示转换成对象字面量格式
    if (dynamicHandlers) { // 拼接动态事件名的事件处理函数
      return prefix + "_d(" + staticHandlers + ",[" + (dynamicHandlers.slice(0, -1)) + "])" // _d: bindDynamicKeys: 处理动态指令的参数绑定
    } else {
      return prefix + staticHandlers
    }
  }

  /**
   * 生成处理函数 TODO
   * @param {Object|Array} handler - 事件信息
   * @returns {String}
   */
  function genHandler (handler) {
    if (!handler) { // 如果没有处理方法, 则返回空函数字符串
      return 'function(){}'
    }

    if (Array.isArray(handler)) { // 返回一个由数组中所有处理函数拼接而成的字符串, 每个处理函数之间用逗号分隔
      return ("[" + (handler.map(function (handler) { return genHandler(handler); }).join(',')) + "]")
    }

    var isMethodPath = simplePathRE.test(handler.value); // 判断属性值是否是简单路径
    var isFunctionExpression = fnExpRE.test(handler.value); // 判断属性值是否是函数表达式 (普通函数, 匿名函数)
    var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, '')); // 处理(删除末尾括号)后的字属性值是否包含函数调用 (fnInvokeRE: 匹配结尾的括号)

    if (!handler.modifiers) { // 处理不包含修饰符的情况
      if (isMethodPath || isFunctionExpression) { // 简单路径属性或函数表达式, 则直接返回属性值
        return handler.value
      }
      return ("function($event){" + (isFunctionInvocation ? ("return " + (handler.value)) : handler.value) + "}") // 根据处理后的属性值是否为简单路径来判断处理形式
    } else { // 处理包含修饰符的情况
      var code = '';
      var genModifierCode = '';
      var keys = [];
      for (var key in handler.modifiers) {
        if (modifierCode[key]) { // 如果修饰符存在对应的代码处理函数, 则生成对应的代码
          genModifierCode += modifierCode[key];
          if (keyCodes[key]) { // 如果修饰符是 key相关的, 则记录键值
            keys.push(key);
          }
        } else if (key === 'exact') { // 处理 exact修饰符, 用于完全匹配键值
          var modifiers = (handler.modifiers);
          genModifierCode += genGuard(
            ['ctrl', 'shift', 'alt', 'meta']
              .filter(function (keyModifier) { return !modifiers[keyModifier]; }) // 过滤掉已存在的修饰符
              .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); }) // 生成键值检测表达式
              .join('||')
          );
        } else {
          keys.push(key);
        }
      }
      if (keys.length) { // 如果存在键值修饰符, 则生成键值检测代码
        code += genKeyFilter(keys);
      }

      if (genModifierCode) { // 确保修饰符如 prevent和 stop在键值过滤后执行
        code += genModifierCode;
      }
      var handlerCode = isMethodPath // 根据属性值的类型生成处理代码
        ? ("return " + (handler.value) + ".apply(null, arguments)")
        : isFunctionExpression
          ? ("return (" + (handler.value) + ").apply(null, arguments)")
          : isFunctionInvocation
            ? ("return " + (handler.value))
            : handler.value;
      return ("function($event){" + code + handlerCode + "}") // 返回一个函数, 该函数包含键值过滤和修饰符代码
    }
  }

  /**
   * 生成按键过滤器的代码字符串
   * @param {Array<String>} keys - 包含键值的数组
   * @returns {String}
   */
  function genKeyFilter (keys) {
    return ( // 确保过滤器只用于键盘事件
      "if(!$event.type.indexOf('key')&&" +
      (keys.map(genFilterCode).join('&&')) + ")return null;"
    )
  }

  /**
   * 生成按键过滤器的代码字符串
   * @param {String} key - 过滤器的键值
   * @returns {String}
   */
  function genFilterCode (key) {
    var keyVal = parseInt(key, 10);  // 将键转换为十进制整数值
    if (keyVal) { // 如果键值有效, 则传入键为键码, 通过键码比较构建条件表达式
      return ("$event.keyCode!==" + keyVal)
    }
    var keyCode = keyCodes[key]; // 按键码
    var keyName = keyNames[key]; // 按键名
    return ( // 否则通过 _k函数对键名键码进行匹配
      "_k($event.keyCode," + // _k: checkKeyCodes: 用于比较给定的按键码、按键名和内置的按键码、按键名是否匹配
      (JSON.stringify(key)) + "," +
      (JSON.stringify(keyCode)) + "," +
      "$event.key," +
      "" + (JSON.stringify(keyName)) +
      ")"
    )
  }

  /**
   * v-on指令绑定多事件监听器时(v-on="object"), 事件的注册函数 (保存相关信息到 AST 节点对象上)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} dir - 指令对象
   */
  function on (el, dir) {
    if (dir.modifiers) { // v-on 绑定多个事件时, 不支持修饰符 (多事件绑定: v-on="{click: a, keyup: b}")
      warn("v-on without argument does not support modifiers.");
    }
    /**
     * dir.value: "{ click: a, keyup: b }"
     * code: "{}" 已经处理好的数据对象的字符形式
     */
    el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); }; // _g: bindObjectListeners: 处理 v-on指令的参数绑定
  }

  /**
   * v-bind指令绑定多参数时(v-bind="object"), 属性的注册函数 (保存相关信息到 AST节点对象上)
   * @param {Object} el  - AST 节点对象 (包含有关节点的信息)
   * @param {Object} dir - 指令对象
   */
  function bind$1 (el, dir) {
    el.wrapData = function (code) { // _b: bindObjectProps: 绑定属性对象
      return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
    };
  }

  var baseDirectives = { // 一些基本的指令处理函数
    on: on, // 注册 v-on指令
    bind: bind$1, // 注册 v-bind指令
    cloak: noop // 空函数
  };

  /**
   * 用于生成代码的状态管理器
   * @param {Object} options - 配置项
   */
  var CodegenState = function CodegenState (options) {
    this.options = options;
    this.warn = options.warn || baseWarn; // 用于发出警告
    this.transforms = pluckModuleFunction(options.modules, 'transformCode'); // 用于对生成的代码进行转换 (pluckModuleFunction: 从模块数组中提取特定键名对应的函数)
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData'); // 用于生成特定数据的代码片段
    this.directives = extend(extend({}, baseDirectives), options.directives); // 指令的处理函数 (on, bind, text, model ...)
    var isReservedTag = options.isReservedTag || no; // 用于判断给定的 HTML 标签名是否是保留标签
    this.maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); }; // 用于判断给定的元素是否可能是组件
    this.onceId = 0; // 用于生成静态节点的唯一标识符 (静态节点是指在组件初始化阶段就已经确定不会改变的节点)
    this.staticRenderFns = []; // 用于存储静态节点的渲染函数
    this.pre = false; // 是否跳过元素和其子元素的编译过程
  };

  /**
   * 生成组件的渲染函数
   * @param {Object} ast - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} options - 当前的编译状态对象
   * @returns {Object}
   */
  function generate (
    ast,
    options
  ) {
    var state = new CodegenState(options); // 创建代码生成器的状态对象
    var code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : '_c("div")'; // 生成元素节点的渲染代码 (根级别的 script标签不应该被渲染)
    return {
      render: ("with(this){return " + code + "}"), // 渲染函数 (通过 with(this) 实现在当前作用域内访问组件实例的属性和方法)
      staticRenderFns: state.staticRenderFns // 用于存储静态节点的渲染函数
    }
  }

  /**
   * 生成元素节点的渲染代码
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genElement (el, state) {
    if (el.parent) { // 设置v-pre标记 (v-pre: 跳过元素和其子元素的编译过程)
      el.pre = el.pre || el.parent.pre;
    }

    if (el.staticRoot && !el.staticProcessed) {
      return genStatic(el, state) // 生成静态节点的渲染函数
    } else if (el.once && !el.onceProcessed) {
      return genOnce(el, state) // 生成一次性节点的渲染函数
    } else if (el.for && !el.forProcessed) {
      return genFor(el, state) // 生成 v-for 指令下的渲染函数
    } else if (el.if && !el.ifProcessed) {
      return genIf(el, state) // 生成 v-if 条件下相应的渲染函数
    } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
      return genChildren(el, state) || 'void 0' // 生成子节点的渲染函数
    } else if (el.tag === 'slot') {
      return genSlot(el, state) // 生成插槽的渲染函数
    } else { // 处理组件或普通元素
      var code;
      if (el.component) { // 如果是组件
        code = genComponent(el.component, el, state); // 生成组件的渲染函数
      } else { // 如果是普通元素
        var data;
        if (!el.plain || (el.pre && state.maybeComponent(el))) { // 如果不是纯文本节点或者静态节点或是被 v-pre包裹的组件
          data = genData$2(el, state); // 生成节点的数据部分
        }

        var children = el.inlineTemplate ? null : genChildren(el, state, true); // 生成子节点的渲染函数
        code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")"; // 构造 createElement函数调用的代码
      }

      for (var i = 0; i < state.transforms.length; i++) { // 经过各种处理后, 执行模块转换 (比如 slot, class, style等)
        code = state.transforms[i](el, code);
      }
      return code
    }
  }

  /**
   * 生成静态节点的渲染函数 (v-pre)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genStatic (el, state) {
    el.staticProcessed = true; // 标记为已处理过的静态节点
    var originalPreState = state.pre; // 保存了编译状态中的pre的原始值
    if (el.pre) { // 如果当前元素有pre属性, 则将编译状态中的pre属性设置为当前元素的pre属性值 (为了处理特定的元素在v-pre节点内的情况)
      state.pre = el.pre;
    }
    state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}")); // 将当前元素的渲染函数代码加入到编译状态对象 (genElement: 生成元素节点)
    state.pre = originalPreState; // 恢复编译状态中的pre为原始值
    return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")") // _m: renderStatic: 渲染静态树
  }

  /**
   * 生成一次性节点的渲染函数 (v-once)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genOnce (el, state) {
    el.onceProcessed = true; // 将当前元素标记为已处理过的一次性节点
    if (el.if && !el.ifProcessed) { // 如果当前元素包含 v-if 且未处理过 if 条件
      return genIf(el, state) // 生成 v-if 条件下相应的渲染函数
    } else if (el.staticInFor) { // 如果当前元素在 v-for 循环内部
      var key = '';
      var parent = el.parent;
      while (parent) { // 遍历当前元素的父节点链, 查找最近的带有 v-for 属性的父节点, 并获取其 key 属性作为一次性节点的唯一标识
        if (parent.for) {
          key = parent.key;
          break
        }
        parent = parent.parent;
      }
      if (!key) { // 如果没有找到带有 v-for 属性的父节点或者该父节点没有设置 key, 则发出警告并返回当前元素的普通渲染
        state.warn(
          "v-once can only be used inside v-for that is keyed. ",
          el.rawAttrsMap['v-once']
        );
        return genElement(el, state) // 生成元素节点的渲染函数
      }
      return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")") // _o: markOnce: 标记一次性节点
    } else {
      return genStatic(el, state) // 生成静态节点的渲染函数
    }
  }

  /**
   * 生成 v-if 条件下相应的渲染函数
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @param {Function} altGen - 表示替代的生成函数
   * @param {String} altEmpty - 表示替代的空函数
   * @returns {String}
   */
  function genIf (
    el,
    state,
    altGen,
    altEmpty
  ) {
    el.ifProcessed = true; // 将当前元素标记为已处理过的 v-if 节点 (避免递归)
    return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty) // 生成 v-if 条件下相应的渲染函数 (genIf的辅助函数)
  }

  /**
   * 生成 v-if 条件下相应的渲染函数 (genIf的辅助函数)
   * @param {Array} conditions - 表示当前节点的条件列表 (当前条件相关的节点 v-if, v-else-if, v-else的节点)
   * @param {CodegenState} state - 当前的编译状态对象
   * @param {Function} altGen - 表示替代的生成函数
   * @param {String} altEmpty - 表示替代的空函数
   * @returns {String}
   */
  function genIfConditions (
    conditions,
    state,
    altGen,
    altEmpty
  ) {
    if (!conditions.length) { // 如果条件列表为空, 则返回_e() (_e: createEmptyVNode: 创建空节点)
      return altEmpty || '_e()'
    }

    var condition = conditions.shift(); // 取出第一个条件对象
    /**
     * 如果条件对象包含表达式, 则返回三元表达式 (block 是当前条件对应节点的`抽象的节点对象`)
     * (exp) ? (block) : (genIfConditions(conditions, state, altGen, altEmpty))
     */
    if (condition.exp) {
      return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
    } else { // 如果条件对象不包含表达式, 则直接返回对应元素节点的渲染函数
      return ("" + (genTernaryExp(condition.block))) // 根据条件生成对应的渲染函数
    }

    /**
     * 根据条件生成对应的渲染函数
     * v-if 和 v-once 应该生成类似 (a)?_ m(0):_ m(1)
     * @param {Object} el - 节点的抽象对象
     * @returns {String}
     */
    function genTernaryExp (el) {
      return altGen // 根据是否提供了替代的生成函数, 选择调用相应的生成函数
        ? altGen(el, state)
        : el.once // 根据是否设置 once 属性, 选择调用相应的生成函数
          ? genOnce(el, state)
          : genElement(el, state)
    }
  }

  /**
   * 用于生成 v-for 指令下的渲染函数
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @param {Function} altGen - 表示替代的生成函数
   * @param {String} altHelper - 表示替代的辅助函数
   * @returns {String}
   */
  function genFor (
    el,
    state,
    altGen,
    altHelper
  ) {
    var exp = el.for; // v-for 指令的表达式
    var alias = el.alias; // v-for 指令中循环变量的别名
    var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : ''; // 可能的迭代器参数
    var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

    if (state.maybeComponent(el) && // 如果当前元素被判断为可能是组件并且
      el.tag !== 'slot' && // 不是 <slot> 或 <template> 标签并且
      el.tag !== 'template' &&
      !el.key // 没有设置 key 属性
    ) { // 则发出警告, 提示开发者应该为组件列表设置显式的键
      state.warn(
        "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
        "v-for should have explicit keys. " +
        "See https://vuejs.org/guide/list.html#key for more info.",
        el.rawAttrsMap['v-for'],
        true /* tip */
      );
    }

    el.forProcessed = true; // 将当前元素标记为已处理过 v-for 指令 (避免递归处理)
    /**
     * 返回一个函数调用的字符串, 函数为 altHelper/_l (_l: renderList: TODO)
     * 函数调用的第一个参数是 v-for 指令的表达式
     * 函数调用的第二个参数是一个匿名函数, 用于处理列表中的每个元素
     * 匿名函数的参数是 v-for 指令的别名以及可能的迭代器参数
     * 函数体内部调用了生成函数 altGen/genElement, 用于生成当前元素节点的渲染函数
     */
    return (altHelper || '_l') + "((" + exp + ")," +
      "function(" + alias + iterator1 + iterator2 + "){" +
        "return " + ((altGen || genElement)(el, state)) +
      '})'
  }

  /**
   * 用于生成组件的数据对象
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genData$2 (el, state) { // TODO
    var data = '{';

    var dirs = genDirectives(el, state); // 生成指令的数据对象 (首先处理指令, 因为指令可能会在生成之前改变其他属性)
    if (dirs) { data += dirs + ','; } // "directives:[{name:"model",rawName:"v-model",value:(query),expression:"query"}],"

    if (el.key) { // 处理key属性 (key: 用于优化Diff算法)
      data += "key:" + (el.key) + ","; // "key: 'xx',"
    }

    if (el.ref) { // 处理ref属性 (ref: 获取组件实例或DOM)
      data += "ref:" + (el.ref) + ","; // "ref: 'xx',"
    }

    if (el.refInFor) { // 处理 refInFor 属性 (使用ref属性, 且祖先元素使用 v-for 指令)
      data += "refInFor:true,"; // "refInFor: true,"
    }

    if (el.pre) { // 处理v-pre指令 (v-pre: 跳过元素和其子元素的编译过程)
      data += "pre:true,"; // "pre: true,"
    }

    if (el.component) { // 处理is属性, el.component记录了组件原始标签名 (is: 动态渲染组件)
      data += "tag:\"" + (el.tag) + "\","; // "tag: 'xx',"
    }

    for (var i = 0; i < state.dataGenFns.length; i++) { // 生成模块数据 TODO
      data += state.dataGenFns[i](el); // 调用每个模块数据生成函数, 将结果拼接到 data中
    }

    if (el.attrs) { // 处理属性
      data += "attrs:" + (genProps(el.attrs)) + ","; // (genProps: 生成props)
    }

    if (el.props) { // 处理DOM属性
      data += "domProps:" + (genProps(el.props)) + ",";
    }

    if (el.events) { // 处理事件
      data += (genHandlers(el.events, false)) + ",";
    }

    if (el.nativeEvents) { // 处理原生事件 (.native)
      data += (genHandlers(el.nativeEvents, true)) + ",";
    }

    if (el.slotTarget && !el.slotScope) { // 处理 slot target TODO
      data += "slot:" + (el.slotTarget) + ",";
    }

    if (el.scopedSlots) { // 处理作用域插槽 scoped slots
      data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
    }
    if (el.model) { // 处理组件 v-model
      data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
    }

    if (el.inlineTemplate) { // 处理内联模板
      var inlineTemplate = genInlineTemplate(el, state); // 生成内联模板组件的渲染函数
      if (inlineTemplate) { // 拼接到 data中
        data += inlineTemplate + ",";
      }
    }

    data = data.replace(/,$/, '') + '}';
    if (el.dynamicAttrs) { // 处理动态绑定的属性
      data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")"; // (genProps: 生成props)
    }

    if (el.wrapData) { // 处理 v-bind 指令绑定多参数时(v-bind="object"), 属性的注册函数
      data = el.wrapData(data); // 在genDirectives方法中, 处理 v-bind 指令绑定多参数时, 会通过 bind$1方法给节点注册 wrapData方法
    }

    if (el.wrapListeners) { // 处理 v-on 指令绑定多事件监听器时(v-on="object"), 事件的注册函数
      data = el.wrapListeners(data); // 在genDirectives方法中, 处理 v-on 指令绑定多事件时, 会通过 on方法给节点注册 wrapListeners方法
    }

    return data
  }

  /**
   * 生成指令描述对象数组的字符串表示 TODO
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genDirectives (el, state) {
    var dirs = el.directives; // 指令 (自定义指令及v-model等)
    if (!dirs) { return } // 指令不存在, 则直接返回
    var res = 'directives:[';
    var hasRuntime = false; // 标记是否存在需要运行时处理的指令
    var i, l, dir, needRuntime;
    for (i = 0, l = dirs.length; i < l; i++) { // 遍历指令数组
      dir = dirs[i];
      needRuntime = true; // 默认为需要运行时处理
      var gen = state.directives[dir.name]; // 根据指令名称获取指令生成函数
      if (gen) {
        // 编译时指令, 用于操作 AST
        // 如果需要运行时处理, 返回 true
        /**
         * 调用指令的生成函数, 生成指令的数据对象
         * 例: 处理 v-bind 指令绑定多参数时, 会通过 bind$1 方法给节点注册 wrapData 方法
         * 例: 处理 v-on 指令绑定多参数时, 会通过 on 方法给节点注册 wrapListeners 方法
         */
        needRuntime = !!gen(el, dir, state.warn);
      }
      if (needRuntime) { // 如果指令需要运行时处理
        hasRuntime = true;
        res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
      }
    }
    if (hasRuntime) {
      return res.slice(0, -1) + ']' // 删除末尾逗号后返回 "directives:[{name:"focus",rawName:"v-focus"}]"
    }
  }

  /**
   * 生成内联模板组件的渲染函数
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genInlineTemplate (el, state) {
    var ast = el.children[0]; // 内联模板组件的子节点
    if (el.children.length !== 1 || ast.type !== 1) { // 内联模板组件必须正好仅一个子元素节点, 反之则发出警告
      state.warn(
        'Inline-template components must have exactly one child element.',
        { start: el.start }
      );
    }
    if (ast && ast.type === 1) {
      var inlineRenderFns = generate(ast, state.options); // 生成内联模板组件的渲染函数
      return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
    }
  }

  /**
   * 生成作用域插槽的渲染函数 TODOO
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} slots - 作用域插槽对象 (包含所有作用域插槽的信息)
   * @param {Object} state - 编译状态对象
   * @returns {String}
   */
  function genScopedSlots (
    el,
    slots,
    state
  ) {
    // by default scoped slots are considered "stable", this allows child
    // components with only scoped slots to skip forced updates from parent.
    // but in some cases we have to bail-out of this optimization
    // for example if the slot contains dynamic names, has v-if or v-for on them...
    // 默认情况下，作用域插槽被认为是“稳定的”，这允许仅具有作用域插槽的子组件跳过来自父组件的强制更新。
  // 但在某些情况下，我们必须放弃这种优化，例如，如果插槽包含动态名称，或者在其上有 v-if 或 v-for...
    var needsForceUpdate = el.for || Object.keys(slots).some(function (key) {
      var slot = slots[key];
      return (
        slot.slotTargetDynamic || // 插槽目标是否动态
        slot.if || // 是否有 v-if指令
        slot.for || // 是否有 v-for指令
        containsSlotChild(slot) // is passing down slot from parent which may be dynamic 用于检查节点是否包含 slot 元素为其子节点
      )
    });

    // #9534: if a component with scoped slots is inside a conditional branch,
    // it's possible for the same component to be reused but with different
    // compiled slot content. To avoid that, we generate a unique key based on
    // the generated code of all the slot contents.
    var needsKey = !!el.if;

    // OR when it is inside another scoped slot or v-for (the reactivity may be
    // disconnected due to the intermediate scope variable)
    // #9438, #9506
    // TODO: this can be further optimized by properly analyzing in-scope bindings
    // and skip force updating ones that do not actually use scope variables.
    if (!needsForceUpdate) {
      var parent = el.parent;
      while (parent) {
        if (
          (parent.slotScope && parent.slotScope !== emptySlotScopeToken) ||
          parent.for
        ) {
          needsForceUpdate = true;
          break
        }
        if (parent.if) {
          needsKey = true;
        }
        parent = parent.parent;
      }
    }

    var generatedSlots = Object.keys(slots) // 通过遍历生成所有作用域插槽的渲染函数代码
      .map(function (key) { return genScopedSlot(slots[key], state); })
      .join(','); // 以逗号分隔

    return ("scopedSlots:_u([" + generatedSlots + "]" + (needsForceUpdate ? ",null,true" : "") + (!needsForceUpdate && needsKey ? (",null,false," + (hash(generatedSlots))) : "") + ")")
  }

  /**
   * 用于生成字符串的哈希值
   * @param {String} str - 要计算哈希值的字符串
   * @returns {Number}
   */
  function hash(str) {
    var hash = 5381; // 初始化哈希值
    var i = str.length; // 获取字符串长度
    while(i) {
      hash = (hash * 33) ^ str.charCodeAt(--i); // charCodeAt: 字符的 Unicode编码
    }
    return hash >>> 0 // 将哈希值右移 0位, 使其转换为一个 32位无符号整数
  }

  /**
   * 用于检查节点是否包含 slot 元素为其子节点
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @returns {Boolean}
   */
  function containsSlotChild (el) {
    if (el.type === 1) { // 如果是一个 slot元素, 返回 true
      if (el.tag === 'slot') {
        return true
      }
      return el.children.some(containsSlotChild) // 否则, 递归地检查其子节点, 看是否有子节点包含 slot元素
    }
    return false // 非元素节点, 返回 false
  }
  
  /**
   * 生成作用域插槽的渲染函数
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {Object} state - 编译状态对象
   * @returns {String}
   */
  function genScopedSlot (
    el,
    state
  ) {
    var isLegacySyntax = el.attrsMap['slot-scope']; // 检查当前元素是否使用了旧版作用域插槽语法
    if (el.if && !el.ifProcessed && !isLegacySyntax) { // 当前元素存在未处理的 v-if 指令且未使用旧版作用域插槽语法
      return genIf(el, state, genScopedSlot, "null") // 生成 v-if 条件下相应的渲染函数
    }
    if (el.for && !el.forProcessed) { // 当前元素存在未处理的 v-for 指令
      return genFor(el, state, genScopedSlot) // 生成 v-for 指令下的渲染函数
    }
    var slotScope = el.slotScope === emptySlotScopeToken // 获取作用域插槽的参数
      ? ""
      : String(el.slotScope);
    var fn = "function(" + slotScope + "){" + // 生成渲染函数字符串
      "return " + (el.tag === 'template'
        ? el.if && isLegacySyntax
          ? ("(" + (el.if) + ")?" + (genChildren(el, state) || 'undefined') + ":undefined")
          : genChildren(el, state) || 'undefined' // genChildren: 生成子节点的渲染函数
        : genElement(el, state)) + "}"; // genElement: 生成元素节点的渲染函数
    var reverseProxy = slotScope ? "" : ",proxy:true"; // 存在 v-slot 但没有作用域, 则生成反向代理 v-slot 到 this.$slots 上的渲染函数
    return ("{key:" + (el.slotTarget || "\"default\"") + ",fn:" + fn + reverseProxy + "}")
  }

  /**
   * 用于生成子节点的渲染函数
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @param {Boolean} checkSkip - 表示是否需要检查跳过
   * @param {Function} altGenElement - 表示替代的生成元素函数
   * @param {Function} altGenNode - 表示替代的生成节点函数
   * @returns {String}
   */
  function genChildren (
    el,
    state,
    checkSkip,
    altGenElement,
    altGenNode
  ) {
    var children = el.children; // 子节点数组
    if (children.length) {
      var el$1 = children[0]; // 第一个子节点
      // 对单个 v-for 的情况进行优化
      if (children.length === 1 && // 元素只有一个子节点且
        el$1.for && // 是一个 v-for 节点且
        el$1.tag !== 'template' && // 不是 <template> 或 <slot> 标签
        el$1.tag !== 'slot'
      ) { // 如果需要检查跳过, 则根据是否可能是组件来确定是否进行标准化, 如果可能是组件, 则使用标准化类型 1
        var normalizationType = checkSkip
          ? state.maybeComponent(el$1) ? ",1" : ",0"
          : "";
        return ("" + ((altGenElement || genElement)(el$1, state)) + normalizationType) // 返回生成的子节点的代码
      }
      var normalizationType$1 = checkSkip // 根据是否需要检查跳过, 确定标准化类型
        ? getNormalizationType(children, state.maybeComponent) // 确定子节点数组需要标准化的级别
        : 0;
      var gen = altGenNode || genNode; // 生成节点的渲染函数
      return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : ''))
    }
  }

  /**
   * 确定子节点数组需要标准化的级别
   * 0: 不需要标准化
   * 1: 需要简单的规范化 (可能是1级深度嵌套数组)
   * 2: 需要完全正常化
   * @param {Array} children - 表示子节点数组
   * @param {Function} maybeComponent - 用于判断给定节点是否可能是一个组件
   * @returns {String}
   */
  function getNormalizationType (
    children,
    maybeComponent
  ) {
    var res = 0;
    for (var i = 0; i < children.length; i++) { // 遍历子节点数组
      var el = children[i];
      if (el.type !== 1) { // 如果当前节点不是元素节点, 则直接跳过继续下一次循环
        continue
      }
      if (needsNormalization(el) || // 当前节点需要标准化 或 当前节点有条件渲染且其中的某个条件块需要标准化, 则将标准化级别设为 2
          (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
        res = 2;
        break
      }
      if (maybeComponent(el) || // 如果当前节点可能是一个组件 或 当前节点有条件渲染并且其中的某个条件块可能是一个组件, 则将标准化级别设为 1
          (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
        res = 1;
      }
    }
    return res
  }

  function needsNormalization (el) { // 用于判断一个元素节点是否需要标准化处理
    return el.for !== undefined || el.tag === 'template' || el.tag === 'slot' // 如果元素节点具有 for 属性或标签名是 'template/slot'
  }

  /**
   * 用于生成节点的渲染函数
   * @param {Object} node - AST 节点对象 (包含有关节点的信息) (type = 1 元素节点; type = 2 文本节点(表达式类型) type = 3 文本节点(纯文本或注释))
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genNode (node, state) {
    if (node.type === 1) { // 生成元素节点
      return genElement(node, state)
    } else if (node.type === 3 && node.isComment) { // 生成注释节点
      return genComment(node)
    } else { // 生成文本
      return genText(node)
    }
  }

  /**
   * 用于生成文本的渲染函数
   * @param {Object} text - 文本信息
   * @returns {String}
   */
  function genText (text) {
    return ("_v(" + (text.type === 2 // 是否是表达式
      ? text.expression // 表达式 (例: "_s(fullName)")
      : transformSpecialNewlines(JSON.stringify(text.text))) + ")") // 纯文本 (transformSpecialNewlines: 转换特殊换行符)
  }

  /**
   * 用于生成注释节点的渲染函数
   * @param {Object} comment - 注释信息
   * @returns {String}
   */
  function genComment (comment) {
    return ("_e(" + (JSON.stringify(comment.text)) + ")") // "_e("注释")"
  }

  /**
   * 用于生成插槽的渲染函数 (slot)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genSlot (el, state) {
    var slotName = el.slotName || '"default"'; // 插槽的名称
    var children = genChildren(el, state); // 生成子节点的渲染函数
    var res = "_t(" + slotName + (children ? (",function(){return " + children + "}") : ''); // 构建了插槽的渲染函数 (_t: renderSlot: 渲染插槽内容)
    var attrs = el.attrs || el.dynamicAttrs
      ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) { return ({ // 生成props属性
          name: camelize(attr.name), // 将横线命名的字符串转换为驼峰命名
          value: attr.value,
          dynamic: attr.dynamic
        }); }))
      : null;
    var bind$$1 = el.attrsMap['v-bind']; // v-bind 属性的值
    if ((attrs || bind$$1) && !children) { // 如果元素节点具有属性或者 v-bind 属性, 并且没有子节点
      res += ",null";
    }
    if (attrs) { // 将属性添加到渲染函数中
      res += "," + attrs;
    }
    if (bind$$1) { // 将 v-bind 属性的值添加到渲染函数中
      res += (attrs ? '' : ',null') + "," + bind$$1;
    }
    return res + ')' // "_t(name, fallbackRender, props, bindObject)"
  }

  /**
   * 生成组件的渲染函数
   * @param {String} componentName - 组件名 (el.component)
   * @param {Object} el - AST 节点对象 (包含有关节点的信息)
   * @param {CodegenState} state - 当前的编译状态对象
   * @returns {String}
   */
  function genComponent (
    componentName,
    el,
    state
  ) {
    var children = el.inlineTemplate ? null : genChildren(el, state, true); // 存内联模板, 子节点设为null, 反之则直接生成子节点的渲染函数
    return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")") // (_c: 渲染组件) (genData$2: 用于生成组件的数据对象)
  }

  /**
   * 生成props的渲染函数
   * @param {Array} props - props
   * @returns {String}
   */
  function genProps (props) { // 生成props
    var staticProps = "";  // 静态属性名
    var dynamicProps = ""; // 动态属性名
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var value = transformSpecialNewlines(prop.value); // 属性值 (transformSpecialNewlines: 转换特殊换行符)
      if (prop.dynamic) { // 动态属性名 ("name,"Bob",age,average,")
        dynamicProps += (prop.name) + "," + value + ",";
    } else { // 静态属性名 (""name":"Bob","age":"20",")
        staticProps += "\"" + (prop.name) + "\":" + value + ",";
      }
    }
    staticProps = "{" + (staticProps.slice(0, -1)) + "}"; // 静态属性名 ("{"name":"Bob","age":"20"}")
    if (dynamicProps) { // 动态属性名 ("_d({},[name,"Bob",age,average])")
      return ("_d(" + staticProps + ",[" + (dynamicProps.slice(0, -1)) + "])")
    } else {
      return staticProps
    }
  }

  function transformSpecialNewlines (text) { // 转换特殊换行符 (在解析字符串时可能会导致错误或意外行为)
    return text // 特殊换行符转换为转义序列
      .replace(/\u2028/g, '\\u2028') // 单行文本中的换行
      .replace(/\u2029/g, '\\u2029') // 多行文本中的段落分隔
  }

  var prohibitedKeywordRE = new RegExp('\\b' + ( // 该正则用于匹配不应该出现在表达式中的关键字 (typeof/instanceof/in 这样的运算符是允许的)
    'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
    'super,throw,while,yield,delete,export,import,return,switch,default,' +
    'extends,finally,continue,debugger,function,arguments'
  ).split(',').join('\\b|\\b') + '\\b');

  var unaryOperatorsRE = new RegExp('\\b' + ( // 这些关键字不能作为属性/方法名出现
    'delete,typeof,void'
  ).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

  // 用于剥离表达式中的字符串常量 (包括单引号, 双引号和模板字符串中的内容)
  var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

  /**
   * 检查模板中的表达式 (指令、模板语法等)
   * @param {Object} ast - AST 抽象语法树
   * @param {Function} warn - 警告函数
   */
  function detectErrors (ast, warn) {
    if (ast) {
      checkNode(ast, warn); // 检查节点中指令、事件及表达式的有效性
    }
  }

  /**
   * 检查节点中指令、表达式的有效性
   * @param {Object} node - AST 节点对象 (包含有关节点的信息)
   * @param {Function} warn - 警告函数
   */
  function checkNode (node, warn) {
    if (node.type === 1) { // 如果是元素节点
      for (var name in node.attrsMap) { // 遍历属性进行检查校验
        if (dirRE.test(name)) { // 判断是否是指令
          var value = node.attrsMap[name]; // 属性值
          if (value) {
            var range = node.rawAttrsMap[name]; // 在源码中的位置范围
            if (name === 'v-for') { // 检查 v-for 指令中各个属性的有效性
              checkFor(node, ("v-for=\"" + value + "\""), warn, range);
            } else if (name === 'v-slot' || name[0] === '#') { // 检查函数参数表达式的有效性 (#/v-slot 插槽)
              checkFunctionParameterExpression(value, (name + "=\"" + value + "\""), warn, range);
            } else if (onRE.test(name)) { //  // 检查事件表达式的有效性 (onRE: 判断是否是使用 @/v-on 绑定事件)
              checkEvent(value, (name + "=\"" + value + "\""), warn, range);
            } else { // 检查值表达式的有效性
              checkExpression(value, (name + "=\"" + value + "\""), warn, range);
            }
          }
        }
      }
      if (node.children) { // 递归检查子节点中指令、表达式的有效性
        for (var i = 0; i < node.children.length; i++) {
          checkNode(node.children[i], warn);
        }
      }
    } else if (node.type === 2) { // 如果是文本节点
      checkExpression(node.expression, node.text, warn, node); // 检查表达式的有效性
    }
  }

  /**
   * 检查事件表达式的有效性
   * @param {String} exp - 事件表达式
   * @param {String} text - 事件表达式所在的文本
   * @param {Function} warn - 警告函数
   * @param {Object} range - 事件表达式在源码中的位置范围
   */
  function checkEvent (exp, text, warn, range) {
    var stripped = exp.replace(stripStringRE, ''); // 剥离事件表达式中的字符串常量
    var keywordMatch = stripped.match(unaryOperatorsRE); // 检查是否使用关键字作为方法名
    if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') { // 使用关键字作为事件名且不是以 $ 开头, 则输出警告信息
      warn(
        "avoid using JavaScript unary operator as property name: " +
        "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim()),
        range
      );
    }
    checkExpression(exp, text, warn, range); // 用于检查表达式的有效性
  }

  /**
   * 检查 v-for 指令中各个属性的有效性
   * @param {Object} node - AST 节点对象 (包含有关节点的信息)
   * @param {String} text - v-for 指令所在的文本
   * @param {Function} warn - 警告函数
   * @param {Object} range - v-for 指令在源码中的位置范围
   */
  function checkFor (node, text, warn, range) {
    checkExpression(node.for || '', text, warn, range); // 检查表达式的有效性
    checkIdentifier(node.alias, 'v-for alias', text, warn, range); // 检查 v-for 中的别名 alias 的有效性
    checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range); // 检查 v-for 中的迭代器 iterator1 的有效性
    checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range); // 检查 v-for 中的迭代器 iterator2 的有效性
  }

  /**
   * 检查标识符的有效性
   * @param {String} ident - 待检查的标识符
   * @param {String} type - 标识符的类型 (如变量、函数等)
   * @param {String} text - 标识符所在的表达式
   * @param {Function} warn - 警告函数
   * @param {Object} range - 标识符在源码中的位置范围
   */
  function checkIdentifier (
    ident,
    type,
    text,
    warn,
    range
  ) {
    if (typeof ident === 'string') {
      try { // 尝试使用 new Function 创建一个函数对象, 以检查标识符的有效性
        new Function(("var " + ident + "=_"));
      } catch (e) { // 如果捕获到异常, 说明标识符无效, 则控制台输出警告信息
        warn(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())), range);
      }
    }
  }

  /**
   * 用于检查表达式的有效性
   * @param {String} exp - 待检查的表达式字符串
   * @param {String} text - 表达式的原始文本
   * @param {Function} warn - 警告函数
   * @param {Object} range - 表达式在源码中的位置范围
   */
  function checkExpression (exp, text, warn, range) {
    try { // 尝试使用 new Function 创建一个函数对象, 以检查表达式的语法是否正确
      new Function(("return " + exp));
    } catch (e) { // 捕获到异常, 说明表达式无效
      var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
      if (keywordMatch) { // 如果表达式中包含 JavaScript 关键字作为属性名, 则控制台输出警告信息
        warn(
          "avoid using JavaScript keyword as property name: " +
          "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim()),
          range
        );
      } else { // 否则输出无效表达式的错误信息
        warn(
          "invalid expression: " + (e.message) + " in\n\n" +
          "    " + exp + "\n\n" +
          "  Raw expression: " + (text.trim()) + "\n",
          range
        );
      }
    }
  }

  /**
   * 检查函数参数表达式的有效性
   * @param {String} exp - 函数参数表达式
   * @param {String} text - 函数参数表达式所在的文本
   * @param {Function} warn - 警告函数
   * @param {Object} range - 函数参数表达式在源码中的位置范围
   */
  function checkFunctionParameterExpression (exp, text, warn, range) {
    try { // 使用 new Function 构造函数尝试解析函数参数表达式
      new Function(exp, '');
    } catch (e) { // 捕获到异常, 说明解析失败, 则控制台输出警告信息
      warn(
        "invalid function parameter expression: " + (e.message) + " in\n\n" +
        "    " + exp + "\n\n" +
        "  Raw expression: " + (text.trim()) + "\n",
        range
      );
    }
  }

  var range = 2;
  /**
   * 生成源代码的错误代码框架 (帮助定位错误)
   * @param {String} source - 源代码字符串
   * @param {Number} start - 起始位置
   * @param {Number} end - 结束位置
   * @returns {String} - 包含标识位置范围的字符串
   */
  function generateCodeFrame (
    source,
    start,
    end
  ) {
    if ( start === void 0 ) start = 0;
    if ( end === void 0 ) end = source.length;

    var lines = source.split(/\r?\n/); // 将源代码按行拆分成数组
    var count = 0; // 计数器 (用于记录已扫描字符数)
    var res = [];
    for (var i = 0; i < lines.length; i++) { // 遍历每一行代码
      count += lines[i].length + 1; // 更新已扫描字符数
      if (count >= start) {
        for (var j = i - range; j <= i + range || end > count; j++) { // 遍历错误所在行的前后几行或直到结束位置
          if (j < 0 || j >= lines.length) { continue } // 如果索引超出范围, 则继续下一次循环
          res.push(("" + (j + 1) + (repeat$1(" ", 3 - String(j + 1).length)) + "|  " + (lines[j]))); // 将当前行添加到结果数组中, 并在行号前面添加一些空格以保持对齐
          var lineLength = lines[j].length;
          if (j === i) { // 如果是错误所在的行, 添加下划线标识错误的位置
            var pad = start - (count - lineLength) + 1; // 计算需要添加空格的数量
            var length = end > count ? lineLength - pad : end - start; // 计算需要添加下划线的长度
            res.push("   |  " + repeat$1(" ", pad) + repeat$1("^", length)); // 添加下划线
          } else if (j > i) { // 如果是错误所在行之后的行, 添加空格以对齐
            if (end > count) { // 如果结束位置在当前行内, 则添加相应数量的下划线
              var length$1 = Math.min(end - count, lineLength);
              res.push("   |  " + repeat$1("^", length$1));
            }
            count += lineLength + 1; // 更新已扫描字符数
          }
        }
        break
      }
    }
    return res.join('\n') // 将结果通过换行符拼接输出
  }

  /**
   * 将一个字符串重复指定的次数 (利用二进制表示中数字的性质, 通过位运算来判断重复的次数, 循环次数从n次优化到log2(n)次)
   * @param {String} str - 需要重复的字符串
   * @param {Number} n - 重复的次数
   * @returns {String}
   */
  function repeat$1 (str, n) {
    var result = '';
    if (n > 0) {
      while (true) {
        if (n & 1) { result += str; } // 检查n的最低位(二进制表示的最后一位), 如果为1, 则将str添加到result中
        n >>>= 1; // 将n向右移动一位(相当于除以2)
        if (n <= 0) { break }
        str += str; // n的最低位为0, 则将str自身加倍, 以便在下一次迭代中使用
      }
    }
    return result
  }

  /**
   * 创建函数
   * @param {String} code - 要创建函数的代码
   * @param {Array} errors - 用于存储可能出现的错误
   * @returns {Function}
   */
  function createFunction (code, errors) {
    try { // 尝试创建一个新的函数
      return new Function(code)
    } catch (err) { // 出现错误, 返回一个空函数
      errors.push({ err: err, code: code });
      return noop
    }
  }

  /**
   * 创建一个编译模板为函数的函数
   * @param {Function} compile - 编译函数
   * @returns {Function}
   */
  function createCompileToFunctionFn (compile) {
    var cache = Object.create(null);

    /**
     * 将模板编译为函数
     * @param {String} template - 模板
     * @param {Object} options - Vue 选项
     * @param {Vue} vm - Vue 实例
     */
    return function compileToFunctions (template, options, vm) {
      options = extend({}, options); // 复制编译选项, 避免影响原选项
      var warn$$1 = options.warn || warn;
      delete options.warn;

      { // 检测可能的 CSP 限制
        try {
          new Function('return 1');
        } catch (e) {
          if (e.toString().match(/unsafe-eval|CSP/)) { // CSP 限制警告
            warn$$1(
              'It seems you are using the standalone build of Vue.js in an ' +
              'environment with Content Security Policy that prohibits unsafe-eval. ' +
              'The template compiler cannot work in this environment. Consider ' +
              'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
              'templates into render functions.'
            );
          }
        }
      }

      var key = options.delimiters
        ? String(options.delimiters) + template
        : template;
      if (cache[key]) { // 检查缓存
        return cache[key]
      }

      var compiled = compile(template, options); // 编译模板

      { // 检查编译错误/提示
        if (compiled.errors && compiled.errors.length) {
          if (options.outputSourceRange) { // 输出编译错误信息
            compiled.errors.forEach(function (e) {
              warn$$1(
                "Error compiling template:\n\n" + (e.msg) + "\n\n" +
                generateCodeFrame(template, e.start, e.end), // 生成源代码的错误代码框架 (帮助定位错误)
                vm
              );
            });
          } else {
            warn$$1(
              "Error compiling template:\n\n" + template + "\n\n" +
              compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
              vm
            );
          }
        }
        if (compiled.tips && compiled.tips.length) { // 输出编译提示信息
          if (options.outputSourceRange) {
            compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
          } else {
            compiled.tips.forEach(function (msg) { return tip(msg, vm); });
          }
        }
      }

      var res = {}; // 将编译后的代码转换为函数
      var fnGenErrors = [];
      res.render = createFunction(compiled.render, fnGenErrors);
      res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
        return createFunction(code, fnGenErrors)
      });

      { // 检查函数生成错误 (这只会在编译器本身存在错误时发生)
        if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
          warn$$1( // 输出函数生成错误信息
            "Failed to generate render function:\n\n" +
            fnGenErrors.map(function (ref) {
              var err = ref.err;
              var code = ref.code;

              return ((err.toString()) + " in\n\n" + code + "\n");
          }).join('\n'),
            vm
          );
        }
      }

      return (cache[key] = res) // 缓存编译结果
    }
  }

  /**
   * 创建编译器创建器
   * @param {Function} baseCompile - 基本编译函数
   * @returns {Function}
   */
  function createCompilerCreator (baseCompile) {
    /**
     * 创建编译器
     * @param {Object} baseOptions - 基本编译选项
     * @returns {Object}
     */
    return function createCompiler (baseOptions) {
      /**
       * 编译函数
       * @param {String} template - 模板字符串
       * @param {Object} options - 编译选项
       * @returns {Object}
       */
      function compile (template, options) {
        var finalOptions = Object.create(baseOptions); // 使用基本选项对象创建最终选项对象
        var errors = []; // 存储编译错误的数组
        var tips = []; // 存储编译提示的数组

        var warn = function (msg, range, tip) { // 警告函数
          (tip ? tips : errors).push(msg); // 将错误或提示信息推入相应的数组
        };

        if (options) {
          if (options.outputSourceRange) { // 如果包含源代码的范围信息, 则需要进行源代码范围偏移
            var leadingSpaceLength = template.match(/^\s*/)[0].length;

            warn = function (msg, range, tip) { // 源代码范围偏移后的警告函数
              var data = { msg: msg };
              if (range) {
                if (range.start != null) {
                  data.start = range.start + leadingSpaceLength;
                }
                if (range.end != null) {
                  data.end = range.end + leadingSpaceLength;
                }
              }
              (tip ? tips : errors).push(data);
            };
          }
          if (options.modules) { // 合并自定义模块
            finalOptions.modules =
              (baseOptions.modules || []).concat(options.modules);
          }
          if (options.directives) { // 合并自定义指令
            finalOptions.directives = extend(
              Object.create(baseOptions.directives || null),
              options.directives
            );
          }
          for (var key in options) { // 复制其他选项
            if (key !== 'modules' && key !== 'directives') {
              finalOptions[key] = options[key];
            }
          }
        }

        finalOptions.warn = warn; // 将警告函数添加到最终选项对象中

        var compiled = baseCompile(template.trim(), finalOptions); // 调用基本编译函数进行编译
        { // 检查错误和提示
          detectErrors(compiled.ast, warn); // 检查模板中的表达式 (指令, 模板语法等)
        }
        compiled.errors = errors; // 将错误数组添加到编译结果对象中
        compiled.tips = tips; // 将提示数组添加到编译结果对象中
        return compiled
      }

      return {
        compile: compile, // 编译函数
        compileToFunctions: createCompileToFunctionFn(compile) // 将模板编译为函数的函数
      }
    }
  }

  // createCompilerCreator 允许创建编译器, 可以使用不同的解析器、优化器和代码生成器, 例如 SSR 优化编译器
  var createCompiler = createCompilerCreator(function baseCompile ( // 导出了一个使用默认组件的编译器
    template,
    options
  ) {
    var ast = parse(template.trim(), options);// 解析模板, 得到抽象语法树
    if (options.optimize !== false) { // 如果编译选项中指定了要进行优化
      optimize(ast, options); // 则对 AST 进行优化
    }
    var code = generate(ast, options); // 将优化后的 AST 生成渲染函数的代码
    return { // 返回一个对象 (包含了模板的抽象语法树, 渲染函数, 静态渲染函数数组)
      ast: ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  });

  var ref$1 = createCompiler(baseOptions); // 创建编译器
  var compile = ref$1.compile; // 获取编译函数和将模板编译为渲染函数的函数
  var compileToFunctions = ref$1.compileToFunctions;

  var div; // 解码器
  /**
   * 判断浏览器是否会对属性值中的换行符进行编码
   * @param {Boolean} href - 是否为 a 标签
   * @returns {Boolean}
   */
  function getShouldDecode (href) {
    div = div || document.createElement('div'); // 创建一个 div元素作为解码器
    div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>"; // 将 HTML字符串设置为元素的 innerHTML属性, 从而解码 HTML
    return div.innerHTML.indexOf('&#10;') > 0  // 是否包含换行符的编码字符 '&#10;'
  }

  var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false; // IE 在属性值中对换行符进行编码, 而其他浏览器不会
  var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false; // Chrome 在 a[href] 中对内容进行编码

  var idToTemplate = cached(function (id) { // 通过id名获取元素内部Html内容 (带缓存)
    var el = query(id); // 查询DOM元素
    return el && el.innerHTML // 获取内部Html
  });

  var mount = Vue.prototype.$mount; // 备份原始的 $mount方法
  /**
   * 将 Vue 实例挂载到 DOM 元素上
   * @param {HTMLElement|String} el - 要挂载的 DOM 元素或者选择器字符串
   * @param {Boolean} [hydrating] - 是否为服务端渲染
   * @returns {Vue} - 返回 Vue实例本身
   */
  Vue.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && query(el); // 查询 DOM元素

    if (el === document.body || el === document.documentElement) { // 如果 el是 html/body, 则警告不要将 Vue挂载到 html/body上, 应挂载到普通元素上
      warn(
        "Do not mount Vue to <html> or <body> - mount to normal elements instead."
      );
      return this
    }
    
    var options = this.$options;
    if (!options.render) { // 解析模板或 el, 并将其转换为渲染函数
      var template = options.template;
      if (template) { // 处理模板字符串或模板元素
        if (typeof template === 'string') {
          if (template.charAt(0) === '#') { // 如果模板以 #开头, 表示是一个选择器, 从中获取模板内容
            template = idToTemplate(template);
            if (!template) { // 如果模板不存在或为空, 发出警告
              warn(
                ("Template element not found or is empty: " + (options.template)),
                this
              );
            }
          }
        } else if (template.nodeType) { // 如果模板是一个 DOM元素, 则获取其 innerHTML作为模板内容
          template = template.innerHTML;
        } else { // 非法的模板选项, 发出警告
          {
            warn('invalid template option:' + template, this);
          }
          return this
        }
      } else if (el) { // 如果没有提供模板且存在 el, 则获取 el的 outerHTML作为模板内容
        template = getOuterHTML(el); // 获取元素的 HTML片段
      }
      if (template) { // 编译模板为渲染函数
        if (config.performance && mark) {
          mark('compile');
        }

        var ref = compileToFunctions(template, { // 编译模板为渲染函数
          outputSourceRange: "development" !== 'production', // 是否输出源码范围 (用于错误提示)
          shouldDecodeNewlines: shouldDecodeNewlines, // 是否需要解码换行符
          shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref, // 是否需要解码 href属性中的换行符
          delimiters: options.delimiters, // 指定模板的分隔符
          comments: options.comments // 是否保留模板中的注释
        }, this);
        var render = ref.render; // 渲染函数
        var staticRenderFns = ref.staticRenderFns; // 静态渲染函数数组
        options.render = render; // 将渲染函数和静态渲染函数数组添加到选项中
        options.staticRenderFns = staticRenderFns;

        if (config.performance && mark) { // 测量编译模板的性能
          mark('compile end');
          measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
        }
      }
    }
    return mount.call(this, el, hydrating) // 调用原始的 $mount方法, 实际进行挂载操作
  };

  /**
   * 获取元素的序列化HTML片段 (包括其后代和元素本身)
   * @param {HTMLElement} el - DOM元素
   * @returns {String}
   */
  function getOuterHTML (el) {
    if (el.outerHTML) { // 元素的outerHTML存在, 返回HTML片段
      return el.outerHTML
    } else { // 元素的outerHTML不存在, 创建一个div包裹元素后返回div的innerHTML (例: IE9-11中的SVG标签无innerHTML, outerHTML属性)
      var container = document.createElement('div');
      container.appendChild(el.cloneNode(true)); // div包裹元素
      return container.innerHTML // div的innerHTML便是元素的outerHTML
    }
  }

  Vue.compile = compileToFunctions; // 用于将模板字符串编译为渲染函数

  return Vue;

}));
