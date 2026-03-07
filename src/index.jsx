import WidgetWebComponent from "./web-component";

customElements.define("my-widget", WidgetWebComponent);

const initWidget = () => {
  const scripts = document.querySelectorAll('script[data-pulsea-widget]');
  
  scripts.forEach((script) => {
    const projectId = script.getAttribute("data-project-id");
    if (projectId) {
      const widget = document.createElement("my-widget");
      widget.setAttribute("project-id", projectId);
      document.body.appendChild(widget);
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
