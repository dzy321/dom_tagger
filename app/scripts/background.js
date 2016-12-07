(() => {
  const getEnable = (tabId) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {
        action: 'getEnable'
      }, null, (res) => {
        if (res) {
          resolve(res.enable)
        } else {
          reject()
        }
      })
    })
  }
  const setText = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      getEnable(tabs[0].id).then((enable) => {
        chrome.browserAction.setBadgeText({
          text: enable ? 'Tag' : ''
        })
      })
    })
  }
  const sendMsgToActiveTab = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'setEnable' })
    })
  }
  chrome.browserAction.onClicked.addListener(() => {
    sendMsgToActiveTab()
    setText()
  })
  chrome.tabs.onRemoved.addListener(() => {
    setText()
  })
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
      setText()
    }
  })

  chrome.tabs.onActiveChanged.addListener(() => {
    setText()
  })
})()
