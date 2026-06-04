const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');

if (menuToggle && nav) {
	menuToggle.addEventListener('click', () => {
		const isOpen = nav.classList.toggle('open');
		menuToggle.setAttribute('aria-expanded', String(isOpen));
	});

	navLinks.forEach((link) => {
		link.addEventListener('click', () => {
			nav.classList.remove('open');
			menuToggle.setAttribute('aria-expanded', 'false');
		});
	});
}

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealItems.length) {
	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('in');
					obs.unobserve(entry.target);
				}
			});
		},
		{
			threshold: 0.15,
			rootMargin: '0px 0px -40px 0px',
		}
	);

	revealItems.forEach((item) => observer.observe(item));
} else {
	revealItems.forEach((item) => item.classList.add('in'));
}

const reserveForm = document.querySelector('.reserve-form');

if (reserveForm) {
	reserveForm.addEventListener('submit', (event) => {
		event.preventDefault();
		alert('Reservation request sent. We will contact you shortly.');
		reserveForm.reset();
	});
}
