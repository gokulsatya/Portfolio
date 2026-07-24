/* Gokul Sathiyamurthy — portfolio scripts (vanilla JS, no dependencies) */
(function () {
	"use strict";

	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- Boot preloader (state decided pre-paint in the head script) ---- */
	var boot = document.getElementById("boot");
	var bootLines = document.getElementById("boot-lines");
	if (boot && bootLines && document.documentElement.classList.contains("booting")) {
		var bootDone = false;
		var finishBoot = function () {
			if (bootDone) return;
			bootDone = true;
			try { sessionStorage.setItem("booted", "1"); } catch (e) {}
			boot.classList.add("done");
			window.setTimeout(function () {
				boot.remove();
				document.documentElement.classList.remove("booting");
			}, 520);
		};
		var lines = [
			"> init gokul.soc — portfolio v3",
			"> loading detection rules ....... 100+ [ok]",
			"> mapping ATT&CK threat hunts ... 1,000+ [ok]",
			"> access granted — welcome"
		];
		var li = 0;
		var addLine = function () {
			if (li < lines.length) {
				var d = document.createElement("div");
				if (lines[li].indexOf("[ok]") !== -1 || li === lines.length - 1) d.className = "ok";
				d.textContent = lines[li];
				bootLines.appendChild(d);
				li++;
				window.setTimeout(addLine, 230);
			} else {
				window.setTimeout(finishBoot, 380);
			}
		};
		window.setTimeout(addLine, 120);
		window.setTimeout(finishBoot, 2600); // hard safety: never trap the visitor
	} else {
		document.documentElement.classList.remove("booting");
	}

	/* ---- Cursor ring (accent that trails the native cursor) ---- */
	var ring = document.getElementById("cursor-ring");
	if (ring && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
		var ringTick = false;
		var ringX = -1000, ringY = -1000;
		window.addEventListener("pointermove", function (e) {
			ringX = e.clientX; ringY = e.clientY;
			if (!ringTick) {
				ringTick = true;
				window.requestAnimationFrame(function () {
					ring.style.transform = "translate3d(" + (ringX - 17) + "px," + (ringY - 17) + "px,0)";
					ringTick = false;
				});
			}
		}, { passive: true });
		document.addEventListener("mouseover", function (e) {
			if (e.target.closest("a, button, input")) {
				ring.classList.add("grow");
			} else {
				ring.classList.remove("grow");
			}
		});
	}

	/* ---- Mobile nav toggle ---- */
	var toggle = document.querySelector(".nav-toggle");
	var nav = document.getElementById("site-nav");

	function closeNav() {
		if (nav && nav.classList.contains("open")) {
			nav.classList.remove("open");
			if (toggle) toggle.setAttribute("aria-expanded", "false");
		}
	}

	if (toggle && nav) {
		toggle.addEventListener("click", function () {
			var open = nav.classList.toggle("open");
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && nav.classList.contains("open")) {
				closeNav();
				toggle.focus();
			}
		});

		document.addEventListener("click", function (e) {
			if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
		});

		// Single-page anchors: collapse the menu after picking a section
		nav.addEventListener("click", function (e) {
			if (e.target.closest("a")) closeNav();
		});
	}

	/* ---- Scroll progress bar ---- */
	var progress = document.getElementById("progress");
	if (progress) {
		var ticking = false;
		var updateProgress = function () {
			var doc = document.documentElement;
			var max = doc.scrollHeight - doc.clientHeight;
			var ratio = max > 0 ? (window.scrollY || doc.scrollTop) / max : 0;
			progress.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
			ticking = false;
		};
		window.addEventListener("scroll", function () {
			if (!ticking) {
				ticking = true;
				window.requestAnimationFrame(updateProgress);
			}
		}, { passive: true });
		updateProgress();
	}

	/* ---- Cursor spotlight (mouse-only; CSS gates visibility) ---- */
	var spot = document.getElementById("spotlight");
	if (spot && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
		var spotTick = false;
		var sx = -1000, sy = -1000;
		window.addEventListener("pointermove", function (e) {
			sx = e.clientX; sy = e.clientY;
			if (!spotTick) {
				spotTick = true;
				window.requestAnimationFrame(function () {
					spot.style.transform = "translate3d(" + (sx - 320) + "px," + (sy - 320) + "px,0)";
					spotTick = false;
				});
			}
		}, { passive: true });
	}

	/* ---- Scrollspy + quest log (nav checkmarks) ---- */
	var sections = document.querySelectorAll("main section[id]");
	var navLinks = {};
	if (nav) {
		nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
			navLinks[a.getAttribute("href").slice(1)] = a;
		});
	}
	if (sections.length && Object.keys(navLinks).length && "IntersectionObserver" in window) {
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				var link = navLinks[entry.target.id];
				if (!link) return;
				if (entry.isIntersecting) {
					Object.keys(navLinks).forEach(function (id) {
						navLinks[id].classList.remove("active");
						navLinks[id].removeAttribute("aria-current");
					});
					link.classList.add("active");
					link.setAttribute("aria-current", "true");
					link.classList.add("seen");
				}
			});
		}, { rootMargin: "-38% 0px -55% 0px", threshold: 0 });
		sections.forEach(function (s) { spy.observe(s); });
	}

	/* ---- Count-up stats ---- */
	var counters = document.querySelectorAll("[data-count]");
	if (counters.length) {
		var fmt = function (n) { return n.toLocaleString("en-US"); };
		var animate = function (el) {
			var target = parseInt(el.getAttribute("data-count"), 10);
			var suffix = el.getAttribute("data-suffix") || "";
			if (reduceMotion || !("IntersectionObserver" in window)) {
				el.textContent = fmt(target) + suffix;
				return;
			}
			var dur = 900;
			var start = null;
			var step = function (ts) {
				if (!start) start = ts;
				var p = Math.min((ts - start) / dur, 1);
				var eased = 1 - Math.pow(1 - p, 3);
				el.textContent = fmt(Math.round(target * eased)) + suffix;
				if (p < 1) window.requestAnimationFrame(step);
			};
			window.requestAnimationFrame(step);
		};
		if (reduceMotion || !("IntersectionObserver" in window)) {
			counters.forEach(animate);
		} else {
			var cio = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						animate(entry.target);
						cio.unobserve(entry.target);
					}
				});
			}, { threshold: 0.5 });
			counters.forEach(function (el) {
				el.textContent = "0" + (el.getAttribute("data-suffix") || "");
				cio.observe(el);
			});
		}
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
					window.setTimeout(function () {
						entry.target.style.transitionDelay = "0ms";
					}, 950);
				}
			});
		}, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

		revealEls.forEach(function (el) {
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
				typedEl.textContent = strings[0];
			} else {
				var si = 0, ci = 0, deleting = false;
				var tick = function () {
					var current = strings[si];
					if (!deleting) {
						ci++;
						typedEl.textContent = current.slice(0, ci);
						if (ci === current.length) {
							deleting = true;
							window.setTimeout(tick, 2100);
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

	/* ---- Interactive terminal ---- */
	var termInput = document.getElementById("term-input");
	var termOut = document.getElementById("term-out");
	var term = document.querySelector(".term");
	if (termInput && termOut && term) {
		var MAX_LINES = 14;

		var scrollTo = function (id) {
			var el = document.getElementById(id);
			if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
		};

		var print = function (text, cls) {
			var div = document.createElement("div");
			div.className = cls || "out";
			div.textContent = text;
			termOut.appendChild(div);
			while (termOut.children.length > MAX_LINES) {
				termOut.removeChild(termOut.firstChild);
			}
		};

		var commands = {
			help: function () {
				print("commands: whoami · skills · projects · certs · experience · contact · hire · clear");
			},
			whoami: function () {
				print("cybersecurity professional · 3+ years · SOC ops, detection engineering, threat hunting");
			},
			skills: function () {
				print("nessus · nmap · burp · splunk · defender EDR/MDR · KQL · wazuh · grassmarlin · openvas · python · powershell · bash");
				print("full list below ↓");
				scrollTo("skills");
			},
			projects: function () {
				print("TerraGuard — 20+ Terraform/AWS misconfig checks · PhishGuard — 94% phishing detection");
				scrollTo("projects");
			},
			certs: function () {
				print("SC-200 (certified) · CompTIA CySA+ (in progress)");
				scrollTo("certifications");
			},
			experience: function () {
				print("4 roles · 2021 → present · scrolling…");
				scrollTo("experience");
			},
			contact: function () {
				print("sathiyamurthygokul@gmail.com — scrolling…");
				scrollTo("contact");
			},
			hire: function () {
				print("excellent decision. routing you to contact…");
				scrollTo("contact");
			},
			sudo: function () {
				print("nice try. permission denied.");
			},
			clear: function () {
				termOut.textContent = "";
			}
		};

		term.addEventListener("click", function (e) {
			// Don't steal focus from text selection
			if (!window.getSelection().toString()) termInput.focus({ preventScroll: true });
		});

		termInput.addEventListener("keydown", function (e) {
			if (e.key !== "Enter") return;
			var raw = termInput.value.trim();
			termInput.value = "";
			if (!raw) return;
			print("$ " + raw, "cmd");
			var cmd = raw.toLowerCase().split(/\s+/)[0];
			if (commands[cmd]) {
				commands[cmd]();
			} else {
				print("command not found: " + cmd + " — try 'help'");
			}
		});
	}
})();
