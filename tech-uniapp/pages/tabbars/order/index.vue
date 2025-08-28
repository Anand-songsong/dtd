<template>
    <view class="more-appointments">
        <view class="header-fixed">
            <tech-header backgroundColor="#fff" titleColor="#000">
                <template #left>
                    <view class="more-appointments-title">
                        <view class="more-appointments-title-text">我的预约
                            <tech-timePicker type="date" :date="date" @change="onDateChange" asToday>
                                <tech-icon type="icon-rili" size="32rpx" color="#6B7280" />
                            </tech-timePicker>
                        </view>
                        <view class="more-appointments-title-text-time">
                            {{ date }} {{ week }}
                        </view>
                    </view>
                </template>
                <template #right>
                    <tech-icon type="icon-gaojishaixuan" size="50rpx" color="#6B7280" />
                </template>
            </tech-header>
        </view>

        <view class="more-appointments-list">
            <view class="content-item service">
                <view class="content-item-left">
                    <view class="status">待服务</view>
                    <view class="status-text">您有{{ orderStat.upcomingNum }}个预约待服务</view>
                </view>
                <view class="content-item-right" @click="toMoreOrder('toBeOrdered')">
                    立即查看
                    <tech-icon type="icon-fangxiang-xiangyou" size="32rpx" color="#fff" />
                </view>
            </view>
            <view class="content-item doing">
                <view class="content-item-left">
                    <view class="status">进行中</view>
                    <view class="status-text">您有{{ orderStat.inProgressNum }}个预约进行中</view>
                </view>
                <view class="content-item-right" @click="toMoreOrder('ordering')">
                    查看详情
                    <tech-icon type="icon-fangxiang-xiangyou" size="32rpx" color="#fff" />
                </view>
            </view>
            <view class="content-item done">
                <view class="content-item-left">
                    <view class="status">已完成</view>
                    <view class="status-text">本周已完成{{ orderStat.completeNum }}个预约</view>
                </view>
                <view class="content-item-right" @click="toMoreOrder('completed')">
                    查看全部
                    <tech-icon type="icon-fangxiang-xiangyou" size="32rpx" color="#fff" />
                </view>
            </view>
        </view>
        <view class="appointments-title">
            <text>待服务预约</text>
            <text class="more" v-if="appointments.length > 0" @click="handleMore">查看全部</text>
        </view>
        <view class="appointments-list" v-if="appointments.length > 0">
            <view class="workbench-card" v-for="item in appointments" :key="item.orderId"
                @click="handleAppointment(item)">
                <view class="card-top">
                    <image :src="item?.avatarUrl || defaultImageUrl" mode="aspectFill" />
                    <view class="card-name">
                        <text>{{ item?.consignee }}</text>
                        <text>{{ item?.serviceProjectName }}</text>
                    </view>
                    <view class="card-time">
                        <text>{{ item?.bookTimeStr }}</text>
                    </view>
                    <view class="card-status toBeDone">
                        <text>待服务</text>
                    </view>
                </view>
                <view class="card-middle">
                    <view class="middle-info">
                        <view class="left-title">

                            <!-- 当前时间距离预约时间的XX小时XX分钟-->
                            <!-- 剩余两小时或两小时以内是用红色 -->
                            <!-- 四小时四小时以内使用橙色 -->
                            <!-- 四小时以外使用绿色 -->
                            <tech-icon type="icon-shijian" size="24rpx"
                                :color="dayjs(item?.bookTime).diff(dayjs(), 'hour') < 2 ? '#EF4444' : dayjs(item?.bookTime).diff(dayjs(), 'hour') < 4 ? '#F97316' : '#22C55E'" />
                            <view
                                :style="{ color: dayjs(item?.bookTime).diff(dayjs(), 'hour') < 2 ? '#EF4444' : dayjs(item?.bookTime).diff(dayjs(), 'hour') < 4 ? '#F97316' : '#22C55E' }">
                                <view v-if="dayjs(item?.bookTime).diff(dayjs(), 'minute') < 0">已超时</view>
                                <view v-else>
                                    还剩{{ dayjs(item?.bookTime).diff(dayjs(),
                                        'hour') }}小时{{ dayjs(item?.bookTime).diff(dayjs(),
                                        'minute') - dayjs(item?.bookTime).diff(dayjs(), 'hour') * 60 }}分钟</view>
                                </view>
                        </view>
                        <view class="left-right" v-if="dayjs(item?.bookTime).diff(dayjs(), 'minute') > 0">
                            <tech-icon type="icon-naozhong" size="24rpx" color="#EF4444" />
                            <text>提醒</text>
                        </view>
                    </view>

                </view>
                <view class="card-bottom">
                    <view class="bottom-top">
                        <tech-icon type="icon-location" size="24rpx" color="#8b919b" />
                        <text>{{ item?.address }}</text>
                    </view>
                    <view class="bottom-button">
                        <button class="bottom-button-item bottom-button-item-left" @tap.stop="openGuide(item)">
                            <tech-icon type="icon-location" size="24rpx" color="#8b919b" />
                            <text>导航</text>
                        </button>
                        <button class="bottom-button-item bottom-button-item-right" @tap.stop="openContactPopup(item)">
                            <tech-icon type="icon-dianhua" size="24rpx" color="var(--theme-color)" />
                            <text>联系客户</text>
                        </button>
                    </view>
                </view>
            </view>
        </view>
        <view class="appointments-list" v-else>
            <view class="no-data">
                <view class="image-list">
                    <image class="image-main" src="https://mu-dtd.oss-cn-hangzhou.aliyuncs.com/static/login_banner.png"
                        mode="aspectFill">

                    </image>
                    <image class="image-sub" src="https://mu-dtd.oss-cn-hangzhou.aliyuncs.com/static/tech_001.jpeg"
                        mode="aspectFill" />
                    <view class="icon-item">
                        <tech-icon type="icon-rili" size="60rpx" color="var(--theme-color)" />
                    </view>
                </view>
                <view class="title">暂无预约</view>
                <view class="text">空闲时间可以提升您的专业技能哦</view>
                <view class="setting-button" @click="toSetting">
                    <tech-icon type="icon-add-s" size="24rpx" color="#fff" />
                    <view class="setting-button-text">设置接单时间</view>
                </view>
                <text>设置更多时间段，接到更多订单</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow , onPullDownRefresh } from '@dcloudio/uni-app'
import { getOrderStat, getReservationList , getUserPhone } from '@/api/order'
import dayjs from 'dayjs'
import { serviceStatus, orderStatus } from '@/config'
import { useStore } from 'vuex'
import { getImage } from '@/utils/request'
const store = useStore()
const defaultImageUrl = ref('')
function back() {
    uni.navigateBack()
}
const date = ref('')
const week = ref('')
onShow(() => {
    date.value = new Date().toLocaleDateString()
    getWeek()
    getReservationListData()
    setTimeout(async () => {
        defaultImageUrl.value = await getImage(store.state.appInfo.app.logo)
        uni.pageScrollTo({
            scrollTop: 0,
            duration: 0
        })
    }, 10)

})
onPullDownRefresh(() => {
    getReservationListData()
    uni.stopPullDownRefresh()
})
function handleAppointment(item) {
    uni.navigateTo({
        url: `/pages/tabbars/order/detail?orderId=${item.orderId}`
    })
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
    getUserPhone(data.orderId).then(res => {
        uni.showModal({
        title: '联系人信息',
        content: `姓名：${res.data.consignee}\n手机号：${res.data.mobile}`,
        confirmText: '拨打电话',
        success: (res) => {
            if (res.confirm) {
                uni.makePhoneCall({ phoneNumber: res.data.mobile })
            }
        }
    })
    })

}
function getReservationListData() {
    getReservationList({
        businessStatus: 1,
        page: 1,
        listRows: 3
    }).then(res => {
        appointments.value = res.data.data
    })
}
function getWeek(date) {
    if (date) {
        week.value = new Date(date).getDay()
    } else {
        week.value = new Date().getDay()
    }
    switch (week.value) {
        case 0:
            week.value = '星期日'
            break
        case 1:
            week.value = '星期一'
            break
        case 2:
            week.value = '星期二'
            break
        case 3:
            week.value = '星期三'
            break
        case 4:
            week.value = '星期四'
            break
        case 5:
            week.value = '星期五'
            break
        case 6:
            week.value = '星期六'
            break
    }
}
function onDateChange(e) {
    date.value = e
    getWeek(e)
}
function handleMore() {
    uni.navigateTo({
        url: '/pages/tabbars/workbench/more-appointments'
    })
}
function toSetting() {
    uni.navigateTo({
        url: '/pages/tabbars/workbench/orderSetting'
    })
}
// 假数据
const appointments = ref([
    // {
    //     orderId: 1, //订单ID
    //     consignee: "张大大", //客户姓名
    //     address: "浙江省杭州市西湖区天目山路34号", //预约地址
    //     lng: "120.140904", //经度
    //     lat: "30.271808", //纬度
    //     mobile: "17318001005", //客户联系方式
    //     avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q1s3tUoYFJfYrhJicQdN0pXR5ZG8EjnwstjI6dnYJcufqiapicKAnegQBLpibicFQGNEFmph6QnSdOBn9AxTAN19lFQ/132", //用户头像
    //     serviceProjectName: "肩颈理疗", //预约项目
    //     serviceProjectDuration: 60, //项目时长
    //     serviceStatus: 6, //服务状态 1.待确认 2.待出发 3.已出发 4.已到达 5.服务中 6.服务完成 7.提前终止 8.服务取消
    //     startTime: "2025-07-14T17:37:23.000+08:00", //服务开始时间
    //     bookTimeStr: "07-14·17:37", //预约时间-显示用
    //     businessStatus: 1, //业务状态0-全部1-待服务2-服务中3-已完成
    //     completeTime: "2025-07-14T17:37:23.000+08:00", //服务完成时间
    //     bookTime: "2025-07-14T17:37:00.000+08:00" //预约时间
    // },
    // {
    //     orderId: 2, //订单ID
    //     consignee: "张大大", //客户姓名
    //     address: "浙江省杭州市西湖区天目山路34号", //预约地址
    //     lng: "120.140904", //经度
    //     lat: "30.271808", //纬度
    //     mobile: "17318001005", //客户联系方式
    //     avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q1s3tUoYFJfYrhJicQdN0pXR5ZG8EjnwstjI6dnYJcufqiapicKAnegQBLpibicFQGNEFmph6QnSdOBn9AxTAN19lFQ/132", //用户头像
    //     serviceProjectName: "肩颈理疗", //预约项目
    //     serviceProjectDuration: 60, //项目时长
    //     serviceStatus: 6, //服务状态 1.待确认 2.待出发 3.已出发 4.已到达 5.服务中 6.服务完成 7.提前终止 8.服务取消
    //     startTime: "2025-07-14T20:37:23.000+08:00", //服务开始时间
    //     bookTimeStr: "07-14·20:37", //预约时间-显示用
    //     businessStatus: 1, //业务状态0-全部1-待服务2-服务中3-已完成
    //     completeTime: "2025-07-14T20:37:23.000+08:00", //服务完成时间
    //     bookTime: "2025-07-14T20:37:00.000+08:00" //预约时间
    // },
    // {
    //     orderId: 3, //订单ID
    //     consignee: "张大大", //客户姓名
    //     address: "浙江省杭州市西湖区天目山路34号", //预约地址
    //     lng: "120.140904", //经度
    //     lat: "30.271808", //纬度
    //     mobile: "17318001005", //客户联系方式
    //     avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q1s3tUoYFJfYrhJicQdN0pXR5ZG8EjnwstjI6dnYJcufqiapicKAnegQBLpibicFQGNEFmph6QnSdOBn9AxTAN19lFQ/132", //用户头像
    //     serviceProjectName: "肩颈理疗", //预约项目
    //     serviceProjectDuration: 60, //项目时长
    //     serviceStatus: 6, //服务状态 1.待确认 2.待出发 3.已出发 4.已到达 5.服务中 6.服务完成 7.提前终止 8.服务取消
    //     startTime: "2025-07-14T23:37:23.000+08:00", //服务开始时间
    //     bookTimeStr: "07-14·23:37", //预约时间-显示用
    //     businessStatus: 1, //业务状态0-全部1-待服务2-服务中3-已完成
    //     completeTime: "2025-07-14T19:37:23.000+08:00", //服务完成时间
    //     bookTime: "2025-07-14T23:37:00.000+08:00" //预约时间
    // },
])
//跳转
function toMoreOrder(type) {
    uni.navigateTo({
        url: `/pages/tabbars/workbench/more-appointments?type=${type}`
    })
}
const orderStat = ref({})
function getOrderStatData() {
    getOrderStat().then(res => {
        orderStat.value = res.data
    })
}
onShow(() => {
    getOrderStatData()
})
</script>

<style lang="scss" scoped>
.header-fixed {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
}

.more-appointments {
    background-color: var(--background-color);
    min-height: 100vh;
}

.more-appointments-title-text {
    color: var(--theme-color);
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 10rpx;
    justify-content: flex-start;
}

.more-appointments-title-text-time {
    color: #6B7280;
    font-size: 24rpx;
}

.more-appointments-list {
    padding: 20rpx;

    .content-item {
        color: #fff;
        background-color: #ff6b35;
        border-radius: 20rpx;
        padding: 20rpx;
        display: flex;
        font-size: 32rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.1);

        .content-item-left {
            .status-text {
                margin-top: 10rpx;
                font-size: 22rpx;
                //字体间距
                letter-spacing: 4rpx;
            }
        }

        .content-item-right {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10rpx;
            font-size: 24rpx;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 30rpx;
            color: #fff;
            width: 200rpx;
            height: 60rpx;
            text-align: center;
        }

        &.doing {
            background-color: #4a90e2;
        }

        &.done {
            background-color: #34c759;
        }
    }
}

.appointments-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #000;
    padding-left: 20rpx;
    padding-right: 20rpx;

    .more {
        float: right;
        color: var(--theme-color);
        font-size: 24rpx;
    }
}

.appointments-list {
    padding: 20rpx;

    .workbench-card {
        background: #fff;
        border-radius: 20rpx;
        padding: 20rpx 24rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
        margin-bottom: 20rpx;
    }

    .card-top {
        display: flex;
        align-items: center;
        gap: 10rpx;
        border-bottom: 1px solid #f2f2f7;
        padding-bottom: 20rpx;

        image {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
        }

        .card-name {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            margin-left: 20rpx;

            &>text:last-child {
                color: #888;
                font-size: 24rpx;
            }
        }

        .card-time {
            font-size: 24rpx;
            color: #888;
            margin-left: auto;
            margin-right: 10rpx;
        }

        .card-status {
            font-size: 24rpx;
            padding: 10rpx 20rpx;
            background: #EFF6FF;
            color: #3B82F6;
            border-radius: 24rpx;

            &.toBeDone {
                background: var(--theme-color-light);
                color: var(--theme-color);
            }
        }
    }

    .card-middle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20rpx;
        border-bottom: 1px solid #f2f2f7;
        padding-bottom: 20rpx;

        .middle-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10rpx;
            width: 100%;

            .left-title {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                justify-items: space-between;
                gap: 20rpx;
                font-size: 24rpx;
                color: #EF4444;
            }

            .left-right {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 10rpx;
                font-size: 24rpx;
                margin-left: auto;
                padding: 10rpx 20rpx;
                background-color: #F3F4F6;
                border-radius: 24rpx;
            }
        }

        .middle-left {
            width: 65%;

            .left-title {
                font-size: 24rpx;
                margin-bottom: 10rpx;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 10rpx;
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

    .card-bottom {
        display: flex;
        flex-direction: column;
        margin-top: 20rpx;

        .bottom-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10rpx;
            margin-top: 30rpx;

            .bottom-button-item {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10rpx;
                font-size: 24rpx;
                border-radius: 16rpx;
                flex: 1;
                padding: 8rpx 20rpx;
                height: 60rpx;
                line-height: 60rpx;
                background-color: #fff;
                border: 1px solid #E5E7EB;

                &::after {
                    border: none;
                }

                &.bottom-button-item-left {
                    color: #4B5563;
                }

                &.bottom-button-item-right {
                    color: var(--theme-color);
                    border: 1px solid var(--theme-color);
                }
            }
        }

        .bottom-top {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 10rpx;
            font-size: 24rpx;
            color: #888;
            margin-bottom: 10rpx;
        }

        .bottom-middle {
            font-size: 24rpx;
            color: #fff;
            background-color: #3B82F6;
            padding: 10rpx 20rpx;
            height: 50rpx;
            border-radius: 12rpx;
            line-height: 50rpx;
            text-align: center;
            margin-top: 30rpx;
        }
    }

    .card-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24rpx;
    }

    .appointments-list-item-text {
        font-size: 32rpx;
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        margin-top: 200rpx;
    }

    .appointments-list-item {
        background: #fff;
        border-radius: 20rpx;
        box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 24rpx;
        margin-bottom: 24rpx;

        .main-row {
            display: flex;
            align-items: center;
        }

        .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            margin-right: 20rpx;
            object-fit: cover;
        }

        .info {
            flex: 1;
            display: flex;
            flex-direction: column;

            .row1 {
                display: flex;
                align-items: center;

                .name {
                    font-size: 30rpx;
                    font-weight: 600;
                    color: #222;
                }

                .status-tag {
                    margin-left: auto;
                    background: #fff7f0;
                    color: #ff6b35;
                    border-radius: 16rpx;
                    font-size: 24rpx;
                    padding: 4rpx 18rpx;
                    font-weight: 500;
                }
            }

            .row2 {
                display: flex;
                align-items: center;
                margin: 8rpx 0 0 0;

                .service {
                    font-size: 24rpx;
                    color: #666;
                }

                .time {
                    font-size: 24rpx;
                    color: #888;
                    margin-left: 24rpx;
                }
            }

            .row3 {
                display: flex;
                align-items: center;
                margin: 16rpx 0 0 0;

                .address {
                    font-size: 24rpx;
                    color: #707684;
                    margin-left: 6rpx;
                }
            }
        }

        .row4 {
            display: flex;
            gap: 18rpx;
            margin-top: 18rpx;

            .nav-btn {
                background: #fff;
                color: #4B5563;
                border: 1rpx solid #D1D5DB;
                border-radius: 24rpx;
                font-size: 24rpx;
                padding: 0 32rpx;
                height: 60rpx;
                line-height: 60rpx;
                width: 45%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6rpx;

                &::after {
                    border: none;
                }
            }

            .contact-btn {
                width: 45%;
                background: #fff;
                color: var(--theme-color);
                border: 1rpx solid var(--theme-color);
                border-radius: 24rpx;
                font-size: 24rpx;
                padding: 0 32rpx;
                height: 60rpx;
                line-height: 60rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6rpx;

                &::after {
                    border: none;
                }
            }
        }
    }
}

.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 20rpx;

    .image-list {
        position: relative;
        width: 100%;
        height: 50%;

        .image-main {
            width: 400rpx;
            height: 400rpx;
            border-radius: 50%;
            object-fit: cover;
            position: absolute;
            left: 50%;
            top: 0rpx;
            transform: translateX(-50%);
            opacity: 0.59;
        }

        .image-sub {
            width: 240rpx;
            height: 240rpx;
            border-radius: 50%;
            object-fit: cover;
            position: absolute;
            left: 60%;
            top: 160rpx;
            transform: translateX(-50%);
            opacity: 0.59;
        }

        .icon-item {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
            background-color: #fff;
            border: 4px solid var(--theme-color);
            position: absolute;
            top: 80rpx;
            left: 75%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .title {
        font-size: 32rpx;
        color: #000;
        margin-top: 400rpx;
    }

    .text {
        font-size: 24rpx;
        color: #6B7280;
    }

    .setting-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 80rpx;
        background-color: var(--theme-color);
        border-radius: 10rpx;
        margin-top: 20rpx;
        text-align: center;
        line-height: 80rpx;

        .setting-button-text {
            font-size: 28rpx;
            color: #fff;
            margin-left: 10rpx;
        }
    }

    text {
        font-size: 24rpx;
        color: var(--theme-color);

    }
}
</style>