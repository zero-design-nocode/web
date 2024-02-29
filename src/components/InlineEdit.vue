<template>
  <div class="inline-edit" @click.stop="handleClick" ref="wrapper">
    <a-input
      v-model:value="innerValue"
      v-if="isEditing"
      :class="{ 'input-error': !validateCheck }"
      placeholder="文本不能为空"
    />
    <slot v-else></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue"
import useHotKey from "../hooks/useHotKey"
import useClickOutside from "../hooks/useClickOutside"

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(["change", "clicked"])

const innerValue = ref(props.value)
const error = ref(false)
const wrapper = ref<null | HTMLElement>(null)
const isEditing = ref(false)
const isOutside = useClickOutside(wrapper)
watch(
  () => props.value,
  () => {
    innerValue.value = props.value
  }
)
const handleClick = () => {
  setTimeout(() => {
    isEditing.value = true
    emits("clicked")
  }, 100)
}
const validateCheck = computed(() => {
  return innerValue.value.trim() !== ""
})
watch(
  () => isOutside.value,
  (newValue) => {
    if (!validateCheck.value) {
      return
    }
    if (newValue && isEditing.value) {
      isEditing.value = false
      emits("change", innerValue)
      error.value = false
    }
    isOutside.value = false
  }
)
useHotKey("enter, return", () => {
  if (!validateCheck.value) {
    return
  }
  if (isEditing.value) {
    isEditing.value = false
    emits("change", innerValue)
  }
})
useHotKey("esc", () => {
  if (isEditing.value) {
    isEditing.value = false
    innerValue.value = props.value
  }
})
</script>

<style>
.inline-edit {
  cursor: pointer;
}
.input-error {
  border: 1px solid #f5222d;
}
.input-error:focus {
  border-color: #f5222d;
}
.input-error::placeholder {
  color: #f5222d;
}
</style>
