<template>
  <div class="log" @mouseover="animated = true" @mouseout="animated = false">
    <div class="flex">
      <div class="avatar-col w-16">
        <img class="avatar select-none" :src="getAvatarURL(log)">
      </div>
      <div class="flex-1">
        <p class="header">
          <user class="font-semibold mr-2" :user="log.user_name" :role="log.role_name" :reply="log.type === 4"/>
          <span class="timestamp">{{formattedTime}}</span>
        </p>
          <div v-for="msg in log.messages" class="msg" :key="msg.id">
            <div class="msg-row flex">
              <div class="message-collection flex-1">
                <div class="message" v-html="msg.body"></div>
                <image-gallery v-if="msg.attachments && msg.attachments.length" class="mt-2" :images="msg.attachments"/>
              </div>
              <div v-if="settings.devMode && msg.dm_id" class="dm-id pl-3">
                <code class="id">{{ msg.dm_id }}</code>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDistanceToNow } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import User from '@/components/User.vue'
import ImageGallery from '@/components/Thread/ImageGallery.vue'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const botID = import.meta.env.VITE_BOT_ID

export default {
  components: {
    User, ImageGallery
  },
  props: {
    log: { type: Object, required: true },
    settings: { type: Object, required: true },
  },
  data () {
    return {
      formattedTime: null,
      animated: false
    }
  },
  methods: {
    getAvatarURL (log) {
      let id = this.settings.botAvi && !(log.type === 4)
        ? botID
        : log.user_id
      let url = `/avatars/${id}`
      if (this.animated)
        url += '?format=gif'
      return url
    },
    updateRelativeTime () {
      const localDate = utcToZonedTime(new Date(this.log.created_at + 'Z'), timeZone)
      this.formattedTime = formatDistanceToNow(localDate, new Date()) + ' ago'
      setTimeout(this.updateRelativeTime, 10000)
    }
  },
  created () {
    if (this.settings.timeRelative) {
      this.updateRelativeTime()
    } else {
      const localDate = utcToZonedTime(new Date(this.log.created_at + 'Z'), timeZone)
      this.formattedTime = format(localDate, 'h:mm a')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.avatar {
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
}
.header {
  align-items: center;
  display: flex;
  line-height: 1.375rem;
}
.timestamp {
  @include themify {
    color: mix(themed('bg'), themed('text'), 20%)
  }
  font-size: .75rem;
}
.msg + .msg {
  margin-top: .125rem;
}
.message :deep(.paragraph:first-child) {
  margin-top: 0;
}
.log {
  margin-top: 1.0625rem;
  &:last-child {
    margin-bottom: 1.5rem;
  }
  & .id {
    @include themify {
      color: themed('text-muted');
    }
  }
}

@media (max-width: $mobile-max) {
  .avatar-col {
    width: 3rem;
  }
  .avatar {
    height: 2rem;
    width: 2rem;
  }
  // Message IDs (dev mode) drop below the message. A column, not a wrapping
  // row: with wrap, the full-width ID shares a line with the message and
  // squeezes it to zero width.
  .msg-row {
    flex-direction: column;
  }
  .message-collection {
    flex: 0 0 auto;
    min-width: 0;
  }
  // Let long words and URLs wrap instead of widening the page
  .message {
    font-family: 'ggsansvf';
    flex: 0 0 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .dm-id {
    padding-left: 0;
  }
}
</style>