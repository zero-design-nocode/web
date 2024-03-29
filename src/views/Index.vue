<template>
  <div class="homepage-container">
    <a-spin tip="读取中" class="editor-spinner" v-if="loading"> </a-spin>
    <a-layout :style="{ background: '#fff' }">
      <a-layout-header
        class="header"
        :class="{ 'transparent-header': isHomePage }"
      >
        <div class="page-title">
          <router-link to="/">
            <img alt="Vue logo" src="../assets/logo2.png" class="logo-img" />
          </router-link>
        </div>
        <div class="right-col">
          <user-profile :user="userInfo"></user-profile>
        </div>
      </a-layout-header>
      <a-layout-content v-if="isHomePage" class="home-layout">
        <router-view></router-view>
      </a-layout-content>
      <a-layout-content style="padding: 0 50px" v-else>
        <a-layout style="padding: 24px 0; background: #fff">
          <a-layout-content
            :style="{
              padding: '0 24px',
              minHeight: '85vh',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
            }"
          >
            <router-view></router-view>
          </a-layout-content>
        </a-layout>
      </a-layout-content>
      <a-layout-footer>
        <div class="footer-info">
          <a-row :gutter="16">
            <a-col :span="8" class="feature-item">
              <h3>零码设计</h3>
              <ul>
                <li>
                  <a
                    href="https://github.com/qweijiaq/design-fe"
                    target="_blank"
                    >B端仓库</a
                  >
                </li>
                <li>
                  <a
                    href="https://github.com/qweijiaq/design-h5"
                    target="_blank"
                    >C端仓库</a
                  >
                </li>
                <li>
                  <a
                    href="https://github.com/qweijiaq/design-server"
                    target="_blank"
                    >服务端仓库</a
                  >
                </li>
                <li>
                  <a href="" target="_blank">后台仓库</a>
                </li>
              </ul>
            </a-col>
            <a-col :span="8" class="feature-item">
              <h3>作者友链</h3>
              <ul>
                <li>
                  <a href="https://blog.wei-jia.top" target="_blank">博客</a>
                </li>
                <li>
                  <a href="" target="_blank">知识库</a>
                </li>
                <li>
                  <a href="http://image.wei-jia.top" target="_blank">拾光者</a>
                </li>
                <li>
                  <a href="" target="_blank">在线教育平台</a>
                </li>
              </ul>
            </a-col>
            <a-col :span="8" class="feature-item">
              <h3>推广外链</h3>
              <ul>
                <li>
                  <a href="https://github.com/qweijiaq" target="_blank"
                    >GitHub</a
                  >
                </li>
                <li>
                  <a href="https://woniu.blog.csdn.net/" target="_blank"
                    >CSDN</a
                  >
                </li>
                <li>
                  <a href="" target="_blank">掘金社区</a>
                </li>
              </ul>
            </a-col>
          </a-row>
        </div>
        <ul class="list-inline mb-0" :class="{ 'extra-margin': !isHomePage }">
          <li class="list-inline-item">
            © Pony Wei 版权所有 |
            <a
              href="https://beian.miit.gov.cn/#/Integrated/index"
              target="_blank"
              >皖ICP备2022012261号-2</a
            >
          </li>
        </ul>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "vuex"
import { computed } from "vue"
import { useRoute } from "vue-router"
import UserProfile from "../components/UserProfile.vue"
import showError from "../hooks/useShowError"

import type { GlobalDataProps } from "../store/index"

const store = useStore<GlobalDataProps>()
const route = useRoute()
// 是否是首页
const isHomePage = computed(() => route.name === "Home")
// 用户信息
const userInfo = computed(() => store.state.user)
// 加载中
const loading = computed(() => store.state.status.loading)

// 如果加载首页时出现错误，则需要展示错误信息
showError()
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ant-layout-header {
  z-index: 50;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
}
.transparent-header {
  background-color: rgba(0, 0, 0, 0.2);
}
.home-layout {
  position: relative;
  top: -70px;
}
.editor-spinner {
  position: fixed;
  right: 50%;
  top: 10px;
  z-index: 100;
}
.header .logo-img {
  height: 35px;
}
.header .ant-input-search {
  width: 250px;
}
.right-col > * {
  margin-left: 30px !important;
}
.banner {
  display: flex;
  position: relative;
  height: 192px;
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
}
.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.text-headline {
  text-shadow: 0 0 1px rgba(68, 92, 116, 0.02), 0 2px 8px rgba(57, 76, 96, 0.1);
  font-size: 3rem;
}
.text-link {
  color: #ffffff;
}
.text-link:hover {
  color: #ffffff;
  text-decoration: underline;
}
.poster-item {
  position: relative;
  margin-bottom: 20px;
}
.list-inline {
  list-style: none;
  display: flex;
  justify-content: center;
  padding: 0;
  margin: 0;
  padding-top: 24px;
  border-top: 1px solid #4d4d4d;
}
.list-inline li {
  margin-right: 20px;
}
.extra-margin {
  margin-top: 70px;
}
.ant-layout-footer {
  background: #686666;
  color: #2f2f2f;
}
.footer-info {
  max-width: 1200px;
  margin: 0 auto;
}
.footer-info .feature-item {
  text-align: left;
}
.footer-info .feature-item h3 {
  color: #fff;
  font-size: 19px;
}
.footer-info .feature-item ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.footer-info .feature-item li {
  height: 35px;
  line-height: 35px;
}
.footer-info .feature-item a {
  color: #b2aeae;
}
</style>
