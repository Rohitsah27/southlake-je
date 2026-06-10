<template>
  <div class="app-layout">
    <!-- Application Header -->
    <header class="app-header">
      <div class="brand-container">
        <h1>Starlight Reinsurance System</h1>
        <p>Premium Exhibits, Actuarial Statements & GL Mappings</p>
      </div>
      
      <nav class="nav-links">
        <router-link to="/" class="nav-item" active-class="active">
          🧮 Calculator & Exhibits
        </router-link>
        <router-link to="/journal-entries" class="nav-item" active-class="active">
          📝 Journal Entries
        </router-link>
        <router-link to="/seeder-editor" class="nav-item" active-class="active">
          🛠️ ITD Seeder Editor
        </router-link>
      </nav>

      <div class="actions">
        <span v-if="loading" class="loading-indicator">⏳ Processing...</span>
        <button class="btn btn-danger btn-sm" :disabled="loading" @click="handleClearDb">
          🗑️ Clear DB
        </button>
        <button class="btn btn-success btn-sm" :disabled="loading" @click="handleSeedDb">
          ⚡ Seed ITD Data
        </button>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { api } from './services/api';

export default defineComponent({
  name: 'App',
  setup() {
    const loading = ref(false);

    const handleClearDb = async () => {
      if (!confirm('Are you sure you want to delete all workbooks and exhibits from the database? This cannot be undone.')) {
        return;
      }
      loading.value = true;
      try {
        const res = await api.clearDatabase();
        alert(res.message || 'Database successfully cleared.');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Failed to clear database');
      } finally {
        loading.value = false;
      }
    };

    const handleSeedDb = async () => {
      loading.value = true;
      try {
        const res = await api.seedDatabase();
        const resultsStr = res.results
          .map((r: any) => `${r.file}: ${r.success ? '✅ Success' : '❌ Failed (' + r.message + ')'}`)
          .join('\n');
        localStorage.removeItem('starlight_active_workbook_key_db');
        alert(`ITD Seeding completed!\n\n${resultsStr}\n\nITD workbook will now load.`);
        window.location.reload();
      } catch (err: any) {
        console.error(err);
        const errMsg = err?.message || 'Unknown error';
        alert(`Failed to run ITD seeder: ${errMsg}\n\nMake sure you have restarted the backend server after recent code changes.`);
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      handleClearDb,
      handleSeedDb,
    };
  },
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border-bottom: 1px solid var(--glass-border);
  padding: 1.25rem 2rem;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand-container h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-container p {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: var(--transition-smooth);
}

.nav-item:hover {
  color: var(--color-text);
  background-color: var(--bg-surface-hover);
}

.nav-item.active {
  color: var(--color-text);
  background-color: var(--color-primary-glow);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.loading-indicator {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-right: 0.5rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}
</style>

