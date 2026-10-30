<template>
  <div v-if="me" class="user-panel flex items-center select-none">
    <img class="avatar rounded-full" :src="`/avatars/${me.id}`" alt="">
    <div class="names flex-1 ml-2">
      <p class="display-name font-semibold">{{ me.globalName || me.username }}</p>
      <p class="username text-xs">{{ me.username }}</p>
    </div>
    <div class="actions flex">
      <div class="icon-btn" :class="{ active: $route.name === 'settings' }" title="Settings" @click="openSettings">
        <i class="text-lg fa fa-cog"></i>
      </div>
      <a class="icon-btn logout" href="/logout" title="Log out">
        <i class="text-lg fa fa-sign-out"></i>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['me', 'settingsCategory'],
  methods: {
    openSettings () {
      this.$router.push(`/settings/${this.settingsCategory}`)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

// Pinned at full width, so it stays the same when the sidebar collapses
.user-panel {
  @include themify {
    background: themed('bg-dark-3');
  }
  bottom: .5rem;
  box-shadow: 0 .25rem 1rem rgba(#000, .25);
  left: .5rem;
  padding: .375rem .375rem .375rem .5rem;
  position: absolute;
  border-radius: .5rem;
  width: 15rem;
  z-index: 10;
}
@media (max-width: $mobile-max) {
  // Span the drawer, which can be narrower or wider than 16rem
  .user-panel {
    right: .5rem;
    width: auto;
  }
}

.avatar {
  flex-shrink: 0;
  height: 2rem;
  width: 2rem;
}
.names {
  line-height: 1.25;
  min-width: 0;
}
.display-name, .username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.username {
  @include themify {
    color: themed('text-muted');
  }
}
.logout:hover {
  @include themify {
    color: $red;
  }
}
</style>
