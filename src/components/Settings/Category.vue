<template>
  <div class="nav-item" :class="{ selected, collapsed }" :title="collapsed ? category[0] : null" @click="select">
    <i class="icon fa fa-fw" :class="category[2]"></i>
    <p v-if="!collapsed" class="ml-3 font-medium">{{ category[0] }}</p>
  </div>
</template>

<script>
export default {
  props: {
    // [ name, id, icon ]
    category: { type: Array, required: true },
    selected: Boolean,
    // Collapsed sidebar: icon only
    collapsed: Boolean
  },
  emits: ['select'],
  methods: {
    select () {
      this.$emit('select', this.category[1])
    }
  }
}
</script>

<style lang="scss" scoped>
.icon {
  font-size: 1.125rem;
}
</style>
