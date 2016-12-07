(() => {
  const storeKey = 'dt_params'

  window.comm = {
    getConfig() {
      const config = localStorage.getItem(storeKey)
      return config ? JSON.parse(config) : {}
    },
    trim(s) {
      return s.replace(/(^\s*)|(\s*$)/g, '')
    },
    setConfig(config) {
      localStorage.setItem(storeKey, JSON.stringify(config))
    }
  }
})()
