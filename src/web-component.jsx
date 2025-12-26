import ReactDOM from "react-dom/client";
import { Widget } from "./components/widget";
import "./index.css";

/**
 * Convert kebab-case → camelCase
 * project-id -> projectId
 */
function normalizeAttribute(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

class WidgetWebComponent extends HTMLElement {
  constructor() {
    super();
    this._root = null;
  }

  /**
   * Attributes that should trigger re-render
   */
  static get observedAttributes() {
    return ["project-id"];
  }

  /**
   * Called when <my-widget> is added to DOM
   */
  connectedCallback() {
    if (typeof window === "undefined") return; // ✅ SSR safe
    if (this._root) return; // prevent double mount

    // ✅ Shadow DOM for style isolation
    this.attachShadow({ mode: "open" });

    const props = this.getPropsFromAttributes();

    this._root = ReactDOM.createRoot(this.shadowRoot);
    this._root.render(<Widget {...props} />);
  }

  /**
   * React to attribute changes
   */
  attributeChangedCallback() {
    if (!this._root) return;
    this._root.unmount();
    this._root = null;
    this.connectedCallback();
  }

  /**
   * Cleanup
   */
  disconnectedCallback() {
    if (this._root) {
      this._root.unmount();
      this._root = null;
    }
  }

  /**
   * Read props from attributes
   */
  getPropsFromAttributes() {
    const props = {};
    for (const attr of this.attributes) {
      props[normalizeAttribute(attr.name)] = attr.value;
    }
    return props;
  }
}

/**
 * ✅ Register element safely
 */
if (typeof window !== "undefined" && !customElements.get("my-widget")) {
  customElements.define("my-widget", WidgetWebComponent);
}

/**
 * ✅ OPTIONAL: Auto-mount widget (no <my-widget> required)
 * <script src="widget.umd.js" data-project-id="55"></script>
 */
(function autoMount() {
  if (typeof window === "undefined") return;

  const script = document.currentScript;
  if (!script) return;

  const projectId = script.getAttribute("data-project-id");
  if (!projectId) return;

  const el = document.createElement("my-widget");
  el.setAttribute("project-id", projectId);
  document.body.appendChild(el);
})();

export default WidgetWebComponent;
