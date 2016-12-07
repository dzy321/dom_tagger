(() => {
  const config = comm.getConfig()

  // init
  const ids = Array.prototype.slice.call(document.getElementsByTagName('input')).map(ipt => ipt.id)

  ids.forEach((id) => {
    document.getElementById(id).value = config[id] || ''
  })

  // handle event
  document.getElementById('btnOk').addEventListener('click', () => {
    ids.forEach((id) => {
      config[id] = comm.trim(document.getElementById(id).value)
    })
    comm.setConfig(config)
  }, false)
})()
