/* ==========================================================
   Zumi landing page — tương tác
   ========================================================== */

const root = document.documentElement;
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Nút đổi giao diện sáng / tối ---------- */
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Đổi sang giao diện sáng" : "Đổi sang giao diện tối"
  );
}

const savedTheme = localStorage.getItem("zumi-theme");
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("zumi-theme", next);
});

/* ---------- 2. Menu trên điện thoại ---------- */
const burger = document.getElementById("nav-burger");
const navLinks = document.getElementById("nav-links");

burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
});

navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
});

/* ---------- 3. Làm hiện dần từng khối khi cuộn tới ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      entry.target.style.transitionDelay = `${Math.min(i * 90, 360)}ms`;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- 4. Đếm số tăng dần trong khối thống kê ---------- */
function formatCount(value, decimals) {
  return value.toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function countUp(el) {
  const target = Number(el.dataset.countTo);
  const decimals = Number(el.dataset.decimals || 0);
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = formatCount(target * eased, decimals) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }

  if (prefersReduced) {
    el.textContent = formatCount(target, decimals) + suffix;
    return;
  }
  requestAnimationFrame(frame);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      statsObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll("[data-count-to]").forEach((el) => statsObserver.observe(el));

/* ---------- 5. Thẻ demo: tự tích tiến độ rồi reset ---------- */
const progressFill = document.getElementById("demo-progress-fill");
const progressText = document.getElementById("demo-progress-text");
const leftPill = document.getElementById("demo-left-pill");
const demoTasks = [...document.querySelectorAll(".task")];

function setTaskDone(index, done) {
  demoTasks[index].classList.toggle("is-done", done);
  demoTasks[index].querySelector(".task-check").textContent = done ? "✓" : "";
}

function updateProgress(doneCount) {
  const percent = Math.round((doneCount / demoTasks.length) * 100);
  const left = demoTasks.length - doneCount;
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
  leftPill.textContent = left > 0 ? `Còn ${left} nhiệm vụ` : "Hoàn thành! 🎉";
}

let demoStep = 1;
if (!prefersReduced) {
  setInterval(() => {
    setTaskDone(demoStep, true);
    demoStep += 1;
    if (demoStep >= demoTasks.length) {
      setTimeout(() => {
        demoTasks.forEach((_, i) => setTaskDone(i, i === 0));
        demoStep = 1;
        updateProgress(1);
      }, 2600);
    }
    updateProgress(demoTasks.filter((t) => t.classList.contains("is-done")).length);
  }, 3200);
}

/* ---------- 6. Di chuyển nhẹ theo con trỏ trong hero ---------- */
const heroStage = document.querySelector(".hero-stage");
const floaters = heroStage ? [...heroStage.querySelectorAll("[data-depth]")] : [];

if (!prefersReduced && floaters.length && window.matchMedia("(hover: hover)").matches) {
  heroStage.addEventListener("pointermove", (event) => {
    const rect = heroStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    floaters.forEach((el) => {
      const depth = Number(el.dataset.depth);
      el.style.setProperty("--px", (x * depth * 26).toFixed(1));
      el.style.setProperty("--py", (y * depth * 26).toFixed(1));
    });
  });

  heroStage.addEventListener("pointerleave", () => {
    floaters.forEach((el) => {
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    });
  });
}

/* ---------- 7. Nút lên đầu trang ---------- */
const toTop = document.getElementById("to-top");

window.addEventListener(
  "scroll",
  () => toTop.classList.toggle("is-on", window.scrollY > 600),
  { passive: true }
);

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" }));

/* ---------- 8. Form đăng ký ---------- */
const form = document.getElementById("signup-form");
const emailInput = document.getElementById("email");
const formMsg = document.getElementById("form-msg");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = emailInput.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

  if (!valid) {
    formMsg.textContent = "Bạn kiểm tra lại email nhé!";
    formMsg.style.color = "#ffe08a";
    emailInput.focus();
    return;
  }

  formMsg.textContent = `Xong! Nhiệm vụ đầu tiên sẽ tới ${value} vào 19:00.`;
  formMsg.style.color = "#d6ffe9";
  form.reset();
});

/* ---------- 9. Thu thập ý kiến (lưu vào localStorage) ---------- */
const FB_KEY = "zumi-feedback";
const FB_MAX = 240;
const fbForm = document.getElementById("feedback-form");
const fbName = document.getElementById("fb-name");
const fbText = document.getElementById("fb-text");
const fbCount = document.getElementById("fb-count");
const fbMsg = document.getElementById("fb-msg");
const fbList = document.getElementById("feedback-list");
const fbTotal = document.getElementById("fb-total");
const avatarColors = ["avatar-pink", "avatar-green", "avatar-blue", "avatar-yellow", "avatar-dark"];

function loadFeedback() {
  try {
    const saved = JSON.parse(localStorage.getItem(FB_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveFeedback(items) {
  localStorage.setItem(FB_KEY, JSON.stringify(items));
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderFeedback() {
  const items = loadFeedback();
  fbList.textContent = "";
  fbTotal.textContent = items.length === 0 ? "Chưa có ý kiến nào" : `${items.length} ý kiến đã góp`;

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "fb-empty";
    empty.textContent = "Bạn là người đầu tiên góp ý nhé.";
    fbList.append(empty);
    return;
  }

  items.forEach((item, i) => {
    const card = document.createElement("li");
    card.className = "card fb-card";

    const head = document.createElement("div");
    head.className = "fb-head";

    const avatar = document.createElement("span");
    avatar.className = `avatar ${avatarColors[i % avatarColors.length]}`;
    avatar.textContent = (item.name || "?").trim().charAt(0).toUpperCase();

    const meta = document.createElement("p");
    meta.className = "fb-meta";
    meta.textContent = item.name || "Bạn đọc";
    const time = document.createElement("span");
    time.className = "fb-time";
    time.textContent = formatTime(item.at);
    meta.append(time);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "fb-del";
    remove.setAttribute("aria-label", "Xoá ý kiến này");
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      saveFeedback(loadFeedback().filter((_, index) => index !== i));
      renderFeedback();
    });

    const body = document.createElement("p");
    body.className = "fb-text";
    body.textContent = item.text;

    head.append(avatar, meta, remove);
    card.append(head, body);
    fbList.append(card);
  });
}

fbText.addEventListener("input", () => {
  const used = fbText.value.length;
  fbCount.textContent = `${used}/${FB_MAX}`;
  fbCount.classList.toggle("is-near", used > FB_MAX - 30);
});

fbForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = fbText.value.trim();

  if (text.length < 4) {
    fbMsg.textContent = "Bạn viết thêm một chút nhé, tối thiểu 4 chữ.";
    fbMsg.className = "form-msg is-err";
    fbText.focus();
    return;
  }

  const items = loadFeedback();
  items.unshift({
    name: fbName.value.trim().slice(0, 40),
    text: text.slice(0, FB_MAX),
    at: new Date().toISOString(),
  });
  saveFeedback(items);

  fbForm.reset();
  fbCount.textContent = `0/${FB_MAX}`;
  fbCount.classList.remove("is-near");
  fbMsg.textContent = "Cảm ơn bạn! Ý kiến đã được lưu trên máy này.";
  fbMsg.className = "form-msg is-ok";
  renderFeedback();
});

renderFeedback();
