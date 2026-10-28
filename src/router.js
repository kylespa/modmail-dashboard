import { createRouter, createWebHistory } from 'vue-router'
import Threads from './views/Threads.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [ {
    path: '/',
    name: 'threads',
    component: Threads
  }, {
    path: '/thread/:id',
    name: 'thread',
    component: () => import('./views/Thread.vue')
  }, {
    path: '/settings/:category',
    name: 'settings',
    component: () => import('./views/Settings.vue')
  } ]
})
