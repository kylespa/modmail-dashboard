<template>
  <div class="inline-block">
    <select class="rounded" v-model="value" @change="change">
      <option v-for="[val, label] in options" :key="val" :value="val">{{ label }}</option>
    </select>
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

select {
  @include themify {
    background: themed('bg-dark-2');
    color: themed('text');
  }
  padding: .5rem .75rem;
  width: 14em;
  outline: none;
  cursor: pointer;
}
</style>
