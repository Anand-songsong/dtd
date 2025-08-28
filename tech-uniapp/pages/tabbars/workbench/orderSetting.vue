<template>
  <view class="order-setting-page">
    <!-- 固定头部 -->
    <tech-header title="接单设置" backgroundColor="#fff" titleColor="#000"
      style="position: fixed; top: 0; left: 0; width: 100vw; z-index: 10;">
      <template #left>
        <tech-icon type="icon-xiangzuojiantou" size="32rpx" color="#000" @click="handleBack" />
      </template>
    </tech-header>
    <view style="height: 100rpx;"></view> <!-- 占位 -->

    <!-- 当前状态 -->
    <view class="status-card">
      <view class="status-label">当前状态</view>
      <view class="status-row">
        <view class="status-tip">设置您的接单状态</view>
        <view class="switch-group">
          <text class="switch-text" :class="{ active: !isOnline, inactive: isOnline }">休息中</text>
          <switch class="status-switch" color="var(--theme-color)" :checked="isOnline" @change="onSwitchChange" />
          <text class="switch-text" :class="{ active: isOnline, inactive: !isOnline }">接单中</text>
        </view>
      </view>
    </view>

    <!-- 工作时间设置 -->
    <view class="card">
      <view class="card-title">
        <tech-icon type="icon-shijian" size="28rpx" color="var(--theme-color)" style="margin-right: 8rpx;" />工作时间设置
      </view>
      <view class="time-list">
        <view class="time-item" v-for="(t, idx) in orderSetting.workTimes" :key="idx">
          <tech-icon type="icon-shijian" size="24rpx" color="#bbb" style="margin-right: 8rpx;" />
          <text class="time-label">时间段{{ idx + 1 }}</text>
          <text class="time-value">{{ t.startTime }} - {{ t.endTime }}</text>
          <tech-icon type="icon-shanchu" size="28rpx" color="#bbb" style="margin-left: 8rpx;"
            @click="deleteTime(idx)" />
        </view>
      </view>
      <view class="add-time-btn" @click="addTime">+ 添加时间段</view>
    </view>
    <!-- 接单位置设置 -->
    <view class="card">
      <view class="card-title">
        <tech-icon type="icon-daohang" size="28rpx" color="var(--theme-color)" style="margin-right: 8rpx;" />接单位置设置
      </view>
      <view class="loaction-data">
        <view class="current-loaction">{{ orderSetting.workAddress ? orderSetting.workAddress : '暂无' }}</view>
        <view class="choose-location" @click="openMap">
          去选择
          <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#a8afb9" style="margin-left: 8rpx;" />
        </view>
      </view>
    </view>
    <!-- 服务范围设置 -->
    <view class="card">
      <view class="card-title">
        <tech-icon type="icon-location" size="28rpx" color="var(--theme-color)" style="margin-right: 8rpx;" />服务范围设置
      </view>
      <view class="area-row">
        <view class="area-label">服务区域</view>
        <view class="area-value" @click="openServiceAreaPopup">{{
          getCityName(orderSetting.serviceAreaIds)
          || '全' + currentCity   }}</view>
        <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#a8afb9" style="margin-left: 8rpx;"
          @click="openServiceAreaPopup" />
        <!-- <view class="area-value" v-else>当前城市暂未开放服务</view> -->
      </view>
      <view class="distance-row">
        <view class="distance-label">距离限制</view>
        <view class="slider-box">
          <slider class="custom-slider" :value="orderSetting.orderRange" @change="handleDistanceChange" :min="1"
            :max="30" :step="1" activeColor="var(--theme-color)" backgroundColor="#e5eefd" block-size="32" />
          <view class="slider-labels">
            <text>1公里</text>
            <text>接单范围：{{ orderSetting.orderRange }}公里</text>
            <text>30公里</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最大接单量设置 -->
    <view class="card">
      <view class="card-title">
        <tech-icon type="icon-gaojishaixuan" size="28rpx" color="var(--theme-color)"
          style="margin-right: 8rpx;" />最大接单量设置
      </view>
      <view class="max-row">
        <view class="max-label">每日最大接单量</view>
        <view class="stepper">
          <view class="step-btn" @click="changeMaxOrder(-1)">-</view>
          <view class="step-value">
            <input @blur="handleMaxOrderInput" type="number" v-model="orderSetting.dayMaxOrder" />
          </view>
          <view class="step-btn" @click="changeMaxOrder(1)">+</view>
        </view>
      </view>
      <view class="max-tip">设置每天最多可接收的订单数量</view>
    </view>

    <!-- 温馨提示 -->
    <view class="tips-box">
      <view>· 接单状态设置为“休息中”时，将不会收到新的订单推送</view>
      <view>· 工作时间外系统不会为您推送订单</view>
      <view>· 服务范围外的订单将不会被推送给您</view>
      <view>· 达到每日最大接单量后，当天将不再接收新订单</view>
    </view>
    <tech-popup ref="serviceAreaPopup" type="bottom" width="95%" height="600rpx">
      <view class="service-area-popup">
        <view class="popup-title">
          当前位置：
          <view class="city-name">{{ currentCity }}</view>
          <tech-icon type="icon-shuaxin" size="28rpx" :class="{ rotate: isRotate }" color="#a8afb9"
            style="margin-left: 8rpx;" @click="getCity()" />
          <view class="button" @click="handleConfirm">确认</view>
        </view>
        <view class="city-list">
          <view class="city-item" :class="{ active: item.isActive }" v-for="(item, index) in currentCityList"
            :key="index" @click="handleCityClick(item)">
            {{ item.name }}
          </view>
        </view>
      </view>
    </tech-popup>

    <!-- 时间选择弹窗 -->
    <tech-popup ref="timePopup" type="bottom" width="95%" height="600rpx">
      <view class="time-popup">
        <view class="popup-header">
          <text class="popup-title">添加工作时间段</text>
          <view class="confirm-btn" @click="confirmTime">确定</view>
        </view>
        <view class="time-picker-container">
          <view class="time-picker-row">
            <picker-view :value="startTimeIndex" @change="handleStartTimeChange" class="time-picker"
              indicator-style="height: 80rpx;"
              mask-top-style="background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.4));"
              mask-bottom-style="background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.4));">
              <picker-view-column>
                <view class="picker-item" v-for="time in timeOptions" :key="time">
                  {{ time }}
                </view>
              </picker-view-column>
            </picker-view>
            <view class="time-separator">至</view>
            <picker-view :value="endTimeIndex" @change="handleEndTimeChange" class="time-picker"
              indicator-style="height: 80rpx;"
              mask-top-style="background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.4));"
              mask-bottom-style="background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.4));">
              <picker-view-column>
                <view class="picker-item" :class="{ disabled: isEndTimeDisabled(index) }"
                  v-for="(time, index) in timeOptions" :key="time">
                  {{ time }}
                </view>
              </picker-view-column>
            </picker-view>
          </view>
        </view>
      </view>
    </tech-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { updateOrderSetting, getOrderSetting, updateHomeServiceStatus, getCityByLocation } from '@/api/work'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { debounce, throttle } from '@/utils/index.js'
import { getAddressByLocation } from '@/utils/map'
import { useStore } from 'vuex'
import dayjs from 'dayjs'
const store = useStore()
const isOnline = computed(() => {
  const status = orderSetting.value.serviceStatus === 0
  return status
})
const handleMaxOrderInput = debounce((e) => {
  //去空格，如果数字前面一直是0则去掉全部的0，如果全部为0则取0
  //如果为小数则向上取整
  const value = e.detail.value.replace(/\s/g, '')
  if (value < 0) {
    orderSetting.value.dayMaxOrder = 0
  } else {
    orderSetting.value.dayMaxOrder = Math.ceil(value)
  }
  updateOrderSetting({
    dayMaxOrder: orderSetting.value.dayMaxOrder
  }).then(res => {
    setTimeout(() => {
      uni.showToast({ title: res.msg, icon: 'success' })
    }, 10)
    getSetting()
  })
}, 500)
const changeMaxOrder = debounce((type) => {
  orderSetting.value.dayMaxOrder = orderSetting.value.dayMaxOrder + type
  updateOrderSetting({
    dayMaxOrder: orderSetting.value.dayMaxOrder
  }).then(res => {
    setTimeout(() => {
      uni.showToast({ title: res.msg, icon: 'success' })
    }, 10)
    getSetting()
  })
}, 500)
const handleDistanceChange = debounce((e) => {
  orderSetting.value.orderRange = e.detail.value
  updateOrderSetting({
    orderRange: e.detail.value
  }).then(res => {
    setTimeout(() => {
      uni.showToast({ title: res.msg, icon: 'success' })
    }, 10)
    getSetting()
  })
}, 500)

//服务范围设置
const serviceAreaPopup = ref(null)
const isOpen = ref(true)
const currentCity = ref('')
const isRotate = ref(false)
const currentCityList = ref([])

//时间选择相关
const timePopup = ref(null)
const timeOptions = ref([])
const startTimeIndex = ref([0])
const endTimeIndex = ref([1])
const cityTree = ref([])
function getCity() {
  isRotate.value = true
  setTimeout(() => {
    isRotate.value = false
  }, 600)
  uni.showLoading({
    title: '加载中',
    mask: true
  })
  
  // 只有当 currentCityList 有值时才调用接口
  if (store.state.currentCityList && store.state.currentCityList.length > 0) {
    cityTree.value = store.state.currentCityList
    console.log('cityTree:', cityTree.value)
    
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        getCityByLocation({
          latitude,
          longitude
        }).then(result => {
          isOpen.value = result.data.isOpen
          currentCity.value = result.data.city
          //根据当前城市获取名下的区域
          const cityList = cityTree.value.find(item => item.name === result.data.city)?.children || []
          currentCityList.value = cityList
          // 使用深拷贝避免引用问题
          curentSelectCity.value = [...orderSetting.value.serviceAreaIds]
          currentCityList.value.forEach(item => {
            item.isActive = curentSelectCity.value.includes(item.id)
          })
          uni.hideLoading()
        }).catch(err => {
          console.error('获取城市信息失败:', err)
          uni.hideLoading()
        })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        uni.hideLoading()
      }
    })
  } else {
    uni.hideLoading()
    console.log('currentCityList 暂无数据')
  }
}
function openMap() {
  if (orderSetting.value.workAddress && orderSetting.value.workLat && orderSetting.value.workLng) {
    uni.navigateTo({
      url: `/pages/tabbars/workbench/chooseLocation?lat=${orderSetting.value.workLat}&lng=${orderSetting.value.workLng}&address=${orderSetting.value.workAddress}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/tabbars/workbench/chooseLocation`
    })
  }
}

const curentSelectCity = ref([])
function handleCityClick(item) {
  if (item.isActive) {
    curentSelectCity.value = curentSelectCity.value.filter(id => id !== item.id)
    item.isActive = false
  } else {
    curentSelectCity.value.push(item.id)
    item.isActive = true
  }
}
function getCityName(ids) {
  if (!ids || !Array.isArray(ids)) return ''
  const cityNames = currentCityList.value.filter(item => ids.includes(item.id)).map(item => item.name)
  //当数组超过两项是显示两项加省略号，只有两项或一下时展示全部
  if (ids.length <= 2) {
    return cityNames.join('、')
  } else {
    return cityNames.slice(0, 2).join('、') + '...'
  }
}
function handleConfirm() {
  updateOrderSetting({
    serviceAreaIds: curentSelectCity.value
  }).then(res => {
    setTimeout(() => {
      uni.showToast({ title: res.msg, icon: 'success' })
    }, 10)
    serviceAreaPopup.value.close()
    getSetting()
  })
}
function openServiceAreaPopup() {
  curentSelectCity.value = [...orderSetting.value.serviceAreaIds]
  currentCityList.value.forEach(item => {
    item.isActive = curentSelectCity.value.includes(item.id)
  })
  serviceAreaPopup.value.open()
}
function handleBack() {
  uni.navigateBack()
}
// 初始化时间选项
function initTimeOptions() {
  timeOptions.value = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeOptions.value.push(timeStr)
    }
  }
}

function addTime() {
  // 重置时间选择器
  startTimeIndex.value = [0]
  endTimeIndex.value = [1]
  timePopup.value.open()
}

// 开始时间变化
function handleStartTimeChange(e) {
  const newStartIndex = e.detail.value[0]
  startTimeIndex.value = [newStartIndex]

  // 确保结束时间不能早于或等于开始时间
  if (endTimeIndex.value[0] <= newStartIndex) {
    endTimeIndex.value = [newStartIndex + 1]
  }
}

// 结束时间变化
function handleEndTimeChange(e) {
  const newEndIndex = e.detail.value[0]
  // 确保结束时间不能早于或等于开始时间
  if (newEndIndex > startTimeIndex.value[0]) {
    endTimeIndex.value = [newEndIndex]
  } else {
    // 如果选择了无效时间，重置为下一个有效时间
    endTimeIndex.value = [startTimeIndex.value[0] + 1]
  }
}

// 判断结束时间是否禁用
function isEndTimeDisabled(index) {
  return index <= startTimeIndex.value[0]
}

// 确认添加时间
function confirmTime() {
  const startTime = timeOptions.value[startTimeIndex.value[0]]
  const endTime = timeOptions.value[endTimeIndex.value[0]]
  // 检查时间是否有效
  if (startTime === endTime) {
    uni.showToast({
      title: '开始时间不能等于结束时间',
      icon: 'none'
    })
    return
  }

  // 检查是否有时间重叠
  const newTimeRange = { startTime, endTime }
  const hasOverlap = orderSetting.value.workTimes?.some(existingTime => {
    return isTimeOverlap(existingTime, newTimeRange)
  })

  if (hasOverlap) {
    uni.showToast({
      title: '时间段不能重叠',
      icon: 'none'
    })
    return
  }

  // 添加新时间段
  if (!orderSetting.value.workTimes) {
    orderSetting.value.workTimes = []
  }
  orderSetting.value.workTimes.push(newTimeRange)

  // 发送到接口
  updateOrderSetting({
    workTimes: orderSetting.value.workTimes
  }).then(res => {
    setTimeout(() => {
      uni.showToast({ title: res.msg, icon: 'success' })
    }, 10)
    timePopup.value.close()
    getSetting()
  })
}

// 检查时间是否重叠
function isTimeOverlap(time1, time2) {
  const start1 = timeToMinutes(time1.startTime)
  const end1 = timeToMinutes(time1.endTime)
  const start2 = timeToMinutes(time2.startTime)
  const end2 = timeToMinutes(time2.endTime)

  return !(end1 <= start2 || end2 <= start1)
}

// 时间转换为分钟数
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// 删除时间段
function deleteTime(index) {
  uni.showModal({
    title: '提示',
    content: '确定删除该时间段吗？',
    success: (res) => {
      if (res.confirm) {
        orderSetting.value.workTimes.splice(index, 1)

        // 发送到接口
        updateOrderSetting({
          workTimes: orderSetting.value.workTimes
        }).then(res => {
          setTimeout(() => {
            uni.showToast({ title: res.msg, icon: 'success' })
          }, 10)
          getSetting()
        })
      }
    }
  })
}
function onSwitchChange(e) {
  const newStatus = e.detail.value // true为接单，false为休息
  updateHomeServiceStatus({
    serviceStatus: newStatus ? 0 : 1
  }).then(() => {
    // 更新本地状态
    orderSetting.value.serviceStatus = newStatus ? 0 : 1
    uni.showToast({
      title: `已切换为${newStatus ? '接单中' : '休息中'}`,
      icon: 'none'
    })
  }).catch(() => {
    uni.showToast({
      title: '状态切换失败',
      icon: 'none'
    })
  })
}
const orderSetting = ref({})
function getSetting() {
  return getOrderSetting().then(res => {
    orderSetting.value = res.data
    if (res.data.orderRange < 0 || !res.data.orderRange) orderSetting.value.orderRange = 0
    if (res.data.dayMaxOrder < 0 || !res.data.dayMaxOrder) orderSetting.value.dayMaxOrder = 0
    if (!Array.isArray(res.data.serviceAreaIds)) orderSetting.value.serviceAreaIds = []
    return res
  })
}
function getAddress() {
  const address = uni.getStorageSync('selectedAddress')
  if (address) {
    if (address) {
      updateOrderSetting({
        workLng: address.longitude,
        workLat: address.latitude,
        workAddress: address.address
      })
      uni.removeStorageSync('selectedAddress')
      getSetting()
    }
  }
}
onShow(() => {
  getSetting()
  getAddress()
})
onMounted(() => {
  // 初始化时间选项
  initTimeOptions()
  // 确保先获取设置，再获取城市信息
  getSetting().then(() => {
    const timer = setInterval(() => {
      // 检查 vuex 中的 currentCityList 是否有值
      if (store.state.currentCityList && store.state.currentCityList.length > 0) {
        clearInterval(timer)
        getCity()
      }
    }, 300)
  })
})
onPullDownRefresh(() => {
  getSetting()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.order-setting-page {
  background: var(--background-color);
  min-height: 100vh;
  padding-bottom: 20rpx;
}

.status-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 32rpx 24rpx 0 24rpx;
  padding: 52rpx 32rpx 44rpx 32rpx;

  .status-label {
    font-size: 26rpx;
    color: #222;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .status-tip {
      color: #888;
      font-size: 24rpx;
    }

    .switch-group {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .switch-text {
        font-size: 26rpx;
        color: #bbb;
        font-weight: normal;
        transition: all 0.3s ease;

        &.active {
          color: var(--theme-color);
          font-weight: bold;
        }

        &.inactive {
          color: #bbb;
          font-weight: normal;
        }
      }

      .status-switch {
        margin: 0 8rpx;
        transform: scale(0.9);
      }
    }
  }
}

.loaction-data {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .current-loaction {
    color: #888;
    font-size: 26rpx;
  }

  .choose-location {
    color: var(--theme-color);
    font-size: 26rpx;
    width: 40%;
    text-align: right;
  }
}

.service-area-popup {
  padding: 20rpx;

  .popup-title {
    display: flex;
    align-items: center;
    font-size: 28rpx;

    .city-name {
      font-size: 36rpx;
      color: var(--theme-color);
    }

    .rotate {
      animation: rotate 0.6s linear infinite;
    }

    .button {
      margin-left: auto;
      color: var(--theme-color);
      font-size: 34rpx;
      font-weight: bold;
    }
  }

  .city-list {
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10rpx;
    margin-top: 20rpx;

    .city-item {
      margin-top: 30rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 10rpx;
      border: 1rpx solid #e5eefd;

      &.active {
        background: var(--theme-color);
        color: #fff;
        border: none;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.time-popup {
  padding: 32rpx;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40rpx;

    .popup-title {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
    }

    .confirm-btn {
      color: var(--theme-color);
      font-size: 30rpx;
      font-weight: bold;
      cursor: pointer;
    }
  }

  .time-picker-container {
    .time-picker-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20rpx;

      .time-picker {
        width: 200rpx;
        height: 500rpx;
        overflow: hidden;

        .picker-item {
          height: 80rpx;
          line-height: 80rpx;
          text-align: center;
          font-size: 32rpx;
          color: #333;
          font-weight: 500;

          &.disabled {
            color: #ccc;
            opacity: 0.5;
          }
        }
      }

      .time-separator {
        font-size: 28rpx;
        color: #666;
        font-weight: 500;
      }
    }
  }
}

.card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 44rpx 32rpx 28rpx 32rpx;

  .card-title {
    font-size: 28rpx;
    color: #222;
    font-weight: bold;
    margin-bottom: 18rpx;
    display: flex;
    align-items: center;
  }

  .time-list {
    .time-item {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #222;
      margin-bottom: 12rpx;

      .time-label {
        margin: 0 12rpx 0 0;
        color: #888;
      }

      .time-value {
        color: var(--theme-color);
        font-weight: bold;
        margin-left: auto;
        margin-right: 12rpx;
      }
    }
  }

  .add-time-btn {
    width: 100%;
    height: 64rpx;
    line-height: 64rpx;
    background: #f9fafb;
    color: var(--theme-color);
    border: 2rpx dashed var(--theme-color);
    border-radius: 16rpx;
    font-size: 26rpx;
    text-align: center;
    margin: 12rpx 0 0 0;
    cursor: pointer;
  }

  .area-row {
    display: flex;
    align-items: center;
    margin-bottom: 18rpx;

    .area-label {
      color: #888;
      font-size: 26rpx;
      margin-right: 16rpx;
    }

    .area-value {
      color: var(--theme-color);
      font-size: 26rpx;
      font-weight: bold;
      margin-left: auto;
    }
  }

  .distance-row {
    .distance-label {
      color: #888;
      font-size: 26rpx;
      margin-bottom: 8rpx;
    }

    .slider-box {
      margin: 8rpx 0 0 0;

      .custom-slider {
        width: 90%;
        height: 48rpx;

        // 轨道高度
        ::v-deep .weui-slider__inner {
          height: 12rpx !important;
          background: #e5eefd !important;
        }

        // 滑块样式
        ::v-deep .weui-slider__handler {
          width: 32rpx !important;
          height: 32rpx !important;
          background: #fff !important;
          border: 4rpx solid var(--theme-color) !important;
          box-shadow: 0 2rpx 8rpx 0 rgba(0, 122, 255, 0.08);
        }
      }

      .slider-labels {
        display: flex;
        justify-content: space-between;
        color: #888;
        font-size: 22rpx;
      }
    }
  }

  .max-row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    .max-label {
      color: #888;
      font-size: 26rpx;
      flex: 1;
    }

    .stepper {
      display: flex;
      align-items: center;

      .step-btn {
        width: 48rpx;
        height: 48rpx;
        line-height: 44rpx;
        background: #f3f4f6;
        color: var(--theme-color);
        font-size: 40rpx;
        border-radius: 50%;
        text-align: center;
      }

      .step-value {
        font-size: 28rpx;
        color: #222;
        width: 80rpx;
        text-align: center;
      }
    }
  }

  .max-tip {
    color: #bbb;
    font-size: 22rpx;
    margin-bottom: 8rpx;
  }
}

.tips-box {
  background: #f3f4f6;
  border-radius: 16rpx;
  margin: 32rpx 24rpx 0 24rpx;
  padding: 44rpx 32rpx;
  color: #888;
  font-size: 22rpx;
  line-height: 36rpx;
}
</style>