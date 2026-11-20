<template>
  <div class="mobile-bar global-trans-ignore items-center select-none">
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
const titles = {
  thread: 'Thread',
  settings: 'Settings'
}

export default {
  props: {
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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  height: 2.75rem;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 30;
}
.btn-menu {
  @include themify {
      color: themed('text');
  }
  cursor: pointer;
  height: 100%;
  justify-self: start;
  width: 2.75rem;
}
.title {
  grid-column: 2;
  white-space: nowrap;
}
.filter-pill {
  @include themify {
    background: themed('bg-dark-3');
    color: themed('text-muted');
  }
  border-radius: $spacing * $roundness;
  cursor: pointer;
  grid-column: 3;
  justify-self: end;
  margin-right: $spacing * .5rem;
  max-width: 100%;
  min-width: 0;
  padding: $spacing * .25rem $spacing * .625rem;
}
.filter-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>