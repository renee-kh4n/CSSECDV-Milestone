document.addEventListener('DOMContentLoaded', () => {
	const phoneInput = document.getElementById('phoneNumber');
	if (phoneInput) {
		phoneInput.addEventListener('input', () => {
			phoneInput.value = phoneInput.value.replace(/\D/g, '');
		});
	}
});
