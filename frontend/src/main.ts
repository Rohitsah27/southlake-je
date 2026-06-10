import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import './styles/Calculator.css';
import './styles/JournalEntries.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
