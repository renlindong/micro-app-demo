import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";

import { patchDocument2Shadow } from "./utils"

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

const createScript = (code?: string): string => {
  return `(function(window, self, global, document) {
      ${code}\n
    }).bind(window.__wujie__)(
      window.__wujie__.proxy,
      window.__wujie__.proxy,
      window.__wujie__.proxy,
      window.__wujie__.document,
    )`;
};

const MicroApp: React.FC<MicroAppProps> = (props) => {
  const { src, style, className } = props;

  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [scriptList, setScriptList] = useState<HTMLScriptElement[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
        .then((res) => {
          const domParser = new DOMParser();
          const html = domParser.parseFromString(res, "text/html");
          const scriptList = Array.from(
            html.documentElement.querySelectorAll("script")
          );
          scriptList.forEach((item) => item.parentElement?.removeChild(item));
          const serializer = new XMLSerializer();
          setScriptList(scriptList);
          setDoc(serializer.serializeToString(html));
        });
    }
  }, []);

  const handleLoad = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      // @ts-ignore
      win.__wujie__ = {
        document: shadowRoot
      }
      // @ts-ignore
      win.__wujie__.proxy = new Proxy(
        { version: "0.1" },
        {
          get(target, key) {
            console.log(key)
            // @ts-ignore
            return Reflect.get(shadowRoot, key);
          },
          set(target, key, value) {
            console.log(key)
            // @ts-ignore
            return Reflect.set(shadowRoot, key, value);
          },
        }
      );
    }
    // @ts-ignore
    shadowRoot?.appendChild(win?.document.head);
    // @ts-ignore
    shadowRoot?.appendChild(win?.document.body);
    // @ts-ignore
    patchDocument2Shadow(shadowRoot, win?.document)
    // 处理script
    Promise.all(
      scriptList.map((sc) => {
        return new Promise<HTMLScriptElement>((resolve) => {
          if (sc.src) {
            return fetch(sc.src)
              .then((res) => res.text())
              .then((res) => {
                sc.removeAttribute("src");
                sc.innerText = res;
                resolve(sc);
              });
          }
          return resolve(sc);
        });
      })
    ).then((list) => {
      
      const html = win?.document.querySelector("html");
      
      list.forEach((item) => {
        const s = win?.document.createElement("script");
        if (s) {
          s.innerText = createScript(item.innerText)
          // s.innerText = item.innerText
          if (html) {
            html.appendChild(s);
          }
        }
      });
    });
  };

  return (
    <div
      ref={createShadowRoot}
      className={classNames("micro-app", className)}
      style={style}
    >
      {shadowRoot && (
        <MicroAppContent container={shadowRoot}>
          {doc && (
            <iframe
              ref={iframeRef}
              style={{ width: 0, height: 0 }}
              frameBorder={0}
              srcDoc={doc}
              onLoad={handleLoad}
            />
          )}
        </MicroAppContent>
      )}
    </div>
  );
};

export default MicroApp;
