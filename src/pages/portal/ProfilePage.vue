<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">
              {{ $t('portal.pages.profile.title') }}
            </div>

            <q-separator class="q-mb-md" />

            <!-- Loading -->
            <div v-if="loading" class="text-center q-py-md">
              <q-spinner size="40px" color="primary" />
              <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
            </div>

            <!-- Profile Content -->
            <div v-else-if="profile" class="row q-gutter-md">
              <!-- Personal Information -->
              <div class="col-12 col-md-6">
                <div class="text-h6 q-mb-sm">
                  {{ $t('portal.pages.profile.personalInfo') }}
                </div>
                <q-list bordered separator>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="business" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('clients.name') }}</q-item-label>
                      <q-item-label caption>{{ profile.name }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.full_name">
                    <q-item-section avatar>
                      <q-icon name="domain" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('clients.fullName') }}</q-item-label>
                      <q-item-label caption>{{ profile.full_name }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.contact_person">
                    <q-item-section avatar>
                      <q-icon name="person" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('clients.contactPerson') }}</q-item-label>
                      <q-item-label caption>{{ profile.contact_person }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- Contact Information -->
              <div class="col-12 col-md-6">
                <div class="text-h6 q-mb-sm">
                  {{ $t('portal.pages.profile.contactInfo') }}
                </div>
                <q-list bordered separator>
                  <q-item v-if="profile.email">
                    <q-item-section avatar>
                      <q-icon name="email" color="secondary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('clients.email') }}</q-item-label>
                      <q-item-label caption>{{ profile.email }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.phone">
                    <q-item-section avatar>
                      <q-icon name="phone" color="secondary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('clients.phone') }}</q-item-label>
                      <q-item-label caption>{{ profile.phone }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="profile.address">
                    <q-item-section avatar>
                      <q-icon name="location_on" color="secondary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('clients.address') }}</q-item-label>
                      <q-item-label caption>{{ profile.address }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- Wialon Payment Status -->
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-sm">
                      {{ $t('clients.payment.title') }}
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <div v-if="loadingPayment" class="text-center q-pa-md">
                      <q-spinner color="primary" size="2em" />
                      <div class="text-caption q-mt-sm">{{ $t('clients.payment.loading') }}</div>
                    </div>

                    <div v-else-if="!paymentInfo?.isConfigured" class="text-center q-pa-md">
                      <q-icon name="warning" color="warning" size="2em" />
                      <div class="text-body2 q-mt-sm">
                        {{ $t('clients.payment.notConfigured') }}
                      </div>
                    </div>

                    <div v-else-if="!paymentInfo?.hasWialonResourceId" class="text-center q-pa-md">
                      <q-icon name="info" color="info" size="2em" />
                      <div class="text-body2 q-mt-sm">
                        {{ $t('clients.payment.noWialonResourceId') }}
                      </div>
                    </div>

                    <div v-else-if="paymentInfo?.error" class="text-center q-pa-md">
                      <q-icon name="error" color="negative" size="2em" />
                      <div class="text-body2 q-mt-sm text-negative">
                        {{ $t('clients.payment.error') }}
                      </div>
                      <div class="text-caption q-mt-xs">{{ paymentInfo.error }}</div>
                    </div>

                    <div v-else-if="paymentInfo" class="row q-gutter-md">
                      <!-- Статус -->
                      <div class="col-12 col-md-6">
                        <q-item>
                          <q-item-section avatar>
                            <q-icon
                              :name="getPaymentStatusIcon(paymentInfo.status)"
                              :color="getPaymentStatusColor(paymentInfo.status)"
                              size="24px"
                            />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('clients.status') }}</q-item-label>
                            <q-item-label caption>
                              <q-chip
                                :color="getPaymentStatusColor(paymentInfo.status)"
                                text-color="white"
                                size="sm"
                                :icon="getPaymentStatusIcon(paymentInfo.status)"
                              >
                                {{ $t(`clients.payment.status.${paymentInfo.status}`) }}
                              </q-chip>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <!-- Дні до блокування -->
                      <div v-if="paymentInfo.daysLeft !== null" class="col-12 col-md-6">
                        <q-item>
                          <q-item-section avatar>
                            <q-icon
                              name="schedule"
                              :color="getDaysLeftColor(paymentInfo.daysLeft)"
                              size="24px"
                            />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('clients.payment.daysLeft') }}</q-item-label>
                            <q-item-label caption>
                              <q-chip
                                :color="getDaysLeftColor(paymentInfo.daysLeft)"
                                text-color="white"
                                size="sm"
                              >
                                {{ paymentInfo.daysLeft }}
                                {{ $t('common.days') }}
                              </q-chip>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <!-- Дата створення акаунту -->
                      <div v-if="paymentInfo.created" class="col-12 col-md-6">
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="event" color="grey-6" size="24px" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('clients.payment.accountCreated') }}</q-item-label>
                            <q-item-label caption>{{
                              formatDate(paymentInfo.created)
                            }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <!-- План підписки -->
                      <div v-if="paymentInfo.plan" class="col-12 col-md-6">
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="card_membership" color="blue-6" size="24px" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('clients.payment.plan') }}</q-item-label>
                            <q-item-label caption>{{ paymentInfo.plan }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <!-- Батьківський акаунт -->
                      <div v-if="paymentInfo.parentAccountName" class="col-12">
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="account_tree" color="purple-6" size="24px" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('clients.payment.parentAccount') }}</q-item-label>
                            <q-item-label caption>{{ paymentInfo.parentAccountName }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Statistics -->
              <div class="col-12">
                <div class="text-h6 q-mb-sm">
                  {{ $t('portal.pages.profile.statisticsInfo') }}
                </div>
                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-card flat bordered>
                      <q-card-section class="text-center">
                        <q-icon name="directions_car" size="48px" color="primary" />
                        <div class="text-h5 text-weight-bold q-mt-sm">
                          {{ profile.objects_count || 0 }}
                        </div>
                        <div class="text-subtitle2 text-grey-7">
                          {{ $t('portal.myObjects') }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-card flat bordered>
                      <q-card-section class="text-center">
                        <q-icon name="folder" size="48px" color="orange" />
                        <div class="text-h5 text-weight-bold q-mt-sm">
                          {{ profile.documents_count || 0 }}
                        </div>
                        <div class="text-subtitle2 text-grey-7">
                          {{ $t('portal.myDocuments') }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Registration Date -->
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="row items-center">
                      <div class="col">
                        <q-item-label>{{ $t('common.registrationDate') }}</q-item-label>
                        <q-item-label caption>
                          {{ formatDate(profile.created_at) }}
                        </q-item-label>
                      </div>
                      <div class="col-auto">
                        <q-icon name="event" size="32px" color="accent" />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Error State -->
            <div v-else class="text-center q-py-md">
              <q-icon name="error" size="48px" color="negative" />
              <div class="q-mt-sm">{{ $t('portal.messages.error') }}</div>
              <q-btn
                color="primary"
                :label="$t('common.retry')"
                @click="loadProfile"
                class="q-mt-md"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PortalApi } from 'src/api/portal'
import { date } from 'quasar'

const profile = ref(null)
const loading = ref(false)
const paymentInfo = ref(null)
const loadingPayment = ref(false)

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

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
      hasWialonResourceId: false,
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
    expiring_soon: 'schedule',
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
  font-size: 0.9rem;
  color: var(--q-dark);
}
</style>
