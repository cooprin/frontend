<template>
  <div class="row q-col-gutter-sm q-mb-md">
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
        :label="$t('products.filters.manufacturer')"
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
        :label="$t('products.filters.status')"
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
        :label="$t('products.filters.ownership')"
        dense
        outlined
        clearable
        emit-value
        map-options
        @update:model-value="emitFilters"
      />
    </div>

    <!-- Дата від -->
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

    <!-- Дата до -->
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['update:filters'])
const { t } = useI18n()

// Опції для селектів
const statusOptions = computed(() => [
  { label: t('products.statuses.in_stock'), value: 'in_stock' },
  { label: t('products.statuses.installed'), value: 'installed' },
  { label: t('products.statuses.in_repair'), value: 'in_repair' },
  { label: t('products.statuses.written_off'), value: 'written_off' },
])

const ownOptions = computed(() => [
  { label: t('products.own'), value: true },
  { label: t('products.notOwn'), value: false },
])

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

// Методи
const emitFilters = () => {
  emit('update:filters', { ...filters.value })
}

const resetFilters = () => {
  Object.assign(filters.value, defaultFilters)
  emitFilters()
}

// Expose для батьківського компонента
defineExpose({
  resetFilters,
})
</script>
