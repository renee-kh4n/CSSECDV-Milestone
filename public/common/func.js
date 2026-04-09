document.addEventListener('DOMContentLoaded', () => {
	const phoneInput = document.getElementById('phoneNumber');
	if (phoneInput) {
		phoneInput.addEventListener('input', () => {
			phoneInput.value = phoneInput.value.replace(/\D/g, '');
		});
	}

	const ratingStars = document.querySelectorAll('.rating-stars-view');
	ratingStars.forEach((starElement) => {
		const ratingValue = Number(starElement.dataset.rating || 0);
		const clampedRating = Math.max(0, Math.min(5, ratingValue));
		const fillPercentage = (clampedRating / 5) * 100;
		starElement.style.setProperty('--fill-percentage', `${fillPercentage}%`);
	});
});
