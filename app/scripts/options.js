(() => {
  const ids = Array.prototype.slice.call(document.getElementsByTagName('input')).map(ipt => ipt.id)

  comm.getConfig().then((config) => {
    // init
    ids.forEach((id) => {
      $(`#${id}`).val(config[id] || '')
    })
  })

  // handle event
  $('#btnOk').click(() => {
    const config = {}
    ids.forEach((id) => {
      config[id] = $.trim($(`#${id}`).val())
    })
    $('#btnOk').prop('disabled', true)
    comm.setConfig(config).then(() => {
      $('#btnOk').prop('disabled', false)
      $('.form-info').fadeToggle('slow', 'linear', () => {
        $('.form-info').fadeToggle('slow', 'linear')
      })
    })
  })
})()
