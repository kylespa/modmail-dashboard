<template>
  <div>
    <category v-for="d in visibleCategories" :key="d[1]" :category="d" :selected="$route.params.category === d[1]"
    :collapsed="collapsed" @select="select"/>
  </div>
</template>

<script>
import Category from './Category.vue'

export default {
  components: {
    Category
  },
  props: {
    category: { type: String, required: true },
    collapsed: Boolean
  },
  emits: ['select'],
  inject: ['isDeveloper'],
  data () {
    return {
      // [ name, id, icon, developer only ]
      categories: [
        ['General', 'general', 'fa-sliders'],
        ['Appearance', 'appearance', 'fa-paint-brush'],
        ['Developer', 'developer', 'fa-code', true]
      ]
    }
  },
  computed: {
    visibleCategories () {
      return this.categories.filter(d => !d[3] || this.isDeveloper)
    }
  },
  methods: {
    select (category) {
      this.$emit('select', category)
      this.$router.replace(`/settings/${category}`)
    }
  }
}
</script>
