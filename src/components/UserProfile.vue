<template>
  <a-button
    type="primary"
    v-if="!props.user.isLogin"
    class="user-profile-component"
  >
    <router-link to="/login">登录</router-link>
  </a-button>
  <div :class="{ 'user-operation': !props.smMode }" v-else>
    <a-button type="primary" @click="createDesign" v-if="!props.smMode">
      创建设计
    </a-button>
    <a-button
      type="primary"
      class="user-profile-component"
      v-if="!props.smMode"
    >
      <router-link to="/mywork">我的作品</router-link>
    </a-button>
    <a-dropdown-button class="user-profile-component">
      <router-link to="/setting">{{ props.user.data.nickName }}</router-link>
      <template v-slot:overlay>
        <a-menu class="user-profile-dropdown">
          <a-menu-item key="2" v-if="props.smMode"
            ><router-link to="/mywork">我的作品</router-link></a-menu-item
          >
          <a-menu-item key="3"
            ><router-link to="/setting">个人设置</router-link></a-menu-item
          >
          <a-menu-item key="4" @click="logout">登出</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { message } from "ant-design-vue"
import { UserProps } from "../store/user"
import useCreateDesign from "../hooks/useCreateDesign"

const props = defineProps({
  // 当前用户
  user: {
    type: Object as PropType<UserProps>,
    required: true,
  },
  // smMode = true 表示 H5 端（通常为移动设备）
  smMode: {
    type: Boolean,
    default: false,
  },
})

const store = useStore()
const router = useRouter()
const createDesign = useCreateDesign()

const logout = () => {
  store.commit("logout")
  message.success("退出登录成功，2秒后跳转到首页", 2)
  setTimeout(() => {
    router.push("/login")
  }, 2000)
}
</script>

<style>
.user-profile-dropdown {
  border-radius: 2px !important;
}
.user-operation > * {
  margin-left: 30px !important;
}
</style>
