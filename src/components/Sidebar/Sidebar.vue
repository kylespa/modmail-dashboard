<template>
  <div class="sidebar global-trans-ignore flex flex-col h-screen w-64" :class="{ collapsed: isCollapsed, mobile, open }">
    <div class="flex h-16">
      <div class="flex flex-col select-none">
        <div class="btn-collapse flex flex-1 items-center justify-center w-8 h-8" @click="collapse">
          <i class="text-xl global-trans-ignore fa" :class="mobile ? 'fa-times' : 'fa-arrow-left'"></i>
        </div>
        <div v-if="$route.name === 'settings'" @click="goBack"
        class="btn-threads flex flex-1 items-center justify-center w-8 h-8">
          <i class="fa fa-users"></i>
        </div>
        <div v-else @click="openSettings" class="btn-settings flex flex-1 items-center justify-center w-8 h-8">
          <i class="text-xl fa fa-cog"></i>
        </div>
      </div>
      <div v-if="$route.name === 'settings'" class="area-title flex-1 flex justify-center items-center">
        <p class="text-3xl select-none">Settings</p>
      </div>
      <div v-if="$route.name === ''" class="area-title flex-1 flex justify-center items-center">
        <p class="text-3xl select-none">Recent Users</p>
      </div>
      <user-search v-else :_search="search" @update="updateSearch"/>
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
    // Mobile: the sidebar is an off-canvas drawer shown while `open`
    mobile: Boolean,
    open: Boolean,
    selected: String,
    settingsCategory: { type: String, required: true }
  },
  emits: ['selectUser', 'selectCategory', 'update:collapsed', 'update:open'],
  data () {
    return {
      search: ''
    }
  },
  computed: {
    // The thin collapsed strip only exists on desktop
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
    collapse () {
      if (this.mobile)
        this.$emit('update:open', false)
      else
        this.$emit('update:collapsed', !this.collapsed)
    },
    selectCategory (category) {
      this.$emit('selectCategory', category)
    },
    openSettings () {
      this.$router.push(`/settings/${this.settingsCategory}`)
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
.btn-collapse {
  @include themify {
    background: themed('primary');
  }
  & i { transition: transform .3s ease; }
  cursor: pointer;
  color: #fff;
}
.btn-settings, .btn-threads {
  @include themify {
    background: themed('bg-dark-3');
    color: themed('text');
  }
  cursor: pointer;
  text-decoration: none;
}
.area-title {
  overflow: hidden;
}
.recent-users {
  @include themify {
    color: themed('text');
  }
  align-self: center;
  transition: color .3s ease-in-out;
}

.collapsed {
  & .btn-collapse i {
    transform: rotateZ(180deg);
  }
  & .searchbar {
    width: 0px;
    padding: 0px;
  }
  width: 2rem;
}
.text-3xl.select-none {
  padding: 0 12px;
  margin: 1px;
}
.area-title.flex-1.flex.justify-center.items-center {
  padding: 12px 0;
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
    & .btn-collapse,
    & .btn-settings,
    & .btn-threads {
      width: 2.75rem;
    }
  }
}
</style>