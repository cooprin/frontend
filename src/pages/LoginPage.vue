<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card">
      <q-card-section>
        <div class="text-h6">System Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="username"
            label="System or Wialon Username"
            autocomplete="username"
            :rules="[(val) => !!val || 'Username is required']"
          />

          <q-input
            v-model="password"
            label="Password"
            :type="isPwd ? 'password' : 'text'"
            autocomplete="current-password"
            :rules="[(val) => !!val || 'Password is required']"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <div class="flex justify-center">
            <q-btn label="Login" type="submit" color="primary" :loading="authStore.loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isPwd = ref(true)

const onSubmit = async () => {
  const result = await authStore.login({
    email: username.value, // Backend ще очікує поле email
    password: password.value,
  })

  if (result.success) {
    // Перевіряємо тип користувача і редіректимо на відповідну сторінку
    if (result.userType === 'staff') {
      router.push({ name: 'admin-dashboard' })
    } else if (result.userType === 'client') {
      router.push({ name: 'portal-dashboard' })
    } else {
      // Fallback на дефолтний роут
      router.push(authStore.getDefaultRoute)
    }
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>
