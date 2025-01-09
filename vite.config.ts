import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

import path from 'path'
import {VitePWA} from 'vite-plugin-pwa'


const pathSrc = path.resolve(__dirname, 'src')
// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue()
        , AutoImport({
            resolvers: [
                ElementPlusResolver()
            ],
            dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
        }),
        Components({
            resolvers: [
                ElementPlusResolver(),
            ],
            dts: path.resolve(pathSrc, 'components.d.ts'),
        }), VitePWA({
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            workbox: {
                globPatterns: ['**/*.{woff2,ttf}'],
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
            },
            manifest: {
                "name": "加水印小工具",
                "short_name": "水印小工具",
                "icons": [
                    {
                        "src": "/pwa-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png",
                        "purpose": "any"
                    },
                    {
                        "src": "/pwa-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png",
                        "purpose": "any"
                    },
                    {
                        "src": "/pwa-maskable-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png",
                        "purpose": "maskable"
                    },
                    {
                        "src": "/pwa-maskable-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png",
                        "purpose": "maskable"
                    }
                ],
                "start_url": "/",
                "display": "standalone",
                "background_color": "#FFFFFF",
                "theme_color": "#FFFFFF"
            }
        })
    ],
    server: {
        host: '0.0.0.0'
    }
})
