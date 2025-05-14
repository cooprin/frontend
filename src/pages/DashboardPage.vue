<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-space />
      <q-select
        v-model="selectedDashboard"
        :options="dashboardOptions"
        dense
        outlined
        class="dashboard-selector"
        style="width: 250px"
      />
    </div>

    <!-- Заголовок дашборду -->
    <div class="text-h6 q-mb-md">{{ selectedDashboard.label }}</div>

    <!-- Dashboard System -->
    <div>
      <!-- Дашборд для заборгованих оплат -->
      <div v-if="selectedDashboard.value === 'overdue'">
        <div class="row q-col-gutter-md">
          <!-- Карточка загальної заборгованості -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-negative text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.totalOverdue') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-negative" v-if="!loadingOverdueData">
                  {{ formatCurrency(overdueMetrics.totalAmount) }}
                </div>
                <q-spinner v-else color="negative" size="2em" />
              </q-card-section>
              <!-- Додаємо розшифровку загальної заборгованості -->
              <q-card-section
                v-if="
                  !loadingOverdueData &&
                  (overdueMetrics.objectsOverdueAmount > 0 ||
                    overdueMetrics.fixedServicesOverdueAmount > 0)
                "
                class="q-pt-none text-caption"
              >
                <div class="row">
                  <div class="col-6 text-left">{{ $t('dashboard.metrics.objectsOverdue') }}:</div>
                  <div class="col-6 text-right">
                    {{ formatCurrency(overdueMetrics.objectsOverdueAmount) }}
                  </div>
                </div>
                <div class="row">
                  <div class="col-6 text-left">
                    {{ $t('dashboard.metrics.fixedServicesOverdue') }}:
                  </div>
                  <div class="col-6 text-right">
                    {{ formatCurrency(overdueMetrics.fixedServicesOverdueAmount) }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Карточка кількості клієнтів з заборгованістю -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-warning text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.clientsOverdue') }}</div>
                <div class="text-caption">{{ $t('dashboard.metrics.allPeriods') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-warning" v-if="!loadingOverdueData">
                  {{ overdueMetrics.clientsCount }}
                </div>
                <q-spinner v-else color="warning" size="2em" />
              </q-card-section>
              <!-- Додаємо розшифровку по типам послуг -->
              <q-card-section
                v-if="
                  !loadingOverdueData &&
                  (overdueMetrics.objectClientsCount > 0 || overdueMetrics.fixedClientsCount > 0)
                "
                class="q-pt-none text-caption"
              >
                <div class="row">
                  <div class="col-8 text-left">
                    {{ $t('dashboard.metrics.objectsClientsCount') }}:
                  </div>
                  <div class="col-4 text-right">{{ overdueMetrics.objectClientsCount }}</div>
                </div>
                <div class="row">
                  <div class="col-8 text-left">
                    {{ $t('dashboard.metrics.fixedClientsCount') }}:
                  </div>
                  <div class="col-4 text-right">{{ overdueMetrics.fixedClientsCount }}</div>
                </div>
                <div class="text-italic text-grey-8 q-mt-xs">
                  {{ $t('dashboard.metrics.clientsOverlapNote') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Карточка кількості об'єктів з заборгованістю - без змін -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-info text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.objectsOverdue') }}</div>
                <div class="text-caption">{{ $t('dashboard.metrics.allPeriods') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-info" v-if="!loadingOverdueData">
                  {{ overdueMetrics.objectsCount }}
                </div>
                <q-spinner v-else color="info" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Карточка відсотка оплачених періодів - без змін -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-primary text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.periodsPaid') }}</div>
                <div class="text-caption">{{ $t('dashboard.metrics.thisYear') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-primary" v-if="!loadingOverdueData">
                  {{ overdueMetrics.paymentRate }}%
                </div>
                <q-spinner v-else color="primary" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Діаграма розподілу заборгованості за типами послуг - НОВА -->
          <div class="col-12 col-md-6">
            <q-card
              class="dashboard-card"
              v-if="!loadingOverdueData && overdueMetrics.totalAmount > 0"
            >
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.overdueDistribution') }}</div>
              </q-card-section>
              <q-card-section>
                <div style="height: 300px; position: relative">
                  <pie-chart
                    :chart-data="{
                      labels: [
                        $t('dashboard.metrics.objectsOverdue'),
                        $t('dashboard.metrics.fixedServicesOverdue'),
                      ],
                      datasets: [
                        {
                          data: [
                            overdueMetrics.objectsOverdueAmount,
                            overdueMetrics.fixedServicesOverdueAmount,
                          ],
                          backgroundColor: ['#3498db', '#e74c3c'],
                          borderWidth: 0,
                        },
                      ],
                    }"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Список клієнтів з заборгованістю - ОНОВЛЕНО -->
          <div class="col-12 col-md-6">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.clientsWithOverduePayments') }}</div>
                <q-space />
                <q-btn
                  icon="refresh"
                  flat
                  round
                  dense
                  :loading="loadingOverdueData"
                  @click="loadOverdueData"
                />
              </q-card-section>
              <q-card-section>
                <q-list separator>
                  <q-item
                    v-for="client in overdueClients"
                    :key="client.id"
                    clickable
                    @click="openClient(client.id)"
                  >
                    <q-item-section>
                      <q-item-label>{{ client.name }}</q-item-label>
                      <q-item-label caption>
                        <template v-if="client.objectsCount > 0">
                          {{ $t('dashboard.overdueObjects') }}: {{ client.objectsCount }}
                        </template>
                        <template v-if="client.invoicesCount > 0">
                          <template v-if="client.objectsCount > 0"> | </template>
                          {{ $t('dashboard.overdueInvoices') }}: {{ client.invoicesCount }}
                        </template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-negative text-weight-bold">
                        {{ formatCurrency(client.totalOverdue) }}
                      </q-item-label>
                      <q-item-label
                        caption
                        v-if="client.objectsOverdue > 0 && client.fixedOverdue > 0"
                      >
                        {{ formatCurrency(client.objectsOverdue) }} +
                        {{ formatCurrency(client.fixedOverdue) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="overdueClients.length === 0 && !loadingOverdueData">
                    <q-item-section class="text-center text-grey">
                      {{ $t('dashboard.noOverdueClients') }}
                    </q-item-section>
                  </q-item>
                  <q-item v-if="loadingOverdueData">
                    <q-item-section class="text-center">
                      <q-spinner color="primary" size="2em" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Об'єкти та послуги з простроченими оплатами - ОНОВЛЕНО -->
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.itemsWithOverduePayments') }}</div>
                <q-space />
                <q-btn-toggle
                  v-model="overdueItemsFilter"
                  :options="[
                    { label: $t('dashboard.allItems'), value: 'all' },
                    { label: $t('dashboard.onlyObjects'), value: 'object' },
                    { label: $t('dashboard.onlyFixedServices'), value: 'fixed' },
                  ]"
                  spread
                  dense
                  unelevated
                  class="q-ml-md"
                />
              </q-card-section>
              <q-card-section>
                <q-table
                  :rows="filteredOverdueItems"
                  :columns="overdueObjectsColumns"
                  row-key="id"
                  dense
                  :pagination="{ rowsPerPage: 10 }"
                  :loading="loadingOverdueData"
                >
                  <template v-slot:body-cell-client_name="props">
                    <q-td :props="props">
                      <q-item clickable dense @click="openClient(props.row.client_id)">
                        <q-item-section>{{ props.row.client_name }}</q-item-section>
                      </q-item>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-name="props">
                    <q-td :props="props">
                      <div class="row items-center">
                        <q-icon
                          :name="props.row.item_type === 'object' ? 'directions_car' : 'receipt'"
                          :color="props.row.item_type === 'object' ? 'blue' : 'red'"
                          size="xs"
                          class="q-mr-xs"
                        />
                        {{ props.row.name }}
                      </div>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-billing_period="props">
                    <q-td :props="props">
                      {{ t(`payments.months.${props.row.billing_month}`) }}
                      {{ props.row.billing_year }}
                    </q-td>
                  </template>
                  <template v-slot:body-cell-amount="props">
                    <q-td :props="props" class="text-right">
                      {{ formatCurrency(props.row.amount) }}
                    </q-td>
                  </template>
                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props" class="text-center">
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="visibility"
                        @click="openItem(props.row)"
                      >
                        <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Графік заборгованості по місяцях - ОНОВЛЕНО для відображення розбивки за типами послуг -->
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.overdueByMonth') }}</div>
              </q-card-section>
              <q-card-section>
                <div
                  style="height: 400px; position: relative"
                  v-if="!loadingOverdueData && overdueByMonthData.length > 0"
                >
                  <overdue-chart :data="overdueByMonthData" :show-split="true" />
                </div>
                <div v-else-if="loadingOverdueData" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="3em" />
                </div>
                <div v-else class="text-center text-grey q-pa-lg">
                  {{ $t('dashboard.noDataForChart') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
      <!-- Дашборд для залишків товарів -->
      <div v-if="selectedDashboard.value === 'inventory'">
        <div class="row q-col-gutter-md q-mb-md">
          <!-- Фільтри -->
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section>
                <div class="row items-center q-col-gutter-md">
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-select
                      v-model="inventoryFilters.warehouse"
                      :options="warehouseOptions"
                      label="Склад"
                      dense
                      outlined
                      clearable
                      emit-value
                      map-options
                      @update:model-value="loadInventoryData"
                    />
                  </div>
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-select
                      v-model="inventoryFilters.productType"
                      :options="productTypeOptions"
                      label="Тип товару"
                      dense
                      outlined
                      clearable
                      emit-value
                      map-options
                      @update:model-value="loadInventoryData"
                    />
                  </div>
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-select
                      v-model="inventoryFilters.manufacturer"
                      :options="manufacturerOptions"
                      label="Виробник"
                      dense
                      outlined
                      clearable
                      emit-value
                      map-options
                      @update:model-value="loadInventoryData"
                    />
                  </div>
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-input
                      v-model="inventoryFilters.search"
                      label="Пошук"
                      dense
                      outlined
                      clearable
                      @update:model-value="loadInventoryData"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Повідомлення про необхідність дій -->
          <div class="col-12" v-if="inventoryMetrics.lowStockCount > 0">
            <q-banner class="bg-orange-1 text-dark" rounded>
              <template v-slot:avatar>
                <q-icon name="warning" color="warning" />
              </template>
              <div class="text-body1">
                У вас {{ inventoryMetrics.lowStockCount }}
                {{ getNounCase(inventoryMetrics.lowStockCount, 'товар', 'товари', 'товарів') }} з
                критично низьким рівнем запасу!
                <q-btn
                  color="warning"
                  label="Створити заявку на закупівлю"
                  flat
                  dense
                  class="q-ml-sm"
                  @click="createPurchaseOrder"
                />
              </div>
            </q-banner>
          </div>

          <!-- Метрики -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-green-8 text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.totalItems') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div v-if="!loadingInventoryData" class="row items-center justify-center">
                  <div class="text-h4 text-green-8">{{ inventoryMetrics.totalItems }}</div>
                  <q-badge color="green" class="q-ml-sm" v-if="inventoryMetrics.totalItemsTrend">
                    <q-icon
                      :name="
                        inventoryMetrics.totalItemsTrend > 0 ? 'arrow_upward' : 'arrow_downward'
                      "
                      size="xs"
                    />
                    {{ Math.abs(inventoryMetrics.totalItemsTrend) }}%
                  </q-badge>
                </div>
                <q-spinner v-else color="green-8" size="2em" />
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-linear-progress
                  :value="inventoryMetrics.totalItemsUtilization || 0"
                  color="green-8"
                />
                <div class="row justify-between q-mt-xs">
                  <div class="text-caption">Використання складу</div>
                  <div class="text-caption">
                    {{ Math.round((inventoryMetrics.totalItemsUtilization || 0) * 100) }}%
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-info text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.totalProducts') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div v-if="!loadingInventoryData" class="row items-center justify-center">
                  <div class="text-h4 text-info">{{ inventoryMetrics.totalProducts }}</div>
                  <q-badge color="info" class="q-ml-sm" v-if="inventoryMetrics.totalProductsTrend">
                    <q-icon
                      :name="
                        inventoryMetrics.totalProductsTrend > 0 ? 'arrow_upward' : 'arrow_downward'
                      "
                      size="xs"
                    />
                    {{ Math.abs(inventoryMetrics.totalProductsTrend) }}%
                  </q-badge>
                </div>
                <q-spinner v-else color="info" size="2em" />
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-xs">
                  <div
                    v-for="(count, status) in inventoryMetrics.statusCounts"
                    :key="status"
                    class="col-4"
                  >
                    <div class="text-caption text-center">{{ getStatusLabel(status) }}</div>
                    <div class="text-subtitle2 text-center">{{ count }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-negative text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.lowStockItems') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div v-if="!loadingInventoryData" class="row items-center justify-center">
                  <div class="text-h4 text-negative">{{ inventoryMetrics.lowStockCount }}</div>
                  <q-badge color="negative" class="q-ml-sm" v-if="inventoryMetrics.lowStockTrend">
                    <q-icon
                      :name="inventoryMetrics.lowStockTrend > 0 ? 'arrow_upward' : 'arrow_downward'"
                      size="xs"
                    />
                    {{ Math.abs(inventoryMetrics.lowStockTrend) }}%
                  </q-badge>
                </div>
                <q-spinner v-else color="negative" size="2em" />
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-xs">
                  <div class="col-6">
                    <div class="text-caption text-center">Критичні типи</div>
                    <div class="text-subtitle2 text-center">
                      {{ inventoryMetrics.criticalTypeCount || 0 }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-center">Термінові закупівлі</div>
                    <div class="text-subtitle2 text-center">
                      {{ inventoryMetrics.urgentCount || 0 }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-warning text-white">
                <div class="text-subtitle2">Коефіцієнт оборотності</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div v-if="!loadingInventoryData" class="row items-center justify-center">
                  <div class="text-h4 text-warning">
                    {{ formatNumber(inventoryMetrics.turnoverRate || 0) }}
                  </div>
                  <q-badge
                    :color="inventoryMetrics.turnoverRateTrend > 0 ? 'positive' : 'negative'"
                    class="q-ml-sm"
                    v-if="inventoryMetrics.turnoverRateTrend"
                  >
                    <q-icon
                      :name="
                        inventoryMetrics.turnoverRateTrend > 0 ? 'arrow_upward' : 'arrow_downward'
                      "
                      size="xs"
                    />
                    {{ Math.abs(inventoryMetrics.turnoverRateTrend) }}%
                  </q-badge>
                </div>
                <q-spinner v-else color="warning" size="2em" />
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-xs">
                  <div class="col-6">
                    <div class="text-caption text-center">Днів у запасі</div>
                    <div class="text-subtitle2 text-center">
                      {{ inventoryMetrics.daysInStock || 0 }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-center">Неліквідні</div>
                    <div class="text-subtitle2 text-center">
                      {{ inventoryMetrics.nonLiquidCount || 0 }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Критичні залишки і графік по складах -->
          <div class="col-12 col-md-8">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.criticalStock') }}</div>
                <q-space />
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="refresh"
                  :loading="loadingInventoryData"
                  @click="loadInventoryData"
                />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-table
                  :rows="criticalStockItems"
                  :columns="criticalStockColumns"
                  row-key="id"
                  dense
                  :pagination="{ rowsPerPage: 5 }"
                  :loading="loadingInventoryData"
                  :style="criticalStockItems.length > 0 ? 'height: 300px' : ''"
                  class="critical-stock-table"
                  virtual-scroll
                >
                  <template v-slot:header="props">
                    <q-tr :props="props">
                      <q-th
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                        :class="col.classes"
                      >
                        {{ col.label }}
                      </q-th>
                      <q-th auto-width>Дії</q-th>
                    </q-tr>
                  </template>
                  <template v-slot:body="props">
                    <q-tr
                      :props="props"
                      :class="
                        props.row.quantity < 3
                          ? 'bg-red-1'
                          : props.row.quantity < 5
                            ? 'bg-orange-1'
                            : ''
                      "
                    >
                      <q-td v-for="col in props.cols" :key="col.name" :props="props">
                        <div
                          v-if="col.name === 'quantity'"
                          :class="getQuantityClass(props.row.quantity)"
                        >
                          {{ props.row.quantity }}
                        </div>
                        <div v-else>{{ col.value }}</div>
                      </q-td>
                      <q-td auto-width>
                        <div class="row q-gutter-xs">
                          <q-btn
                            flat
                            round
                            dense
                            color="info"
                            icon="visibility"
                            @click="openProduct(props.row.product_id)"
                          >
                            <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                          </q-btn>
                          <q-btn
                            flat
                            round
                            dense
                            color="positive"
                            icon="add_shopping_cart"
                            @click="addToOrder(props.row)"
                          >
                            <q-tooltip>Додати до закупівлі</q-tooltip>
                          </q-btn>
                        </div>
                      </q-td>
                    </q-tr>
                  </template>
                  <template v-slot:no-data>
                    <div class="full-width row flex-center q-pa-md">
                      <div class="text-grey-8">
                        {{
                          loadingInventoryData
                            ? 'Завантаження...'
                            : 'Немає товарів з критично малим залишком'
                        }}
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Графік по складах -->
          <div class="col-12 col-md-4">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.inventoryByWarehouse') }}</div>
              </q-card-section>
              <q-card-section>
                <div
                  style="height: 300px; position: relative"
                  v-if="!loadingInventoryData && stockByWarehouse.length > 0"
                >
                  <inventory-bar-chart :data="stockByWarehouse" />
                </div>
                <div v-else-if="loadingInventoryData" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="3em" />
                </div>
                <div v-else class="text-center text-grey q-pa-lg">
                  {{ $t('dashboard.noDataForChart') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Теплова карта типів товарів -->
          <div class="col-12 col-md-6">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">Теплова карта запасів за типами</div>
              </q-card-section>
              <q-card-section>
                <div
                  style="height: 300px; position: relative"
                  v-if="!loadingInventoryData && stockByType.length > 0"
                >
                  <inventory-heat-chart :data="stockByType" />
                </div>
                <div v-else-if="loadingInventoryData" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="3em" />
                </div>
                <div v-else class="text-center text-grey q-pa-lg">
                  {{ $t('dashboard.noDataForChart') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Графік за моделями -->
          <div class="col-12 col-md-6">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.inventoryByModel') }}</div>
              </q-card-section>
              <q-card-section>
                <div
                  style="height: 300px; position: relative"
                  v-if="!loadingInventoryData && stockByModel.length > 0"
                >
                  <inventory-model-chart :data="stockByModel" />
                </div>
                <div v-else-if="loadingInventoryData" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="3em" />
                </div>
                <div v-else class="text-center text-grey q-pa-lg">
                  {{ $t('dashboard.noDataForChart') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Неліквідні товари -->
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">Неліквідні товари (без руху > 30 днів)</div>
                <q-space />
                <q-btn
                  color="negative"
                  flat
                  dense
                  label="Пропозиції щодо списання"
                  icon="auto_delete"
                  @click="suggestWriteOff"
                />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-table
                  :rows="nonLiquidItems"
                  :columns="nonLiquidColumns"
                  row-key="id"
                  dense
                  :pagination="{ rowsPerPage: 5 }"
                  :loading="loadingNonLiquidData"
                  :style="nonLiquidItems.length > 0 ? 'height: 300px' : ''"
                  virtual-scroll
                >
                  <template v-slot:body-cell-days_without_movement="props">
                    <q-td :props="props">
                      <div
                        :class="
                          props.row.days_without_movement > 60 ? 'text-negative' : 'text-orange'
                        "
                      >
                        {{ props.row.days_without_movement }} днів
                      </div>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props" class="text-center">
                      <div class="row q-gutter-xs">
                        <q-btn
                          flat
                          round
                          dense
                          color="info"
                          icon="visibility"
                          @click="openProduct(props.row.product_id)"
                        >
                          <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          @click="writeOffProduct(props.row)"
                        >
                          <q-tooltip>Списати</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="swap_horiz"
                          @click="transferProduct(props.row)"
                        >
                          <q-tooltip>Перемістити</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </template>
                  <template v-slot:no-data>
                    <div class="full-width row flex-center q-pa-md">
                      <div class="text-positive">
                        Немає неліквідних товарів! Ваші запаси в хорошому стані.
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Тенденції та прогнози -->
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">Тенденції та прогнози</div>
                <q-space />
                <q-btn-group flat>
                  <q-btn
                    color="primary"
                    flat
                    label="30 днів"
                    @click="setForecastPeriod(30)"
                    :class="forecastPeriod === 30 ? 'bg-blue-1' : ''"
                  />
                  <q-btn
                    color="primary"
                    flat
                    label="90 днів"
                    @click="setForecastPeriod(90)"
                    :class="forecastPeriod === 90 ? 'bg-blue-1' : ''"
                  />
                  <q-btn
                    color="primary"
                    flat
                    label="180 днів"
                    @click="setForecastPeriod(180)"
                    :class="forecastPeriod === 180 ? 'bg-blue-1' : ''"
                  />
                </q-btn-group>
              </q-card-section>
              <q-card-section>
                <div
                  style="height: 300px; position: relative"
                  v-if="!loadingForecastData && forecastData.length > 0"
                >
                  <inventory-forecast-chart :data="forecastData" :period="forecastPeriod" />
                </div>
                <div v-else-if="loadingForecastData" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="3em" />
                </div>
                <div v-else class="text-center text-grey q-pa-lg">
                  Недостатньо даних для побудови прогнозу. Спробуйте пізніше або змініть фільтри.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Інші дашборди без змін -->
      <!-- Дашборд для нових клієнтів та активності -->
      <div v-if="selectedDashboard.value === 'activity'">
        <!-- Не змінюємо код цього дашборду -->
      </div>

      <!-- Дашборд фінансової статистики -->
      <div v-if="selectedDashboard.value === 'financial'">
        <!-- Не змінюємо код цього дашборду -->
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { PaymentsApi } from 'src/api/payments'
import OverdueChart from 'components/dashboard/OverdueChart.vue'
import PieChart from 'components/dashboard/PieChart.vue' // Додаємо новий компонент для кругової діаграми
import InventoryBarChart from 'components/dashboard/InventoryBarChart.vue'
import InventoryModelChart from 'components/dashboard/InventoryModelChart.vue'
import { StockApi } from 'src/api/stock'

const router = useRouter()
const $q = useQuasar()
const { t, locale } = useI18n()

// Для вибору дашборду - залишається без змін
const dashboardOptions = computed(() => [
  { label: t('dashboard.types.overduePayments'), value: 'overdue' },
  { label: t('dashboard.types.inventory'), value: 'inventory' },
  { label: t('dashboard.types.activity'), value: 'activity' },
  { label: t('dashboard.types.financial'), value: 'financial' },
])
const selectedDashboard = ref({ value: 'overdue' })

// Для даних по залишках
const loadingInventoryData = ref(false)
const inventoryMetrics = ref({
  totalItems: 0,
  totalProducts: 0,
  lowStockCount: 0,
  mediumStockCount: 0,
  warehousesCount: 0,
})
const stockByWarehouse = ref([])
const stockByType = ref([])
const stockByModel = ref([])
const criticalStockItems = ref([])

// Метод для форматування чисел
const formatNumber = (number) => {
  return Number(number).toFixed(2)
}

// Метод для визначення класу кількості
const getQuantityClass = (quantity) => {
  if (quantity < 3) return 'text-negative text-weight-bold'
  if (quantity < 5) return 'text-orange text-weight-bold'
  if (quantity <= 10) return 'text-warning'
  return 'text-positive'
}

// Метод для отримання назви статусу
const getStatusLabel = (status) => {
  const statusMap = {
    in_stock: 'На складі',
    installed: 'Встановлено',
    in_repair: 'В ремонті',
    written_off: 'Списано',
  }
  return statusMap[status] || status
}

// Метод для відміни слів залежно від числа
const getNounCase = (number, one, few, many) => {
  const lastDigit = number % 10
  const lastTwoDigits = number % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return one
  }

  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return few
  }

  return many
}

// Додаткові методи для дій
const createPurchaseOrder = () => {
  // Реалізація створення заявки на закупівлю
  $q.dialog({
    title: 'Створення заявки на закупівлю',
    message: 'Створити заявку на закупівлю критичних товарів?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Логіка створення заявки
    $q.notify({
      color: 'positive',
      message: 'Заявка на закупівлю критичних товарів створена',
      icon: 'check',
    })
  })
}

const addToOrder = (product) => {
  // Реалізація додавання товару до закупівлі
  $q.notify({
    color: 'positive',
    message: `Товар ${product.sku} додано до закупівлі`,
    icon: 'check',
  })
}

const writeOffProduct = (product) => {
  // Реалізація списання товару
  $q.dialog({
    title: 'Списання товару',
    message: `Ви впевнені, що хочете списати товар ${product.sku}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Логіка списання
    $q.notify({
      color: 'positive',
      message: `Товар ${product.sku} відправлено на списання`,
      icon: 'check',
    })
  })
}

const transferProduct = (product) => {
  // Реалізація переміщення товару
  $q.dialog({
    title: 'Переміщення товару',
    message: `Виберіть склад для переміщення товару ${product.sku}`,
    options: {
      type: 'radio',
      model: '',
      items: warehouseOptions.value,
    },
    cancel: true,
    persistent: true,
  }).onOk((targetWarehouse) => {
    // Логіка переміщення
    $q.notify({
      color: 'positive',
      message: `Створено заявку на переміщення товару ${product.sku} на склад ${targetWarehouse.label}`,
      icon: 'check',
    })
  })
}

const suggestWriteOff = () => {
  // Реалізація пропозицій щодо списання
  $q.dialog({
    title: 'Пропозиції щодо списання',
    message: 'Запустити аналіз для пошуку товарів, рекомендованих до списання?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Логіка аналізу
    $q.notify({
      color: 'positive',
      message: 'Аналіз запущено. Результати будуть доступні через кілька хвилин.',
      icon: 'check',
    })
  })
}

const setForecastPeriod = (period) => {
  forecastPeriod.value = period
  loadForecastData()
}

// Додаткові змінні стану
const inventoryFilters = ref({
  warehouse: null,
  productType: null,
  manufacturer: null,
  search: '',
})

const warehouseOptions = ref([])
const productTypeOptions = ref([])
const manufacturerOptions = ref([])
const nonLiquidItems = ref([])
const loadingNonLiquidData = ref(false)
const forecastPeriod = ref(90)
const forecastData = ref([])
const loadingForecastData = ref(false)

// Колонки для неліквідних товарів
const nonLiquidColumns = computed(() => [
  {
    name: 'sku',
    align: 'left',
    label: 'SKU',
    field: 'sku',
    sortable: true,
  },
  {
    name: 'model_name',
    align: 'left',
    label: t('products.model'),
    field: 'model_name',
    sortable: true,
  },
  {
    name: 'warehouse_name',
    align: 'left',
    label: t('warehouses.warehouse'),
    field: 'warehouse_name',
    sortable: true,
  },
  {
    name: 'quantity',
    align: 'center',
    label: t('warehouses.quantity'),
    field: 'quantity',
    sortable: true,
  },
  {
    name: 'days_without_movement',
    align: 'center',
    label: 'Без руху',
    field: 'days_without_movement',
    sortable: true,
  },
])

// Розширення функції завантаження даних про залишки
const loadInventoryData = async () => {
  loadingInventoryData.value = true

  try {
    // API запит для отримання метрик залишків з розширеними даними
    const metricsResponse = await StockApi.getStockMetrics(inventoryFilters.value)
    console.log('Отримані метрики залишків:', metricsResponse.data)
    inventoryMetrics.value = {
      ...metricsResponse.data.metrics,
      // Додаткові обчислювані поля
      totalItemsUtilization: metricsResponse.data.metrics.totalItems / 1000, // Припускаємо максимальну місткість 1000
      statusCounts: metricsResponse.data.statusCounts || {},
      totalItemsTrend: metricsResponse.data.metrics.totalItemsTrend || 0,
      totalProductsTrend: metricsResponse.data.metrics.totalProductsTrend || 0,
      lowStockTrend: metricsResponse.data.metrics.lowStockTrend || 0,
      turnoverRate: metricsResponse.data.metrics.turnoverRate || 0,
      turnoverRateTrend: metricsResponse.data.metrics.turnoverRateTrend || 0,
      daysInStock: metricsResponse.data.metrics.daysInStock || 0,
      nonLiquidCount: metricsResponse.data.metrics.nonLiquidCount || 0,
      criticalTypeCount: metricsResponse.data.metrics.criticalTypeCount || 0,
      urgentCount: metricsResponse.data.metrics.urgentCount || 0,
    }

    // Отримання опцій для фільтрів
    if (!warehouseOptions.value.length) {
      const warehousesResponse = await StockApi.getWarehousesOptions()
      warehouseOptions.value = warehousesResponse.data.warehouses.map((w) => ({
        label: w.name,
        value: w.id,
      }))
    }

    if (!productTypeOptions.value.length) {
      const typesResponse = await StockApi.getProductTypesOptions()
      productTypeOptions.value = typesResponse.data.types.map((t) => ({
        label: t.name,
        value: t.id,
      }))
    }

    if (!manufacturerOptions.value.length) {
      const manufacturersResponse = await StockApi.getManufacturersOptions()
      manufacturerOptions.value = manufacturersResponse.data.manufacturers.map((m) => ({
        label: m.name,
        value: m.id,
      }))
    }

    // API запит для отримання даних по складах
    const warehouseResponse = await StockApi.getStockByWarehouse(inventoryFilters.value)
    console.log('Отримані дані по складах:', warehouseResponse.data)
    stockByWarehouse.value = warehouseResponse.data.warehouses || []

    // API запит для отримання даних по типах
    const typeResponse = await StockApi.getStockByType(inventoryFilters.value)
    console.log('Отримані дані по типах:', typeResponse.data)
    stockByType.value = typeResponse.data.types || []

    // API запит для отримання даних по моделях
    const modelResponse = await StockApi.getStockByModel(inventoryFilters.value)
    console.log('Отримані дані по моделях:', modelResponse.data)
    stockByModel.value = modelResponse.data.models || []

    // API запит для отримання критичних залишків
    const criticalResponse = await StockApi.getCriticalStock(inventoryFilters.value)
    console.log('Отримані дані по критичних залишках:', criticalResponse.data)
    criticalStockItems.value = criticalResponse.data.items || []

    // API запит для отримання неліквідних товарів
    loadingNonLiquidData.value = true
    const nonLiquidResponse = await StockApi.getNonLiquidStock(inventoryFilters.value)
    console.log('Отримані дані по неліквідних товарах:', nonLiquidResponse.data)
    nonLiquidItems.value = nonLiquidResponse.data.items || []
    loadingNonLiquidData.value = false

    // Завантажуємо прогнози
    loadForecastData()
  } catch (error) {
    console.error('Error loading inventory data:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingInventoryData.value = false
  }
}
// Функція для завантаження даних прогнозу
const loadForecastData = async () => {
  loadingForecastData.value = true
  try {
    const forecastResponse = await StockApi.getStockForecast({
      ...inventoryFilters.value,
      period: forecastPeriod.value,
    })
    console.log('Отримані дані прогнозу:', forecastResponse.data)
    forecastData.value = forecastResponse.data.forecast || []
  } catch (error) {
    console.error('Error loading forecast data:', error)
  } finally {
    loadingForecastData.value = false
  }
}

// Оновлюємо повний об'єкт вибраного дашборду при зміні мови - без змін
watch(
  [locale, dashboardOptions],
  () => {
    const currentOption = dashboardOptions.value.find(
      (option) => option.value === selectedDashboard.value.value,
    )
    if (currentOption) {
      selectedDashboard.value = currentOption
    }
  },
  { immediate: true },
)

// Для даних по заборгованості - без змін
const loadingOverdueData = ref(false)

// Оновлюємо структуру для відображення розбивки заборгованості
const overdueMetrics = ref({
  totalAmount: 0,
  clientsCount: 0,
  objectsCount: 0,
  paymentRate: 0,
  objectsOverdueAmount: 0,
  fixedServicesOverdueAmount: 0,
  objectClientsCount: 0,
  fixedClientsCount: 0,
})
const overdueClients = ref([])
const overdueObjects = ref([])
const overdueByMonthData = ref([])

// Додаємо фільтр для таблиці об'єктів та послуг з простроченими оплатами
const overdueItemsFilter = ref('all')

// Фільтрований список об'єктів та послуг
const filteredOverdueItems = computed(() => {
  if (overdueItemsFilter.value === 'all') {
    return overdueObjects.value
  } else {
    return overdueObjects.value.filter((item) => item.item_type === overdueItemsFilter.value)
  }
})

// Колонки для таблиці - додаємо відображення типу позиції
const overdueObjectsColumns = computed(() => [
  {
    name: 'name',
    align: 'left',
    label: t('wialonObjects.name'),
    field: 'name',
    sortable: true,
  },
  {
    name: 'client_name',
    align: 'left',
    label: t('wialonObjects.client'),
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'billing_period',
    align: 'center',
    label: t('payments.period'),
    field: (row) => `${t(`payments.months.${row.billing_month}`)} ${row.billing_year}`,
    sortable: true,
  },
  {
    name: 'amount',
    align: 'right',
    label: t('payments.amount'),
    field: 'amount',
    sortable: true,
  },
  {
    name: 'item_type',
    align: 'center',
    label: t('dashboard.itemType'),
    field: 'item_type',
    sortable: true,
    format: (val) => t(`dashboard.itemTypes.${val}`),
  },
  {
    name: 'actions',
    align: 'center',
    label: t('common.actions'),
    field: 'actions',
    sortable: false,
  },
])

// Метод для завантаження даних заборгованості
const loadOverdueData = async () => {
  loadingOverdueData.value = true

  try {
    console.log('Завантаження даних заборгованості...')

    // API запит для отримання метрик заборгованості
    const metricsResponse = await PaymentsApi.getOverdueMetrics()
    console.log('Отримані метрики заборгованості:', metricsResponse.data)
    overdueMetrics.value = metricsResponse.data.metrics

    // API запит для отримання клієнтів з заборгованістю
    const clientsResponse = await PaymentsApi.getOverdueClients()
    console.log('Отримані клієнти з заборгованістю:', clientsResponse.data)
    overdueClients.value = clientsResponse.data.clients || []

    // API запит для отримання об'єктів з заборгованими оплатами
    const objectsResponse = await PaymentsApi.getOverdueObjects()
    console.log("Отримані об'єкти з заборгованістю:", objectsResponse.data)
    overdueObjects.value = objectsResponse.data.objects || []

    // API запит для отримання даних для графіка
    const chartResponse = await PaymentsApi.getOverdueByMonth()
    console.log('Отримані дані для графіка:', chartResponse.data)
    overdueByMonthData.value = chartResponse.data.monthlyData || []

    // Перевірка наявності даних для графіка
    if (overdueByMonthData.value && overdueByMonthData.value.length > 0) {
      console.log('Дані для графіка готові:', overdueByMonthData.value.length, 'записів')
    } else {
      console.warn('Немає даних для графіка!')
    }
  } catch (error) {
    console.error('Error loading overdue data:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingOverdueData.value = false
  }
}

// Спостерігаємо за зміною мови для оновлення заголовків
watch(locale, () => {
  console.log('Мова змінилася на:', locale.value)
})

// Форматування валюти
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

// Навігація до клієнта
const openClient = (clientId) => {
  router.push({ name: 'client-details', params: { id: clientId } })
}

// Навігація до об'єкта або відкриття деталей рахунку залежно від типу
const openItem = (item) => {
  if (item.item_type === 'object') {
    router.push({ name: 'wialon-object-details', params: { id: item.id } })
  } else if (item.item_type === 'fixed') {
    router.push({ name: 'invoice-details', params: { id: item.id } })
  }
}
// Колонки для таблиці критичних залишків
const criticalStockColumns = computed(() => [
  {
    name: 'sku',
    align: 'left',
    label: 'SKU',
    field: 'sku',
    sortable: true,
  },
  {
    name: 'model_name',
    align: 'left',
    label: t('products.model'),
    field: 'model_name',
    sortable: true,
  },
  {
    name: 'warehouse_name',
    align: 'left',
    label: t('warehouses.warehouse'),
    field: 'warehouse_name',
    sortable: true,
  },
  {
    name: 'quantity',
    align: 'center',
    label: t('warehouses.quantity'),
    field: 'quantity',
    sortable: true,
  },
  {
    name: 'actions',
    align: 'center',
    label: t('common.actions'),
    field: 'actions',
    sortable: false,
  },
])
// Навігація до товару
const openProduct = (productId) => {
  router.push({ name: 'product-details', params: { id: productId } })
}

// Завантаження даних при монтуванні компонента
onMounted(() => {
  if (selectedDashboard.value.value === 'inventory') {
    loadInventoryData()
  } else if (selectedDashboard.value.value === 'overdue') {
    loadOverdueData()
  }
})
// Спостерігаємо за зміною дашборду
watch(selectedDashboard, (newVal) => {
  if (newVal.value === 'inventory') {
    loadInventoryData()
  }
})
</script>

<style lang="scss" scoped>
.dashboard-card {
  height: 100%;
}

// Для карток з фіксованою висотою
.metric-card {
  min-height: 150px;
}
</style>
