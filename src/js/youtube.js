'use strict';
let ScreenshotSaveMethod = 0;
const ScreenshotSaveMethodFileSave = 0;
const ScreenshotSaveMethodTweetOnly = 1;

const windowWidth = 380;
const windowHeight = 400;
const windowLeft = (screen.width - windowWidth) / 2;
const windowTop = (screen.height - windowHeight) / 2;

//保存方法を読込
chrome.storage.sync.get(['ScreenshotSaveMethod'], function (result) {
    if (result.ScreenshotSaveMethod === undefined)
        ScreenshotSaveMethod = 0;
    else
        ScreenshotSaveMethod = result.ScreenshotSaveMethod;
});

//スクリーンショットのボタン設定
let screenshotButton = document.createElement("button");
screenshotButton.className = "screenshotButton ytp-button";
screenshotButton.style.width = "auto";
screenshotButton.innerHTML = '<img src="' + chrome.extension.getURL("icons/icon.svg") + '" style="width:25px;height:25px;transform:translate(0,25%)">'
screenshotButton.style.cssFloat = "left";
screenshotButton.onclick = CaptureScreenshot;

/**
 * スクリーンショットボタンを追加
 */
function AddScreenshotButton() {
    let ytpRightControls = document.getElementsByClassName("ytp-right-controls")[0];
    if (ytpRightControls) {
        ytpRightControls.prepend(screenshotButton);
    }
}

AddScreenshotButton();

/**
 * キャプチャ実行
 */
function CaptureScreenshot() {
    let player = document.getElementsByClassName("video-stream")[0];

    let canvas = document.createElement("canvas");
    canvas.width = player.videoWidth;
    canvas.height = player.videoHeight;
    canvas.getContext('2d').drawImage(player, 0, 0, canvas.width, canvas.height);

    if (ScreenshotSaveMethod == ScreenshotSaveMethodFileSave) {
        canvas.toBlob(async function (blob) {
            let fileName = getFileName();

            let downloadLink = document.createElement("a");
            downloadLink.download = fileName;

            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.click();
        }, 'image/png');
    }

    let dataUrl = canvas.toDataURL();
    chrome.storage.local.set({ 'media_data_url': dataUrl }, function () {
        window.open(chrome.extension.getURL('popup.html'), null,
            'width=' + windowWidth + ',' +
            'height=' + windowHeight + ',' +
            'left=' + windowLeft + ',' +
            'top=' + windowTop + ',toolbar=no,menubar=no,scrollbars=no,resizable=no');
    });


}

/**
 * ファイル名取得
 */
function getFileName() {
    let appendixTitle = "screenshot.png";
    let title;
    let headerEls = document.querySelectorAll("h1.title");

    /**
     * ファイル名を設定
     */
    function SetTitle() {
        if (headerEls.length > 0) {
            title = headerEls[0].innerText.trim();
            return true;
        } else {
            return false;
        }
    }

    if (SetTitle() == false) {
        headerEls = document.querySelectorAll("h1.watch-title-container");

        if (SetTitle() == false)
            title = '';
    }
    let player = document.getElementsByClassName("video-stream")[0];

    let time = player.currentTime;

    title += " ";

    let minutes = Math.floor(time / 60);

    let seconds = Math.floor(time - (minutes * 60));

    if (minutes > 60) {
        let hours = Math.floor(minutes / 60)
        minutes -= hours * 60;
        title += hours + "-";
    }

    title += minutes + "-" + seconds;

    title += " " + appendixTitle;

    return title;
}