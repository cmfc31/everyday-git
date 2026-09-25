import { createRouter, createWebHashHistory } from 'vue-router'
import LandingView from './views/LandingView.vue'
import LearnView from './views/LearnView.vue'
import LessonView from './views/LessonView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: LandingView },
    { path: '/learn', name: 'learn', component: LearnView },
    { path: '/lesson/:id', name: 'lesson', component: LessonView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
