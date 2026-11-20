<template>
  <div class="radio-group">
    <label v-for="[val, label] in options" :key="val" class="radio-option">
      <input type="radio" :name="setting" :value="val" v-model="value" @change="change">
      <span class="radio-circle global-trans-ignore" :class="{ on: value === val }"></span>
      <span>{{ label }}</span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    setting: { type: String, required: true },
    options: { type: Array, required: true },
    initial: String
  },
  emits: ['change'],
  data () {
    return {
      value: this.initial ?? this.options[0][0]
    }
  },
  methods: {
    change () {
      this.$emit('change', this.setting, this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../variables.scss';

.radio-group {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
.radio-option {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: .75rem;
  width: fit-content;
}
// Visually hidden but still focusable and announced by screen readers
input {
  clip: rect(0, 0, 0, 0);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
.radio-circle {
  @include themify {
    border: 2px solid themed('text-muted');
    &.on { border-color: themed('primary'); }
    &::after { background: themed('primary'); }
  }
  border-radius: 50%;
  flex-shrink: 0;
  height: 1.25rem;
  position: relative;
  transition: .2s border-color ease-in-out;
  width: 1.25rem;
  &::after {
    border-radius: 50%;
    content: '';
    inset: 3px;
    position: absolute;
    transform: scale(0);
    transition: .2s transform ease-in-out;
  }
  &.on::after { transform: scale(1); }
}
input:focus-visible + .radio-circle {
  @include themify {
    outline: 2px solid themed('primary');
  }
  outline-offset: 2px;
}
</style>
