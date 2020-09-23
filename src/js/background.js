chrome.webNavigation.onHistoryStateUpdated.addListener(function (data) {
  chrome.tabs.get(data.tabId, function (tab) {
    chrome.tabs.executeScript(data.tabId, { code: 'if (typeof AddScreenshotButton !== "undefined") { AddScreenshotButton(); }', runAt: 'document_start' });
  });
}, { url: [{ hostSuffix: '.youtube.com' }] });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.session) {

    var params = Twitter.deparam(request.session);
    // Get access tokens again.
    Twitter.api('oauth/access_token', 'POST', params, function (res) {
      Twitter.setOAuthTokens(Twitter.deparam(res), function () {
        Twitter.setUserData();
        sendResponse({});
      });
    });
  }

});