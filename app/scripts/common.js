(() => {
  const storeKey = 'dt_params'

  window.comm = {
    getConfig() {
      return new Promise((resolve) => {
        chrome.storage.local.get({ [storeKey]: {} }, (result) => {
          resolve(result[storeKey] || {})
        })
      })
    },
    setConfig(config) {
      return new Promise((resolve) => {
        chrome.storage.local.set({
          [storeKey]: config
        }, () => {
          resolve()
        })
      })
    }
  }
})()
