import ReactDom from "react-dom/client";
import Widget from "./components/widget";
import widgetStyles from "./index.css?inline";

const normalizeAttribute = (attribute) => {
  return attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

class WidgetWebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const props = this.getPropsFromAttributes();

    const container = document.createElement("div");
    container.className = "pulsea-widget";

    const style = document.createElement("style");
    style.textContent = widgetStyles;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    const root = ReactDom.createRoot(container);
    root.render(<Widget {...props} />);
  }

  getPropsFromAttributes() {
    const props = {};
    for (const { name, value } of this.attributes) {
      props[normalizeAttribute(name)] = value;
    }
    return props;
  }
}

export default WidgetWebComponent;
