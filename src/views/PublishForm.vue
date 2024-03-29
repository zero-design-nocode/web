<template>
  <div class="publish-form-container">
    <a-row type="flex" align="middle" :style="{ marginBottom: '20px' }">
      <a-col :span="6"> 扫码预览： </a-col>
      <a-col :span="10">
        <div id="preview-barcode-container"></div>
      </a-col>
    </a-row>
    <a-row type="flex" align="middle" :style="{ marginBottom: '20px' }">
      <a-col :span="6"> 上传封面： </a-col>
      <a-col :span="10">
        <styled-uploader
          text="上传封面图"
          @file-uploaded="updateAvatar"
          :uploaded="form.uploaded"
        >
        </styled-uploader>
      </a-col>
    </a-row>
    <a-form
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      :model="form"
      :rules="rules"
      ref="publishForm"
    >
      <a-form-item label="标题" required name="title">
        <a-input
          v-model:value="form.title"
          @change="updatePage('title', form.title)"
        />
      </a-form-item>
      <a-form-item label="副标题" required name="subTitle">
        <a-input
          v-model:value="form.subTitle"
          @change="updatePage('desc', form.subTitle)"
        />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 18, offset: 4 }">
        <a-button
          type="primary"
          @click="checkAndpublish"
          :loading="props.isPublishing"
        >
          发布
        </a-button>
        <a-button
          style="margin-left: 10px"
          @click="saveWork"
          :loading="props.isSaving"
        >
          保存
        </a-button>
        <a-button style="margin-left: 10px" @click="cancelEdit">
          取消
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, Ref, computed, watch, onMounted } from "vue"
import StyledUploader from "../components/StyledUploader.vue"
import { UploadImgProps } from "../helper"
import QRCode from "qrcodejs2"
import { useStore } from "vuex"
import { GlobalDataProps } from "../store"
import { baseH5URL } from "../main"
interface RuleFormInstance {
  validate: () => Promise<any>
}

const props = defineProps({
  isSaving: Boolean,
  isPublishing: Boolean,
})

const emits = defineEmits(["panel-close", "trigger-publish", "trigger-save"])

const store = useStore<GlobalDataProps>()
const pageData = computed(() => store.state.editor.page)
const { title, desc, setting } = pageData.value
const previewURL = `${baseH5URL}/p/preview/${pageData.value.id}-${pageData.value.uuid}`
const form = reactive({
  title: title || "",
  subTitle: desc || "",
  uploaded: {
    data: {
      url:
        (setting && setting.shareImg) ||
        "https://qiniu.wei-jia.top/default.jpg",
    },
  },
})
// in case title changed from outside
watch(
  () => pageData.value.title,
  (newTitle) => {
    if (newTitle) {
      form.title = newTitle
    }
  }
)
onMounted(() => {
  const ele = document.getElementById("preview-barcode-container")
  if (ele) {
    // clear the barcode
    ele.innerHTML = ""
    // eslint-disable-next-line no-new
    new QRCode(ele, {
      text: previewURL,
      width: 120,
      height: 120,
    })
  }
})
const publishForm = ref() as Ref<RuleFormInstance>
const rules = {
  title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
  subTitle: [{ required: true, message: "副标题不能为空", trigger: "blur" }],
}
const updatePage = (key: string, value: string, settings = false) => {
  store.commit("updatePage", {
    key,
    value,
    level: settings ? "setting" : false,
  })
}
const updateAvatar = (rawData: UploadImgProps) => {
  const url = rawData.data.urls[0]
  form.uploaded = {
    data: { url },
  }
  updatePage("shareImg", url, true)
}
const validate = () => {
  return publishForm.value.validate()
}
const checkAndpublish = () => {
  validate().then(() => {
    emits("trigger-publish", true)
  })
}
const saveWork = () => {
  validate().then(() => {
    emits("trigger-save", true)
  })
}
const cancelEdit = () => {
  emits("panel-close", true)
}
</script>

<style>
.publish-form-container .file-upload-container {
  height: 130px;
}
.publish-form-container .ant-form-item-label {
  text-align: left;
}
#preview-barcode-container {
  border: 2px dotted #efefef;
  padding: 10px;
}
</style>
