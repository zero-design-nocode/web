<template>
  <div class="background-processer">
    <styled-uploader
      v-if="!props.value"
      @file-uploaded="handleFileUploaded"
    ></styled-uploader>
    <image-processer
      :value="value"
      @change="updateUrl"
      v-else
      :ratio="ratio"
      :showDelete="true"
      @uploaded="triggerUploaded"
    >
    </image-processer>
  </div>
</template>

<script lang="ts" setup>
import { message } from "ant-design-vue"
import ImageProcesser from "./ImageProcesser.vue"
import { UploadImgProps } from "../helper"
import StyledUploader from "./StyledUploader.vue"

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  ratio: {
    type: Number,
  },
})

const emits = defineEmits(["change", "uploaded"])

const handleFileUploaded = (uploadedData: UploadImgProps) => {
  message.success("上传成功")
  emits("change", uploadedData.data.urls[0])
  emits("uploaded", uploadedData)
}
const updateUrl = (value: string) => {
  emits("change", value)
}
const triggerUploaded = (uploadedData: UploadImgProps) => {
  emits("uploaded", uploadedData)
}
</script>

<style>
.delete-uploaded {
  margin-top: 10px;
  display: block;
}
</style>
