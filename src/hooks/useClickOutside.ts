import { ref, onMounted, onUnmounted, Ref } from "vue"

// 检测点击事件是否发生在指定的元素外部
const useClickOutside = (
  // elementRef 指向需要检测点击事件的元素
  elementRef: Ref<null | HTMLElement>,
  // trigger 是一个可选的触发器，用于控制是否启用点击外部检测。默认值为 false，表示禁用
  trigger: any = true
) => {
  const isClickOutside = ref(false)
  const handler = (e: MouseEvent) => {
    if (trigger && elementRef.value) {
      if (elementRef.value.contains(e.target as HTMLElement)) {
        isClickOutside.value = false
      } else {
        isClickOutside.value = true
      }
    }
  }
  onMounted(() => {
    document.addEventListener("click", handler)
  })
  onUnmounted(() => {
    document.removeEventListener("click", handler)
  })
  return isClickOutside
}

export default useClickOutside
