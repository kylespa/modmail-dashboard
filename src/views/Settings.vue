<template>
  <div class="settings-page scroller h-full pt-4">
    <settings-themes v-if="$route.params.category === 'appearance'" :current="settings.theme"
    @changeSetting="changeSetting"/>
    <settings-values v-for="d in visibleCategories" :key="d[1]"
    :settings="settings" :category="d" @changeSetting="changeSetting"/>
  </div>
</template>

<script>
import SettingsThemes from '@/components/Settings/SettingsThemes.vue'
import SettingsValues from '@/components/Settings/SettingsValues.vue'

export default {
  components: {
    SettingsThemes, SettingsValues
  },
  props: {
    settings: { type: Object, required: true },
    category: { type: String, required: true }
  },
  emits: ['changeSetting'],
  inject: ['isDeveloper'],
  data () {
    return {
      categories: [
        [ 'General', 'general', [
          [ 'Page Size', 'pageSize', 'Amount of threads to show per page', {
            type: Number,
            min: 5,
            max: 100
          } ],
          [ 'Recent Users', 'recentUserCount', 'Amount of users to show in the sidebar', {
            type: Number,
            min: 1,
            max: 100
          } ],
          [ 'Date Format', 'dateFormat', 'Order of the day and month in dates. Automatic uses your browser language', {
            type: 'radio',
            options: [ [ 'auto', `Auto` ], [ 'mdy', 'English (US)' ], [ 'dmy', 'English (UK)' ] ]
          } ],
          [ 'Time Format', 'timeFormat', 'Show times on a 12 or 24 hour clock. Automatic uses your browser language', {
            type: 'radio',
            options: [ [ 'auto', 'Auto' ], [ '12', '12 hour' ], [ '24', '24 hour' ] ]
          } ],
          [ 'Relative Time', 'timeRelative', 'Make timestamps relative to now', {
            type: Boolean
          } ],
          [ 'Bot Avatar', 'botAvi', 'Show the bot\'s avatar for non-staff messages', {
            type: Boolean
          } ],
          [ 'Developer Mode', 'devMode', 'Show message IDs', {
            type: Boolean
          } ]
        ] ],
      ]
    }
  },
  computed: {
    visibleCategories () {
      return this.categories.filter(d => d[1] === this.$route.params.category && (!d[3] || this.isDeveloper))
    },
  },
  methods: {
    changeSetting (setting, value) {
      this.$emit('changeSetting', setting, value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.settings-page {
  padding-left: 4rem;
  padding-right: 4rem;
}

@media (max-width: $mobile-max) {
  .settings-page {
    padding-left: .75rem;
    padding-right: .75rem;
  }
}
</style>