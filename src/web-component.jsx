import { createRoot } from "react-dom/client";
import Widget from "./components/widget";

export const normalizeAttribute = (attribute) => {
  return attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

class WidgetWebComponent extends HTMLElement {
  constructor() {
    super();
    this.root = null;
  }

  connectedCallback() {
    const props = this.getPropsFromAttributes();
    this.root = createRoot(this);
    this.root.render(<Widget {...props} />);
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }

  getPropsFromAttributes() {
    const props = {};
    for (const { name, value } of this.attributes) {
      props[normalizeAttribute(name)] = value;
    }
    return props;
  }
}

// Auto-register when script loads
if (typeof window !== "undefined" && !customElements.get("my-widget")) {
  customElements.define("my-widget", WidgetWebComponent);
}

export default WidgetWebComponent;
