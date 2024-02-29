import { Module } from "vuex"
import axios from "axios"
import { GlobalDataProps, asyncAndCommit } from "./index"

export interface UserDataProps {
  // 用户名 = 手机号码
  username?: string
  // id
  id?: string
  // 手机号码
  phoneNumber?: string
  // 昵称
  nickName?: string
  // 描述
  description?: string
  // 创建时间
  updatedAt?: string
  // 更新时间
  createdAt?: string
  // JWT 的签发时间
  iat?: number
  // JWT 的过期时间
  exp?: number
  // 头像
  picture?: string
  // 性别
  gender?: string
}

export interface UserProps {
  // 是否登录
  isLogin: boolean
  // token
  token: string
  // data
  data: UserDataProps
}

const userModule: Module<UserProps, GlobalDataProps> = {
  state: {
    token: localStorage.getItem("token") || "",
    isLogin: false,
    data: {},
  },
  mutations: {
    // 在用户登录后更新应用状态中的用户信息和登录状态
    fetchCurrentUser(state, rawData) {
      state.isLogin = true
      state.data = { ...rawData.data }
    },

    // 更新用户
    updateUser(state, { data, extraData }) {
      const { token } = data.data
      state.data = { ...state.data, ...extraData }
      state.token = token
      localStorage.setItem("token", token)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    // 登录
    login(state, rawData) {
      const { token } = rawData.data
      state.token = token
      localStorage.setItem("token", token)
      // 设置 Axios 请求的公共头部，包括身份验证令牌，以确保在后续请求中使用正确的身份验证信息
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    // 退出登录
    logout(state) {
      state.token = ""
      state.isLogin = false
      localStorage.removeItem("token")
      // 删除 Axios 请求公共头部的 Authorization
      delete axios.defaults.headers.common.Authorization
    },
  },
  actions: {
    fetchCurrentUser({ commit }) {
      return asyncAndCommit("/users/getUserInfo", "fetchCurrentUser", commit)
    },

    login({ commit }, payload) {
      return asyncAndCommit("/users/loginByPhoneNumber", "login", commit, {
        method: "post",
        data: payload,
      })
    },

    // 登录后更新用户信息和登录状态
    loginAndFetch({ dispatch }, loginData) {
      return dispatch("login", loginData).then(() => {
        return dispatch("fetchCurrentUser")
      })
    },

    updateUser({ commit }, payload) {
      return asyncAndCommit(
        "/users/updateUserInfo",
        "updateUser",
        commit,
        { method: "patch", data: payload },
        payload
      )
    },

    // 更新用户后更新用户信息和登录状态
    updateUserAndFetch({ dispatch }, payload) {
      return dispatch("updateUser", payload).then(() => {
        return dispatch("fetchCurrentUser")
      })
    },
  },
}

export default userModule
