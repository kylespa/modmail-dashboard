<template>
  <div class="page scroller pt-4 h-full">
    <p class="page-title text-center text-4xl">Threads</p>
    <div class="toolbar flex flex-wrap items-center justify-between select-none mt-4">
      <div class="filter flex flex-wrap items-center">
        <div v-if="displayCategoryFilter" class="filter-group flex items-center mr-6 my-1">
          <span class="filter-label font-semibold mr-3">Category</span>
          <div class="filter-options flex">
            <div v-for="option in categoryOptions" :key="option.value" class="filter-option"
              :class="{ active: categoryFilter === option.value }" @click="selectCategory(option.value)">
              {{ option.label }}
            </div>
          </div>
        </div>
        <div class="filter-group flex items-center mr-6 my-1">
          <span class="filter-label font-semibold mr-3">Status</span>
          <div class="filter-options flex">
            <div v-for="option in statusOptions" :key="option.value" class="filter-option"
              :class="{ active: statusFilter === option.value }" @click="selectStatus(option.value)">
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>
      <user-search :users="users" :selected="user" @select="$emit('selectUser', $event)"/>
    </div>
    <table cellspacing="0" class="my-4 w-full">
      <thead class="select-none">
        <tr>
          <th>User</th>
          <th class="flex-inline items-center justify-center">
            <div class="sort" @click="sortTime">
              <span>Created At</span>
              <div class="ml-2 inline-block">
                <i v-if="sort !== 'created_at'"
                  class="compare fa fa-sort"></i>
                <i v-else-if="reverse" class="compare fa fa-sort-asc"></i>
                <i v-else class="compare fa fa-sort-desc"></i>
              </div>
            </div>
          </th>
          <th class="flex-inline items-center justify-center">
            <div class="sort" @click="sortStatus">
              <span>Status</span>
              <div class="ml-2 inline-block">
                <i v-if="sort !== 'status'"
                  class="compare fa fa-sort"></i>
                <i v-else-if="reverse" class="compare fa fa-sort-asc"></i>
                <i v-else class="compare fa fa-sort-desc"></i>
              </div>
            </div>
          </th>
          <th>Closed By</th>
        </tr>
      </thead>
      <tbody>
        <thread-row v-for="thread in filteredThreads" :key="thread.id"
          :thread="thread" :settings="settings" @open="openThread"/>
        <tr v-if="loading" class="loader">
          <td colspan="4" :style="{ height: `${settings.pageSize * 2}rem` }">
            <loader/>
          </td>
        </tr>
        <tr v-else-if="!filteredThreads.length" class="empty">
          <td colspan="4">{{ emptyText }}</td>
        </tr>
      </tbody>
    </table>
    <paginator v-if="pageCount > 1" :pageCount="pageCount"
      :page="page" @select="selectPage"/>
    <p class="result-count font-semibold text-center">Showing {{ filteredThreads.length }} out of {{ threadCount }} results</p>
  </div>
</template>

<script>
import { get } from '@/api'
import ThreadRow from '@/components/Threads/ThreadRow.vue'
import Paginator from '@/components/Threads/Paginator.vue'
import UserSearch from '@/components/Threads/UserSearch.vue'
import Loader from '@/components/Loader.vue'
import { es } from '@/stream'

export default {
  components: {
    UserSearch, ThreadRow, Paginator, Loader
  },
  props: {
    users: { type: Array, required: true },
    user: String,
    settings: { type: Object, required: true }
  },
  emits: ['openThread', 'selectUser'],
  data () {
    return {
      threads: [],
      page: 1,
      pageCount: 1,
      reverse: true,
      sort: 'status',
      threadCount: 0,
      includePrivate: false,
      communityOnly: false,
      moderatorOnly: false,
      hideCommunity: false,
      loading: true,
      requestId: 0,
      displayCategoryFilter: true,
      privacyFilter: 'all',
      statusFilter: 'all',
      categoryFilter: 'all',
      privacyOptions: [
        { value: 'all', label: 'All' },
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' }
      ],
      statusOptions: [
        { value: 'all', label: 'All' },
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' }
      ]
    }
  },
  computed: {
    categoryOptions () {
      if (this.communityOnly) {
        this.displayCategoryFilter = false;
        return [{ value: 'all', label: 'Community' }]
      };
      if (this.moderatorOnly) {
        this.displayCategoryFilter = false;
        return [{ value: 'all', label: 'Moderator' }]
      }
      const options = [
        { value: 'all', label: 'All' },
        { value: 'community', label: 'Community' },
        { value: 'moderator', label: 'Moderator' }
      ]
      if (this.hideCommunity) {
        options.splice(options.findIndex(o => o.value === 'community'), 1);
      };
      if (this.hideModerator) {
        options.splice(options.findIndex(o => o.value === 'moderator'), 1);
      };
      if (this.includePrivate)
        options.push({ value: 'admin', label: 'Admin' })
      return options
    },
    emptyText () {
      const active = [this.statusFilter, this.privacyFilter, this.categoryFilter].filter(f => f !== 'all')
      return `No ${active.length ? active.join(' ') + ' ' : ''}threads found`
    },
    filteredThreads () {
      if (!this.includePrivate || this.privacyFilter === 'all')
        return this.threads
      const wantPrivate = this.privacyFilter === 'private'
      return this.threads.filter(thread => !!thread.isPrivate === wantPrivate)
    }
  },
  watch: {
    user () {
      this.page = 1
      this.refreshThreads()
    }
  },
  methods: {
    openThread (thread) {
      this.$emit('openThread', thread)
    },
    selectPage (page) {
      this.page = page
      this.refreshThreads()
    },
    sortTime () {
      if (this.sort !== 'created_at')
        this.sort = 'created_at'
      else
        this.reverse = !this.reverse
      this.refreshThreads()
    },
    sortStatus () {
      if (this.sort !== 'status')
        this.sort = 'status'
      else
        this.reverse = !this.reverse
      this.refreshThreads()
    },
    selectPrivacy (value) {
      if (this.privacyFilter === value)
        return
      this.privacyFilter = value
      this.page = 1
      this.refreshThreads()
    },
    selectStatus (value) {
      if (this.statusFilter === value)
        return
      this.statusFilter = value
      this.page = 1
      this.refreshThreads()
    },
    selectCategory (value) {
      if (this.categoryFilter === value)
        return
      this.categoryFilter = value
      this.page = 1
      this.refreshThreads()
    },
    refreshThreads (soft) {
      if (!soft) {
        this.threads = []
        this.loading = true
      }
      const requestId = ++this.requestId
      let q = `?limit=${this.settings.pageSize}&page=${this.page-1}`
        + `&sort_by=${this.sort}`
      if (this.user)
        q += `&user=${this.user}`
      if (this.reverse)
        q += '&reverse'
      if (this.privacyFilter !== 'all')
        q += `&privacy=${this.privacyFilter}`
      if (this.statusFilter !== 'all')
        q += `&status=${this.statusFilter}`
      if (this.categoryFilter !== 'all')
        q += `&category=${this.categoryFilter}`
      get(`/threads${q}`).end((err, res) => {
        if (requestId !== this.requestId)
          return
        if (err) {
          console.log(err)
        } else {
          this.pageCount = Math.ceil(res.body.total / this.settings.pageSize)
          this.threads = res.body.threads
          this.threadCount = res.body.total
          this.includePrivate = res.body.includePrivate
          this.communityOnly = res.body.communityOnly
          this.moderatorOnly = res.body.moderatorOnly
          this.hideCommunity = res.body.hideCommunity
          this.loading = false
        }
      })
    },
    softRefreshThreads () {
      this.refreshThreads(true)
    }
  },
  created () {
    es.addEventListener('threadOpen', this.softRefreshThreads)
    es.addEventListener('threadClose', this.softRefreshThreads)
    this.refreshThreads()
  },
  unmounted () {
    es.removeEventListener('threadOpen', this.softRefreshThreads)
    es.removeEventListener('threadClose', this.softRefreshThreads)
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.page {
  padding-left: 4rem;
  padding-right: 4rem;
}
.sort-bar {
  display: none;
}
table {
  border-collapse: separate;
}
th {
  @include themify {
    background: themed('primary');
  }
  & .sort { cursor: pointer; }
  color: #fff;
  padding: $spacing * .5rem $spacing * $roundness;
}
th:first-child {
  border-top-left-radius: $spacing * $roundness;
}
th:last-child {
  border-top-right-radius: $spacing * $roundness;
}
.loader, .empty {
  & td {
    @include themify {
      background: themed('bg-dark-2');
    }
    border-bottom-left-radius: $spacing * $roundness;
    border-bottom-right-radius: $spacing * $roundness;
    padding: 0;
  }
}
.empty td {
  @include themify {
    color: themed('text-muted');
  }
  padding: $spacing * 1rem;
  text-align: center;
}
.filter-label {
  @include themify {
    color: themed('text-muted');
  }
}
.filter-options {
  @include themify {
    background: themed('bg-dark-2');
  }
  border-radius: $spacing * $roundness;
  overflow: hidden;
}
.filter-option {
  @include themify {
    color: themed('text');
  }
  cursor: pointer;
  padding: $spacing * .25rem $spacing * .75rem;
  transition: background .3s ease-in-out, color .3s ease-in-out;
  &:hover {
    @include themify {
      background: themed('bg-dark-3');
    }
  }
  &.active {
    @include themify {
      background: themed('primary');
    }
    color: #fff;
  }
}
.result-count {
  @include themify {
    color: themed('text-muted');
  }
}

@media (max-width: $mobile-max) {
  .page {
    padding-left: .75rem;
    padding-right: .75rem;
  }
  .page-title {
    font-size: 1.75rem;
  }
  // Each filter gets its own row, label on the left and options on the right
  .filter-group {
    justify-content: space-between;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
  }
  // Bigger touch targets
  .filter-option {
    padding: $spacing * .5rem $spacing * .875rem;
  }
  .sort-bar {
    display: flex;
  }
  .filter {
    width: 100%;
  }
  table, tbody {
    display: block;
  }
  thead {
    display: none;
  }
  .loader, .empty {
    display: block;
    & td {
      border-radius: $spacing * $roundness;
      display: block;
    }
  }
}
</style>