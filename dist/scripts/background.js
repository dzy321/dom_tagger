'use strict';

(function () {
  var getEnable = function getEnable(tabId) {
    return new Promise(function (resolve, reject) {
      chrome.tabs.sendMessage(tabId, {
        action: 'getEnable'
      }, null, function (res) {
        if (res) {
          resolve(res.enable);
        } else {
          reject();
        }
      });
    });
  };
  var setText = function setText() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      getEnable(tabs[0].id).then(function (enable) {
        chrome.browserAction.setBadgeText({
          text: enable ? 'Tag' : ''
        });
      });
    });
  };
  var sendMsgToActiveTab = function sendMsgToActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'setEnable' });
    });
  };
  chrome.browserAction.onClicked.addListener(function () {
    sendMsgToActiveTab();
    setText();
  });
  chrome.tabs.onRemoved.addListener(function () {
    setText();
  });
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.status === 'loading') {
      setText();
    }
  });

  chrome.tabs.onActiveChanged.addListener(function () {
    setText();
  });
})();