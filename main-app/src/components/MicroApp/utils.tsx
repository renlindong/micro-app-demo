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