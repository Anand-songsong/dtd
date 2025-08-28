<template>
    <view class="more-appointments">
        <view class="head-fixed">
            <tech-header title="全部预约" backgroundColor="#fff" titleColor="#000">
                <template #left>
                    <tech-icon type="icon-xiangzuojiantou" size="30rpx" color="#000" @click="handleBack" />
                </template>
            </tech-header>
            <tech-tabs :tabs="tabs" @change="handleTabChange" :propIndex="activeIndex" />
        </view>
        <view class="appointments-list">
            <view v-for="item in groupList" :key="item.date" class="group-item">
                <view class="group-title">
                    <text>{{ item.date }}</text>
                    <text>{{ item.week }}</text>
                </view>
                <view class="appointments-list-item" v-for="item in item.items" :key="item.orderId"
                    @tap="handleAppointment(item)">
                    <view class="info">
                        <image class="avatar" :src="item.avatarUrl || defaultImageUrl" mode="aspectFill" />
                        <view class="name-info">
                            <view class="name">{{ item.consignee }}</view>
                            <view class="time">{{ item.serviceProjectName }} {{ item.bookTimeStr }}</view>
                        </view>
                        <!-- businessStatus 1.待服务 2.服务中 3.已完成 -->
                        <!-- 1.红色，2.橙色，3.绿色 -->
                        <view class="price" :style="{
                            color: item.businessStatus === 1 ? '#FF6B35' : item.businessStatus === 2 ? '#3B82F6' : '#22C55E',
                            backgroundColor: item.businessStatus === 1 ? '#FFF7ED' : item.businessStatus === 2 ? '#EFF6FF' : '#F0FDF4'
                        }">
                            {{ businessStatus[item.businessStatus] }}</view>
                    </view>
                    <view class="status-card">
                        <view class="status-card-item" v-if="item.businessStatus === 1">
                            <tech-icon type="icon-shijian" size="24rpx"
                                :color="dayjs(item.bookTime).diff(dayjs(), 'hour') < 2 ? '#EF4444' : dayjs(item.bookTime).diff(dayjs(), 'hour') < 4 ? '#F97316' : '#22C55E'" />
                            <!-- 2小时以内 红色，2小时以上4小时以内 橙色 ，4小时以外绿色-->
                            <view class="time-text" :style="{
                                color: dayjs(item.bookTime).diff(dayjs(), 'hour') < 2 ? '#EF4444' : dayjs(item.bookTime).diff(dayjs(), 'hour') < 4 ? '#F97316' : '#22C55E'
                            }">
                                <view v-if="dayjs(item.bookTime).diff(dayjs(), 'minute') < 0">已超时</view>
                                <view v-else>
                                    还剩{{ dayjs(item.bookTime).diff(dayjs(), 'hour') }}小时{{
                                        dayjs(item.bookTime).diff(dayjs(),
                                            'minute') - dayjs(item.bookTime).diff(dayjs(), 'hour') * 60 }}分钟
                                </view>

                            </view>
                            <view class="notice" v-if="dayjs(item.bookTime).diff(dayjs(), 'minute') > 0">
                                <tech-icon type="icon-naozhong" size="24rpx" color="#000000" />
                                <text>提醒</text>
                            </view>
                        </view>
                        <view class="status-card-item-two" v-if="item.businessStatus === 2">
                            <view class="left">
                                <view class="left-title" @tap.stop="refreshProgress">
                                    <tech-icon type="icon-shuaxin" size="32rpx" color="#3B82F6"
                                        :class="{ 'icon-rotate': isRefreshing }" />
                                    <view>服务中{{
                                        computedTime(item.startTime, item.serviceProjectDuration).percent
                                    }}</view>
                                </view>
                                <view class="left-progress">
                                    <progress :percent="computedTime(item.startTime, item.serviceProjectDuration).value"
                                        activeColor="#3B82F6" :border-radius="30" />
                                </view>
                            </view>
                            <view class="middle-right">
                                <tech-icon type="icon-shijian" size="24rpx" color="#3B82F6" />
                                <text>延长时间</text>
                            </view>
                        </view>
                        <view class="status-card-item-three" v-if="item.businessStatus === 3">
                            <tech-icon type="icon-icon_duihao-mian" size="24rpx" color="#22C55E" />
                            <text>{{ dayjs(item.completeTime).format('YYYY-MM-DD HH:mm') }}完成</text>
                        </view>
                    </view>
                    <view class="address">
                        <tech-icon type="icon-location" size="24rpx" color="#4B5563" />
                        <text class="address-text">{{ item.address }}</text>
                    </view>
                    <view class="bottom-btn">
                        <button class="btn-contact" @tap.stop="openGuide(item)" v-if="item.businessStatus === 1">
                            <tech-icon type="icon-location" size="24rpx" color="#4B5563" />
                            导航
                        </button>
                        <button class="btn-service" @tap.stop="openContactPopup(item)" v-if="item.businessStatus === 1">
                            <tech-icon type="icon-dianhua" size="24rpx" color="var(--theme-color)" />
                            联系客户
                        </button>
                        <button class="bottom-middle" @tap.stop="closeService(item)" v-if="item.businessStatus === 2">
                            结束服务
                        </button>
                        <button class="bottom-comment" @click.stop="openComment(item)" v-if="item.businessStatus === 3">
                            查看评价
                        </button>
                    </view>
                </view>
            </view>
            <view v-if="loading" class="loading-tip">加载中...</view>
            <!-- 没有更多了 -->
            <view v-else-if="finished && appointments.length > 0" class="no-more-tip">
                <view class="no-more-tip-text">没有更多了</view>
            </view>
            <tech-noData v-else-if="finished && appointments.length === 0" />
        </view>
        <!-- 状态更新弹窗 -->
        <uni-popup ref="statusPopup" type="center" :mask-click="false">
            <view class="status-popup">
                <view class="popup-header">
                    <text class="popup-title">结束服务</text>
                </view>
                <view class="popup-content">
                    <view class="upload-section">
                        <text class="section-title">上传图片（可选）</text>
                        <view class="image-list">
                            <view v-for="(image, index) in uploadImages" :key="index" class="image-item">
                                <image :src="image" mode="aspectFill" class="uploaded-image" />
                                <view class="image-close" @click="removeImage(index)">×</view>
                            </view>
                            <view v-if="uploadImages.length < 9" class="image-upload-btn" @click="chooseImages">
                                <tech-icon type="icon-tupian" size="48rpx" color="#ccc" />
                                <text class="upload-text">添加图片</text>
                            </view>
                        </view>
                    </view>
                    <view class="remark-section">
                        <text class="section-title">备注（可选）</text>
                        <textarea v-model="remarkText" placeholder="请输入备注信息" class="remark-input" maxlength="200" />
                        <text class="char-count">{{ remarkText.length }}/200</text>
                    </view>
                </view>
                <view class="popup-actions">
                    <button class="popup-btn btn-cancel" @click="closeStatusPopup">取消</button>
                    <button class="popup-btn btn-confirm" @click="confirmUpdateStatus">确认结束</button>
                </view>
            </view>
        </uni-popup>
        <tech-popup ref="commentPopup" width="95%" height="60vh" type="bottom" @close="closeCommentPopup">
            <view class="comment-popup p-20">
                <view class="popuptitle">
                    <text>用户评价</text>
                    <tech-icon type="icon-guanbi-quxiao" size="32rpx" color="#000" @click="closeCommentPopup" />
                </view>
                <view class="top">
                    <image :src="commentData.avatarUrl || defaultImageUrl" mode="aspectFill" class="avatar" />
                    <view class="name">{{ commentData.nickname }}</view>
                    <view class="time">{{ dayjs(commentData.createTime).format('YYYY-MM-DD HH:mm') }}</view>
                </view>
                <view class="middle">
                    <view class="serviceScore">
                        <text>服务评分</text>
                        <tech-rating :score="commentData.serviceScore || 0" size="16" />
                    </view>
                    <view class="techScore">
                        <text>技师评分</text>
                        <tech-rating :score="commentData.techScore || 0" size="16" />
                    </view>
                </view>
                <view class="bottom">
                    <view>{{ commentData.comment }}</view>
                </view>
            </view>
        </tech-popup>
    </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
import { uploadFile } from '@/utils/request'
import { getReservationList, getUserPhone, updateServiceStatus, getOrderComment } from '@/api/order'
import { businessStatus } from '@/config'
import dayjs from 'dayjs'
import TechRating from '@/components/tech-rating.vue'
import { getImage } from '@/utils/request'
import { useStore } from 'vuex'
const store = useStore()
const defaultImageUrl = ref('')
const tabs = ref([
    { name: '全部' },
    { name: '待服务' },
    { name: '进行中' },
    { name: '已完成' },
])
function handleBack() {
    uni.navigateBack()
}
const appointments = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const listRows = 10
//计算服务中时间
function computedTime(startTime, serviceProjectDuration) {
    // 参数：开始时间，服务时长
    //根据当前时间计算一个大概的服务百分比
    const now = dayjs()
    const start = dayjs(startTime)
    const duration = serviceProjectDuration
    const currentPercent = now.diff(start, 'minute') / duration
    return {
        percent: (currentPercent * 100).toFixed(0) + '%',
        value: Number((currentPercent * 100).toFixed(0))
    }
}
const isRefreshing = ref(false)
function refreshProgress(item) {
    isRefreshing.value = true
    loading.value = false
    finished.value = false
    getOrderList(false)
    setTimeout(() => {
        isRefreshing.value = false
        loading.value = false
        finished.value = true
    }, 600)

}
function handleAppointment(item) {
    uni.navigateTo({
        url: `/pages/tabbars/order/detail?orderId=${item.orderId}`
    })
}
function handleTabChange(index) {
    activeIndex.value = index
    page.value = 1
    finished.value = false
    getOrderList(false)
}
//获取订单列表
function getOrderList(loadMore = false) {
    if (loading.value || finished.value) return
    loading.value = true
    getReservationList({
        businessStatus: activeIndex.value,
        page: page.value,
        listRows: listRows
    }).then(res => {
        if (loadMore) {
            appointments.value = [...appointments.value, ...res.data.data]
        } else {
            appointments.value = res.data.data
        }
        if (activeIndex.value === 2) {
            // 造一个假数据
            // appointments.value = [
            //     {
            //         orderId: 2, //订单ID
            //         consignee: "地包天", //客户姓名
            //         address: "浙江省杭州市西湖区天目山路34号", //预约地址
            //         lng: "120.140904", //经度
            //         lat: "30.271808", //纬度
            //         mobile: "17318001005", //客户联系方式
            //         avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q1s3tUoYFJfYrhJicQdN0pXR5ZG8EjnwstjI6dnYJcufqiapicKAnegQBLpibicFQGNEFmph6QnSdOBn9AxTAN19lFQ/132", //用户头像
            //         serviceProjectName: "肩颈理疗", //预约项目
            //         serviceProjectDuration: 60, //项目时长
            //         serviceStatus: 5, //服务状态 1.待确认 2.待出发 3.已出发 4.已到达 5.服务中 6.服务完成 7.提前终止 8.服务取消
            //         startTime: "2025-07-13T10:37:23.000+08:00", //服务开始时间
            //         bookDay: "20250712", //预约天
            //         bookHourLabel: "17:00", //预约时段
            //         bookTimeStr: "07-12·17:00", //预约时间-显示用
            //         businessStatus: 2, //业务状态0-全部1-待服务2-服务中3-已完成
            //         completeTime: "2025-07-12T16:11:31.000+08:00", //服务完成时间
            //         bookTime: "2025-07-16T15:00:00.000+08:00" //预约时间
            //     }
            // ]
        }
        getGroupList()
        finished.value = res.data.data.length < listRows
        loading.value = false
    })
}
const groupList = ref([])
function getGroupList() {
    const result = {}

    // 遍历所有订单数据
    appointments.value.forEach(item => {
        // 从 successTime 中提取日期
        const date = dayjs(item.bookTime).format('YYYY-MM-DD')
        var datas = dayjs(item.bookTime).day()
        var week = ['日', '一', '二', '三', '四', '五', '六']
        var weekStr = '星期' + week[datas]
        // 如果这个日期还没有分组，就创建一个新的分组
        if (!result[date]) {
            result[date] = {
                list: [],
                week: weekStr
            }
        }
        // 根据类型分类
        result[date].list.push(item)
    })

    // 将结果转换为数组格式，方便在模板中使用
    const list = Object.keys(result).map(date => {
        return {
            date: dayjs(date).format('YYYY年MM月DD日'),
            week: result[date].week,
            items: result[date].list
        }
    })

    // 按日期倒序排列
    list.sort((a, b) => {
        const dateA = dayjs(a.date, 'YYYY年MM月DD日')
        const dateB = dayjs(b.date, 'YYYY年MM月DD日')
        return dateB - dateA
    })
    groupList.value = list
    return list
}
// 导航
function openGuide(data) {
    uni.showLoading({
        title: '定位中...'
    })
    const { lat, lng, address } = data
    const name = encodeURIComponent(address)
    uni.getLocation({
        type: 'gcj02',
        success: (res) => {
            uni.hideLoading()
            const slat = res.latitude
            const slng = res.longitude
            uni.navigateTo({
                url: `/pages/tabbars/order/guide?lat=${lat}&lng=${lng}&name=${name}&slat=${slat}&slng=${slng}`
            })
        },
        fail: () => {
            uni.showToast({ title: '定位失败', icon: 'none' })
        }
    })
}
function openContactPopup(data) {
    let phone = null
    let consignee = null
    getUserPhone(data.orderId).then(res => {
        phone = res.data.mobile
        consignee = res.data.consignee
        uni.showModal({
            title: '联系人信息',
            content: `姓名：${consignee}\n手机号：${phone}`,
            confirmText: '拨打电话',
            success: (res) => {
                if (res.confirm) {
                    uni.makePhoneCall({ phoneNumber: phone })
                }
            }
        })
    })

}
const statusPopup = ref(null)
const orderData = ref({})
function closeService(item) {
    statusPopup.value.open()
    orderData.value = item
}
const uploadImages = ref([])
const remarkText = ref('')
const currentOrderNo = ref('')
const currentServiceStatus = ref('')

// 选择图片
function chooseImages() {
    uni.chooseImage({
        count: 9 - uploadImages.value.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            uploadImages.value.push(...res.tempFilePaths)
        }
    })
}
// 移除图片
function removeImage(index) {
    uploadImages.value.splice(index, 1)
}
// 关闭弹窗
function closeStatusPopup() {
    statusPopup.value.close()
    uploadImages.value = []
    remarkText.value = ''
}

// 确认更新
async function confirmUpdateStatus() {
    uni.showLoading({ title: '更新中...' })
    try {
        const photos = []
        if (uploadImages.value.length > 0) {
            for (const image of uploadImages.value) {
                const result = await uploadFile(image)
                if (result && result.path) {
                    photos.push(result.path)
                }
            }
        }
        const locationResult = await new Promise((resolve, reject) => {
            uni.getLocation({ type: 'gcj02', success: resolve, fail: reject })
        })
        const res = await updateServiceStatus({
            orderId: orderData.value.orderId,
            action: 'completed',
            lng: locationResult.longitude,
            lat: locationResult.latitude,
            remark: remarkText.value,
            photos: photos
        })
        if (res.error === 0) {
            uni.showToast({ title: '状态已更新', icon: 'success' })
            closeStatusPopup()
            await getOrderList(false)
        } else {
            uni.showToast({ title: res.msg || '更新失败', icon: 'none' })
        }
    } catch (error) {
        console.error('更新状态失败:', error)
        uni.showToast({ title: '更新失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}
const commentPopup = ref(null)
const commentData = ref({})
function openComment(item) {
    getOrderComment({
        orderId: item.orderId
    }).then(res => {
        console.log(res);
        if (!res.data) {
            uni.showToast({ title: '用户暂未评价', icon: 'none' })
        } else {
            commentPopup.value.open()
            commentData.value = res.data
        }
    })
}
function closeCommentPopup() {
    commentPopup.value.close()
}
const activeIndex = ref(0)
const orderType = ref({
    toBeOrdered: 1,
    ordering: 2,
    completed: 3
})
onShow(() => {
    page.value = 1
    finished.value = false
    getOrderList(false)
    setTimeout(async () => {
        defaultImageUrl.value = await getImage(store.state.appInfo.app.logo)
    }, 500)
})
onReachBottom(() => {
    if (!finished.value) {
        getOrderList(true)
    }
})
onLoad((options) => {
    if (options.type) {
        activeIndex.value = orderType.value[options.type]
    } else {
        activeIndex.value = 0
    }
})
</script>
<style lang="scss" scoped>
.comment-popup {
    padding: 20rpx;
    overflow-y: auto;
    .popuptitle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 32rpx;
    }

    .top {
        display: flex;
        align-items: center;
        gap: 20rpx;
        margin-top: 40rpx;

        .avatar {
            width: 120rpx;
            height: 120rpx;
            border-radius: 50%;
        }

        .name {
            font-size: 28rpx;
            font-weight: bold;
        }

        .time {
            font-size: 24rpx;
            color: #4B5563;
        }
    }

    .middle {
        display: flex;
        flex-direction: column;
        gap: 20rpx;
        margin-top: 40rpx;
        
        .serviceScore,
        .techScore {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20rpx;
            background-color: #F9FAFB;
            border-radius: 12rpx;
            
            text {
                font-size: 28rpx;
                color: #374151;
                font-weight: 500;
            }
        }
    }
    .bottom{
        background-color: #F9FAFB;
        min-height: 100rpx;
        max-height: 600rpx;
        padding: 20rpx;
        border-radius: 12rpx;
        margin-top: 40rpx;
        font-size: 28rpx;
        color: #374151;
    }
}

.more-appointments {
    background-color: #f9fafb;
    min-height: 100vh;
    padding-bottom: 20rpx;
}

.head-fixed {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
}

.appointments-list {
    background-color: f9fafb;
    min-height: 200rpx;

    .group-title {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        width: 100%;
        background-color: #E5E7EB;
        color: #4B5563;
        margin-top: 20rpx;
        height: 80rpx;
        gap: 10rpx;

        text {
            padding-left: 20rpx;
        }
    }

    .group-item {
        margin: 0 auto;
        margin-top: 20rpx;
    }

    .appointments-list-item {
        background-color: #fff;
        box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.1);
        border-radius: 20rpx;
        padding: 20rpx;
        width: 90%;
        margin: 0 auto;
        margin-top: 20rpx;

        .info {
            display: flex;
            align-items: center;
            gap: 10rpx;

            .avatar {
                width: 60rpx;
                height: 60rpx;
                border-radius: 50%;
            }

            .name-info {
                display: flex;
                flex-direction: column;
                gap: 10rpx;
            }

            .name {
                font-size: 32rpx;
                font-weight: bold;
            }

            .time {
                font-size: 24rpx;
                color: #4B5563;
            }

            .price {
                margin-left: auto;
                font-size: 24rpx;
                color: #fff;
                padding: 10rpx 20rpx;
                border-radius: 20rpx;
            }
        }

        .address {
            display: flex;
            align-items: center;
            margin-top: 20rpx;
            color: #4B5563;
            font-size: 24rpx;

            .address-text {
                margin-left: 10rpx;
            }
        }

        .project {
            display: flex;
            flex-direction: column;
            margin-top: 20rpx;
            background-color: #F3F4F6;
            padding: 20rpx;
            border-radius: 20rpx;
            color: #4B5563;
            font-size: 24rpx;
            gap: 10rpx;

            .row1 {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .row2 {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
        }

        .bottom-btn {
            display: flex;
            justify-content: space-between;
            margin-top: 20rpx;

            .btn-contact {
                width: 45%;
                background-color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #4B5563;
                border-radius: 20rpx;
                border: 1px solid #D1D5DB;
                font-size: 24rpx;

                &::after {
                    border: none;
                }
            }

            .btn-service {
                width: 45%;
                background-color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--theme-color);
                border-radius: 20rpx;
                border: 1px solid var(--theme-color);
                font-size: 24rpx;

                &::after {
                    border: none;
                }
            }

            .bottom-middle {
                width: 100%;
                font-size: 24rpx;
                color: #fff;
                background-color: #3B82F6;
                height: 60rpx;
                border-radius: 12rpx;
                line-height: 60rpx;
                text-align: center;
                margin-top: 20rpx;

                &::after {
                    border: none;
                }
            }

            .bottom-comment {
                width: 100%;
                font-size: 24rpx;
                border: 1px solid #22C55E;
                color: #22C55E;
                background-color: transparent;
                height: 60rpx;
                border-radius: 12rpx;
                line-height: 60rpx;
                text-align: center;
                margin-top: 20rpx;

                &::after {
                    border: none;
                }
            }
        }
    }
}

.status-card {
    border-top: 1px solid #F3F4F6;
    border-bottom: 1px solid #F3F4F6;
    padding: 20rpx;
    margin-top: 20rpx;
    margin-bottom: 20rpx;

    .status-card-item {
        display: flex;
        align-items: center;
        gap: 10rpx;

        .time-text {
            font-size: 24rpx;
            color: #4B5563;
        }

        .notice {
            display: flex;
            align-items: center;
            gap: 10rpx;
            margin-left: auto;
            background-color: #F3F4F6;
            padding: 10rpx 20rpx;
            border-radius: 20rpx;
            font-size: 24rpx;
        }
    }

    .status-card-item-two {
        display: flex;
        align-items: center;
        gap: 10rpx;
        width: 100%;
        justify-content: space-between;

        .left-progress {
            width: 100%;
        }

        .left {
            width: 65%;
            display: flex;
            flex-direction: column;
            gap: 10rpx;

            .left-title {
                font-size: 24rpx;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 12rpx;
                color: #3B82F6;
            }
        }

        .middle-right {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10rpx;
            font-size: 24rpx;
            background-color: #F3F4F6;
            padding: 10rpx 20rpx;
            border-radius: 24rpx;
            color: #3B82F6;
        }
    }

    .status-card-item-three {
        display: flex;
        align-items: center;
        gap: 10rpx;
        font-size: 24rpx;
        color: #22C55E;
    }
}

.empty-tip,
.no-more-tip,
.loading-tip {
    text-align: center;
    color: #bbb;
    font-size: 26rpx;
    margin: 40rpx 0;
}

.icon-rotate {
    animation: rotate .6s linear infinite;
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.status-popup {
    background: #fff;
    border-radius: 20rpx;
    width: 90vw;
    max-width: 700rpx;
    min-width: 0;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 32rpx 24rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
    text-align: left;
}

.popup-content {
    padding: 32rpx;
    max-height: 60vh;
    overflow-y: auto;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.upload-section,
.remark-section {
    width: 100%;
    position: relative;
    margin-bottom: 32rpx;
}

.image-list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 16rpx;
}

.image-item,
.image-upload-btn {
    width: 120rpx;
    height: 120rpx;
    position: relative;
}

.uploaded-image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
    position: relative;
}

.image-close {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    background: #ff4757;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    font-weight: bold;
}

.image-upload-btn {
    border: 2rpx dashed #ddd;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
}

.upload-text {
    font-size: 20rpx;
    color: #999;
    margin-top: 8rpx;
}

.remark-input {
    width: 100%;
    height: 160rpx;
    padding: 16rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    resize: none;
}

.char-count {
    position: absolute;
    bottom: 8rpx;
    right: 16rpx;
    font-size: 24rpx;
    color: #999;
}

.popup-actions {
    display: flex;
    gap: 16rpx;
    padding: 24rpx 32rpx 32rpx 32rpx;
    border-top: 1rpx solid #f0f0f0;
}

.popup-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    width: 100%;
    line-height: 80rpx;

    &::after {
        border: none;
    }
}

.btn-cancel {
    background: #f8f9fa;
    color: #666;
}
</style>