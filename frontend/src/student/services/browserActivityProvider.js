/**
 * BrowserActivityProvider Abstraction
 *
 * Interface for tracking study tab visibility, focus, blur and fullscreen state.
 * Default implementation: WebBrowserActivityProvider (Web Standards API)
 * Can be extended in the future by a Chrome Extension provider.
 */

export class BrowserActivityProvider {
  start() {}
  stop() {}
  getActiveContext() { return { isFocused: true, isVisible: true, isFullscreen: false } }
  onContextChange(callback) {}
}

export class WebBrowserActivityProvider extends BrowserActivityProvider {
  constructor() {
    super()
    this.listeners = new Set()
    this.isActive = false
    this.isSuspended = false
    this.tabLeaveTime = null
    this.blurTime = null
    this.pendingCorrelationTimer = null

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this)
  }

  start() {
    if (this.isActive) return
    this.isActive = true
    this.isSuspended = false

    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    window.addEventListener('blur', this.handleBlur)
    window.addEventListener('focus', this.handleFocus)
    document.addEventListener('fullscreenchange', this.handleFullscreenChange)
  }

  stop() {
    if (!this.isActive) return
    this.isActive = false
    if (this.pendingCorrelationTimer) clearTimeout(this.pendingCorrelationTimer)

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('blur', this.handleBlur)
    window.removeEventListener('focus', this.handleFocus)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
    this.listeners.clear()
  }

  suspend() {
    this.isSuspended = true
  }

  resume() {
    this.isSuspended = false
  }

  onContextChange(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notify(eventData) {
    if (this.isSuspended) return
    this.listeners.forEach(cb => cb(eventData))
  }

  getActiveContext() {
    return {
      isFocused: document.hasFocus(),
      isVisible: !document.hidden,
      isFullscreen: !!document.fullscreenElement,
      protectedTab: 'Uyarvu Payanam Focus Page'
    }
  }

  handleVisibilityChange() {
    if (this.isSuspended || !this.isActive) return

    if (document.hidden) {
      this.tabLeaveTime = Date.now()
      this.notify({
        type: 'TAB_HIDDEN',
        signal: 'TAB_SWITCH',
        timestamp: this.tabLeaveTime,
        message: 'Switched away from protected focus tab'
      })
    } else {
      const now = Date.now()
      const duration = this.tabLeaveTime ? Math.round((now - this.tabLeaveTime) / 1000) : 0
      this.tabLeaveTime = null

      this.notify({
        type: 'TAB_VISIBLE',
        signal: 'FOCUS_RETURN',
        duration,
        timestamp: now,
        message: `Returned to protected focus tab after ${duration}s`
      })
    }
  }

  handleBlur() {
    if (this.isSuspended || !this.isActive || document.hidden) return

    this.blurTime = Date.now()
    // Event correlation delay (500ms) to check if blur is accompanied by tab hidden
    if (this.pendingCorrelationTimer) clearTimeout(this.pendingCorrelationTimer)

    this.pendingCorrelationTimer = setTimeout(() => {
      if (!document.hidden && this.blurTime) {
        this.notify({
          type: 'WINDOW_BLUR',
          signal: 'WINDOW_BLUR',
          timestamp: this.blurTime,
          message: 'Browser window lost focus'
        })
      }
    }, 500)
  }

  handleFocus() {
    if (this.isSuspended || !this.isActive) return
    if (this.pendingCorrelationTimer) clearTimeout(this.pendingCorrelationTimer)

    if (this.blurTime) {
      const duration = Math.round((Date.now() - this.blurTime) / 1000)
      this.blurTime = null
      this.notify({
        type: 'WINDOW_FOCUS',
        signal: 'FOCUS_RETURN',
        duration,
        timestamp: Date.now(),
        message: 'Browser window regained focus'
      })
    }
  }

  handleFullscreenChange() {
    if (this.isSuspended || !this.isActive) return
    const isFull = !!document.fullscreenElement
    if (!isFull) {
      this.notify({
        type: 'FULLSCREEN_EXIT',
        signal: 'FULLSCREEN_EXIT',
        timestamp: Date.now(),
        message: 'Exited focus mode fullscreen'
      })
    }
  }
}

export default new WebBrowserActivityProvider()
