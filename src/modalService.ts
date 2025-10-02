type ModalVariant = "default" | "danger"

type ModalFieldType = "text" | "textarea" | "select" | "date"

export interface ModalField {
  name: string
  label: string
  type: ModalFieldType
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  initialValue?: string
}

interface BaseModalOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string | null
  variant?: ModalVariant
  dismissible?: boolean
}

interface FormModalOptions extends BaseModalOptions {
  fields: ModalField[]
}

interface ModalResult {
  confirmed: boolean
  values?: Record<string, string>
}

interface FormFieldElements {
  field: ModalField
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  error: HTMLParagraphElement
  wrapper: HTMLDivElement
}

const MODAL_ROOT_ID = "modal-root"

let activeModal: HTMLDivElement | null = null
let activeResolver: ((result: ModalResult) => void) | null = null
const modalQueue: Array<() => void> = []
let releaseFocusTrap: (() => void) | null = null

function ensureModalRoot(): HTMLDivElement {
  let host = document.getElementById(MODAL_ROOT_ID) as HTMLDivElement | null
  if (!host) {
    host = document.createElement("div")
    host.id = MODAL_ROOT_ID
    host.setAttribute("aria-live", "assertive")
    document.body.appendChild(host)
  }
  return host
}

function lockScroll(lock: boolean): void {
  if (lock) {
    document.body.classList.add("overflow-hidden")
  } else {
    document.body.classList.remove("overflow-hidden")
  }
}

function createButton({
  label,
  variant,
  type = "button",
}: {
  label: string
  variant: "primary" | "secondary" | "danger"
  type?: "button" | "submit"
}): HTMLButtonElement {
  const button = document.createElement("button")
  button.type = type
  
  // Base button classes
  const baseClasses = "inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
  
  // Variant-specific classes
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-600",
    secondary: "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100 focus-visible:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
  }
  
  button.className = `${baseClasses} ${variantClasses[variant]}`
  button.textContent = label
  return button
}

function setInitialFocus(container: HTMLElement): void {
  const focusable = getFocusableElements(container)
  if (focusable.length > 0) {
    focusable[0].focus()
  } else {
    container.setAttribute("tabindex", "-1")
    container.focus()
  }
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector))
  return elements.filter((el) => !el.hasAttribute("hidden"))
}

function activateFocusTrap(container: HTMLElement, dismissible: boolean, onDismiss: () => void): () => void {
  const focusable = getFocusableElements(container)
  if (focusable.length === 0) {
    return () => {}
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    if (event.key === "Escape" && dismissible) {
      event.preventDefault()
      onDismiss()
    }
  }

  container.addEventListener("keydown", handleKeyDown)
  return () => container.removeEventListener("keydown", handleKeyDown)
}

function closeModal(result: ModalResult): void {
  if (!activeModal) return

  activeModal.remove()
  activeModal = null

  lockScroll(false)

  if (releaseFocusTrap) {
    releaseFocusTrap()
    releaseFocusTrap = null
  }

  const resolver = activeResolver
  activeResolver = null
  if (resolver) {
    resolver(result)
  }

  const next = modalQueue.shift()
  if (next) {
    next()
  }
}

function renderField(field: ModalField): FormFieldElements {
  const wrapper = document.createElement("div")
  wrapper.className = "space-y-1"

  const label = document.createElement("label")
  const fieldId = `modal-field-${field.name}-${Date.now()}`
  label.textContent = field.label
  label.htmlFor = fieldId
  label.className = "block text-sm font-medium text-slate-700"
  wrapper.appendChild(label)

  let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

  const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"

  switch (field.type) {
    case "textarea": {
      const textarea = document.createElement("textarea")
      textarea.id = fieldId
      textarea.name = field.name
      textarea.placeholder = field.placeholder ?? ""
      textarea.value = field.initialValue ?? ""
      textarea.rows = 3
      textarea.className = `${inputClasses} resize-y`
      input = textarea
      break
    }
    case "select": {
      const select = document.createElement("select")
      select.id = fieldId
      select.name = field.name
      select.className = inputClasses
      const options = field.options ?? []
      options.forEach((option) => {
        const optionEl = document.createElement("option")
        optionEl.value = option.value
        optionEl.textContent = option.label
        if (field.initialValue !== undefined && field.initialValue === option.value) {
          optionEl.selected = true
        }
        select.appendChild(optionEl)
      })
      input = select
      break
    }
    case "date": {
      const dateInput = document.createElement("input")
      dateInput.type = "date"
      dateInput.id = fieldId
      dateInput.name = field.name
      dateInput.className = `${inputClasses} [color-scheme:light]`
      if (field.initialValue) {
        dateInput.value = field.initialValue
      }
      if (field.placeholder) {
        dateInput.placeholder = field.placeholder
      }
      input = dateInput
      break
    }
    case "text":
    default: {
      const textInput = document.createElement("input")
      textInput.type = "text"
      textInput.id = fieldId
      textInput.name = field.name
      textInput.placeholder = field.placeholder ?? ""
      textInput.value = field.initialValue ?? ""
      textInput.className = inputClasses
      input = textInput
      break
    }
  }

  if (field.required) {
    input.required = true
  }

  wrapper.appendChild(input)

  if (field.description) {
    const description = document.createElement("p")
    description.className = "text-xs text-slate-500"
    description.textContent = field.description
    wrapper.appendChild(description)
  }

  const error = document.createElement("p")
  error.className = "hidden text-sm text-red-600"
  error.dataset.active = "false"
  error.textContent = "Please fill out this field."
  wrapper.appendChild(error)

  input.addEventListener("input", () => {
    error.dataset.active = "false"
    error.className = "hidden text-sm text-red-600"
  })

  return { field, input, error, wrapper }
}

function validateFields(fieldElements: FormFieldElements[]): boolean {
  let valid = true
  fieldElements.forEach(({ field, input, error }) => {
    if (field.required) {
      const value = input.value.trim()
      if (!value) {
        error.dataset.active = "true"
        error.className = "block text-sm text-red-600"
        valid = false
      }
    }
  })
  return valid
}

function gatherValues(fieldElements: FormFieldElements[]): Record<string, string> {
  const values: Record<string, string> = {}
  fieldElements.forEach(({ field, input }) => {
    values[field.name] = input.value
  })
  return values
}

function mountModal(content: HTMLDivElement): void {
  const host = ensureModalRoot()
  host.appendChild(content)
}

function openModal(options: BaseModalOptions & Partial<FormModalOptions>): Promise<ModalResult> {
  return new Promise((resolve) => {
    const start = () => {
      const dismissible = options.dismissible !== false
      const previousActiveElement = document.activeElement as HTMLElement | null

      const overlay = document.createElement("div")
      // Modal backdrop with Tailwind classes - using bg-black/50 for 50% opacity
      overlay.className = "fixed inset-0 z-[999] flex items-center justify-center bg-black/50 transition-opacity duration-200"

      const panel = document.createElement("div")
      // Modal panel with Tailwind classes
      let panelClasses = "relative w-full max-w-lg rounded-lg border bg-white p-6 shadow-xl transform transition-all duration-200"
      
      if (options.variant === "danger") {
        panelClasses += " border-red-200"
      } else {
        panelClasses += " border-gray-200"
      }
      
      panel.className = panelClasses
      panel.setAttribute("role", "dialog")
      panel.setAttribute("aria-modal", "true")

      const titleId = `modal-title-${Date.now()}`
      panel.setAttribute("aria-labelledby", titleId)

      const title = document.createElement("h2")
      title.className = "text-xl font-semibold text-slate-900"
      title.id = titleId
      title.textContent = options.title
      panel.appendChild(title)

      let form: HTMLFormElement | null = null
      const fieldElements: FormFieldElements[] = []

      if (options.message) {
        const description = document.createElement("p")
        description.className = "mt-2 text-sm text-slate-600"
        description.textContent = options.message
        panel.appendChild(description)
      }

      if (options.fields && options.fields.length > 0) {
        form = document.createElement("form")
        form.className = "mt-4 space-y-4"
        options.fields.forEach((field) => {
          const fieldEl = renderField(field)
          form!.appendChild(fieldEl.wrapper)
          fieldElements.push(fieldEl)
        })
      }

      const footer = document.createElement("div")
      footer.className = "mt-6 flex flex-wrap items-center justify-end gap-3"

      const cancelLabel =
        options.cancelLabel === undefined
          ? options.fields
            ? "Cancel"
            : "Close"
          : options.cancelLabel
      const confirmLabel = options.confirmLabel ?? (options.fields ? "Save" : "OK")

      if (dismissible) {
        overlay.addEventListener("click", (event) => {
          if (event.target === overlay) {
            resolveAndClose(false)
          }
        })
      }

      if (cancelLabel !== null) {
        const cancelButton = createButton({ label: cancelLabel, variant: "secondary" })
        cancelButton.addEventListener("click", () => resolveAndClose(false))
        footer.appendChild(cancelButton)
      }

      const confirmButtonVariant: "primary" | "secondary" | "danger" =
        options.variant === "danger" ? "danger" : "primary"
      const confirmButton = createButton({
        label: confirmLabel,
        variant: confirmButtonVariant,
        type: form ? "submit" : "button",
      })

      if (!form) {
        confirmButton.addEventListener("click", () => resolveAndClose(true))
      }

      footer.appendChild(confirmButton)
      
      // If there's a form, append footer to form, then form to panel
      // Otherwise, append footer directly to panel
      if (form) {
        form.appendChild(footer)
        panel.appendChild(form)
      } else {
        panel.appendChild(footer)
      }

      overlay.appendChild(panel)
      mountModal(overlay)

      lockScroll(true)
      activeModal = overlay
      activeResolver = resolve

      function resolveAndClose(confirmed: boolean): void {
        const hasPending = modalQueue.length > 0
        if (confirmed && form) {
          const isValid = validateFields(fieldElements)
          if (!isValid) {
            return
          }
          const values = gatherValues(fieldElements)
          closeModal({ confirmed: true, values })
        } else {
          closeModal({ confirmed })
        }
        if (!hasPending && previousActiveElement) {
          previousActiveElement.focus()
        }
      }

      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault()
          resolveAndClose(true)
        })
      }

      releaseFocusTrap = activateFocusTrap(panel, dismissible, () => resolveAndClose(false))
      setInitialFocus(panel)
    }

    if (activeModal) {
      modalQueue.push(start)
    } else {
      start()
    }
  })
}

export function setupModalHost(): void {
  ensureModalRoot()
}

export async function showAlertModal(options: BaseModalOptions): Promise<void> {
  await openModal({ ...options, cancelLabel: options.cancelLabel ?? null })
}

export async function showConfirmModal(options: BaseModalOptions): Promise<boolean> {
  const result = await openModal({
    ...options,
    confirmLabel: options.confirmLabel ?? "Confirm",
    cancelLabel: options.cancelLabel ?? "Cancel",
  })
  return result.confirmed
}

export async function showFormModal(options: FormModalOptions): Promise<Record<string, string> | null> {
  console.log('showFormModal called with options:', options);
    const result = await openModal({ ...options })
  if (!result.confirmed || !result.values) {
    return null
  }
  return result.values
}