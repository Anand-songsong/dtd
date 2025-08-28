<template>
    <uni-icons :type="type" :size="size" :color="color" custom-prefix="iconfont"></uni-icons>
  </template>
  
  <script setup>
  defineProps({
    type: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: '32rpx',
    },
    color: {
      type: String,
      default: '#1E5099',
    },
  });
  </script>
  