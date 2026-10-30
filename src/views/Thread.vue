<template>
  <div class="h-full flex flex-col">
    <div v-if="thread" class="flex-1 flex flex-col">
      <div class="top-bar h-16 flex items-center px-3">
        <div class="icon-btn" title="Back to threads" @click="close">
          <i class="text-lg fa fa-arrow-left"></i>
        </div>
        <div class="top-info flex-1 flex items-center px-4">
          <p class="thread-name text-4xl mr-3">
            <user class="tippy-b-lg" :title="`Account Age: ${accountAge || '[ Not Found ]'}`" :user="thread.user_name"/>
          </p>
          <div v-if="note" class="note h-12 flex items-center pl-3">
            <p class="text-sm" ref="note">{{ note }}</p>
          </div>
        </div>
        <div class="actions flex items-center">
          <div class="action-btn" :class="{ active: showMessages }" title="Show channel messages" @click="toggleMsgs">
            <i class="fa fa-fw fa-comments"></i>
            <span class="label">Channel Messages</span>
          </div>
          <copy-button :text="thread.id" label="Thread ID"/>
          <template v-if="settings.devMode">
            <copy-button :text="thread.user_id" label="User ID"/>
            <copy-button :text="thread.dm_channel_id" label="Channel ID"/>
          </template>
        </div>
      </div>
      <div v-if="initialMessages && logs.length" class="logs-area flex-1 scroller px-8 flex relative" ref="logs" @scroll="updateScroll">
        <div class="flex-1">
          <log v-for="log in visibleLogs" :key="log.id" :log="log" :settings="settings"/>
        </div>
      </div>
      <loader class="flex-1" v-else-if="!initialMessages"/>
      <no-logs v-else/>
      <div v-if="!atBottom" :class="{ long: collapsed }" @click="scrollToBottom"
      class="scroll-bottom global-trans-ignore h-6 flex items-center rounded-t select-none">
        <p class="desc text-sm flex-1 px-2">You&apos;re viewing older messages</p>
        <p class="action text-xs font-semibold px-2">Jump to Bottom</p>
      </div>
      <div v-if="unread > 0" :class="{ long: collapsed }"
      class="new-messages global-trans-ignore h-6 flex items-center rounded-b select-none">
        <p class="desc flex-1 px-2" @click="scrollToBottom">{{ unread }} new message{{ unread > 1 ? 's' : ''}}</p>
        <p class="action text-sm font-semibold px-2" @click="unread = 0">Mark as Read</p>
      </div>
    </div>
    <loader v-else class="h-full"/>
  </div>
</template>

<script>
import { format, utcToZonedTime } from 'date-fns-tz'
import superagent from 'superagent'
import twemoji from '@twemoji/api'
import User from '@/components/User.vue'
import Loader from '@/components/Loader.vue'
import NoLogs from '@/components/Thread/NoLogs.vue'
import Log from '@/components/Thread/Log.vue'
import CopyButton from '@/components/Thread/CopyButton.vue'
import { es } from '@/stream'
import { processMarkdown } from '@/markdown'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export default {
  components: {
    User, Loader, NoLogs, Log, CopyButton
  },
  props: {
    _thread: Object,
    settings: { type: Object, required: true }
  },
  emits: ['close'],
  inject: ['sidebarCollapsed'],
  data () {
    return {
      logs: [],
      thread: this._thread,
      note: null,
      accountAge: null,
      initialMessages: false,
      atBottom: true,
      unread: 0,
      showMessages: false
    }
  },
  watch: {
    atBottom () {
      if (this.atBottom)
        this.unread = 0
    }
  },
  computed: {
    link () {
      return `${location.protocol}//${location.host}/#thread:${this.thread.id}`
    },
    collapsed () {
      return this.sidebarCollapsed
    },
    visibleLogs () {
      return this.logs.filter(log => this.showMessages === (log.type === 2))
    }
  },
  methods: {
    close () {
      es.removeEventListener('newMessage', this.newMessage)
      this.$emit('close')
    },
    addMessage (message) {
      switch (message.message_type) {
        case 1:
          if (message.body.startsWith('**EDITED')) break // Bandaid fix

          let ageMatch = message.body.match(/ccount\sage[:\s]?\*\*\s?([^*]+)/i)
          let noteMatch = message.body.match(/\n\*\*(?:last\s)?note[^\*]+\*\*\s(.+?)(?:\s-\s\[|\n)/i)

          if (ageMatch)
            this.accountAge = ageMatch[1]
          if (noteMatch) {
            this.note = noteMatch[1]
            setTimeout(() => {
              twemoji.parse(this.$refs.note)
            }, 0)
          }
          break
        case 2: case 3: case 4:
          if (this.logs.length && (
            this.logs.slice(-1)[0].user_id === message.user_id
            && (this.logs.slice(-1)[0].type === message.message_type)
            && format(utcToZonedTime(new Date(message.created_at + 'Z'), timeZone), 'yyMMddHH')
              === format(utcToZonedTime(new Date(this.logs.slice(-1)[0].created_at + 'Z'), timeZone), 'yyMMddHH')
          )) {
            this.logs.slice(-1)[0].messages.push({
              id: message.id,
              dm_id: message.dm_message_id || null,
              attachments: message.attachments || null,
              body: this.parseMessage(message.body)
            })
          } else {
            this.logs.push({
              id: message.id,
              user_id: message.user_id,
              user_name: message.user_name,
              role_name: message.role_name,
              created_at: message.created_at,
              type: message.message_type,
              messages: [ {
                id: message.id,
                dm_id: message.dm_message_id || null,
                attachments: message.attachments || null,
                body: this.parseMessage(message.body)
              } ]
            })
          }
          break
      }
      if (this.atBottom && this.initialMessages)
        setTimeout(this.scrollToBottom, 0)
      else if (this.initialMessages)
        this.unread++
    },
    scrollToBottom () {
      if (this.$refs.logs)
        this.$refs.logs.scrollTop = this.$refs.logs.scrollHeight
    },
    toggleAutoscroll () {
      this.autoscroll = !this.autoscroll
    },
    parseMessage (message) {
      if (typeof message != 'string')
        return `${message}`
      message = processMarkdown(message.replace(/\n/g, '\n\n'))
      message = twemoji.parse(message)
      return message.replace(/(<br\/>)+$/, '')
    },
    updateScroll (ev) {
      let el = ev.target
      this.atBottom = el.scrollTop >= (el.scrollHeight - el.offsetHeight - 75)
    },
    toggleMsgs () {
      this.showMessages = !this.showMessages
    },
    getLogs () {
      superagent.get(`/logs/${this.thread.id}`).end((err, res) => {
        if (err) {
          console.log(err)
        } else {
          for (let message of res.body)
            this.addMessage(message)
          this.initialMessages = true
          setTimeout(this.scrollToBottom, 0)
        }
      })
    },
    newMessage (ev) {
      let data = JSON.parse(ev.data)
      let { message } = data
      if (message.thread_id === this.thread.id)
        this.addMessage(message)
    }
  },
  unmounted () {
    es.removeEventListener('newMessage', this.newMessage)
  },
  created () {
    es.addEventListener('newMessage', this.newMessage)
    if (this.thread) {
      this.getLogs()
    } else {
      superagent.get(`/threads/${this.$route.params.id}`).end((err, res) => {
        if (err) {
          if (res.status === 404)
            this.$router.push('/')
          else
            console.log(err)
        } else {
          this.thread = res.body
          this.getLogs()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.top-bar {
  @include themify {
    background: themed('bg-dark-1');
    border-bottom: 1px solid themed('bg-dark-3');
  }
  flex-shrink: 0;
}
.note {
  @include themify {
    border-left: 2px solid mix(
      if($theme == 'light', black, white),
      themed('bg-dark-1'),
      5%
    );
    color: themed('text-muted');
  }
}
.scroll-bottom {
  @include themify {
    background: rgba(lighten(themed('bg-dark-1'), 40%), .9);
  }
  cursor: pointer;
  position: absolute;
  bottom: 0;
}
.new-messages {
  @include themify {
    background: rgba(themed('primary'), .9);
  }
  color: #fff;
  position: absolute;
  top: 4rem;
}
.scroll-bottom, .new-messages {
  & .desc {
    cursor: pointer;
    color: #fff;
  }
  & .action {
    color: rgba(#fff, .5);
    cursor: pointer;
    text-transform: uppercase;
  }
  &.long { width: calc(100vw - 5.5rem - (2rem + 10px)); }
  right: calc(2rem + 10px);
  transition: width .3s ease-in-out;
  width: calc(100vw - 18rem - (2rem + 10px));
}

@media (max-width: $mobile-max) {
  .top-info {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 0 .75rem;
  }
  .thread-name {
    font-size: 1.25rem;
    line-height: 1.5rem;
    margin-right: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .top-bar .thread-name :deep(.emoji) {
    height: 1.25rem;
  }
  .note {
    border-left: 0;
    height: auto;
    max-width: 100%;
    min-width: 0;
    padding-left: 0;
    & p {
      font-size: .75rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  // Icons only; the labels don't fit
  .actions :deep(.label) {
    display: none;
  }
  .top-bar .icon-btn,
  .action-btn {
    height: 2.5rem;
    justify-content: center;
    padding: 0;
    width: 2.5rem;
  }
  .logs-area {
    padding-left: .75rem;
    padding-right: .75rem;
  }
  .scroll-bottom, .new-messages {
    &, &.long {
      left: .5rem;
      right: .5rem;
      width: auto;
    }
  }
}
</style>