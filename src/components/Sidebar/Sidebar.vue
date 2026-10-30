<template>
  <div class="sidebar global-trans-ignore flex flex-col h-screen w-64" :class="{ collapsed: isCollapsed, mobile, open }">
    <div class="header flex items-center h-16 select-none">
      <div v-if="$route.name === 'settings'" class="back icon-btn" title="Back to threads" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </div>
      <p class="title flex-1 text-lg font-semibold">{{ $route.name === 'settings' ? 'Settings' : 'Modmail' }}</p>
      <div class="icon-btn" :title="mobile ? 'Close' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="collapse">
        <i v-if="mobile" class="text-xl fa fa-times"></i>
        <!-- Lucide panel-left-close / panel-left-open -->
        <svg v-else class="panel-icon" viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M9 3v18"/>
          <path :d="isCollapsed ? 'm14 9 3 3-3 3' : 'm16 15-3-3 3-3'"/>
        </svg>
      </div>
    </div>
    <div class="list scroller-small flex-1 flex flex-col px-2">
      <template v-if="$route.name === 'settings'">
        <p class="section-label">Categories</p>
        <settings-categories :category="settingsCategory" :collapsed="isCollapsed" @select="selectCategory"/>
      </template>
      <template v-else-if="!isCollapsed">
        <p class="section-label">Recent Users</p>
        <no-users v-if="!recentUsers.length"/>
        <user-tab v-for="user in recentUsers" :key="user.id" :selected="selected === user.id" :user="user"
        @selectUser="selectUser"/>
      </template>
    </div>
    <user-panel/>
  </div>
</template>

<script>
import UserTab from './UserTab.vue'
import UserPanel from './UserPanel.vue'
import NoUsers from './NoUsers.vue'
import SettingsCategories from '@/components/Settings/SettingsCategories.vue'

export default {
  components: {
    UserTab, UserPanel, NoUsers, SettingsCategories
  },
  props: {
    recentUserCount: { type: Number, required: true },
    users: { type: Array, required: true },
    collapsed: Boolean,
    // Mobile: the sidebar is an off-canvas drawer shown while `open`
    mobile: Boolean,
    open: Boolean,
    selected: String,
    settingsCategory: { type: String, required: true }
  },
  emits: ['selectUser', 'selectCategory', 'update:collapsed', 'update:open'],
  computed: {
    // The thin collapsed strip only exists on desktop
    isCollapsed () {
      return !this.mobile && this.collapsed
    },
    recentUsers () {
      return this.users.slice(0, this.recentUserCount)
    }
  },
  methods: {
    selectUser (id) {
      this.$emit('selectUser', id)
    },
    collapse () {
      if (this.mobile)
        this.$emit('update:open', false)
      else
        this.$emit('update:collapsed', !this.collapsed)
    },
    selectCategory (category) {
      this.$emit('selectCategory', category)
    },
    goBack () {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.sidebar {
  @include themify {
    background: themed('bg-dark-1');
  }
  position: relative;
  transition: width .3s ease-in-out, background .3s ease-in-out;
}
.list {
  padding-bottom: 4rem;
}

.header {
  @include themify {
    border-bottom: 1px solid themed('bg-dark-3');
  }
  flex-shrink: 0;
  padding: 0 .75rem 0 1rem;
}
.back {
  margin-left: -.5rem;
  margin-right: .25rem;
}
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.panel-icon {
  fill: none;
  height: 1.25rem;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  width: 1.25rem;
}
.section-label {
  @include themify {
    color: themed('text-muted');
  }
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .02em;
  padding: 1rem .5rem 1rem;
  text-transform: uppercase;
  user-select: none;
}
.collapsed {
  & .header {
    justify-content: center;
    padding: 0;
  }
  & .back, & .title, & .section-label {
    display: none;
  }
  & .list {
    padding-top: .5rem;
  }
  width: 3.5rem;
}

@media (max-width: $mobile-max) {
  // Off-canvas drawer. Hidden (and unfocusable) until `open`.
  .sidebar.mobile {
    box-shadow: none;
    left: 0;
    max-width: 85vw;
    position: fixed;
    top: 0;
    transform: translateX(-100%);
    transition: transform .3s ease-in-out, box-shadow .3s ease-in-out, visibility 0s linear .3s;
    visibility: hidden;
    width: 18rem;
    z-index: 50;
    &.open {
      box-shadow: 0 0 2rem rgba(#000, .5);
      transform: none;
      transition: transform .3s ease-in-out, box-shadow .3s ease-in-out, visibility 0s;
      visibility: visible;
    }
    // Bigger touch targets
    & .icon-btn {
      height: 2.75rem;
      width: 2.75rem;
    }
  }
}
</style>
