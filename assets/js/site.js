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
