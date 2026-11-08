<!--
  Side-by-side comparison card.
  Usage in Markdown (keep the blank lines so the slot content is parsed as Markdown):

  <DotnetVsReact>
  <template #dotnet>

  ```csharp
  ...
  ```

  </template>
  <template #react>

  ```tsx
  ...
  ```

  </template>
  </DotnetVsReact>
-->
<script setup lang="ts">
defineProps<{ dotnetTitle?: string; reactTitle?: string }>();
</script>

<template>
  <div class="dvr-wrap">
  <div class="dvr">
    <section class="dvr-col dvr-dotnet">
      <header><span class="dot" />{{ dotnetTitle ?? "In .NET you write" }}</header>
      <div class="dvr-body"><slot name="dotnet" /></div>
    </section>
    <section class="dvr-col dvr-react">
      <header><span class="dot" />{{ reactTitle ?? "In React / Next.js you write" }}</header>
      <div class="dvr-body"><slot name="react" /></div>
    </section>
  </div>
  </div>
</template>

<style scoped>
.dvr-wrap {
  container-type: inline-size;
}
.dvr {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 20px 0;
}
/* Side by side only when the content column is wide enough to show the code without cutting it. */
@container (min-width: 820px) {
  .dvr {
    grid-template-columns: 1fr 1fr;
  }
}
/* Line numbers waste space in these small comparison snippets. */
.dvr-body :deep(.line-numbers-wrapper) {
  display: none;
}
.dvr-body :deep(div[class*="language-"].line-numbers-mode) {
  padding-left: 0 !important;
}
.dvr-body :deep(div[class*="language-"].line-numbers-mode pre) {
  padding-left: 0 !important;
}
.dvr-body :deep(div[class*="language-"].line-numbers-mode code) {
  padding-left: 20px;
}
.dvr-col {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  min-width: 0;
  background: var(--vp-c-bg-soft);
}
.dvr-col header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.dvr-dotnet header {
  color: var(--dotnet);
  border-bottom: 2px solid var(--dotnet);
}
.dvr-react header {
  color: var(--react);
  border-bottom: 2px solid var(--react);
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: currentColor;
}
.dvr-body {
  padding: 0 14px 4px;
}
.dvr-body :deep(div[class*="language-"]) {
  margin: 12px -14px 8px !important;
  border-radius: 0 !important;
}
</style>
