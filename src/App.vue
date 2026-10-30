<template>
  <div id="app-root" :class="themeName">
    <div class="app">
      <loader class="h-screen" v-if="!connected"/>
      <div class="flex" v-else>
        <sidebar :recentUserCount="recentUserCount" :users="users" :selected="user" :settingsCategory="settingsCategory" v-model:collapsed="sidebarCollapsed"
        :mobile="isMobile" v-model:open="sidebarOpen"
        @selectUser="selectUser" @selectCategory="selectCategory"/>
        <transition name="fade">
          <div v-if="isMobile && sidebarOpen" class="sidebar-backdrop global-trans-ignore" @click="sidebarOpen = false"></div>
        </transition>
        <mobile-bar v-if="isMobile && connected" :filter="$route.name === 'threads' ? selectedUserName : null"
        @menu="sidebarOpen = true" @clearFilter="selectUser(null)"/>
        <div class="content-area flex-1 h-screen" :class="{ mobile: isMobile }">
          <router-view :_thread="thread" :settings="settings" :category="settingsCategory" :users="users" @selectUser="selectUser" :user="user"
          @changeSetting="changeSetting" @close="openThread(null)" @openThread="openThread"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import superagent from 'superagent'
import Sidebar from './components/Sidebar/Sidebar.vue'
import MobileBar from './components/MobileBar.vue'
import Loader from './components/Loader.vue'

const MOBILE_QUERY = '(max-width: 767px)'

export default {
  components: {
    Sidebar, MobileBar, Loader
  },
  data () {
    return {
      me: null,
      user: null,
      users: [],
      thread: null,
      connected: false,
      sidebarCollapsed: false,
      isMobile: window.matchMedia(MOBILE_QUERY).matches,
      sidebarOpen: false,
      theme: JSON.parse(localStorage.theme || '0') || 'dark',
      pageSize: JSON.parse(localStorage.pageSize || '15'),
      recentUserCount: JSON.parse(localStorage.recentUserCount || '15'),
      timeFormat: JSON.parse(localStorage.timeFormat || '"MMMM dd, yyyy h:mm a"'),
      timeRelative: JSON.parse(localStorage.timeRelative || 'false'),
      botAvi: JSON.parse(localStorage.botAvi || 'false'),
      devMode: JSON.parse(localStorage.devMode || 'false'),
      settingsCategory: localStorage.settingsCategory || 'general'
    }
  },
  provide () {
    return {
      sidebarCollapsed: computed(() => this.sidebarCollapsed),
      me: computed(() => this.me),
      settingsCategory: computed(() => this.settingsCategory)
    }
  },
  watch: {
    user () {
      if (this.thread)
        this.thread = null
    },
    '$route' () {
      this.sidebarOpen = false
    }
  },
  computed: {
    selectedUserName () {
      const user = this.users.find(u => u.id === this.user)
      return user ? user.name : null
    },
    themeName () {
      return {
        [`theme-${this.theme}`]: true
      }
    },
    settings () {
      return {
        theme: this.theme,
        pageSize: this.pageSize,
        recentUserCount: this.recentUserCount,
        timeFormat: this.timeFormat,
        timeRelative: this.timeRelative,
        botAvi: this.botAvi,
        devMode: this.devMode
      }
    }
  },
  methods: {
    selectUser (id) {
      this.user = id
      this.sidebarOpen = false
    },
    updateMobile (ev) {
      this.isMobile = ev.matches
      if (!ev.matches)
        this.sidebarOpen = false
    },
    changeSetting (setting, value) {
      localStorage[setting] = JSON.stringify(value)
      this[setting] = value
    },
    selectCategory (category) {
      localStorage.settingsCategory = category
      this.settingsCategory = category
    },
    openThread (thread) {
      this.thread = thread
      if (thread)
        this.$router.push({ name: 'thread', params: { id: thread.id } })
      else
        this.$router.push('/')
    }
  },
  mounted () {
    this.mobileQuery = window.matchMedia(MOBILE_QUERY)
    this.mobileQuery.addEventListener('change', this.updateMobile)
  },
  beforeUnmount () {
    this.mobileQuery.removeEventListener('change', this.updateMobile)
  },
  created () {
    superagent.get('/me').end((err, res) => { 
      if (err) {
        console.log(err);
      } else {
        this.me = res.body;
      }
    });
    superagent.get('/users').end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        this.users.push(...res.body)
        this.connected = true
      }
    })
  }
}
</script>

<style lang="scss">
@import './variables.scss';

.app {
  @include themify {
    background: themed('bg');
    color: themed('text');
  }
  font-family: $sans-serif;
  overflow: hidden;
}
#app-root :not(.global-trans-ignore) {
  transition: background .2s ease-in-out, border-color .3s ease-in-out !important;
}
code {
  @include themify {
    background: themed('bg-dark-2');
  }
  border-radius: $roundness;
  font-family: $mono;
  font-weight: 600;
  letter-spacing: -.05em;
  padding: .125rem .325rem;
}
.message {
  & pre {
    @include themify {
      background: darken(themed('bg-dark-1'), 1%);
      border: 2px solid darken(themed('bg-dark-1'), 3%);
      color: themed('text-muted');
    }
    border-radius: $roundness;
    font-family: $mono;
    font-weight: 600;
    letter-spacing: -.05em;
    min-height: 2rem;
    padding: .325rem;
    white-space: pre-wrap;
  }
  & .tag {
    @include themify {
      background: rgba(themed('primary'), .1);
      color: themed('primary');
    }
  }
  & .paragraph {
    font-family: $thread-text;
    margin-top: .125rem;
  }
}
.scroller, .scroller-small {
  overflow-y: scroll;
}
* { min-height: 0 }
.scroller::-webkit-scrollbar { width: 10px; height: 10px; }
.scroller::-webkit-scrollbar-thumb {
  @include themify {
    background: darken(themed('bg-dark-3'), 5%);
  }
  border-radius: $roundness;
}
.scroller::-webkit-scrollbar-track {
  @include themify {
    background: themed('bg-dark-2');
  }
}
.scroller::-webkit-scrollbar-corner {
  @include themify {
    background: themed('bg-dark-2');
  }
}
.scroller-small::-webkit-scrollbar { width: 10px; height: 10px; }
.scroller-small::-webkit-scrollbar-thumb {
  @include themify {
    background: darken(themed('bg-dark-3'), 5%);
    border: 3px solid themed('bg-dark-1');
  }
  border-radius: $roundness;
}
.scroller-small::-webkit-scrollbar-track { background: transparent; }
.scroller-small::-webkit-scrollbar-corner { background: transparent; }
.scroller-small:not(:hover)::-webkit-scrollbar-thumb { background: transparent; }
.w-20 { width: 5rem; }
.h-20 { height: 5rem; }
#app-root .h-screen {
  height: 100vh;
  height: 100dvh;
}
.content-area {
  min-width: 0;
  &.mobile {
    padding-top: 2.75rem;
    position: relative;
  }
}
// Square icon buttons in the sidebar header and user panel
.icon-btn {
  @include themify {
    color: themed('text-muted');
    &:hover, &.active {
      background: mix(if($theme == 'light', black, white), themed('bg-dark-1'), 10%);
      color: themed('text');
    }
  }
  align-items: center;
  border-radius: $roundness;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 2rem;
  justify-content: center;
  text-decoration: none !important;
  width: 2rem;
}
// Labelled buttons, e.g. the thread view's actions
.action-btn {
  @include themify {
    background: themed('bg-dark-2');
    color: themed('text-muted');
    &:hover {
      background: themed('bg-dark-3');
      color: themed('text');
    }
    &.active {
      background: themed('primary');
      color: #fff;
    }
    &.copied {
      background: rgba(themed('primary'), .15);
      color: themed('primary');
    }
  }
  align-items: center;
  border-radius: $spacing * $roundness;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: .875rem;
  font-weight: 600;
  height: 2rem;
  padding: 0 .75rem;
  user-select: none;
  white-space: nowrap;
  & + & { margin-left: .5rem; }
  & .label { margin-left: .5rem; }
}
// Sidebar rows (recent users, settings categories)
.nav-item {
  @include themify {
    color: themed('text-muted');
    &:hover {
      background: mix(if($theme == 'light', black, white), themed('bg-dark-1'), 6%);
      color: themed('text');
    }
    &.selected {
      background: mix(if($theme == 'light', black, white), themed('bg-dark-1'), 12%);
      color: themed('text');
      &::before { background: themed('primary'); }
    }
  }
  align-items: center;
  border-radius: $roundness;
  cursor: pointer;
  display: flex;
  height: 100%;
  min-height: 1.5rem;
  max-height: 2rem;
  margin-bottom: 2px;
  padding: 0 .5rem;
  position: relative;
  user-select: none;
  &.selected::before {
    border-radius: 0 4px 4px 0;
    content: '';
    height: 1.25rem;
    left: -.5rem;
    position: absolute;
    width: 4px;
  }
  &.collapsed {
    justify-content: center;
    padding: 0;
  }
}
.sidebar-backdrop {
  background: rgba(#000, .5);
  inset: 0;
  position: fixed;
  z-index: 40;
}
.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.user.selected .emoji {
  filter: saturate(0) brightness(10);
}
.emoji {
  .username & {
    .text-4xl & { height: 2rem; }
    height: .875rem;
    padding-left: 2px;
  }
  height: 1.75rem;
}
.section-title {
  font-size: 2rem;
  margin: 1rem 0;
}
a {
  @include themify {
    color: themed('primary');
  }
  &:not(:hover) { text-decoration: none; }
  outline: none;
}
.tippy-popper .tippy-backdrop {
  @include themify-root {
    background: if(
      $theme == 'light',
      darken(themed('bg-dark-1'), 60%),
      lighten(themed('bg-dark-1'), 10%)
    );
  }
}
</style>