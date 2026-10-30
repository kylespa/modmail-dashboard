<template>
  <div>
    <category v-for="d in categories" :key="d[1]" :category="d" :selected="$route.params.category === d[1]"
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
  data () {
    return {
      categories: [
        ['General', 'general', 'fa-sliders'],
        ['Appearance', 'appearance', 'fa-paint-brush']
      ]
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
