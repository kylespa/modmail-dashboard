<template>
  <div class="section">
    <p class="section-title">Appearance</p>
    <div class="theme-selector">
      <div v-for="theme in themes" class="inline-block justify-center px-8 mb-4" :key="theme[1]" :class="themeName(theme[1])">
        <div class="theme text-center inline-block" @click="selectTheme(theme[1])" :class="{ current: current === theme[1] }">
          <div class="theme-preview w-20 rounded-lg h-20 mb-4 mx-auto flex select-none">
            <i v-if="theme[1] === 'system'" class="fa fa-refresh text-3xl m-auto"></i>
            <div v-else class="bg rounded-l-lg"></div>
          </div>
          <span class="text-lg">{{theme[0]}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    current: { type: String, required: true }
  },
  emits: ['changeSetting'],
  data () {
    return {
      themes: [
        ['Light', 'light'],
        ['System', 'system'],
        ['Discord', 'discord'],
        ['Dark', 'dark'],
        ['Black', 'black']
      ]
    }
  },
  methods: {
    selectTheme (theme) {
      this.$emit('changeSetting', 'theme', theme)
    },
    themeName (theme) {
      return {
        [`theme-preview-${theme}`]: true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.theme {
  cursor: pointer;
}

.current .theme-preview {
  @include themify {
    box-shadow: 0 0 0 4px themed('primary');
  }
  border: 2px solid gray;
}

@media (max-width: $mobile-max) {
  .theme-selector {
    text-align: center;
  }
  .theme-selector > div {
    padding-left: .5rem;
    padding-right: .5rem;
  }
}

.theme-preview-system .theme-preview {
  @include themify {
    background: themed('bg-dark-2');
    color: themed('text');
  }
}

@include theme-previews () {
  .bg {
    background: themed('bg-dark-1');
  }
  .title {
    background: themed('text');
  }
  background: themed('bg');
}
</style>