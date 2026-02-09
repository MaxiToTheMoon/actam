import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import BorderoFormView from '../views/CompileView.vue';
import BorderoListView from '../views/RecognizeView.vue';
import RecordingView from '../views/RecordingView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Recording', component: RecordingView },
  { path: '/recognize', name: 'Recognize', component: BorderoListView },
  { path: '/form', name: 'BorderoForm', component: BorderoFormView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
