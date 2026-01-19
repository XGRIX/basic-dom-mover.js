class ResponsiveDOMMover {
    static version = '3.1.0'

    static breakpoints = {
        mobile: '(max-width: 47.999rem)',                 // < md
        tablet: '(min-width: 48rem) and (max-width: 63.999rem)', // md only
        desktop: '(min-width: 64rem)',                    // lg+
        wide: '(min-width: 80rem)',                       // xl+

        sm: '(min-width: 40rem)',
        md: '(min-width: 48rem)',
        lg: '(min-width: 64rem)',
        xl: '(min-width: 80rem)',
        '2xl': '(min-width: 96rem)',

        'not-sm': '(max-width: 39.999rem)',
        'not-md': '(max-width: 47.999rem)',
        'not-lg': '(max-width: 63.999rem)',
        'not-xl': '(max-width: 79.999rem)',
        'not-2xl': '(max-width: 95.999rem)',

        portrait: '(orientation: portrait)',
        landscape: '(orientation: landscape)',
    }


    static init(rules, options = {}) {
        return new ResponsiveDOMMover(rules, options)
    }

    static fromDOM(options = {}) {
        const elements = document.querySelectorAll('[data-move-to], [data-move-init], [data-move-group], [data-move-breakpoint], [data-move-swap]')
        const rulesMap = {}
        const groupsMap = {}

        elements.forEach(el => {
            let config = {}

            if (el.dataset.moveInit) {
                config = ResponsiveDOMMover._evaluateInit(el.dataset.moveInit)
                if (!config) return
            } else if (el.dataset.moveBreakpoint) {
                const breakpoint = ResponsiveDOMMover.breakpoints[el.dataset.moveBreakpoint]
                if (!breakpoint) {
                    console.error('Unknown breakpoint:', el.dataset.moveBreakpoint)
                    return
                }
                config = {
                    to: el.dataset.moveTo,
                    media: breakpoint,
                    position: el.dataset.movePosition,
                    priority: el.dataset.movePriority,
                    once: el.dataset.moveOnce
                }
            } else {
                config = {
                    to: el.dataset.moveTo,
                    media: el.dataset.moveMedia || '(min-width: 768px)',
                    position: el.dataset.movePosition,
                    priority: el.dataset.movePriority,
                    once: el.dataset.moveOnce,
                    clone: el.dataset.moveClone,
                    swap: el.dataset.moveSwap,
                    condition: el.dataset.moveCondition,
                    intersect: el.dataset.moveIntersect,
                    classes: el.dataset.moveClasses,
                    delay: el.dataset.moveDelay,
                    fallback: el.dataset.moveFallback
                }
            }

            if (el.dataset.moveGroup) {
                const groupName = el.dataset.moveGroup
                if (!groupsMap[groupName]) {
                    groupsMap[groupName] = {
                        name: groupName,
                        elements: [],
                        media: el.dataset.moveMedia || '(max-width: 768px)',
                        to: el.dataset.moveTo
                    }
                }
                groupsMap[groupName].elements.push(el)
                ResponsiveDOMMover.uid(el)
                return
            }

            const media = config.media || el.dataset.moveMedia || '(min-width: 768px)'
            const to = config.to || el.dataset.moveTo

            if (!to && !config.swap) {
                console.error('Missing "to" target or swap for element:', el)
                return
            }

            if (config.swap || el.dataset.moveSwap) {
                const swapTarget = config.swap || el.dataset.moveSwap
                const key = `swap-${media}-${ResponsiveDOMMover.uid(el)}`

                rulesMap[key] = {
                    media,
                    to: swapTarget,
                    items: [{
                        selector: `[data-move-id="${el.dataset.moveId}"]`,
                        swap: swapTarget,
                        priority: Number(config.priority || el.dataset.movePriority || 0)
                    }]
                }
                return
            }

            const key = `${media}-${to}`

            if (!rulesMap[key]) {
                rulesMap[key] = {
                    media,
                    to,
                    items: []
                }
            }

            rulesMap[key].items.push({
                selector: `[data-move-id="${ResponsiveDOMMover.uid(el)}"]`,
                position: config.position || el.dataset.movePosition || 'last',
                priority: Number(config.priority || el.dataset.movePriority || 0),
                once: (config.once || el.dataset.moveOnce) === 'true' || config.once === true,
                clone: (config.clone || el.dataset.moveClone) === 'true' || config.clone === true,
                condition: config.condition || el.dataset.moveCondition,
                intersect: config.intersect || el.dataset.moveIntersect,
                classes: ResponsiveDOMMover._parseClasses(config.classes || el.dataset.moveClasses),
                delay: Number(config.delay || el.dataset.moveDelay || 0),
                fallback: (config.fallback || el.dataset.moveFallback || to).split(',').map(s => s.trim())
            })
        })

        const rules = Object.values(rulesMap)

        Object.values(groupsMap).forEach(group => {
            const media = group.media
            const to = group.to

            if (!to) {
                console.error('Group missing target:', group.name)
                return
            }

            const groupRule = {
                media,
                to,
                isGroup: true,
                groupName: group.name,
                keepOrder: true,
                items: group.elements.map(el => ({
                    selector: `[data-move-id="${el.dataset.moveId}"]`,
                    element: el,
                    position: 'last',
                    priority: 0,
                    groupOrder: Number(el.dataset.moveGroupOrder || 0)
                }))
            }

            rules.push(groupRule)
        })

        if (options.groups) {
            Object.entries(options.groups).forEach(([name, config]) => {
                const groupElements = Array.from(document.querySelectorAll(`[data-move-group="${name}"]`))

                if (groupElements.length === 0) return

                rules.push({
                    media: config.media,
                    to: config.to,
                    isGroup: true,
                    groupName: name,
                    keepOrder: config.keepOrder !== false,
                    wrapInContainer: config.wrapInContainer,
                    containerClass: config.containerClass,
                    animateAsOne: config.animateAsOne,
                    items: groupElements.map(el => ({
                        selector: `[data-move-id="${ResponsiveDOMMover.uid(el)}"]`,
                        element: el,
                        groupOrder: Number(el.dataset.moveGroupOrder || 0)
                    }))
                })
            })
        }

        return new ResponsiveDOMMover(rules, options)
    }

    static _evaluateInit(value) {
        const initValue = value.trim()

        if (initValue.includes('(') && initValue.includes(')')) {
            try {
                const func = new Function('return ' + initValue)()
                return typeof func === 'function' ? func() : func
            } catch (e) {
                console.error('Error evaluating data-move-init:', e)
                return null
            }
        } else {
            if (typeof window[initValue] === 'function') {
                return window[initValue]()
            } else if (typeof window[initValue] === 'object') {
                return window[initValue]
            } else {
                console.error('data-move-init value not found:', initValue)
                return null
            }
        }
    }

    static _parseClasses(value) {
        if (!value) return null
        try {
            return JSON.parse(value)
        } catch (e) {
            return { onMove: value.split(',').map(s => s.trim()) }
        }
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

    static preview(options = {}) {
        const {
            devices = ['mobile', 'tablet', 'desktop'],
            showInPanel = true,
            position = 'right'
        } = options

        const previewContainer = document.createElement('div')
        previewContainer.id = 'rdm-preview-panel'
        previewContainer.style.cssText = `
      position: fixed;
      ${position}: 0;
      top: 0;
      width: 400px;
      height: 100vh;
      background: #1e1e1e;
      z-index: 999999;
      overflow-y: auto;
      padding: 20px;
      box-shadow: -2px 0 10px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `

        const title = document.createElement('h2')
        title.textContent = 'ResponsiveDOMMover Preview'
        title.style.cssText = 'color: white; margin-bottom: 20px; font-size: 18px;'
        previewContainer.appendChild(title)

        const closeBtn = document.createElement('button')
        closeBtn.textContent = '✕'
        closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #f44336;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
    `
        closeBtn.onclick = () => previewContainer.remove()
        previewContainer.appendChild(closeBtn)

        devices.forEach(device => {
            const deviceSection = document.createElement('div')
            deviceSection.style.cssText = 'margin-bottom: 30px;'

            const deviceTitle = document.createElement('h3')
            deviceTitle.textContent = device.charAt(0).toUpperCase() + device.slice(1)
            deviceTitle.style.cssText = 'color: #4fc3f7; margin-bottom: 10px; font-size: 14px;'
            deviceSection.appendChild(deviceTitle)

            const iframe = document.createElement('iframe')
            iframe.style.cssText = `
        width: 100%;
        height: ${device === 'mobile' ? '667px' : device === 'tablet' ? '1024px' : '768px'};
        border: 2px solid #333;
        border-radius: 8px;
        transform: scale(0.3);
        transform-origin: top left;
        margin-bottom: 10px;
      `

            const breakpoint = ResponsiveDOMMover.breakpoints[device]
            if (breakpoint) {
                iframe.style.width = breakpoint.match(/\d+/)?.[0] + 'px' || '100%'
            }

            iframe.src = window.location.href
            deviceSection.appendChild(iframe)

            const info = document.createElement('div')
            info.style.cssText = 'color: #999; font-size: 12px;'
            info.textContent = `Breakpoint: ${ResponsiveDOMMover.breakpoints[device] || 'N/A'}`
            deviceSection.appendChild(info)

            previewContainer.appendChild(deviceSection)
        })

        document.body.appendChild(previewContainer)

        return {
            close: () => previewContainer.remove(),
            container: previewContainer
        }
    }

    constructor(rules, options = {}) {
        if (!Array.isArray(rules)) {
            throw new TypeError('Rules must be an array')
        }

        this.rules = rules.map(r => ({
            priority: 0,
            once: false,
            clone: false,
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
            conditionalRules: false,
            cloneMode: false,
            intersectionObserver: false,
            statePersistence: false,
            storageKey: 'rdm-state',
            responsiveImages: false,
            templates: {},
            ...options
        }

        this.items = new Map()
        this.clones = new Map()
        this.groups = new Map()
        this.swaps = new Map()
        this.activeRules = new Set()
        this.breakpointCallbacks = new Map()
        this.currentBreakpoints = new Set()
        this.templates = new Map()
        this.mqls = []
        this.observer = null
        this.intersectionObserver = null
        this.eventDelegates = new Map()
        this.history = []
        this.initialized = false
        this.destroyed = false

        this._evaluateThrottled = this._throttle(
            this._evaluateAll.bind(this),
            this.options.throttle
        )

        if (this.options.templates) {
            Object.entries(this.options.templates).forEach(([name, template]) => {
                this.templates.set(name, template)
            })
        }

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

            if (this.options.intersectionObserver) {
                this._setupIntersectionObserver()
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
        if (!rule.to && !rule.isGroup && !rule.items?.some(i => i.swap)) {
            throw new Error('Rule must have a target selector or swap target')
        }
        if (!rule.isGroup && !Array.isArray(rule.items)) {
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

    _getBreakpointName(media) {
        for (const [name, query] of Object.entries(ResponsiveDOMMover.breakpoints)) {
            if (query === media) return name
        }
        return null
    }

    _triggerBreakpointCallbacks(breakpointName, entered) {
        const callbacks = this.breakpointCallbacks.get(breakpointName)
        if (!callbacks) return

        callbacks.forEach(callback => {
            try {
                callback({ breakpoint: breakpointName, entered, mover: this })
            } catch (error) {
                this._handleError('Breakpoint callback error', error, { breakpointName })
            }
        })

        this._dispatch('breakpointChange', {
            breakpoint: breakpointName,
            entered,
            active: Array.from(this.currentBreakpoints)
        })
    }

    onBreakpoint(breakpointName, callback) {
        if (!this.breakpointCallbacks.has(breakpointName)) {
            this.breakpointCallbacks.set(breakpointName, [])
        }
        this.breakpointCallbacks.get(breakpointName).push(callback)
        return this
    }

    _applyResponsiveImages(element, config, rule, isEntering) {
        if (typeof config === 'function') {
            try {
                const result = config(element, isEntering, rule)

                if (result) {
                    if (typeof result === 'string') {
                        const img = element.querySelector('img') || element
                        if (img.tagName === 'IMG') {
                            img.src = result
                        }
                    } else if (result.html) {
                        element.innerHTML = result.html
                    } else if (result.src) {
                        const img = element.querySelector('img') || element
                        if (img.tagName === 'IMG') {
                            img.src = result.src
                            if (result.srcset) img.srcset = result.srcset
                            if (result.alt) img.alt = result.alt
                        }
                    }
                }

                this._dispatch('responsiveImage', {
                    element,
                    config: result,
                    rule,
                    isEntering
                })

                this._log('Responsive image applied:', element)
            } catch (error) {
                this._handleError('Responsive image error', error, { element, rule })
            }
        }
    }

    _applyTemplate(element, templateName, item) {
        const template = this.templates.get(templateName)
        if (!template) {
            this._log('Template not found:', templateName)
            return
        }

        try {
            let result = template

            if (typeof template === 'function') {
                result = template(element, item)
            } else if (typeof template === 'string') {
                result = template.replace('{content}', element.innerHTML)

                const matches = result.match(/\{([^}]+)\}/g)
                if (matches) {
                    matches.forEach(match => {
                        const selector = match.slice(1, -1)
                        const targetEl = element.querySelector(selector)
                        if (targetEl) {
                            result = result.replace(match, targetEl.textContent || targetEl.innerHTML)
                        }
                    })
                }
            }

            if (result && typeof result === 'string') {
                element.outerHTML = result
            }

            this._dispatch('templateApplied', { element, templateName, result })
            this._log('Template applied:', templateName)
        } catch (error) {
            this._handleError('Template error', error, { element, templateName })
        }
    }

    addTemplate(name, template) {
        this.templates.set(name, template)
        return this
    }

    removeTemplate(name) {
        this.templates.delete(name)
        return this
    }

    _activateRule(rule) {
        if (this.activeRules.has(rule)) return

        this._log('Activating rule:', rule.media)

        const breakpointName = this._getBreakpointName(rule.media)
        if (breakpointName && !this.currentBreakpoints.has(breakpointName)) {
            this.currentBreakpoints.add(breakpointName)
            this._triggerBreakpointCallbacks(breakpointName, true)
        }

        if (rule.isGroup) {
            this._activateGroup(rule)
        } else {
            rule.items.forEach(item => {
                const el = document.querySelector(item.selector)
                if (!el) {
                    this._log('Element not found:', item.selector)
                    return
                }

                if (item.responsiveImages && this.options.responsiveImages) {
                    this._applyResponsiveImages(el, item.responsiveImages, rule, true)
                    return
                }

                if (item.template) {
                    this._applyTemplate(el, item.template, item)
                    return
                }

                if (item.swap) {
                    this._swapElements(el, item.swap, rule)
                    return
                }

                if (this.options.conditionalRules && item.condition) {
                    const conditionMet = this._evaluateCondition(item.condition)
                    if (!conditionMet) {
                        this._log('Condition not met, skipping:', el)
                        return
                    }
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

                if (item.intersect && this.options.intersectionObserver) {
                    this._observeIntersection(el, rule, item)
                } else {
                    const delay = item.delay || 0
                    if (delay > 0) {
                        setTimeout(() => this._moveElement(el, rule, item), delay)
                    } else {
                        this._moveElement(el, rule, item)
                    }
                }
            })
        }

        this.activeRules.add(rule)
        rule.onEnter?.({ rule, mover: this })
        this._dispatch('enter', { rule })
    }

    _activateGroup(rule) {
        const elements = []

        rule.items.forEach(item => {
            const el = item.element || document.querySelector(item.selector)
            if (el) elements.push({ el, order: item.groupOrder || 0 })
        })

        if (elements.length === 0) {
            this._log('Group has no elements:', rule.groupName)
            return
        }

        if (rule.keepOrder !== false) {
            elements.sort((a, b) => a.order - b.order)
        }

        const groupId = rule.groupName || `group-${Date.now()}`

        const groupData = {
            elements: elements.map(e => e.el),
            rule,
            container: null,
            originalPositions: new Map()
        }

        elements.forEach(({ el }) => {
            groupData.originalPositions.set(el, {
                parent: el.parentNode,
                nextSibling: el.nextSibling
            })
        })

        this.groups.set(groupId, groupData)

        const target = this._findTarget(rule.to)
        if (!target) {
            this._log('Group target not found:', rule.to)
            return
        }

        if (rule.wrapInContainer) {
            const container = document.createElement('div')
            container.className = rule.containerClass || 'rdm-group-container'
            container.dataset.groupId = groupId
            target.appendChild(container)

            elements.forEach(({ el }) => {
                this._moveElement(el, rule, { position: 'last', isGroupItem: true }, container)
            })

            this.groups.get(groupId).container = container
        } else {
            elements.forEach(({ el }) => {
                this._moveElement(el, rule, { position: 'last', isGroupItem: true }, target)
            })
        }

        rule.onGroupMove?.({ elements: elements.map(e => e.el), groupId })
        this._dispatch('groupMove', { elements: elements.map(e => e.el), groupId, rule })
    }

    _deactivateRule(rule) {
        if (!this.activeRules.has(rule)) return

        this._log('Deactivating rule:', rule.media)

        const breakpointName = this._getBreakpointName(rule.media)
        if (breakpointName && this.currentBreakpoints.has(breakpointName)) {
            this.currentBreakpoints.delete(breakpointName)
            this._triggerBreakpointCallbacks(breakpointName, false)
        }

        if (rule.isGroup) {
            this._deactivateGroup(rule)
        } else {
            rule.items.forEach(item => {
                const el = document.querySelector(item.selector)
                if (!el) return

                if (item.responsiveImages && this.options.responsiveImages) {
                    this._applyResponsiveImages(el, item.responsiveImages, rule, false)
                    return
                }

                if (item.swap) {
                    const el2 = document.querySelector(item.swap)
                    if (el2) {
                        const swapKey = `${el.dataset.moveId}-${el2.dataset.moveId || ResponsiveDOMMover.uid(el2)}`
                        this._restoreSwap(swapKey)
                    }
                    return
                }

                const data = this.items.get(el)
                if (data && data.rule === rule) {
                    this._restoreElement(el)
                }
            })
        }

        this.activeRules.delete(rule)
        rule.onLeave?.({ rule, mover: this })
        this._dispatch('leave', { rule })
    }

    _deactivateGroup(rule) {
        const groupId = rule.groupName
        const group = this.groups.get(groupId)

        if (!group) return

        if (group.container) {
            group.container.remove()
        }

        group.elements.forEach(el => {
            const originalPos = group.originalPositions.get(el)
            if (originalPos && originalPos.parent) {
                if (originalPos.nextSibling && originalPos.nextSibling.parentNode === originalPos.parent) {
                    originalPos.parent.insertBefore(el, originalPos.nextSibling)
                } else {
                    originalPos.parent.appendChild(el)
                }

                this.items.delete(el)
                this._log('Group element restored to original position:', el)
            } else {
                this._restoreElement(el)
            }
        })

        this.groups.delete(groupId)
        this._dispatch('groupRestore', { groupId, rule })
    }

    _evaluateCondition(condition) {
        if (typeof condition === 'function') {
            return condition()
        }

        if (typeof condition === 'string') {
            try {
                return new Function('return ' + condition)()
            } catch (e) {
                console.error('Error evaluating condition:', e)
                return false
            }
        }

        return Boolean(condition)
    }

    _swapElements(el1Selector, el2Selector, rule = null) {
        const el1 = typeof el1Selector === 'string' ? document.querySelector(el1Selector) : el1Selector
        const el2 = document.querySelector(el2Selector)

        if (!el1 || !el2) {
            this._log('Swap: One or both elements not found')
            return
        }

        const swapKey = `${ResponsiveDOMMover.uid(el1)}-${ResponsiveDOMMover.uid(el2)}`

        if (this.swaps.has(swapKey)) {
            this._log('Swap: Already swapped, skipping')
            return
        }

        const parent1 = el1.parentNode
        const next1 = el1.nextSibling
        const parent2 = el2.parentNode
        const next2 = el2.nextSibling

        this.swaps.set(swapKey, {
            el1,
            el2,
            parent1,
            next1,
            parent2,
            next2,
            rule,
            swappedAt: Date.now()
        })

        if (next1 === el2) {
            parent1.insertBefore(el2, el1)
        } else if (next2 === el1) {
            parent2.insertBefore(el1, el2)
        } else {
            const temp = document.createComment('swap-temp')
            parent1.insertBefore(temp, el1)

            if (next2) {
                parent2.insertBefore(el1, next2)
            } else {
                parent2.appendChild(el1)
            }

            if (next1) {
                parent1.insertBefore(el2, next1)
            } else {
                parent1.appendChild(el2)
            }

            temp.remove()
        }

        this._dispatch('swap', { element1: el1, element2: el2, rule })
        this._log('Swapped elements:', el1, el2)
    }

    _restoreSwap(swapKey) {
        const swapData = this.swaps.get(swapKey)
        if (!swapData) return

        const { el1, el2, parent1, next1, parent2, next2 } = swapData

        if (next1 === el2) {
            parent1.insertBefore(el2, el1)
        } else if (next2 === el1) {
            parent2.insertBefore(el1, el2)
        } else {
            const temp = document.createComment('swap-restore-temp')
            el1.parentNode.insertBefore(temp, el1)

            if (next1 && next1.parentNode) {
                parent1.insertBefore(el1, next1)
            } else {
                parent1.appendChild(el1)
            }

            if (next2 && next2.parentNode) {
                parent2.insertBefore(el2, next2)
            } else {
                parent2.appendChild(el2)
            }

            temp.remove()
        }

        this.swaps.delete(swapKey)
        this._dispatch('swapRestore', { element1: el1, element2: el2 })
        this._log('Restored swap:', el1, el2)
    }

    _setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target
                    const data = el._rdmIntersectData
                    if (data) {
                        this._moveElement(el, data.rule, data.item)
                        this.intersectionObserver.unobserve(el)
                    }
                }
            })
        }, { threshold: 0.5 })
    }

    _observeIntersection(el, rule, item) {
        el._rdmIntersectData = { rule, item }
        this.intersectionObserver.observe(el)
    }

    _findTarget(targetString) {
        const targets = targetString.split(',').map(s => s.trim())

        for (const target of targets) {
            const element = document.querySelector(target)
            if (element) return element
        }

        return null
    }

    async _moveElement(el, rule, item, customTarget = null) {
        try {
            if (this.options.beforeMove) {
                const shouldContinue = await this.options.beforeMove({ element: el, rule, item })
                if (shouldContinue === false) return
            }

            const isClone = (this.options.cloneMode || item.clone) && !this.clones.has(el)

            if (isClone) {
                const clone = el.cloneNode(true)
                clone.removeAttribute('data-move-id')
                ResponsiveDOMMover.uid(clone)

                const target = customTarget || this._findTarget(rule.to)
                if (!target) {
                    throw new Error(`Target not found: ${rule.to}`)
                }

                this._insertElement(clone, target, item.position)

                this.clones.set(el, clone)
                this._dispatch('clone', { original: el, clone, rule, item })
                return
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

            const target = customTarget || this._findTarget(rule.to)
            if (!target) {
                throw new Error(`Target not found: ${rule.to}`)
            }

            if (item.classes?.onMove) {
                el.classList.add(...item.classes.onMove)
            }

            if (item.transform) {
                if (typeof item.transform === 'function') {
                    item.transform(el)
                }
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

            this.history.push({
                action: 'move',
                element: el,
                from: parent,
                to: target,
                timestamp: Date.now()
            })

            if (this.options.statePersistence) {
                this._saveState()
            }

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

            if (data.item.classes?.onRestore) {
                el.classList.add(...data.item.classes.onRestore)
            }

            if (data.item.classes?.onMove) {
                el.classList.remove(...data.item.classes.onMove)
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

            this.history.push({
                action: 'restore',
                element: el,
                from: el.parentNode,
                to: data.parent,
                timestamp: Date.now()
            })

            if (this.options.statePersistence) {
                this._saveState()
            }

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

            this._insertElement(el, target, position)

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

    _saveState() {
        try {
            const state = {
                items: Array.from(this.items.entries()).map(([el, data]) => ({
                    id: el.dataset.moveId,
                    ruleMedia: data.rule.media,
                    timestamp: data.movedAt
                })),
                timestamp: Date.now()
            }
            localStorage.setItem(this.options.storageKey, JSON.stringify(state))
        } catch (e) {
            this._log('Failed to save state:', e)
        }
    }

    _loadState() {
        try {
            const saved = localStorage.getItem(this.options.storageKey)
            if (!saved) return

            const state = JSON.parse(saved)
            this._log('Loaded state:', state)
        } catch (e) {
            this._log('Failed to load state:', e)
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

    on(eventName, selector, callback) {
        if (!this.eventDelegates.has(eventName)) {
            this.eventDelegates.set(eventName, [])

            document.addEventListener(`rdm:${eventName}`, (e) => {
                const delegates = this.eventDelegates.get(eventName) || []
                delegates.forEach(({ selector, callback }) => {
                    if (e.detail.element && e.detail.element.matches(selector)) {
                        callback(e)
                    }
                })
            })
        }

        this.eventDelegates.get(eventName).push({ selector, callback })
        return this
    }

    defineGroup(name, selectors) {
        const elements = selectors.map(sel => document.querySelector(sel)).filter(Boolean)

        this.groups.set(name, {
            elements,
            selectors,
            defined: true
        })

        return this
    }

    moveGroup(groupName, target) {
        const group = this.groups.get(groupName)
        if (!group) {
            this._log('Group not found:', groupName)
            return this
        }

        const targetEl = document.querySelector(target)
        if (!targetEl) {
            this._log('Target not found:', target)
            return this
        }

        group.elements.forEach(el => {
            targetEl.appendChild(el)
        })

        this._dispatch('groupMove', { groupName, target, elements: group.elements })
        return this
    }

    restoreGroup(groupName) {
        const group = this.groups.get(groupName)
        if (!group) return this

        group.elements.forEach(el => {
            this._restoreElement(el)
        })

        return this
    }

    swap(selector1, selector2) {
        this._swapElements(selector1, selector2)
        return this
    }

    getHistory() {
        return [...this.history]
    }

    clearHistory() {
        this.history = []
        return this
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
            groupsCount: this.groups.size,
            clonesCount: this.clones.size,
            historyLength: this.history.length,
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

    clearState() {
        if (this.options.statePersistence) {
            localStorage.removeItem(this.options.storageKey)
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

        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect()
        }

        this.mqls = []
        this.items.clear()
        this.clones.clear()
        this.groups.clear()
        this.activeRules.clear()
        this.eventDelegates.clear()
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

    if (document.currentScript && document.currentScript.dataset.autoInit === 'true') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                ResponsiveDOMMover.fromDOM({ debug: document?.currentScript?.dataset?.debug === 'true' })
            })
        } else {
            ResponsiveDOMMover.fromDOM({ debug: document?.currentScript?.dataset?.debug === 'true' })
        }
    }
}
