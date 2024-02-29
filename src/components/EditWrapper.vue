<template>
  <div
    class="edit-wrapper"
    @click="itemClick"
    @dblclick="itemEdit"
    ref="editWrapper"
    :class="{ active: active }"
    :style="positionStyleProps"
    :data-component-id="id"
  >
    <div class="move-wrapper" ref="moveWrapper" @mousedown="startMove">
      <slot></slot>
    </div>
    <div class="resizers">
      <div
        class="resizer top-left"
        @mousedown="startResize($event, 'top-left')"
      ></div>
      <div
        class="resizer top-right"
        @mousedown="startResize($event, 'top-right')"
      ></div>
      <div
        class="resizer bottom-left"
        @mousedown="startResize($event, 'bottom-left')"
      ></div>
      <div
        class="resizer bottom-right"
        @mousedown="startResize($event, 'bottom-right')"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, reactive, ref, computed, watch } from "vue"
import useStylePick from "../hooks/useStylePick"

// 可以从左上、右上、左下、右下四个角改变组件大小
type ResizeDirection = "top-left" | "top-right" | "bottom-left" | "bottom-right"

// 组件初始位置
interface OriginalPositions {
  left: number
  right: number
  top: number
  bottom: number
}

const props = defineProps({
  // 组件 id
  id: {
    type: String,
    required: true,
  },
  // 激活（选中）状态
  active: {
    type: Boolean,
    default: false,
  },
  // 编辑状态
  editing: {
    type: String,
  },
  // props 属性
  props: {
    type: Object,
  },
})

const emits = defineEmits(["active", "update-position", "editing"])

const gap = reactive({
  x: 0,
  y: 0,
})
let size: any
const editWrapper = ref<null | HTMLElement>(null)
const moveWrapper = ref<null | HTMLElement>(null)
let isMoving = false

// need to pick position absolute out, to go with the inner element
// 位置相关的样式 props
const positionStyleProps = useStylePick(props.props || {}, [
  "position",
  "top",
  "left",
  "width",
  "height",
])

// 是否可编辑
const isEditable = computed(() => props.editing === props.id)
watch(isEditable, (newValue) => {
  if (newValue && editWrapper.value) {
    editWrapper.value.focus()
  }
})

// 点击
const itemClick = () => {
  emits("active", props.id)
}

// 编辑
const itemEdit = () => {
  emits("editing", props.id)
}

// 计算组件的位移
const caculateMovePosition = (e: MouseEvent) => {
  const container = document.getElementById("canvas-area") as HTMLElement
  const left = e.clientX - container.offsetLeft - gap.x
  const top = e.clientY - container.offsetTop - gap.y + container.scrollTop
  return {
    left,
    top,
  }
}

// 组件移动
const startMove = (e: MouseEvent) => {
  const currentElement = editWrapper.value as HTMLElement
  gap.x = e.clientX - currentElement.getBoundingClientRect().left
  gap.y = e.clientY - currentElement.getBoundingClientRect().top
  const handleMove = (e: MouseEvent) => {
    isMoving = true
    const { left, top } = caculateMovePosition(e)
    currentElement.style.top = top + "px"
    currentElement.style.left = left + "px"
  }
  const handleMouseUp = (e: MouseEvent) => {
    const { left, top } = caculateMovePosition(e)
    document.removeEventListener("mousemove", handleMove)
    if (isMoving) {
      emits("update-position", { left, top, id: props.id })
      isMoving = false
    }
    nextTick(() => {
      document.removeEventListener("mouseup", handleMouseUp)
    })
  }
  document.addEventListener("mousemove", handleMove)
  document.addEventListener("mouseup", handleMouseUp)
}

// 计算组件的尺寸
const caculateSize = (
  direction: ResizeDirection,
  e: MouseEvent,
  positions: OriginalPositions
) => {
  const { left, right, top, bottom } = positions
  const { pageX, pageY } = e
  const container = document.getElementById("canvas-area") as HTMLElement
  const rightWidth = pageX - left
  const bottomHeight = pageY - top
  const leftWidth = right - pageX
  const topHeight = bottom - pageY
  const leftOffset = pageX - container.offsetLeft
  const topOffset = pageY - container.offsetTop + container.scrollTop
  switch (direction) {
    case "top-left":
      return {
        width: leftWidth,
        height: topHeight,
        top: topOffset,
        left: leftOffset,
      }
    case "top-right":
      return {
        width: rightWidth,
        height: topHeight,
        top: topOffset,
      }
    case "bottom-left":
      return {
        width: leftWidth,
        height: bottomHeight,
        left: leftOffset,
      }
    case "bottom-right":
      return {
        width: rightWidth,
        height: bottomHeight,
      }
    default:
      break
  }
}

// 改变组件尺寸
const startResize = (event: MouseEvent, direction: ResizeDirection) => {
  const currentElement = editWrapper.value as HTMLElement
  const moveElement = moveWrapper.value as HTMLElement
  // get the component element
  const currentComponent = moveElement.firstElementChild as HTMLElement
  const resizeElements = [currentElement, currentComponent]
  const { left, right, top, bottom } = currentElement.getBoundingClientRect()
  const handleMove = (e: MouseEvent) => {
    if (currentElement) {
      size = caculateSize(direction, e, { left, right, top, bottom })
      resizeElements.forEach((element) => {
        const { style } = element
        if (size) {
          if (size.left) {
            style.left = size.left + "px"
          }
          if (size.top) {
            style.top = size.top + "px"
          }
          style.width = size.width + "px"
          style.height = size.height + "px"
        }
      })
    }
  }
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMove)
    emits("update-position", { ...size, id: props.id })
    nextTick(() => {
      document.removeEventListener("mouseup", handleMouseUp)
    })
  }
  document.addEventListener("mousemove", handleMove)
  document.addEventListener("mouseup", handleMouseUp)
}
</script>

<style>
.edit-wrapper {
  padding: 0px;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
}
.edit-wrapper:hover {
  border: 1px dashed #ccc;
}
.edit-wrapper.active {
  border: 1px solid #3b01c4;
  user-select: none;
  z-index: 1500;
}
.edit-wrapper .l-text-component,
.edit-wrapper .l-image-component,
.edit-wrapper .l-shape-component {
  position: static !important;
}
.edit-wrapper.active .resizers .resizer {
  width: 10px;
  height: 10px;
  border-radius: 50%; /*magic to turn square into circle*/
  background: white;
  border: 3px solid #3b01c4;
  position: absolute;
  display: block;
}
.edit-wrapper .resizers .resizer.top-left {
  left: -5px;
  top: -5px;
  cursor: nwse-resize; /*resizer cursor*/
}
.edit-wrapper .resizers .resizer.top-right {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-left {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>
