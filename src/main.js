import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// Clipboard.js
import ClipboardJS from 'clipboard'
new ClipboardJS('.copyBtn', {
  text: (trigger) => {
    return trigger.dataset.clipboardText;
  }
})

createApp(App).use(router).mount('#app')
