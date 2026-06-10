import { createRouter, createWebHistory } from 'vue-router';
import Calculator from '../views/Calculator.vue';
import JournalEntries from '../views/JournalEntries.vue';
import SeederEditor from '../views/SeederEditor.vue';

const routes = [
  {
    path: '/',
    name: 'Calculator',
    component: Calculator,
  },
  {
    path: '/journal-entries',
    name: 'JournalEntries',
    component: JournalEntries,
  },
  {
    path: '/seeder-editor',
    name: 'SeederEditor',
    component: SeederEditor,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
