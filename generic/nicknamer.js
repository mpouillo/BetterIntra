async function start() {
    const settings = await browser.storage.local.get('enabled');
    if (settings && settings.enabled === false) return;

    setNicknames();

    const observer = new MutationObserver((mutations) => {
        const profileNameElement = document.querySelector('.text-2xl');
        const emailElement = document.querySelector('a[class*="decoration-[hsl(var(--legacy-main)"][href*="mailto:"]');
        
        if (profileNameElement && emailElement && !profileNameElement.dataset.nicknamerProcessed) {
            profileNameElement.dataset.nicknamerProcessed = "true";
            const currentPageUserLogin = emailElement.innerText.split('@')[0];
            updateProfileNameElement(profileNameElement, currentPageUserLogin);
        }
        
        observer.disconnect();
        setNicknames();
        observer.observe(document.body, { childList: true, subtree: true });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setNicknames() {
    browser.storage.local.get('nicknames').then((data) => {
        const nicknames = data.nicknames || {};

        Object.entries(nicknames).forEach(([login, nickname]) => {
            if (!login) return;

            const searchRegex = new RegExp('\\b' + escapeRegExp(login) + '\\b', 'g');
            const newText = `${nickname} (${login})`;

            document.querySelectorAll(`.nicknamer-done[data-login="${login}"]`).forEach(el => {
                if (el.innerText !== newText) {
                    el.innerText = newText;
                }
            });

            findAndReplaceDOMText(document.body, {
                find: searchRegex,
                replace: function() {
                    const el = document.createElement('span');
                    el.classList.add('nicknamer-done');
                    el.setAttribute('data-login', login);
                    el.innerText = newText;
                    return el;
                },
                preset: 'prose',
                filterElements: function(el) {
                    return !el.classList.contains('nicknamer-done') &&
                           !el.classList.contains('text-2xl') &&
                           !el.closest('a[href*="mailto:"]') &&
                           !['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(el.tagName) &&
                           !el.isContentEditable;
                }
            });
        });
    });
}

function updateProfileNameElement(profileNameElement, currentPageUserLogin) {
    const originalName = profileNameElement.innerText;

    const container = document.createElement('div');
    profileNameElement.parentNode.insertBefore(container, profileNameElement);
    container.appendChild(profileNameElement);

    const resetButton = document.createElement('span');
    resetButton.innerHTML = 'Reset nickname';
    resetButton.classList.add('reset-icon');
    resetButton.style.display = 'none';
    container.appendChild(resetButton);
    
    browser.storage.local.get('nicknames').then((data) => {
        const nicknames = data.nicknames || {};
        const savedName = nicknames[currentPageUserLogin];

        console.log("Loading nickname for " + currentPageUserLogin);
        if (savedName) {
            profileNameElement.innerText = savedName;
            resetButton.style.display = 'inline';
            console.log("Nickname loaded: " + savedName);
        } else {
            resetButton.style.display = 'none';
            console.log("No nickname found in database");
        }
    });

    profileNameElement.contentEditable = true;
    profileNameElement.setAttribute('spellcheck', 'false');

    profileNameElement.addEventListener('blur', async () => {
        const newName = profileNameElement.innerText.trim();

        const data = await browser.storage.local.get('nicknames');
        let nicknames = data.nicknames || {};

        if (newName !== "" && newName !== originalName) {
            nicknames[currentPageUserLogin] = newName;
            await browser.storage.local.set({ nicknames });
            profileNameElement.innerText = newName;
            resetButton.style.display = 'inline';
        } else {
            delete nicknames[currentPageUserLogin];
            await browser.storage.local.set({ 'nicknames': nicknames });
            profileNameElement.innerText = originalName;
            resetButton.style.display = 'none';
            window.location.reload();
        }

        profileNameElement.classList.remove('flash-save');
        void profileNameElement.offsetWidth;
        profileNameElement.classList.add('flash-save');
        setNicknames();
    });

    resetButton.addEventListener('click', async () => {
        const data = await browser.storage.local.get('nicknames');
        let nicknames = data.nicknames || {};

        delete nicknames[currentPageUserLogin];
        await browser.storage.local.set({ 'nicknames': nicknames });
        window.location.reload();
    });

    profileNameElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            profileNameElement.blur();
        }
    });
}

start();
