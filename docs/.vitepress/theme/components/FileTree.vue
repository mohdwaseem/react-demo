<!--
  Annotated, clickable project tree. Data lives in ../trees.ts so the Markdown stays readable.
  Usage:  <FileTree name="frontend" />
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import { trees, type TreeNode } from "../trees";

const props = defineProps<{ name: keyof typeof trees; title?: string }>();
const nodes = computed<TreeNode[]>(() => trees[props.name] ?? []);
const filter = ref("");

const visible = computed(() =>
  filter.value.trim() === ""
    ? nodes.value
    : nodes.value.filter((n) =>
        (n.path + " " + (n.note ?? "")).toLowerCase().includes(filter.value.trim().toLowerCase()),
      ),
);

function icon(n: TreeNode) {
  if (n.path.endsWith("/")) return "📁";
  if (/\.(tsx|jsx)$/.test(n.path)) return "⚛️";
  if (/\.(ts|mts|js|mjs)$/.test(n.path)) return "📜";
  if (/\.cs$/.test(n.path)) return "🟣";
  if (/\.(json|csproj|slnx|config)$/.test(n.path)) return "⚙️";
  if (/\.css$/.test(n.path)) return "🎨";
  if (/^\.env|\.env/.test(n.path)) return "🔑";
  if (/\.md$/.test(n.path)) return "📝";
  return "📄";
}
</script>

<template>
  <div class="ft">
    <div class="ft-head">
      <strong>{{ title ?? name }}</strong>
      <input v-model="filter" class="ft-filter" placeholder="Filter files…" aria-label="Filter files" />
    </div>
    <ul>
      <li v-for="n in visible" :key="n.path + n.depth" :style="{ paddingLeft: 12 + n.depth * 20 + 'px' }">
        <span class="ft-name">
          <span class="ft-icon">{{ icon(n) }}</span>
          <a v-if="n.link" :href="withBase(n.link)">{{ n.path }}</a>
          <code v-else>{{ n.path }}</code>
        </span>
        <span v-if="n.note" class="ft-note">{{ n.note }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ft {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin: 20px 0;
  overflow: hidden;
  font-size: 14px;
}
.ft-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ft-filter {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 13px;
  background: var(--vp-c-bg);
}
ul {
  list-style: none;
  margin: 0 !important;
  padding: 6px 0 !important;
}
li {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  align-items: baseline;
  padding: 3px 12px;
  margin: 0 !important;
  max-width: none !important;
}
li:hover {
  background: var(--vp-c-bg-soft);
}
.ft-name {
  white-space: nowrap;
  font-family: var(--vp-font-family-mono);
}
.ft-icon {
  display: inline-block;
  width: 1.6em;
}
.ft-name code {
  background: none !important;
  padding: 0 !important;
}
.ft-note {
  color: var(--vp-c-text-2);
  font-size: 13.5px;
}
</style>
