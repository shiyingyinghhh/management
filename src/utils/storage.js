import { useStorage } from '@vueuse/core'
const loaded = localStorage.getItem('setting')
const local = useStorage('setting', loaded ? JSON.parse(loaded) : {})


const isLogin = () => !!local.value.access_token
const getToken = () => local.value.access_token
const setToken = (token) => local.value.access_token = token
const clearToken = () => delete local.value.access_token

export { isLogin, getToken, setToken, clearToken }


