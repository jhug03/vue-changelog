<script setup>
import { ref, computed, onMounted } from "vue";
import { marked } from 'marked';

const releases = ref([]);
const tabs = ['Releases', 'Issues']
const activeIndex = ref(0)
const buttonRefs = ref([])

async function fetchReleases(chosenTab) {
  releases.value = [];

  const stable = "https://raw.githubusercontent.com/vuejs/core/main/CHANGELOG.md";
  const issues = "https://api.github.com/repos/vuejs/core/issues?state=closed&per_page=10";

  try {
    if (chosenTab === 1) { // Issues
      const response = await fetch(issues);
      const issuesData = await response.json();
      releases.value = issuesData.map(issue => ({
        title: issue.title,
        date: issue.closed_at,
        categories: [{ type: 'Issue', content: marked(issue.body || '') }],
        expanded: false
      }));
    }
    else if (chosenTab === 0) { // Releases
      const response = await fetch(stable);
      const markdown = await response.text();
      releases.value = parseReleases(markdown).slice(0, 15);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function parseReleases(markdown) {
  const releases = [];
  const sections = markdown.split(/^##\s+/m).slice(1);

  for (const section of sections) {
    const lines = section.split('\n');
    const heading = lines[0].trim();
    const body = lines.slice(1).join('\n');

    const versionMatch = heading.match(/(\d+\.\d+\.\d+(?:-\w+\.\d+)?)/);
    const dateMatch = heading.match(/(\d{4}-\d{2}-\d{2})/);

    if (!versionMatch) continue;

    const subSections = body.split(/^###\s+/m).slice(1);
    const categories = subSections.map(sub => {
      const subLines = sub.split('\n');
      return {
        type: subLines[0].trim(),
        content: marked(subLines.slice(1).join('\n').trim())
      };
    });

    releases.push({
      title: versionMatch[1],
      date: dateMatch ? dateMatch[1] : new Date().toISOString(),
      categories: categories,
      expanded: false
    });
  }
  return releases;
}

function formatReleaseDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
}

function toggleExpanded(index) {
  releases.value[index].expanded = !releases.value[index].expanded;
}

const sliderStyle = computed(() => {
  const activeBtn = buttonRefs.value[activeIndex.value];

  if (!activeBtn) return { left: 0, width: 0, opacity: 0 };

  return {
    left: `${activeBtn.offsetLeft}px`,
    width: `${activeBtn.offsetWidth}px`,
    height: `${activeBtn.offsetHeight}px`,
    opacity: 1
  };
});

const activateTab = (index) => {
  activeIndex.value = index;

  if (index === 0) {
    fetchReleases(0);
  } else if (index === 1) {
    fetchReleases(1);
  }
}

onMounted(() => {
  buttonRefs.value = buttonRefs.value.slice(0, tabs.length)

  fetchReleases(0);
})
</script>

<template>
  <section class="h-full">
    <main class="h-full p-10 text-white">
      <section class="mx-auto mt-12 flex max-w-4xl flex-col">
        <header>
          <h1 class="text-3xl">
            <span class="text-green-400">Vue</span>
            <span class="">
              {{ activeIndex === 0 ? ' releases' : activeIndex === 1 ? ' issues' : 'discussions' }}
            </span>
          </h1>
        </header>

        <!-- Release Filters -->
        <div class="p-0 flex items-center mt-6 w-full z-100 backdrop-blur-sm">
          <nav ref="navContainer" aria-label="Release filters" class="relative flex items-center">

            <div class="absolute bg-white/10 rounded-md transition-all duration-300 ease-out" :style="sliderStyle">
            </div>

            <button v-for="(tab, index) in tabs" :key="tab" :ref="(el) => (buttonRefs[index] = el)"
              @click="activateTab(index)" :class="[
                'relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-300 whitespace-nowrap cursor-pointer',
                activeIndex === index ? 'text-white' : 'text-white/60 hover:text-white'
              ]">
              {{ tab }}
            </button>
          </nav>
        </div>

        <section class="mt-6 w-full" aria-label="Release list">
          <div v-if="releases.length === 0" class="text-center text-white" role="status">
            <p>Loading...</p>
          </div>

          <article v-for="(release, index) in releases" :key="release.title"
            class="border-b border-white/20 transition-all duration-500 ease-in-out overflow-hidden"
            :class="release.expanded ? 'max-h-[2000px]' : 'max-h-14'">

            <button
              class="flex w-full cursor-pointer items-center gap-3 px-1 py-4 text-left appearance-none bg-transparent border-none"
              @click="toggleExpanded(index)" :aria-expanded="release.expanded">
              <h2 v-if="release.title && release.title.length > 2" class="text-base font-bold break-words">
                {{ release.expanded || release.title.length <= 40 ? release.title : release.title.slice(0, 40) + '...'
                }} </h2>
                  <span class="text-xs opacity-50" aria-hidden="true">•</span>
                  <time :datetime="release.date" class="text-sm opacity-50">{{ formatReleaseDate(release.date) }}</time>

                  <p v-if="index === 0"
                    class="ml-3 flex items-center rounded-full border border-green-500/50 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
                    Latest
                  </p>

                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="ml-auto h-4 w-4 transition-transform duration-300"
                    :class="release.expanded ? 'rotate-180' : ''" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
            </button>

            <!-- Content. Could probs do with better semantics -->
            <div class="grid transition-[grid-template-rows] duration-500 ease-in-out"
              :class="release.expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
              <div class="overflow-hidden">
                <div class="sm:px-10 -mt-4 text-sm">
                  <section v-for="cat in release.categories" :key="cat.type" class="my-6">
                    <h3 class="font-bold text-xs tracking-wider uppercase" :class="{
                      'text-green-400': cat.type === 'Features',
                      'text-purple-400': cat.type === 'Bug Fixes',
                      'text-blue-400': cat.type === 'Reverts',
                      'text-yellow-400': cat.type === 'Performance Improvements',
                    }">
                      {{ cat.type }}
                    </h3>
                    <div class="opacity-70 changelog-content" v-html="cat.content" />
                  </section>
                  <p v-if="release.categories.length === 0" class="opacity-50 italic">
                    No specific change categories listed.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  </section>
</template>

<style>
:root {
  background-color: rgb(0, 15, 0);
}

.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  height: 0;
  opacity: 0;
}

.changelog-content ul {
  list-style: disc;
  padding-left: 1.25rem;
}

.changelog-content a {
  color: #4ade80;
  text-decoration: underline;
}
</style>