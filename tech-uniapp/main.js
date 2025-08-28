import App from './App'
import './style/globa.scss'
import store from './store'

// #ifdef VUE3
import { createSSRApp } from 'vue'
import techHeader from './components/tech-header.vue'
import techIcon from './components/tech-icon.vue'
import techTimePicker from './components/tech-timePicker.vue'
import techTabs from './components/tech-tabs.vue'
import techPopup from './components/tech-popup.vue'
import techDraggle from './components/tech-draggle.vue'
import techVideo from './components/tech-video.vue'
import techNoData from './components/tech-noData.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.component('tech-header', techHeader)
  app.component('tech-icon', techIcon)
  app.component('tech-timePicker', techTimePicker)
  app.component('tech-tabs', techTabs)
  app.component('tech-popup', techPopup)
  app.component('tech-draggle', techDraggle)
  app.component('tech-video', techVideo)
  app.component('tech-noData', techNoData)
  
  // 添加全局图片预览方法
  app.config.globalProperties.previewImage = (url,index) => {
    if(Array.isArray(url)){
      uni.previewImage({
        urls: url,
        current: url[index]
      })
    }else{
      uni.previewImage({
        urls: [url],
        current: url
      })
    }
  }
  
  return {
    app
  }
}
// #endif