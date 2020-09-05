'use strict';

var ScreenshotSaveMethodCheck = [false, false];

chrome.storage.sync.get(['ScreenshotSaveMethod'], function(result) {

    if (result.ScreenshotSaveMethod == undefined) {
        chrome.storage.sync.set({ ScreenshotSaveMethod: 0 });
        result.ScreenshotSaveMethod = 0;
    }
    var radios = document.getElementsByName("ScreenshotSaveMethodCheck");
    for (var i = 0, length = radios.length; i < length; i++) {
        if (i == result.ScreenshotSaveMethod) {
            radios[i].checked = true;
            break;
        }
    }
});

var ScreenshotSaveMethodSet = function(value) {
    chrome.storage.sync.set({ ScreenshotSaveMethod: value });
};

FileSave.oninput = function() {
    ScreenshotSaveMethodSet(this.value);
};
TweetOnly.oninput = function() {
    ScreenshotSaveMethodSet(this.value);
};