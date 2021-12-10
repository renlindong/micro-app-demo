export const patchDocument2Shadow = (shadow: ShadowRoot, document: Document) => {
  const define = Object.defineProperty
  define(shadow, 'head', {
    get() {
      return shadow.querySelector('head')
    }
  })
  define(shadow, 'body', {
    get() {
      return shadow.querySelector('body')
    }
  })
  define(shadow, 'createElement', {
    get() {
      return document.createElement.bind(document)
    }
  })
}

/** 
 * 1. 在window上注入wujie变量
 * 2. 重写event listener
 * 3. 新建代理对象
*/

export const createProxy = (shadowRoot: ShadowRoot, iframeWindow: Window, globalWindow: Window) => {
  const microWindow = {
    document: shadowRoot as any
  } as Window
  inject(microWindow)
  patchDocument2Shadow(shadowRoot, iframeWindow.document)
  // TODO: 处理副作用
  const proxyWindow: WindowProxy = new Proxy(microWindow, {
    get(target, key) {
      if (['window', 'self', 'globalThis'].includes(key as string)) {
        return proxyWindow
      }
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key)
      }
      return Reflect.get(iframeWindow, key)
    },
    set(target, key, value) {
      return Reflect.set(target, key, value)
    }
  })
  return proxyWindow
}

const inject = (microWindow: any) => {
  microWindow.__POWERED_BY_WUJIE__ = true
}