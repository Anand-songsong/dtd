<template>
    <view @touchmove.stop.prevent="()=>{}">
      <uni-datetime-picker :type="type" v-model="date" @change="onDateChange" :end="asToday ? new Date().getTime() : ''">
        <slot></slot>
      </uni-datetime-picker>
     </view>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
    type: {
        type: String,
        default: 'date'
    },
    asToday: {
        type: Boolean,
        default: false
    },
    date: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['change'])
//v-model与父组件传入的date绑定
const date = ref(props.date)
function onDateChange(e){
    emit('change', e)
}
</script>