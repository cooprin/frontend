<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-xl-10">
        <!-- Header -->
        <div class="text-h4 q-mb-lg text-center text-weight-light">
          {{ $t('portal.pages.profile.title') }}
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner size="60px" color="primary" />
          <div class="q-mt-md text-subtitle1">{{ $t('portal.messages.loading') }}</div>
        </div>

        <!-- Profile Content -->
        <div v-else-if="profile" class="row q-gutter-lg">
          <!-- Personal Information -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="full-height">
              <q-card-section class="bg-primary text-white">
                <div class="text-h6">
                  <q-icon name="business" class="q-mr-sm" />
                  {{ $t('portal.pages.profile.personalInfo') }}
                </div>
              </q-card-section>
              <q-card-section>
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white" icon="business" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{
                        $t('clients.name')
                      }}</q-item-label>
                      <q-item-label caption class="text-body1">{{ profile.name }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.full_name">
                    <q-item-section avatar>
                      <q-avatar color="secondary" text-color="white" icon="domain" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{
                        $t('clients.fullName')
                      }}</q-item-label>
                      <q-item-label caption class="text-body1">{{
                        profile.full_name
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.contact_person">
                    <q-item-section avatar>
                      <q-avatar color="orange" text-color="white" icon="person" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{
                        $t('clients.contactPerson')
                      }}</q-item-label>
                      <q-item-label caption class="text-body1">{{
                        profile.contact_person
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Contact Information -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="full-height">
              <q-card-section class="bg-secondary text-white">
                <div class="text-h6">
                  <q-icon name="contact_phone" class="q-mr-sm" />
                  {{ $t('portal.pages.profile.contactInfo') }}
                </div>
              </q-card-section>
              <q-card-section>
                <q-list>
                  <q-item v-if="profile.email">
                    <q-item-section avatar>
                      <q-avatar color="green" text-color="white" icon="email" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{
                        $t('clients.email')
                      }}</q-item-label>
                      <q-item-label caption class="text-body1">{{ profile.email }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.phone">
                    <q-item-section avatar>
                      <q-avatar color="blue" text-color="white" icon="phone" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{
                        $t('clients.phone')
                      }}</q-item-label>
                      <q-item-label caption class="text-body1">{{ profile.phone }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.address">
                    <q-item-section avatar>
                      <q-avatar color="purple" text-color="white" icon="location_on" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{
                        $t('clients.address')
                      }}</q-item-label>
                      <q-item-label caption class="text-body1">{{ profile.address }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Payment Status -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="full-height">
              <q-card-section class="bg-orange text-white">
                <div class="text-h6">
                  <q-icon name="payment" class="q-mr-sm" />
                  {{ $t('clients.payment.title') }}
                </div>
              </q-card-section>
              <q-card-section>
                <div v-if="loadingPayment" class="text-center q-py-lg">
                  <q-spinner color="primary" size="40px" />
                  <div class="text-caption q-mt-sm">{{ $t('clients.payment.loading') }}</div>
                </div>

                <div v-else-if="paymentInfo?.error" class="text-center q-py-lg">
                  <q-icon name="error" color="negative" size="48px" />
                  <div class="text-body2 q-mt-sm text-negative">
                    {{ $t('clients.payment.error') }}
                  </div>
                </div>

                <div v-else-if="!paymentInfo?.isConfigured" class="text-center q-py-lg">
                  <q-icon name="info" color="info" size="48px" />
                  <div class="text-body2 q-mt-sm">
                    {{ $t('clients.payment.notConfigured') }}
                  </div>
                </div>

                <div v-else-if="paymentInfo" class="q-gutter-md">
                  <!-- Payment Status -->
                  <div class="text-center">
                    <q-avatar
                      :color="getPaymentStatusColor(paymentInfo.status)"
                      text-color="white"
                      size="64px"
                      :icon="getPaymentStatusIcon(paymentInfo.status)"
                    />
                    <div class="text-h6 q-mt-md">
                      {{ $t(`clients.payment.status.${paymentInfo.status}`) }}
                    </div>
                  </div>

                  <!-- Days Left (if available) -->
                  <div
                    v-if="paymentInfo.daysLeft !== null && paymentInfo.daysLeft !== undefined"
                    class="text-center"
                  >
                    <q-chip
                      :color="getDaysLeftColor(paymentInfo.daysLeft)"
                      text-color="white"
                      size="lg"
                      icon="schedule"
                    >
                      {{ paymentInfo.daysLeft }} {{ $t('common.days') }}
                    </q-chip>
                    <div class="text-caption q-mt-xs text-grey-6">
                      {{ $t('clients.payment.daysLeft') }}
                    </div>
                  </div>

                  <!-- Wialon Information -->
                  <div v-if="paymentInfo.wialonUsername" class="q-mt-md">
                    <q-separator class="q-mb-sm" />
                    <div class="text-caption text-grey-6 q-mb-xs">Wialon</div>
                    <div class="text-body2">
                      <q-icon name="account_circle" class="q-mr-xs" />
                      {{ paymentInfo.wialonUsername }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Statistics -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="full-height">
              <q-card-section class="bg-accent text-white">
                <div class="text-h6">
                  <q-icon name="analytics" class="q-mr-sm" />
                  {{ $t('portal.pages.profile.statisticsInfo') }}
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-gutter-md">
                  <div class="col">
                    <div class="text-center">
                      <q-avatar
                        color="primary"
                        text-color="white"
                        size="56px"
                        icon="directions_car"
                      />
                      <div class="text-h4 text-weight-bold q-mt-sm text-primary">
                        {{ profile.objects_count || 0 }}
                      </div>
                      <div class="text-subtitle2 text-grey-7">
                        {{ $t('portal.myObjects') }}
                      </div>
                    </div>
                  </div>

                  <q-separator vertical />

                  <div class="col">
                    <div class="text-center">
                      <q-avatar color="orange" text-color="white" size="56px" icon="folder" />
                      <div class="text-h4 text-weight-bold q-mt-sm text-orange">
                        {{ profile.documents_count || 0 }}
                      </div>
                      <div class="text-subtitle2 text-grey-7">
                        {{ $t('portal.myDocuments') }}
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="error" size="80px" color="negative" />
          <div class="text-h6 q-mt-md text-negative">{{ $t('portal.messages.error') }}</div>
          <q-btn
            color="primary"
            :label="$t('common.retry')"
            @click="loadProfile"
            class="q-mt-lg"
            size="lg"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PortalApi } from 'src/api/portal'

const profile = ref(null)
const loading = ref(false)
const paymentInfo = ref(null)
const loadingPayment = ref(false)

const loadProfile = async () => {
  try {
    loading.value = true
    const response = await PortalApi.getProfile()

    if (response.data.success) {
      profile.value = response.data.client
      // Завантажуємо платіжну інформацію після отримання профілю
      await loadPaymentInfo()
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

const loadPaymentInfo = async () => {
  if (!profile.value) return

  loadingPayment.value = true
  try {
    const response = await PortalApi.getPaymentStatus()
    paymentInfo.value = response.data.paymentInfo
  } catch (error) {
    console.error('Error loading payment info:', error)
    paymentInfo.value = {
      isConfigured: false,
      error: error.response?.data?.message || 'Помилка завантаження платіжної інформації',
    }
  } finally {
    loadingPayment.value = false
  }
}

// Допоміжні методи для платіжної інформації
const getPaymentStatusColor = (status) => {
  const colors = {
    active: 'positive',
    expiring_soon: 'warning',
    expired: 'negative',
    blocked: 'negative',
    unknown: 'grey',
  }
  return colors[status] || 'grey'
}

const getPaymentStatusIcon = (status) => {
  const icons = {
    active: 'check_circle',
    expiring_soon: 'warning',
    expired: 'error',
    blocked: 'block',
    unknown: 'help',
  }
  return icons[status] || 'help'
}

const getDaysLeftColor = (daysLeft) => {
  if (daysLeft > 7) return 'positive'
  if (daysLeft > 3) return 'warning'
  if (daysLeft > 0) return 'orange'
  return 'negative'
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.q-item-label {
  font-weight: 500;
}

.q-item-label[caption] {
  font-size: 1rem !important;
  color: var(--q-dark) !important;
  opacity: 0.8;
}

.q-card {
  transition: all 0.3s ease;
}

.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>
