async function setCustomBackground() {
    const data = await DataStorage.getFeature('background');
    if (data.settings?.enabled === false) return;

    const customImageUrl = data.image;

	if (customImageUrl) {
		const style = document.createElement('style');
		style.id = 'extension-background-override';
		style.textContent = `
			header[class*="bg-cover"] {
				background-image: url("${customImageUrl}") !important;
				background-size: cover !important;
				background-position: center !important;
			}
		`;
		document.head.appendChild(style);
		console.log("Loaded custom background: " + customImageUrl);
	}

	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'image/*';
	fileInput.style.display = 'none';
	fileInput.id = 'betterintra-background-file-input';
	document.body.appendChild(fileInput);

	fileInput.addEventListener('change', async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = async () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				const scale = Math.min(1, 1920 / img.width);
				canvas.width = img.width * scale;
				canvas.height = img.height * scale;

				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

				await DataStorage.updateSettings('background', { image: compressedBase64 });
				window.location.reload();
			};
			img.src = e.target.result;
		}
		reader.readAsDataURL(file);
	});

	const buttonContainer = await getOrCreateButtonContainer();
	const imageIconSVG = `
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
				<circle cx="8.5" cy="8.5" r="1.5"></circle>
				<polyline points="21 15 16 10 5 21"></polyline>
			</svg>`;
	const uploadButton = createProfileHeaderButton("Edit BG", imageIconSVG);

	uploadButton.setAttribute('id', 'custombg-upload-button');
	uploadButton.style.display = 'inline';

	uploadButton.addEventListener('click', () => {
		fileInput.click();
	});

	buttonContainer.appendChild(uploadButton);
}

setCustomBackground();
