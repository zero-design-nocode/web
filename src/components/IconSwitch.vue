<template>
  <div class="icon-template" @click.prevent="handleClick">
    <a-tooltip>
      <template v-slot:title>
        {{ tip }}
      </template>
      <a-button :type="checked ? 'primary' : 'default'" shape="circle">
        <template v-slot:icon>
          <component :is="stringToComponent(props.iconName)"
        /></template>
      </a-button>
    </a-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { stringToComponent } from "@/plugins/stringToComponent"

const props = defineProps({
  iconName: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  tip: {
    type: String,
  },
})

const emits = defineEmits(["change"])

const handleClick = () => {
  emits("change", !props.checked)
}
</script>

<style></style>
