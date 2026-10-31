<template>
  <div class="gallery" :class="layout">
    <template v-for="(url, i) in tiles" :key="i">
      <button v-if="i === 3 && hiddenCount" class="tile more" title="View all images" @click="open(3)">
        <img :src="url" loading="lazy" alt="Attachment">
        <span class="overlay">+{{ hiddenCount }}</span>
      </button>
      <a v-else class="tile" :href="url" target="_blank" rel="noopener noreferrer">
        <img :src="url" loading="lazy" alt="Attachment">
      </a>
    </template>

    <teleport to="body">
      <transition name="fade">
        <div v-if="carouselOpen" class="carousel" @click.self="close">
          <button class="ctrl close" title="Close" @click="close"><i class="fa fa-fw fa-times"></i></button>
          <button class="ctrl nav prev" :disabled="index === 0" @click="go(index - 1)">
            <i class="fa fa-fw fa-chevron-left"></i>
          </button>
          <div class="track" ref="track" @scroll="onScroll">
            <div v-for="(url, i) in images" :key="i" class="slide" @click.self="close">
              <a :href="url" target="_blank" rel="noopener noreferrer">
                <img :src="url" alt="Attachment">
              </a>
            </div>
          </div>
          <button class="ctrl nav next" :disabled="index === images.length - 1" @click="go(index + 1)">
          <i class="fa fa-fw fa-chevron-right"></i>
          </button>
          <div class="counter">{{ index + 1 }} / {{ images.length }}</div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
const MAX_TILES = 4

export default {
  props: {
    images: { type: Array, required: true },
  },
  data () {
    return {
      carouselOpen: false,
      index: 0
    }
  },
  computed: {
    layout () {
      return ['single', 'two', 'three', 'grid'][Math.min(this.images.length, MAX_TILES) - 1]
    },
    tiles () {
      return this.images.slice(0, MAX_TILES)
    },
    hiddenCount () {
      return Math.max(this.images.length - MAX_TILES, 0)
    }
  },
  methods: {
    open (i) {
      this.carouselOpen = true
      this.index = i
      window.addEventListener('keydown', this.onKey)
      this.$nextTick(() => {
        this.$refs.track.scrollLeft = i * this.$refs.track.clientWidth
      })
    },
    close () {
      this.carouselOpen = false
      window.removeEventListener('keydown', this.onKey)
    },
    go (i) {
      const track = this.$refs.track
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' })
    },
    onScroll () {
      const track = this.$refs.track
      this.index = Math.round(track.scrollLeft / track.clientWidth)
    },
    onKey (e) {
      if (e.key === 'Escape') this.close()
      else if (e.key === 'ArrowLeft' && this.index > 0) this.go(this.index - 1)
      else if (e.key === 'ArrowRight' && this.index < this.images.length - 1) this.go(this.index + 1)
    }
  },
  beforeUnmount () {
    window.removeEventListener('keydown', this.onKey)
  }
}
</script>

<style lang="scss" scoped>
@import '@/variables.scss';

.gallery {
  display: grid;
  gap: .25rem;
  width: 400px;
  max-width: 100%;
  border-radius: $roundness;
  overflow: hidden;

  &.single {
    display: block;
    width: auto;
    & img {
      max-width: 400px;
      max-height: 300px;
      border-radius: $roundness;
    }
  }
  &.two {
    grid-template-columns: 1fr 1fr;
    aspect-ratio: 2 / 1;
    & img {
      border-radius: $roundness;
    }
  }
  &.three {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 3 / 2;
    & .tile:first-child { grid-row: span 2; }
    & img {
      border-radius: $roundness;
    }
  }
  &.grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 1;
    & img {
      border-radius: $roundness;
    }
  }
}

.gallery:not(.single) .tile {
  border-radius: $roundness;
  display: block;
  position: relative;
  min-width: 0;
  min-height: 0;
  & img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

button.tile {
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.overlay {
  position: absolute;
  border-radius: $roundness;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, .6);
  color: #fff;
  font-size: 1.75rem;
  font-weight: 600;
  transition: background .15s;
  .more:hover & { background: rgba(0, 0, 0, .45); }
}

.carousel {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, .75);
  -webkit-background-filter: blur(4px);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  &.fade-enter-active, &.fade-leave-active { transition-duration: .15s; }
}

.track {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 4rem;
  & img {
    display: block;
    max-width: 100%;
    max-height: calc(100vh - 7rem);
    border-radius: $roundness;
  }
}

.ctrl {
  position: absolute;
  z-index: 1;
  border: 0;
  border-radius: $roundness;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, .1);
  color: #fff;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, .2); }
  &:disabled { opacity: .3; cursor: default; }
}
.close { top: 1rem; right: 1rem; }
.nav { top: 50%; transform: translateY(-50%); }
.prev { left: 1rem; }
.next { right: 1rem; }

.counter {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: #ddd;
  font-size: .875rem;
}

@media (max-width: $mobile-max) {
  .gallery.single img { max-width: 100%; }
  .nav { display: none; }
  .slide { padding: 3.5rem .5rem; }
}
</style>