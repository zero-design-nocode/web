import { useStore } from "vuex"
import { computed } from "vue"
import { useRouter } from "vue-router"
import { GlobalDataProps } from "../store/index"

function useCreateDesign() {
  const store = useStore<GlobalDataProps>()
  const router = useRouter()
  const userInfo = computed(() => store.state.user)
  // 创建一个空项目
  const createDesign = () => {
    if (userInfo.value.isLogin) {
      const payload = {
        title: "未命名作品",
        desc: "未命名作品",
        coverImg:
          "https://qiniu.wei-jia.top/%E7%94%9F%E6%88%90%E7%9A%84%E8%AE%BE%E8%AE%A1.jpeg",
      }
      store.dispatch("createWork", payload).then(({ data }) => {
        router.push(`/editor/${data.id}`)
      })
    } else {
      router.push("/login")
    }
  }
  return createDesign
}

export default useCreateDesign
