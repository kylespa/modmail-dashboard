<template>
  <tr class="select-none h-8" @click="open">
    <td class="thread-id cell-time">
      <code class="text-sm tracking-tight mr-2">{{ formattedTime }}</code>
    </td>
    <td v-if="thread.status === 1" class="cell-status">
      <span class="status open">Open</span>
    </td>
    <td v-else-if="thread.status === 2" class="cell-status">
      <span class="status closed">Closed</span>
    </td>
    <td class="cell-user">
      <span class="mx-auto"><User :user="thread.user_name"/></span>
    </td>
    <td class="cell-closed">
      <span v-if="thread.scheduled_close_name">
        <span class="closed-label">Closed by </span>
        <user :user="thread.scheduled_close_name"/>
      </span>
    </td>
  </tr>
</template>

<script>
import { formatDistanceToNow } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import User from '@/components/User.vue'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export default {
  components: {
    User
  },
  props: {
    thread: { type: Object, required: true },
    expanded: Boolean,
    settings: { type: Object, required: true }
  },
  emits: ['open'],
  data () {
    return {
      formattedTime: ''
    }
  },
  computed: {
    status () {
      switch (this.thread.status) {
        case 1:
          return 'Open'
        case 2:
          return 'Closed'
      }
    }
  },
  methods: {
    open () {
      this.$emit('open', this.thread)
    },
    updateRelativeTime () {
      const localDate = utcToZonedTime(new Date(this.thread.created_at + 'Z'), timeZone)
      this.formattedTime = formatDistanceToNow(localDate) + ' ago'
      setTimeout(this.updateRelativeTime, 10000)
    }
  },
  created () {
    if (this.settings.timeRelative) {
      this.updateRelativeTime()
    } else {
      const localDate = utcToZonedTime(new Date(this.thread.created_at + 'Z'), timeZone)
      this.formattedTime = format(localDate, this.settings.timeFormat)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.thread-id {
  & code {
    @include themify {
      background: rgba(#000, if($theme == 'light', .1, .3));
    }
  }
  white-space: nowrap;
}

tr {
  cursor: pointer;
}
.closed-label {
  display: none;
}

// Desktop: a regular table row
@media (min-width: $desktop-min) {
  tr {
    @include themify {
      &:nth-child(2n) td {
        background: themed('bg-dark-1');
      }
      &:hover td {
        background: mix(
          if($theme == 'light', #000, #fff),
          themed('bg-dark-1'), 20%);
      }
    }
  }
  td {
    @include themify {
      background: themed('bg-dark-2');
    }
    padding: 0 $spacing * .75rem;
    &.text-right { text-align: right; }
    transition: padding 0.6s ease;
    text-align: center;
  }
  tr:last-child td {
    &:first-child { border-bottom-left-radius: $spacing * .5rem; }
    &:last-child { border-bottom-right-radius: $spacing * .5rem; }
  }
}

// Mobile: a card with the user and status on top, time and closer below
@media (max-width: $mobile-max) {
  tr {
    @include themify {
      background: themed('bg-dark-2');
      &:nth-child(2n) {
        background: themed('bg-dark-1');
      }
      &:active {
        background: mix(
          if($theme == 'light', #000, #fff),
          themed('bg-dark-1'), 20%);
      }
    }
    align-items: center;
    border-radius: $spacing * .5rem;
    display: grid;
    gap: $spacing * .375rem $spacing * .75rem;
    grid-template-areas:
      'user status'
      'time closed';
    grid-template-columns: minmax(0, 1fr) auto;
    height: auto;
    margin-bottom: $spacing * .5rem;
    padding: $spacing * .625rem $spacing * .75rem;
  }
  td {
    min-width: 0;
    padding: 0;
    text-align: left;
  }
  .cell-user {
    font-weight: 600;
    grid-area: user;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cell-status {
    grid-area: status;
  }
  .cell-time {
    grid-area: time;
  }
  .cell-closed {
    @include themify {
      color: themed('text-muted');
    }
    font-size: .875rem;
    grid-area: closed;
    overflow: hidden;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .closed-label {
    display: inline;
  }
  .status {
    border-radius: 999px;
    display: inline-block;
    font-size: .75rem;
    font-weight: 600;
    padding: $spacing * .125rem $spacing * .5rem;
    &.open {
      @include themify {
        background: themed('primary');
      }
      color: #fff;
    }
    &.closed {
      @include themify {
        background: themed('bg-dark-3');
        color: themed('text-muted');
      }
    }
  }
}
</style>