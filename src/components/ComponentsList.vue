<template>
  <div class="create-component-list">
    <a-tabs>
      <a-tab-pane key="1">
        <template v-slot:tab>
          <span>
            <FieldStringOutlined />
            文本
          </span>
        </template>
        <div
          v-for="(item, index) in textList"
          :key="index"
          @click="onItemClick(item)"
          class="component-item"
        >
          <div class="component-wrapper">
            <component
              :is="item.name"
              v-bind="item.props"
              :style="generateResetCss(item.name)"
              class="inside-component"
            />
            <span v-if="item.text" class="tip-text">{{ item.text }}</span>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2">
        <template v-slot:tab>
          <span>
            <FileImageOutlined />
            图片
          </span>
        </template>
        <uploader
          action="/utils/upload-img"
          @file-uploaded="
            (uploaded) => {
              handleFileUploaded(uploaded)
            }
          "
          :beforeUpload="commonUploadCheck"
        >
          <div class="uploader-container">
            <FileImageOutlined />
            <h4>上传图片</h4>
          </div>
          <template #loading>
            <div class="uploader-container">
              <LoadingOutlined spin />
              <h4>上传中</h4>
            </div>
          </template>
          <template #uploaded>
            <div class="uploader-container">
              <FileImageOutlined />
              <h4>上传图片</h4>
            </div>
          </template>
        </uploader>
        <div class="image-list">
          <div
            v-for="(item, index) in imageList"
            :key="index"
            @click="onItemClick(item)"
            class="component-item item-image"
          >
            <div class="component-wrapper">
              <component
                :is="item.name"
                v-bind="item.props"
                :style="generateResetCss(item.name)"
                class="inside-component"
              />
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="3">
        <template v-slot:tab>
          <span>
            <BuildOutlined />
            形状
          </span>
        </template>
        <div
          v-for="(item, index) in shapeList"
          :key="index"
          @click="onItemClick(item)"
          class="component-item"
        >
          <div class="component-wrapper">
            <component
              :is="item.name"
              v-bind="item.props"
              :style="generateResetCss(item.name)"
              class="inside-component"
            />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import {
  FileImageOutlined,
  LoadingOutlined,
  FieldStringOutlined,
  BuildOutlined,
} from "@ant-design/icons-vue"
import { message } from "ant-design-vue"
import Uploader from "./Uploader.vue"
import { componentsDefaultProps } from "../defaultProps"
import { commonUploadCheck, imageDimensions, UploadImgProps } from "../helper"

// LText 组件 props 默认值
const textDefaultProps = componentsDefaultProps["l-text"].props
// LImage 组件 props 默认值
const imageDefaultProps = componentsDefaultProps["l-image"].props
// LShape 组件 props 默认值
const shapeDefaultProps = componentsDefaultProps["l-shape"].props

interface CreateComponentType {
  name: string // 组件类型名称
  text?: string // 文本内容
  type?: string // 类型
  props: { [key: string]: string } // props
}

const generateResetCss = (name: string) => {
  return {
    position: "static",
    ...(name !== "l-shape" && { height: "" }),
  }
}

// LText 组件 props 列表
const textPropsList = [
  {
    text: "大标题",
    fontSize: "30px",
    fontWeight: "bold",
    tag: "h2",
  },
  {
    text: "楷体副标题",
    fontSize: "20px",
    fontWeight: "bold",
    fontFamily: '"KaiTi","STKaiti"',
    tag: "h2",
  },
  {
    text: "正文内容",
    tag: "p",
  },
  {
    text: "宋体正文内容",
    tag: "p",
    fontFamily: '"SimSun","STSong"',
  },
  {
    text: "Arial style",
    tag: "p",
    fontFamily: '"Arial", sans-serif',
  },
  {
    text: "Comic Sans",
    tag: "p",
    fontFamily: '"Comic Sans MS"',
  },
  {
    text: "Courier New",
    tag: "p",
    fontFamily: '"Courier New", monospace',
  },
  {
    text: "Times New Roman",
    tag: "p",
    fontFamily: '"Times New Roman", serif',
  },
  {
    text: "链接内容",
    color: "#3b01c4",
    textDecoration: "underline",
    tag: "p",
  },
  {
    text: "按钮内容",
    color: "#ffffff",
    backgroundColor: "#3b01c4",
    borderWidth: "1px",
    borderColor: "#3b01c4",
    borderStyle: "solid",
    borderRadius: "2px",
    paddingLeft: "10px",
    paddingRight: "10px",
    paddingTop: "5px",
    paddingBottom: "5px",
    width: "100px",
    tag: "button",
    textAlign: "center",
  },
]

// LText 组件列表
const textList: CreateComponentType[] = textPropsList.map((prop) => {
  return {
    name: "l-text",
    props: {
      ...textDefaultProps,
      ...(prop as any),
    },
  }
})

// LImage 图片源列表
const imgSourceList = [
  "https://qiniu.wei-jia.top/%E9%9B%B6%E7%A0%81%E8%AE%BE%E8%AE%A1.png",
  "https://qiniu.wei-jia.top/%E9%9B%B6%E7%A0%81%E8%AE%BE%E8%AE%A1%20%281%29.png",
  "https://qiniu.wei-jia.top/%E7%94%9F%E6%88%90%E7%9A%84%E8%AE%BE%E8%AE%A1%20%282%29.jpeg",
  "https://qiniu.wei-jia.top/%E7%94%9F%E6%88%90%E7%9A%84%E8%AE%BE%E8%AE%A1%20%281%29.jpeg",
  "https://qiniu.wei-jia.top/%E7%94%9F%E6%88%90%E7%9A%84%E8%AE%BE%E8%AE%A1%20%283%29.jpeg",
  "https://qiniu.wei-jia.top/%E7%94%9F%E6%88%90%E7%9A%84%E8%AE%BE%E8%AE%A1%20%284%29.jpeg",
  "https://qiniu.wei-jia.top/%E7%94%9F%E6%88%90%E7%9A%84%E8%AE%BE%E8%AE%A1%20%285%29.jpeg",
  "https://qiniu.wei-jia.top/%E7%94%9F%E6%88%90%E7%9A%84%E8%AE%BE%E8%AE%A1%20%286%29.jpeg",
  "http://static.imooc-lego.com/upload-files/money-664239.png",
  "http://static.imooc-lego.com/upload-files/text4-145592.png",
]

// LImage 组件列表
const imageList: CreateComponentType[] = imgSourceList.map((url) => {
  return {
    name: "l-image",
    props: {
      ...imageDefaultProps,
      imageSrc: url,
      width: "150px",
    },
  }
})

// LShape 组件 props 列表
const shapePropsList = [
  {
    backgroundColor: "#efefef",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ccc",
    width: "100px",
    height: "50px",
  },
  {
    backgroundColor: "#efefef",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ccc",
    borderRadius: "100px",
    width: "100px",
    height: "100px",
  },
  {
    backgroundColor: "#efefef",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ccc",
    width: "100px",
    height: "100px",
  },
  {
    backgroundColor: "#3b01c4",
    width: "100px",
    height: "50px",
  },
  {
    backgroundColor: "#3b01c4",
    borderRadius: "100px",
    width: "100px",
    height: "100px",
  },
  {
    backgroundColor: "#3b01c4",
    borderWidth: "5px",
    borderStyle: "solid",
    borderColor: "#ccc",
    width: "100px",
    height: "100px",
  },
]

// LShape 组件列表
const shapeList: CreateComponentType[] = shapePropsList.map((prop) => {
  return {
    name: "l-shape",
    props: {
      ...shapeDefaultProps,
      ...(prop as any),
    },
  }
})

const emits = defineEmits(["on-item-click"])

const onItemClick = (data: CreateComponentType) => {
  if (data.type !== "upload") {
    emits("on-item-click", data)
  }
}
const handleFileUploaded = (uploadedData: UploadImgProps) => {
  const data = {
    name: "l-image",
    props: {
      ...imageDefaultProps,
    },
  } as CreateComponentType
  message.success("上传成功")
  data.props.imageSrc = uploadedData.data.urls[0]
  imageDimensions(uploadedData.file).then((dimension) => {
    const maxWidth = 300
    data.props.width =
      (dimension.width > maxWidth ? maxWidth : dimension.width) + "px"
    emits("on-item-click", data)
  })
}
</script>

<style scoped>
.component-wrapper {
  width: 100px;
  position: relative;
  display: flex;
  align-items: center;
}
.tip-text {
  position: absolute;
  text-align: center;
  top: 50%;
  width: 100%;
  margin-top: -10px;
}
.inside-component {
  width: 100px !important;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  width: 220px;
  margin: 20px auto;
}
.image-list img {
  max-height: 150px;
  object-fit: contain;
}
.item-image {
  margin-right: 10px;
}
.component-item {
  margin-bottom: 15px;
  cursor: pointer;
  display: flex;
  justify-content: center;
}
.create-component-list .uploader-container {
  padding: 10px;
  color: #ffffff;
  background: #3b01c4;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.create-component-list .uploader-container:hover {
  background: #40a9ff;
}
.create-component-list .uploader-container h4 {
  color: #ffffff;
  margin-bottom: 0;
  margin-left: 10px;
}
.create-component-list .ant-tabs-tab {
  margin: 0;
}
</style>
