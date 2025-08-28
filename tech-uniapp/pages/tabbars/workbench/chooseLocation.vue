<template>
    <view class="choose-location">
        <view class="map-container" v-if="!loading">
            <!-- #ifdef H5 -->
            <iframe ref="mapIframe" id="mapPage" :src="mapUrl" width="100%" height="100%" frameborder="0"
                allow="geolocation *; camera *; microphone *" style="width: 100%; height: 100%;" @load="handleMapLoad"></iframe>
            <!-- #endif -->

            <!-- #ifdef MP-WEIXIN -->
            <web-view :src="mapUrl" @message="handleMessage"></web-view>
            <!-- #endif -->
        </view>

        <!-- 加载提示 -->
        <view class="loading-mask" v-if="loading">
            <view class="loading-content">
                <uni-icons type="spinner-cycle" size="30" color="#12d06a"></uni-icons>
                <text class="loading-text">地图加载中...</text>
            </view>
        </view>
    </view>

</template>
<script setup>
import { ref } from 'vue'
import { onShow, onHide, onLoad, onUnload } from '@dcloudio/uni-app'
import { MAP_KEY, referer } from '@/config'
const geoLat = ref(0)
const geoLng = ref(0)
const mapUrl = ref('')
const selectedLocation = ref({})
const loading = ref(true)
onLoad((options) => {
    if (options.lat && options.lng && options.address) {
        geoLat.value = options.lat
        geoLng.value = options.lng
    }
})
onShow(() => {
    // 重置状态
    loading.value = true
    selectedLocation.value = {}
    
    if (geoLat.value && geoLng.value) {
    } else {
        uni.getLocation({
            type: 'gcj02',
            success: (res) => {
                geoLat.value = res.latitude
                geoLng.value = res.longitude
            }
        })
    }
    const params = new URLSearchParams({
        search: 1,
        type: 1,
        key: MAP_KEY,
        referer,
        policy: 1,
        mapdraggable: 1,
        zoom: 16
    })
    // 优先用地理编码结果
    if (geoLat.value && geoLng.value) {
        params.append('coord', `${geoLat.value},${geoLng.value}`)
        params.append('coordtype', '5')
    }
    mapUrl.value = `https://apis.map.qq.com/tools/locpicker?${params.toString()}`
    loading.value = false
    
    // #ifdef H5
    // 移除之前的事件监听器
    if (messageHandler) {
        window.removeEventListener('message', messageHandler, false)
    }
    // 添加消息监听
    window.addEventListener('message', messageHandler, false)
    
    // 设置超时处理
    setTimeout(() => {
        if (loading.value) {
            loading.value = false
            uni.showToast({
                title: '地图加载超时，请检查网络',
                icon: 'none',
                duration: 2000
            })
        }
    }, 10000)
    // #endif
})
onHide(() => {
    // #ifdef H5
    if (messageHandler) {
        window.removeEventListener('message', messageHandler, false)
    }
    // #endif
    // 重置状态
    loading.value = false
    selectedLocation.value = {}
})
// H5环境下监听 postMessage
let messageHandler = null

// #ifdef H5
messageHandler = (event) => {

    // 验证消息来源
    if (event.origin !== 'https://mapapi.qq.com') {
        return
    }

    // 接收位置信息
    const loc = event.data

    if (loc && loc.module === 'locationPicker') {
        selectedLocation.value = {
            latitude: loc.latlng.lat,
            longitude: loc.latlng.lng,
            address: loc.poiaddress,
            name: loc.poiname,
            city: loc.cityname
        }
        // 自动确认
        confirmAddress()
    }
}
// #endif
// 确认选择地址
function confirmAddress() {
    if (!selectedLocation.value || !selectedLocation.value.latitude) {
        uni.showToast({ title: '请选择地址', icon: 'none' })
        return
    }
    
    // 防止重复执行
    if (confirmAddress.isExecuting) {
        return
    }
    confirmAddress.isExecuting = true
    
    const location = selectedLocation.value
    // 智能解析省市区
    const parsed = parseAddress(location.address)
    // 拼接完整地址：地址 + 名称
    const fullAddress = location.address
    const addressData = {
        address: fullAddress,
        provinceName: parsed.province,
        cityName: parsed.city,
        districtName: parsed.district,
        latitude: location.latitude,
        longitude: location.longitude
    }
    // 存储到临时数据中
    uni.setStorageSync('selectedAddress', addressData)
    
    // 清理事件监听器
    // #ifdef H5
    if (messageHandler) {
        window.removeEventListener('message', messageHandler, false)
    }
    // #endif
    
    // 返回上一页
    setTimeout(() => {
        uni.navigateBack({
            success: () => {
                // 重置执行状态
                setTimeout(() => {
                    confirmAddress.isExecuting = false
                }, 500)
            },
            fail: () => {
                confirmAddress.isExecuting = false
            }
        })
    }, 100)
}
// 智能解析省市区
function parseAddress(address) {
    const municipalities = ['北京市', '上海市', '天津市', '重庆市'];
    let province = '', city = '', district = '', detail = '';

    // 处理直辖市
    for (const m of municipalities) {
        if (address.startsWith(m)) {
            province = m;

            // 特别处理重庆市的情况
            if (m === '重庆市') {
                // 处理郊县情况（包括自治县）
                const countyMatch = address.match(/^重庆市(.+?(?:县|自治县))/);
                if (countyMatch) {
                    city = '重庆郊县';
                    district = countyMatch[1];
                    detail = address.slice(countyMatch[0].length);
                    return { province, city, district, detail };
                }
                // 处理城区情况
                const districtMatch = address.match(/^重庆市(.+?区)/);
                if (districtMatch) {
                    city = '重庆城区';
                    district = districtMatch[1];
                    detail = address.slice(districtMatch[0].length);
                    return { province, city, district, detail };
                }
            } else {
                // 处理其他直辖市（北京、上海、天津）
                const districtMatch = address.match(new RegExp(`^${m}(.+?(?:区|县))`));
                if (districtMatch) {
                    // 将市名改为"xx城区"
                    city = m.replace('市', '') + '城区';
                    district = districtMatch[1];
                    detail = address.slice(m.length + district.length);
                } else {
                    city = m;
                    detail = address.slice(m.length);
                }
            }
            return { province, city, district, detail };
        }
    }

    // 处理普通省份地址
    const provinceReg = /^(.+?(?:省|自治区|特别行政区))/;
    const cityReg = /(.+?(?:市|自治州|地区))/;
    const districtReg = /(.+?(?:区|县|旗|自治县|自治区|林区))/;

    const provinceMatch = address.match(provinceReg);
    if (provinceMatch) {
        province = provinceMatch[1];
        const afterProvince = address.slice(province.length);

        const cityMatch = afterProvince.match(cityReg);
        if (cityMatch) {
            city = cityMatch[1];
            const afterCity = afterProvince.slice(city.length);

            const districtMatch = afterCity.match(districtReg);
            if (districtMatch) {
                district = districtMatch[1];
                detail = afterCity.slice(district.length);
            } else {
                detail = afterCity;
            }
        } else {
            detail = afterProvince;
        }
    } else {
        detail = address;
    }

    return { province, city, district, detail };
}

function handleMapLoad() {
    loading.value = false
}

// 页面卸载时清理
onUnload(() => {
    // #ifdef H5
    if (messageHandler) {
        window.removeEventListener('message', messageHandler, false)
    }
    // #endif
    // 重置执行状态
    if (confirmAddress.isExecuting) {
        confirmAddress.isExecuting = false
    }
})

</script>
<style lang="scss" scoped>
.choose-location {
    width: 100vw;
    height: 100vh;
    .map-container{
        width: 100%;
        height: 100%;
    }
    .loading-mask{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        .loading-content{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
    }
}
</style>