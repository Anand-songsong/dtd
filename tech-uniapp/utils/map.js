// 腾讯地图 API 工具函数
import { MAP_KEY } from '../config'

// JSONP 请求函数
function jsonp(url, params = {}) {
  return new Promise((resolve, reject) => {
    // 生成回调函数名
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      ...params,
      callback: callbackName,
      output: 'jsonp'
    })
    
    // 创建 script 标签
    const script = document.createElement('script')
    script.src = `${url}?${queryParams.toString()}`
    
    // 定义全局回调函数
    window[callbackName] = (data) => {
      resolve(data)
      // 清理
      delete window[callbackName]
      document.body.removeChild(script)
    }
    
    // 错误处理
    script.onerror = () => {
      reject(new Error('JSONP request failed'))
      delete window[callbackName]
      document.body.removeChild(script)
    }
    
    // 添加到页面
    document.body.appendChild(script)
  })
}

// 逆地址解析
export async function getAddressByLocation(latitude, longitude) {
  try {
    const data = await jsonp('https://apis.map.qq.com/ws/geocoder/v1/', {
      location: `${latitude},${longitude}`,
      key: MAP_KEY,
      get_poi: 1
    })
    
    if (data.status === 0) {
      return data
    } else {
      throw new Error(data.message || '逆地址解析失败')
    }
  } catch (error) {
    console.error('逆地址解析失败:', error)
    throw error
  }
}

// 地址解析
export async function getLocationByAddress(address) {
  try {
    const data = await jsonp('https://apis.map.qq.com/ws/geocoder/v1/', {
      address,
      key: MAP_KEY
    })
    
    if (data.status === 0) {
      return data
    } else {
      throw new Error(data.message || '地址解析失败')
    }
  } catch (error) {
    console.error('地址解析失败:', error)
    throw error
  }
}

// 关键词搜索
export async function searchByKeyword(keyword, region = '全国') {
  try {
    const data = await jsonp('https://apis.map.qq.com/ws/place/v1/search', {
      keyword,
      region,
      key: MAP_KEY,
      page_size: 10,
      page_index: 1
    })
    
    if (data.status === 0) {
      return data
    } else {
      throw new Error(data.message || '搜索失败')
    }
  } catch (error) {
    console.error('关键词搜索失败:', error)
    throw error
  }
} 