/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */


/**
 * 这个代码简直是精髓。
 * 这个代码的作用是将一串函数，让它们从右往左执行
 * 比如说，a,b,c三个函数，输入到下面的代码中，会得到 (...args) => a(b(c(...args)));
 * 
 * @export
 * @param {any} funcs 
 * @returns 
 */
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
