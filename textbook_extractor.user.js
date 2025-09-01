// ==UserScript==
// @name         西柚英语课文提取器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  专门提取西柚英语课文数据并输出为数组
// @author       awaxiaoyu
// @match        https://student.xiyouyingyu.com/*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // 存储提取的课文数据
    let extractedTextbookData = [];
    
    // 控制台日志
    const log = (...args) => console.log('[课文提取器]', ...args);
    const error = (...args) => console.error('[课文提取器]', ...args);
    
    // 监控网络请求获取数据
    function monitorNetwork() {
        const originalFetch = unsafeWindow.fetch;
        unsafeWindow.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                const clonedResponse = response.clone();
                clonedResponse.json().then(data => {
                    extractTextbookFromData(data);
                }).catch(() => {});
                return response;
            });
        };
        
        // 监控XHR
        const originalXHROpen = unsafeWindow.XMLHttpRequest.prototype.open;
        unsafeWindow.XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                try {
                    const data = JSON.parse(this.responseText);
                    extractTextbookFromData(data);
                } catch (e) {}
            });
            return originalXHROpen.apply(this, arguments);
        };
    }
    
    // 从数据中提取课文相关数组
    function extractTextbookFromData(data) {
        if (!data || typeof data !== 'object') return;
        
        // 递归查找包含textBookParaphrase的数组
        function findTextbookArrays(obj, path = '') {
            if (Array.isArray(obj)) {
                // 检查数组中的元素是否包含textBookParaphrase
                const hasTextbook = obj.some(item => 
                    item && typeof item === 'object' && item.textBookParaphrase !== undefined
                );
                
                if (hasTextbook) {
                    log(`发现课文数据数组: ${path || 'root'}, 长度: ${obj.length}`);
                    extractAndOutput(obj);
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (const [key, value] of Object.entries(obj)) {
                    findTextbookArrays(value, `${path}.${key}`.replace(/^\./, ''));
                }
            }
        }
        
        findTextbookArrays(data);
    }
    
    // 提取并输出课文数据
    function extractAndOutput(textbookArray) {
        if (!Array.isArray(textbookArray)) return;
        
        // 提取关键字段
        const extracted = textbookArray.map((item, index) => {
            return {
                index: index,
                textBookParaphrase: item.textBookParaphrase || null,
                textBookParaphraseCn: item.textBookParaphraseCn || null,
                textBookParaphraseEn: item.textBookParaphraseEn || null,
                originalText: item.originalText || null,
                translation: item.translation || null,
                id: item.id || null,
                unitId: item.unitId || null,
                lessonId: item.lessonId || null
            };
        }).filter(item => item.textBookParaphrase !== null);
        
        if (extracted.length > 0) {
            extractedTextbookData = extracted;
            
            // 在控制台输出数组
            log('=== 课文数据提取完成 ===');
            log('提取结果数组:', extracted);
            log('数组长度:', extracted.length);
            
            // 创建全局变量供访问
            unsafeWindow.textbookData = extracted;
            log('可通过 window.textbookData 访问提取的数组');
            
            // 显示提取成功提示
            showSuccessMessage(extracted.length);
        }
    }
    
    // 显示提取成功提示
    function showSuccessMessage(count) {
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: sans-serif;
            ">
                ✅ 课文提取成功！共 ${count} 条数据
                <br>
                <small>在控制台查看: console.log(window.textbookData)</small>
            </div>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    // 添加控制台命令
    function setupConsoleCommands() {
        unsafeWindow.textbookExtractor = {
            getData: () => extractedTextbookData,
            extract: () => {
                log('开始手动扫描全局数据...');
                // 扫描window对象
                for (const key in unsafeWindow) {
                    try {
                        const value = unsafeWindow[key];
                        if (Array.isArray(value) && value.length > 0) {
                            extractTextbookFromData(value, `window.${key}`);
                        }
                    } catch (e) {}
                }
            },
            clear: () => {
                extractedTextbookData = [];
                log('已清空提取数据');
            }
        };
        
        log('控制台命令已添加:');
        log('textbookExtractor.getData() - 获取提取的课文数据');
        log('textbookExtractor.extract() - 手动扫描提取');
        log('textbookExtractor.clear() - 清空数据');
    }
    
    // 初始化
    function init() {
        log('课文提取器初始化...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
        
        function start() {
            monitorNetwork();
            setupConsoleCommands();
            log('课文提取器已启动！等待课文数据...');
        }
    }
    
    init();
    
})();