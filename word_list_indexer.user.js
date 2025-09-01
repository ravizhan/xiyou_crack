// ==UserScript==
// @name         单词列表索引器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  提取网页中所有的word-list元素，建立索引并包含bottom中的四个选项
// @author       awaxiaoyu
// @match        https://student.xiyouyingyu.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 控制台日志
    const log = (...args) => console.log('[单词列表索引器]', ...args);
    const error = (...args) => console.error('[单词列表索引器]', ...args);

    // 主函数：提取特定路径下的word-list元素并建立索引
    function extractWordLists() {
        log('开始提取单词列表...');

        // 使用XPath定位到指定路径的父元素: /html/body/div[1]/div/div[2]/div[2]/div/div/div[2]
        const xpath = '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]';
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const parentElement = result.singleNodeValue;
        
        if (!parentElement) {
            error(`未找到指定XPath路径的父元素: ${xpath}`);
            return;
        }

        // 在父元素下获取所有类名包含word-list的div元素(忽略data-v属性)
        const wordLists = parentElement.querySelectorAll('div[class*="word-list"]');

        if (wordLists.length === 0) {
            log('在指定路径下未找到类名包含word-list的div元素');
            return;
        }

        log(`找到 ${wordLists.length} 个类名包含word-list的div元素`);

        // 检查window.textbookData是否存在
        if (!window.textbookData || !Array.isArray(window.textbookData)) {
            error('window.textbookData不存在或不是数组');
            return;
        }

        // 存储索引结果
        const indexedResults = [];
        // 存储正确选项
        const correctOptions = [];

        // 遍历每个匹配的div元素
        wordLists.forEach((wordList, listIndex) => {
            // 初始化当前word-list的索引对象
            const listItem = {
                index: listIndex,
                element: wordList,
                bottomOptions: []
            };

            // 查找类名为bottom的元素
            const bottomElement = wordList.querySelector('.bottom');

            if (bottomElement) {
                // 查找bottom中类名为options的元素
                const options = bottomElement.querySelectorAll('.options');

                // 取前四个选项
                const topFourOptions = Array.from(options).slice(0, 4);

                // 为选项建立索引
                topFourOptions.forEach((option, optionIndex) => {
                    listItem.bottomOptions.push({
                        index: optionIndex,
                        text: option.textContent.trim(),
                        element: option
                    });
                });
            } else {
                error(`div.word-list[${listIndex}] 中未找到类名为bottom的元素`);
            }

            indexedResults.push(listItem);
        });

        // 遍历所有索引结果，对比正确答案
        indexedResults.forEach((listItem, listIndex) => {
            if (listIndex < window.textbookData.length) {
                const textbookItem = window.textbookData[listIndex];
                const targetPhrase = textbookItem.textBookParaphrase;

                if (targetPhrase) {
                    // 查找匹配的选项
                    listItem.bottomOptions.forEach(option => {
                        if (option.text.includes(targetPhrase)) {
                            option.isCorrect = true;
                            correctOptions.push({
                                wordListIndex: listIndex,
                                optionIndex: option.index,
                                text: option.text
                            });
                        }
                    });
                } else {
                    error(`window.textbookData[${listIndex}].textBookParaphrase不存在`);
                }
            } else {
                error(`word-list[${listIndex}] 没有对应的window.textbookData项`);
            }
        });

        // 在控制台输出结果
        log('=== 单词列表索引完成 ===');
        log('索引结果:', indexedResults);
        log('总共有 ' + indexedResults.length + ' 个类名包含word-list的div元素');

        // 输出正确选项
        log('\n=== 正确选项 ===');
        if (correctOptions.length > 0) {
            correctOptions.forEach(item => {
                log(`word-list[${item.wordListIndex}] 选项[${item.optionIndex}]: ${item.text}`);
            });
        } else {
            log('未找到匹配的正确选项');
        }

        // 输出更友好的格式化结果
        log('\n=== 格式化索引结果 ===');
        indexedResults.forEach(item => {
            log(`word-list[${item.index}]`);
            item.bottomOptions.forEach(option => {
                log(`  选项[${option.index}]: ${option.text}`);
            });
        });
    }

    // 当文档加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', extractWordLists);
    } else {
        // 如果文档已经加载完成，直接执行
        setTimeout(extractWordLists, 1000); // 延迟1秒执行，确保所有元素都已渲染
    }
})();