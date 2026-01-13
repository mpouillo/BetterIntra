async function startExtension() {

    const urlPath = window.location.pathname;

    const data = await browser.storage.local.get('enabled');
    if (data.enabled === false) return;

    const observer = new MutationObserver((mutations, obs) => {
        const profileName = document.querySelector('.text-2xl');
        
        if (profileName) {
            obs.disconnect();

            const originalName = profileName.innerText;

            const container = document.createElement('div');
            profileName.parentNode.insertBefore(container, profileName);
            container.appendChild(profileName);

            const resetIcon = document.createElement('span');
            resetIcon.innerHTML = 'Reset nickname';
            resetIcon.classList.add('reset-icon');
            resetIcon.style.display = 'none';

            container.appendChild(resetIcon);
            
            browser.storage.local.get(urlPath).then((data) => {
                if (data[urlPath]) {
                    profileName.innerText = data[urlPath];
                    resetIcon.style.display = 'inline';
                } else {
                    resetIcon.style.display = 'none';
                }
            });

            profileName.contentEditable = true;
            profileName.setAttribute('spellcheck', 'false')

            profileName.addEventListener('blur', () => {
                const newName = profileName.innerText.trim();
                if (newName !== originalName) {
                    profileName.innerText = newName
                    browser.storage.local.set({ [urlPath]: newName });
                    resetIcon.style.display = 'inline';
                    profileName.classList.remove('flash-save');
                    void profileName.offsetWidth;
                    profileName.classList.add('flash-save');
                } else {
                    resetIcon.style.display = 'none';
                    profileName.innerText = profileName.innerText.trim();
                    browser.storage.local.remove(urlPath);
                }
            });

            resetIcon.addEventListener('click', () => {
                browser.storage.local.remove(urlPath). then(() => {
                    resetIcon.style.display = 'none';
                });
                window.location.reload();
            });

            profileName.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    profileName.blur();
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

startExtension();
