function reloadTargetTabs() {
    browser.tabs.query({ url: "*://*.profile-v3.intra.42.fr/*" }).then((tabs => {
        for (let tab of tabs) {
            browser.tabs.reload(tab.id);
            console.log(`Reloading tab ID: ${tab.id}`);
        }
    }));
}

const toggle = document.getElementById('toggleMode');

browser.storage.local.get("enabled").then((result) => {
    toggle.checked = result.enabled ?? true;
});

toggle.addEventListener('change', () => {
    browser.storage.local.set({ enabled: toggle.checked });
    reloadTargetTabs();
});
