// ==UserScript==
// @name         Discuz! 依赖式加载霞鹜文楷（精简检测版）
// @version      0.3
// @description  仅通过文本检测Discuz!网站，以依赖形式加载霞鹜文楷字体
// @author       Your Name
// @match        https://111.111.11/*
// @grant        GM_addStyle
// @run-at       document-start  // 提前执行，优先加载字体资源
// ==/UserScript==

(function() {
    'use strict';

    // 1. 字体依赖配置（集中管理，后续修改仅需调整此处）
    const fontConfig = {
        name: 'LXGW WenKai Lite',
        url: 'https://github.com/lxgw/LxgwWenKai-Lite/releases/download/Latest/LXGWWenKaiMonoLite-Regular.ttf',
        format: 'truetype'
    };

    // 2. 简化版Discuz!网站检测：仅判断页面是否包含"Powered by Discuz!"文本
    function isDiscuzSite() {
        // 兼容页面未完全加载的情况，用可选链避免报错
        return document.body?.innerText.includes('Powered by Discuz!') || false;
    }

    // 3. 依赖式加载字体资源（预加载+跨域兼容）
    function loadFontDependency() {
        return new Promise((resolve, reject) => {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload'; // 预加载字体，提升后续样式应用速度
            preloadLink.as = 'font';     // 明确资源类型为字体
            preloadLink.href = fontConfig.url;
            preloadLink.crossOrigin = 'anonymous'; // 解决GitHub资源跨域问题
            preloadLink.type = `font/${fontConfig.format}`;

            // 加载成功：触发样式注入
            preloadLink.onload = () => {
                console.log(`✅ 霞鹜文楷字体依赖加载完成`);
                resolve();
            };

            // 加载失败：提示并兜底（不影响页面默认字体）
            preloadLink.onerror = () => {
                console.error(`❌ 字体加载失败，将保留网站默认字体`);
                reject();
            };

            // 将预加载标签插入头部，启动加载
            document.head.appendChild(preloadLink);
        });
    }

    // 4. 注入字体样式（仅在依赖加载成功后执行）
    function injectFontStyle() {
        // 1. 声明字体（关联预加载的资源）
        const fontDeclare = `
            @font-face {
                font-family: '${fontConfig.name}';
                src: url('${fontConfig.url}') format('${fontConfig.format}');
                font-weight: normal;
                font-style: normal;
                font-display: swap; // 加载中显示默认字体，避免文字空白
            }
        `;

        // 2. 应用字体到所有核心文本元素
        const fontApply = `
            body, p, div, span, td, th, a, li,
            h1, h2, h3, h4, h5, h6,
            input, textarea, select, button {
                font-family: '${fontConfig.name}', sans-serif !important;
                /* !important 确保覆盖网站原有字体样式 */
            }
        `;

        // 合并样式并注入页面
        GM_addStyle(fontDeclare + fontApply);
        console.log(`✨ Discuz! 网站字体已替换为霞鹜文楷`);
    }

    // 5. 核心执行流程：检测网站 → 加载依赖 → 应用样式
    if (isDiscuzSite()) {
        // 等待字体加载成功后，再注入样式
        loadFontDependency().then(injectFontStyle);
    }
})();
