async function setupToggle(key, element) {
    const result = await browser.storage.local.get(key);
    element.checked = result[key]?.settings?.enabled ?? true;

    element.addEventListener('change', async () => {
        const data = await browser.storage.local.get(key);
        const featureData = data[key] || { settings: {}, nicknames: {} };
        
        featureData.settings = { 
            ...featureData.settings, 
            enabled: element.checked 
        };

        await browser.storage.local.set({ [key]: featureData });
        reloadTargetTabs();
    });
}

function reloadTargetTabs() {
    browser.tabs.query({ url: "*://*.profile-v3.intra.42.fr/*" }).then(tabs => {
        for (let tab of tabs) {
            browser.tabs.reload(tab.id);
        }
    });
}

const toggleNicknamer = document.getElementById('toggle-nicknamer');
const toggleCustomBG = document.getElementById('toggle-custombg');

if (toggleNicknamer) setupToggle('nicknamer', toggleNicknamer);
if (toggleCustomBG) setupToggle('custombg', toggleCustomBG);
