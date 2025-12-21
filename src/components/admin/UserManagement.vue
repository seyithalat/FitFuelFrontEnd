<template>
  <div class="admin-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h2>User Management</h2>
      <button class="btn-secondary" @click="$emit('back')">← Back to Dashboard</button>
    </div>
    <div style="margin-bottom: 1rem;">
      <input type="text" v-model="search" @input="handleSearch" placeholder="Search by email..." style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">
    </div>
    <div class="workout-card">
      <div v-if="users.length === 0">No users found</div>
      <div v-for="user in users" :key="user.user_id" class="exercise-item">
        <div style="flex: 1;">
          <div class="exercise-name">{{ user.email }}</div>
          <div class="exercise-details">
            User ID: {{ user.user_id }} | 
            Workouts: {{ user.workout_count || 0 }} | 
            Meals: {{ user.meal_count || 0 }} |
            <span v-if="user.is_admin" style="color: var(--primary);">Admin</span>
            <span v-else>User</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary" @click="editUser(user)">Edit</button>
          <button class="btn-danger" @click="deleteUser(user)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button class="modal-close" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSaveUser">
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="editingUser.email" required>
            </div>
            <div class="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input type="password" v-model="editingUser.password" placeholder="Enter new password">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="editingUser.is_admin">
                Admin User
              </label>
            </div>
            <div class="error-message">{{ error }}</div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary">Save Changes</button>
              <button type="button" class="btn-secondary" @click="closeEditModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from '../../services/api'

export default {
  name: 'UserManagement',
  emits: ['back'],
  setup() {
    const users = ref([])
    const search = ref('')
    const showEditModal = ref(false)
    const editingUser = ref({})
    const error = ref('')

    const loadUsers = async () => {
      try {
        users.value = await api.getAdminUsers(search.value)
      } catch (err) {
        console.error('Error loading users:', err)
      }
    }

    const handleSearch = () => {
      loadUsers()
    }

    const editUser = (user) => {
      editingUser.value = { ...user }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingUser.value = {}
      error.value = ''
    }

    const handleSaveUser = async () => {
      error.value = ''
      try {
        const updateData = {
          email: editingUser.value.email,
          is_admin: editingUser.value.is_admin
        }
        if (editingUser.value.password) {
          updateData.password = editingUser.value.password
        }
        await api.updateAdminUser(editingUser.value.user_id, updateData)
        closeEditModal()
        await loadUsers()
      } catch (err) {
        error.value = err.message || 'Failed to update user'
      }
    }

    const deleteUser = async (user) => {
      if (!confirm(`Are you sure you want to delete user "${user.email}"? This action cannot be undone.`)) return
      try {
        await api.deleteAdminUser(user.user_id)
        await loadUsers()
      } catch (err) {
        alert('Failed to delete user')
      }
    }

    onMounted(loadUsers)

    return {
      users,
      search,
      showEditModal,
      editingUser,
      error,
      handleSearch,
      editUser,
      closeEditModal,
      handleSaveUser,
      deleteUser
    }
  }
}
</script>
