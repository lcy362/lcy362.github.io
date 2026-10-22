(() => {
  const btfFn = {
    debounce: (func, wait = 0, immediate = false) => {
      let timeout
      return (...args) => {
        const later = () => {
          timeout = null
          if (!immediate) func(...args)
        }
        const callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func(...args)
      }
    },

    throttle: (func, wait, options = {}) => {
      let timeout, args
      let previous = 0

      const later = () => {
        previous = options.leading === false ? 0 : new Date().getTime()
        timeout = null
        func(...args)
        if (!timeout) args = null
      }

      return (...params) => {
        const now = new Date().getTime()
        if (!previous && options.leading === false) previous = now
        const remaining = wait - (now - previous)
        args = params

        if (remaining <= 0 || remaining > wait) {
          if (timeout) {
            clearTimeout(timeout)
            timeout = null
          }
          previous = now
          func(...args)
          if (!timeout) args = null
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining)
        }
      }
    },

    rafThrottle: fn => {
      let rafId = null
      return (...args) => {
        if (rafId) return
        rafId = requestAnimationFrame(() => {
          fn(...args)
          rafId = null
        })
      }
    },

    overflowPaddingR: (() => {
      let headerElement = null
      let menuElement = null

      const getElements = () => {
        if (!headerElement) {
          headerElement = document.getElementById('page-header')
        }
        if (!menuElement) {
          menuElement = document.getElementById('menus')
        }
        return { headerElement, menuElement }
      }

      return {
        add: () => {
          const paddingRight = window.innerWidth - document.body.clientWidth

          if (paddingRight > 0) {
            document.body.style.paddingRight = `${paddingRight}px`
            document.body.style.overflow = 'hidden'
            const { headerElement: header, menuElement: menu } = getElements()
            if (header && menu && header.classList.contains('nav-fixed')) {
              menu.style.paddingRight = `${paddingRight}px`
            }
          }
        },
        remove: () => {
          document.body.style.paddingRight = ''
          document.body.style.overflow = ''
          const { headerElement: header, menuElement: menu } = getElements()
          if (header && menu && header.classList.contains('nav-fixed')) {
            menu.style.paddingRight = ''
          }
        }
      }
    })(),

    snackbarShow: (text, showAction = false, duration = 2000) => {
      const { position, bgLight, bgDark } = GLOBAL_CONFIG.Snackbar
      const bg = document.documentElement.getAttribute('data-theme') === 'light' ? bgLight : bgDark
      Snackbar.show({
        text,
        backgroundColor: bg,
        showAction,
        duration,
        pos: position,
        customClass: 'snackbar-css'
      })
    },

    diffDate: (inputDate, more = false) => {
      const dateNow = new Date()
      const datePost = new Date(inputDate)
      const diffMs = dateNow - datePost
      const diffSec = diffMs / 1000
      const diffMin = diffSec / 60
      const diffHour = diffMin / 60
      const diffDay = diffHour / 24
      const diffMonth = diffDay / 30
      const { dateSuffix } = GLOBAL_CONFIG

      if (!more) return Math.floor(diffDay)

      if (diffMonth > 12) return datePost.toISOString().slice(0, 10)
      if (diffMonth >= 1) return `${Math.floor(diffMonth)} ${dateSuffix.month}`
      if (diffDay >= 1) return `${Math.floor(diffDay)} ${dateSuffix.day}`
      if (diffHour >= 1) return `${Math.floor(diffHour)} ${dateSuffix.hour}`
      if (diffMin >= 1) return `${Math.floor(diffMin)} ${dateSuffix.min}`
      return dateSuffix.just
    },

    loadComment: (dom, callback) => {
      if ('IntersectionObserver' in window) {
        const observerItem = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            callback()
            observerItem.disconnect()
          }
        }, { threshold: [0] })
        observerItem.observe(dom)
      } else {
        callback()
      }
    },

    scrollToDest: (pos, time = 500) => {
      const currentPos = window.scrollY
      const isNavFixed = document.getElementById('page-header').classList.contains('fixed')
      if (currentPos > pos || isNavFixed) pos = pos - 70

      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: pos,
          behavior: 'smooth'
        })
        return
      }

      const startTime = performance.now()
      const animate = currentTime => {
        const timeElapsed = currentTime - startTime
        const progress = Math.min(timeElapsed / time, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 4) // easeOutQuart
        window.scrollTo(0, currentPos + (pos - currentPos) * easedProgress)
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    },

    animateIn: (ele, animation) => {
      ele.style.display = 'block'
      ele.style.animation = animation
    },

    animateOut: (ele, animation) => {
      const handleAnimationEnd = () => {
        ele.style.display = ''
        ele.style.animation = ''
        ele.removeEventListener('animationend', handleAnimationEnd)
      }
      ele.addEventListener('animationend', handleAnimationEnd)
      ele.style.animation = animation
    },

    wrap: (selector, eleType, options) => {
      const createEle = document.createElement(eleType)
      for (const [key, value] of Object.entries(options)) {
        createEle.setAttribute(key, value)
      }
      selector.parentNode.insertBefore(createEle, selector)
      createEle.appendChild(selector)
    },

    isHidden: ele => ele.offsetHeight === 0 && ele.offsetWidth === 0,

    getEleTop: ele => ele.getBoundingClientRect().top + window.scrollY,

    loadLightbox: ele => {
      const service = GLOBAL_CONFIG.lightbox

      if (service === 'medium_zoom') {
        mediumZoom(ele, { background: 'var(--zoom-bg)' })
        return
      }

      if (service === 'fancybox') {
        ele.forEach(i => {
          if (i.parentNode.tagName !== 'A') {
            const dataSrc = i.dataset.lazySrc || i.src
            const dataCaption = i.title || i.alt || ''
            btf.wrap(i, 'a', { href: dataSrc, 'data-fancybox': 'gallery', 'data-caption': dataCaption, 'data-thumb': dataSrc })
          }
        })

        if (!window.fancyboxRun) {
          let options = ''
          if (Fancybox.version < '6') {
            options = {
              Hash: false,
              Thumbs: {
                showOnStart: false
              },
              Images: {
                Panzoom: {
                  maxScale: 4
                }
              },
              Carousel: {
                transition: 'slide'
              },
              Toolbar: {
                display: {
                  left: ['infobar'],
                  middle: [
                    'zoomIn',
                    'zoomOut',
                    'toggle1to1',
                    'rotateCCW',
                    'rotateCW',
                    'flipX',
                    'flipY'
                  ],
                  right: ['slideshow', 'thumbs', 'close']
                }
              },
              hideScrollbar: false
            }
          } else {
            options = {
              Hash: false,
              Carousel: {
                transition: 'slide',
                Thumbs: {
                  showOnStart: false
                },
                Toolbar: {
                  display: {
                    left: ['counter'],
                    middle: [
                      'zoomIn',
                      'zoomOut',
                      'toggle1to1',
                      'rotateCCW',
                      'rotateCW',
                      'flipX',
                      'flipY',
                      'reset'
                    ],
                    right: ['autoplay', 'thumbs', 'close']
                  }
                },
                Zoomable: {
                  Panzoom: {
                    maxScale: 4
                  }
                }
              },
              hideScrollbar: false
            }
          }

          Fancybox.bind('[data-fancybox]', options)
          window.fancyboxRun = true
        }
      }
    },

    setLoading: {
      add: ele => {
        const html = `
        <div class="loading-container">
          <div class="loading-item">
            <div></div><div></div><div></div><div></div><div></div>
          </div>
        </div>
      `
        ele.insertAdjacentHTML('afterend', html)
      },
      remove: ele => {
        ele.nextElementSibling.remove()
      }
    },

    updateAnchor: anchor => {
      if (anchor !== window.location.hash) {
        if (!anchor) anchor = location.pathname
        const title = GLOBAL_CONFIG_SITE.title
        window.history.replaceState({
          url: location.href,
          title
        }, title, anchor)
      }
    },

    getScrollPercent: (() => {
      let docHeight, winHeight, headerHeight, contentMath

      return (currentTop, ele) => {
        if (!docHeight || ele.clientHeight !== docHeight) {
          docHeight = ele.clientHeight
          winHeight = window.innerHeight
          headerHeight = ele.offsetTop
          contentMath = Math.max(docHeight - winHeight, document.documentElement.scrollHeight - winHeight)
        }

        const scrollPercent = (currentTop - headerHeight) / contentMath
        return Math.max(0, Math.min(100, Math.round(scrollPercent * 100)))
      }
    })(),

    addEventListenerPjax: (ele, event, fn, option = false) => {
      ele.addEventListener(event, fn, option)
      btf.addGlobalFn('pjaxSendOnce', () => {
        ele.removeEventListener(event, fn, option)
      })
    },

    removeGlobalFnEvent: (key, parent = window) => {
      const globalFn = parent.globalFn || {}
      const keyObj = globalFn[key]
      if (!keyObj) return

      Object.keys(keyObj).forEach(i => keyObj[i]())

      delete globalFn[key]
    },

    switchComments: (el = document, path) => {
      const switchBtn = el.querySelector('#switch-btn')
      if (!switchBtn) return

      let switchDone = false
      const postComment = el.querySelector('#post-comment')
      const handleSwitchBtn = () => {
        postComment.classList.toggle('move')
        if (!switchDone && typeof loadOtherComment === 'function') {
          switchDone = true
          loadOtherComment(el, path)
        }
      }
      btf.addEventListenerPjax(switchBtn, 'click', handleSwitchBtn)
    }
  }

  window.btf = { ...window.btf, ...btfFn }
})()
;
document.addEventListener('DOMContentLoaded', () => {
  let headerContentWidth, $nav
  let mobileSidebarOpen = false

  // rightsideScrollPercent
  let goUpElement = null
  let scrollPercentElement = null

  const adjustMenu = init => {
    let hideMenuIndex = false

    if (init) {
      const blogInfoWidth = Array.from(document.querySelector('#blog-info > a').children).reduce((w, i) => w + i.offsetWidth, 0)
      const menusWidth = Array.from(document.getElementById('menus').children).reduce((w, i) => w + i.offsetWidth, 0)
      headerContentWidth = blogInfoWidth + menusWidth
      $nav = document.getElementById('nav')
    }

    hideMenuIndex = window.innerWidth <= 768 || headerContentWidth > $nav.offsetWidth - 120

    requestAnimationFrame(() => {
      $nav.classList.toggle('hide-menu', hideMenuIndex)
    })
  }

  // 初始化header
  const initAdjust = () => {
    adjustMenu(true)
    $nav.classList.add('show')
  }

  // sidebar menus
  const sidebarFn = {
    open: () => {
      btf.overflowPaddingR.add()
      btf.animateIn(document.getElementById('menu-mask'), 'to_show 0.5s')
      document.getElementById('sidebar-menus').classList.add('open')
      mobileSidebarOpen = true
    },
    close: () => {
      btf.overflowPaddingR.remove()
      btf.animateOut(document.getElementById('menu-mask'), 'to_hide 0.5s')
      document.getElementById('sidebar-menus').classList.remove('open')
      mobileSidebarOpen = false
    }
  }

  /**
   * 首頁top_img底下的箭頭
   */
  const scrollDownInIndex = () => {
    const handleScrollToDest = () => {
      btf.scrollToDest(document.getElementById('content-inner').offsetTop, 300)
    }

    const $scrollDownEle = document.getElementById('scroll-down')
    $scrollDownEle && btf.addEventListenerPjax($scrollDownEle, 'click', handleScrollToDest)
  }

  /**
   * 代碼
   * 只適用於Hexo默認的代碼渲染
   */
  const addHighlightTool = $article => {
    const highLight = GLOBAL_CONFIG.highlight
    if (!highLight) return

    const { highlightCopy, highlightLang, highlightHeightLimit, highlightFullpage, highlightMacStyle, plugin } = highLight
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
    const isShowTool = highlightCopy || highlightLang || isHighlightShrink !== undefined || highlightFullpage || highlightMacStyle
    const isNotHighlightJs = plugin !== 'highlight.js'
    const isPrismjs = plugin === 'prismjs'
    const $figureHighlight = isNotHighlightJs
      ? Array.from($article.querySelectorAll('code[class*="language-"]')).map(code => code.parentElement)
      : $article.querySelectorAll('figure.highlight')

    if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

    const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''
    const highlightShrinkEle = isHighlightShrink !== undefined ? '<i class="fas fa-angle-down expand"></i>' : ''
    const highlightCopyEle = highlightCopy ? '<i class="fas fa-paste copy-button"></i>' : ''
    const highlightMacStyleEle = '<div class="macStyle"><div class="mac-close"></div><div class="mac-minimize"></div><div class="mac-maximize"></div></div>'
    const highlightFullpageEle = highlightFullpage ? '<i class="fa-solid fa-up-right-and-down-left-from-center fullpage-button"></i>' : ''

    const alertInfo = (ele, text) => {
      if (GLOBAL_CONFIG.Snackbar !== undefined) {
        btf.snackbarShow(text)
      } else {
        const newEle = document.createElement('div')
        newEle.className = 'copy-notice'
        newEle.textContent = text
        document.body.appendChild(newEle)

        const buttonRect = ele.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        // X-axis boundary check
        const halfWidth = newEle.offsetWidth / 2
        const centerLeft = buttonRect.left + scrollLeft + buttonRect.width / 2
        const finalLeft = Math.max(halfWidth + 10, Math.min(window.innerWidth - halfWidth - 10, centerLeft))

        // Show tooltip below button if too close to top
        const normalTop = buttonRect.top + scrollTop - 40
        const shouldShowBelow = buttonRect.top < 60 || normalTop < 10

        const topValue = shouldShowBelow ? buttonRect.top + scrollTop + buttonRect.height + 10 : normalTop

        newEle.style.cssText = `
      top: ${topValue + 10}px;
      left: ${finalLeft}px;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.3s ease, top 0.3s ease;
    `

        requestAnimationFrame(() => {
          newEle.style.opacity = '1'
          newEle.style.top = `${topValue}px`
        })

        setTimeout(() => {
          newEle.style.opacity = '0'
          newEle.style.top = `${topValue + 10}px`
          setTimeout(() => {
            newEle?.remove()
          }, 300)
        }, 800)
      }
    }

    const copy = async (text, ctx) => {
      try {
        await navigator.clipboard.writeText(text)
        alertInfo(ctx, GLOBAL_CONFIG.copy.success)
      } catch (err) {
        console.error('Failed to copy: ', err)
        alertInfo(ctx, GLOBAL_CONFIG.copy.noSupport)
      }
    }

    // click events
    const highlightCopyFn = (ele, clickEle) => {
      const $buttonParent = ele.parentNode
      $buttonParent.classList.add('copy-true')
      const preCodeSelector = isNotHighlightJs ? 'pre code' : 'table .code pre'
      const codeElement = $buttonParent.querySelector(preCodeSelector)
      if (!codeElement) return
      copy(codeElement.innerText, clickEle)
      $buttonParent.classList.remove('copy-true')
    }

    const highlightShrinkFn = ele => ele.classList.toggle('closed')

    const codeFullpage = (item, clickEle) => {
      const wrapEle = item.closest('figure.highlight')
      const isFullpage = wrapEle.classList.toggle('code-fullpage')

      document.body.style.overflow = isFullpage ? 'hidden' : ''
      clickEle.classList.toggle('fa-down-left-and-up-right-to-center', isFullpage)
      clickEle.classList.toggle('fa-up-right-and-down-left-from-center', !isFullpage)
    }

    const highlightToolsFn = e => {
      const $target = e.target.classList
      const currentElement = e.currentTarget
      if ($target.contains('expand')) highlightShrinkFn(currentElement)
      else if ($target.contains('copy-button')) highlightCopyFn(currentElement, e.target)
      else if ($target.contains('fullpage-button')) codeFullpage(currentElement, e.target)
    }

    const expandCode = e => e.currentTarget.classList.toggle('expand-done')

    // 獲取隱藏狀態下元素的真實高度
    const getActualHeight = item => {
      if (item.offsetHeight > 0) return item.offsetHeight

      const clone = item.cloneNode(true)

      clone.style.cssText = `
        position: absolute !important;
        visibility: hidden !important;
        display: block !important;
        left: 0 !important;
        top: 0 !important;
        pointer-events: none !important;
        z-index: -1 !important;
        margin: 0 !important;
      `

      item.parentNode.insertBefore(clone, item)
      const height = clone.offsetHeight
      clone.remove()
      return height
    }

    const createEle = (lang, item) => {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightMacStyleEle + highlightShrinkEle + lang + highlightCopyEle + highlightFullpageEle
        btf.addEventListenerPjax(hlTools, 'click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && getActualHeight(item) > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        btf.addEventListenerPjax(ele, 'click', expandCode)
        fragment.appendChild(ele)
      }

      isNotHighlightJs ? item.parentNode.insertBefore(fragment, item) : item.insertBefore(fragment, item.firstChild)
    }

    $figureHighlight.forEach(item => {
      let langName = ''
      if (isNotHighlightJs) {
        const newClassName = isPrismjs ? 'prismjs' : 'default'
        btf.wrap(item, 'figure', { class: `highlight ${newClassName}` })
      }

      if (!highlightLang) {
        createEle('', item)
        return
      }

      if (isNotHighlightJs) {
        langName = isPrismjs ? item.getAttribute('data-language') || 'Code' : item.querySelector('code').getAttribute('class').replace('language-', '')
      } else {
        langName = item.getAttribute('class').split(' ')[1]
        if (langName === 'plain' || langName === undefined) langName = 'Code'
      }
      createEle(`<div class="code-lang">${langName}</div>`, item)
    })
  }

  /**
   * PhotoFigcaption
   */
  const addPhotoFigcaption = $article => {
    if (!GLOBAL_CONFIG.isPhotoFigcaption) return
    $article.querySelectorAll('img').forEach(item => {
      const altValue = item.title || item.alt
      if (!altValue) return
      const ele = document.createElement('div')
      ele.className = 'img-alt text-center'
      ele.textContent = altValue
      item.insertAdjacentElement('afterend', ele)
    })
  }

  /**
   * Lightbox
   */
  const runLightbox = $article => {
    btf.loadLightbox($article.querySelectorAll('img:not(.no-lightbox)'))
  }

  /**
   * justified-gallery 圖庫排版
   */

  const fetchUrl = async url => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch URL:', error)
      throw error
    }
  }

  const runJustifiedGallery = (container, data, config) => {
    const { isButton, tabs } = config
    const limit = Math.max(1, Number(config.limit) || 20)
    const firstLimit = Math.max(1, Number(config.firstLimit) || limit)

    const dataLength = data.length
    const maxGroupKey = dataLength
      ? Math.ceil(Math.max(0, dataLength - firstLimit) / limit) + 1
      : 0

    // Gallery configuration
    const igConfig = {
      gap: 5,
      isConstantSize: true,
      sizeRange: [150, 600],
      // useResizeObserver: true,
      // observeChildren: true,
      useTransform: true
      // useRecycle: false
    }

    const ig = new InfiniteGrid.JustifiedInfiniteGrid(container, igConfig)
    let isLayoutHidden = false

    // Utility functions
    const sanitizeString = str => String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    const createImageItem = item => {
      const alt = item.alt ? `alt="${sanitizeString(item.alt)}"` : ''
      const title = item.title ? `title="${sanitizeString(item.title)}"` : ''
      const url = item.url ? sanitizeString(item.url) : ''
      return `<div class="item">
        <img src="${url}" data-grid-maintained-target="true" ${alt} ${title} />
      </div>`
    }

    const getItems = (nextGroupKey, count, isFirst = false) => {
      const startIndex = isFirst ? (nextGroupKey - 1) * count : (nextGroupKey - 2) * count + firstLimit
      return data.slice(startIndex, startIndex + count).map(createImageItem)
    }

    // Load more button
    const addLoadMoreButton = container => {
      const button = document.createElement('button')
      button.innerHTML = `${GLOBAL_CONFIG.infinitegrid.buttonText}<i class="fa-solid fa-arrow-down"></i>`

      button.addEventListener('click', () => {
        button.remove()
        btf.setLoading.add(container)
        appendItems(ig.getGroups().length + 1, limit)
      }, { once: true })

      container.insertAdjacentElement('afterend', button)
    }

    const appendItems = (nextGroupKey, count, isFirst) => {
      ig.append(getItems(nextGroupKey, count, isFirst), nextGroupKey)
    }

    // Event handlers
    const handleRenderComplete = e => {
      if (tabs) {
        const parentNode = container.parentNode
        if (isLayoutHidden) {
          parentNode.style.visibility = 'visible'
        }
        if (container.offsetHeight === 0) {
          parentNode.style.visibility = 'hidden'
          isLayoutHidden = true
        }
      }

      const { updated, isResize, mounted } = e
      if (!updated.length || !mounted.length || isResize) return

      btf.loadLightbox(container.querySelectorAll('img:not(.medium-zoom-image)'))

      if (ig.getGroups().length === maxGroupKey) {
        btf.setLoading.remove(container)
        !tabs && ig.off('renderComplete', handleRenderComplete)
        return
      }

      if (isButton) {
        btf.setLoading.remove(container)
        addLoadMoreButton(container)
      }
    }

    const handleRequestAppend = btf.debounce(e => {
      const nextGroupKey = (+e.groupKey || 0) + 1

      if (nextGroupKey === 1) appendItems(nextGroupKey, firstLimit, true)
      else appendItems(nextGroupKey, limit)

      if (nextGroupKey === maxGroupKey) ig.off('requestAppend', handleRequestAppend)
    }, 300)

    btf.setLoading.add(container)
    ig.on('renderComplete', handleRenderComplete)

    if (isButton && dataLength) {
      appendItems(1, firstLimit, true)
    } else if (dataLength) {
      ig.on('requestAppend', handleRequestAppend)
      ig.renderItems()
    } else {
      btf.setLoading.remove(container)
    }

    btf.addGlobalFn('pjaxSendOnce', () => ig.destroy())
  }

  const addJustifiedGallery = async (elements, tabs = false) => {
    if (!elements.length) return

    const initGallery = async () => {
      for (const element of elements) {
        if (btf.isHidden(element) || element.classList.contains('loaded')) continue

        const config = {
          isButton: element.getAttribute('data-button') === 'true',
          limit: parseInt(element.getAttribute('data-limit'), 10),
          firstLimit: parseInt(element.getAttribute('data-first'), 10),
          tabs
        }

        const container = element.firstElementChild
        const content = container.textContent
        container.textContent = ''
        try {
          const data = element.getAttribute('data-type') === 'url' ? await fetchUrl(content) : JSON.parse(content)
          if (!Array.isArray(data)) throw new TypeError('Gallery data must be an array')
          runJustifiedGallery(container, data, config)
          element.classList.add('loaded')
        } catch (error) {
          console.error('Gallery data parsing failed:', error)
        }
      }
    }

    if (typeof InfiniteGrid === 'function') {
      await initGallery()
    } else {
      await btf.getScript(GLOBAL_CONFIG.infinitegrid.js)
      await initGallery()
    }
  }

  /**
   * rightside scroll percent
   */
  const rightsideScrollPercent = currentTop => {
    const scrollPercent = btf.getScrollPercent(currentTop, document.body)

    if (!goUpElement || !scrollPercentElement) return
    if (scrollPercent < 95) {
      goUpElement.classList.add('show-percent')
      scrollPercentElement.textContent = scrollPercent
    } else {
      goUpElement.classList.remove('show-percent')
    }
  }

  /**
   * 滾動處理
   */
  const scrollFn = () => {
    const $rightside = document.getElementById('rightside')
    let initTop = 0
    const $header = document.getElementById('page-header')
    const isChatBtn = typeof window.chatBtn !== 'undefined'
    const isShowPercent = GLOBAL_CONFIG.percent.rightside

    // 檢查文檔高度是否小於視窗高度
    const checkDocumentHeight = () => {
      if (document.body.scrollHeight <= window.innerHeight + 56) {
        $rightside.classList.add('rightside-show')
        return true
      }
      return false
    }

    // find the scroll direction
    const scrollDirection = currentTop => {
      const result = currentTop > initTop // true is down & false is up
      initTop = currentTop
      return result
    }

    let flag = ''
    const scrollTask = btf.rafThrottle(() => {
      if (checkDocumentHeight()) return

      const currentTop = window.scrollY || document.documentElement.scrollTop
      const isDown = scrollDirection(currentTop)
      if (currentTop > 56) {
        if (flag === '') {
          $header.classList.add('nav-fixed')
          $rightside.classList.add('rightside-show')
        }

        if (isDown) {
          if (flag !== 'down') {
            $header.classList.remove('nav-visible')
            isChatBtn && window.chatBtn.hide()
            flag = 'down'
          }
        } else {
          if (flag !== 'up') {
            $header.classList.add('nav-visible')
            isChatBtn && window.chatBtn.show()
            flag = 'up'
          }
        }
      } else {
        flag = ''
        if (currentTop === 0) {
          $header.classList.remove('nav-fixed', 'nav-visible')
        }
        $rightside.classList.remove('rightside-show')
      }

      isShowPercent && rightsideScrollPercent(currentTop)
    })

    checkDocumentHeight()
    btf.addEventListenerPjax(window, 'scroll', scrollTask, { passive: true })
  }

  /**
  * toc, anchor
  */
  const scrollFnToDo = $article => {
    const isToc = GLOBAL_CONFIG_SITE.isToc
    const isAnchor = GLOBAL_CONFIG.isAnchor

    if (!($article && (isToc || isAnchor))) return

    let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand

    if (isToc) {
      const $cardTocLayout = document.getElementById('card-toc')
      $cardToc = $cardTocLayout.querySelector('.toc-content')
      $tocLink = $cardToc.querySelectorAll('.toc-link')
      $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
      isExpand = $cardToc.classList.contains('is-expand')

      const tocItemClickFn = e => {
        const target = e.target.closest('.toc-link')
        if (!target) return

        e.preventDefault()
        btf.scrollToDest(btf.getEleTop(document.getElementById(decodeURI(target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
          $cardTocLayout.classList.remove('open')
        }
      }

      btf.addEventListenerPjax($cardToc, 'click', tocItemClickFn)

      autoScrollToc = item => {
        const sidebarHeight = $cardToc.clientHeight
        const itemOffsetTop = item.offsetTop
        const itemHeight = item.clientHeight
        const scrollTop = $cardToc.scrollTop
        const offset = itemOffsetTop - scrollTop
        const middlePosition = (sidebarHeight - itemHeight) / 2

        if (offset !== middlePosition) {
          $cardToc.scrollTop = scrollTop + (offset - middlePosition)
        }
      }

      $cardToc.style.display = 'block'
    }

    const $articleList = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
    if (!$articleList.length) return

    let activeTocItem = null
    let activeParentItems = []

    const updateTocUI = currentId => {
      const encodedAnchor = currentId ? '#' + encodeURI(decodeURI(currentId)) : ''
      if (isAnchor) btf.updateAnchor(encodedAnchor)

      if (!isToc) return

      if (activeTocItem) activeTocItem.classList.remove('active')
      activeParentItems.forEach(i => i.classList.remove('active'))
      activeParentItems = []

      if (!currentId) {
        activeTocItem = null
        return
      }

      const targetLink = Array.from($tocLink).find(link => {
        const href = link.getAttribute('href')
        if (!href) return false
        return decodeURI(href).replace('#', '') === decodeURI(currentId)
      })

      if (!targetLink) return

      targetLink.classList.add('active')
      activeTocItem = targetLink
      setTimeout(() => autoScrollToc(targetLink), 0)

      if (!isExpand) {
        let parent = targetLink.parentNode
        while (!parent.matches('.toc')) {
          if (parent.matches('li')) {
            parent.classList.add('active')
            activeParentItems.push(parent)
          }
          parent = parent.parentNode
        }
      }
    }

    const observerOptions = {
      root: null,
      rootMargin: '-60px 0px -80% 0px',
      threshold: 0
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateTocUI(entry.target.id)
        }
      })
    }, observerOptions)

    $articleList.forEach(ele => observer.observe(ele))

    const scrollHandler = btf.rafThrottle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop

      if (isToc && GLOBAL_CONFIG.percent.toc) {
        $tocPercentage.textContent = btf.getScrollPercent(currentTop, $article)
      }

      if (currentTop === 0) {
        updateTocUI('')
      } else if (currentTop + window.innerHeight >= document.documentElement.scrollHeight - 10) {
        const lastHeader = $articleList[$articleList.length - 1]
        updateTocUI(lastHeader.id)
      }
    })

    btf.addEventListenerPjax(window, 'scroll', scrollHandler, { passive: true })

    btf.addGlobalFn('pjaxSendOnce', () => {
      observer.disconnect()
    })
  }

  const handleThemeChange = mode => {
    const globalFn = window.globalFn || {}
    const themeChange = globalFn.themeChange
    if (!themeChange) return

    Object.keys(themeChange).forEach(key => {
      const fn = themeChange[key]
      if (typeof fn !== 'function') return

      if (['disqus', 'disqusjs'].includes(key)) {
        setTimeout(() => fn(mode), 300)
      } else {
        fn(mode)
      }
    })
  }

  /**
   * Rightside
   */
  const rightSideFn = {
    readmode: () => { // read mode
      const $body = document.body
      const newEle = document.createElement('button')

      const exitReadMode = () => {
        $body.classList.remove('read-mode')
        newEle.remove()
        newEle.removeEventListener('click', exitReadMode)
      }

      $body.classList.add('read-mode')
      newEle.type = 'button'
      newEle.className = 'exit-readmode'
      newEle.innerHTML = '<i class="fas fa-sign-out-alt"></i>'
      newEle.addEventListener('click', exitReadMode)
      $body.appendChild(newEle)
    },
    darkmode: () => { // switch between light and dark mode
      const willChangeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      if (willChangeMode === 'dark') {
        btf.activateDarkMode()
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
      } else {
        btf.activateLightMode()
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
      }
      btf.saveToLocal.set('theme', willChangeMode, 2)
      handleThemeChange(willChangeMode)
    },
    'rightside-config': item => { // Show or hide rightside-hide-btn
      const hideLayout = item.firstElementChild
      if (hideLayout.classList.contains('show')) {
        hideLayout.classList.add('status')
        setTimeout(() => {
          hideLayout.classList.remove('status')
        }, 300)
      }

      hideLayout.classList.toggle('show')
    },
    'go-up': () => { // Back to top
      btf.scrollToDest(0, 500)
    },
    'hide-aside-btn': () => { // Hide aside
      const $htmlDom = document.documentElement.classList
      const saveStatus = $htmlDom.contains('hide-aside') ? 'show' : 'hide'
      btf.saveToLocal.set('aside-status', saveStatus, 2)
      $htmlDom.toggle('hide-aside')
    },
    'mobile-toc-button': (p, item) => { // Show mobile toc
      const tocEle = document.getElementById('card-toc')
      tocEle.style.transition = 'transform 0.3s ease-in-out'

      const tocEleHeight = tocEle.clientHeight
      const btData = item.getBoundingClientRect()

      const tocEleBottom = window.innerHeight - btData.bottom - 30
      if (tocEleHeight > tocEleBottom) {
        tocEle.style.transformOrigin = `right ${tocEleHeight - tocEleBottom - btData.height / 2}px`
      }

      tocEle.classList.toggle('open')
      tocEle.addEventListener('transitionend', () => {
        tocEle.style.cssText = ''
      }, { once: true })
    },
    'chat-btn': () => { // Show chat
      window.chatBtnFn()
    },
    translateLink: () => { // switch between traditional and simplified chinese
      window.translateFn.translatePage()
    }
  }

  document.getElementById('rightside').addEventListener('click', e => {
    const $target = e.target.closest('[id]')
    if ($target && rightSideFn[$target.id]) {
      rightSideFn[$target.id](e.currentTarget, $target)
    }
  })

  /**
   * menu
   * 側邊欄sub-menu 展開/收縮
   */
  const clickFnOfSubMenu = () => {
    const handleClickOfSubMenu = e => {
      const target = e.target.closest('.site-page.group')
      if (!target) return
      target.classList.toggle('hide')
    }

    const menusItems = document.querySelector('#sidebar-menus .menus_items')
    menusItems && menusItems.addEventListener('click', handleClickOfSubMenu)
  }

  /**
   * 手机端目录点击
   */
  const openMobileMenu = () => {
    const toggleMenu = document.getElementById('toggle-menu')
    if (!toggleMenu) return
    btf.addEventListenerPjax(toggleMenu, 'click', () => { sidebarFn.open() })
  }

  /**
 * 複製時加上版權信息
 */
  const addCopyright = () => {
    const { limitCount, languages } = GLOBAL_CONFIG.copyright

    const handleCopy = e => {
      e.preventDefault()
      const copyFont = window.getSelection(0).toString()
      let textFont = copyFont
      if (copyFont.length > limitCount) {
        textFont = `${copyFont}\n\n\n${languages.author}\n${languages.link}${window.location.href}\n${languages.source}\n${languages.info}`
      }
      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      } else {
        return window.clipboardData.setData('text', textFont)
      }
    }

    document.body.addEventListener('copy', handleCopy)
  }

  /**
   * 網頁運行時間
   */
  const addRuntime = () => {
    const $runtimeCount = document.getElementById('runtimeshow')
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute('data-publishDate')
      $runtimeCount.textContent = `${btf.diffDate(publishDate)} ${GLOBAL_CONFIG.runtime}`
    }
  }

  /**
   * 最後一次更新時間
   */
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById('last-push-date')
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
      $lastPushDateItem.textContent = btf.diffDate(lastPushDate, true)
    }
  }

  /**
   * table overflow
   */
  const addTableWrap = $article => {
    const $table = $article.querySelectorAll('table')
    if (!$table.length) return

    $table.forEach(item => {
      if (!item.closest('.highlight')) {
        btf.wrap(item, 'div', { class: 'table-wrap' })
      }
    })
  }

  const clickFnOfTagHide = $article => {
    const hideButtons = $article.querySelectorAll('.hide-button')
    if (!hideButtons.length) return

    const handleClickOfTagHide = e => {
      const button = e.target.closest('.hide-button')
      if (!button) return
      button.classList.add('open')
      addJustifiedGallery(button.nextElementSibling.querySelectorAll('.gallery-container'))
    }

    btf.addEventListenerPjax($article, 'click', handleClickOfTagHide)
  }

  const tabsFn = $article => {
    if (!$article.querySelector('.tabs')) return

    const setActiveClass = (elements, activeIndex) => {
      elements.forEach((el, index) => el.classList.toggle('active', index === activeIndex))
    }

    const handleClick = e => {
      const tabsRoot = e.target.closest('.tabs')
      if (!tabsRoot) return

      const navContainer = tabsRoot.firstElementChild
      const toTopContainer = tabsRoot.lastElementChild

      if (navContainer.contains(e.target)) {
        const target = e.target.closest('button')
        if (!target || target.classList.contains('active')) return

        const navItems = [...navContainer.children]
        const tabContents = [...navContainer.nextElementSibling.children]
        const indexOfButton = navItems.indexOf(target)
        setActiveClass(navItems, indexOfButton)
        navContainer.classList.remove('no-default')
        setActiveClass(tabContents, indexOfButton)
        addJustifiedGallery(tabContents[indexOfButton].querySelectorAll('.gallery-container'), true)
        return
      }

      if (toTopContainer.contains(e.target) && e.target.closest('button')) {
        btf.scrollToDest(btf.getEleTop(tabsRoot), 300)
      }
    }

    btf.addEventListenerPjax($article, 'click', handleClick)
  }

  const toggleCardCategory = () => {
    const cardCategory = document.querySelector('#aside-cat-list.expandBtn')
    if (!cardCategory) return

    const handleToggleBtn = e => {
      const target = e.target
      if (target.nodeName === 'I') {
        e.preventDefault()
        target.parentNode.classList.toggle('expand')
      }
    }
    btf.addEventListenerPjax(cardCategory, 'click', handleToggleBtn, true)
  }

  const addPostOutdateNotice = () => {
    const ele = document.getElementById('post-outdate-notice')
    if (!ele) return

    const { limitDay, messagePrev, messageNext, postUpdate } = JSON.parse(ele.getAttribute('data'))
    const diffDay = btf.diffDate(postUpdate)
    if (diffDay >= limitDay) {
      ele.textContent = `${messagePrev} ${diffDay} ${messageNext}`
      ele.hidden = false
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src'
    })

    btf.addGlobalFn('pjaxComplete', () => {
      window.lazyLoadInstance.update()
    }, 'lazyload')
  }

  const relativeDate = selector => {
    selector.forEach(item => {
      item.textContent = btf.diffDate(item.getAttribute('datetime'), true)
      item.style.display = 'inline'
    })
  }

  const justifiedIndexPostUI = () => {
    const recentPostsElement = document.getElementById('recent-posts')
    if (!(recentPostsElement && recentPostsElement.classList.contains('masonry'))) return

    const init = () => {
      const masonryItem = new InfiniteGrid.MasonryInfiniteGrid('.recent-post-items', {
        gap: { horizontal: 10, vertical: 20 },
        useTransform: true,
        useResizeObserver: true
      })
      masonryItem.renderItems()
      btf.addGlobalFn('pjaxCompleteOnce', () => { masonryItem.destroy() }, 'removeJustifiedIndexPostUI')
    }

    typeof InfiniteGrid === 'function' ? init() : btf.getScript(`${GLOBAL_CONFIG.infinitegrid.js}`).then(init)
  }

  const unRefreshFn = () => {
    const resizeHandler = btf.rafThrottle(() => {
      adjustMenu(false)
      if (mobileSidebarOpen && btf.isHidden(document.getElementById('toggle-menu'))) {
        sidebarFn.close()
      }
    })
    window.addEventListener('resize', resizeHandler, { passive: true })

    const menuMask = document.getElementById('menu-mask')
    menuMask && menuMask.addEventListener('click', () => { sidebarFn.close() })

    clickFnOfSubMenu()
    GLOBAL_CONFIG.islazyloadPlugin && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright()

    if (GLOBAL_CONFIG.autoDarkmode) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (btf.saveToLocal.get('theme') !== undefined) return
        e.matches ? handleThemeChange('dark') : handleThemeChange('light')
      })
    }
  }

  const forPostFn = () => {
    const $article = document.getElementById('article-container')
    if (!$article || $article.querySelector('.hbe-container')) return

    addHighlightTool($article)
    addPhotoFigcaption($article)
    addJustifiedGallery($article.querySelectorAll('.gallery-container'))
    runLightbox($article)
    scrollFnToDo($article)
    addTableWrap($article)
    clickFnOfTagHide($article)
    tabsFn($article)
  }

  const refreshFn = () => {
    initAdjust()
    goUpElement = document.getElementById('go-up')
    scrollPercentElement = goUpElement?.querySelector('.scroll-percent')

    justifiedIndexPostUI()

    if (GLOBAL_CONFIG_SITE.pageType === 'post') {
      addPostOutdateNotice()
      GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll('#post-meta time'))
    } else {
      GLOBAL_CONFIG.relativeDate.homepage && relativeDate(document.querySelectorAll('#recent-posts time'))
      GLOBAL_CONFIG.runtime && addRuntime()
      addLastPushDate()
      toggleCardCategory()
    }

    GLOBAL_CONFIG_SITE.pageType === 'home' && scrollDownInIndex()
    scrollFn()

    if (GLOBAL_CONFIG_SITE.pageType !== 'shuoshuo') {
      forPostFn()
      btf.switchComments(document)
    }

    openMobileMenu()
  }

  btf.addGlobalFn('pjaxComplete', refreshFn, 'refreshFn')
  refreshFn()
  unRefreshFn()

  // 處理 hexo-blog-encrypt 事件
  window.addEventListener('hexo-blog-decrypt', e => {
    forPostFn()
    window.translateFn.translateInitialization()
    Object.values(window.globalFn.encrypt).forEach(fn => {
      fn()
    })
  })

  document.addEventListener('shuoshuo:rendered', forPostFn)
})
;
/**
 * Refer to hexo-generator-searchdb
 * https://github.com/next-theme/hexo-generator-searchdb/blob/main/dist/search.js
 * Modified by hexo-theme-butterfly
 */

class LocalSearch {
  constructor ({
    path = '',
    unescape = false,
    top_n_per_article = 1
  }) {
    this.path = path
    this.unescape = unescape
    this.top_n_per_article = top_n_per_article
    this.isfetched = false
    this.datas = null
    this._unescapeDiv = unescape ? document.createElement('div') : null
    this._processedKeywords = null
  }

  _processKeywords (keywords) {
    if (this._processedKeywords) return this._processedKeywords
    this._processedKeywords = keywords.map(word => {
      if (this.unescape) {
        this._unescapeDiv.innerText = word
        return this._unescapeDiv.innerHTML
      }
      return word
    })
    return this._processedKeywords
  }

  getIndexByWord (words, text, caseSensitive = false) {
    const index = []
    const included = new Set()
    const processedWords = this._processKeywords(words)

    if (!caseSensitive) {
      text = text.toLowerCase()
    }
    processedWords.forEach((word, i) => {
      const wordLen = word.length
      if (wordLen === 0) return
      let startPosition = 0
      let position = -1
      const searchWord = caseSensitive ? word : word.toLowerCase()
      while ((position = text.indexOf(searchWord, startPosition)) > -1) {
        index.push({ position, word })
        included.add(words[i])
        startPosition = position + wordLen
      }
    })
    // Sort index by position of keyword
    index.sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position
      }
      return right.word.length - left.word.length
    })
    return [index, included]
  }

  // Merge hits into slices
  mergeIntoSlice (start, end, index) {
    let item = index[0]
    let { position, word } = item
    const hits = []
    const count = new Set()
    while (position + word.length <= end && index.length !== 0) {
      count.add(word)
      hits.push({
        position,
        length: word.length
      })
      const wordEnd = position + word.length

      // Move to next position of hit
      index.shift()
      while (index.length !== 0) {
        item = index[0]
        position = item.position
        word = item.word
        if (wordEnd > position) {
          index.shift()
        } else {
          break
        }
      }
    }
    return {
      hits,
      start,
      end,
      count: count.size
    }
  }

  // Highlight title and content
  highlightKeyword (val, slice) {
    const parts = []
    let index = slice.start
    for (const { position, length } of slice.hits) {
      parts.push(val.substring(index, position))
      index = position + length
      parts.push(`<mark class="search-keyword">${val.substring(position, position + length)}</mark>`)
    }
    parts.push(val.substring(index, slice.end))
    return parts.join('')
  }

  getResultItems (keywords) {
    const resultItems = []
    this._processedKeywords = null
    // Compute highlight param once instead of per-article
    const highlightParam = keywords.join(' ')
    this.datas.forEach(({ title, content, url }) => {
      // The number of different keywords included in the article.
      const [indexOfTitle, keysOfTitle] = this.getIndexByWord(keywords, title)
      const [indexOfContent, keysOfContent] = this.getIndexByWord(keywords, content)
      const includedCount = new Set([...keysOfTitle, ...keysOfContent]).size

      // Show search results
      const hitCount = indexOfTitle.length + indexOfContent.length
      if (hitCount === 0) return

      const slicesOfTitle = []
      if (indexOfTitle.length !== 0) {
        slicesOfTitle.push(this.mergeIntoSlice(0, title.length, indexOfTitle))
      }

      let slicesOfContent = []
      while (indexOfContent.length !== 0) {
        const item = indexOfContent[0]
        const { position } = item
        // Cut out 120 characters. The maxlength of .search-input is 80.
        const start = Math.max(0, position - 20)
        const end = Math.min(content.length, position + 100)
        slicesOfContent.push(this.mergeIntoSlice(start, end, indexOfContent))
      }

      // Sort slices in content by included keywords' count and hits' count
      slicesOfContent.sort((left, right) => {
        if (left.count !== right.count) {
          return right.count - left.count
        } else if (left.hits.length !== right.hits.length) {
          return right.hits.length - left.hits.length
        }
        return left.start - right.start
      })

      // Select top N slices in content
      const upperBound = parseInt(this.top_n_per_article, 10)
      if (upperBound >= 0) {
        slicesOfContent = slicesOfContent.slice(0, upperBound)
      }

      let resultItem = ''

      url = new URL(url, location.origin)
      url.searchParams.append('highlight', highlightParam)

      if (slicesOfTitle.length !== 0) {
        resultItem += `<li class="local-search-hit-item"><a href="${url.href}"><span class="search-result-title">${this.highlightKeyword(title, slicesOfTitle[0])}</span>`
      } else {
        resultItem += `<li class="local-search-hit-item"><a href="${url.href}"><span class="search-result-title">${title}</span>`
      }

      slicesOfContent.forEach(slice => {
        resultItem += `<p class="search-result">${this.highlightKeyword(content, slice)}...</p>`
      })

      resultItem += '</a></li>'
      resultItems.push({
        item: resultItem,
        id: resultItems.length,
        hitCount,
        includedCount
      })
    })
    return resultItems
  }

  fetchData () {
    const isXml = !this.path.endsWith('json')
    fetch(this.path)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        return response.text()
      })
      .then(res => {
        // Get the contents from search data
        this.isfetched = true
        this.datas = isXml
          ? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element => ({
              title: element.querySelector('title').textContent,
              content: element.querySelector('content').textContent,
              url: element.querySelector('url').textContent
            }))
          : JSON.parse(res)
        // Only match articles with non-empty titles
        this.datas = this.datas.filter(data => data.title).map(data => {
          data.title = data.title.trim()
          data.content = data.content ? data.content.trim().replace(/<[^>]+>/g, '') : ''
          data.url = decodeURIComponent(data.url).replace(/\/{2,}/g, '/')
          return data
        })
        // Remove loading animation
        window.dispatchEvent(new Event('search:loaded'))
      })
      .catch(error => {
        console.error('Local search data fetch failed:', error)
        this.isfetched = true
        this.datas = []
        window.dispatchEvent(new Event('search:loaded'))
      })
  }

  // Highlight by wrapping node in mark elements with the given class name
  highlightText (node, slice, className) {
    const val = node.nodeValue
    let index = slice.start
    const children = []
    for (const { position, length } of slice.hits) {
      const text = document.createTextNode(val.substring(index, position))
      index = position + length
      const mark = document.createElement('mark')
      mark.className = className
      mark.appendChild(document.createTextNode(val.substring(position, position + length)))
      children.push(text, mark)
    }
    node.nodeValue = val.substring(index, slice.end)
    children.forEach(element => {
      node.parentNode.insertBefore(element, node)
    })
  }

  // Highlight the search words provided in the url in the text
  highlightSearchWords (body) {
    const params = new URL(location.href).searchParams.get('highlight')
    const keywords = params ? params.split(' ') : []
    if (!keywords.length || !body) return
    const walk = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null)
    const allNodes = []
    while (walk.nextNode()) {
      if (!walk.currentNode.parentNode.matches('button, select, textarea, .mermaid')) allNodes.push(walk.currentNode)
    }
    allNodes.forEach(node => {
      const [indexOfNode] = this.getIndexByWord(keywords, node.nodeValue)
      if (!indexOfNode.length) return
      const slice = this.mergeIntoSlice(0, node.nodeValue.length, indexOfNode)
      this.highlightText(node, slice, 'search-keyword')
    })
  }
}

window.addEventListener('load', () => {
  // Search
  const { path, top_n_per_article, unescape, languages, pagination } = GLOBAL_CONFIG.localSearch
  const enablePagination = pagination && pagination.enable
  const localSearch = new LocalSearch({
    path,
    top_n_per_article,
    unescape
  })

  const $input = document.querySelector('.local-search-input input')
  const $statsItem = document.getElementById('local-search-stats')
  const $loadingStatus = document.getElementById('loading-status')
  const $searchMask = document.getElementById('search-mask')
  const $searchDialog = document.querySelector('#local-search .search-dialog')
  const $results = document.getElementById('local-search-results')
  const $pagination = document.getElementById('local-search-pagination')
  const $paginationList = document.querySelector('#local-search-pagination .ais-Pagination-list')
  const isXml = !path.endsWith('json')

  // Pagination variables (only initialize if pagination is enabled)
  let currentPage = 0
  const hitsPerPage = pagination.hitsPerPage || 10

  let currentResultItems = []

  if (!enablePagination) {
    currentPage = undefined
    currentResultItems = undefined
  }

  // Show/hide search results area
  const toggleResultsVisibility = hasResults => {
    $pagination.style.display = (hasResults && enablePagination) ? '' : 'none'
  }

  // Render search results for current page
  const renderResults = (searchText, resultItems) => {
    // Determine items to display based on pagination mode
    const itemsToDisplay = enablePagination
      ? currentResultItems.slice(currentPage * hitsPerPage, (currentPage + 1) * hitsPerPage)
      : resultItems

    // Handle empty page in pagination mode
    if (enablePagination && itemsToDisplay.length === 0 && currentResultItems.length > 0) {
      currentPage = 0
      renderResults(searchText, resultItems)
      return
    }

    // Add numbering to items
    const numberedItems = itemsToDisplay.map((result, index) => {
      const itemNumber = enablePagination
        ? currentPage * hitsPerPage + index + 1
        : index + 1
      return result.item.replace(
        '<li class="local-search-hit-item">',
        `<li class="local-search-hit-item" value="${itemNumber}">`
      )
    })

    $results.innerHTML = `<ol class="search-result-list">${numberedItems.join('')}</ol>`

    // Update stats
    const displayCount = enablePagination ? currentResultItems.length : resultItems.length
    const stats = languages.hits_stats.replace(/\$\{hits}/, displayCount)
    $statsItem.innerHTML = `<hr><div class="search-result-stats">${stats}</div>`

    // Handle pagination
    if (enablePagination) {
      const nbPages = Math.ceil(currentResultItems.length / hitsPerPage)
      renderPagination(currentPage, nbPages, searchText)
    }

    const hasResults = resultItems.length > 0
    toggleResultsVisibility(hasResults)

    window.pjax && window.pjax.refresh($results)
  }

  // Render pagination
  const renderPagination = (page, nbPages) => {
    if (nbPages <= 1) {
      $pagination.style.display = 'none'
      $paginationList.innerHTML = ''
      return
    }

    const isFirstPage = page === 0
    const isLastPage = page === nbPages - 1

    // Responsive page display
    const isMobile = window.innerWidth < 768
    const maxVisiblePages = isMobile ? 3 : 5
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(nbPages - 1, startPage + maxVisiblePages - 1)

    // Adjust starting page to maintain max visible pages
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    const parts = []

    // Only add ellipsis and first page when there are many pages
    if (nbPages > maxVisiblePages && startPage > 0) {
      parts.push('<li class="ais-Pagination-item ais-Pagination-item--page"><a class="ais-Pagination-link" aria-label="Page 1" href="#" data-page="0">1</a></li>')
      if (startPage > 1) {
        parts.push('<li class="ais-Pagination-item ais-Pagination-item--ellipsis"><span class="ais-Pagination-link">...</span></li>')
      }
    }

    // Add middle page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i === page) {
        parts.push(`<li class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"><span class="ais-Pagination-link" aria-label="Page ${i + 1}">${i + 1}</span></li>`)
      } else {
        parts.push(`<li class="ais-Pagination-item ais-Pagination-item--page"><a class="ais-Pagination-link" aria-label="Page ${i + 1}" href="#" data-page="${i}">${i + 1}</a></li>`)
      }
    }

    // Only add ellipsis and last page when there are many pages
    if (nbPages > maxVisiblePages && endPage < nbPages - 1) {
      if (endPage < nbPages - 2) {
        parts.push('<li class="ais-Pagination-item ais-Pagination-item--ellipsis"><span class="ais-Pagination-link">...</span></li>')
      }
      parts.push(`<li class="ais-Pagination-item ais-Pagination-item--page"><a class="ais-Pagination-link" aria-label="Page ${nbPages}" href="#" data-page="${nbPages - 1}">${nbPages}</a></li>`)
    }

    // Build prev/next links
    const prevLink = isFirstPage
      ? '<span class="ais-Pagination-link ais-Pagination-link--disabled" aria-label="Previous Page"><i class="fas fa-angle-left"></i></span>'
      : `<a class="ais-Pagination-link" aria-label="Previous Page" href="#" data-page="${page - 1}"><i class="fas fa-angle-left"></i></a>`
    const nextLink = isLastPage
      ? '<span class="ais-Pagination-link ais-Pagination-link--disabled" aria-label="Next Page"><i class="fas fa-angle-right"></i></span>'
      : `<a class="ais-Pagination-link" aria-label="Next Page" href="#" data-page="${page + 1}"><i class="fas fa-angle-right"></i></a>`

    $paginationList.innerHTML = `<li class="ais-Pagination-item ais-Pagination-item--previousPage ${isFirstPage ? 'ais-Pagination-item--disabled' : ''}">${prevLink}</li>${parts.join('')}<li class="ais-Pagination-item ais-Pagination-item--nextPage ${isLastPage ? 'ais-Pagination-item--disabled' : ''}">${nextLink}</li>`
    $pagination.style.display = ''
  }

  // Clear search results and stats
  const clearSearchResults = () => {
    $results.textContent = ''
    $statsItem.textContent = ''
    toggleResultsVisibility(false)
    if (enablePagination) {
      currentResultItems = []
      currentPage = 0
    }
  }

  // Show no results message
  const showNoResults = searchText => {
    $results.textContent = ''
    const statsDiv = document.createElement('div')
    statsDiv.className = 'search-result-stats'
    statsDiv.textContent = languages.hits_empty.replace(/\$\{query}/, searchText)
    $statsItem.innerHTML = statsDiv.outerHTML
    toggleResultsVisibility(false)
    if (enablePagination) {
      currentResultItems = []
      currentPage = 0
    }
  }

  const inputEventFunction = () => {
    if (!localSearch.isfetched) return
    let searchText = $input.value.trim().toLowerCase()
    isXml && (searchText = searchText.replace(/</g, '&lt;').replace(/>/g, '&gt;'))

    if (searchText !== '') $loadingStatus.hidden = false

    const keywords = searchText.split(/[-\s]+/)
    let resultItems = []

    if (searchText.length > 0) {
      resultItems = localSearch.getResultItems(keywords)
    }

    if (keywords.length === 1 && keywords[0] === '') {
      clearSearchResults()
    } else if (resultItems.length === 0) {
      showNoResults(searchText)
    } else {
      // Sort results by relevance
      resultItems.sort((left, right) => {
        if (left.includedCount !== right.includedCount) {
          return right.includedCount - left.includedCount
        } else if (left.hitCount !== right.hitCount) {
          return right.hitCount - left.hitCount
        }
        return right.id - left.id
      })

      if (enablePagination) {
        currentResultItems = resultItems
        currentPage = 0
      }
      renderResults(searchText, resultItems)
    }

    $loadingStatus.hidden = true
  }

  // Debounced input handler
  let searchTimeout
  const debouncedInputEvent = () => {
    clearTimeout(searchTimeout)
    // Empty input: clear results immediately without debounce delay
    if (!$input.value.trim()) {
      inputEventFunction()
      return
    }
    searchTimeout = setTimeout(inputEventFunction, 200)
  }

  let loadFlag = false

  const fixSafariHeight = () => {
    if (window.innerWidth < 768) {
      $searchDialog.style.setProperty('--search-height', window.innerHeight + 'px')
    }
  }

  // Debounced resize to avoid layout thrashing
  let resizeTimer
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(fixSafariHeight, 150)
  }

  const handleEscape = event => {
    if (event.code === 'Escape') {
      closeSearch()
      document.removeEventListener('keydown', handleEscape)
    }
  }

  const openSearch = () => {
    btf.overflowPaddingR.add()
    btf.animateIn($searchMask, 'to_show 0.5s')
    btf.animateIn($searchDialog, 'titleScale 0.5s')
    setTimeout(() => { $input.focus() }, 300)
    if (!loadFlag) {
      !localSearch.isfetched && localSearch.fetchData()
      $input.addEventListener('input', debouncedInputEvent)
      loadFlag = true
    }
    // shortcut: ESC
    document.addEventListener('keydown', handleEscape)

    fixSafariHeight()
    window.addEventListener('resize', onResize)
  }

  const closeSearch = () => {
    btf.overflowPaddingR.remove()
    btf.animateOut($searchDialog, 'search_close .5s')
    btf.animateOut($searchMask, 'to_hide 0.5s')
    document.removeEventListener('keydown', handleEscape)
    window.removeEventListener('resize', onResize)
  }

  const searchClickFn = () => {
    btf.addEventListenerPjax(document.querySelector('#search-button > .search'), 'click', openSearch)
  }

  const searchFnOnce = () => {
    document.querySelector('#local-search .search-close-button').addEventListener('click', closeSearch)
    $searchMask.addEventListener('click', closeSearch)
    if (GLOBAL_CONFIG.localSearch.preload) {
      localSearch.fetchData()
    }
    localSearch.highlightSearchWords(document.getElementById('article-container'))

    // Pagination event delegation - only add if pagination is enabled
    if (enablePagination) {
      $pagination.addEventListener('click', e => {
        e.preventDefault()
        const link = e.target.closest('a[data-page]')
        if (link) {
          const page = parseInt(link.dataset.page, 10)
          if (!isNaN(page) && currentResultItems.length > 0) {
            currentPage = page
            renderResults($input.value.trim().toLowerCase(), currentResultItems)
          }
        }
      })
    }

    // Initial state
    toggleResultsVisibility(false)
  }

  window.addEventListener('search:loaded', () => {
    const $loadDataItem = document.getElementById('loading-database')
    $loadDataItem.nextElementSibling.style.visibility = 'visible'
    $loadDataItem.remove()
  })

  searchClickFn()
  searchFnOnce()

  // pjax
  window.addEventListener('pjax:complete', () => {
    !btf.isHidden($searchMask) && closeSearch()
    localSearch.highlightSearchWords(document.getElementById('article-container'))
    searchClickFn()
  })
})
