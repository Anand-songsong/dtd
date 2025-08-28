<script>
import { getAppInfo } from '@/api/login';
import { useStore } from 'vuex';
import { getProvinceCityTree, init } from '@/api/my';
import { getCityByLocation } from '@/api/work';
// import VConsole from 'vconsole'
export default {
	onLaunch: function () {
		// #ifdef H5
		// new VConsole()
		// #endif
	},
	onShow: function () {
		const store = useStore();
		getAppInfo().then(async res => {
			if (res.error === 0) {
				store.commit('setAppInfo', res.data)
			}
		})
		uni.getLocation({
			type: 'gcj02',
			success: (res) => {
				getCityByLocation({
					latitude: res.latitude,
					longitude: res.longitude
				}).then(response => {
					console.log(response)
					store.commit('setCurrentCity', response.data.city)
					getProvinceCityTree(response.data.city).then(result => {
						if (result.error === 0) {
							console.log(result.data)
							store.commit('setCurrentCityList', result.data)
							// store.commit('setProvinceCityTree', result.data)
							// const cityTree = result.data.map(item => {
							// 	if (item.children) {
							// 		return item.children
							// 	} else {
							// 		return []
							// 	}
							// }).flat()
							// store.commit('setCityTree', cityTree)
						}
					})
				})
			}
		})

		init().then(res => {
			if (res.error === 0) {
				store.commit('setInit', res.data)
			}
		})
	},
	onHide: function () {
	}
}
</script>

<style>
/*每个页面公共css */
</style>
