<template>
  <div v-if="me" class="account-menu global-trans-ignore select-none" :class="{ compact }">
    <div class="account-btn flex items-center rounded" :class="{ open }" @click="open = !open">
      <img class="avatar rounded-full" :src="`/avatars/${me.id}`" alt="">
      <template v-if="!compact">
        <span class="name font-semibold ml-2">{{ me.username }}</span>
        <i class="fa fa-caret-down ml-2"></i>
      </template>
    </div>
    <transition name="fade">
      <div v-if="open" class="dropdown rounded py-1">
        <div class="item flex items-center" @click="openSettings">
          <i class="fa fa-cog fa-fw mr-2"></i>Settings
        </div>
        <a class="item logout flex items-center" href="/logout">
          <i class="fa fa-sign-out fa-fw mr-2"></i>Log Out
        </a>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  inject: ['me', 'settingsCategory'],
  props: {
    // Avatar only, for the mobile bar
    compact: Boolean
  },
  data () {
    return { open: false }
  },
  watch: {
    '$route' () {
      this.open = false
    }
  },
  methods: {
    openSettings () {
      this.$router.push(`/settings/${this.settingsCategory}`)
    },
    clickOutside (ev) {
      if (this.$el.contains && !this.$el.contains(ev.target))
        this.open = false
    },
    keydown (ev) {
      if (ev.key === 'Escape')
        this.open = false
    }
  },
  mounted () {
    document.addEventListener('click', this.clickOutside)
    document.addEventListener('keydown', this.keydown)
  },
  beforeUnmount () {
    document.removeEventListener('click', this.clickOutside)
    document.removeEventListener('keydown', this.keydown)
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.account-menu {
  position: relative;
}
.account-btn {
  @include themify {
    color: themed('text');
    &:hover, &.open { background: themed('bg-dark-3'); }
  }
  cursor: pointer;
  height: 2.5rem;
  padding: 0 .5rem;
}
.avatar {
  height: 1.75rem;
  width: 1.75rem;
}
.name {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropdown {
  @include themify {
    background: themed('bg-dark-1');
    border: 1px solid themed('bg-dark-3');
  }
  box-shadow: 0 .5rem 1rem rgba(#000, .3);
  min-width: 10rem;
  position: absolute;
  right: 0;
  top: calc(100% + .25rem);
  z-index: 60;
}
.item {
  @include themify {
    color: themed('text');
    &:hover {
      background: mix(if($theme == 'light', black, white), themed('bg-dark-1'), 10%);
    }
  }
  cursor: pointer;
  padding: .5rem 1rem;
  &.logout, &.logout:hover {
    color: $red;
    text-decoration: none;
  }
}

@media (max-width: $mobile-max) {
  .account-menu:not(.compact) { display: none; }
}
</style>