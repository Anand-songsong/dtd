import base_url from '@/config/index.js'
import { appId } from '../config';
import {
	getToken,removeToken
} from "@/utils/auth.js"
const timeOut = 5000
// 封装请求函数
function request(options) {
	const {
		url,
		method = 'GET',
		data = {},
		header = {},
		showLoading = true
	} = options;

	const fullUrl = base_url + url;
	const finalHeader = {
		'app-id': 'p7y04i88',
		...header,
		'Content-Type': 'application/json',
		 // 'Authorization':'Bearer 3f2374d3-ce9c-442c-9935-c637e621f123'

	};
	if (getToken()) {
		finalHeader['Authorization'] = `${getToken()}`;
	}

	return new Promise((resolve, reject) => {
		if (showLoading) {
			uni.showLoading({
				title: '加载中'
			});
		}

		uni.request({
			url: fullUrl,
			method,
			data,
			header: finalHeader,
			timeOut,

			success(res) {
					uni.hideLoading();
				if (res.data.error === 0) {
					resolve(res.data);
				} else if(res.statusCode === 401){
					// uni.showToast({ title: '登录已过期\n\n请重新登录', icon: 'none' })
					removeToken()
					uni.reLaunch({
						url: '/pages/login/index'
					})
				}else if(res.statusCode === 500){
					uni.showToast({ title: '网络错误', icon: 'none' })
				}
				else if(res.data.error !== 0){
					uni.showToast({ title: res.data.msg, icon: 'none' })
					resolve(res.data);
				}
			},	

			fail(err) {
					uni.hideLoading();
				console.dir(err)
				uni.showToast({ title: '网络异常', icon: 'none' })
				reject(err);
			},
		});
	});
}
//上传文件
export const uploadFile = (file, group = 'ugc', callback) => {
	const token = getToken()
	uni.showLoading({
		title: '上传中',
	})
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: base_url + '/api/file/upload',
			filePath: file,
			name: 'file',
			formData: {
				group,
			},
			header: {
				Accept: 'application/json',
				'app-id': appId,
				Authorization: token,
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
//全局获取图片
export async function getImage(imgId){
	return `${base_url}/api/image?fileId=${imgId}&app-id=${appId}`
}
export function get(url, options = {}) {
	return request({
		url,
		method: 'GET',
		...options
	});
}

export function post(url, data, options = {}) {
	return request({
		url,
		method: 'POST',
		data,
		...options
	});
}
export function put(url, data, options = {}) {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	});
}
export function del(url, data, options = {}) {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	});
}
export default request;