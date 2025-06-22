<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card">
      <q-card-section>
        <div class="text-h6">Вхід в систему</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            :rules="[(val) => !!val || 'Email обов\'язковий']"
          />

          <q-input
            v-model="password"
            label="Пароль"
            :type="isPwd ? 'password' : 'text'"
            :rules="[(val) => !!val || 'Пароль обов\'язковий']"
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
            <q-btn label="Увійти" type="submit" color="primary" :loading="authStore.loading" />
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

const email = ref('')
const password = ref('')
const isPwd = ref(true)

const onSubmit = async () => {
  const result = await authStore.login({
    email: email.value,
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
