<template>
  <div class="paginator select-none flex justify-center my-4">
    <div class="btnPage" :class="{ hidden: page < 2 }" title="First page" @click="first">
      <i class="fa fa-angle-double-left"></i>
    </div>
    <div class="btnPage" :class="{ hidden: page < 2 }" title="Previous page" @click="prev">
      <i class="fa fa-chevron-left text-sm"></i>
    </div>
    <div v-for="i in displayedPages" :key="i" class="btnPage global-trans-ignore" :class="{ current: page === i }"
    @click="select(i)">
      <span>{{i}}</span>
    </div>
    <div class="btnPage" :class="{ hidden: page >= pageCount }" title="Next page" @click="next">
      <i class="fa fa-chevron-right text-sm"></i>
    </div>
    <div class="btnPage" :class="{ hidden: page >= pageCount }" title="Last page" @click="last">
      <i class="fa fa-angle-double-right"></i>
    </div>
  </div>
</template>

<script>

const DISPLAYED_PAGES = 3;

export default {
  props: {
    pageCount: { type: Number, required: true },
    page: { type: Number, required: true }
  },
  emits: ['select'],
  computed: {
    displayedPages () {
      let count = Math.min(DISPLAYED_PAGES, this.pageCount)
      let start = this.page - Math.floor(count / 2)
      start = Math.max(1, Math.min(start, this.pageCount - count + 1))
      return Array.from({ length: count }, (_, i) => start + i)
    }
  },
  methods: {
    select (page) {
      this.$emit('select', page)
    },
    first () {
      if (this.page > 1)
        this.select(1)
    },
    next () {
      if (this.page < this.pageCount)
        this.select(this.page + 1)
    },
    prev () {
      if (this.page > 1)
      this.select(this.page - 1)
    },
    last () {
      if (this.page < this.pageCount)
        this.select(this.pageCount)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.btnPage {
  @include themify {
    &.current {
      background: themed('primary');
    }
    background: themed('bg-dark-2');
  }
  &.current {
    color: #fff;
  }
  &.hidden {
    cursor: default;
    opacity: 0;
  }
  align-items: center;
  border-radius: $spacing * $roundness;
  cursor: pointer;
  display: flex;
  height: 2.5rem;
  justify-content: center;
  margin: 0 .5rem;
  width: 2rem;
}

@media (max-width: $mobile-max) {
  .btnPage {
    margin: 0 1px;
    width: 1.875rem;
  }
}
</style>