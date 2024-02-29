import { createStore, Commit } from "vuex"
import axios, { AxiosRequestConfig } from "axios"
import editor, { EditProps } from "./editor"
import user, { UserProps } from "./user"
import works, { WorksProp } from "./works"

// GlobalStatus 全局状态
export interface GlobalStatus {
  // 加载中 true false
  loading: boolean
  // 错误
  error: any
  // 操作的名称，如
  // 登录 -> login
  // 获取验证码 -> getCode
  opName?: string
}

// 全局 Props
export interface GlobalDataProps {
  // user props
  user: UserProps
  // 全局状态
  status: GlobalStatus
  // editor props
  editor: EditProps
  // works props
  works: WorksProp
}

// ICustomAxiosConfig 自定义 axios config
export type ICustomAxiosConfig = AxiosRequestConfig & {
  // mutation name, 通常作为 opName
  mutationName: string
}

// 异步请求接口后提交
export const asyncAndCommit = async (
  url: string, // 接口 URL
  mutationName: string, // mutation name
  commit: Commit, // 固定为 commit
  config: AxiosRequestConfig = { method: "get" }, // 请求方式配置
  extraData?: any // 额外数据
) => {
  const newConfig: ICustomAxiosConfig = { ...config, mutationName }
  const { data } = await axios(url, newConfig)
  if (extraData) {
    commit(mutationName, { data, extraData })
  } else {
    commit(mutationName, data)
  }
  return data
}

export default createStore<GlobalDataProps>({
  state: {
    user: {} as UserProps,
    status: {
      loading: false,
      error: { status: false, message: "" },
      opName: "",
    },
    editor: {} as EditProps,
    works: {} as WorksProp,
  },
  mutations: {
    setLoading(state, { status, opName }) {
      state.status.loading = status
      if (opName) {
        state.status.opName = opName
      }
    },
    setError(state, err) {
      state.status.error = err
    },
  },
  modules: {
    editor,
    user,
    works,
  },
})
