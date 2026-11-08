// Extends the default VitePress theme with our own styles and components.
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import DotnetVsReact from "./components/DotnetVsReact.vue";
import FileTree from "./components/FileTree.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Registered globally → usable in any .md file as <DotnetVsReact> / <FileTree>
    app.component("DotnetVsReact", DotnetVsReact);
    app.component("FileTree", FileTree);
  },
} satisfies Theme;
