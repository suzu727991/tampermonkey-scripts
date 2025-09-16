// ==UserScript==
// @name         セラーセントラル共有メモ
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Googleスプレッドシートと同期するメモ欄
// @match        https://sellercentral.amazon.co.jp/*
// @updateURL    https://github.com/suzu727991/tampermonkey-scripts/raw/refs/heads/main/%E3%82%BB%E3%83%A9%E3%83%BC%E3%82%BB%E3%83%B3%E3%83%88%E3%83%A9%E3%83%AB%E5%85%B1%E6%9C%89%E3%83%A1%E3%83%A2.user.js
// @downloadURL  https://github.com/suzu727991/tampermonkey-scripts/raw/refs/heads/main/%E3%82%BB%E3%83%A9%E3%83%BC%E3%82%BB%E3%83%B3%E3%83%88%E3%83%A9%E3%83%AB%E5%85%B1%E6%9C%89%E3%83%A1%E3%83%A2.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // このURLはチームで共通のものを使用してください
    const GAS_URL = "https://script.google.com/macros/s/AKfycbyYMh8s_vL9Baedyf2QbCHj51Md9kCbZ3sQqiYCgF00VcqGDLMl4arO2CViF4af-mjm/exec";

    window.addEventListener("load", async () => {
        // コンテナ
        const memoContainer = document.createElement('div');
        memoContainer.style.position = 'fixed';
        memoContainer.style.top = '150px';
        memoContainer.style.left = '20px';
        memoContainer.style.width = '260px';
        memoContainer.style.height = '240px';
        memoContainer.style.zIndex = 999999;
        memoContainer.style.border = '1px solid #aaa';
        memoContainer.style.background = '#fff8c6';
        memoContainer.style.display = 'flex';
        memoContainer.style.flexDirection = 'column';

        // バー
        const dragBar = document.createElement('div');
        dragBar.style.background = '#666';
        dragBar.style.height = '20px';
        dragBar.style.cursor = 'move';
        dragBar.style.color = 'white';
        dragBar.style.fontSize = '12px';
        dragBar.style.padding = '2px 5px';
        dragBar.textContent = '共有メモ (ドラッグで移動)';

        // テキストエリア
        const memoBox = document.createElement('textarea');
        memoBox.style.flex = '1';
        memoBox.style.resize = 'both';
        memoBox.style.padding = '6px';
        memoBox.style.fontSize = '14px';
        memoBox.placeholder = 'ここに書いた内容は共有されます';

        // 最新メモを取得
        try {
            const res = await fetch(GAS_URL);
            const text = await res.text();
            memoBox.value = text;
        } catch(e) {
            memoBox.value = "（メモ取得エラー）";
        }

        // 入力時に保存
        let saveTimer;
        memoBox.addEventListener('input', () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                fetch(GAS_URL, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'text/plain', // GAS側で正しく受け取るために修正
                    },
                    body: JSON.stringify({memo: memoBox.value})
                });
            }, 500); // 500ミリ秒ごとに入力をまとめて送信
        });

        // ドラッグ処理
        let isDragging = false;
        let offsetX, offsetY;
        dragBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - memoContainer.getBoundingClientRect().left;
            offsetY = e.clientY - memoContainer.getBoundingClientRect().top;
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                memoContainer.style.left = (e.clientX - offsetX) + 'px';
                memoContainer.style.top = (e.clientY - offsetY) + 'px';
            }
        });
        document.addEventListener('mouseup', () => { isDragging = false; });

        memoContainer.appendChild(dragBar);
        memoContainer.appendChild(memoBox);
        document.body.appendChild(memoContainer);
    });
})();


