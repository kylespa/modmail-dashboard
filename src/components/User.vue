<template>
  <span class="username" :class="{ 'has-role': roleName}">
    <span>{{ name }}</span>
    <span v-if="discrim" class="discrim" :class="{ s: selected }">#{{ discrim }}</span>
    <span v-if="replyRole" class="role text-sm ml-2 rounded">{{ replyRole }}</span>
    <span v-if="roleName" class="role ml-2" :class="roleClass">{{ roleName }}</span>

  </span>
</template>

<script>
import twemoji from '@twemoji/api'

const ROLE_CLASSES = {
  'white lotus - admin': 'role-admin',
  'sentry - senior mod': 'role-staff',
  'staff': 'role-staff',
  'moderator': 'role-staff',
  'mover star': 'role-mover',
  'mover director': 'role-mover'
};

export default {
  props: {
    user: { type: String, required: true },
    role: String,
    selected: Boolean,
    reply: Boolean
  },
  computed: {
    name () {
      if (this.reply)
        return this.replyName
      if (!this.user.includes('#'))
        return this.user
      return this.user.split('#').slice(0, -1).join('#')
    },
    discrim () {
      if (this.reply)
        return null
      if (!this.user.includes('#'))
        return null
      return this.user.split('#').slice(-1)[0]
    },
    replyName () {
      let match = this.user
        .match(/^(?:\(Anonymous\) )?\((.+)\) (.+)$/)
      if (!match)
        return this.user
      return match[1]
    },
    roleName() {
      return this.role || this.replyRole
    },
    roleClass() {
      return this.roleName && ROLE_CLASSES[this.roleName.toLowerCase()]
    },
    replyRole () {
      let match = this.user
        .match(/^(?:\(Anonymous\) )?\((.+)\) (.+)$/)
      if (!match)
        return null
      return match[2]
    }
  },
  mounted () {
    twemoji.parse(this.$el)
  }
}
</script>


<style lang="scss" scoped>
@import '@/variables.scss';

.discrim {
  @include themify { color: themed('text-muted'); }
  &.s { color: #fff; }
  font-size: 80%;
}
// Background colour per role; the text is a darker shade of the same colour
$role-colors: (
  admin: #ecac67,
  staff: #7570ff,
  mover: #60eaff,
);

.has-role {
  align-items: center;
  display: inline-flex;
}
.role {
  @include themify { background: themed('primary'); }
  border-radius: $roundness;
  color: #fff;
  font-size: .75rem;
  font-weight: 600;
  padding: .125rem .375rem;
  vertical-align: middle;
  @each $name, $color in $role-colors {
    &.role-#{$name} {
      background: rgba($color, .15);
      color: $color;
    }
  }
}

</style>
