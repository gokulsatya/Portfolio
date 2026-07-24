/* Gokul Sathiyamurthy — portfolio scripts (vanilla JS, no dependencies) */
(function () {
	"use strict";

	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- Mobile nav toggle ---- */
	var toggle = document.querySelector(".nav-toggle");
	var nav = document.getElementById("site-nav");

	if (toggle && nav) {
		toggle.addEventListener("click", function () {
			var open = nav.classList.toggle("open");
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && nav.classList.contains("open")) {
				nav.classList.remove("open");
				toggle.setAttribute("aria-expanded", "false");
				toggle.focus();
			}
		});

		document.addEventListener("click", function (e) {
			if (
				nav.classList.contains("open") &&
				!nav.contains(e.target) &&
				!toggle.contains(e.target)
			) {
				nav.classList.remove("open");
				toggle.setAttribute("aria-expanded", "false");
			}
		});
	}

	/* ---- Scroll reveal ----
	   Classes are added here (not in markup) so content is always visible
	   without JS and under prefers-reduced-motion. */
	if (!reduceMotion && "IntersectionObserver" in window) {
		var revealEls = document.querySelectorAll(".card, .stats li, .t-entry, .contact-list li");
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("in");
					io.unobserve(entry.target);
					// Clear the stagger delay once revealed so hover
					// transitions respond instantly afterwards.
					window.setTimeout(function () {
						entry.target.style.transitionDelay = "0ms";
					}, 950);
				}
			});
		}, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

		revealEls.forEach(function (el) {
			// Stagger siblings so grid batches cascade instead of popping at once
			var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
			el.style.transitionDelay = (idx % 6) * 55 + "ms";
			el.classList.add("reveal");
			io.observe(el);
		});
	}

	/* ---- Typed effect (hero shell prompt) ---- */
	var typedEl = document.querySelector("[data-typed]");
	if (typedEl) {
		var strings;
		try {
			strings = JSON.parse(typedEl.getAttribute("data-typed"));
		} catch (err) {
			strings = null;
		}

		if (strings && strings.length) {
			if (reduceMotion) {
				// No animation: show the first string statically.
				typedEl.textContent = strings[0];
			} else {
				var si = 0;      // string index
				var ci = 0;      // char index
				var deleting = false;

				var tick = function () {
					var current = strings[si];

					if (!deleting) {
						ci++;
						typedEl.textContent = current.slice(0, ci);
						if (ci === current.length) {
							deleting = true;
							window.setTimeout(tick, 2100); // hold full string
							return;
						}
						window.setTimeout(tick, 55 + Math.random() * 45);
					} else {
						ci--;
						typedEl.textContent = current.slice(0, ci);
						if (ci === 0) {
							deleting = false;
							si = (si + 1) % strings.length;
							window.setTimeout(tick, 350);
							return;
						}
						window.setTimeout(tick, 28);
					}
				};

				window.setTimeout(tick, 600);
			}
		}
	}
})();
