<template>
  <div class="nav-item" :class="{ selected }" @click="select">
    <user class="name" :user="user.name"/>
  </div>
</template>

<script>
import User from '@/components/User.vue'

export default {
  components: {
    User
  },
  props: {
    user: { type: Object, required: true },
    selected: { type: Boolean, required: true },
  },
  emits: ['selectUser'],
  methods: {
    select () {
      this.$emit('selectUser', this.selected
        ? null
        : this.user.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  display: block;
  font-weight: 500;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
