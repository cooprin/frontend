<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card">
      <q-card-section>
        <div class="text-h6">Реєстрація</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="fullName"
            label="Повне ім'я"
            :rules="[val => !!val || 'Ім\'я обов\'язкове']"
          />

          <q-input
            v-model="email"
            label="Email"
            type="email"
            :rules="[
              val => !!val || 'Email обов\'язковий',
              val => /.+@.+\..+/.test(val) || 'Введіть коректний email'
            ]"
          />

          <q-input
            v-model="password"
            label="Пароль"
            :type="isPwd ? 'password' : 'text'"
            :rules="[
              val => !!val || 'Пароль обов\'язковий',
              val => val.length >= 6 || 'Пароль має бути не менше 6 символів'
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
              val => !!val || 'Підтвердження пароля обов\'язкове',
              val => val === password || 'Паролі не співпадають'
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
            <q-btn
              label="Зареєструватися"
              type="submit"
              color="primary"
              :loading="authStore.loading"
            />
            <q-btn
              label="Вже маєте акаунт?"
              flat
              color="primary"
              :to="{ name: 'login' }"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPwd = ref(true);
const isConfirmPwd = ref(true);

const onSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    return;
  }

  const success = await authStore.register({
    fullName: fullName.value,
    email: email.value,
    password: password.value
  });

  if (success) {
    router.push({ name: 'login' });
  }
};
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>