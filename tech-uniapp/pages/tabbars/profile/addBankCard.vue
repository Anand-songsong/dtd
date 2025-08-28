<template>
    <view class="add-bank-card">
        <tech-header title="添加银行卡" backgroundColor="#fff" titleColor="#333">
            <template #left>
                <tech-icon type="icon-xiangzuojiantou" size="32rpx" color="#333" @click="handleBack" />
            </template>
        </tech-header>

        <view class="content">
            <view class="form-title">请填写银行卡信息</view>

            <!-- 银行卡号 -->
            <view class="form-item">
                <view class="form-label">
                    <view class="form-icon">
                        <tech-icon type="icon-yinhangqia" size="32rpx" color="#999" />
                    </view>
                    <text>银行卡号</text>
                </view>
                <input class="form-input" type="number" placeholder="请输入银行卡号" v-model="formData.cardNumber"
                    maxlength="19" />
            </view>

            <!-- 开户银行 -->
            <view class="form-item" @click="showBankPicker">
                <view class="form-label">
                    <view class="form-icon">
                        <tech-icon type="icon-x-" size="32rpx" color="#999" />
                    </view>
                    <text>开户银行</text>
                </view>
                <view class="form-select">
                    <view :class="formData.bankName ? 'selected' : 'placeholder'">
                        {{ formData.bankName || '请选择开户银行' }}
                    </view>
                    <tech-icon type="icon-xiajiantou" size="32rpx" color="#999" />
                </view>
            </view>

            <!-- 开户城市 -->
            <view class="form-item" @click="showCityPicker">
                <view class="form-label">
                    <view class="form-icon">
                        <tech-icon type="icon-chengshi" size="32rpx" color="#999" />
                    </view>
                    <text>开户城市</text>
                </view>
                <view class="form-select">
                    <text :class="formData.city ? 'selected' : 'placeholder'">
                        {{ formData.city || '请选择开户城市' }}
                    </text>
                    <tech-icon type="icon-xiajiantou" size="28rpx" color="#999" @click="showCityPicker" />
                </view>
            </view>

            <!-- 持卡人姓名 -->
            <view class="form-item">
                <view class="form-label">
                    <view class="form-icon">
                        <tech-icon type="icon-xingming" size="32rpx" color="#999" />
                    </view>
                    <text>持卡人姓名</text>
                </view>
                <input class="form-input" disabled type="text" placeholder="请输入持卡人姓名"
                    v-model="formData.cardholderName" />
            </view>

            <!-- 手机号码 -->
            <view class="form-item">
                <view class="form-label">
                    <view class="form-icon">
                        <tech-icon type="icon-shoujihaoma" size="32rpx" color="#999" />
                    </view>
                    <text>手机号码</text>
                </view>
                <input class="form-input" type="number" placeholder="请输入银行预留手机号" v-model="formData.mobileNumber"
                    maxlength="11" />
            </view>

            <!-- 协议勾选 -->
            <view class="agreement">
                <view class="agreement-text">
                    <checkbox-group  @change="toggleAgreement">
                        <label>
                            <checkbox value="isAgreed" :checked="isAgreed" color="var(--theme-color)"
                                style="transform:scale(0.7)" />
                        </label>
                    </checkbox-group>
                    我已阅读并同意

                    <text class="link" @click="showAgreement">《用户服务协议》</text>
                </view>
            </view>

            <!-- 确认按钮 -->
            <button class="confirm-btn" @click="handleSubmit">
                确认添加
            </button>

            <!-- 提示信息 -->
            <view class="tips">
                <view class="tip-item">• 最多可绑定3张银行卡</view>
                <view class="tip-item">• 默认使用第一张绑定的银行卡作为提现账户</view>
                <view class="tip-item">• 提现到账时间: 1-2个工作日</view>
            </view>
        </view>

        <!-- 银行选择弹窗 -->
        <tech-popup ref="bankPickerRef" position="bottom" width="95%" height="600rpx">
            <view class="picker-container">
                <view class="picker-header">
                    <text @click="bankPickerRef.close()">取消</text>
                    <text>选择银行</text>
                    <text @click="confirmBank">确定</text>
                </view>
                <picker-view class="picker-view" :value="bankIndex" @change="onBankChange">
                    <picker-view-column>
                        <view class="picker-item" v-for="(bank, index) in bankList" :key="index">
                            {{ bank.name }}
                        </view>
                    </picker-view-column>
                </picker-view>
            </view>
        </tech-popup>

        <!-- 省市区选择弹窗 -->
        <tech-popup ref="cityPickerRef" height="600rpx" width="100vw" position="bottom">
            <view class="picker-container">
                <view class="picker-header">
                    <text @click="cityPickerRef.close()">取消</text>
                    <text>选择地区</text>
                    <text @click="confirmCity">确定</text>
                </view>
                <picker-view class="picker-view" :value="getValidCityIndex" @change="onCityChange"
                    v-if="provinceCityTree && provinceCityTree.length > 0 && getValidCityIndex.length === 2">
                    <!-- 省份选择 -->
                    <picker-view-column>
                        <view class="picker-item" v-for="(province, index) in provinceCityTree" :key="index">
                            {{ province.name }}
                        </view>
                    </picker-view-column>
                    <!-- 城市选择 -->
                    <picker-view-column>
                        <view class="picker-item" v-for="(city, index) in currentCities" :key="index">
                            {{ city.name }}
                        </view>
                    </picker-view-column>
                </picker-view>
                <view v-else class="loading-container">
                    <text>加载中...</text>
                </view>
            </view>
        </tech-popup>
    </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { bindBankCard, getUserDetail } from '@/api/my'
import { useStore } from 'vuex'
const store = useStore()
const provinceCityTree = computed(() => store.state.provinceCityTree)
// 表单数据
const formData = ref({
    cardNumber: '',
    bankName: '',
    city: '',
    cardholderName: '',
    mobileNumber: '',
    provId: '', // 办卡所在省份编码
    areaId: ''  // 办卡所在城市编码
})

// 协议勾选状态
const isAgreed = ref(false)

// 银行选择相关
const showBank = ref(false)
const bankIndex = ref([0])
const bankList = ref([
    { name: '中国工商银行', code: 'ICBC' },
    { name: '中国农业银行', code: 'ABC' },
    { name: '中国银行', code: 'BOC' },
    { name: '中国建设银行', code: 'CCB' },
    { name: '交通银行', code: 'BOCOM' },
    { name: '招商银行', code: 'CMB' },
    { name: '中信银行', code: 'CITIC' },
    { name: '华夏银行', code: 'HXB' },
    { name: '民生银行', code: 'CMBC' },
    { name: '兴业银行', code: 'CIB' },
    { name: '广发银行', code: 'GDB' },
    { name: '平安银行', code: 'PAB' },
    { name: '浦发银行', code: 'SPDB' },
    { name: '光大银行', code: 'CEB' }
])
// 省市选择相关
const cityPickerRef = ref(null)
const cityIndex = ref([0, 0]) // [省份索引, 城市索引]

// 当前选中的城市列表
const currentCities = computed(() => {
    if (!provinceCityTree.value || provinceCityTree.value.length === 0) return []
    const provinceIndex = Math.max(0, Math.min(cityIndex.value[0] || 0, provinceCityTree.value.length - 1))
    const province = provinceCityTree.value[provinceIndex]
    return province?.children || []
})

// 确保 cityIndex 始终是有效的数组
const getValidCityIndex = computed(() => {
    // 确保 cityIndex 是有效的数组且长度为2
    if (!cityIndex.value || !Array.isArray(cityIndex.value) || cityIndex.value.length !== 2) {
        return [0, 0]
    }

    // 只进行基本的数字转换，不进行边界限制
    const validIndex = [
        parseInt(cityIndex.value[0]) || 0,
        parseInt(cityIndex.value[1]) || 0
    ]

    return validIndex
})

// 计算属性：是否可以提交
const canSubmit = computed(() => {
    return formData.value.cardNumber &&
        formData.value.bankName &&
        formData.value.city &&
        formData.value.cardholderName &&
        formData.value.mobileNumber &&
        isAgreed.value
})

// 返回上一页
function handleBack() {
    uni.navigateBack()
}

// 显示银行选择器
function showBankPicker() {
    bankPickerRef.value.open()
}

// 显示城市选择器
function showCityPicker() {
    if (!provinceCityTree.value || provinceCityTree.value.length === 0) {
        uni.showToast({
            title: '省市区数据加载中，请稍后重试',
            icon: 'none'
        })
        return
    }
    cityPickerRef.value.open()
}

// 银行选择变化
function onBankChange(e) {
    bankIndex.value = e.detail.value
}

// 省市选择变化
function onCityChange(e) {
    const newIndex = e.detail.value

    // 确保 newIndex 是有效的数组
    if (!newIndex || !Array.isArray(newIndex)) {
        return
    }

    // 如果数组长度不是2，进行调整
    let validNewIndex = [...newIndex]
    if (validNewIndex.length > 2) {
        validNewIndex = validNewIndex.slice(0, 2)
    } else if (validNewIndex.length < 2) {
        const paddedArray = [...validNewIndex, ...Array(2 - validNewIndex.length).fill(0)]
        validNewIndex = paddedArray
    }

    // 确保所有索引都是有效的数字，但不进行边界限制
    validNewIndex = validNewIndex.map((val, index) => {
        return parseInt(val) || 0;
    });

    // 如果省份发生变化，重置城市索引
    if (validNewIndex[0] !== cityIndex.value[0]) {
        validNewIndex[1] = 0
    }

    cityIndex.value = validNewIndex
}
const bankPickerRef = ref(null)
// 确认银行选择
function confirmBank() {
    const index = bankIndex.value[0]
    formData.value.bankName = bankList.value[index].name
    bankPickerRef.value.close()
}

// 确认省市选择
function confirmCity() {
    const [provinceIndex, cityIndexValue] = cityIndex.value

    // 获取选中的省份
    const province = provinceCityTree.value[provinceIndex]
    if (!province) return

    // 获取选中的城市
    const city = currentCities.value[cityIndexValue]
    if (!city) return

    // 设置表单数据
    formData.value.provId = province.value.toString()
    formData.value.areaId = city.value.toString()

    // 设置显示的城市名称
    formData.value.city = `${province.name}-${city.name}`

    cityPickerRef.value.close()
}

// 切换协议勾选状态
function toggleAgreement(e) {
    isAgreed.value = !isAgreed.value
}

// 显示协议
function showAgreement() {
    uni.navigateTo({
        url: '/pages/tabbars/profile/rule'
    })
}

// 提交表单
async function handleSubmit() {
    // if (!canSubmit.value) {
    //     uni.showToast({
    //         title: '请完善所有信息并同意协议',
    //         icon: 'none'
    //     })
    //     return
    // }
    //验证阅读协议
    if (!isAgreed.value) {
        uni.showToast({
            title: '请阅读并同意用户服务协议',
            icon: 'none'
        })
        return
    }
    // 验证银行卡号
    if (!/^\d{16,19}$/.test(formData.value.cardNumber)) {
        uni.showToast({
            title: '请输入正确的银行卡号',
            icon: 'none'
        })
        return
    }
    //验证区域选择
    if (!formData.value.provId || !formData.value.areaId) {
        uni.showToast({
            title: '请选择开户城市',
            icon: 'none'
        })
        return
    }
    //验证开户银行
    if (!formData.value.bankName) {
        uni.showToast({
            title: '请选择开户银行',
            icon: 'none'
        })
        return
    }
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(formData.value.mobileNumber)) {
        uni.showToast({
            title: '请输入正确的手机号',
            icon: 'none'
        })
        return
    }

    try {
        uni.showLoading({ title: '添加中...' })

        // 调用API添加银行卡
        const result = await bindBankCard({
            cardNo: formData.value.cardNumber,
            bankName: formData.value.bankName,
            // city: formData.value.city,
            // cardholderName: formData.value.cardholderName,
            mobile: formData.value.mobileNumber,
            provId: formData.value.provId,
            areaId: formData.value.areaId,
        })

        uni.hideLoading()

        if (result.code === 200) {
            uni.showToast({
                title: '添加成功',
                icon: 'success'
            })

            // 延迟返回上一页
            setTimeout(() => {
                uni.navigateBack()
            }, 100)
        } else {
            uni.showToast({
                title: result.message || '添加失败',
                icon: 'none'
            })
        }
    } catch (error) {
        uni.hideLoading()
        uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
        })
    }
}

// 监听省市区数据变化
watch(provinceCityTree, (newVal) => {
    if (newVal && newVal.length > 0) {
    }
}, { immediate: true })

// 监听城市索引数组，确保最多只有2个值
watch(cityIndex, (newVal) => {
    if (newVal && Array.isArray(newVal)) {
        // 如果数组长度超过2，截取前2个值
        if (newVal.length > 2) {
            cityIndex.value = newVal.slice(0, 2)
        }
        // 如果数组长度不足2，补充0
        else if (newVal.length < 2) {
            const paddedArray = [...newVal, ...Array(2 - newVal.length).fill(0)]
            cityIndex.value = paddedArray
        }

        // 调试信息：显示当前选中的项目
        if (newVal.length === 2) {
            const provinceIndex = newVal[0]
            const cityIndex = newVal[1]

            const province = provinceCityTree.value?.[provinceIndex]
            const city = currentCities.value?.[cityIndex]

        }
    } else {
        // 如果不是数组或为空，重置为默认值
        cityIndex.value = [0, 0]
    }
}, { deep: true, immediate: true })

onShow(() => {
    getUserDetail().then(res => {
        formData.value.cardholderName = res.data?.name
    })
})
</script>

<style lang="scss" scoped>
.add-bank-card {
    background: var(--background-color);
    min-height: 100vh;
    width: 100%;
}

.content {
    padding: 40rpx;
}

.form-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #000;
    margin-bottom: 40rpx;
}

.form-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.form-icon {
    width: 60rpx;
    height: 60rpx;
    background: #F3F4F6;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 16rpx;
    font-size: 32rpx;
    color: #333;
    min-width: 200rpx;
}

.form-input {
    flex: 1;
    text-align: right;
    font-size: 32rpx;
    color: #333;
}

.form-select {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex: 1;
    justify-content: flex-end;
    font-size: 32rpx;
}

.selected {
    color: #333;
    font-size: 32rpx;
}

.placeholder {
    color: #999;
    font-size: 32rpx;
}

.agreement {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin: 40rpx 0;
}

.checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
}

.agreement-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.link {
    color: var(--theme-color);
}

.confirm-btn {
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    background: linear-gradient(90deg, var(--theme-color) 0%, var(--theme-color-linear) 100%);
    color: #fff;
    border-radius: 20rpx;
    font-size: 32rpx;
    margin: 40rpx 0;

    &::after {
        border: none;
    }
}

.tips {
    padding: 24rpx;
    background: #F3F4F6;
    border-radius: 16rpx;
}

.tip-item {
    font-size: 28rpx;
    color: #4B5563;
    line-height: 1.8;
}

.picker-container {
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    width: 100%;
    overflow: hidden;
}

.picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    font-size: 32rpx;

    text:first-child {
        color: #999;
    }

    text:nth-child(2) {
        color: #333;
        font-weight: bold;
    }

    text:last-child {
        color: var(--theme-color);
    }
}

.picker-view {
    height: 400rpx;
    width: 100%;
}

.picker-item {
    text-align: center;
    white-space: nowrap;
}

.loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400rpx;
    font-size: 28rpx;
    color: #999;
}
</style>