import templateOnly from "@ember/component/template-only";

export default Object.assign(templateOnly(), {
  shouldRender() {
    return (
      typeof document !== "undefined" &&
      document.body?.classList?.contains("navigation-topics")
    );
  },
});


