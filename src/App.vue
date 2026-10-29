<template>
  <div id="app-root" :class="themeName">
    <div class="app">
      <loader class="h-screen" v-if="!connected"/>
      <div class="flex" v-else>
        <sidebar :users="users" :selected="user" :settingsCategory="settingsCategory" v-model:collapsed="sidebarCollapsed"
        :mobile="isMobile" v-model:open="sidebarOpen"
        @selectUser="selectUser" @selectCategory="selectCategory"/>
        <transition name="fade">
          <div v-if="isMobile && sidebarOpen" class="sidebar-backdrop global-trans-ignore" @click="sidebarOpen = false"></div>
        </transition>
        <mobile-bar v-if="isMobile && connected" :filter="$route.name === 'threads' ? selectedUserName : null"
        @menu="sidebarOpen = true" @clearFilter="selectUser(null)"/>
        <div class="content-area flex-1 h-screen" :class="{ mobile: isMobile }">
          <account v-if="$route.name !== 'thread'" class="account-floating"/>
          <router-view :_thread="thread" :settings="settings" :category="settingsCategory" :user="user"
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
import Account from './components/Account.vue'

const MOBILE_QUERY = '(max-width: 767px)'

export default {
  components: {
    Sidebar, MobileBar, Loader, Account
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
      timeFormat: JSON.parse(localStorage.timeFormat || '"yyyy-MM-dd HH:mm:ss"'),
      timeRelative: JSON.parse(localStorage.timeRelative || 'false'),
      botAvi: JSON.parse(localStorage.botAvi || 'false'),
      devMode: JSON.parse(localStorage.devMode || 'false'),
      settingsCategory: localStorage.settingsCategory || 'themes'
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
  border-radius: .25rem;
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
    border-radius: .25rem;
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
  border-radius: 5px;
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
  border-radius: 5px;
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
#app-root .account-floating {
  position: fixed;
  right: 1.5rem;
  top: .75rem;
  z-index: 20;
}
.content-area {
  min-width: 0;
  &.mobile {
    padding-top: 2.75rem;
    position: relative;
  }
}
.account-floating {
  position: fixed;
  right: 1.5rem;
  top: .75rem;
  z-index: 20;
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