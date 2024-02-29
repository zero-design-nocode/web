<template>
  <div class="image-processer">
    <a-modal
      title="裁剪图片"
      v-model:visible="showModal"
      @ok="handleOk"
      @cancel="showModal = false"
      okText="确认"
      cancelText="取消"
    >
      <div class="image-cropper">
        <!-- 
          :src="baseImageUrl" 的原因是保证每次裁剪都是在原图片的基础上
          否则第二次裁剪建立在第一次裁剪后的基础上时，会出现坐标错乱
        -->
        <img :src="baseImageUrl" id="processed-image" />
      </div>
    </a-modal>
    <div
      class="image-preview"
      :style="{ backgroundImage: backgrondUrl }"
      :class="{ extraHeight: showDelete }"
    ></div>
    <div class="image-process">
      <uploader
        action="/utils/upload-img"
        @file-uploaded="handleFileUploaded"
        :beforeUpload="commonUploadCheck"
      >
        <div class="uploader-container">
          <a-button>
            <template v-slot:icon><UploadOutlined /></template>更换图片
          </a-button>
        </div>
        <template #loading>
          <div class="uploader-container">
            <a-button>
              <template v-slot:icon><LoadingOutlined /></template>上传中
            </a-button>
          </div>
        </template>
        <template #uploaded>
          <a-button>
            <template v-slot:icon><UploadOutlined /></template>更换图片
          </a-button>
        </template>
      </uploader>
      <a-button @click="showModal = true">
        <template v-slot:icon><ScissorOutlined /></template>裁剪图片
      </a-button>
      <a-button v-if="showDelete" type="danger" @click="handleDelete">
        <template v-slot:icon><DeleteOutlined /></template>删除图片
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from "vue"
import Cropper from "cropperjs"
import { message } from "ant-design-vue"
import {
  UploadOutlined,
  ScissorOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue"
import Uploader from "./Uploader.vue"
import { commonUploadCheck, UploadImgProps } from "../helper"
// import axios from "axios"

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  ratio: {
    type: Number,
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
})

// 裁剪图片的 props
interface CropDataProps {
  x: number
  y: number
  width: number
  height: number
}

const emits = defineEmits(["change", "uploaded"])

const backgrondUrl = computed(() => `url(${props.value})`)

const showModal = ref(false)
let cropperData: CropDataProps
let cropper: Cropper | null = null
watch(showModal, (newValue) => {
  if (newValue) {
    // 异步更新，不设置 nextTick 拿不到 DOM 节点
    nextTick(() => {
      const image = document.getElementById(
        "processed-image"
      ) as HTMLImageElement
      cropper = new Cropper(image, {
        checkCrossOrigin: false,
        crop(event) {
          const { x, y, width, height } = event.detail
          // 得到 x y width height, 方便后面阿里云 OSS 拼接
          cropperData = {
            x: Math.floor(x),
            y: Math.floor(y),
            width: Math.floor(width),
            height: Math.floor(height),
          }
        },
        ...(props.ratio && { aspectRatio: props.ratio }),
      })
    })
  } else {
    if (cropper) {
      // 使用完毕后销毁
      cropper.destroy()
    }
  }
})

const baseImageUrl = computed(() => props.value.split("?")[0])
const handleOk = () => {
  const { x, y, width, height } = cropperData
  // 使用阿里云 OSS 的方式
  // 这里必须是 baseImageUrl，因为如果是直接针对 imageUrl 做拼接
  // 会使得 imageUrl 一直被反复拼接，导致链接失效
  const cropperedUrl =
    baseImageUrl.value +
    `?x-oss-process=image/crop,x_${x},y_${y},w_${width},h_${height}`
  emits("change", cropperedUrl)
  showModal.value = false
  // 不使用阿里云 OSS 的方式，拿到截图图片再次上传的处理方式
  // cropper?.getCroppedCanvas().toBlob((blob) => {
  //   if (blob) {
  //     const formData = new FormData()
  //     formData.append("croppedImage", blob, "test.png")
  //     axios.post("http://local.test:7001/api/upload/", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     }).then(resp => {
  //       emits("change", resp.data.data.url)
  //       showModal.value = false
  //     })
  //   }
  // })
}

const handleFileUploaded = (uploadedData: UploadImgProps) => {
  message.success("上传成功")
  emits("change", uploadedData.data.urls[0])
  emits("uploaded", uploadedData)
}

const handleDelete = () => {
  emits("change", "")
}
</script>

<style>
.image-processer {
  display: flex;
  justify-content: space-between;
}
.image-preview {
  width: 150px;
  height: 84px;
  border: 1px dashed #e6ebed;
  background: no-repeat 50% / contain;
}
.image-preview.extraHeight {
  height: 110px;
}
.image-cropper img {
  display: block;
  /* This rule is very important, please don't ignore this */
  max-width: 100%;
}
.image-process {
  padding: 5px 0;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
