import { Module } from "vuex"
import { v4 as uuidv4 } from "uuid"
import { cloneDeep, isUndefined } from "lodash-es"
import { GlobalDataProps, asyncAndCommit } from "./index"
import { insertAt } from "../helper"
import { MoveDirection } from "../plugins/dataOperations"

// ComponentData 组件的数据
export interface ComponentData {
  // props
  props: { [key: string]: any }
  // 组件 id
  id: string
  // 组件名
  name: string
  // 对应的图层名称
  layerName?: string
  // 是否隐藏
  isHidden?: boolean
  // 是否锁定
  isLocked?: boolean
}

// PageData 作品数据
export interface PageData {
  // props
  props: { [key: string]: any }
  // 设置
  setting: { [key: string]: any }
  // id
  id?: number
  // 标题
  title?: string
  // 描述
  desc?: string
  // 封面图
  coverImg?: string
  // uuid
  uuid?: string
  // 最后发布时间
  latestPublishAt?: string
  // 更新时间
  updatedAt?: string
  // 是否为模板
  isTemplate?: boolean
  // 是否有 Hot 标签
  isHot?: boolean
  // 是否有 New 标签
  isNew?: boolean
  // 作者
  author?: string
  // 被复用的次数
  copiedCount?: number
  // 状态 - 0 删除 ｜ 1 未发布 ｜ 2 发布 ｜ 3 强制下线
  status?: string
  // 对应的作者信息
  user?: {
    // 性别
    gender: string
    // 昵称
    nickName: string
    // 头像
    picture: string
    // 用户名 - 手机号码
    userName: string
  }
}

// 渠道的 props
export interface ChannelProps {
  // id
  id: number
  // 渠道名
  name: string
  // 对应的作品 id
  workId: number
}

// HistoryProps 历史 props - 主要用于撤销重做
export interface HistoryProps {
  id: string
  componentId?: string
  type: "add" | "delete" | "modify"
  data: any
  index?: number
}

// 编辑时的 props
export interface EditProps {
  // 页面所有组件
  components: ComponentData[]
  // 当前被选中的组件 id
  currentElement: string
  // 当前正在 inline editing 的组件
  currentEditing: string
  // 当前数据已经被修改
  isDirty: boolean
  // 当前模版是否修改但未发布
  isChangedNotPublished: boolean
  // 当前被复制的组件
  copiedComponent?: ComponentData
  // 当前 work 的数据
  page: PageData
  // 当前 work 的 channels
  channels: ChannelProps[]
  // 当前操作的历史记录
  histories: HistoryProps[]
  // 当前历史记录的操作位置
  historyIndex: number
}

// 作品默认的一些 props
const pageDefaultProps = {
  // 背景色
  backgroundColor: "#ffffff",
  // 背景图片
  backgroundImage: "",
  // 背景图片的重复方式
  backgroundRepeat: "no-repeat",
  // 背景图片的尺寸
  backgroundSize: "cover",
  // 编辑画布的高度
  height: "560px",
}

// 历史操作数组的最大长度
const maxHistoryNumber = 20

// pushHistory 将当前的操作推入到历史操作数组中
const pushHistory = (state: EditProps, historyRecord: HistoryProps) => {
  // 检查是否已经移动了 historyIndex
  if (state.historyIndex !== -1) {
    // 如果已经移动，需要删除所有索引大于当前索引的记录
    state.histories = state.histories.slice(0, state.historyIndex)
    // 将 historyIndex 移动到最后 -1 的位置
    state.historyIndex = -1
  }
  // 如果 histories 数组长度小于最大数量，直接将记录推入数组末尾
  if (state.histories.length < maxHistoryNumber) {
    state.histories.push(historyRecord)
  } else {
    // 如果 histories 数组长度大于等于最大数量
    // 1. 移除第一个记录
    // 2. 将新的记录推入数组末尾
    state.histories.shift()
    state.histories.push(historyRecord)
  }
}

/**
 * modifyHistory 执行撤销（undo）或重做（redo）操作时修改编辑历史记录
 * @param {EditProps} state 包含编辑器状态的对象
 * @param {HistoryProps} history 包含编辑历史记录信息的对象
 * @param {"undo" | "redo"} type 操作类型，"undo" 表示撤销，"redo" 表示重做
 *
 * 1. 解构 history 对象，获取其中的 componentId、data 对象，以及 data 对象中的 key、oldValue、newValue
 * 2. 如果 componentId 不存在（或为 falsy 值），说明是对页面设置的修改，直接更新页面的属性值
 * 3. 如果 componentId 存在，说明是对组件的修改，找到对应的组件。根据 key 的类型不同，进行不同的处理：
 *   3.1 如果 key 是数组，表示要修改多个属性，遍历数组中的每个键名，在组件中更新相应的属性值
 *   3.2 如果 key 不是数组，直接在组件中更新对应的属性值
 */
const modifyHistory = (
  state: EditProps,
  history: HistoryProps,
  type: "undo" | "redo"
) => {
  const { componentId, data } = history
  const { key, oldValue, newValue } = data
  // componentId 不存在（或为 falsy 值）时，表示不是对画布中组件的修改
  if (!componentId) {
    state.page.props[key] = type === "undo" ? oldValue : newValue
  } else {
    const updatedComponent = state.components.find(
      (component) => component.id === componentId
    ) as any
    if (Array.isArray(key)) {
      key.forEach((keyName: string, index) => {
        updatedComponent.props[keyName] =
          type === "undo" ? oldValue[index] : newValue[index]
      })
    } else {
      updatedComponent.props[key] = type === "undo" ? oldValue : newValue
    }
  }
}

let globalTimeout: any = 0
let cachedOldValue: any

/**
 * debounceChange 防抖
 * @param {any} cachedValue 表示传入的值，用于判断是否发生变化
 * @param {() => void} callback 表示要执行的回调函数，当防抖时间间隔内没有新的值传入时，会调用该回调函数
 * @param {Number} timeout 表示防抖的时间间隔，默认为 1000 毫秒（1秒）
 *
 * 1. 如果存在全局定时器 globalTimeout，则清除它，以确保只有一个定时器在运行
 * 2. 如果缓存的旧值 cachedOldValue 未定义（或为 falsy 值），将当前值 cachedValue 设置为旧值
 * 3. 设置新的全局定时器，定时器到期后执行传入的回调函数 callback
 * 4. 在定时器到期时，重置全局定时器和缓存的旧值
 */
const debounceChange = (
  cachedValue: any,
  callback: () => void,
  timeout = 1000
) => {
  if (globalTimeout) {
    clearTimeout(globalTimeout)
  }
  if (isUndefined(cachedOldValue)) {
    cachedOldValue = cachedValue
  }
  globalTimeout = setTimeout(() => {
    callback()
    globalTimeout = 0
    cachedOldValue = undefined
  }, timeout)
}

// editor module
const editorModule: Module<EditProps, GlobalDataProps> = {
  state: {
    // 组件列表
    components: [],
    // 当前被选中的组件 id
    currentElement: "",
    // 当前正在 inline editing 的组件
    currentEditing: "",
    // 编辑器是否处于脏状态，即是否有未保存的修改
    isDirty: false,
    // 编辑器是否有未发布的更改
    isChangedNotPublished: false,
    // 页面（当前作品在编辑的状态时）的属性和设置
    page: { props: pageDefaultProps, setting: {} },
    // 渠道列表
    channels: [],
    // 操作历史记录
    histories: [],
    // 当前历史记录的索引
    historyIndex: -1,
  },
  mutations: {
    // 重置编辑器状态
    resetEditor(state) {
      state.page = { props: pageDefaultProps, setting: {} }
      state.components = []
      state.histories = []
      state.isDirty = false
      state.isChangedNotPublished = false
    },

    // 向编辑器中添加组件
    addComponentToEditor(state, component) {
      component.id = uuidv4()
      component.layerName = "图层" + (state.components.length + 1)
      state.components.push(component)
      pushHistory(state, {
        id: uuidv4(),
        componentId: component.id,
        type: "add",
        data: cloneDeep(component),
      })
      state.isDirty = true
      state.isChangedNotPublished = true
    },

    // 执行撤销操作
    undo(state) {
      // 如果之前没有执行过undo操作
      if (state.historyIndex === -1) {
        // 撤销到 histories 数组的最后一项
        state.historyIndex = state.histories.length - 1
      } else {
        // 撤销到前一步
        state.historyIndex--
      }
      // 获取历史记录
      const history = state.histories[state.historyIndex]
      // 处理历史记录的数据
      switch (history.type) {
        case "add":
          // 如果之前添加了一个组件，则现在应该将其移除
          state.components = state.components.filter(
            (component) => component.id !== history.componentId
          )
          break
        case "delete":
          // 如果之前删除了一个组件，则现在应该将其还原到正确的位置
          state.components = insertAt(
            state.components,
            history.index as number,
            history.data
          )
          break
        case "modify": {
          // 如果之前修改了一个组件，则调用 modifyHistory 函数处理 undo 操作
          modifyHistory(state, history, "undo")
          break
        }
        default:
          break
      }
    },

    // 执行重做操作
    redo(state) {
      // 如果 historyIndex 是最后一项或者从未移动过，不能进行重做操作
      if (state.historyIndex === -1) {
        return
      }
      // 获取历史记录
      const history = state.histories[state.historyIndex]
      // 处理历史记录的数据
      switch (history.type) {
        case "add":
          // 如果之前添加了一个组件，现在应该将其重新添加到 components 数组中
          // state.components.push(history.data)
          // 或者使用 insertAt 函数插入到指定位置
          state.components = insertAt(
            state.components,
            history.index as number,
            history.data
          )
          break
        case "delete":
          // 如果之前删除了一个组件，现在应该将其从 components 数组中移除
          state.components = state.components.filter(
            (component) => component.id !== history.componentId
          )
          break
        case "modify":
          // 如果之前修改了一个组件，调用 modifyHistory 函数处理重做操作
          modifyHistory(state, history, "redo")
          break
        default:
          break
      }
      // 将 state.historyIndex 递增，表示执行了一步重做操作
      state.historyIndex++
    },

    // 设置当前选中的组件
    setActive(state, id) {
      state.currentElement = id
    },

    // 设置当前正在编辑的组件
    setEditing(state, id) {
      state.currentEditing = id
    },

    // 更新页面的属性或设置
    updatePage(state, { key, value, level }) {
      const pageData = state.page as { [key: string]: any }
      // 如果有指定 level（层级），表示要更新的是某个层级的属性
      if (level) {
        // 如果层级是 "props"，表示要更新页面的 props 属性
        if (level === "props") {
          const oldValue = pageData[level][key]
          debounceChange(oldValue, () => {
            pushHistory(state, {
              id: uuidv4(),
              type: "modify",
              data: { oldValue: cachedOldValue, newValue: value, key },
            })
          })
        }
        pageData[level][key] = value
      } else {
        pageData[key] = value
      }
      state.isDirty = true
      state.isChangedNotPublished = true
    },

    // 移动组件
    moveComponent(state, data: { direction: MoveDirection; amount: number }) {
      // 获取当前被选中的组件对象
      const updatedComponent = state.components.find(
        (component) => component.id === state.currentElement
      )
      if (updatedComponent) {
        const store = this as any
        const oldTop = parseInt(updatedComponent.props.top)
        const oldLeft = parseInt(updatedComponent.props.left)
        const { direction, amount } = data
        // 根据移动方向执行相应操作
        switch (direction) {
          case "Up": {
            const newValue = oldTop - amount + "px"
            // 调用 updateComponent mutation 更新组件的 top 属性
            store.commit("updateComponent", {
              key: "top",
              value: newValue,
              isProps: true,
            })
            break
          }
          case "Down": {
            const newValue = oldTop + amount + "px"
            // 调用 updateComponent mutation 更新组件的 top 属性
            store.commit("updateComponent", {
              key: "top",
              value: newValue,
              isProps: true,
            })
            break
          }
          case "Left": {
            const newValue = oldLeft - amount + "px"
            // 调用 updateComponent mutation 更新组件的 left 属性
            store.commit("updateComponent", {
              key: "left",
              value: newValue,
              isProps: true,
            })
            break
          }
          case "Right": {
            const newValue = oldLeft + amount + "px"
            // 调用 updateComponent mutation 更新组件的 left 属性
            store.commit("updateComponent", {
              key: "left",
              value: newValue,
              isProps: true,
            })
            break
          }
          default:
            break
        }
      }
    },

    // 更新组件的属性
    updateComponent(state, { id, key, value, isProps }) {
      // 获取当前被选中的组件对象
      const updatedComponent = state.components.find(
        (component) => component.id === (id || state.currentElement)
      ) as any
      if (updatedComponent) {
        if (isProps) {
          // 如果更新的是组件的 props 属性
          const oldValue = Array.isArray(key)
            ? key.map((key: string) => updatedComponent.props[key])
            : updatedComponent.props[key]

          // 使用 debounceChange 函数进行防抖处理
          debounceChange(oldValue, () => {
            // 在属性更新后，调用 pushHistory 添加历史记录
            pushHistory(state, {
              id: uuidv4(),
              componentId: id || state.currentElement,
              type: "modify",
              data: { oldValue: cachedOldValue, newValue: value, key },
            })
          })
          // 根据属性的类型进行更新
          if (Array.isArray(key)) {
            // 如果更新的属性是数组类型
            key.forEach((keyName: string, index) => {
              updatedComponent.props[keyName] = value[index]
            })
          } else {
            // 更新单一属性
            updatedComponent.props[key] = value
          }
        } else {
          // 如果更新的是组件的非 props 属性
          updatedComponent[key] = value
        }
        state.isDirty = true
        state.isChangedNotPublished = true
      }
    },

    // 复制组件
    copyComponent(state, index) {
      // 获取当前组件
      const currentComponent = state.components.find(
        (component) => component.id === index
      )
      if (currentComponent) {
        state.copiedComponent = currentComponent
      }
    },

    // 粘贴复制的组件
    pasteCopiedComponent(state) {
      if (state.copiedComponent) {
        const clone = cloneDeep(state.copiedComponent)
        clone.id = uuidv4()
        clone.layerName = clone.layerName + "副本"
        state.components.push(clone)
        state.isDirty = true
        state.isChangedNotPublished = true
        // 粘贴复制的组件，相当于做了一次 add 操作
        pushHistory(state, {
          id: uuidv4(),
          componentId: clone.id,
          type: "add",
          data: cloneDeep(clone),
        })
      }
    },

    // 删除组件
    deleteComponent(state, id) {
      // 查找当前组件和其索引
      const componentData = state.components.find(
        (component) => component.id === id
      ) as ComponentData
      const componentIndex = state.components.findIndex(
        (component) => component.id === id
      )
      // 从组件数组中移除当前组件
      state.components = state.components.filter(
        (component) => component.id !== id
      )
      // 添加删除组件的历史记录
      pushHistory(state, {
        id: uuidv4(),
        componentId: componentData.id,
        type: "delete",
        data: componentData,
        index: componentIndex,
      })
      state.isDirty = true
      state.isChangedNotPublished = true
    },

    // 获取作品 -- 主要完成的事点击「编辑作品」进入编辑器页面时的信息转变
    // 作品的信息 -> 作品（编辑时）对应编辑器页面信息
    getWork(state, { data }) {
      // 解构 data 对象，提取其中的 content 和其余数据
      const { content, ...rest } = data
      // 将获取的页面设置与编辑器当前页面状态合并
      state.page = { ...state.page, ...rest }
      // 如果 content 中包含 props，将其与编辑器当前页面的 props 合并
      if (content.props) {
        state.page.props = { ...state.page.props, ...content.props }
      }
      // 如果 content 中包含 setting，将其与编辑器当前页面的 setting 合并
      if (content.setting) {
        state.page.setting = { ...state.page.setting, ...content.setting }
      }
      // 更新编辑器当前的组件列表为从服务器获取的组件列表
      state.components = content.components
    },

    // 获取渠道
    getChannels(state, { data }) {
      state.channels = data.list
    },

    // 创建渠道
    createChannel(state, { data }) {
      state.channels = [...state.channels, data]
    },

    // 删除渠道
    deleteChannel(state, { extraData }) {
      state.channels = state.channels.filter(
        (channel) => channel.id !== extraData.id
      )
    },

    // 保存作品
    saveWork(state) {
      state.isDirty = false
      // 修改更新时间
      state.page.updatedAt = new Date().toISOString()
    },

    // 复制作品
    copyWork(state) {
      // 修改更新时间
      state.page.updatedAt = new Date().toISOString()
    },

    // 发布作品
    publishWork(state) {
      state.isChangedNotPublished = false
      // 修改更新时间
      state.page.latestPublishAt = new Date().toISOString()
    },

    // 发布模板
    publishTemplate(state) {
      state.page.isTemplate = true
    },
  },
  actions: {
    // 异步获取作品信息
    getWork({ commit }, id) {
      return asyncAndCommit(`/works/${id}`, "getWork", commit)
    },

    // 异步获取渠道列表
    getChannels({ commit }, id) {
      return asyncAndCommit(
        `/channel/getWorkChannels/${id}`,
        "getChannels",
        commit
      )
    },

    // 异步创建渠道
    createChannel({ commit }, payload) {
      return asyncAndCommit("/channel", "createChannel", commit, {
        method: "post",
        data: payload,
      })
    },

    // 异步删除渠道
    deleteChannel({ commit }, id) {
      return asyncAndCommit(
        `channel/${id}`,
        "deleteChannel",
        commit,
        { method: "delete" },
        { id }
      )
    },

    // 异步保存作品
    saveWork({ commit, state }, payload) {
      const { id, data } = payload
      if (data) {
        return
      } else {
        // save current work
        const { title, desc, props, coverImg, setting } = state.page
        const postData = {
          title,
          desc,
          coverImg,
          content: {
            components: state.components,
            props,
            setting,
          },
        }
        return asyncAndCommit(`/works/${id}`, "saveWork", commit, {
          method: "patch",
          data: postData,
        })
      }
    },

    // 异步复制作品
    copyWork({ commit }, id) {
      return asyncAndCommit(`/works/copy/${id}`, "copyWork", commit, {
        method: "post",
      })
    },

    // 异步发布作品
    publishWork({ commit }, id) {
      return asyncAndCommit(`/works/publish/${id}`, "publishWork", commit, {
        method: "post",
      })
    },

    // 异步发布模板
    publishTemplate({ commit }, id) {
      return asyncAndCommit(
        `/works/publish-template/${id}`,
        "publishTemplate",
        commit,
        { method: "post" }
      )
    },

    // 保存并发布作品
    saveAndPublishWork({ dispatch, state }, payload) {
      const { id } = state.page
      return dispatch("saveWork", payload)
        .then(() => dispatch("publishWork", id))
        .then(() => dispatch("getChannels", id))
        .then(() => {
          if (state.channels.length === 0) {
            return dispatch("createChannel", { name: "默认", workId: id })
          } else {
            return Promise.resolve({})
          }
        })
    },
  },
  getters: {
    // 获取当前选中的组件
    getCurrentElement: (state) => {
      return state.components.find(
        (component) => component.id === state.currentElement
      )
    },

    // 检查是否可以执行撤销操作
    checkUndoDisable: (state) => {
      // 如果历史记录为空或已经移动到第一项，则返回 true 表示应该禁用“撤销”操作按钮
      if (state.histories.length === 0 || state.historyIndex === 0) {
        return true
      }
      // 否则，返回 false 表示不应该禁用“撤销”操作按钮
      return false
    },

    // 检查是否可以执行重做操作
    checkRedoDisable: (state) => {
      // 1 没有历史记录项
      // 2 已经移动到最后一项
      // 3 之前从未执行过“撤销”操作
      if (
        state.histories.length === 0 ||
        state.historyIndex === state.histories.length ||
        state.historyIndex === -1
      ) {
        return true
      }
      // 否则，返回 false 表示不应该禁用“重做”操作按钮
      return false
    },
  },
}

export default editorModule
