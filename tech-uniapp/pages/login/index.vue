<template>
    <view class="login-container">
        <view class="login-bg">
            <image class="bg-image" src="https://mu-dtd.oss-cn-hangzhou.aliyuncs.com/static/login_banner.png" mode="aspectFill"></image>
            <view class="logo-box">
                <view class="logo-box-img">
                    <image :src="logo" mode="aspectFill" class="logo-img"></image>
                </view>
                <text class="login-title">{{ appName }}</text>
            </view>
        </view>
        <view class="login-form">
            <view class="login-form-title">
                <text>技师登录</text>
                <text>欢迎回来，开始您的工作日</text>
            </view>
            <view class="login-type">
                <text :class="['type-item', loginType === 'password' ? 'active' : '']"
                    @click="loginType = 'password'">密码登录</text>
                <text :class="['type-item', loginType === 'sms' ? 'active' : '']"
                    @click="loginType = 'sms'">验证码登录</text>
            </view>
            <view class="input-group">
                <tech-icon type="icon-group48" size="44rpx" color="var(--theme-color)" />
                <input v-if="loginType === 'sms'" class="login-input" type="number" v-model="mobile" placeholder="请输入手机号" />
                <input v-if="loginType === 'password'" class="login-input" type="text" v-model="account"  placeholder="请输入手机号或用户名" />
            </view>
            <view class="input-group" v-if="loginType === 'sms'">
                <tech-icon type="icon-fuwushouye-baoxianfuwu" size="44rpx" color="var(--theme-color)" />
                <input class="login-input" type="number" v-model="code" maxlength="6" placeholder="请输入验证码" />
                <button class="code-btn" @click="sendCode" :disabled="countdown > 0">
                    {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
                </button>
            </view>
            <view class="input-group" v-if="loginType === 'password'">
                <tech-icon type="icon-mima" size="44rpx" color="var(--theme-color)" />
                <input class="login-input" password v-model="password" placeholder="请输入密码" />
            </view>
            <!-- <text class="login-forget" v-if="loginType === 'password'">忘记密码</text> -->
            <button class="login-btn" @click="login">立即登录</button>
        </view>
        <view class="login-footer">
           <text>联系客服解决登陆问题</text>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { sendSmsCode, smslogin, getAppInfo, passwordLogin , getProfileInfo } from '@/api/login'
import { setToken, getToken } from '@/utils/auth'
import { onShow } from '@dcloudio/uni-app'
import { getImage } from '@/utils/request'
import { useStore } from 'vuex'
const store = useStore()
const mobile = ref('')
const code = ref('')
const account = ref('')
const password = ref('')
const loginType = ref('password')
const countdown = ref(0)
let timer = null
const appName = ref('')
const logo = ref('')
onMounted(() => {
    if (getToken()) {
        uni.reLaunch({
            url: '/pages/tabbars/workbench/index'
        })
        return
    }
    getAppDetail()
})
onShow(() => {
    if (getToken()) {
        uni.reLaunch({
            url: '/pages/tabbars/workbench/index'
        })
    }
})
async function getAppDetail() {
    getAppInfo().then(async res => {
        if (res.error === 0) {
            store.commit('setAppInfo', res.data)
            appName.value = res.data.app.name
            logo.value = await getImage(res.data.app.logo)
        }
    })
}
function sendCode() {
    if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
        uni.showToast({ title: '请输入正确手机号', icon: 'none' })
        return
    }
    countdown.value = 60
    timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
    sendSmsCode({ mobile: mobile.value, event: 'smsLogin' }).then(res => {
        if (res.error === 0) {
            uni.showToast({ title: res.msg, icon: 'none' })
        } else {
            uni.showToast({ title: res.message, icon: 'none' })
        }
    })
}





function login() {
    if (loginType.value === 'sms') {
        if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
        uni.showToast({ title: '请输入正确手机号', icon: 'none' })
        return
    }
        if (!code.value) {
            uni.showToast({ title: '请输入验证码', icon: 'none' })
            return
        }
        smslogin({ mobile: mobile.value, code: code.value }).then(res => {
            handleLoginResponse(res)
        })
    } else {
        if (!account.value) {
            uni.showToast({ title: '请输入手机号或用户名', icon: 'none' })
            return
        }
        if (!password.value) {
            uni.showToast({ title: '请输入密码', icon: 'none' })
            return
        }
        passwordLogin({
            account: account.value,
            password: password.value
        }).then(res => {
            handleLoginResponse(res)
        })
    }
}
function handleLoginResponse(res) {
    if (res.error === 0) {
        setTimeout(() => {
            uni.showToast({
                title: res.msg || '登录成功',
                icon: 'success',
                duration: 2000
            })
        }, 50)

        setToken(res.data)
        getProfileInfo().then(res=>{
            if(res.error === 0){
                store.commit('setUserInfo' , res.data)
            }
        })
        uni.reLaunch({
            url: '/pages/tabbars/workbench/index'
        })
    } else {
        uni.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
        })
    }
}
</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}

.login-bg {
    position: relative;
    width: 100%;
    height: 400rpx;
    .bg-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%);
        z-index: 1;
    }

    .logo-box {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2;

        .logo-box-img{
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo-img {
            width: 100%;
            height: 100%;
        }

        .login-title {
            font-size: 36rpx;
            color: #fff;
            margin-top: 16rpx;
            letter-spacing: 2rpx;
        }
    }
}

.login-form {
    width: 100%;
    background: #fff;
    height: 100%;
    box-shadow: 0 4rpx 24rpx rgba(60, 156, 255, 0.08);
    display: flex;
    flex-direction: column;
    border-radius: 32rpx 32rpx 0 0;
    z-index: 10;
    margin-top: -28rpx;
}

.login-form-title{
    color: #333;
    margin-bottom: 32rpx;
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin-left: 32rpx;
    margin-right: 32rpx;
    margin-top: 40rpx;
    &>text:first-child{
        font-size: 40rpx;
        margin-bottom: 16rpx;
    }
    &>text:last-child{
        font-size: 24rpx;
        color: #999;
    }
}

.login-type {
    display: flex;
    margin-bottom: 32rpx;

    .type-item {
        padding: 16rpx 32rpx;
        font-size: 28rpx;
        color: #666;
        position: relative;
        cursor: pointer;
        transition: color 0.2s;

        &.active {
            color: var(--theme-color);
            font-weight: bold;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 40rpx;
                height: 4rpx;
                background: var(--theme-color);
                border-radius: 2rpx;
            }
        }
    }
}

.input-group {
    display: flex;
    align-items: center;
    background: #f4f8fd;
    border-radius: 16rpx;
    margin-bottom: 32rpx;
    padding: 0 20rpx;
    height: 88rpx;
    margin-left: 32rpx;
    margin-right: 32rpx;
    .login-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 28rpx;
        margin-left: 16rpx;
        outline: none;
    }

    .code-btn {
        margin-left: 12rpx;
        background: var(--theme-color);
        color: #fff;
        border: none;
        border-radius: 16rpx;
        font-size: 24rpx;
        padding: 0 24rpx;
        height: 56rpx;
        line-height: 56rpx;
        transition: background 0.2s;
    }
}

.login-btn {
    background: var(--theme-color-linear-gradient);
    color: #fff;
    font-size: 30rpx;
    border: none;
    border-radius: 44rpx;
    height: 88rpx;
    font-weight: bold;
    box-shadow: 0 4rpx 16rpx rgba(60, 156, 255, 0.08);
    margin-top: 8rpx;
    margin-left: 32rpx;
    margin-right: 32rpx;
    line-height: 88rpx;
    transition: background 0.2s;
}
.login-footer{
    text-align: center;
    font-size: 24rpx;
    color: #999;
    margin-top: 24rpx;
    text-decoration: underline;
    text-underline-offset: 4rpx;
    text-decoration-style: solid;
}
.login-forget{
    font-size: 24rpx;
    color: var(--theme-color);
    margin-left: auto;
    margin-right: 32rpx;
    margin-top: 16rpx;
    margin-bottom: 32rpx;
}
button{
    &::after{
        border: none;
    }
}
</style>
