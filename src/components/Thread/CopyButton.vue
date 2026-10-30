<template>
  <div class="action-btn" :class="{ copied, compact }" :title="copied ? 'Copied!' : `Copy ${label}`" @click.stop>
    <i class="fa fa-fw" :class="copied ? 'fa-check' : 'fa-clone'"></i>
    <span class="label">{{ copied ? 'Copied!' : label }}</span>
  </div>
</template>

<script>
import ClipboardJS from 'clipboard'

// How long the button shows "Copied!"
const COPIED_MS = 1500

export default {
  props: {
    text: String,
    label: { type: String, required: true },
    compact: Boolean,
  },
  data () {
    return {
      copied: false
    }
  },
  mounted () {
    // Clipboard.js rather than navigator.clipboard, which only exists over HTTPS
    this.clipboard = new ClipboardJS(this.$el, {
      text: () => this.text
    })
    this.clipboard.on('success', () => {
      this.copied = true
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.copied = false
      }, COPIED_MS)
    })
  },
  beforeUnmount () {
    this.clipboard.destroy()
    clearTimeout(this.timeout)
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.action-btn.compact {
  @include themify {
    color: themed('text');
    &.copied { color: themed('primary'); }
  }
  &, &:hover, &.copied { background: transparent; }
  border-radius: 0;
  display: inline-flex;
  font-size: .75rem;
  height: auto;
  padding: 0;
  vertical-align: middle;
  & .label { vertical-align: middle; margin-left: .375rem; }
}
</style>
