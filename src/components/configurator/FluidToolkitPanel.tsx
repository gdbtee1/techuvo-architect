import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  activeKey: string;
  children: ReactNode;
};

export default function FluidToolkitPanel({
  activeKey,
  children,
}: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;

    const updateHeight = () => {
      setHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeKey]);

  return (
    <div
      ref={wrapper}
      className="fluid-toolkit-panel"
      style={{
        height: height === undefined ? "auto" : `${height}px`,
      }}
    >
      <div
        key={activeKey}
        ref={content}
        className="fluid-toolkit-content"
      >
        {children}
      </div>
    </div>
  );
}
