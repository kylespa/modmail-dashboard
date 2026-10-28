<template>
  <div class="mobile-bar global-trans-ignore flex items-center select-none">
    <div class="btn-menu flex items-center justify-center" role="button" aria-label="Open menu" @click="$emit('menu')">
      <i class="text-xl fa fa-bars"></i>
    </div>
    <p class="title px-3 text-lg font-semibold">{{ title }}</p>
    <div v-if="filter" class="filter-pill flex items-center text-sm" @click="$emit('clearFilter')">
      <span class="filter-name">{{ filter }}</span>
      <i class="fa fa-times ml-2"></i>
    </div>
  </div>
</template>

<script>
// The thread list has its own heading, so the bar shows the app name there
const titles = {
  thread: 'Thread',
  settings: 'Settings'
}

export default {
  props: {
    // Name of the user the thread list is currently filtered by
    filter: String
  },
  emits: ['menu', 'clearFilter'],
  computed: {
    title () {
      return titles[this.$route.name] || 'Modmail Dashboard'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.mobile-bar {
  @include themify {
    background: themed('bg-dark-1');
    color: themed('text');
  }
  height: 2.75rem;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 30;
}
.btn-menu {
  @include themify {
    background: themed('primary');
  }
  color: #fff;
  cursor: pointer;
  height: 100%;
  width: 2.75rem;
}
.title {
  white-space: nowrap;
}
.filter-pill {
  @include themify {
    background: themed('bg-dark-3');
    color: themed('text-muted');
  }
  border-radius: $spacing * .5rem;
  cursor: pointer;
  margin-left: auto;
  margin-right: $spacing * .5rem;
  max-width: 50%;
  min-width: 0;
  padding: $spacing * .25rem $spacing * .625rem;
}
.filter-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>