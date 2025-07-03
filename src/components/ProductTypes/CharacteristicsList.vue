<template>
  <div class="characteristics-list">
    <vue-draggable
      v-model="localCharacteristics"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      @change="onDragChange"
    >
      <template #item="{ element: char }">
        <q-card class="q-mb-md characteristic-item">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-icon name="drag_indicator" size="sm" class="drag-handle cursor-move q-mr-sm" />
                <div>
                  <div class="text-h6">{{ char.name }}</div>
                  <div class="text-caption">{{ char.code }}</div>
                </div>
              </div>
              <div class="row q-gutter-sm">
                <q-btn color="warning" icon="edit" flat round dense @click="$emit('edit', char)">
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="!char.usage_count"
                  color="negative"
                  icon="delete"
                  flat
                  round
                  dense
                  @click="$emit('delete', char)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="row q-gutter-x-sm q-mt-sm">
              <q-chip :color="getCharacteristicColor(char.type)" text-color="white" square>
                {{ $t(`productTypes.characteristicTypes.${char.type}`) }}
              </q-chip>
              <q-chip v-if="char.is_required" color="negative" text-color="white" square>
                {{ $t('productTypes.required') }}
              </q-chip>
            </div>

            <div v-if="char.type === 'select' && char.options?.length" class="q-mt-sm">
              <div class="text-caption">{{ $t('productTypes.options') }}</div>
              <div class="row q-gutter-x-sm q-mt-xs">
                <q-chip v-for="option in char.options" :key="option" dense outline>
                  {{ option }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>
    </vue-draggable>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueDraggable from 'vuedraggable'
import { CHARACTERISTIC_COLORS } from 'src/constants/productTypes'

const props = defineProps({
  characteristics: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update', 'edit', 'delete'])

const localCharacteristics = computed({
  get: () => props.characteristics,
  set: (value) => emit('update', value),
})

const getCharacteristicColor = (type) => {
  return CHARACTERISTIC_COLORS[type] || 'grey'
}

const onDragChange = ({ moved }) => {
  if (moved) {
    const newCharacteristics = localCharacteristics.value.map((char, index) => ({
      ...char,
      ordering: index,
    }))
    emit('update', newCharacteristics)
  }
}
</script>
