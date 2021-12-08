import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";

export type MicroAppProps = {
  className?: string;
  style?: React.CSSProperties;
  src?: string;
};

type MicroAppContentProps = {
  container: ShadowRoot;
};

const MicroAppContent: React.FC<MicroAppContentProps> = ({
  children,
  container,
}) => {
  return ReactDOM.createPortal(children, container as any);
};

const MicroApp: React.FC<MicroAppProps> = (props) => {
  const { src, style, className } = props;

  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const createShadowRoot = (ele: HTMLDivElement) => {
    if (ele && !ele.shadowRoot) {
      const root = ele.attachShadow({ mode: "open" });
      setShadowRoot(root);
    }
  };
  const [doc, setDoc] = useState("");

  useEffect(() => {
    if (src) {
      fetch(src!)
        .then((res) => res.text())
        .then(res => {
          const domParser = new DOMParser()
          const html = domParser.parseFromString(res, 'text/html')
          const scriptList = Array.from(html.documentElement.querySelectorAll('script'))
          scriptList.forEach(item => item.parentElement?.removeChild(item))
          Promise.all(scriptList.map(sc => {
            return new Promise((resolve, reject) => {
              const src = sc.src
              if (src) {
                return fetch(src)
                  .then(res => res.text())
                  .then(res => {
                    sc.innerHTML = res
                    sc.removeAttribute('src')
                    sc.removeAttribute('type')
                    resolve(sc)
                  })
              }
              resolve(sc)
            })
          })).then((list) => {
            list.forEach(sc => {
              html.body.appendChild(sc as HTMLScriptElement)
            })
            const serializer = new XMLSerializer();
            // console.log(serializer.serializeToString(html))
            setDoc(serializer.serializeToString(html))
          })
        })
    }
  }, []);

  const handleLoad = () => {
    console.log(iframeRef)
    const win = iframeRef.current?.contentWindow
    if (win) {
      // @ts-ignore
      win.__wujie__ = {
        name: "wujie"
      }
    }
    
    // const sc = `(function(window) { console.log(window)) })(window.__wujie__)`
    const sc = iframeRef.current?.contentDocument?.createElement('script')
    if (sc) {
      sc.innerText = `(function(window) { console.log(window) })(window.__wujie__)`
      iframeRef.current?.contentDocument?.body.appendChild(sc)
    }
  }

  return (
    <div
      ref={createShadowRoot}
      className={classNames("micro-app", className)}
      style={style}
    >
      {shadowRoot && <MicroAppContent container={shadowRoot}>
        <iframe ref={iframeRef} style={{ width: 0, height: 0 }} frameBorder={0} srcDoc={doc} onLoad={handleLoad} />
        <div>123</div>
      </MicroAppContent>}
    </div>
  );
};

export default MicroApp;
