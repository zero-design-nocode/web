import { Module } from "vuex"
import { GlobalDataProps, asyncAndCommit } from "./index"
import { PageData } from "./editor"
import { objToQueryString } from "../helper"
import { baseStaticURL } from "../main"
export type WorkProp = Required<Omit<PageData, "props" | "setting">> & {
  barcodeUrl?: string
}

// 统计数据
export interface StaticProps {
  // 事件日期
  eventDate: string
  // 事件的数据，包含一个属性 pv
  eventData: { pv: number }
  // 事件关键字
  eventKey: string
  // 唯一标识符
  _id: string
}

export interface WorksProp {
  // 模板作品
  templates: WorkProp[]
  // 作品
  works: WorkProp[]
  // 统计数据
  statics: { id: number; name: string; list: StaticProps[] }[]
  // 作品总数
  totalWorks: number
  // 模板总数
  totalTemplates: number
  // 搜索文本
  searchText: string
}

const workModule: Module<WorksProp, GlobalDataProps> = {
  state: {
    templates: [],
    works: [],
    totalWorks: 0,
    statics: [],
    totalTemplates: 0,
    searchText: "",
  },
  mutations: {
    // 从服务器获取的数据更新 Vuex 的 state，以便在应用中展示模板作品列表
    // state 当前模块的状态 ｜ data 从服务器获取的响应数据 ｜ extraData 额外的数据
    fetchTemplates(state, { data, extraData }) {
      const { pageIndex, searchText } = extraData
      // list 模板作品数组 | count 总数
      const { list, count } = data.data
      if (pageIndex === 0) {
        // 如果是第一页，直接将 state.templates 设置为服务器返回的 list
        state.templates = list
      } else {
        // 否则，将服务器返回的 list 追加到 state.templates 中
        state.templates = [...state.templates, ...list]
      }
      // 更新 state.totalTemplates 为服务器返回的总数
      state.totalTemplates = count
      state.searchText = searchText || ""
    },

    // 根据从服务器获取的数据更新 Vuex 的 state，以便在应用中展示单个模板作品的详细信息
    // data 从服务器获取的响应数据
    fetchTemplate(state, { data }) {
      state.templates = [data]
    },

    // 从服务器获取的数据更新 Vuex 的 state，以便在应用中展示作品列表
    // state 当前模块的状态 ｜ data 从服务器获取的响应数据 ｜ extraData 额外的数据
    fetchWorks(state, { data, extraData }) {
      // searchText 可以通过搜索框进行过滤
      const { pageIndex, searchText } = extraData
      const { list, count } = data.data
      if (pageIndex === 0) {
        // 如果是第一页，直接将 state.works 设置为服务器返回的 list
        state.works = list
      } else {
        // 否则，将服务器返回的 list 追加到 state.works 中
        state.works = [...state.works, ...list]
      }
      state.totalWorks = count
      state.searchText = searchText || ""
    },

    // 创建作品
    createWork(state, { data }) {
      state.works.unshift(data)
    },

    // 删除作品
    deleteWork(state, { extraData }) {
      state.works = state.works.filter((work) => work.id !== extraData.id)
    },

    // 恢复作品
    recoverWork(state, { extraData }) {
      state.works = state.works.filter((work) => work.id !== extraData.id)
    },

    // 转增作品
    transferWork(state, { data, extraData }) {
      if (data.errno === 0) {
        state.works = state.works.filter((work) => work.id !== extraData.id)
      }
    },

    // 根据从服务器获取的数据更新 Vuex 的 state，以便在应用中展示作品的统计数据
    fetchStatic(state, { data, extraData }) {
      const list = data.data
      const { name, id } = extraData
      state.statics.push({ name, id, list })
    },

    // 清空统计列表
    clearStatic(state) {
      state.statics = []
    },
  },
  actions: {
    fetchTemplates(
      { commit },
      // 默认一次展示 8 个模板
      queryObj = { pageIndex: 0, pageSize: 8, title: "" }
    ) {
      if (!queryObj.title) {
        delete queryObj.title
      }
      const queryString = objToQueryString(queryObj)
      return asyncAndCommit(
        `/templates?${queryString}`,
        "fetchTemplates",
        commit,
        { method: "get" },
        { pageIndex: queryObj.pageIndex, searchText: queryObj.title }
      )
    },

    fetchTemplate({ commit }, id) {
      return asyncAndCommit(`/templates/${id}`, "fetchTemplate", commit)
    },

    fetchWorks(
      { commit },
      queryObj = { pageIndex: 0, pageSize: 8, title: "" }
    ) {
      if (!queryObj.title) {
        delete queryObj.title
      }
      const queryString = objToQueryString(queryObj)
      return asyncAndCommit(
        `/works?${queryString}`,
        "fetchWorks",
        commit,
        { method: "get" },
        { pageIndex: queryObj.pageIndex, searchText: queryObj.title }
      )
    },

    deleteWork({ commit }, id) {
      return asyncAndCommit(
        `/works/${id}`,
        "deleteWork",
        commit,
        { method: "delete" },
        { id }
      )
    },

    createWork({ commit }, payload: WorkProp) {
      return asyncAndCommit("/works", "createWork", commit, {
        method: "post",
        data: payload,
      })
    },

    fetchStatic({ commit }, queryObj) {
      const newObj = { category: "h5", action: "pv", ...queryObj }
      const queryString = objToQueryString(newObj)
      return asyncAndCommit(
        `${baseStaticURL}/api/event?${queryString}`,
        "fetchStatic",
        commit,
        { method: "get" },
        { name: queryObj.name, id: queryObj.label }
      )
    },

    recoverWork({ commit }, id) {
      return asyncAndCommit(
        `/works/put-back/${id}`,
        "recoverWork",
        commit,
        { method: "post" },
        { id }
      )
    },

    transferWork({ commit }, { id, username }) {
      return asyncAndCommit(
        `/works/transfer/${id}/${username}`,
        "transferWork",
        commit,
        { method: "post" },
        { id }
      )
    },
  },

  getters: {
    // 获取当前模板
    getCurrentTemplate: (state) => (id: string) => {
      return state.templates.find((template) => template.id === parseInt(id))
    },
  },
}

export default workModule
