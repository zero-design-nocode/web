import { Component } from "vue"
import TextareaFix from "@/components/TextareaFix.vue"
import ColorPicker from "@/components/ColorPicker.vue"
import IconSwitch from "@/components/IconSwitch.vue"
import ShadowPicker from "@/components/ShadowPicker.vue"
import ImageProcesser from "@/components/ImageProcesser.vue"
import BackgroundProcesser from "@/components/BackgroundProcesser.vue"
import {
  Input,
  InputNumber,
  RadioButton,
  Select,
  Slider,
  RadioGroup,
} from "ant-design-vue"
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
} from "@ant-design/icons-vue"

interface stringComponentMap {
  [name: string]: any
}

const stringComponentMaps: stringComponentMap = {
  "textarea-fix": TextareaFix,
  "color-picker": ColorPicker,
  "icon-switch": IconSwitch,
  "shadow-picker": ShadowPicker,
  "image-processer": ImageProcesser,
  "background-processer": BackgroundProcesser,
  "a-input-number": InputNumber,
  "a-input": Input,
  "a-slider": Slider,
  "a-select": Select,
  "a-radio-button": RadioButton,
  "a-radio-group": RadioGroup,
  BoldOutlined: BoldOutlined,
  ItalicOutlined: ItalicOutlined,
  UnderlineOutlined: UnderlineOutlined,
}

export const stringToComponent = (key: string): Component => {
  return stringComponentMaps[key]
}
