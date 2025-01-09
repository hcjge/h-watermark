import {createRouter, createWebHashHistory} from 'vue-router'


const routes=[
    {path:'/', component:()=>import('../views/index/index.vue')}
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})

