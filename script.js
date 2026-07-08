const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");
const whatsappNumber = "27718630218";
const defaultWhatsappMessage =
  "Hi FTAS, I would like to discuss an advisory enquiry.";
const postsFeedPath = "posts.json";
const siteUrl = "https://www.financialtechadv.co.za";

const formatPostDate = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const getPosts = async () => {
  const response = await fetch(postsFeedPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load posts");
  }

  const posts = await response.json();
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const renderInsightsPage = async () => {
  const postsList = document.querySelector("[data-posts-list]");
  if (!postsList) {
    return;
  }

  try {
    const posts = await getPosts();
    const [featuredPost, ...remainingPosts] = posts;

    postsList.replaceChildren();

    const featured = document.createElement("article");
    featured.className = "featured-post";
    featured.innerHTML = `
      <p class="post-meta">${featuredPost.type} / ${featuredPost.category}</p>
      <h2>${featuredPost.title}</h2>
      <p>${featuredPost.excerpt}</p>
      <a href="post.html?slug=${featuredPost.slug}">Read insight</a>
    `;

    const list = document.createElement("div");
    list.className = "post-list";

    remainingPosts.forEach((post) => {
      const article = document.createElement("article");
      article.innerHTML = `
        <p class="post-date">${post.type} / ${post.category} / ${formatPostDate(post.date)}</p>
        <h3><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
        <p>${post.excerpt}</p>
      `;
      list.append(article);
    });

    postsList.append(featured, list);
  } catch {
    postsList.innerHTML = `
      <article class="featured-post">
        <p class="post-meta">Insights unavailable</p>
        <h2>Insights could not be loaded.</h2>
        <p>Please refresh the page or contact FTAS directly for advisory notes.</p>
        <a href="contact.html">Contact FTAS</a>
      </article>
    `;
  }
};

const renderPostPage = async () => {
  const postPage = document.querySelector("[data-post-page]");
  if (!postPage) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const title = document.querySelector("[data-post-title]");
  const meta = document.querySelector("[data-post-meta]");
  const excerpt = document.querySelector("[data-post-excerpt]");
  const body = document.querySelector("[data-post-body]");

  try {
    const posts = await getPosts();
    const post = posts.find((item) => item.slug === slug);

    if (!post) {
      throw new Error("Post not found");
    }

    const postUrl = `${siteUrl}/post?slug=${post.slug}`;
    const postTitle = `${post.title} | FTAS`;

    document.title = postTitle;
    title.textContent = post.title;
    meta.textContent = `${post.type} / ${post.category} / ${formatPostDate(post.date)}`;
    excerpt.textContent = post.excerpt;
    document.querySelector("[data-dynamic-description]")?.setAttribute("content", post.excerpt);
    document.querySelector("[data-dynamic-canonical]")?.setAttribute("href", postUrl);
    document.querySelector("[data-dynamic-og-title]")?.setAttribute("content", postTitle);
    document.querySelector("[data-dynamic-og-description]")?.setAttribute("content", post.excerpt);
    document.querySelector("[data-dynamic-og-url]")?.setAttribute("content", postUrl);
    document.querySelector("[data-dynamic-twitter-title]")?.setAttribute("content", postTitle);
    document.querySelector("[data-dynamic-twitter-description]")?.setAttribute("content", post.excerpt);

    const articleSchema = document.createElement("script");
    articleSchema.type = "application/ld+json";
    articleSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        "@type": "Organization",
        name: "Financial Technology Advisory Services",
      },
      publisher: {
        "@type": "Organization",
        name: "Financial Technology Advisory Services",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/assets/fsa-logo.png`,
        },
      },
      mainEntityOfPage: postUrl,
      image: `${siteUrl}/assets/fintech-advisory-visual.png`,
    });
    document.head.append(articleSchema);

    body.replaceChildren(
      ...post.body.map((paragraph) => {
        const element = document.createElement("p");
        element.textContent = paragraph;
        return element;
      }),
    );
  } catch {
    title.textContent = "Insight not found.";
    meta.textContent = "Insights";
    excerpt.textContent = "The requested FTAS insight could not be loaded.";
    body.innerHTML = `
      <p>The article may have moved or the content feed may be unavailable.</p>
      <p><a href="insights.html">Return to Insights</a></p>
    `;
  }
};

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const buildWhatsappUrl = (message) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

const createWhatsappWidget = () => {
  const widget = document.createElement("aside");
  widget.className = "whatsapp-widget";
  widget.setAttribute("aria-label", "WhatsApp enquiry assistant");
  widget.innerHTML = `
    <div class="whatsapp-panel" id="whatsapp-panel" aria-hidden="true">
      <div class="whatsapp-header">
        <div class="whatsapp-avatar" aria-hidden="true">
          <img src="assets/fsa-logo.png" alt="" />
        </div>
        <div>
          <strong>FTAS Advisory</strong>
          <span>Typically replies on WhatsApp</span>
        </div>
        <button class="whatsapp-close" type="button" aria-label="Close WhatsApp chat">×</button>
      </div>

      <div class="whatsapp-body">
        <div class="chat-bubble bot">
          Hi, welcome to FTAS. What would you like help with?
        </div>
        <div class="chat-bubble bot small">
          Choose a topic and we’ll prepare a WhatsApp message for you.
        </div>

        <div class="whatsapp-options" aria-label="WhatsApp message options">
          <button type="button" data-message="Hi FTAS, I need help with regulatory strategy and readiness.">Regulatory strategy</button>
          <button type="button" data-message="Hi FTAS, I would like to discuss fintech or bank-partner integration advisory.">Integration advisory</button>
          <button type="button" data-message="Hi FTAS, I need help with risk, controls or partner lifecycle governance.">Risk & controls</button>
        </div>

        <div class="chat-bubble user" data-selected-message>
          Hi FTAS, I would like to discuss an advisory enquiry.
        </div>
      </div>

      <a class="whatsapp-start" href="${buildWhatsappUrl(defaultWhatsappMessage)}" target="_blank" rel="noopener">
        Continue on WhatsApp
      </a>
    </div>

    <button class="whatsapp-launcher" type="button" aria-expanded="false" aria-controls="whatsapp-panel" aria-label="Open WhatsApp chat">
      <span class="whatsapp-pulse" aria-hidden="true"></span>
      <span class="whatsapp-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="img" focusable="false">
          <path d="M16.03 4.35A11.52 11.52 0 0 0 6.2 21.87L4.8 27.2l5.46-1.36a11.52 11.52 0 1 0 5.77-21.49Zm0 2.06a9.46 9.46 0 0 1 8.06 14.41 9.46 9.46 0 0 1-12.95 3.08l-.38-.22-3.22.8.82-3.12-.25-.4A9.46 9.46 0 0 1 16.03 6.41Zm-4.2 4.9c-.2 0-.52.08-.8.38-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.91 1.23 3.11.15.2 2.1 3.36 5.2 4.57 2.58 1.01 3.1.81 3.66.76.56-.05 1.8-.73 2.05-1.44.25-.71.25-1.31.18-1.44-.08-.13-.28-.2-.59-.36-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.68.15-.2.3-.78.99-.95 1.19-.18.2-.35.22-.66.08-.3-.15-1.29-.47-2.46-1.5-.91-.81-1.52-1.81-1.7-2.12-.18-.3-.02-.47.13-.62.14-.14.3-.35.45-.53.15-.18.2-.3.3-.51.1-.2.05-.38-.03-.53-.08-.15-.68-1.65-.94-2.26-.25-.59-.5-.51-.68-.52h-.58Z" />
        </svg>
      </span>
      <span class="whatsapp-label">Chat</span>
    </button>
  `;

  document.body.append(widget);

  const panel = widget.querySelector(".whatsapp-panel");
  const launcher = widget.querySelector(".whatsapp-launcher");
  const closeButton = widget.querySelector(".whatsapp-close");
  const selectedMessage = widget.querySelector("[data-selected-message]");
  const startLink = widget.querySelector(".whatsapp-start");

  const setOpen = (isOpen) => {
    widget.classList.toggle("is-open", isOpen);
    launcher.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
  };

  launcher.addEventListener("click", () => {
    setOpen(!widget.classList.contains("is-open"));
  });

  closeButton.addEventListener("click", () => setOpen(false));

  widget.querySelectorAll("[data-message]").forEach((button) => {
    button.addEventListener("click", () => {
      const message = button.dataset.message || defaultWhatsappMessage;
      selectedMessage.textContent = message;
      startLink.href = buildWhatsappUrl(message);
      widget.querySelectorAll("[data-message]").forEach((option) => {
        option.classList.toggle("is-selected", option === button);
      });
    });
  });

  if (window.location.hash === "#whatsapp") {
    setOpen(true);
  }
};

createWhatsappWidget();
renderInsightsPage();
renderPostPage();
