/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */

/**
 * 这个函数就是判断一个对象是不是简单对象
 * 
 * 简单对象是怎么定义的呢？ 简单对象就是通过对象字面量或者new Object()创建的
 * 
 * 所以函数的实现是根据这两点来判断的
 * 
 * @export
 * @param {any} obj 
 * @returns 
 */
export default function isPlainObject(obj) {
  // typeof 来简单判断obj的类型，如果不是object,
  // 或者是object但是是null(typeof null 为 object 了解下)的话，就可以先return false
  if (typeof obj !== 'object' || obj === null) return false

  // 这里挺巧妙的, 通过原型链来判断是不是简单的对象
  // 因为通过对象字面量和new Object创建的对象的原型链都是 obj->obj.prototype->null
  // 而通过别的方式的原型链就会和上述的不一样。
  // 下面通过一个循坏，找到对象的原型链的顶部，然后判断对象的原型链的顶部和它的原型是不是相等，结果就为答案
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
