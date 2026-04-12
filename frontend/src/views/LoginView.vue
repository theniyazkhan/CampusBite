<template>
  <div class="login-container">
    <div class="login-card">
      <div class="brand flex-center">
        <svg class="icon-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
        CampusBite
      </div>

      <h2>Welcome Back</h2>
      <p class="subtitle">Please sign in to continue.</p>

      <div class="role-toggle">
        <button
          :class="['toggle-btn', { active: loginType === 'student' }]"
          @click="loginType = 'student'"
          :disabled="isLoading">
          Student
        </button>
        <button
          :class="['toggle-btn', { active: loginType === 'admin' }]"
          @click="loginType = 'admin'"
          :disabled="isLoading">
          Kitchen Admin
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group" v-if="loginType === 'student' && isRegisterMode">
          <label>Student ID</label>
          <input type="text" v-model="registerData.student_id" placeholder="your-student-id" required :disabled="isLoading" />
        </div>

        <div class="input-group" v-else-if="loginType === 'student'">
          <label>Student ID</label>
          <input type="text" v-model="credentials.student_id" placeholder="your-student-id" required :disabled="isLoading" />
        </div>

        <div class="input-group" v-else>
          <label>Admin Username</label>
          <input type="text" v-model="credentials.username" placeholder="admin" required :disabled="isLoading" />
        </div>

        <template v-if="loginType === 'student' && isRegisterMode">
          <div class="input-group">
            <label>Name</label>
            <input type="text" v-model="registerData.name" placeholder="Your Name" required :disabled="isLoading" />
          </div>
          <div class="input-group">
            <label>Phone</label>
            <input type="tel" v-model="registerData.phone" placeholder="10-11 digits" required :disabled="isLoading" />
          </div>
        </template>

        <div class="input-group" v-if="loginType === 'student' && isRegisterMode">
          <label>Password</label>
          <input type="password" v-model="registerData.password" placeholder="••••••••" required :disabled="isLoading" />
        </div>

        <div class="input-group" v-else>
          <label>Password</label>
          <input type="password" v-model="credentials.password" placeholder="••••••••" required :disabled="isLoading" />
        </div>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="isLoading">
            <span class="spinner"></span>
            {{ loginType === 'student' && isRegisterMode ? 'Creating...' : 'Signing In...' }}
          </span>
          <span v-else>
            {{ loginType === 'student' && isRegisterMode ? 'Create Account' : 'Sign In' }}
          </span>
        </button>

        <p class="signup-toggle" v-if="loginType === 'student'">
          <span v-if="!isRegisterMode">Don't have an account?</span>
          <span v-else>Already have an account?</span>
          <button type="button" class="link-btn" @click="isRegisterMode = !isRegisterMode" :disabled="isLoading">
            {{ isRegisterMode ? 'Go to login' : 'Create one' }}
          </button>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '../composables/useNotifications';
import { authApi } from '../lib/api';
import '../styles/LoginView.css';

const router = useRouter();
const { alert } = useNotifications();

const loginType = ref('student');
const isRegisterMode = ref(false);
const isLoading = ref(false);

const credentials = ref({ student_id: '', username: '', password: '' });
const registerData = ref({ student_id: '', name: '', phone: '', password: '' });

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    if (loginType.value === 'student') {
      if (isRegisterMode.value) {
        // Validate registration data
        if (!registerData.value.student_id || !registerData.value.name || !registerData.value.phone || !registerData.value.password) {
          alert('All fields are required for student sign up.', 'error');
          isLoading.value = false;
          return;
        }

        // Call API to register
        await authApi.registerStudent({
          student_id: registerData.value.student_id,
          name: registerData.value.name.trim(),
          phone: registerData.value.phone,
          password: registerData.value.password
        });

        alert('Account created successfully! You can now sign in.', 'success');
        isRegisterMode.value = false;
        credentials.value.student_id = registerData.value.student_id;
        credentials.value.password = '';
        registerData.value = { student_id: '', name: '', phone: '', password: '' };
      } else {
        // Student login
        const response = await authApi.loginStudent({
          student_id: credentials.value.student_id,
          password: credentials.value.password
        });

        const studentData = response.data as any;
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('studentId', studentData.student.student_id);
        localStorage.setItem('studentName', studentData.student.name);
        if (studentData.student.phone) localStorage.setItem('studentPhone', studentData.student.phone);
        router.push('/');
      }
    } else {
      // Admin login (temporary: hardcoded password while we debug the backend route)
      if (credentials.value.username === 'admin' && credentials.value.password === 'admin@12345') {
        localStorage.setItem('userRole', 'admin');
        router.push('/admin');
        alert('Admin login successful!', 'success');
      } else {
        alert('Invalid admin credentials. Use admin / admin@12345', 'error');
      }
    }
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Operation failed. Please try again.';
    alert(msg, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-login:disabled,
.toggle-btn:disabled,
input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>