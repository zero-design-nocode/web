<template>
  <div class="props-table">
    <li
      v-for="(value, key) in finalProps"
      :key="key"
      class="prop-item"
      :class="{ 'no-text': !value.text, 'hide-item': value.isHidden }"
      :id="`item-${value.key}`"
    >
      <span class="label" v-if="value.text">{{ value.text }}:</span>
      <div :class="`prop-component component-${value.component}`">
        <component
          v-if="!value.options"
          :is="stringToComponent(value.component)"
          v-bind="value.extraProps"
          :[value.valueProp]="value.value"
          v-on="value.events"
        />
        <component
          v-else
          :is="stringToComponent(value.component)"
          v-bind="value.extraProps"
          :[value.valueProp]="value.value"
          v-on="value.events"
        >
          <template v-if="value.subComponent === 'a-radio-button'">
            <a-radio-button
              v-for="(option, k) in value.options"
              :key="k"
              :value="option.value"
            >
              <render-vnode :vNode="option.text"></render-vnode>
            </a-radio-button>
          </template>
          <component
            :is="stringToComponent(value.component)"
            v-for="(option, k) in value.options"
            :key="k"
            :value="option.value"
          >
            <render-vnode :vNode="option.text"></render-vnode>
          </component>
        </component>
      </div>
    </li>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { useStore } from "vuex"
import { map } from "lodash-es"
import maps from "../propsMap"
import RenderVnode from "@/components/RenderVnode"
import { stringToComponent } from "@/plugins/stringToComponent"

const props = defineProps({
  props: {
    type: Object,
    required: true,
  },
  mutationName: {
    type: String,
    default: "updateComponent",
  },
  mutationExtraData: {
    type: Object,
  },
})

const emits = defineEmits(["updated"])

const { commit } = useStore()
const handleCommit = (data: any) => {
  const finalData = props.mutationExtraData
    ? { ...data, ...props.mutationExtraData }
    : data
  commit(props.mutationName, finalData)
}
const finalProps = computed(() => {
  return map(props.props, (value, key) => {
    const {
      component,
      intialTransform,
      afterTransform,
      eventName,
      text,
      valueProp,
      options,
      subComponent,
      extraProps = {},
      parent,
      extraEvent,
    } = maps[key]
    let isHidden = false
    if (parent) {
      isHidden = !props.props[parent]
    }
    return {
      key,
      component,
      text,
      valueProp,
      isHidden,
      value: intialTransform(value),
      extraProps,
      events: {
        [eventName]: (e: any) => {
          handleCommit({ value: afterTransform(e), key })
        },
        ...(extraEvent && {
          [extraEvent]: (data: any) => {
            emits("updated", { data, key })
          },
        }),
      },
      options,
      subComponent,
    }
  })
})
</script>

<style>
.prop-item {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}
.hide-item {
  display: none;
}
.label {
  width: 28%;
}
.prop-item.no-text {
  display: inline-block;
  margin: 0 10px 0 0;
}
#item-fontWeight {
  margin-left: 28%;
}
.prop-component {
  width: 70%;
}
/* .component-a-slider {
  width: 80%;
} */
.component-a-select .ant-select {
  width: 150px;
}
.prop-component.component-shadow-picker,
.prop-component.component-image-processer,
.prop-component.component-background-processer {
  width: 100%;
}
#item-backgroundImage {
  width: 100%;
  cursor: pointer;
  margin-bottom: 15px;
}
#item-backgroundImage .styled-upload-component .uploader-container {
  min-height: 200px;
}
</style>
