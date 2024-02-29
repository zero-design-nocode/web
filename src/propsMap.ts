// this file map the component props to ant-design-vue form element
// every prop should have five props
import { h, VNode } from "vue"

// prop 具体的类型
interface PropDetailType {
  // 组件名称 -- 用于确定是哪一个 component
  component: string
  // 事件名称 - 用于确定更改 value 的 事件名称
  eventName: string
  // 初始值的变换，有些初始值需要处理以后在传递给组件
  intialTransform: (v: any) => any
  // 触发更改以后，不同类型需要不同处理，因为 e 的值是不同的，或者需要回灌的值不同
  afterTransform: (v: any) => any
  // 属性对应的中文名称
  text?: string
  // 给组件赋值时属性的名称，一般是 value，也有可能是另外的，比如 checkbox 就是 checked
  valueProp: string
  // 子组件
  subComponent?: string
  // 选项 - 通常是选项框的子选项
  options?: { text: string | VNode; value: any }[]
  // 额外的 props
  extraProps?: { [key: string]: any }
  // 父组件 - 该属性有可能和其他联动，修改父属性控制它的行为
  parent?: string
  // 可能还要向外传递更多事件
  extraEvent?: string
}

// 映射类型
// key 为字符串，如 text、fontSize
// value 为 PropDetailType
interface MapTypes {
  [key: string]: PropDetailType
}

// 默认映射
const defaultMap = {
  component: "a-input",
  eventName: "change",
  valueProp: "value", // 默认是 value
  intialTransform: (v: any) => v,
  afterTransform: (e: any) => e,
}

// 数字输入框 - 通过改变输入框中的数字来改变像素 px
const numberToPxHandle = {
  ...defaultMap,
  component: "a-input-number",
  intialTransform: (v: string) => (v ? parseInt(v) : 0), // 像素转换为数字
  afterTransform: (e: number) => (e ? `${e}px` : "0"), // 数字转换为像素
}

// 字体家族数组
const fontFamilyArr = [
  { text: "宋体", value: '"SimSun","STSong"' },
  { text: "黑体", value: '"SimHei","STHeiti"' },
  { text: "楷体", value: '"KaiTi","STKaiti"' },
  { text: "仿宋", value: '"FangSong","STFangsong"' },
  { text: "Arial", value: '"Arial", sans-serif' },
  { text: "Arial Black", value: '"Arial Black", sans-serif' },
  { text: "Comic Sans MS", value: '"Comic Sans MS"' },
  { text: "Courier New", value: '"Courier New", monospace' },
  { text: "Georgia", value: '"Georgia", serif' },
  { text: "Times New Roman", value: '"Times New Roman", serif' },
]

// 生成字体家族选项
const fontFamilyOptions = fontFamilyArr.map((font) => {
  return {
    value: font.value,
    text: h("span", { style: { fontFamily: font.value } }, font.text),
  }
})

// 编辑器右侧的「属性设置」- 将定义的 propsMap 转换为 Antd 内置组件
const mapPropsToComponents: MapTypes = {
  // 文本 -> 文本域
  text: {
    ...defaultMap,
    component: "textarea-fix",
    afterTransform: (e: any) => e.target.value, // 获取组件的 value 值放入文本域
    text: "文本",
    extraProps: { rows: 3 }, // 默认文本域为 3 行
  },
  // 链接 -> 输入框
  href: {
    ...defaultMap,
    afterTransform: (e: any) => e.target.value, // 获取组件的 value 值放入输入框
    text: "链接",
  },
  // 字号 -> 数字输入框
  fontSize: {
    ...numberToPxHandle,
    text: "字号",
  },
  // 字体 -> 选项框
  fontFamily: {
    ...defaultMap,
    component: "a-select",
    subComponent: "a-select-option",
    text: "字体",
    options: [{ value: "", text: "无" }, ...fontFamilyOptions],
  },
  // 文字是否加粗 -> 可选中的图标
  fontWeight: {
    ...defaultMap,
    component: "icon-switch",
    intialTransform: (v: string) => v === "bold", // 返回是否加粗的布尔值
    afterTransform: (e: boolean) => (e ? "bold" : "normal"), // true - 加粗 ｜ false - 普通
    valueProp: "checked", // value 为 checked
    extraProps: { iconName: "BoldOutlined", tip: "加粗" },
  },
  // 文字是否倾斜 -> 可选中的图标
  fontStyle: {
    ...defaultMap,
    component: "icon-switch",
    intialTransform: (v: string) => v === "italic", // 返回是否倾斜的布尔值
    afterTransform: (e: boolean) => (e ? "italic" : "normal"), // true - 倾斜 ｜ false - 普通
    valueProp: "checked", // value 为 checked
    extraProps: { iconName: "ItalicOutlined", tip: "斜体" },
  },
  // 文字是否有下划线 -> 可选中的图标
  textDecoration: {
    ...defaultMap,
    component: "icon-switch",
    intialTransform: (v: string) => v === "underline", // 返回是否有下划线的布尔值
    afterTransform: (e: boolean) => (e ? "underline" : "none"), // true - 有下划线 ｜ false - 普通
    valueProp: "checked", // value 为 checked
    extraProps: { iconName: "UnderlineOutlined", tip: "下划线" },
  },
  // 行高 -> 滑块
  lineHeight: {
    ...defaultMap,
    component: "a-slider",
    text: "行高",
    intialTransform: (v: string) => (v ? parseFloat(v) : 0), // 字符串转数字
    afterTransform: (e: number) => e.toString(), // 数字转字符串
    extraProps: { min: 0, max: 3, step: 0.1 },
  },
  // 对齐方式 -> 单选组
  textAlign: {
    ...defaultMap,
    component: "a-radio-group",
    subComponent: "a-radio-button",
    afterTransform: (e: any) => e.target.value,
    text: "对齐",
    options: [
      { value: "left", text: "左" },
      { value: "center", text: "中" },
      { value: "right", text: "右" },
    ],
  },
  // 文字颜色 -> 颜色选择器
  color: {
    ...defaultMap,
    component: "color-picker",
    text: "文字颜色",
  },
  // 背景颜色 -> 颜色选择器
  backgroundColor: {
    ...defaultMap,
    component: "color-picker",
    text: "背景颜色",
  },
  // 点击事件 -> 选项框
  actionType: {
    ...defaultMap,
    component: "a-select",
    subComponent: "a-select-option",
    text: "点击",
    options: [
      { value: "", text: "无" },
      { value: "to", text: "跳转到 URL" },
    ],
  },
  // 链接 -> 输入框
  url: {
    ...defaultMap,
    afterTransform: (e: any) => e.target.value,
    text: "链接",
    parent: "actionType",
  },
  // 高度 -> 数字输入框
  height: {
    ...defaultMap,
    component: "a-input-number",
    intialTransform: (v: string) => (v ? parseInt(v) : ""),
    afterTransform: (e: number) => (e ? `${e}px` : ""),
    text: "高度",
  },
  // 宽度 -> 数字输入框
  width: {
    ...defaultMap,
    component: "a-input-number",
    intialTransform: (v: string) => (v ? parseInt(v) : ""),
    afterTransform: (e: number) => (e ? `${e}px` : ""),
    text: "宽度",
  },
  // 左边距 -> 数字输入框
  paddingLeft: {
    ...numberToPxHandle,
    text: "左边距",
  },
  // 右边距 -> 数字输入框
  paddingRight: {
    ...numberToPxHandle,
    text: "右边距",
  },
  // 上边距 -> 数字输入框
  paddingTop: {
    ...numberToPxHandle,
    text: "上边距",
  },
  // 下边距 -> 数字输入框
  paddingBottom: {
    ...numberToPxHandle,
    text: "下边距",
  },
  // 边框类型 -> 选项框
  borderStyle: {
    ...defaultMap,
    component: "a-select",
    subComponent: "a-select-option",
    text: "边框类型",
    options: [
      { value: "none", text: "无" },
      { value: "solid", text: "实线" },
      { value: "dashed", text: "破折线" },
      { value: "dotted", text: "点状线" },
    ],
  },
  // 边框颜色 -> 颜色选择器
  borderColor: {
    ...defaultMap,
    component: "color-picker",
    text: "边框颜色",
  },
  // 边框宽度 -> 滑块
  borderWidth: {
    ...defaultMap,
    component: "a-slider",
    intialTransform: (v: string) => parseInt(v),
    afterTransform: (e: number) => e + "px",
    text: "边框宽度",
    extraProps: { min: 0, max: 20 },
  },
  // 边框圆角 -> 滑块
  borderRadius: {
    ...defaultMap,
    component: "a-slider",
    intialTransform: (v: string) => parseInt(v),
    afterTransform: (e: number) => e + "px",
    text: "边框圆角",
    extraProps: { min: 0, max: 200 },
  },
  // 透明度 -> 滑块
  opacity: {
    ...defaultMap,
    component: "a-slider",
    text: "透明度",
    intialTransform: (v: number) => (v >= 0 ? v * 100 : 100),
    afterTransform: (e: number) => e / 100,
    extraProps: { min: 0, max: 100, reverse: true },
  },
  // 阴影 -> 详见 ShadowPicker.vue
  boxShadow: {
    ...defaultMap,
    component: "shadow-picker",
  },
  // 定位方式 -> 选项框
  position: {
    ...defaultMap,
    component: "a-select",
    subComponent: "a-select-option",
    text: "定位",
    options: [
      { value: "", text: "默认" },
      { value: "absolute", text: "绝对定位" },
    ],
  },
  // X轴坐标 -> 数字输入框
  left: {
    ...numberToPxHandle,
    text: "X轴坐标",
  },
  // Y轴坐标 -> 数字输入框
  top: {
    ...numberToPxHandle,
    text: "Y轴坐标",
  },
  // 图片链接 -> 图片处理器 - 详见 ImageProcessor.vue
  imageSrc: {
    ...defaultMap,
    component: "image-processer",
  },
  // 背景图片链接 -> 背景图片处理器 - 详见 BackgroundProcessor.vue
  backgroundImage: {
    ...defaultMap,
    component: "background-processer",
    intialTransform: (v: string) => {
      if (v) {
        const matches = v.match(/\((.*?)\)/)
        if (matches && matches.length > 1) {
          return matches[1].replace(/('|")/g, "")
        } else {
          return ""
        }
      } else {
        return ""
      }
    },
    afterTransform: (e: string) => (e ? `url('${e}')` : ""),
    extraProps: { ratio: 8 / 15, showDelete: true },
    extraEvent: "uploaded",
  },
  // 背景大小 -> 选项框
  backgroundSize: {
    ...defaultMap,
    component: "a-select",
    subComponent: "a-select-option",
    text: "背景大小",
    options: [
      { value: "contain", text: "自动缩放" },
      { value: "cover", text: "自动填充" },
      { value: "", text: "默认" },
    ],
  },
  // 背景重复 -> 选项框
  backgroundRepeat: {
    ...defaultMap,
    component: "a-select",
    subComponent: "a-select-option",
    text: "背景重复",
    options: [
      { value: "no-repeat", text: "无重复" },
      { value: "repeat-x", text: "X轴重复" },
      { value: "repeat-y", text: "Y轴重复" },
      { value: "repeat", text: "全部重复" },
    ],
  },
}

export default mapPropsToComponents
