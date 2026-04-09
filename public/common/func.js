document.addEventListener('DOMContentLoaded', () => {
	const phoneInput = document.getElementById('phoneNumber');
	if (phoneInput) {
		phoneInput.addEventListener('input', () => {
			phoneInput.value = phoneInput.value.replace(/\D/g, '');
		});
	}

	const ratingInputs = document.querySelectorAll(
		'form[action*="/rating/"] input[type="radio"][name="rating"]'
	);
	ratingInputs.forEach((input) => {
		input.addEventListener('change', () => {
			if (input.form) {
				input.form.submit();
			}
		});
	});
});
