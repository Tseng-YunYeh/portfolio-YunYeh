// Micro-interactions JS pour les cartes actualités
(() => {
	const cartes = document.querySelectorAll('.carte.actualites');

	// Effet de lueur sportive qui suit la souris
	function lierEffetLueur(carte) {
		// Créer l'élément de lueur
		const lueur = document.createElement('div');
		lueur.className = 'carte-lueur';
		carte.appendChild(lueur);

		carte.addEventListener('mousemove', (e) => {
			const rect = carte.getBoundingClientRect();
			const posX = e.clientX - rect.left;
			const posY = e.clientY - rect.top;

			// Positionner la lueur sous la souris
			lueur.style.left = posX + 'px';
			lueur.style.top = posY + 'px';
			lueur.style.opacity = '1';
		});

		carte.addEventListener('mouseleave', () => {
			lueur.style.opacity = '0';
		});

		carte.addEventListener('mouseenter', () => {
			lueur.style.opacity = '1';
		});
	}

	// Observateur d'intersection pour révéler les cartes au défilement
	const observateur = new IntersectionObserver((entrees) => {
		entrees.forEach(entree => {
			if (entree.isIntersecting) {
				entree.target.classList.add('revelee');
			}
		});
	}, { threshold: 0.15 });

	// Appliquer les effets à chaque carte
	cartes.forEach(carte => {
		lierEffetLueur(carte);
		observateur.observe(carte);
	});
})();

// ========== CURSEUR SPORTIF ==========
(() => {

	// Créer le curseur
	const curseur = document.createElement('div');
	curseur.className = 'curseur';
	document.body.appendChild(curseur);

	// Suivre la souris
	document.addEventListener('mousemove', (e) => {
		curseur.style.left = e.clientX + 'px';
		curseur.style.top = e.clientY + 'px';
	});

	// Hover sur éléments cliquables
	document.querySelectorAll('a, button, .carte, .icone, .vignette, .article img, .images-laterales img').forEach(el => {
		el.addEventListener('mouseenter', () => document.body.classList.add('curseur-survol'));
		el.addEventListener('mouseleave', () => document.body.classList.remove('curseur-survol'));
	});

	// Effet au clic
	document.addEventListener('mousedown', () => document.body.classList.add('curseur-actif'));
	document.addEventListener('mouseup', () => document.body.classList.remove('curseur-actif'));
})();
