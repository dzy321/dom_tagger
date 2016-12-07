(() => {
  let tagger
  const templet = () => {
    return `<div class="__dom_tagger_container">
      <div>
        <label>path:</label>
        <span class="__dom_tagger_path"></span>
        <input type="hidden" />
      </div>
      <div>
        <label>tag:</label><input type="text" class="__dom_tagger_tag" />
      </div>
      <div>
        <button>保存</button>
      </div>
    </div>`
  }
  class Tagger {
    open() {
      // if (!this.container) {
      //   this.createContainer()
      // }
      // this.container.show()
      this.isOpen = true
      this.bindEvent()
    }
    createContainer() {
      this.container = $(templet()).appendTo($(document.body))
    }
    bindEvent() {
      let timer, inOut
      this.onMouseOut = (e) => {
        if (!e.relatedTarget) {
          inOut = true
        }
      }
      this.onMouseMove = (e) => {
        inOut = false
        if (this.cover && this.cover.css('dispaly') !== 'none') {
          this.cover.hide()
        }
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          if (!inOut) {
            this.showCover($(e.target))
          }
        }, 200)
      }
      $(window).mousemove(this.onMouseMove)
      $(window).mouseout(this.onMouseOut)
    }
    showCover($target) {
      if (!this.cover) {
        this.cover = $(`<div class="__dom_tagger_hover"></div>`).appendTo($(document.body))
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
