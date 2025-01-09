import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {router} from './router'
import {createPinia} from 'pinia'
const pinia = createPinia();
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {useDark, useToggle} from '@vueuse/core'


const app = createApp(App)

const isDark = useDark()
useToggle(isDark)


app.use(pinia).use(router).mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(`Icon${key}`, component)
}
