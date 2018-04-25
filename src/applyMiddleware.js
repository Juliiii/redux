import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */

/**
 * 该部分就是为store添加middleware, 来扩展redux的功能
 * 这个函数如果要看懂为什么这个写的话，得和createStore
 * 一起看。
 * 
 * createStore的开头，有一段这样的代码：
 * 
 * if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
     enhancer = preloadedState
     preloadedState = undefined
   }

   if (typeof enhancer !== 'undefined') {
     if (typeof enhancer !== 'function') {
       throw new Error('Expected the enhancer to be a function.')
     }

     return enhancer(createStore)(reducer, preloadedState)
   }
 * 
 * 
 * 第一个if的情景是 const store = createStore(reducers, enhancer),
 * 这个时候, createStore的第二个形参是 preloadedState，但是实参是enhancer，所以第一个
 * if的作用就是将enhancer指向我们传入的enhancer
 * 
 * 第二个if的情景是 当我们确实传入了enhancer的时候，这个函数执行到 return enhancer(createStore)(reducer, preloadedState)
 * 就停了，舞台就来到了applyMiddleware.
 * 
 * 我们可以注意到applyMiddleware的返回值是一个参数为createStore，返回值为一个函数的函数。
 * 没错，createStore的那段代码，把自己作为参数传进了applyMiddleware的返回值中并执行了,
 * 返回一个函数，这个函数接受reducer和preloadedState作为参数, 返回了最后我们想要的东西。
 * 
 * 然后applyMiddleware的大体运行流程如上，细节如下
 * 
 * 当我们dispatch时, action是会经过每个middleware，执行middleware的逻辑的, 最后action是会到达store的dispatch,
 * 然后根据action和reducer来计算出新的state.
 * 
 * 下面有几个细节:
 * 
 * @export
 * @param {any} middlewares 
 * @returns 
 */
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    // 1、也许有的同学一开始看到这个会有点蒙蔽, 我当时看到也是觉得奇怪, 这个dispatch的逻辑不对劲
    // 而且, 还把这个dispatch作为middleware的参数传了进去,代表在中间件时使用dispatch的逻辑是这个
    // 但是看到下面, dispatch = compose(...chain)(store.dispatch)
    // 还行, 根据作用域链, 我们可以知道在中间件中调用dispatch的时候, 其实就是调用了这个dispatch, 而不是一开始声明的逻辑
    // 而这个dispatch是已经经过compose的包装的了.逻辑到这里的时候就很清楚了
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }

    // 2、compose是如何将中间件串联在一起的?
    // 首先一个最简单的中间件的格式: store => next => action => {}
    // 这一行代码就是传入了store, 获得了 next => action => {} 的函数
    const chain = middlewares.map(middleware => middleware(middlewareAPI))

    // 这一行代码其实拆分成两行
    // const composeRes = compose(...chain);
    // dispatch = composeRes(store.dispatch);
    // 第一行是通过compose, 将一个 这样 next => action => {} 的数组组合成 (...args) => f(g(b(...args))) 这么一个函数
    // 第二行通过传入store.dispatch, 这个store.dispatch就是最后一个 next => action => {}的next参数
    // 传入后 (...args) => f(g(b(...args)) 就会执行, 执行时, store.dispacth作为b的next传入, b函数结果action => {}会作为
    // g的next传入, 以此类推. 所以最后dispatch作为有中间件的store的dispatch属性输出, 当用户调用dispatch时, 中间件就会一个一个
    // 执行完逻辑后, 将执行权给下一个, 直到原始的store.dispacth, 最后计算出新的state
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
