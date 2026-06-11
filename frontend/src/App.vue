<template>
  <div class="app-layout">
    <!-- Left Navigation Sidebar -->
    <aside class="app-sidebar">
      <!-- Branding Section -->
      <div class="brand-container">
        <!-- <div class="brand-logo">✨</div> -->
        <div class="brand-info">
          <h1>Starlight</h1>
          <p>Reinsurance System</p>
        </div>
      </div>
      
      <!-- Navigation Links -->
      <nav class="nav-links">
        <router-link to="/" class="nav-item" active-class="active">
          <span class="nav-icon">🧮</span>
          <span class="nav-text">Calculator</span>
        </router-link>
        <router-link to="/journal-entries" class="nav-item" active-class="active">
          <span class="nav-icon">📝</span>
          <span class="nav-text">Journal Entries</span>
        </router-link>
        <router-link to="/itd-editor" class="nav-item" active-class="active">
          <span class="nav-icon">🛠️</span>
          <span class="nav-text">ITD Editor</span>
        </router-link>
      </nav>

      <!-- Sidebar Footer / Status / Actions -->
      <div class="sidebar-footer">
        <div class="actions">
          <div v-if="loading" class="loading-indicator">⏳ Processing...</div>
          <button class="btn-clear-db" :disabled="loading" @click="handleClearDb">
            🗑️ Clear DB
          </button>
        </div>
        
        <div class="system-status">
          <span class="status-dot"></span>
          <span class="status-text">System Active</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="app-main">
      <!-- Main Content Header -->
      <header class="app-header">
        <div class="brand-container-main">
          <h1>Starlight Reinsurance System</h1>
          <p>Premium Exhibits, Actuarial Statements & GL Mappings</p>
        </div>
      </header>

      <div class="container">
        <router-view />
      </div>
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

    return {
      loading,
      handleClearDb,
    };
  },
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  background-color: var(--bg-base);
}

.app-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #f8fafc; /* slightly softer light background */
  border-right: 1px solid var(--glass-border);
  padding: 1.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(15, 23, 42, 0.02);
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 10;
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  padding: 0.5rem;
}

.brand-info h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: -0.5px;
  color: var(--color-primary); /* solid primary light violet */
  line-height: 1.2;
}

.brand-info p {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
  font-weight: 500;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex-grow: 1;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.8rem 1.15rem;
  border-radius: 10px;
  transition: var(--transition-smooth);
  border: 1px solid transparent;
  outline: none;
  background: transparent;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 4px;
  background-color: var(--color-primary);
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: var(--transition-smooth);
}

.nav-item.active::before {
  opacity: 1;
}

.nav-item:focus {
  outline: none;
}

.nav-item:hover {
  color: var(--color-text);
  background-color: #f1f5f9;
}

.nav-item:hover .nav-icon {
  transform: translateY(-1px) scale(1.08);
}

.nav-item.active {
  color: var(--color-primary);
  background-color: #f5f3ff; /* light violet-purple pastel */
  border: 1px solid rgba(139, 92, 246, 0.12);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.03);
}

.nav-icon {
  font-size: 1.15rem;
  transition: var(--transition-smooth);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-clear-db {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  background-color: #fff5f5;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-clear-db:hover {
  background-color: #fff0f0;
  border-color: #feb2b2;
  transform: translateY(-1px);
}

.loading-indicator {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 600;
  text-align: center;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.15);
  align-self: flex-start;
  font-family: var(--font-display);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-success);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-success);
  animation: breathe 2s infinite ease-in-out;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 4px rgba(16, 185, 129, 0.4);
  }
  50% {
    transform: scale(1.25);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
  }
}

.status-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-success);
}

.app-main {
  flex-grow: 1;
  min-width: 0;
  overflow-y: auto;
  height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  padding: 1.25rem 2rem;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.02);
  position: sticky;
  top: 0;
  z-index: 9;
}

.brand-container-main h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: -0.5px;
  color: var(--color-primary); /* solid primary light violet */
  line-height: 1.2;
}

.brand-container-main p {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}
</style>

