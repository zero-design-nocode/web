<template>
  <textarea
    class="ant-input"
    rows="3"
    v-bind="$attrs"
    :value="props.value"
    @input="onInput"
    @compositionstart="onStart"
    @compositionend="onEnd"
    ref="areaRef"
  >
  </textarea>
</template>

<script lang="ts" setup>
import { ref } from "vue"

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(["change"])

const areaRef = ref<HTMLTextAreaElement | null>(null)
let triggerFlag = false
const onInput = (e: Event) => {
  if (triggerFlag) return
  emits("change", e)
}
const onStart = () => {
  triggerFlag = true
}
const onEnd = () => {
  triggerFlag = false
  if (areaRef.value) {
    areaRef.value.dispatchEvent(new Event("input"))
  }
}
</script>

<style></style>
