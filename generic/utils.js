function createProfileHeaderButton(text, svgString = null) {
    const button = document.createElement('button');
    button.className = "px-2 py-1 border rounded-full border-neutral-600 bg-ft-gray right-4";

    const flexWrapper = document.createElement('div');
    flexWrapper.classList.add('text-sm', 'flex', 'flex-row', 'items-center', 'gap-1');

	if (svgString) {
		const iconSpan = document.createElement('span');
		iconSpan.classList.add('flex', 'items-center', 'justify-center');
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
		const svgElement = svgDoc.documentElement;

		iconSpan.appendChild(svgElement);
		flexWrapper.appendChild(iconSpan);
	}

    const textDiv = document.createElement('div');
    textDiv.classList.add('drop-shadow-md');
    textDiv.textContent = text;

    flexWrapper.appendChild(textDiv);
    button.appendChild(flexWrapper);

    return button;
}

async function getOrCreateButtonContainer () {
	let container = document.getElementById('betterintra-button-container');
    if (container) return container;

	return new Promise((resolve) => {
        const observer = new MutationObserver((mutations, obs) => {
            const profileHeaderTop = document.querySelector('.border.border-neutral-600.bg-ft-gray\\/50.relative');
            const loginLocationBadge = document.querySelector('.absolute.top-2.right-4');

            if (profileHeaderTop && loginLocationBadge) {
                obs.disconnect();

                // Double check it wasn't created by another script in the meantime
                container = document.getElementById('betterintra-button-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'betterintra-button-container';
                    container.classList.add('right-4', 'absolute');
					container.style.display = 'flex';
					const offset = loginLocationBadge.offsetHeight + 16;
					container.style.marginTop = `${offset}px`;
					profileHeaderTop.appendChild(container);
                }
                resolve(container);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}
