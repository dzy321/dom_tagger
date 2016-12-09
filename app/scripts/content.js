(() => {
  let tagger
  const templet = () => {
    return `<div class="__dom_tagger_container">
      <div>
        <label>路径:</label>
        <textarea readOnly rows="3" class="__dom_tagger_path"></textarea>
      </div>
      <div>
        <label>标签:</label><input type="text" class="__dom_tagger_tag" />
      </div>
      <div>
        <button class="__dom_tagger_ok">保存</button>
        <button class="__dom_tagger_cancel">取消</button>
      </div>
    </div>`
  }

  const PostData = (requestUrl, params) => {
    return new Promise((resolve) => {
      const d = document
      const iframe = d.createElement('iframe')
      const uniqueString = `terminus-dom-tag-${new Date().getTime()}`
      d.body.appendChild(iframe)
      iframe.style.display = 'none'
      iframe.contentWindow.name = uniqueString

      const form = d.createElement('form')
      form.target = uniqueString
      form.style.display = 'none'
      form.action = requestUrl
      form.method = 'POST'

      $.each(params, (k, v) => {
        const input = d.createElement('input')
        input.type = 'hidden'
        input.name = k
        input.value = v
        form.appendChild(input)
      })

      d.body.appendChild(form)
      form.submit()
      $(iframe).on('load', () => {
        d.body.removeChild(form)
        d.body.removeChild(iframe)
        resolve()
      })
    })
  }

  const getXPath = (node, path) => {
    let count = 0
    path = path || []

    if (node.parentNode) {
      path = getXPath(node.parentNode, path)
    }

    if (node.previousSibling) { // 获取祖先元素
      count = 1
      let sibling = node.previousSibling
      do {
        if (sibling.nodeType === 1 && sibling.nodeName === node.nodeName) { count++ }
        sibling = sibling.previousSibling
      } while (sibling)
      if (count === 1) { count = null }
    } else if (node.nextSibling) { // 获取子元素
      let sibling = node.nextSibling
      do {
        if (sibling.nodeType === 1 && sibling.nodeName === node.nodeName) {
          count = 1
          sibling = null
        } else {
          count = null
          sibling = sibling.previousSibling
        }
      } while (sibling)
    }

    if (node.nodeType === 1) {
      let attr = ''

      if (node.id) { // 判断是否有id属性
        attr += `[@id='${node.id}']`
      }

      if (node.getAttribute('class') !== null) { // 判断class属性
        attr += `[@class='${node.getAttribute('class')}']`
      }

      attr += count > 0 ? `[${count}]` : '' // 判断当前元素index位置

      path.push(node.nodeName.toLowerCase() + attr)
    }

    return path
  }

  class Tagger {
    open() {
      this.isOpen = true
      delete this.preventEvent
      this.bindEvent()
    }
    bindEvent() {
      let timer, inOut
      this.onMouseOut = (e) => {
        if (this.preventEvent) return
        if (!e.relatedTarget) {
          inOut = true
          this.target = null
        }
      }
      this.onMouseMove = (e) => {
        if (this.preventEvent) return
        inOut = false
        if (this.cover && this.cover.css('dispaly') !== 'none') {
          this.cover.hide()
        }
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          if (!this.isOpen) return
          if (!inOut) {
            this.target = e.target
            this.showCover($(e.target))
          }
        }, 200)
      }
      $(window).mousemove(this.onMouseMove)
      $(window).mouseout(this.onMouseOut)
    }
    hideContainer() {
      this.container.hide('fast', 'linear')
      this.container.find('.__dom_tagger_path').val('')
      this.container.find('.__dom_tagger_tag').val('')
      delete this.preventEvent
    }
    showContainer() {
      this.preventEvent = true
      if (!this.container) {
        this.container = $(templet()).appendTo($(document.body))
        this.container.find('button.__dom_tagger_ok').click(() => {
          this.container.find('button.__dom_tagger_ok').prop('disabled', true)
          const path = this.container.find('.__dom_tagger_path').val()
          const tag = this.container.find('.__dom_tagger_tag').val()
          comm.getConfig().then(({ appId, serverUrl }) => {
            return PostData(serverUrl, {
              path,
              tag,
              appId
            })
          }).then(() => {
            this.hideContainer()
          })
        })
      }
      this.container.find('button.__dom_tagger_cancel').click(() => {
        this.hideContainer()
      })
      this.container.show().find('button.__dom_tagger_ok').prop('disabled', false)
      const path = getXPath(this.target).join('/')
      this.container.find('.__dom_tagger_path').val(path)
    }
    showCover($target) {
      if (!this.cover) {
        this.cover = $(`<div class="__dom_tagger_hover"></div>`).appendTo($(document.body))
        this.cover.click(() => {
          if (!this.isOpen) return
          this.showContainer()
        })
      }
      const { top, left } = $target.offset()
      const width = $target.innerWidth()
      const height = $target.innerHeight()
      this.cover.css({
        top, left, width, height
      }).show()
    }
    close() {
      if (this.container) {
        this.container.remove()
        this.container = null
      }
      if (this.cover) {
        this.cover.remove()
        this.cover = null
      }
      delete this.isOpen
      $(window).off('mousemove', this.onMouseMove)
      $(window).off('mouseout', this.onMouseOut)
    }
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.action) {
      case 'getEnable':
        sendResponse({ enable: tagger && !!tagger.isOpen })
        break
      case 'setEnable':
        if (!tagger) {
          tagger = new Tagger()
        }
        if (tagger.isOpen) {
          tagger.close()
        } else {
          tagger.open()
        }
        break
      default:
        break
    }
  })
})()
