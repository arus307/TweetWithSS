chrome.webNavigation.onHistoryStateUpdated.addListener(function (data) {
  chrome.tabs.get(data.tabId, function (tab) {
    console.log("executeScript();");
    chrome.tabs.executeScript(data.tabId, { code: ' console.log("test"); if (typeof AddScreenshotButton !== "undefined") { AddScreenshotButton(); }', runAt: 'document_start' });
  });
}, { url: [{ hostSuffix: '.youtube.com' }] });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.session) {
    sendResponse({});

    var params = Twitter.deparam(request.session);
    // Get access tokens again.
    Twitter.api('oauth/access_token', 'POST', params, function (res) {
      Twitter.setOAuthTokens(Twitter.deparam(res), function () {
        Twitter.isLoggedIn(function(){
          Twitter.setUserData();
        })
      });
    });
  }

});