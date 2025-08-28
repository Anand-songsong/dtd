<template>
  <view class="user-info-page">
    <!-- 顶部头部栏 -->
    <view class="header-fixed">
      <tech-header title="个人信息" backgroundColor="#fff" titleColor="#222">
        <template #left>
          <tech-icon type="icon-xiangzuojiantou" size="32rpx" color="#222" @click="handleBack" />
        </template>
      </tech-header>
    </view>
    <view class="user-info-bg">修改内容后记得点击保存修改按钮</view>
    <!-- 资料卡片 -->
    <view class="profile-card">
      <view class="profile-progress-row">
        <view class="progress-label">资料完整度 {{ userInfo.completeness }}%</view>
        <view class="progress-bar">
          <view class="progress-inner" :style="{ width: userInfo.completeness + '%' }"></view>
        </view>
        <view class="profile-progress-tip">完善个人资料，提升接单率</view>
      </view>

      <button class="profile-btn">立即完善</button>
    </view>

    <!-- 基本信息 -->
    <view class="info-card">
      <view class="info-title">基本信息</view>
      <view class="info-list">
        <view class="info-item info-item-required">
          <view class="info-label">姓名 <text class="required">*</text></view>
          <view class="info-value">{{ userInfo.name }}</view>
        </view>
        <view class="info-item info-item-required">
          <view class="info-label">性别<text class="required">*</text></view>
          <view class="info-value">{{ userInfo.gender === 1 ? '女' : '男' }}</view>
        </view>
        <view class="info-item info-item-required">
          <view class="info-label">年龄<text class="required">*</text></view>
          <view class="info-value">{{ userInfo.age }}岁</view>
        </view>
        <view class="info-item info-item-required">
          <view class="info-label">手机号码 <text class="required">*</text></view>
          <view class="info-value">{{ userInfo?.mobile?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</view>
        </view>
        <view class="info-item info-item-normal">
          <view class="info-label">微信号</view>
          <view class="info-value">{{ userInfo.weixin }}</view>
          <tech-icon type="icon-tianxie" size="24rpx" color="#bbb" @click="handleWeixinEdit" />
        </view>
      </view>
    </view>

    <!-- 职业资质 -->
    <view class="info-card">
      <view class="info-title">职业资质</view>
      <view class="info-list">
        <view class="info-item">
          <view class="info-label">从业年限</view>
          <view class="info-value" style="margin-left: auto; margin-right: 10rpx;">{{ userInfo.workYear }}年</view>
          <tech-icon type="icon-tianxie" size="24rpx" color="#bbb" @click="handleWorkYearEdit" />
        </view>
        <view class="info-item info-certificate-item">
          <view class="info-title-row">
            <text class="text">持有证书</text>
            <view class="info-upload" @click="handleUploadCertificate">上传证书 +</view>
          </view>
          <view class="cert-list">
            <view v-for="(img, idx) in certificateList" :key="idx" class="cert-item">
              <image :src="img" class="cert-img" mode="aspectFill" @tap="previewImage(certificateList, idx)" />
              <view class="cert-del" @click="handleDelCertificate(idx)">
                <tech-icon type="icon-guanbi-quxiao" size="24rpx" color="#fff" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 专业技能 -->
    <view class="info-card">
      <view class="info-title-row">
        <view class="info-title">专业技能</view>
        <view class="info-add" @click="handleAddSkill">添加 +</view>
      </view>
      <view class="skill-tags">
        <view class="skill-tag" v-for="(tag, idx) in userInfo.skillTag" :key="idx">
          {{ tag }}
          <tech-icon type="icon-guanbi-quxiao" size="20rpx" color="var(--theme-color)" @click="handleDelSkill(idx)" />
        </view>
      </view>
    </view>
    <!-- 个人相册 -->
    <view class="info-card">
      <view class="info-title-row">
        <view class="info-title">
          <tech-icon type="icon-tupian" size="28rpx" color="var(--theme-color)" style="margin-right: 8rpx;" />个人相册

        </view>
        <view class="info-add">{{ photoList.length }}/9</view>
      </view>
      <tech-draggle v-model="photoList" :max-count="9" :show-reorder-tip="true" @del="handleDelPhoto"
        @add="handleAddPhoto" @reorder="handlePhotoReorder" />
    </view>
    <!-- 个人短视频 -->
    <view class="info-card">
      <view class="info-title-row">
        <view class="info-title">
          <tech-icon type="icon-shipin" size="28rpx" color="var(--theme-color)" style="margin-right: 8rpx;" />个人短视频
        </view>
        <view class="info-add">{{ videoList.length }}/5</view>
      </view>
      <view class="video-list">
        <view class="video-item" v-for="(video, idx) in videoList" :key="idx">
          <view class="video-cover">
            <!-- <image :src="video.cover" class="video-cover" mode="aspectFill" /> -->
            <tech-video :src="video.src" :unique-id="`video_${idx}`" @loadeddata="handleLoadeddata" />
          </view>

          <view class="video-title">{{ video.title }}</view>
          <view class="video-time">{{ video.time }}</view>
          <view class="video-actions">
            <view class="video-edit" @click="handleEditVideo(idx)">编辑</view>
            <view class="video-del" @click="handleDelVideo(idx)">删除</view>
          </view>
        </view>
      </view>
      <button class="video-add-btn" v-if="videoList.length < 5" @click="handleAddVideo">+ 添加视频</button>
    </view>
    <view class="info-card">
      <view class="info-title-row">
        <view class="info-title">
          服务描述
        </view>
      </view>
      <textarea class="service-description" maxlength="200" v-model="userInfo.serviceDescription"
        placeholder="请输入服务描述" />
      <view class="max-length">
        <text>{{ userInfo?.serviceDescription?.length }}</text>/200
      </view>
    </view>
    <view class="footer-fixed">
      <view class="footer-btn" :class="{ 'disabled': isSaving }" @click="handleUpdate">
        <view class="footer-btn-item">
          <text v-if="isSaving">保存中...</text>
          <text v-else>保存修改</text>
        </view>
      </view>
    </view>
    <tech-popup ref="weixinPopup" height="300rpx" width="580rpx" title="修改微信号" type="center"
      @confirm="handleWeixinConfirm" @cancel="handleWeixinCancel">
      <view class="popup-content">
        <view class="popup-content-item">
          <view class="popup-content-item-label">修改微信号</view>
          <view class="popup-content-item-input">
            <input type="text" v-model="currentWX" placeholder="请输入微信号" />
          </view>
          <view class="popup-content-item-button">
            <view class="popup-content-item-button-item cancel" @click="handleWeixinCancel">取消</view>
            <view class="popup-content-item-button-item confirm" @click="handleWeixinConfirm">确认</view>
          </view>
        </view>
      </view>
    </tech-popup>
    <!-- 证书popup -->
    <tech-popup ref="certificatePopup" width="580rpx" height="700rpx" title="上传证书" type="center"
      @confirm="handleUploadCertificateConfirm" @cancel="handleUploadCertificateCancel">
      <view class="certificate-popup">
        <view class="certificate-popup-content">
          <view class="certificate-popup-content-item">
            <view class="certificate-popup-content-item-label">证书名称</view>
            <view class="certificate-popup-content-item-input">
              <input type="text" v-model="currentCertificate.name" placeholder="请输入证书名称" />
            </view>
            <view class="certificate-popup-content-item-label">证书图片</view>
            <view class="certificate-popup-content-item-upload" @click="handleSelectCertificateImage">
              <view v-if="!currentCertificate.tempUrl" class="upload-placeholder">
                <tech-icon type="icon-tupian" size="48rpx" color="#bbb" />
                <text>点击上传图片</text>
              </view>
              <image v-else :src="currentCertificate.tempUrl" class="upload-preview" mode="aspectFill" />
            </view>
          </view>
          <view class="certificate-popup-content-item-button">
            <view class="certificate-popup-content-item-button-item cancel" @click="handleUploadCertificateCancel"> 取消
            </view>
            <view class="certificate-popup-content-item-button-item confirm" @click="handleUploadCertificateConfirm"> 确认
            </view>
          </view>
        </view>
      </view>
    </tech-popup>
    <!-- 视频popup -->
    <tech-popup ref="videoPopup" width="580rpx" :height="currentVideo.isEdit ? '350rpx' : '680rpx'"
      :title="currentVideo.isEdit ? '编辑视频' : '添加视频'" type="center" @confirm="handleVideoConfirm"
      @cancel="handleVideoCancel">
      <view class="video-popup">
        <view class="video-popup-content">
          <view class="video-popup-content-item">
            <view class="video-popup-content-item-label">视频名称</view>
            <view class="video-popup-content-item-input">
              <input type="text" v-model="currentVideo.name" placeholder="请输入视频名称" />
            </view>
            <view class="video-popup-content-item-label" v-if="!currentVideo.isEdit">视频文件</view>
            <view class="video-popup-content-item-upload" @click="handleSelectVideo" v-if="!currentVideo.isEdit">
              <view v-if="!currentVideo.tempUrl" class="upload-placeholder">
                <tech-icon type="icon-shipin" size="48rpx" color="#bbb" />
                <text>点击上传视频</text>

              </view>
              <view v-else class="video-preview">
                <tech-video :src="currentVideo.tempUrl" width="100%" height="100%" />
              </view>
            </view>
          </view>
          <view class="video-popup-content-item-button">
            <view class="video-popup-content-item-button-item cancel" @click="handleVideoCancel"> 取消 </view>
            <view class="video-popup-content-item-button-item confirm" @click="handleVideoConfirm"> {{
              currentVideo.isEdit ?
                '保存' : '添加' }} </view>
          </view>
        </view>
      </view>
    </tech-popup>
    <!-- 技能popup -->
    <tech-popup ref="skillPopup" height="300rpx" width="580rpx" title="添加技能" type="center"
      @confirm="handleAddSkillConfirm" @cancel="handleAddSkillCancel">
      <view class="popup-content">
        <view class="popup-content-item">
          <view class="popup-content-item-label">技能名称</view>
          <view class="popup-content-item-input">
            <input type="text" v-model="currentSkill" placeholder="多个技能请用逗号隔开" />
          </view>
          <view class="popup-content-item-button">
            <view class="popup-content-item-button-item cancel" @click="handleAddSkillCancel"> 取消 </view>
            <view class="popup-content-item-button-item confirm" @click="handleAddSkillConfirm"> 确认 </view>
          </view>
        </view>
      </view>
    </tech-popup>

    <!-- 从业年限popup -->
    <tech-popup ref="workYearPopup" height="560rpx" title="修改从业年限" type="bottom" @confirm="handleWorkYearConfirm"
      @cancel="handleWorkYearCancel">
      <view class="work-year-popup">
        <view class="work-year-popup-content">
          <view class="work-year-popup-content-item">
            <view class="work-year-popup-content-item-label">选择从业年限</view>
            <picker-view :value="workYearIndex" @change="handleWorkYearChange" class="work-year-picker"
              indicator-style="height: 80rpx;"
              mask-top-style="background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.4));"
              mask-bottom-style="background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.4));">
              <picker-view-column>
                <view class="picker-item" v-for="year in workYearOptions" :key="year">
                  {{ year }}年
                </view>
              </picker-view-column>
            </picker-view>
          </view>
          <view class="work-year-popup-content-item-button">
            <view class="work-year-popup-content-item-button-item cancel" @click="handleWorkYearCancel"> 取消 </view>
            <view class="work-year-popup-content-item-button-item confirm" @click="handleWorkYearConfirm"> 确认 </view>
          </view>
        </view>
      </view>
    </tech-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getCurrentUserInfo, updateUserInfo, getUserDetail } from '@/api/my'
import { onShow } from '@dcloudio/uni-app'
import { getImage, uploadFile } from "@/utils/request"
onShow(() => {
  // 如果正在保存，则不调用 getUserInfo
  if (isSaving.value) {
    // console.log('正在保存，跳过 getUserInfo')
    return
  }
  
  getUserInfo()
  // 初始化从业年限选项
  initWorkYearOptions()
})
const userInfo = ref({})
//更新的数据
const updateData = ref({})
//证书图片列表
const certificateList = ref([])
//个人相册
const photoList = ref([])
//个人短视频
const videoList = ref([])
//修改微信号
const weixinPopup = ref(null)
//当前编辑的证书数据
const currentCertificate = ref({
  name: '',
  tempUrl: '',
  tempFilePath: ''
})
//当前编辑的视频数据
const currentVideo = ref({
  name: '',
  tempUrl: '',
  tempFilePath: '',
  duration: '',
  isEdit: false,
  editIndex: -1
})
//当前编辑的技能
const currentSkill = ref('')
//技能弹窗
const skillPopup = ref(null)
//从业年限弹窗
const workYearPopup = ref(null)
//从业年限选项（1-100年）
const workYearOptions = ref([])
//当前选中的从业年限索引
const workYearIndex = ref([0])
//待上传的证书列表
const pendingCertificates = ref([])
//待上传的相册列表
const pendingPhotos = ref([])
//待上传的视频列表
const pendingVideos = ref([])
//视频弹窗
const videoPopup = ref(null)
// 标记是否正在保存（包括文件上传和保存操作）
const isSaving = ref(false)
function handleLoadeddata(e) {
  const duration = e.duration
  const src = e.src // 获取视频src
  // 根据视频src找到对应的视频并更新时长
  if (src) {
    const videoIndex = videoList.value.findIndex(video => video.src === src)

    if (videoIndex !== -1 && videoList.value[videoIndex]) {
      videoList.value[videoIndex].time = duration
    }
  }
}
//图片顺序映射：用于跟踪拖拽后的图片顺序
const photoOrderMap = ref(new Map())
async function getUserInfo() {
  await getUserDetail().then(async res => {
    userInfo.value = res.data
    // 深拷贝保存原始数据，避免引用问题
    updateData.value = JSON.parse(JSON.stringify(res.data))
    currentWX.value = res.data.weixin

    // 清空现有列表
    certificateList.value = []
    photoList.value = []
    videoList.value = []

    // 处理证书数据
    if (res.data.certificateJson && res.data.certificateJson.length > 0) {
      for (let index = 0; index < res.data.certificateJson.length; index++) {
        const element = res.data.certificateJson[index];
        certificateList.value.push(await getImage(element.url))
      }
    }

    // 处理相册数据
    if (res.data.albumJson && res.data.albumJson.length > 0) {
      for (let index = 0; index < res.data.albumJson.length; index++) {
        const element = res.data.albumJson[index];
        const imageUrl = await getImage(element.url)
        photoList.value.push(imageUrl)

        // 为现有图片也添加到待上传列表（用于顺序管理）
        pendingPhotos.value.push({
          name: element.name || `photo_${index}`,
          tempFilePath: imageUrl,
          tempUrl: imageUrl,
          isExisting: true,
          originalUrl: element.url
        })
      }
      // 初始化图片顺序映射
      updatePhotoOrderMap(photoList.value)
    }

    // 处理视频数据
    if (res.data.videoJson && res.data.videoJson.length > 0) {
      for (let index = 0; index < res.data.videoJson.length; index++) {
        const element = res.data.videoJson[index];
        videoList.value.push({
          src: await getImage(element.url),
          title: element.name || '视频',
          time: element.duration ? formatDuration(parseInt(element.duration)) : '00:00'
        })
      }
    }
  })
}
// 添加技能
function handleAddSkill() {
  currentSkill.value = ''
  skillPopup.value.open()
}
// 添加技能确认
function handleAddSkillConfirm() {
  if (!currentSkill.value.trim()) {
    uni.showToast({
      title: '请输入技能名称',
      icon: 'none'
    })
    return
  }

  // 解析技能字符串，支持中文逗号和英文逗号
  let skills = []
  if (currentSkill.value.includes(',') || currentSkill.value.includes('，')) {
    // 先按英文逗号分割，再按中文逗号分割
    skills = currentSkill.value
      .split(/[,，]/) // 同时支持英文逗号和中文逗号
      .map(skill => skill.trim()) // 去除空格
      .filter(skill => skill) // 过滤空字符串
  } else {
    // 没有逗号，作为单个技能
    skills = [currentSkill.value.trim()]
  }

  if (skills.length === 0) {
    uni.showToast({
      title: '请输入有效的技能名称',
      icon: 'none'
    })
    return
  }

  // 添加到用户技能列表
  if (!userInfo.value.skillTag) {
    userInfo.value.skillTag = []
  }

  // 避免重复添加
  skills.forEach(skill => {
    if (!userInfo.value.skillTag.includes(skill)) {
      userInfo.value.skillTag.push(skill)
    }
  })

  skillPopup.value.close()
  // uni.showToast({
  //   title: '技能添加成功',
  //   icon: 'success'
  // })
}
// 添加技能取消
function handleAddSkillCancel() {
  skillPopup.value.close()
}
// 预览图片
function previewImage(imageList, current) {
  uni.previewImage({
    urls: imageList,
    current: current
  })
}

function handleDelPhoto(deletedPhoto) {
  uni.showModal({
    title: '提示',
    content: '确定删除该图片吗？',
    success: (res) => {
      if (res.confirm) {
        
        // 找到要删除的图片在photoList中的索引
        const photoIndex = photoList.value.indexOf(deletedPhoto)
        if (photoIndex === -1) {
          return
        }
        
        // 从显示列表中删除
        photoList.value.splice(photoIndex, 1)

        // 如果删除的是现有图片，也要从userInfo.value.albumJson中删除
        if (userInfo.value.albumJson && userInfo.value.albumJson.length > photoIndex) {
          userInfo.value.albumJson.splice(photoIndex, 1)
        }

        // 从待上传列表中删除对应的项
        // 删除所有匹配的项（处理重复图片的情况）
        const pendingIndices = []
        pendingPhotos.value.forEach((item, index) => {
          if (item.tempUrl === deletedPhoto) {
            pendingIndices.push(index)
          }
        })
        
        // 从后往前删除，避免索引变化
        for (let i = pendingIndices.length - 1; i >= 0; i--) {
          pendingPhotos.value.splice(pendingIndices[i], 1)
        }
        


        // 更新图片顺序映射
        updatePhotoOrderMap(photoList.value)
      }
    }
  })
}

// 删除视频
function handleDelVideo(idx) {
  uni.showModal({
    title: '提示',
    content: '确定删除该视频吗？',
    success: (res) => {
      if (res.confirm) {
        const deletedVideo = videoList.value[idx]
        videoList.value.splice(idx, 1)

        // 如果删除的是待上传的视频，也要从待上传列表中删除
        const pendingIndex = pendingVideos.value.findIndex(item => item.tempFilePath === deletedVideo.src)
        if (pendingIndex !== -1) {
          pendingVideos.value.splice(pendingIndex, 1)
        }

        // 删除userInfo.value.videoJson中对应的数据
        if (userInfo.value.videoJson && userInfo.value.videoJson.length > idx) {
          userInfo.value.videoJson.splice(idx, 1)
        }
      }
    }
  })
}

// 删除证书
function handleDelCertificate(idx) {
  uni.showModal({
    title: '提示',
    content: '确定删除该证书吗？',
    success: (res) => {
      if (res.confirm) {
        const deletedCert = certificateList.value[idx]
        certificateList.value.splice(idx, 1)

        // 如果删除的是待上传的证书，也要从待上传列表中删除
        const pendingIndex = pendingCertificates.value.findIndex(item => item.tempUrl === deletedCert)
        if (pendingIndex !== -1) {
          pendingCertificates.value.splice(pendingIndex, 1)
        }

        // 删除userInfo.value.certificateJson中对应的数据
        if (userInfo.value.certificateJson && userInfo.value.certificateJson.length > idx) {
          userInfo.value.certificateJson.splice(idx, 1)
        }
      }
    }
  })
}
function handleBack() {
  uni.navigateBack()
}
// 添加相册图片
function handleAddPhoto() {
  //限制一次只能选一张图片
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 检查文件大小限制（10MB）
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (res.tempFiles[0].size > maxSize) {
        uni.showToast({
          title: '图片大小不能超过10MB',
          icon: 'none'
        })
        return
      }

      // 兼容安卓和iOS
      const filePath = res.tempFiles[0].path || res.tempFiles[0].tempFilePath || res.tempFilePaths[0]

      // 生成随机名称
      const randomName = 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

      // 添加到待上传列表
      pendingPhotos.value.push({
        name: randomName,
        tempFilePath: filePath,
        tempUrl: filePath
      })

      // 添加到显示列表
      photoList.value.push(filePath)

      // 更新图片顺序映射
      updatePhotoOrderMap(photoList.value)
    },
    fail: (err) => {
      console.log('选择图片失败', err)
    }
  })
}

// 添加视频
function handleAddVideo() {
  // 重置当前视频数据
  currentVideo.value = {
    name: '',
    tempUrl: '',
    tempFilePath: '',
    duration: '',
    isEdit: false,
    editIndex: -1
  }
  videoPopup.value.open()
}

// 编辑视频
function handleEditVideo(idx) {
  const video = videoList.value[idx]
  currentVideo.value = {
    name: video.title,
    tempUrl: video.src,
    tempFilePath: video.src,
    duration: video.time,
    isEdit: true,
    editIndex: idx,
    originalName: video.title // 保存原始名称用于比较
  }
  videoPopup.value.open()
}

// 选择视频
function handleSelectVideo() {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    success: (res) => {
      // 检查文件大小限制（50MB）
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (res.size > maxSize) {
        uni.showToast({
          title: '视频大小不能超过50MB',
          icon: 'none'
        })
        return
      }

      currentVideo.value.tempUrl = res.tempFilePath
      currentVideo.value.tempFilePath = res.tempFilePath
      currentVideo.value.duration = formatDuration(res.duration)
    },
    fail: (err) => {
      console.log('选择视频失败', err)
    }
  })
}

// 确认视频操作
function handleVideoConfirm() {
  if (!currentVideo.value.name.trim()) {
    uni.showToast({
      title: '请输入视频名称',
      icon: 'none'
    })
    return
  }
  if (!currentVideo.value.tempUrl) {
    uni.showToast({
      title: '请选择视频文件',
      icon: 'none'
    })
    return
  }

  if (currentVideo.value.isEdit) {
    // 编辑模式：更新现有视频
    const idx = currentVideo.value.editIndex
    const originalVideo = videoList.value[idx]

    // 更新显示列表
    videoList.value[idx] = {
      src: currentVideo.value.tempUrl,
      title: currentVideo.value.name,
      time: currentVideo.value.duration
    }

    // 检查是否有实际变化
    const hasVideoChanged = currentVideo.value.tempFilePath !== originalVideo.src
    const hasNameChanged = currentVideo.value.name !== currentVideo.value.originalName

    // 如果视频文件改变了，添加到待上传列表
    if (hasVideoChanged) {
      pendingVideos.value.push({
        name: currentVideo.value.name,
        tempFilePath: currentVideo.value.tempFilePath,
        duration: currentVideo.value.duration,
        editIndex: idx // 标记这是编辑的视频
      })
    }

    // 如果只是名称改变了，添加到待更新列表
    if (!hasVideoChanged && hasNameChanged) {
      // 更新现有视频的名称
      if (userInfo.value.videoJson && userInfo.value.videoJson[idx]) {
        userInfo.value.videoJson[idx].name = currentVideo.value.name
      }
    }
  } else {
    // 添加模式：添加新视频
    // 添加到待上传列表
    pendingVideos.value.push({
      name: currentVideo.value.name,
      tempFilePath: currentVideo.value.tempFilePath,
      duration: currentVideo.value.duration
    })

    // 添加到显示列表
    videoList.value.push({
      src: currentVideo.value.tempUrl,
      title: currentVideo.value.name,
      time: currentVideo.value.duration
    })
  }

  videoPopup.value.close()
}

// 取消视频操作
function handleVideoCancel() {
  videoPopup.value.close()
}

// 处理照片重新排序
function handlePhotoReorder(data) {
  if (data.isReordered) {

    // 更新图片顺序映射
    updatePhotoOrderMap(data.newList)

    // 重新排序待上传列表以匹配新的图片顺序
    reorderPendingPhotos(data.newList)

  } else {

  }
}

// 更新图片顺序映射
function updatePhotoOrderMap(newPhotoList) {
  photoOrderMap.value.clear()
  newPhotoList.forEach((photoUrl, index) => {
    photoOrderMap.value.set(photoUrl, index)
  })
}

// 重新排序待上传列表
function reorderPendingPhotos(newPhotoList) {
  // 创建新的待上传列表，按照新的图片顺序排列
  const newPendingPhotos = []

  newPhotoList.forEach((photoUrl, index) => {
    // 查找对应的待上传项
    const pendingItem = pendingPhotos.value.find(item => {
      // 如果是新上传的图片，通过tempUrl匹配
      if (item.tempUrl === photoUrl) {
        return true
      }
      // 如果是现有图片，需要通过其他方式匹配
      // 这里假设现有图片的tempUrl就是photoUrl
      return item.tempUrl === photoUrl
    })

    if (pendingItem) {
      // 添加原始索引信息
      pendingItem.originalIndex = index
      newPendingPhotos.push(pendingItem)
    }
  })

  // 更新待上传列表
  pendingPhotos.value = newPendingPhotos
}

// 获取按拖拽顺序排列的待上传图片列表
function getOrderedPendingPhotos() {
  // 根据当前photoList的顺序来排列pendingPhotos
  const orderedPhotos = []
  const processedUrls = new Set() // 用于去重

  photoList.value.forEach((photoUrl, index) => {
    // 避免重复处理同一个URL
    if (processedUrls.has(photoUrl)) {
      return
    }
    
    const pendingItem = pendingPhotos.value.find(item => item.tempUrl === photoUrl)
    if (pendingItem) {
      pendingItem.originalIndex = index
      orderedPhotos.push(pendingItem)
      processedUrls.add(photoUrl)
    }
  })

  return orderedPhotos
}



// 格式化视频时长
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

async function handleUpdate() {
  // 如果正在保存，阻止重复操作
  if (isSaving.value) {
    uni.showToast({
      title: '正在保存中，请稍候...',
      icon: 'none'
    })
    return
  }

  // 检查是否有任何变化
  const hasCertificateChanges = pendingCertificates.value.length > 0 ||
    certificateList.value.length !== (userInfo.value.certificateJson?.length || 0) ||
    // 检查是否有证书被删除（显示列表长度小于原始数据长度）
    certificateList.value.length < (userInfo.value.certificateJson?.length || 0)
  const hasPhotoChanges = pendingPhotos.value.some(photo => !photo.isExisting) ||
    photoList.value.length !== (userInfo.value.albumJson?.length || 0) ||
    photoOrderMap.value.size > 0 // 检查是否有拖拽排序
  const hasVideoChanges = pendingVideos.value.length > 0 ||
    videoList.value.length !== (userInfo.value.videoJson?.length || 0)
  const hasVideoNameChanges = userInfo.value.videoJson && userInfo.value.videoJson.some((video, idx) => {
    return videoList.value[idx] && video.name !== videoList.value[idx].title
  })

  // 更精确地检查基本信息变化
  const hasWeixinChanges = userInfo.value.weixin !== updateData.value.weixin
  const hasWorkYearChanges = userInfo.value.workYear !== updateData.value.workYear
  const hasServiceDescriptionChanges = userInfo.value.serviceDescription !== updateData.value.serviceDescription
  const hasSkillTagChanges = JSON.stringify(userInfo.value.skillTag || []) !== JSON.stringify(updateData.value.skillTag || [])

  // 特殊处理从业年限：从undefined/null到具体数值的变化
  const workYearChanged = (userInfo.value.workYear || null) !== (updateData.value.workYear || null)

  const hasBasicInfoChanges = hasWeixinChanges || workYearChanged || hasServiceDescriptionChanges || hasSkillTagChanges

  // 检查是否有任何实际变化
  if (!hasCertificateChanges && !hasPhotoChanges && !hasVideoChanges && !hasVideoNameChanges && !hasBasicInfoChanges) {
    uni.showToast({
      title: '没有需要保存的修改',
      icon: 'none'
    })
    return
  }



  uni.showModal({
    title: '提示',
    content: '确认更新吗？',
    success: async (res) => {
      if (res.confirm) {
        // 设置保存状态
        isSaving.value = true
        
        try {
          uni.showLoading({
            title: '正在保存...'
          })

          // 上传所有待上传的文件
          const uploadPromises = []

          // 上传证书
          for (const cert of pendingCertificates.value) {
            uploadPromises.push(
              uploadFile(cert.tempFilePath).then(uploadRes => ({
                type: 'certificate',
                name: cert.name,
                url: uploadRes.path
              }))
            )
          }

          // 上传相册 - 按照拖拽后的顺序
          const orderedPendingPhotos = getOrderedPendingPhotos()
          for (const photo of orderedPendingPhotos) {
            if (!photo.isExisting) { // 只上传新添加的图片
              uploadPromises.push(
                uploadFile(photo.tempFilePath).then(uploadRes => ({
                  type: 'album',
                  name: photo.name,
                  url: uploadRes.path,
                  originalIndex: photo.originalIndex
                }))
              )
            }
          }

          // 上传视频
          for (const video of pendingVideos.value) {
            uploadPromises.push(
              uploadFile(video.tempFilePath).then(uploadRes => ({
                type: 'video',
                name: video.name,
                url: uploadRes.path,
                editIndex: video.editIndex // 保留编辑索引
              }))
            )
          }

          // 等待所有文件上传完成
          const uploadResults = await Promise.all(uploadPromises)

          // 整理数据
          const uploadedCertificates = uploadResults.filter(item => item.type === 'certificate').map(item => ({
            name: item.name,
            url: item.url
          }))

          const albumList = uploadResults.filter(item => item.type === 'album')
            .sort((a, b) => a.originalIndex - b.originalIndex) // 按照原始顺序排序
            .map(item => ({
              name: item.name,
              url: item.url
            }))

          const uploadedVideos = uploadResults.filter(item => item.type === 'video').map(item => ({
            name: item.name,
            url: item.url,
            editIndex: item.editIndex
          }))

          // 整理数据（使用已上传的文件）

          // 获取现有的证书、相册、视频数据
          const existingCertificates = userInfo.value.certificateJson || []
          const existingAlbums = userInfo.value.albumJson || []
          const existingVideos = userInfo.value.videoJson || []

          // 处理相册数据 - 按照拖拽后的顺序
          const finalAlbumList = []
          const processedUrls = new Set() // 用于去重
          
          
          
          // 按照当前photoList的顺序构建最终列表
          photoList.value.forEach((photoUrl, index) => {
            // 避免重复处理同一个URL
            if (processedUrls.has(photoUrl)) {
              return
            }
            
            
            // 查找是否是新上传的图片
            const pendingItem = pendingPhotos.value.find(p => p.tempUrl === photoUrl && !p.isExisting)
            const newAlbum = pendingItem ? albumList.find(item => item.name === pendingItem.name) : null

            if (newAlbum) {
              // 新上传的图片
              finalAlbumList.push({
                name: newAlbum.name,
                url: newAlbum.url
              })
            } else {
              // 现有图片
              const existingItem = pendingPhotos.value.find(p => p.tempUrl === photoUrl && p.isExisting)
              if (existingItem) {
                finalAlbumList.push({
                  name: existingItem.name,
                  url: existingItem.originalUrl
                })
              }
            }
            
            processedUrls.add(photoUrl)
          })

          // 处理证书数据 - 根据当前显示列表重新构建
          const finalCertificateList = []

          // 先添加所有新上传的证书
          uploadedCertificates.forEach(uploadedCert => {
            finalCertificateList.push(uploadedCert)
          })

          // 再添加现有证书（排除已删除的）
          if (userInfo.value.certificateJson) {
            userInfo.value.certificateJson.forEach(existingCert => {
              // 检查这个现有证书是否还在显示列表中
              const isStillDisplayed = certificateList.value.some(certUrl => {
                // 安全检查，避免 existingCert.url 为 undefined
                if (!existingCert.url) return false
                return certUrl.includes(existingCert.url.split('/').pop())
              })
              if (isStillDisplayed) {
                finalCertificateList.push(existingCert)
              }
            })
          }

          // 处理视频数据 - 根据当前显示列表重新构建
          const finalVideoList = []

          // 根据当前显示列表构建视频数据
          videoList.value.forEach((video, idx) => {
            // 检查是否是新上传的视频（通过tempFilePath判断）
            const isNewVideo = pendingVideos.value.some(pv => pv.tempFilePath === video.src)
            if (isNewVideo) {
              // 新上传的视频，从上传结果中获取URL
              const newVideo = uploadedVideos.find(v => v.editIndex === idx || v.name === video.title)
              if (newVideo) {
                finalVideoList.push({
                  name: video.title,
                  url: newVideo.url
                })
              }
            } else {
              // 现有视频 - 需要重新匹配，因为删除后索引可能不对应
              const existingVideo = userInfo.value.videoJson && userInfo.value.videoJson.find(ev => ev.name === video.title)
              if (existingVideo) {
                finalVideoList.push({
                  name: video.title, // 使用当前显示的名称
                  url: existingVideo.url
                })
              }
            }
          })

          // 调用更新接口
          const updateParams = {
            weixin: userInfo.value.weixin,
            workYear: userInfo.value.workYear,
            serviceDescription: userInfo.value.serviceDescription,
            skillTagList: userInfo.value.skillTag || [],
            certificateList: finalCertificateList,
            albumList: finalAlbumList,
            videoList: finalVideoList
          }
          
          await updateUserInfo(updateParams).then(res => {
            uni.hideLoading()
            setTimeout(() => {
              uni.showToast({
                title: res.msg,
                icon: 'success'
              })
            }, 10)
          }).catch(err => {
            console.log('保存失败', err)
          })

          // 清空待上传列表
          pendingCertificates.value = []
          pendingPhotos.value = []
          pendingVideos.value = []

          // 重新获取用户信息
          getUserInfo()

        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
          console.error('保存失败:', error)
        } finally {
          // 重置保存状态
          isSaving.value = false
        }
      }
    }
  })
}
function handleWeixinEdit() {
  weixinPopup.value.open()
}
const currentWX = ref('')
function handleWeixinConfirm() {
  weixinPopup.value.close()
  userInfo.value.weixin = currentWX.value
}
function handleWeixinCancel() {
  weixinPopup.value.close()
  currentWX.value = userInfo.value.weixin
}
//证书popup
const certificatePopup = ref(null)
function handleUploadCertificate() {
  // 重置当前证书数据
  currentCertificate.value = {
    name: '',
    tempUrl: '',
    tempFilePath: ''
  }
  certificatePopup.value.open()
}

// 选择证书图片
function handleSelectCertificateImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 检查文件大小限制（10MB）
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (res.tempFiles[0].size > maxSize) {
        uni.showToast({
          title: '图片大小不能超过10MB',
          icon: 'none'
        })
        return
      }

      // 兼容安卓和iOS
      const filePath = res.tempFiles[0].path || res.tempFiles[0].tempFilePath || res.tempFilePaths[0]
      currentCertificate.value.tempUrl = filePath
      currentCertificate.value.tempFilePath = filePath
    },
    fail: (err) => {
      console.log('选择证书图片失败', err)
    }
  })
}

// 确认添加证书
function handleUploadCertificateConfirm() {
  if (!currentCertificate.value.name.trim()) {
    uni.showToast({
      title: '请输入证书名称',
      icon: 'none'
    })
    return
  }
  if (!currentCertificate.value.tempUrl) {
    uni.showToast({
      title: '请选择证书图片',
      icon: 'none'
    })
    return
  }

  // 添加到待上传列表
  pendingCertificates.value.push({
    name: currentCertificate.value.name,
    tempUrl: currentCertificate.value.tempUrl,
    tempFilePath: currentCertificate.value.tempFilePath
  })

  // 添加到显示列表
  certificateList.value.push(currentCertificate.value.tempUrl)

  certificatePopup.value.close()
}

// 取消添加证书
function handleUploadCertificateCancel() {
  certificatePopup.value.close()
}

// 删除技能
function handleDelSkill(index) {
  uni.showModal({
    title: '提示',
    content: '确定删除该技能吗？',
    success: (res) => {
      if (res.confirm) {
        userInfo.value.skillTag.splice(index, 1)
        uni.showToast({
          title: '技能删除成功',
          icon: 'success'
        })
      }
    }
  })
}

// 初始化从业年限选项
function initWorkYearOptions() {
  workYearOptions.value = []
  for (let i = 1; i <= 100; i++) {
    workYearOptions.value.push(i)
  }
}

// 编辑从业年限
function handleWorkYearEdit() {
  // 设置当前选中的索引
  const currentYear = userInfo.value.workYear || 1
  const index = workYearOptions.value.findIndex(year => year === currentYear)
  workYearIndex.value = [index >= 0 ? index : 0]
  workYearPopup.value.open()
}

// 从业年限选择变化
function handleWorkYearChange(e) {
  workYearIndex.value = e.detail.value
}

// 确认从业年限修改
function handleWorkYearConfirm() {
  const selectedIndex = workYearIndex.value[0]
  const selectedYear = workYearOptions.value[selectedIndex]
  userInfo.value.workYear = selectedYear
  workYearPopup.value.close()
  // uni.showToast({
  //   title: '从业年限修改成功',
  //   icon: 'success'
  // })
}

// 取消从业年限修改
function handleWorkYearCancel() {
  workYearPopup.value.close()
}
</script>

<style lang="scss" scoped>
.user-info-page {
  background: var(--background-color);
  min-height: 100vh;
  padding-bottom: 180rpx;
}

.header-fixed {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.user-info-bg {
  width: 100%;
  height: 200rpx;
  background: var(--theme-color);
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  text-align: center;
  font-weight: bold;
  line-height: 240rpx;
  font-size: 28rpx;
}

.profile-card {
  background: #fff;
  border-radius: 20rpx;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 80rpx 24rpx 0 24rpx;
  padding: 20rpx 32rpx 24rpx 32rpx;
  color: #222;
  position: relative;

  .profile-btn {
    background: var(--theme-color);
    color: #fff;
    border: none;
    width: 200rpx;
    border-radius: 44rpx;
    font-size: 26rpx;
    height: 56rpx;
    line-height: 56rpx;
    padding: 0 32rpx;
    font-weight: bold;
    margin-left: 24rpx;

    &::after {
      border: none;
    }
  }

  .profile-progress-row {
    display: flex;
    align-items: center;
    flex-direction: column;
    align-items: flex-start;
    width: 80%;
    height: 120rpx;
    gap: 16rpx;

    .progress-label {
      font-size: 24rpx;
      color: #222;
      margin-right: 24rpx;
    }

    .progress-bar {
      width: 100%;
      height: 10rpx;
      background: #f3f4f6;
      border-radius: 8rpx;
      overflow: hidden;

      .progress-inner {
        height: 100%;
        background: var(--theme-color);
        border-radius: 8rpx;
      }
    }
  }

  .profile-progress-tip {
    color: #222;
    font-size: 22rpx;
    opacity: 0.9;
  }
}

.info-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx 32rpx 8rpx 32rpx;

  .info-title {
    font-size: 28rpx;
    color: #222;
    font-weight: bold;
    margin-bottom: 18rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .info-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .info-title {
      font-size: 28rpx;
      color: #222;
      font-weight: bold;
    }

    .info-add {
      color: var(--theme-color);
      font-size: 24rpx;
    }
  }

  .info-list {
    .info-item {
      display: flex;
      align-items: center;
      padding: 18rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &.info-item-required {
        width: 100%;
        justify-content: space-between;
      }

      &.info-item-normal {
        width: 100%;
        justify-content: space-between;

        .info-value {
          margin: 0 24rpx 0 auto;
        }
      }

      &.info-certificate-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16rpx;
      }

      .info-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .text {
          color: #374151;
          font-size: 26rpx;
        }

        .info-upload {
          color: var(--theme-color);
        }
      }

      .info-label {
        color: #374151;
        font-size: 26rpx;
        min-width: 120rpx;

        .required {
          color: var(--theme-color);
          margin-left: 2rpx;
        }
      }

      .info-value {
        color: #222;
        font-size: 26rpx;
        margin-left: 16rpx;
      }

      .info-upload {
        color: var(--theme-color);
        font-size: 24rpx;
        margin-left: auto;
        cursor: pointer;
      }

      .cert-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        width: 100%;
        margin-top: 16rpx;

        .cert-item {
          position: relative;

          .cert-img {
            width: 240rpx;
            height: 140rpx;
            border-radius: 12rpx;
            object-fit: cover;
          }

          .cert-del {
            position: absolute;
            top: 8rpx;
            right: 8rpx;
            width: 40rpx;
            height: 40rpx;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          }
        }
      }
    }

    .info-item:last-child {
      border-bottom: none;
    }
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .skill-tag {
      background: var(--theme-color-light);
      color: var(--theme-color);
      font-size: 24rpx;
      border-radius: 24rpx;
      padding: 8rpx 24rpx;
      display: flex;
      align-items: center;
      gap: 8rpx;
    }
  }

  .video-list {
    margin-top: 16rpx;

    .video-item {
      background: #f8f8f8;
      border-radius: 16rpx;
      margin-bottom: 18rpx;
      overflow: hidden;
      position: relative;

      .video-cover {
        width: 100%;
        height: 220rpx;
        object-fit: cover;
        border-radius: 16rpx 16rpx 0 0;
      }

      .video-title {
        font-size: 26rpx;
        color: #222;
        font-weight: 500;
        margin: 12rpx 0 0 16rpx;
      }

      .video-time {
        position: absolute;
        right: 16rpx;
        bottom: 36rpx;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 22rpx;
        border-radius: 12rpx;
        padding: 2rpx 12rpx;
      }

      .video-actions {
        display: flex;
        gap: 18rpx;
        margin: 12rpx 0 12rpx 16rpx;

        .video-edit,
        .video-del {
          color: #6B7280;
          font-size: 24rpx;
        }

        .video-edit {
          color: var(--theme-color);
          font-size: 24rpx;
        }
      }
    }
  }

  .video-add-btn {
    width: 100%;
    background: linear-gradient(90deg, rgba(255, 107, 53, 1) 0%, rgba(255, 143, 53, 1) 100%);
    color: #fff;
    border: none;
    border-radius: 44rpx;
    font-size: 28rpx;
    height: 88rpx;
    line-height: 88rpx;
    font-weight: bold;
    margin: 12rpx 0 0 0;

    &::after {
      border: none;
    }
  }



  .photo-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    padding-bottom: 40rpx;
    position: relative;

    .photo-item {
      position: relative;
      width: 200rpx;
      height: 200rpx;
      border-radius: 16rpx;
      transition: transform 0.2s;

      .del-image {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 50%;
        width: 40rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
      }

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 16rpx;
      }

      .photo-item-add {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background: #f5f5f5;
        border-radius: 16rpx;
        border: 1rpx dashed #bbb;

      }

      .photo-item-text {
        font-size: 22rpx;
        color: #bbb;
      }

      .photo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .service-description {
    width: 93%;
    height: 200rpx;
    border: 1rpx solid #f5f5f5;
    border-radius: 16rpx;
    margin-top: 16rpx;
    margin-bottom: 20rpx;
    font-size: 26rpx;
    color: #374151;
    padding: 20rpx;

  }

  .max-length {
    font-size: 22rpx;
    color: #6B7280;
    text-align: right;
    margin-top: 10rpx;
  }
}

.sortable-ghost {
  opacity: 0.5;
}

.video-preview {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  overflow: hidden;
}

.sortable-chosen {
  box-shadow: 0 8rpx 32rpx var(--theme-color-light);
  transform: scale(1.08);
}

.footer-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: #fff;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f5f5f5;

  .footer-btn {
    width: 100%;
    height: 88rpx;
    background: var(--theme-color);
    border-radius: 44rpx;
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &.disabled {
      background: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.6;
    }
  }
}

.popup-content {
  .popup-content-item {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .popup-content-item-label {
      font-size: 28rpx;
      color: #222;
      font-weight: bold;
      margin-bottom: 20rpx;
    }

    .popup-content-item-input {
      width: 100%;
      height: 88rpx;
      border-radius: 10rpx;
      border-bottom: 1rpx solid #f5f5f5;
    }

    .popup-content-item-input input {
      height: 100%;
      border-radius: 10rpx;
      padding: 0 16rpx;
    }

    .popup-content-item-button {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      margin-top: 20rpx;

      .popup-content-item-button-item {
        width: 40%;
        height: 70rpx;
        background: #f5f5f5;
        border-radius: 44rpx;
        color: #222;
        text-align: center;
        line-height: 70rpx;

        &.confirm {
          background: var(--theme-color);
          color: #fff;
        }

        &.cancel {
          background: #f5f5f5;
        }
      }
    }
  }
}

.certificate-popup {
  .certificate-popup-content {
    padding: 32rpx;

    .certificate-popup-content-item-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-top: 32rpx;
      gap: 24rpx;

      .certificate-popup-content-item-button-item {
        flex: 1;
        height: 88rpx;
        background: #f5f5f5;
        border-radius: 44rpx;
        color: #666;
        text-align: center;
        line-height: 88rpx;
        font-size: 30rpx;
        font-weight: 500;
        transition: all 0.3s ease;
        cursor: pointer;

        &.confirm {
          background: var(--theme-color);
          color: #fff;
          box-shadow: 0 8rpx 24rpx rgba(var(--theme-color-rgb), 0.3);

          &:hover {
            transform: translateY(-2rpx);
            box-shadow: 0 12rpx 32rpx rgba(var(--theme-color-rgb), 0.4);
          }

          &:active {
            transform: translateY(0);
            box-shadow: 0 4rpx 16rpx rgba(var(--theme-color-rgb), 0.3);
          }
        }

        &.cancel {
          background: #f5f5f5;
          color: #666;

          &:hover {
            background: #e8e8e8;
          }

          &:active {
            background: #d8d8d8;
          }
        }
      }
    }

    .certificate-popup-content-item {
      display: flex;
      flex-direction: column;
      gap: 24rpx;

      .certificate-popup-content-item-label {
        font-size: 30rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 12rpx;
      }

      .certificate-popup-content-item-input {
        width: 100%;
        height: 96rpx;
        border: 2rpx solid #e8e8e8;
        border-radius: 16rpx;
        background: #fafafa;
        transition: all 0.3s ease;

        &:focus-within {
          border-color: var(--theme-color);
          background: #fff;
          box-shadow: 0 0 0 4rpx rgba(var(--theme-color-rgb), 0.1);
        }

        input {
          width: 100%;
          height: 100%;
          padding: 0 24rpx;
          font-size: 28rpx;
          color: #333;

          &::placeholder {
            color: #999;
          }
        }
      }

      .certificate-popup-content-item-upload {
        width: 100%;
        height: 240rpx;
        border: 2rpx dashed #d0d0d0;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: #fafafa;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
          border-color: var(--theme-color);
          background: rgba(var(--theme-color-rgb), 0.05);
        }

        &:active {
          transform: scale(0.98);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16rpx;
          color: #666;
          font-size: 26rpx;

          text {
            font-weight: 500;
          }
        }

        .upload-preview {
          width: 100%;
          height: 100%;
          border-radius: 16rpx;
          object-fit: cover;
        }
      }


    }
  }
}

.video-popup {
  .video-popup-content {
    padding: 32rpx;

    .video-popup-content-item-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-top: 32rpx;
      gap: 24rpx;

      .video-popup-content-item-button-item {
        flex: 1;
        height: 88rpx;
        background: #f5f5f5;
        border-radius: 44rpx;
        color: #666;
        text-align: center;
        line-height: 88rpx;
        font-size: 30rpx;
        font-weight: 500;
        transition: all 0.3s ease;
        cursor: pointer;

        &.confirm {
          background: var(--theme-color);
          color: #fff;
          box-shadow: 0 8rpx 24rpx rgba(var(--theme-color-rgb), 0.3);
        }

        &.cancel {
          background: #f5f5f5;
          color: #666;
        }
      }
    }

    .video-popup-content-item {
      display: flex;
      flex-direction: column;
      gap: 24rpx;

      .video-popup-content-item-label {
        font-size: 30rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 12rpx;
      }

      .video-popup-content-item-input {
        width: 100%;
        height: 96rpx;
        border: 2rpx solid #e8e8e8;
        border-radius: 16rpx;
        background: #fafafa;
        transition: all 0.3s ease;

        &:focus-within {
          border-color: var(--theme-color);
          background: #fff;
          box-shadow: 0 0 0 4rpx rgba(var(--theme-color-rgb), 0.1);
        }

        input {
          width: 100%;
          height: 100%;
          padding: 0 24rpx;
          font-size: 28rpx;
          color: #333;

          &::placeholder {
            color: #999;
          }
        }
      }

      .video-popup-content-item-upload {
        width: 100%;
        height: 240rpx;
        border: 2rpx dashed #d0d0d0;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: #fafafa;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16rpx;
          color: #666;
          font-size: 26rpx;

          text {
            font-weight: 500;
          }
        }

      }


    }
  }
}

.skill-popup {
  .skill-popup-content {
    padding: 32rpx;

    .skill-popup-content-item {
      display: flex;
      flex-direction: column;
      gap: 24rpx;

      .skill-popup-content-item-label {
        font-size: 30rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 12rpx;
      }

      .skill-popup-content-item-input {
        width: 100%;
        height: 96rpx;
        border: 2rpx solid #e8e8e8;
        border-radius: 16rpx;
        background: #fafafa;
        transition: all 0.3s ease;

        &:focus-within {
          border-color: var(--theme-color);
          background: #fff;
          box-shadow: 0 0 0 4rpx rgba(var(--theme-color-rgb), 0.1);
        }

        input {
          width: 100%;
          height: 100%;
          padding: 0 24rpx;
          font-size: 28rpx;
          color: #333;

          &::placeholder {
            color: #999;
          }
        }
      }
    }

    .skill-popup-content-item-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-top: 32rpx;
      gap: 24rpx;

      .skill-popup-content-item-button-item {
        flex: 1;
        height: 88rpx;
        background: #f5f5f5;
        border-radius: 44rpx;
        color: #666;
        text-align: center;
        line-height: 88rpx;
        font-size: 30rpx;
        font-weight: 500;
        transition: all 0.3s ease;
        cursor: pointer;

        &.confirm {
          background: var(--theme-color);
          color: #fff;
          box-shadow: 0 8rpx 24rpx rgba(var(--theme-color-rgb), 0.3);
        }

        &.cancel {
          background: #f5f5f5;
          color: #666;
        }
      }
    }
  }
}

.work-year-popup {
  .work-year-popup-content {
    padding: 32rpx;

    .work-year-popup-content-item {
      display: flex;
      flex-direction: column;
      gap: 24rpx;

      .work-year-popup-content-item-label {
        font-size: 30rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 12rpx;
        text-align: center;
      }

      .work-year-picker {
        width: 100%;
        height: 300rpx;
        border: 2rpx solid #e8e8e8;
        border-radius: 16rpx;
        background: #fafafa;
        overflow: hidden;

        .picker-item {
          height: 80rpx;
          line-height: 80rpx;
          text-align: center;
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }

    .work-year-popup-content-item-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-top: 32rpx;
      gap: 24rpx;

      .work-year-popup-content-item-button-item {
        flex: 1;
        height: 88rpx;
        background: #f5f5f5;
        border-radius: 44rpx;
        color: #666;
        text-align: center;
        line-height: 88rpx;
        font-size: 30rpx;
        font-weight: 500;
        transition: all 0.3s ease;
        cursor: pointer;

        &.confirm {
          background: var(--theme-color);
          color: #fff;
          box-shadow: 0 8rpx 24rpx rgba(var(--theme-color-rgb), 0.3);

          &:hover {
            transform: translateY(-2rpx);
            box-shadow: 0 12rpx 32rpx rgba(var(--theme-color-rgb), 0.4);
          }

          &:active {
            transform: translateY(0);
            box-shadow: 0 4rpx 16rpx rgba(var(--theme-color-rgb), 0.3);
          }
        }

        &.cancel {
          background: #f5f5f5;
          color: #666;

          &:hover {
            background: #e8e8e8;
          }

          &:active {
            background: #d8d8d8;
          }
        }
      }
    }
  }
}
</style>