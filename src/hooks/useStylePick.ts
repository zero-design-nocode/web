import { pick, without } from "lodash-es"
import { computed } from "vue"
import { textDefaultProps } from "../defaultProps"

// 将非样式属性剔除出去，得到默认的纯样式属性
export const defaultStyles = without(
  Object.keys(textDefaultProps),
  "actionType",
  "url",
  "text"
)

// useStylePick 该钩子函数专门从 props 中得到（指定或者默认的）样式 props
const useStylePick = (props: Readonly<any>, pickStyles = defaultStyles) => {
  return computed(() => pick(props, pickStyles))
}

export default useStylePick
