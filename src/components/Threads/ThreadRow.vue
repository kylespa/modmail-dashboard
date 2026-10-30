<template>
  <tr class="select-none h-8" @click="open">
    <td class="cell-user">
      <span class="user-wrap inline-flex items-center">
        <user :user="thread.user_name"/>
        <span class="copy-desktop">
          <copy-button class="ml-2" compact :text="thread.user_id" label="User ID"/>
        </span>
      </span>
    </td>
    <td class="thread-id cell-time">
      <span class="tracking-tight">{{ absoluteTime }}</span>
      <span v-if="relativeTime" class="ml-4">({{ relativeTime }})</span>
    </td>
    <td class="cell-status">
      <span class="copy-mobile">
        <copy-button compact :text="thread.user_id" label="User ID"/>
      </span>
      <span v-if="thread.status === 1" class="status open">Open</span>
      <span v-else-if="thread.status === 2" class="status closed">Closed</span>
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
import CopyButton from '@/components/Thread/CopyButton.vue'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export default {
  components: {
    User, CopyButton
  },
  props: {
    thread: { type: Object, required: true },
    expanded: Boolean,
    settings: { type: Object, required: true }
  },
  emits: ['open'],
  data () {
    return {
      absoluteTime: '',
      relativeTime: null
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
      this.relativeTime = formatDistanceToNow(localDate) + ' ago'
      this.timeout = setTimeout(this.updateRelativeTime, 10000)
    }
  },
  created () {
    const localDate = utcToZonedTime(new Date(this.thread.created_at + 'Z'), timeZone)
    this.absoluteTime = format(localDate, this.settings.timeFormat)
    if (this.settings.timeRelative)
      this.updateRelativeTime()
  },
  unmounted () {
    clearTimeout(this.timeout)
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
.copy-mobile {
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
  .cell-user {
    padding-right: 5.5rem;
    position: relative;
  }
  .cell-user .action-btn {
    position: absolute;
    right: .5rem;
    top: 50%;
    transform: translateY(-50%);
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
  .user-wrap {
    max-width: 100%;
    & > .username {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .cell-status {
    grid-area: status;
    text-align: right;
  }
  .cell-time {
    grid-area: time;
  }
   .copy-desktop {
    display: none;
  }
  .copy-mobile {
    display: inline;
    margin-right: .5rem;
  }
  .cell-closed {
    display: none;
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