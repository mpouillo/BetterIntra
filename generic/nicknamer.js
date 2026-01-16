async function runNicknamer() {
    const data = await DataStorage.getFeature('nicknamer');
    if (data.settings?.enabled === false) return;

    await displayNicknames();

    const observer = new MutationObserver(async (mutations, obs) => {
        if (observer._busy) return;

        const profileNameElement = document.querySelector('.text-2xl');
        const emailElement = document.querySelector('a[class*="decoration-[hsl(var(--legacy-main)"][href*="mailto:"]');

        if (profileNameElement && emailElement && !profileNameElement.dataset.trueName) {
            observer._busy = true;
            profileNameElement.dataset.trueName = profileNameElement.textContent;
            const currentPageUserLogin = emailElement.textContent.split('@')[0];
            await updateProfileNameElement(profileNameElement, currentPageUserLogin).then(() => {
                displayNicknames().then(() => {
                    observer._busy = false;
                });
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

async function displayNicknames() {
    const data = await DataStorage.getFeature('nicknamer');
    const nicknames = data.nicknames || {};

    Object.entries(nicknames).forEach(([login, nickname]) => {
        if (!login) return;

        const escapedLogin = login.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(`(?<!\\(\\s*)\\b${escapedLogin}\\b(?!\\s*\\(${escapedLogin}\\))`, 'g');
        const newText = `${nickname} (${login})`;

        document.querySelectorAll(`.nicknamer-done[data-login="${login}"]`).forEach(el => {
            if (el.textContent !== newText) {
                el.textContent = newText;
            }
        });

        findAndReplaceDOMText(document.body, {
            find: searchRegex,
            replace: newText,
            preset: 'prose',
            filterElements: function(el) {
                const profileHeader = '.md\\:px-8.py-4.w-full.flex.flex-col.lg\\:flex-row.gap-6.md\\:gap-8';
                const pageHeader = '.w-full.top-0.fixed.z-40.pl-20.h-16';
                const isExcluded = el.classList.contains('nicknamer-done') ||
                                   el.closest(pageHeader) ||
                                   //el.closest(profileHeader) ||
                                   ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(el.tagName) ||
                                   el.isContentEditable;
                return !isExcluded;
            }
        });
    });
}

async function updateProfileNameElement(profileNameElement, currentPageUserLogin) {
    const data = await DataStorage.getFeature('nicknamer');
    const nicknames = data.nicknames || {};
    const savedName = nicknames[currentPageUserLogin];
    const trueName = profileNameElement.dataset.trueName;

    const buttonContainer = await getOrCreateButtonContainer();
    const resetIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>`;

    const buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'button-group';

    const editButton = createProfileHeaderButton("Edit name");
    const resetButton = createProfileHeaderButton("Reset name", resetIcon);

    editButton.setAttribute('id', 'nicknamer-edit-button')
    editButton.style.display = 'inline-flex';

    resetButton.setAttribute('id', 'nicknamer-reset-button');
    resetButton.classList.add('button-slide-reveal');
    resetButton.style.display = savedName ? 'inline-flex' : 'none';

    const resizeObserver = new ResizeObserver(() => {
        const width = editButton.offsetWidth;
        buttonsGroup.style.setProperty('--local-edit-width', `${width}px`);
    });

    resizeObserver.observe(editButton);

    resetButton.addEventListener('click', async () => {
        const data = await DataStorage.getFeature('nicknamer');
        let nicknames = data.nicknames || {};
        delete nicknames[currentPageUserLogin];
        await DataStorage.updateSettings('nicknamer', { nicknames: nicknames });
        resetButton.style.display = 'none';
        profileNameElement.textContent = trueName;
        profileNameElement.blur();
        resetAllNicknames
    });

    editButton.addEventListener('click', async () => {
        const range = document.createRange();
        const selection = window.getSelection()

        profileNameElement.classList.add('nicknamer-editing-active');
        profileNameElement.contentEditable = true;
        profileNameElement.focus();
        range.selectNodeContents(profileNameElement);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    });

    buttonsGroup.appendChild(resetButton);
    buttonsGroup.appendChild(editButton);
    buttonContainer.appendChild(buttonsGroup);

    profileNameElement.setAttribute('spellcheck', 'false');

    profileNameElement.addEventListener('blur', async () => {
        const newName = profileNameElement.textContent.trim();
        const data = await DataStorage.getFeature('nicknamer');
        let nicknames = data.nicknames || {};

        if (newName !== "" && newName !== trueName) {
            nicknames[currentPageUserLogin] = newName;
            await DataStorage.updateSettings('nicknamer', { nicknames: nicknames });
            profileNameElement.textContent = newName;
            resetButton.style.display = 'inline';
        } else {
            delete nicknames[currentPageUserLogin];
            await DataStorage.updateSettings('nicknamer', { nicknames: nicknames });
            profileNameElement.textContent = trueName;
            resetButton.style.display = 'none';
        }
        profileNameElement.contentEditable = false;
        profileNameElement.classList.remove('nicknamer-editing-active');

        profileNameElement.classList.remove('flash-save');
        void profileNameElement.offsetWidth;
        profileNameElement.classList.add('flash-save');
        displayNicknames();
    });

    profileNameElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            profileNameElement.blur();
        }
    });

  if (savedName) profileNameElement.textContent = savedName;
}

runNicknamer();
