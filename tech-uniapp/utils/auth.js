const TOKEN = 'tech-token'
export const setToken = (token)=>{
	uni.setStorageSync(TOKEN,token)
}
export const getToken= () =>{
	return uni.getStorageSync(TOKEN)
}
export const removeToken = () =>{
	uni.removeStorageSync(TOKEN)
}
//导航方法
function openGuide() {
	uni.showLoading({
	  title: '定位中...'
	})
	const { lat, lng, address } = detail.value.address
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