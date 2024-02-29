<template>
  <div class="styled-upload-component">
    <uploader
      action="/utils/upload-img"
      :beforeUpload="commonUploadCheck"
      :uploaded="props.uploaded"
      @file-uploaded="handleFileUploaded"
    >
      <div class="uploader-container">
        <FileImageOutlined :style="{ fontSize: '30px' }" />
        <h4>{{ props.text }}</h4>
      </div>
      <template #loading>
        <div class="uploader-container">
          <LoadingOutlined :style="{ fontSize: '30px' }" spin />
          <h4>上传中</h4>
        </div>
      </template>
      <template #uploaded="dataProps">
        <div class="uploader-container">
          <img :src="(dataProps as any).uploadedData.data.url" />
        </div>
      </template>
    </uploader>
  </div>
</template>

<script lang="ts" setup>
import { FileImageOutlined, LoadingOutlined } from "@ant-design/icons-vue"
import { commonUploadCheck } from "../helper"
import Uploader from "./Uploader.vue"

const props = defineProps({
  text: {
    type: String,
    default: "上传背景图片",
  },
  uploaded: {
    type: Object,
  },
})

const emits = defineEmits(["file-uploaded"])

const handleFileUploaded = (data: any) => {
  emits("file-uploaded", data)
}
</script>

<style scoped>
.uploader-container {
  text-align: center;
  padding: 10px;
  width: 100%;
  border: 2px dotted #efefef;
  color: #ccc;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  transition: all 0.25s ease-in-out;
  cursor: pointer;
}
.uploader-container:hover {
  border: 2px dotted #3b01c4;
  color: #3b01c4;
}
.uploader-container h4 {
  color: #999;
  transition: all 0.25s ease-in-out;
}
.uploader-container:hover h4 {
  color: #3b01c4;
}
.uploader-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
