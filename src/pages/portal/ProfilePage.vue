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
              <div class="col-12">
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
              <div class="col-12">
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

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const loadProfile = async () => {
  try {
    loading.value = true
    const response = await PortalApi.getProfile()

    if (response.data.success) {
      profile.value = response.data.client
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
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
