<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card">
      <q-card-section>
        <div class="text-h6">Реєстрація</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="firstName"
            label="Ім'я"
            :rules="[(val) => !!val || 'Ім\'я обов\'язкове']"
          />

          <q-input
            v-model="lastName"
            label="Прізвище"
            :rules="[(val) => !!val || 'Прізвище обов\'язкове']"
          />

          <q-input
            v-model="email"
            label="Email"
            type="email"
            :rules="[
              (val) => !!val || 'Email обов\'язковий',
              (val) => /.+@.+\..+/.test(val) || 'Введіть коректний email',
            ]"
          />

          <q-input
            v-model="phone"
            label="Телефон"
            type="tel"
            :rules="[(val) => !!val || 'Телефон обов\'язковий']"
          />

          <q-input
            v-model="password"
            label="Пароль"
            :type="isPwd ? 'password' : 'text'"
            :rules="[
              (val) => !!val || 'Пароль обов\'язковий',
              (val) => val.length >= 6 || 'Пароль має бути не менше 6 символів',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            label="Підтвердження пароля"
            :type="isConfirmPwd ? 'password' : 'text'"
            :rules="[
              (val) => !!val || 'Підтвердження пароля обов\'язкове',
              (val) => val === password || 'Паролі не співпадають',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isConfirmPwd = !isConfirmPwd"
              />
            </template>
          </q-input>

          <div class="flex justify-between">
            <q-btn label="Зареєструватися" type="submit" color="primary" :loading="loading" />
            <q-btn label="Вже маєте акаунт?" flat color="primary" :to="{ name: 'login' }" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { AuthApi } from 'src/api/auth'

const router = useRouter()
const $q = useQuasar()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const isPwd = ref(true)
const isConfirmPwd = ref(true)
const loading = ref(false)

const onSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'Паролі не співпадають',
    })
    return
  }

  loading.value = true
  try {
    const response = await AuthApi.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: 'Реєстрація успішна',
      })
      router.push({ name: 'login' })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Помилка реєстрації',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>
