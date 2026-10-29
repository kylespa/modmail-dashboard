<template>
  <div class="sidebar global-trans-ignore flex flex-col h-screen w-64" :class="{ collapsed: isCollapsed, mobile, open }">
    <div class="flex items-center h-16">
      <div v-if="$route.name === 'settings'" class="btn-threads header-btn rounded flex items-center justify-center ml-2 select-none"
      title="Back to users" @click="goBack">
        <i class="fa fa-users"></i>
      </div>
      <!-- mousedown.prevent stops the input's blur from closing the search before this click toggles it -->
      <div v-else class="btn-search header-btn rounded flex items-center justify-center ml-2 select-none"
      title="Search users" @mousedown.prevent @click="searchOpen ? closeSearch() : searchOpen = true">
        <i class="fa" :class="searchOpen ? 'fa-times' : 'fa-search'"></i>
      </div>
      <div v-if="$route.name === 'settings'" class="area-title flex-1 flex justify-center items-center">
        <p class="text-3xl select-none">Settings</p>
      </div>
      <user-search v-else-if="searchOpen" class="flex-1" :_search="search" @update="updateSearch" @close="closeSearch"/>
      <div v-else class="area-title flex-1 flex justify-center items-center">
        <p class="text-2xl select-none">Recent Users</p>
      </div>
      <div class="header-btns flex select-none">
        <div class="btn-collapse header-btn rounded flex items-center justify-center"
        :title="mobile ? 'Close' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="collapse">
          <i v-if="mobile" class="text-xl fa fa-times"></i>
          <!-- Lucide panel-left-close / panel-left-open -->
          <svg v-else class="panel-icon" viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M9 3v18"/>
            <path :d="isCollapsed ? 'm14 9 3 3-3 3' : 'm16 15-3-3 3-3'"/>
          </svg>
        </div>
      </div>
    </div>
    <div v-if="isCollapsed"></div>
    <settings-categories v-else-if="$route.name === 'settings'" :category="settingsCategory" @select="selectCategory"/>
    <no-users v-else-if="!searchedUsers.length"/>
    <template v-else>
      <recycle-scroller :items="searchedUsers" :item-size="40" key-field="id" class="scroller-small flex-1 px-2"
      v-slot="{ item }">
        <user-tab :selected="selected === item.id" :user="item" @selectUser="selectUser"/>
      </recycle-scroller>
    </template>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import UserTab from './UserTab.vue'
import UserSearch from './UserSearch.vue'
import NoUsers from './NoUsers.vue'
import SettingsCategories from '@/components/Settings/SettingsCategories.vue'

export default {
  components: {
    UserTab, UserSearch, NoUsers, SettingsCategories, RecycleScroller
  },
  props: {
    users: { type: Array, required: true },
    collapsed: Boolean,
    mobile: Boolean,
    open: Boolean,
    selected: String,
    settingsCategory: { type: String, required: true }
  },
  emits: ['selectUser', 'selectCategory', 'update:collapsed', 'update:open'],
  data () {
    return {
      searchOpen: false,
      search: ''
    }
  },
  computed: {
    isCollapsed () {
      return !this.mobile && this.collapsed
    },
    searchedUsers () {
      return this.users.filter(user => {
        return user.name.toLowerCase().includes(this.search.toLowerCase())
          || user.id.includes(this.search)
      })
    }
  },
  methods: {
    selectUser (id) {
      this.$emit('selectUser', id)
    },
    updateSearch (search) {
      this.search = search
    },
    closeSearch() {
      this.search = '';
      this.searchOpen = false;
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
  transition: width .3s ease-in-out, background .3s ease-in-out;
}
.header-btns {
  margin-left: auto;
  padding: 0 .5rem;
}
.header-btn {
  cursor: pointer;
  height: 2.5rem;
  width: 2.5rem;
}
.btn-collapse {
  @include themify {
    background: themed('bg-dark-3');
  }
  color: #fff;
}
.btn-search, .btn-threads {
  @include themify {
    background: themed('primary');
    color: themed('text');
  }
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
.area-title {
  overflow: hidden;
}

.collapsed .btn-search, .collapsed .btn-threads, .collapsed .area-title {
  display: none;
  & .searchbar {
    width: 0px;
    padding: 0px;
  }
  width: 3.5rem;
}
.text-3xl.select-none {
  padding: 0 12px;
  margin: 1px;
}
.area-title.flex-1.flex.justify-center.items-center {
  padding: 12px 0;
}

@media (max-width: $mobile-max) {
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
    & .header-btn {
      height: 2.75rem;
      width: 2.75rem;
    }
  }
}
</style>