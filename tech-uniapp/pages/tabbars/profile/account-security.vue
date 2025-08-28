<template>
    <view class="account-security">
        <tech-header title="账户安全" backgroundColor="#fff" titleColor="#000">
            <template #left>
                <tech-icon type="icon-xiangzuojiantou" size="30rpx" color="#000" @click="handleBack" />
            </template>
        </tech-header>
        <view class="account-card">
            <view class="account-card-item" @click="handleChangePassword">
                <view class="icon-item">
                    <tech-icon type="icon-tianchongxing-" size="30rpx" color="var(--theme-color)" />
                </view>
                <view class="text">登录密码</view>
                <view class="status" :class="{ 'status-active': userInfo?.verification?.password }">
                    {{ userInfo?.verification?.password ? '已设置' : '未设置' }}</view>
                <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#111" />
            </view>
            <view class="account-card-item item-border" @click="handleChangePhone">
                <view class="icon-item">
                    <tech-icon type="icon-pingguoshouji" size="30rpx" color="var(--theme-color)" />
                </view>
                <view class="text">手机号码</view>
                <view class="mobile">{{ (userInfo?.mobile)?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</view>
                <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#111" />
            </view>
            <view class="account-card-item">
                <view class="icon-item">
                    <tech-icon type="icon-shimingrenzheng" size="30rpx" color="var(--theme-color)" />
                </view>
                <view class="text">实名认证</view>
                <view class="status status-active">已认证</view>
                <tech-icon type="icon-fangxiang-xiangyou" size="28rpx" color="#111" />
            </view>
        </view>
        <view class="logout-btn" @click="handleLogout">
            退出登录
        </view>
    </view>
</template>
<script setup>
import { getCurrentUserInfo } from '@/api/my'
import { logOut } from '@/api/login'
import { removeToken } from '@/utils/auth'
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
const userInfo = ref({})
async function getUserInfo() {
    await getCurrentUserInfo().then(async res => {
        userInfo.value = res.data
    })
}
onShow(() => {
    getUserInfo()
})
function handleBack() {
    uni.navigateBack()
}
function handleChangePassword() {
    uni.navigateTo({
        url: `/pages/tabbars/profile/changePassword?mobile=${userInfo.value.mobile}`
    })
}
function handleChangePhone() {
    uni.navigateTo({
        url: `/pages/tabbars/profile/changePhone?mobile=${userInfo.value.mobile}`
    })
}
function handleLogout() {
    uni.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                logOut().then(res => {
                    if (res.error === 0) {
                        setTimeout(() => {
                            uni.showToast({
                                title: '退出登录成功',
                                icon: 'success'
                            })
                        },10)
                            removeToken()
                            uni.reLaunch({
                                url: '/pages/login/index'
                            })
                    }

                })
            }
        }
    })
}
</script>
<style lang="scss" scoped>
.account-security {
    min-height: 100vh;
    background-color: var(--background-color);

    .account-card {
        padding: 20rpx;
        background-color: #fff;
        border-radius: 20rpx;
        margin: 20rpx;
        display: flex;
        flex-direction: column;
        gap: 30rpx;

        .account-card-item {
            display: flex;
            align-items: center;

            &.item-border {
                border-top: 1px solid #f3f4f6;
                border-bottom: 1px solid #f3f4f6;
                padding: 20rpx 0;
            }

            .icon-item {
                width: 80rpx;
                height: 80rpx;
                background-color: var(--theme-color-light);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 24rpx;
            }

            .status {
                font-size: 24rpx;
                color: #EF4444;
                margin-left: auto;
                margin-right: 24rpx;
            }

            .status-active {
                color: #22C55E;
            }

            .mobile {
                font-size: 24rpx;
                color: #6B7280;
                margin-left: auto;
                margin-right: 24rpx;
            }
        }
    }

    .logout-btn {
        height: 80rpx;
        margin: 100rpx 20rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        padding: 0 20rpx;
        color: #fff;
        background-color: var(--theme-color);
        border-radius: 20rpx;
    }
}
</style>