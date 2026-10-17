const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!motionPreference.matches && "IntersectionObserver" in window) {
  const revealTargets = new Set([
    ...document.querySelectorAll("main > section"),
    ...document.querySelectorAll(
      ".category-card, .home-product-card, .task-route-card, .field-note-card, .resource-card, .tecnover-card, .service-term-card, .service-faq-list > details, .benefit, .step",
    ),
    ...document.querySelectorAll(".hero-copy > *, .hero-art, .resources-hero-grid > *, .catalog-hero-grid > *, .selection-hero-grid > *, .service-hero-grid > *, .feedback-hero-grid > *, .order-header > *"),
  ]);

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  document.querySelectorAll(
    ".category-card, .home-product-card, .task-route-card, .field-note-card, .resource-card, .tecnover-card, .service-term-card, .service-faq-list > details, .benefit, .step",
  ).forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
  });

  revealTargets.forEach((element) => {
    element.dataset.reveal = "rise";
    revealObserver.observe(element);
  });

  document.body.classList.add("motion-ready");
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  siteNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Открыть меню" : "Закрыть меню");
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

const inquiryForm = document.querySelector("#inquiry-form");
const formStatus = document.querySelector("#form-status");
const phoneInput = document.querySelector("#phone");

if (inquiryForm && formStatus && phoneInput) {
  function setFieldError(field, hasError) {
    if (hasError) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  const inquiryTopic = new URLSearchParams(window.location.search).get("topic");
  let inquiryDetails = new URLSearchParams(window.location.search).get("details");
  try {
    inquiryDetails ||= window.sessionStorage.getItem("nordInquiryDetails");
    if (inquiryDetails) window.sessionStorage.removeItem("nordInquiryDetails");
  } catch {
    formStatus.classList.add("is-error");
    formStatus.textContent = "Не удалось загрузить подготовленное описание. Вы можете ввести задачу вручную.";
  }
  if (inquiryTopic || inquiryDetails) {
    inquiryForm.elements.message.value = [
      inquiryTopic ? `Тема: ${inquiryTopic}` : "",
      inquiryDetails || "",
    ].filter(Boolean).join("\n\n");
  }

  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.classList.remove("is-error");
    formStatus.textContent = "";

    const nameInput = inquiryForm.elements.name;
    const phoneDigits = phoneInput.value.replace(/\D/g, "");
    const nameInvalid = nameInput.value.trim().length < 2;
    const phoneInvalid = phoneDigits.length < 10 || phoneDigits.length > 15;
    setFieldError(nameInput, nameInvalid);
    setFieldError(phoneInput, phoneInvalid);

    if (nameInvalid || phoneInvalid) {
      formStatus.classList.add("is-error");
      formStatus.textContent = nameInvalid
        ? "Укажите имя (не менее двух символов)."
        : "Проверьте номер телефона: нужно указать от 10 до 15 цифр.";
      (nameInvalid ? nameInput : phoneInput).focus();
      return;
    }

    formStatus.textContent = "Проверка пройдена. Это демонстрация: заявка не отправлена и данные не сохранены.";
  });

  inquiryForm.addEventListener("input", (event) => {
    if (event.target.matches("input")) {
      setFieldError(event.target, false);
      formStatus.classList.remove("is-error");
      formStatus.textContent = "";
    }
  });
}

const feedbackForm = document.querySelector("#feedback-form");
const feedbackFormStatus = document.querySelector("#feedback-form-status");
const feedbackDraft = document.querySelector("#feedback-draft");
const feedbackDraftText = document.querySelector("#feedback-draft-text");
const feedbackCopyButton = document.querySelector("#feedback-copy");
const feedbackCopyStatus = document.querySelector("#feedback-copy-status");

if (feedbackForm && feedbackFormStatus && feedbackDraft && feedbackDraftText && feedbackCopyButton && feedbackCopyStatus) {
  const feedbackFields = {
    type: feedbackForm.elements.type,
    model: feedbackForm.elements.model,
    city: feedbackForm.elements.city,
    date: feedbackForm.elements.date,
    description: feedbackForm.elements.description,
    expected: feedbackForm.elements.expected,
    contact: feedbackForm.elements.contact,
  };

  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedbackFormStatus.classList.remove("is-error");
    feedbackCopyStatus.classList.remove("is-error");
    feedbackFormStatus.textContent = "";
    feedbackCopyStatus.textContent = "";

    const invalidField = !feedbackFields.type.value
      ? feedbackFields.type
      : feedbackFields.description.value.trim().length < 20
        ? feedbackFields.description
        : null;

    feedbackFields.type.toggleAttribute("aria-invalid", feedbackFields.type === invalidField);
    feedbackFields.description.toggleAttribute("aria-invalid", feedbackFields.description === invalidField);

    if (invalidField) {
      feedbackFormStatus.classList.add("is-error");
      feedbackFormStatus.textContent = invalidField === feedbackFields.type
        ? "Выберите тему обращения."
        : "Добавьте немного подробностей — не менее 20 символов.";
      invalidField.focus();
      return;
    }

    const lines = [
      "Обращение в Nord",
      `Тема: ${feedbackFields.type.value}`,
      feedbackFields.model.value.trim() ? `Модель или номер заказа: ${feedbackFields.model.value.trim()}` : "",
      feedbackFields.city.value.trim() ? `Город: ${feedbackFields.city.value.trim()}` : "",
      feedbackFields.date.value ? `Дата ситуации: ${feedbackFields.date.value}` : "",
      `Описание: ${feedbackFields.description.value.trim()}`,
      feedbackFields.expected.value.trim() ? `Ожидаемое решение: ${feedbackFields.expected.value.trim()}` : "",
      feedbackFields.contact.value.trim() ? `Контакт для ответа: ${feedbackFields.contact.value.trim()}` : "",
    ].filter(Boolean);

    feedbackDraftText.value = lines.join("\n\n");
    feedbackDraft.hidden = false;
    feedbackFormStatus.textContent = "Черновик подготовлен. Он не отправлен и не сохранён.";
    feedbackDraftText.focus();
  });

  feedbackForm.addEventListener("input", (event) => {
    if (event.target.matches("input, select, textarea")) {
      event.target.removeAttribute("aria-invalid");
      feedbackFormStatus.classList.remove("is-error");
      feedbackFormStatus.textContent = "";
    }
  });

  feedbackCopyButton.addEventListener("click", async () => {
    feedbackCopyStatus.classList.remove("is-error");
    try {
      await navigator.clipboard.writeText(feedbackDraftText.value);
      feedbackCopyStatus.textContent = "Текст скопирован. Его можно отправить по официальному каналу Nord после подтверждения контактов.";
    } catch {
      feedbackDraftText.focus();
      feedbackDraftText.select();
      feedbackCopyStatus.classList.add("is-error");
      feedbackCopyStatus.textContent = "Не удалось скопировать автоматически. Текст выделен — скопируйте его вручную.";
    }
  });
}

const selectionWizard = document.querySelector("#selection-wizard");
const selectionResult = document.querySelector("#selection-result");

if (selectionWizard && selectionResult) {
  const steps = [...selectionWizard.querySelectorAll(".selection-step")];
  const answers = Array(steps.length).fill(null);
  const stepCount = document.querySelector("#selection-step-count");
  const progress = document.querySelector(".selection-progress");
  const progressFill = document.querySelector(".selection-progress-fill");
  const validation = document.querySelector("#selection-validation");
  const backButton = document.querySelector("#selection-back");
  const skipButton = document.querySelector("#selection-skip");
  const nextButton = document.querySelector("#selection-next");
  const editButton = document.querySelector("#selection-edit");
  const context = document.querySelector("#selection-context");
  const modelLabel = document.querySelector("#selection-model");
  const model = new URLSearchParams(window.location.search).get("model");
  let currentStep = 0;
  let sessionStorageAvailable = true;
  try {
    window.sessionStorage.removeItem("nordInquiryDetails");
  } catch {
    sessionStorageAvailable = false;
  }

  if (model) {
    modelLabel.textContent = model;
    context.hidden = false;
  }

  function renderStep() {
    steps.forEach((step, index) => {
      step.hidden = index !== currentStep;
      step.querySelectorAll(".selection-option").forEach((option) => {
        option.setAttribute("aria-pressed", String(answers[index] === option.dataset.value));
      });
    });

    stepCount.textContent = `Вопрос ${currentStep + 1} из ${steps.length}`;
    progress.setAttribute("aria-valuenow", String(currentStep + 1));
    progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    backButton.disabled = currentStep === 0;
    nextButton.replaceChildren(
      document.createTextNode(currentStep === steps.length - 1 ? "Сформировать бриф " : "Дальше "),
    );
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    nextButton.append(arrow);
    validation.textContent = "";
  }

  steps.forEach((step, index) => {
    step.querySelectorAll(".selection-option").forEach((option) => {
      option.addEventListener("click", () => {
        answers[index] = option.dataset.value;
        step.querySelectorAll(".selection-option").forEach((item) => {
          item.setAttribute("aria-pressed", String(item === option));
        });
        validation.textContent = "";
      });
    });
  });

  function goToStep(index) {
    currentStep = index;
    selectionResult.hidden = true;
    selectionWizard.hidden = false;
    renderStep();
    steps[currentStep].querySelector("legend").focus();
  }

  function showResult() {
    const labels = [
      "Что нужно окрашивать",
      "Материал",
      "Ориентировочный объём",
      "Что важно при выборе",
    ];
    const summary = document.querySelector("#selection-summary");
    summary.replaceChildren();

    labels.forEach((label, index) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = answers[index] || "Не указано";
      row.append(term, description);
      summary.append(row);
    });

    if (model) {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = "Модель, о которой спрашиваю";
      description.textContent = model;
      row.append(term, description);
      summary.append(row);
    }

    const brief = [
      ...labels.map((label, index) => `${label}: ${answers[index] || "не указано"}`),
      ...(model ? [`Модель, о которой спрашиваю: ${model}`] : []),
    ].join("\n");
    if (!sessionStorageAvailable) {
      validation.textContent = "Браузер не разрешает безопасно передать вводные. Перейдите к консультации и опишите задачу вручную.";
      return;
    }
    try {
      window.sessionStorage.setItem("nordInquiryDetails", brief);
    } catch {
      validation.textContent = "Не удалось безопасно передать вводные. Перейдите к консультации и опишите задачу вручную.";
      return;
    }

    const contactUrl = new URL("index.html", window.location.href);
    contactUrl.searchParams.set("topic", "Подбор оборудования по задаче");
    contactUrl.hash = "contacts";
    document.querySelector("#selection-contact").href = contactUrl.href;

    selectionWizard.hidden = true;
    selectionResult.hidden = false;
    stepCount.textContent = "Вводные готовы";
    progress.setAttribute("aria-valuenow", String(steps.length));
    progressFill.style.width = "100%";
    document.querySelector("#result-heading").focus();
  }

  nextButton.addEventListener("click", () => {
    if (!answers[currentStep]) {
      validation.textContent = "Выберите вариант или пропустите этот вопрос.";
      skipButton.focus();
      return;
    }

    if (currentStep === steps.length - 1) {
      showResult();
      return;
    }

    goToStep(currentStep + 1);
  });

  skipButton.addEventListener("click", () => {
    answers[currentStep] = null;
    if (currentStep === steps.length - 1) {
      showResult();
      return;
    }
    goToStep(currentStep + 1);
  });

  backButton.addEventListener("click", () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  });

  editButton.addEventListener("click", () => goToStep(steps.length - 1));
  renderStep();
}

const orderForm = document.querySelector("#order-form");
const orderReview = document.querySelector("#order-review");

if (orderForm && orderReview) {
  const orderStatus = document.querySelector("#order-status");
  const orderDraft = document.querySelector("#order-draft");
  const reviewHeading = document.querySelector("#review-heading");
  const copyButton = document.querySelector("#copy-order-draft");
  const copyStatus = document.querySelector("#copy-status");
  const editButton = document.querySelector("#edit-order");
  const requiredFields = [
    {
      input: orderForm.elements.name,
      error: "Укажите имя не короче двух символов.",
      isInvalid: (input) => input.value.trim().length < 2,
    },
    {
      input: orderForm.elements.phone,
      error: "Укажите номер телефона: от 10 до 15 цифр.",
      isInvalid: (input) => {
        const digits = input.value.replace(/\D/g, "");
        return digits.length < 10 || digits.length > 15;
      },
    },
  ];

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    orderStatus.textContent = "";
    let firstInvalid = null;

    requiredFields.forEach(({ input, error, isInvalid }) => {
      const invalid = isInvalid(input);
      const errorMessage = orderForm.querySelector(`[data-error-for="${input.id}"]`);
      input.setAttribute("aria-invalid", String(invalid));
      errorMessage.textContent = invalid ? error : "";
      if (invalid && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const name = orderForm.elements.name.value.trim();
    const phone = orderForm.elements.phone.value.trim();
    const city = orderForm.elements.city.value.trim();
    const quantity = orderForm.elements.quantity.value;
    const comment = orderForm.elements.comment.value.trim();
    const draft = [
      "Запрос условий покупки — Nord",
      "Позиция: окрасочный аппарат RT-8990 (демонстрационная модель, требует подтверждения)",
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Город: ${city || "не указан"}`,
      `Количество: ${quantity}`,
      `Вопрос или деталь: ${comment || "не указаны"}`,
      "",
      "Прошу уточнить актуальную цену, наличие, характеристики, комплектацию и возможные условия доставки. Данные в черновике не подтверждены.",
    ].join("\n");

    orderDraft.value = draft;
    orderForm.hidden = true;
    orderReview.hidden = false;
    copyStatus.textContent = "";
    reviewHeading.focus();
  });

  orderForm.addEventListener("input", (event) => {
    const field = requiredFields.find(({ input }) => input === event.target);
    if (field) {
      event.target.removeAttribute("aria-invalid");
      orderForm.querySelector(`[data-error-for="${event.target.id}"]`).textContent = "";
    }
    orderStatus.textContent = "";
  });

  editButton.addEventListener("click", () => {
    orderReview.hidden = true;
    orderForm.hidden = false;
    copyStatus.textContent = "";
    orderForm.elements.name.focus();
  });

  copyButton.addEventListener("click", async () => {
    copyStatus.textContent = "";
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(orderDraft.value);
      copyStatus.textContent = "Черновик скопирован. Он по-прежнему не отправлен и не сохранён сайтом.";
    } catch {
      orderDraft.focus();
      orderDraft.select();
      copyStatus.textContent = "Автоматическое копирование недоступно. Текст выделен: скопируйте его вручную сочетанием Ctrl+C (или ⌘C на Mac).";
    }
  });
}

const buyerChecklist = document.querySelector("#buyer-checklist");

if (buyerChecklist) {
  const checks = [...buyerChecklist.querySelectorAll('input[type="checkbox"]')];
  const count = document.querySelector("#check-count");
  const progressTitle = document.querySelector("#check-progress-title");
  const progressCopy = document.querySelector("#check-progress-copy");
  const resetButton = document.querySelector("#reset-checklist");
  const progressMessages = [
    ["Начните с главного", "Сверяйте условия и документы до оплаты. Если что-то непонятно — попросите письменное подтверждение."],
    ["Хорошее начало", "Проверьте ещё несколько пунктов, особенно итоговую сумму и точный состав оборудования."],
    ["Половина пути", "Не торопитесь с оплатой, пока не ясны доставка, документы и совместимость."],
    ["Уже многое ясно", "Осталось проверить оставшиеся условия и сохранить подтверждения от продавца."],
    ["Почти всё проверено", "Убедитесь, что договорённости зафиксированы письменно, а модель и комплект совпадают."],
    ["Последняя проверка", "Проверьте финальный пункт и сохраните документы о покупке и гарантии."],
    ["Всё проверено", "Отлично. Сохраните письменные условия, чек и документы на оборудование."],
  ];

  function updateChecklist() {
    const completed = checks.filter((check) => check.checked).length;
    count.textContent = String(completed);
    progressTitle.textContent = progressMessages[completed][0];
    progressCopy.textContent = progressMessages[completed][1];
  }

  checks.forEach((check) => check.addEventListener("change", updateChecklist));
  resetButton.addEventListener("click", () => {
    checks.forEach((check) => {
      check.checked = false;
    });
    updateChecklist();
    checks[0].focus();
  });
  updateChecklist();
}

const resourceGrid = document.querySelector("#resource-grid");

if (resourceGrid) {
  const cards = [...resourceGrid.querySelectorAll("[data-resource-card]")];
  const searchInput = document.querySelector("#resource-search-input");
  const filterButtons = [...document.querySelectorAll("[data-resource-filter]")];
  const resultStatus = document.querySelector("#resource-results");
  const emptyMessage = document.querySelector("#resource-empty");
  let activeFilter = "all";

  function updateResources() {
    const query = searchInput.value.trim().toLocaleLowerCase("ru");
    let visibleCount = 0;

    cards.forEach((card) => {
      const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
      const searchText = `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase("ru");
      const searchMatches = !query || searchText.includes(query);
      const visible = categoryMatches && searchMatches;
      card.hidden = !visible;
      if (!visible) card.querySelector("details").open = false;
      if (visible) visibleCount += 1;
    });

    resultStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "материал" : visibleCount > 1 && visibleCount < 5 ? "материала" : "материалов"}`;
    emptyMessage.hidden = visibleCount !== 0;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.resourceFilter;
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      updateResources();
    });
  });

  searchInput.addEventListener("input", updateResources);
  updateResources();
}

const tecnoverGrid = document.querySelector("#tecnover-grid");

document.querySelectorAll(".avito-gallery").forEach((gallery) => {
  const mainImage = gallery.querySelector(".avito-main-photo img");
  const galleryButtons = [...gallery.querySelectorAll("[data-listing-image]")];
  if (!mainImage) return;
  galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      mainImage.src = button.dataset.listingImage;
      mainImage.alt = button.dataset.listingAlt;
      galleryButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    });
  });
});

if (tecnoverGrid) {
  const cards = [...tecnoverGrid.querySelectorAll("[data-tecnover-card]")];
  const filterButtons = [...document.querySelectorAll("[data-tecnover-filter]")];
  const resultCount = document.querySelector("#tecnover-result-count");
  let activeFilter = "all";

  function updateTecnoverCards() {
    let visibleCount = 0;

    cards.forEach((card) => {
      const isVisible = activeFilter === "all" || card.dataset.drive === activeFilter;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    const remainder = visibleCount % 100;
    const lastDigit = visibleCount % 10;
    const noun = remainder >= 11 && remainder <= 14
      ? "моделей"
      : lastDigit === 1
        ? "модель"
        : lastDigit >= 2 && lastDigit <= 4
          ? "модели"
          : "моделей";
    resultCount.textContent = `${visibleCount} ${noun}`;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.tecnoverFilter;
      filterButtons.forEach((item) => {
        const isSelected = item === button;
        item.classList.toggle("is-active", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
      });
      updateTecnoverCards();
    });
  });

  updateTecnoverCards();
}
