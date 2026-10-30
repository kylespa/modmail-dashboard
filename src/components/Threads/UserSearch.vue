<template>
  <div class="user-search select-none">
    <div class="search flex items-center px-3">
      <i class="fa fa-search mr-3"></i>
      <div v-if="selectedUser" class="filter-pill flex items-center text-sm rounded mr-2" title="Clear filter"
      @click="$emit('select', null)">
        <span class="filter-name">{{ selectedUser.name }}</span>
        <i class="fa fa-times ml-2"></i>
      </div>
      <input ref="input" class="flex-1" type="text" spellcheck="false"
      :placeholder="selectedUser ? '' : 'Search users'" v-model="search"
      @focus="focused = true" @blur="focused = false"
      @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="choose(suggestions[highlighted])" @keydown.esc="search = ''">
      <!-- mousedown.prevent keeps focus in the input so the suggestions stay open -->
      <div v-show="search" class="clear" @mousedown.prevent @click="search = ''">
        <i class="fa fa-times"></i>
      </div>
    </div>
    <div v-if="focused && search" class="suggestions rounded py-1">
      <div v-for="(user, i) in suggestions" :key="user.id" class="suggestion"
      :class="{ highlighted: i === highlighted }" @mousedown.prevent="choose(user)" @mouseenter="highlighted = i">
        <user :user="user.name"/>
      </div>
      <p v-if="!suggestions.length" class="empty">No users found</p>
    </div>
  </div>
</template>

<script>
import User from '@/components/User.vue'

const MAX_SUGGESTIONS = 8

export default {
  components: {
    User
  },
  props: {
    users: { type: Array, required: true },
    // ID of the user the threads are filtered by
    selected: String
  },
  emits: ['select'],
  data () {
    return {
      search: '',
      focused: false,
      highlighted: 0
    }
  },
  computed: {
    selectedUser () {
      return this.users.find(user => user.id === this.selected)
    },
    suggestions () {
      const search = this.search.trim().toLowerCase()
      if (!search)
        return []
      return this.users.filter(user => {
        return user.name.toLowerCase().includes(search)
          || user.id.includes(search)
      }).slice(0, MAX_SUGGESTIONS)
    }
  },
  watch: {
    search () {
      this.highlighted = 0
    }
  },
  methods: {
    move (dir) {
      const count = this.suggestions.length
      if (count)
        this.highlighted = (this.highlighted + dir + count) % count
    },
    choose (user) {
      if (!user)
        return
      this.$emit('select', user.id)
      this.search = ''
      this.$refs.input.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.user-search {
  margin: .25rem 0;
  position: relative;
  width: 20rem;
}
.search {
  @include themify {
    &:focus-within {
      border-color: lighten(themed('primary'), 10%);
    }
    &:hover:not(:focus-within) { border-color: darken(themed('bg-dark-3'), 30%); }
    background: themed('bg-dark-3');
    border: 1px solid themed('bg-dark-3');
    color: themed('text-muted');
  }
  border-radius: $spacing * .5rem;
  height: 2rem;
}
input {
  @include themify {
    color: themed('text');
  }
  background: transparent;
  border: none;
  min-width: 0;
  outline: none;
}
.filter-pill {
  @include themify {
    background: rgba(themed('primary'), .15);
    color: themed('primary');
  }
  cursor: pointer;
  max-width: 50%;
  padding: .125rem .5rem;
}
.filter-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.clear {
  cursor: pointer;
}
.suggestions {
  @include themify {
    background: themed('bg-dark-1');
    border: 1px solid themed('bg-dark-3');
  }
  box-shadow: 0 .5rem 1rem rgba(#000, .3);
  left: 0;
  position: absolute;
  right: 0;
  top: calc(100% + .25rem);
  z-index: 30;
}
.suggestion {
  @include themify {
    &.highlighted {
      background: mix(if($theme == 'light', black, white), themed('bg-dark-1'), 10%);
    }
  }
  cursor: pointer;
  padding: .5rem 1rem;
}
.empty {
  @include themify {
    color: themed('text-muted');
  }
  padding: .5rem 1rem;
}
@media (max-width: $mobile-max) {
  .user-search { width: 100%; }
}
</style>