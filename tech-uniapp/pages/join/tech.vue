<template>
    <view class="join-tech-container">
        <view class="join-tech-title">
            <text>让每一份手艺都看得见，加入专业服务联盟⭐</text>
        </view>
        <view class="form-item">
            <text class="label"><text class="required">*</text>您的姓名</text>
            <input v-model="form.name" placeholder="请输入姓名" />
        </view>
        <view class="form-item">
            <text class="label"><text class="required">*</text>您的性别</text>
            <radio-group v-model="form.gender" @change="onGenderChange">
                <label class="radio-label">
                    <radio activeBackgroundColor="#2A5CAA" activeBorderColor="#2A5CAA" value="0" :checked="form.gender === '男'" />男
                </label>
                <label class="radio-label">
                    <radio activeBackgroundColor="#2A5CAA" activeBorderColor="#2A5CAA" value="1" :checked="form.gender === '女'" />女
                </label>
            </radio-group>
        </view>
        <view class="form-item">
            <text class="label"><text class="required">*</text>您的生日</text>
            <uni-datetime-picker 
                v-model="form.birthday" 
                @change="onBirthdayChange" 
                type="date" 
                placeholder="请选择生日"
                :end="maxBirthday"
                :start="minBirthday"
            />
        </view>
        <view class="form-item">
            <text class="label"><text class="required">*</text>手机号</text>
            <input v-model="form.mobile" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="form-item">
            <text class="label"><text class="required">*</text>意向工作城市</text>
            <picker :range="cityNames" @change="onCityChange">
                <view class="picker-value">{{ city ? city : '请选择城市' }}</view>
            </picker>
        </view>
        <view class="form-item">
            <text class="label"><text class="required">*</text>工作形象图</text>
            <view class="upload-img-box" @tap="!imageUrl && uploadImage()">
                <view v-if="imageUrl" class="upload-img-wrapper">
                    <image :src="imageUrl" mode="aspectFill" class="uploaded-image"></image>
                    <view class="img-close" @tap.stop="removeImage">×</view>
                </view>
                <view class="upload-img-placeholder" v-else>选择图片</view>
                <text class="upload-img-tip" v-if="!imageUrl">请上传工作形象图</text>
            </view>
        </view>
        <button class="submit-btn" @click="submitForm">开启服务之旅</button>
        <!-- <view class="agreement-tip">
            <text>点击即表示同意</text>
            <text class="agreement-link">《服务协议》</text>
        </view> -->
    </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const tech_base_url = 'https://tt.wuling.love'
const order_base_url = 'https://cc.wuling.love'
const tech_appid = 'p7y04i88'
const order_appid = 'z45rd8h2'
const referer = 'tech-uniapp'
const url = '/api/th/service_area/list'
const timeOut = 5000
const order_Header = {
    'app-id': order_appid,
    'Content-Type': 'application/json',
};
const tech_Header = {
    'app-id': tech_appid,
    'Content-Type': 'application/json',
};
const openCity = ref([])
const form = ref({
    name: '',
    gender: '',
    birthday: '',
    mobile: '',
    city: '',
    image: ''
})
const cityNames = computed(() => openCity.value.map(item => item.areaName))

// 计算18周岁限制的日期范围
const maxBirthday = computed(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
})

const minBirthday = computed(() => {
    const today = new Date()
    const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate())
    return minDate.toISOString().split('T')[0]
})

function getCity() {
    uni.request({
        url: tech_base_url + url,
        method: 'GET',
        header: order_Header,
        timeout: timeOut,
        success: (res) => {
            openCity.value = res.data.data
        }
    })
}
const city = ref('')
function onCityChange(e) {
    const idx = e.detail.value
    city.value = openCity.value[idx].areaName
    form.value.city = openCity.value[idx].areaId
}
function onGenderChange(e) {
    form.value.gender = e.detail.value
}
function onBirthdayChange(e) {
    form.value.birthday = e
    // 验证年龄是否满足18周岁要求
    const selectedDate = new Date(e)
    const today = new Date()
    const age = today.getFullYear() - selectedDate.getFullYear()
    const monthDiff = today.getMonth() - selectedDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
        // 如果还没到生日，年龄减1
        const actualAge = age - 1
        if (actualAge < 18) {
            uni.showToast({ 
                title: '年龄必须满18周岁', 
                icon: 'none' 
            })
            form.value.birthday = ''
            return
        }
    } else if (age < 18) {
        uni.showToast({ 
            title: '年龄必须满18周岁', 
            icon: 'none' 
        })
        form.value.birthday = ''
        return
    }
}
function submitForm() {
    if (!form.value.name) {
        uni.showToast({ title: '请输入姓名', icon: 'none' }); return;
    }
    if (!form.value.gender) {
        uni.showToast({ title: '请选择性别', icon: 'none' }); return;
    }
    if (!form.value.birthday) {
        uni.showToast({ title: '请选择生日', icon: 'none' }); return;
    }
    if (!form.value.mobile) {
        uni.showToast({ title: '请输入手机号', icon: 'none' }); return;
    }
    if (!form.value.city) {
        uni.showToast({ title: '请选择意向工作城市', icon: 'none' }); return;
    }
    if (!form.value.image) {
        uni.showToast({ title: '请上传工作形象图', icon: 'none' }); return;
    }
    // 校验通过
    uploadFile(imageUrl.value, 'avatar', (url) => {
        form.value.image = url.path
        uni.request({
            url: tech_base_url + '/api/th/recruit/apply',
            method: 'POST',
            data:{
                name: form.value.name,
                gender: form.value.gender,
                birthday: form.value.birthday,
                mobile: form.value.mobile,
                areaId: form.value.city,
                image: form.value.image
            },
            header: tech_Header,
            timeout: timeOut,
            success: (res) => {
                if (res.data && res.data.error === 0) {
                    uni.showToast({ title: res.data.msg || '提交成功', icon: 'success' })
                } else {
                    uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' })
                }
            },
            fail: () => {
                uni.showToast({ title: '网络异常', icon: 'none' })
            }
        })
    })
}
onMounted(() => {
    getCity()
})
const imageUrl = ref('')
function uploadImage() {
    uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            imageUrl.value = res.tempFilePaths[0]
            form.value.image = res.tempFilePaths[0]
        }
    })
}
function removeImage() {
    imageUrl.value = ''
    form.value.image = ''
}
const uploadFile = (file, group = 'ugc', callback) => {
    uni.showLoading({
        title: '上传中',
    })
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: 'https://tt.ruyoung.com/api/file/upload',
            filePath: file,
            name: 'file',
            formData: {
                group,
            },
            header: {
                Accept: 'application/json',
                'app-id': tech_appid,
            },
            success: (uploadFileRes) => {
                let result
                try {
                    result = JSON.parse(uploadFileRes.data)
                } catch (e) {
                    result = uploadFileRes.data
                }
                if (result.error === 1) {
                    uni.showToast({
                        icon: 'none',
                        title: result.msg,
                    })
                    resolve(false)
                } else {
                    if (typeof callback === 'function') callback(result.data)
                    resolve(result.data)
                }
            },
            fail: (error) => {
                resolve(false)
            },
            complete: () => {
                uni.hideLoading()
            },
        })
    })
}
</script>

<style lang="scss" scoped>
.join-tech-container {
    padding: 30rpx;
    height: calc(100vh - var(--window-bottom) - 64rpx);
    background-color: #fff9f0;
}
uni-picker{
    width: 100%;
}
.join-tech-title {
    font-size: 40rpx;
    font-weight: bold;
    margin-bottom: 40rpx;
    color: #2A5CAA;
}

.form-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 32rpx;

    .label {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 12rpx;
        display: flex;
        align-items: center;
    }

    input,
    .picker-value,
    .radio-group,
    uni-datetime-picker {
        width: 100%;
        font-size: 28rpx;
        padding: 16rpx;
        border: 1px solid #eee;
        border-radius: 8rpx;
        background: #fff;
        margin-left: 0;
        margin-bottom: 0;
        box-sizing: border-box;
    }

    /* 单独调高姓名和手机号输入框 */
    input[name="name"],
    input[name="mobile"] {
        height: 80rpx;
        font-size: 30rpx;
        padding: 20rpx 16rpx;
        border-radius: 12rpx;
    }
    uni-input{
        height: 80rpx;
    }
    .picker-value {
        min-height: 44rpx;
        display: flex;
        align-items: center;
        color: #888;
    }

    .radio-label {
        margin-right: 40rpx;
        font-size: 28rpx;
        color: #333;
        display: inline-flex;
        align-items: center;
    }
}


.required {
    color: #e43d33;
    margin-right: 8rpx;
}

.upload-img-box {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 0;
    width: 200rpx;
    position: relative;
    .upload-img-wrapper {
        position: relative;
        width: 200rpx;
        height: 240rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8rpx;
    }
    .uploaded-image {
        width: 200rpx;
        height: 240rpx;
        border-radius: 8rpx;
    }
    .img-close {
        position: absolute;
        top: -16rpx;
        right: -16rpx;
        width: 40rpx;
        height: 40rpx;
        background: #fff;
        border-radius: 50%;
        color: #e43d33;
        font-size: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
        z-index: 10;
        cursor: pointer;
        border: 1px solid #eee;
    }
}

.upload-img-placeholder {
    width: 100%;
    height: 200rpx;
    background: #fff;
    border: 1px dashed #bbb;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #bbb;
    margin-bottom: 8rpx;
    box-sizing: border-box;
}

.upload-img-tip {
    font-size: 24rpx;
    color: #aaa;
}

.submit-btn {
    width: 100%;
    background: linear-gradient(90deg, #2A5CAA,#c86b4f);
    color: #fff;
    font-size: 28rpx;
    border: none;
    border-radius: 20rpx;
    height: 88rpx;
    line-height: 88rpx;
    margin-top: 40rpx;
}
.agreement-tip{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
    font-size: 24rpx;
    color: #888;
    .agreement-link{
        color: #2A5CAA;
        text-decoration: underline;
    }
}
::v-deep .uni-radio-input{

}
</style>
