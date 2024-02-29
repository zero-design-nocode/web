// 默认 props 类型
interface DefaultPropsType {
  [key: string]: {
    props: object
    extraProps?: { [key: string]: any }
  }
}

// 公共 props 默认值, 每个组件都有
export const commonDefaultProps = {
  // 操作
  actionType: "", // 操作类型
  url: "", // 跳转的 URL
  // 尺寸
  height: "", // 高
  width: "", // 宽
  paddingLeft: "0px", // 左内边距
  paddingRight: "0px", // 右内边距
  paddingTop: "0px", // 上内边距
  paddingBottom: "0px", // 下内边距
  // 边框
  borderStyle: "none", // 边框样式
  borderColor: "#000", // 边框颜色
  borderWidth: "0", // 边框宽度
  borderRadius: "0", // 边框圆角
  // 阴影和透明度
  boxShadow: "0 0 0 #000000",
  opacity: 1,
  // 位置
  position: "absolute",
  left: "0",
  top: "0",
  right: "0",
}

// LText 组件 props 默认值
export const textDefaultProps = {
  // 字体大小
  fontSize: "14px",
  // 字体
  fontFamily: "",
  // 字体粗细
  fontWeight: "normal",
  // 字体样式
  fontStyle: "normal",
  // 文本装饰
  textDecoration: "none",
  // 行高
  lineHeight: "1",
  // 对齐方式
  textAlign: "center",
  // 文本颜色
  color: "#000000",
  // 背景颜色
  backgroundColor: "",
  // 公共默认 props
  ...commonDefaultProps,
  // 宽度
  width: "318px",
}

// LImage 组件 props 默认值
export const imageDefaultProps = {
  // 图片 URL
  imageSrc: "",
  // 公共默认 props
  ...commonDefaultProps,
}

// 默认 props 类型
// 主要用于展示在编辑器页面左侧栏
export const componentsDefaultProps: DefaultPropsType = {
  "l-text": {
    props: {
      text: "正文内容",
      ...textDefaultProps,
      fontSize: "16px",
      width: "150px",
      height: "48px",
      left: 320 / 2 - 150 / 2 + "px",
      top: 500 / 2 - 48 / 2 + "px",
    },
  },
  "l-image": {
    props: {
      ...imageDefaultProps,
    },
  },
  "l-shape": {
    props: {
      backgroundColor: "",
      ...commonDefaultProps,
    },
  },
}

export default componentsDefaultProps
