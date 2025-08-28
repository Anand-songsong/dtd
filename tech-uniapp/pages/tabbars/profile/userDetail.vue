<template>
	<view class="user-detail">
		<view class="user-title">个人信息</view>
		<view class="form-item">
			<text>昵称</text>
			<input v-model="userInfo.nickname" @input="onNicknameInput" placeholder="请输入昵称" />
		</view>
		<view class="form-item">
			<text>所属门店</text>
			<text>{{ userInfo.shopName }}</text>
		</view>
		<view class="form-item">
			<text>姓名</text>
			<text>{{ userInfo.name }}</text>
		</view>
		<view class="form-item">
			<text>身份证号</text>
			<text>{{ userInfo.idCard }}</text>
		</view>
		<view class="form-item">
			<text>生活照</text>
			<view class="photo-list">
				<view v-for="(img, idx) in lifePhotoList" :key="idx" class="photo-item">
					<image @click="previewImage(img)" :src="img" class="photo" />
					<view class="delete-icon" @click.stop="deletePhoto(idx)">×</view>
				</view>
				<view class="add-photo" @click="chooseLifePhotos">+</view>
			</view>
		</view>
		<view class="form-item">
			<text>简介</text>
			<textarea v-model="userInfo.introduction" @input="onIntroInput" placeholder="请输入简介" />
		</view>
		<button class="save-btn" @click="saveUserInfo">保存</button>
	</view>
</template>

<script setup>
import { getTechnicianInfo , updateTechnicianInfo } from '@/api/my'
import { ref, onMounted } from 'vue'
import { getImage , uploadFile } from '@/utils/request'

const userInfo = ref({
	nickname: '',
	shopName: '',
	name: '',
	idCard: '',
	lifePhotos: '',
	introduction: ''
})
const lifePhotoList = ref([])

onMounted(() => {
	getUserInfo()
})

async function getUserInfo() {
	const res = await getTechnicianInfo();
	userInfo.value = res.data;
	if (res.data.lifePhotos) {
		const arr = res.data.lifePhotos.split(',');
		// 等待所有 getImage 返回的 Promise 完成
		lifePhotoList.value = await Promise.all(arr.map(item => getImage(item)));
	} else {
		lifePhotoList.value = [];
	}
}

// 选择图片
function chooseLifePhotos() {
    //多选图片
	uni.chooseImage({
		count: 6,
		success: (res) => {
            uploadFile(res.tempFilePaths[0] , 'lifePhoto').then(async result=>{
                lifePhotoList.value.push(result.path)
                lifePhotoList.value[lifePhotoList.value.length - 1] = await getImage(lifePhotoList.value[lifePhotoList.value.length - 1])
            })
			// 这里只做本地回显，实际应上传后拿到服务器图片名
			// lifePhotoList.value = res.tempFilePaths
			// 这里需要你上传图片到服务器，拿到图片名后再拼接成字符串
			// userInfo.value.lifePhotos = 'xxx,yyy'
		}
	})
}

// 编辑简介
function onIntroInput(e) {
	userInfo.value.introduction = e.detail.value
}

// 编辑昵称
function onNicknameInput(e) {
	userInfo.value.nickname = e.detail.value
}

// 删除照片
function deletePhoto(index) {
	uni.showModal({
		title: '提示',
		content: '确定要删除这张照片吗？',
		success: (res) => {
			if (res.confirm) {
				lifePhotoList.value.splice(index, 1)
			}
		}
	})
}

// 保存
function saveUserInfo() {
    //截取字符串中的fileId,示例:https://cc.ruyoung.com/api/image?fileId=7ef735987cfa435b8d1747fdec185e63&app-id=p7y04i88
    const phoneList = lifePhotoList.value.map(i=>{
        return i.split('?')[1].split('&')[0].split('=')[1]
    })
	updateTechnicianInfo({
        lifePhotos: phoneList.join(','),
        introduction: userInfo.value.introduction,
        nickname: userInfo.value.nickname
    }).then(res => {
		uni.showToast({
			title: res.msg,
			icon: 'success'
		})
		getUserInfo()
	})
	// 这里需要调用保存接口，传 userInfo.value
	// userInfo.value.lifePhotos 需要拼接成字符串
	// userInfo.value.introduction, userInfo.value.nickname
	// ...
}
</script>

<style scoped>
.user-detail {
	padding: 30rpx;
	background: #f4f8fd;
	min-height: calc(100vh - var(--bottom-tabbar-height) + 38rpx);
}
.user-title {
	font-size: 38rpx;
	font-weight: bold;
	color: #000;
	margin-bottom: 40rpx;
	letter-spacing: 2rpx;
}
.form-item {
	margin-bottom: 32rpx;
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid #e0eaff;
	padding-bottom: 18rpx;
}
.form-item text {
	color: #1677ff;
	font-size: 28rpx;
	margin-bottom: 8rpx;
}
input, textarea {
	font-size: 28rpx;
	color: #222;
	background: transparent;
	border: none;
	outline: none;
	padding: 0;
	margin: 0;
	width: 100%;
	resize: none;
}
input::placeholder, textarea::placeholder {
	color: #a0bfff;
}
.photo-list {
	display: flex;
	gap: 20rpx;
	flex-wrap: wrap;
	margin-top: 10rpx;
}
.photo-item {
	position: relative;
	width: 120rpx;
	height: 120rpx;
}
.delete-icon {
	position: absolute;
	top: -16rpx;
	right: -16rpx;
	width: 40rpx;
	height: 40rpx;
	background: rgba(0, 0, 0, 0.5);
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	z-index: 1;
	cursor: pointer;
}
.photo {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
	object-fit: cover;
	border: 2rpx solid #1677ff;
}
.add-photo {
	width: 120rpx;
	height: 120rpx;
	background: #e6f0ff;
	color: #1677ff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 60rpx;
	border-radius: 8rpx;
	border: 2rpx dashed #1677ff;
	cursor: pointer;
}
.save-btn {
	width: 100%;
	background: linear-gradient(90deg, #1677ff 0%, #69a6ff 100%);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	padding: 18rpx 0;
	margin-top: 60rpx;
	box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.08);
}
</style>

