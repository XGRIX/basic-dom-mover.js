/**
 * ResponsiveDOMMover - Advanced responsive DOM manipulation library
 * @version 2.0.0
 * @author GRIX
 * @license MIT
 */

class ResponsiveDOMMover {
    static version = '2.0.0'

    static init(rules, options = {}) {
        return new ResponsiveDOMMover(rules, options)
    }

    static fromDOM(options = {}) {
        const elements = document.querySelectorAll('[data-move-to]')
        const rulesMap = {}

        elements.forEach(el => {
            const media = el.dataset.moveMedia || '(min-width: 768px)'
            const key = `${media}-${el.dataset.moveTo}`

            if (!rulesMap[key]) {
                rulesMap[key] = {
                    media,
                    to: el.dataset.moveTo,
                    items: []
                }
            }

            rulesMap[key].items.push({
                selector: `[data-move-id="${ResponsiveDOMMover.uid(el)}"]`,
                position: el.dataset.movePosition || 'last',
                priority: Number(el.dataset.movePriority || 0),
                once: el.dataset.moveOnce === 'true'
            })
        })

        return new ResponsiveDOMMover(Object.values(rulesMap), options)
    }

    static uid(el) {
        if (!el.dataset.moveId) {
            el.dataset.moveId = `rdm-${Math.random().toString(36).slice(2, 11)}`
        }
        return el.dataset.moveId
    }

    static get isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }

    static get viewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    constructor(rules, options = {}) {
        if (!Array.isArray(rules)) {
            throw new TypeError('Rules must be an array')
        }

        this.rules = rules.map(r => ({
            priority: 0,
            once: false,
            ...r
        }))

        this.options = {
            debug: false,
            throttle: 100,
            observeDOM: true,
            animations: true,
            animationDuration: 300,
            animationEasing: 'ease-in-out',
            errorHandler: null,
            beforeMove: null,
            afterMove: null,
            beforeRestore: null,
            afterRestore: null,
            ...options
        }

        this.items = new Map()
        this.activeRules = new Set()
        this.mqls = []
        this.observer = null
        this.initialized = false
        this.destroyed = false

        this._evaluateThrottled = this._throttle(
            this._evaluateAll.bind(this),
            this.options.throttle
        )

        this._init()
    }

    _init() {
        if (this.initialized) return

        try {
            this.rules.forEach(rule => {
                this._validateRule(rule)
                const mql = matchMedia(rule.media)
                const handler = e => this._handleMediaChange(rule, e.matches)

                mql.addEventListener('change', handler)
                this.mqls.push({ mql, handler, rule })

                handler({ matches: mql.matches })
            })

            if (this.options.observeDOM) {
                this._observe()
            }

            this.initialized = true
            this._log('Initialized with', this.rules.length, 'rules')
            this._dispatch('init', { rules: this.rules })
        } catch (error) {
            this._handleError('Initialization failed', error)
        }
    }

    _validateRule(rule) {
        if (!rule.media) {
            throw new Error('Rule must have a media query')
        }
        if (!rule.to) {
            throw new Error('Rule must have a target selector')
        }
        if (!Array.isArray(rule.items)) {
            throw new Error('Rule must have items array')
        }
    }

    _handleMediaChange(rule, matches) {
        if (matches) {
            this._activateRule(rule)
        } else {
            this._deactivateRule(rule)
        }
    }

    _activateRule(rule) {
        if (this.activeRules.has(rule)) return

        this._log('Activating rule:', rule.media)

        rule.items.forEach(item => {
            const el = document.querySelector(item.selector)
            if (!el) {
                this._log('Element not found:', item.selector)
                return
            }

            const current = this.items.get(el)
            const itemPriority = item.priority ?? rule.priority

            if (current && current.priority > itemPriority) {
                this._log('Skipping move due to priority:', el)
                return
            }

            if (current && current.once) {
                this._log('Skipping move due to once flag:', el)
                return
            }

            this._moveElement(el, rule, item)
        })

        this.activeRules.add(rule)
        rule.onEnter?.({ rule, mover: this })
        this._dispatch('enter', { rule })
    }

    _deactivateRule(rule) {
        if (!this.activeRules.has(rule)) return

        this._log('Deactivating rule:', rule.media)

        rule.items.forEach(item => {
            const el = document.querySelector(item.selector)
            if (!el) return

            const data = this.items.get(el)
            if (data && data.rule === rule) {
                this._restoreElement(el)
            }
        })

        this.activeRules.delete(rule)
        rule.onLeave?.({ rule, mover: this })
        this._dispatch('leave', { rule })
    }

    async _moveElement(el, rule, item) {
        try {
            // Call global beforeMove hook
            if (this.options.beforeMove) {
                const shouldContinue = await this.options.beforeMove({ element: el, rule, item })
                if (shouldContinue === false) return
            }

            if (this.items.has(el)) {
                const current = this.items.get(el)
                if (current.rule === rule) return
                this._restoreElement(el, true)
            }

            const placeholder = document.createComment(`rdm:${ResponsiveDOMMover.uid(el)}`)
            const parent = el.parentNode
            const nextSibling = el.nextSibling

            parent.insertBefore(placeholder, el)

            const target = document.querySelector(rule.to)
            if (!target) {
                throw new Error(`Target not found: ${rule.to}`)
            }

            if (this.options.animations) {
                await this._animateMove(el, target, item.position)
            } else {
                this._insertElement(el, target, item.position)
            }

            this.items.set(el, {
                parent,
                nextSibling,
                placeholder,
                priority: item.priority ?? rule.priority,
                once: item.once || false,
                rule,
                item,
                movedAt: Date.now()
            })

            item.onMove?.({ element: el, rule, item })
            rule.onMove?.({ element: el, rule, item })

            if (this.options.afterMove) {
                await this.options.afterMove({ element: el, rule, item })
            }

            this._dispatch('move', { element: el, rule, item })
            this._log('Moved element:', el)
        } catch (error) {
            this._handleError('Failed to move element', error, { el, rule, item })
        }
    }

    async _restoreElement(el, skipAnimation = false) {
        const data = this.items.get(el)
        if (!data) return

        try {
            if (this.options.beforeRestore) {
                const shouldContinue = await this.options.beforeRestore({ element: el, data })
                if (shouldContinue === false) return
            }

            if (this.options.animations && !skipAnimation) {
                await this._animateRestore(el, data.parent)
            } else {
                if (data.nextSibling && data.nextSibling.parentNode) {
                    data.parent.insertBefore(el, data.nextSibling)
                } else {
                    data.parent.appendChild(el)
                }
            }

            data.placeholder.remove()
            this.items.delete(el)

            if (this.options.afterRestore) {
                await this.options.afterRestore({ element: el, data })
            }

            this._dispatch('restore', { element: el, data })
            this._log('Restored element:', el)
        } catch (error) {
            this._handleError('Failed to restore element', error, { el, data })
        }
    }

    _insertElement(el, target, position) {
        if (position === 'first') {
            target.insertBefore(el, target.firstChild)
        } else if (position === 'last') {
            target.appendChild(el)
        } else if (typeof position === 'number') {
            const children = Array.from(target.children)
            const referenceNode = children[position]
            if (referenceNode) {
                target.insertBefore(el, referenceNode)
            } else {
                target.appendChild(el)
            }
        } else if (typeof position === 'string') {
            // Selector-based positioning
            const referenceNode = target.querySelector(position)
            if (referenceNode) {
                target.insertBefore(el, referenceNode)
            } else {
                target.appendChild(el)
            }
        } else {
            target.appendChild(el)
        }
    }

    _animateMove(el, target, position) {
        return new Promise(resolve => {
            const startRect = el.getBoundingClientRect()

            // Insert element
            this._insertElement(el, target, position)

            const endRect = el.getBoundingClientRect()
            const deltaX = startRect.left - endRect.left
            const deltaY = startRect.top - endRect.top

            // Apply animation
            el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
            el.style.transition = 'none'

            requestAnimationFrame(() => {
                el.style.transition = `transform ${this.options.animationDuration}ms ${this.options.animationEasing}`
                el.style.transform = 'translate(0, 0)'

                const onTransitionEnd = () => {
                    el.style.transition = ''
                    el.style.transform = ''
                    el.removeEventListener('transitionend', onTransitionEnd)
                    resolve()
                }

                el.addEventListener('transitionend', onTransitionEnd)
            })
        })
    }

    _animateRestore(el, parent) {
        return new Promise(resolve => {
            const startRect = el.getBoundingClientRect()

            parent.appendChild(el)

            const endRect = el.getBoundingClientRect()
            const deltaX = startRect.left - endRect.left
            const deltaY = startRect.top - endRect.top

            el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
            el.style.transition = 'none'

            requestAnimationFrame(() => {
                el.style.transition = `transform ${this.options.animationDuration}ms ${this.options.animationEasing}`
                el.style.transform = 'translate(0, 0)'

                const onTransitionEnd = () => {
                    el.style.transition = ''
                    el.style.transform = ''
                    el.removeEventListener('transitionend', onTransitionEnd)
                    resolve()
                }

                el.addEventListener('transitionend', onTransitionEnd)
            })
        })
    }

    _observe() {
        if (this.observer) return

        this.observer = new MutationObserver(() => {
            this._evaluateThrottled()
        })

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        })

        this._log('DOM observer started')
    }

    _evaluateAll() {
        this.rules.forEach(rule => {
            const mql = this.mqls.find(m => m.rule === rule)
            if (mql && mql.mql.matches) {
                this._activateRule(rule)
            }
        })
    }

    _throttle(func, delay) {
        let timeoutId = null
        let lastRan = 0

        return function (...args) {
            const now = Date.now()

            if (now - lastRan < delay) {
                clearTimeout(timeoutId)
                timeoutId = setTimeout(() => {
                    lastRan = Date.now()
                    func.apply(this, args)
                }, delay - (now - lastRan))
            } else {
                lastRan = now
                func.apply(this, args)
            }
        }
    }

    _dispatch(type, detail = {}) {
        try {
            const event = new CustomEvent(`rdm:${type}`, {
                detail: { ...detail, mover: this },
                bubbles: true,
                cancelable: true
            })
            document.dispatchEvent(event)
        } catch (error) {
            this._log('Failed to dispatch event:', type, error)
        }
    }

    _log(...args) {
        if (this.options.debug) {
            console.log('[ResponsiveDOMMover]', ...args)
        }
    }

    _handleError(message, error, context = {}) {
        const errorObj = {
            message,
            error,
            context,
            timestamp: Date.now()
        }

        if (this.options.errorHandler) {
            this.options.errorHandler(errorObj)
        } else {
            console.error('[ResponsiveDOMMover]', message, error, context)
        }

        this._dispatch('error', errorObj)
    }

    addRule(rule) {
        this._validateRule(rule)

        const mql = matchMedia(rule.media)
        const handler = e => this._handleMediaChange(rule, e.matches)

        mql.addEventListener('change', handler)
        this.mqls.push({ mql, handler, rule })
        this.rules.push(rule)

        if (mql.matches) {
            this._activateRule(rule)
        }

        this._dispatch('ruleAdded', { rule })
        return this
    }

    removeRule(rule) {
        const index = this.rules.indexOf(rule)
        if (index === -1) return this

        this._deactivateRule(rule)

        const mqlIndex = this.mqls.findIndex(m => m.rule === rule)
        if (mqlIndex !== -1) {
            const { mql, handler } = this.mqls[mqlIndex]
            mql.removeEventListener('change', handler)
            this.mqls.splice(mqlIndex, 1)
        }

        this.rules.splice(index, 1)
        this._dispatch('ruleRemoved', { rule })
        return this
    }

    pause() {
        if (this.observer) {
            this.observer.disconnect()
        }
        this._dispatch('paused')
        return this
    }

    resume() {
        if (this.options.observeDOM && !this.observer) {
            this._observe()
        }
        this._evaluateAll()
        this._dispatch('resumed')
        return this
    }

    refresh() {
        this._evaluateAll()
        this._dispatch('refreshed')
        return this
    }

    snapshot() {
        return new Map(this.items)
    }

    getStats() {
        return {
            rulesCount: this.rules.length,
            activeRulesCount: this.activeRules.size,
            movedElementsCount: this.items.size,
            initialized: this.initialized,
            destroyed: this.destroyed,
            viewport: ResponsiveDOMMover.viewport
        }
    }

    isMoved(element) {
        const el = typeof element === 'string'
            ? document.querySelector(element)
            : element
        return this.items.has(el)
    }

    getElementData(element) {
        const el = typeof element === 'string'
            ? document.querySelector(element)
            : element
        return this.items.get(el) || null
    }

    async restore(element) {
        const el = typeof element === 'string'
            ? document.querySelector(element)
            : element

        if (el && this.items.has(el)) {
            await this._restoreElement(el)
        }
        return this
    }

    async restoreAll() {
        const elements = Array.from(this.items.keys())
        for (const el of elements) {
            await this._restoreElement(el)
        }
        return this
    }

    destroy() {
        if (this.destroyed) return

        this._log('Destroying instance')

        this.mqls.forEach(({ mql, handler }) => {
            mql.removeEventListener('change', handler)
        })

        this.items.forEach((_, el) => {
            this._restoreElement(el, true)
        })

        if (this.observer) {
            this.observer.disconnect()
        }

        this.mqls = []
        this.items.clear()
        this.activeRules.clear()
        this.destroyed = true
        this.initialized = false

        this._dispatch('destroyed')
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveDOMMover
}

if (typeof define === 'function' && define.amd) {
    define([], () => ResponsiveDOMMover)
}

if (typeof window !== 'undefined') {
    window.ResponsiveDOMMover = ResponsiveDOMMover
}
