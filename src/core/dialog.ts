import {TourGuideClient} from "../Tour";
import {computeDots, dotsWrapperHtmlString} from "./dots";
import {arrow, autoPlacement, computePosition as fui_computePosition, offset, shift} from "@floating-ui/dom";
import type {Placement, MiddlewareData, Side} from "@floating-ui/dom";

/**
 * createTourGuideDialog
 */
async function createTourGuideDialog(this: TourGuideClient): Promise<true> {
    this.dialog = document.createElement('div')
    this.dialog.classList.add('tg-dialog')
    const html = await renderDialogHtml.call(this)
    this.dialog.innerHTML = html
    document.body.append(this.dialog)
    return true
}

/**
 * renderDialogHtml
 *
 * @this TourGuideClient
 */
async function renderDialogHtml(this: TourGuideClient): Promise<string> {
    if (this.options.dialogClass) this.dialog.classList.add(this.options.dialogClass)
    if (this.options.dialogZ) this.dialog.style.zIndex = String(this.options.dialogZ)
    this.dialog.style.width = this.options.dialogWidth ? (this.options.dialogWidth + 'px') : 'auto'
    if (this.options.dialogMaxWidth) this.dialog.style.maxWidth = this.options.dialogMaxWidth + 'px'

    let htmlRes = ""
    htmlRes += `<div class='tg-dialog-header'>`
    htmlRes += `<div class="tg-dialog-title" id="tg-dialog-title"><!-- JS rendered --></div>`
    if (this.options.closeButton) {
        htmlRes += `<div class="tg-dialog-close-btn" id="tg-dialog-close-btn">`
        htmlRes += ` <svg width="12px" height="12px" id="Layer_1" version="1.1" viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/></svg>`
        htmlRes += `</div>`
    }

    htmlRes += '<div class="tg-dialog-spinner" id="tg-dialog-spinner">'
    htmlRes += '<svg fill="#000000" width="12" height="12" viewBox="0 0 20 20" stroke="#000000" stroke-width="0.8"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M10,1V3a7,7,0,1,1-7,7H1a9,9,0,1,0,9-9Z"></path> </g> </g></svg>'
    htmlRes += '</div>'

    htmlRes += `</div>` // end header
    if (this.options.progressBar) {
        htmlRes += `<div class="tg-dialog-progress-bar"><span class="tg-bar" id="tg-dialog-progbar"></span></div>`
    }
    htmlRes += `<div class="tg-dialog-body" id="tg-dialog-body"><!-- JS rendered --></div>`

    if (this.options.showStepDots && this.options.stepDotsPlacement === 'body') {
        const dotsWrapperHtml = dotsWrapperHtmlString()
        if (dotsWrapperHtml) htmlRes += dotsWrapperHtml
    }

    htmlRes += `<div class="tg-dialog-footer">`

    let prevBtnClass = "tg-dialog-btn"
    let prevDisabled = "false"
    if (this.activeStep === 0) {
        prevDisabled = "true"
        prevBtnClass += " disabled"
    }
    if (this.options.showButtons && !this.options.hidePrev) {
        htmlRes += `<button type="button" class="${prevBtnClass}" id="tg-dialog-prev-btn" disabled="${prevDisabled}">${this.options.prevLabel}</button>`
    }

    htmlRes += '<div class="tg-dialog-footer-sup">'

    if (this.options.showStepDots && this.options.stepDotsPlacement === 'footer') {
        const dotsWrapperHtml = dotsWrapperHtmlString()
        if (dotsWrapperHtml) htmlRes += dotsWrapperHtml
    }

    if (this.options.showStepProgress) {
        htmlRes += `<span class="tg-step-progress" id="tg-step-progress"><!-- JS rendered --></span>`
    }

    htmlRes += '</div>'

    if (this.options.showButtons && !this.options.hideNext) {
        htmlRes += `<button type="button" class="tg-dialog-btn" id="tg-dialog-next-btn">${this.options.nextLabel}</button>`
    }

    htmlRes += `</div>` // end footer

    htmlRes += `<div id="tg-arrow" class="tg-arrow"></div><!-- end tour arrow -->`

    return htmlRes
}

/**
 * updateDialogHtml
 *
 * Refreshes the dialog's textual/dynamic content to reflect the
 * currently active step.
 *
 * @this TourGuideClient
 */
async function updateDialogHtml(this: TourGuideClient): Promise<true> {
    const stepData = this.tourSteps[this.activeStep]
    if (!stepData) {
        throw new Error('No active step data')
    }

    const tgTitle = document.getElementById('tg-dialog-title')
    if (tgTitle) tgTitle.innerHTML = stepData.title ? stepData.title : ''

    const tgBody = document.getElementById('tg-dialog-body')
    if (tgBody) {
        if (typeof stepData.content === "string") {
            tgBody.innerHTML = stepData.content ? stepData.content : ''
        } else {
            tgBody.innerHTML = ""
            tgBody.append(stepData.content)
        }
    }

    const tgDots = document.getElementById('tg-dialog-dots')
    if (tgDots && this.options.showStepDots) {
        const dotsHtml = computeDots.call(this)
        if (dotsHtml) tgDots.innerHTML = dotsHtml
    }

    const backBtn = document.getElementById('tg-dialog-prev-btn')
    if (backBtn) {
        if (this.activeStep === 0) {
            backBtn.classList.add('disabled')
            backBtn.setAttribute("disabled", 'true')
        } else {
            backBtn.classList.remove('disabled')
            backBtn.removeAttribute("disabled")
        }
    }

    const nextBtn = document.getElementById('tg-dialog-next-btn')
    if (nextBtn) {
        const isLastStep = (this.activeStep + 1) >= this.tourSteps.length
        nextBtn.innerHTML = (isLastStep ? this.options.finishLabel : this.options.nextLabel) ?? ''
    }

    const tgProgress = document.getElementById('tg-step-progress')
    if (tgProgress) tgProgress.innerHTML = `${this.activeStep + 1}/${this.tourSteps.length}`

    const tgProgBar = document.getElementById('tg-dialog-progbar')
    if (tgProgBar) {
        if (this.options.progressBar) tgProgBar.style.backgroundColor = this.options.progressBar
        tgProgBar.style.width = `${((this.activeStep + 1) / this.tourSteps.length) * 100}%`
    }

    return true
}

/**
 * computeDialogPosition
 *
 * Positions the dialog relative to the current step's target element
 * using floating-ui, or centers it on screen if the target is `document.body`.
 *
 * @this TourGuideClient
 */
async function computeDialogPosition(this: TourGuideClient): Promise<true> {
    const arrowElement: HTMLElement | null = document.querySelector('#tg-arrow')

    const stepData = this.tourSteps[this.activeStep]
    if (!stepData) {
        throw new Error(`No step found at index ${this.activeStep}`)
    }

    const targetElem = (stepData.dialogTarget || stepData.target) as HTMLElement

    if (targetElem === document.body) {
        Object.assign(this.dialog.style, {
            top: `${(window.innerHeight / 2.25) - (this.dialog.clientHeight / 2)}px`,
            left: `${(window.innerWidth / 2) - (this.dialog.clientWidth / 2)}px`,
            position: 'fixed',
        })
        this.dialog.classList.add('tg-dialog-fixed')
        if (arrowElement) arrowElement.style.display = 'none'
        return true
    }

    this.dialog.style.position = 'absolute'
    this.dialog.classList.remove('tg-dialog-fixed')
    if (arrowElement) arrowElement.style.display = 'inline-block'

    // Only add the arrow middleware if the arrow element actually exists.
    const middleware = [
        autoPlacement({
            autoAlignment: true,
            padding: 5
        }),
        shift({
            crossAxis: this.options.allowDialogOverlap,
            padding: 15
        }),
        offset(20),
    ]

    if (arrowElement) {
        middleware.push(arrow({element: arrowElement}))
    }

    const {x, y, placement, middlewareData} = await fui_computePosition(targetElem, this.dialog, {
        placement: this.options.dialogPlacement as Placement,
        middleware,
    })

    Object.assign(this.dialog.style, {
        left: `${x}px`,
        top: `${y}px`,
    })

    if (middlewareData.arrow && arrowElement) {
        Object.assign(arrowElement.style, arrowStyles(middlewareData.arrow, placement, this.dialog))
    }

    return true
}

/**
 * Size of the dialog arrow in pixels.
 */
const ARROW_SIZE = 10

/**
 * Maps a placement's primary side to the opposite side, where the
 * arrow "docks" against the dialog edge.
 */
const OPPOSITE_SIDE: Record<Side, Side> = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
}

function isSide(value: string): value is Side {
    return value === "top" || value === "right" || value === "bottom" || value === "left"
}

/**
 * arrowStyles
 *
 * Computes the CSS position of the dialog arrow based on floating-ui's
 * middleware data.
 *
 * @param arrowMiddlewareData - Arrow position data from floating-ui
 * @param placement - Resolved placement of the dialog
 * @param dialog - The dialog element (used to read its current dimensions)
 */
function arrowStyles(
    arrowMiddlewareData: MiddlewareData["arrow"],
    placement: Placement,
    dialog: TourGuideClient["dialog"]
): Partial<CSSStyleDeclaration> & Record<string, string> {
    const arrowX = arrowMiddlewareData?.x || 0
    const arrowY = arrowMiddlewareData?.y || 0

    const primarySide = placement.split('-')[0]
    if (!isSide(primarySide)) {
        throw new Error(`Unexpected placement side: "${primarySide}"`)
    }

    const staticSide = OPPOSITE_SIDE[primarySide]

    const maxWidth = dialog.clientWidth - ARROW_SIZE
    const maxHeight = dialog.clientHeight - ARROW_SIZE

    const isAtMaxHeight = Math.abs(arrowY - maxHeight) <= ARROW_SIZE
    const isAtMaxWidth = Math.abs(arrowX - maxWidth) <= ARROW_SIZE
    const isAtMinHeight = Math.abs(arrowY) <= ARROW_SIZE
    const isAtMinWidth = Math.abs(arrowX) <= ARROW_SIZE

    const isInCorner = arrowMiddlewareData?.centerOffset !== 0 || (
        (isAtMinWidth || isAtMaxWidth) &&
        (isAtMinHeight || isAtMaxHeight)
    )

    return {
        left: isAtMinWidth ? (staticSide === 'right' ? '' : '0') : (isAtMaxWidth ? `${maxWidth}px` : `${arrowX}px`),
        top: isAtMinHeight ? (staticSide === 'bottom' ? '' : '0') : (isAtMaxHeight ? `${maxHeight}px` : `${arrowY}px`),
        [staticSide]: isInCorner ? "0" : `-${ARROW_SIZE / 2}px`,
        transform: isInCorner ? "none" : "rotate(45deg)",
    }
}

export {createTourGuideDialog, renderDialogHtml, updateDialogHtml, computeDialogPosition}
