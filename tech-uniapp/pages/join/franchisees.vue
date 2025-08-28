<template>
  <view class="franchisees-container">
    <view class="franchisees-topBg"></view>
    <view class="franchisees-title">这是您的创业时代</view>
    <view class="franchisees-form">
      <view class="form-item">
        <text class="label"><text class="required">*</text>您的姓名</text>
        <view class="input-row">
          <uni-icons custom-prefix="iconfont" type="icon-yezi02" size="36rpx" color="#369e73"></uni-icons>
          <input v-model="form.name" placeholder="请输入姓名" />
        </view>
      </view>
      <view class="form-item">
        <text class="label"><text class="required">*</text>代理类型</text>
        <radio-group v-model="form.agentType" @change="onAgentTypeChange">
          <label class="radio-label">
            <radio style="transform:scale(0.8)" activeBackgroundColor="#2b8d68" activeBorderColor="#2b8d68" value="1"
              :checked="form.agentType === '1'" />省代
          </label>
          <label class="radio-label">
            <radio style="transform:scale(0.8)" activeBackgroundColor="#2b8d68" activeBorderColor="#2b8d68" value="2"
              :checked="form.agentType === '2'" />城市代理
          </label>
        </radio-group>
      </view>
      <view class="form-item">
        <text class="label"><text class="required">*</text>手机号</text>
        <view class="input-row">
          <uni-icons custom-prefix="iconfont" type="icon-dianhua" size="36rpx" color="#369e73"></uni-icons>
          <input v-model="form.mobile" placeholder="请输入手机号" maxlength="11" />
        </view>
      </view>
      <view class="form-item">
        <text class="label">身份证号</text>
        <view class="input-row">
          <uni-icons custom-prefix="iconfont" type="icon-shenfenzhenghao" size="40rpx" color="#369e73"></uni-icons>
          <input v-model="form.idCard" placeholder="请输入身份证号（选填）" />
        </view>
      </view>
      <view class="form-item">
        <text class="label"><text class="required">*</text>代理区域</text>
        <view class="input-row">
          <uni-icons custom-prefix="iconfont" type="icon-31dingwei" size="40rpx" color="#369e73"></uni-icons>
          <input v-model="form.agentArea" placeholder="请输入代理区域" />
        </view>
      </view>
      <view class="form-item">
        <text class="label">推荐人</text>
        <view class="input-row">
          <uni-icons custom-prefix="iconfont" type="icon-iconfonttuijianren" size="30rpx" color="#369e73"></uni-icons>
          <input v-model="form.referrerCode" placeholder="请输入推荐码（选填）" />
        </view>
      </view>
    </view>
    <view class="tags-title">加盟优势</view>
    <view class="tags">
      <view class="tag-item">
        <uni-icons custom-prefix="iconfont" type="icon-pinpai" size="50rpx" color="#369e73"></uni-icons>
        <text class="one">品牌优势</text>
      </view>
      <view class="tag-item">
        <uni-icons custom-prefix="iconfont" type="icon-kehu" size="50rpx" color="#369e73"></uni-icons>
        <text class="one">忠实客户</text>
      </view>
      <view class="tag-item">
        <uni-icons custom-prefix="iconfont" type="icon-zengchang" size="50rpx" color="#369e73"></uni-icons>
        <text class="one">营收保障</text>
      </view>
    </view>
    <button class="submit-btn" @click="submitForm">递交梦想申请书</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const tech_base_url = 'https://tt.wuling.love'
const url = '/api/th/agent/apply'
const timeOut = 5000
const tech_appid = 'p7y04i88'
const tech_Header = {
  'app-id': tech_appid,
  'Content-Type': 'application/json',
};
const form = ref({
  name: '',
  agentType: '',
  mobile: '',
  idCard: '',
  agentArea: '',
  referrerCode: ''
})
function onAgentTypeChange(e) {
  form.value.agentType = e.detail.value
}
function submitForm() {
  if (!form.value.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' }); return;
  }
  if (!form.value.agentType) {
    uni.showToast({ title: '请选择代理类型', icon: 'none' }); return;
  }
  if (!form.value.mobile) {
    uni.showToast({ title: '请输入手机号', icon: 'none' }); return;
  }
  if (!form.value.agentArea) {
    uni.showToast({ title: '请输入代理区域', icon: 'none' }); return;
  }
  // 校验通过，提交数据
  uni.request({
    url: tech_base_url + url,
    method: 'POST',
    data: form.value,
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
}
</script>

<style lang="scss" scoped>
@import "@/static/iconfont/iconfont.css";
.franchisees-container {
  background-color: #f8f9fa;
  padding-bottom: 30rpx;
  .franchisees-topBg {
    background: url('/static/franchiseesBg.png') no-repeat center;
    height: 320rpx;
    margin-bottom: 20rpx;
  }

  .franchisees-title {
    font-size: 40rpx;
    text-align: center;
    margin-bottom: 20rpx;
    color: #2e916b;
  }

  .franchisees-form {
    width: 85%;
    background-color: #fff;
    padding: 32rpx;
    margin: 0 auto;
    border-radius: 20rpx;
    box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.1);
  }

  .tags-title {
    font-size: 32rpx;
    color: #2e916b;
    margin-bottom: 20rpx;
    text-align: center;
    margin: 50rpx 0;
  }

  .tags {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin-top: 20rpx;
    gap: 30rpx;
    .tag-item{
      width: 24%;
      border: 1px solid #f2e3c6;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10rpx;
      border-radius: 20rpx;
      font-size: 28rpx;
      background-color: #fff;
      padding: 15rpx;
      .two{
        color: #999;
        font-size: 24rpx;
      }
    }
  }
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

  .input-row {
    width: 100%;
    display: flex;
    align-items: center;
    background: #fafbfc;
    border: 1px solid #eee;
    border-radius: 8rpx;
    padding: 0 16rpx;
    box-sizing: border-box;
    margin-bottom: 0;
    margin-left: 0;
    input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 28rpx;
      height: 80rpx;
      padding: 0 0 0 12rpx;
      box-sizing: border-box;
      outline: none;
    }
  }

  .radio-label {
    margin-right: 40rpx;
    font-size: 28rpx;
    color: #333;
    display: inline-flex;
    align-items: center;
  }

  radio-group {
    width: 100%;
    margin-bottom: 0;
  }
}

.required {
  color: #e43d33;
  margin-right: 8rpx;
}

.submit-btn {
  width: 95%;
  background: #ff8c42;
  color: #fff;
  font-size: 32rpx;
  border: none;
  border-radius: 14rpx;
  height: 88rpx;
  margin-top: 30rpx;
  &::after{
    border: none;
  }
}
</style>