<template>
  <ul
    :list="list"
    class="ant-list-items ant-list-bordered"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <li
      class="ant-list-item"
      :class="{
        active: item.id === selectedId,
        ghost: dragData.currentDragging === item.id,
      }"
      v-for="(item, index) in list"
      :key="item.id"
      @click="handleClick(item.id)"
      @dragstart="onDragStart($event, item.id, index)"
      @dragenter="onDragEnter($event, index)"
      :data-index="index"
      draggable="true"
    >
      <a-tooltip :title="item.isHidden ? '显示' : '隐藏'">
        <a-button
          shape="circle"
          @click.stop="handleChange(item.id, 'isHidden', !item.isHidden)"
        >
          <template v-slot:icon v-if="item.isHidden"><EyeOutlined /> </template>
          <template v-slot:icon v-else><EyeInvisibleOutlined /> </template>
        </a-button>
      </a-tooltip>
      <a-tooltip :title="item.isLocked ? '解锁' : '锁定'">
        <a-button
          shape="circle"
          @click.stop="handleChange(item.id, 'isLocked', !item.isLocked)"
        >
          <template v-slot:icon v-if="item.isLocked"
            ><UnlockOutlined />
          </template>
          <template v-slot:icon v-else><LockOutlined /> </template>
        </a-button>
      </a-tooltip>
      <inline-edit
        :value="(item.layerName as string)"
        @change="
          (value) => {
            handleChange(item.id, 'layerName', value)
          }
        "
      ></inline-edit>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { PropType, reactive } from "vue"
import arrayMove from "array-move"
// import {
//   EyeOutlined,
//   EyeInvisibleOutlined,
//   LockOutlined,
//   UnlockOutlined,
// } from "@ant-design/icons-vue"
import { EyeOutlined, UnlockOutlined } from "@ant-design/icons-vue"
import { ComponentData } from "../store/editor"
import InlineEdit from "../components/InlineEdit.vue"
// import { getParentElement } from "../helper"

const props = defineProps({
  list: {
    type: Array as PropType<ComponentData[]>,
    required: true,
  },
  selectedId: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(["select", "change", "drop"])

const dragData = reactive({
  currentDragging: "",
  currentIndex: -1,
})
let start = -1
let end = -1
const handleClick = (id: string) => {
  emits("select", id)
}
const onDragStart = (e: DragEvent, id: string, index: number) => {
  dragData.currentDragging = id
  dragData.currentIndex = index
  start = index
}
const onDragEnter = (e: DragEvent, index: number) => {
  if (index !== dragData.currentIndex) {
    console.log("enter", index, dragData.currentIndex)
    ;(arrayMove as any).mutate(props.list, dragData.currentIndex, index)
    dragData.currentIndex = index
    end = index
  }
}
const onDrop = () => {
  emits("drop", { start, end })
  dragData.currentDragging = ""
}
const onDragOver = (e: DragEvent) => {
  e.preventDefault()
}
const handleChange = (id: string, key: string, value: boolean) => {
  const data = {
    id,
    key,
    value,
    isRoot: true,
  }
  emits("change", data)
}
</script>

<style scoped>
.ant-list-item {
  padding: 10px 15px;
  transition: all 0.5s ease-out;
  cursor: pointer;
  justify-content: normal;
  border: 1px solid #fff;
  border-bottom-color: #f0f0f0;
}
.ant-list-item.active {
  border: 1px solid #3b01c4;
}
.ant-list-item.ghost {
  opacity: 0.5;
}

.ant-list-item:hover {
  background: #e6f7ff;
}
.ant-list-item > * {
  margin-right: 10px;
}
.ant-list-item button {
  font-size: 12px;
}
</style>
