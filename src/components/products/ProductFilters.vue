<template>
  <div class="row q-col-gutter-sm">
    <!-- Пошук -->
    <div class="col-12 col-sm-3">
      <q-input
        v-model="filters.search"
        :label="$t('common.search')"
        dense
        outlined
        clearable
        @update:model-value="emitFilters"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Фільтр по виробнику -->
    <div class="col-12 col-sm-3">
      <q-select
        v-model="filters.manufacturer"
        :options="manufacturerOptions"
        :label="$t('products.manufacturer')"
        dense
        outlined
        clearable
        emit-value
        map-options
        @update:model-value="emitFilters"
      />
    </div>

    <!-- Фільтр по статусу -->
    <div class="col-12 col-sm-3">
      <q-select
        v-model="filters.status"
        :options="statusOptions"
        :label="$t('products.status')"
        dense
        outlined
        clearable
        emit-value
        map-options
        @update:model-value="emitFilters"
      />
    </div>

    <!-- Фільтр власності -->
    <div class="col-12 col-sm-3">
      <q-select
        v-model="filters.isOwn"
        :options="ownOptions"
        :label="$t('products.ownership')"
        dense
        outlined
        clearable
        emit-value
        map-options
        @update:model-value="emitFilters"
      />
    </div>

    <!-- Дата покупки від -->
    <div class="col-12 col-sm-3">
      <q-input
        v-model="filters.dateFrom"
        :label="$t('products.filters.dateFrom')"
        dense
        outlined
        type="date"
        clearable
        @update:model-value="emitFilters"
      />
    </div>

    <!-- Дата покупки до -->
    <div class="col-12 col-sm-3">
      <q-input
        v-model="filters.dateTo"
        :label="$t('products.filters.dateTo')"
        dense
        outlined
        type="date"
        clearable
        @update:model-value="emitFilters"
      />
    </div>

    <!-- Кнопка скидання -->
    <div class="col-12 col-sm-3 flex items-center">
      <q-btn :label="$t('common.reset')" color="primary" flat @click="resetFilters" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['update:filters'])

// Опції для селектів
const statusOptions = [
  { label: t('products.statuses.in_stock'), value: 'in_stock' },
  { label: t('products.statuses.installed'), value: 'installed' },
  { label: t('products.statuses.in_repair'), value: 'in_repair' },
  { label: t('products.statuses.written_off'), value: 'written_off' },
]

const ownOptions = [
  { label: t('products.own'), value: true },
  { label: t('products.notOwn'), value: false },
]

// Початкові значення фільтрів
const defaultFilters = {
  search: '',
  manufacturer: null,
  status: null,
  isOwn: null,
  dateFrom: null,
  dateTo: null,
}

const filters = ref({ ...defaultFilters })
const manufacturerOptions = ref([])

// Метод для емітування змін фільтрів
const emitFilters = () => {
  emit('update:filters', filters.value)
}

// Метод для скидання фільтрів
const resetFilters = () => {
  filters.value = { ...defaultFilters }
  emitFilters()
}

// Експортуємо для використання в батьківському компоненті
defineExpose({
  resetFilters,
})
</script>
