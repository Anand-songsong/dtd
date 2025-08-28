/**
 * 图片预览方法
 * @param {Object} options 配置项
 * @param {String|Array} options.urls 图片地址，可以是单个地址或地址数组
 * @param {String} options.current 当前显示的图片地址
 * @param {Boolean} options.loop 是否循环显示
 * @param {String} options.indicator 指示器类型，可选值：'default'、'number'、'none'
 */
export const previewImage = (options) => {
  // 如果传入的是字符串，转换为数组
  const urls = Array.isArray(options.urls) ? options.urls : [options.urls]
  
  uni.previewImage({
    urls,
    current: options.current || urls[0],
    loop: options.loop || false,
    indicator: options.indicator || 'number',
    success: options.success,
    fail: options.fail,
    complete: options.complete
  })
}

/**
 * 单张图片预览
 * @param {String} url 图片地址
 */
export const previewSingleImage = (url) => {
  previewImage({
    urls: [url],
    current: url
  })
}

/**
 * 多张图片预览
 * @param {Array} urls 图片地址数组
 * @param {String} current 当前显示的图片地址
 */
export const previewMultipleImages = (urls, current) => {
  previewImage({
    urls,
    current: current || urls[0]
  })
}

// 创建一个组合式API的hook
export const useImagePreview = () => {
  return {
    previewImage,
    previewSingleImage,
    previewMultipleImages
  }
} 