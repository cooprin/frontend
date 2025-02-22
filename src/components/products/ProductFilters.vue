<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="text-h6">{{ $t('products.filters.title') }}</div>
        <q-space />
        <q-btn
          :icon="showFilters ? 'expand_less' : 'expand_more'"
          :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
          flat
          color="primary"
          @click="showFilters = !showFilters"
        />
      </div>
    </q-card-section>

    <q-card-section>
      <q-slide-transition>
        <div v-show="showFilters">
          <div class="row q-col-gutter-sm q-mb-md">
            <!-- Пошук -->
            <div class="col-12 col-sm-4">
              <q-input
                :value="filters.search"
                @update:model-value="(val) => updateFilters('search', val)"
                :label="$t('products.filters.search')"
                outlined
                dense
                clearable
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- Виробник -->
            <div class="col-12 col-sm-4">
              <q-select
                :value="filters.manufacturer"
                @update:model-value="(val) => updateFilters('manufacturer', val)"
                :options="manufacturerOptions"
                :label="$t('products.manufacturer')"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>

            <!-- Статус -->
            <div class="col-12 col-sm-4">
              <q-select
                :value="filters.status"
                @update:model-value="(val) => updateFilters('status', val)"
                :options="[
                  { label: $t('products.statuses.in_stock'), value: 'in_stock' },
                  { label: $t('products.statuses.installed'), value: 'installed' },
                  { label: $t('products.statuses.in_repair'), value: 'in_repair' },
                  { label: $t('products.statuses.written_off'), value: 'written_off' },
                ]"
                :label="$t('products.status')"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>

            <!-- Власність -->
            <div class="col-12 col-sm-4">
              <q-select
                :value="filters.isOwn"
                @update:model-value="(val) => updateFilters('isOwn', val)"
                :options="[
                  { label: $t('products.all'), value: null },
                  { label: $t('products.own'), value: true },
                  { label: $t('products.notOwn'), value: false },
                ]"
                :label="$t('products.ownership')"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <!-- Кнопки -->
            <div class="col-12 q-gutter-x-sm">
              <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
              <q-btn
                color="secondary"
                :label="$t('common.export')"
                @click="$emit('export')"
                :loading="exporting"
              />
            </div>
          </div>
        </div>
      </q-slide-transition>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { debounce } from 'lodash'
import { ref } from 'vue'

const showFilters = ref(false)

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  manufacturerOptions: {
    type: Array,
    required: true,
  },
  exporting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:filters', 'export'])

const updateFilters = debounce((key, value) => {
  emit('update:filters', {
    ...props.filters,
    [key]: value,
  })
}, 300)

const clearFilters = () => {
  emit('update:filters', {
    search: '',
    manufacturer: null,
    status: null,
    isOwn: null,
  })
}
</script>
