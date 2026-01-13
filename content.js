async function applyChanges() {
    // Get the setting from storage
    const data = await browser.storage.local.get("enabled");
    const isEnabled = data.enabled ?? true;

    if (!isEnabled) return; // Stop here if the toggle is OFF

    const observer = new MutationObserver((mutations, obs) => {
        const profileName = document.querySelector('.text-2xl');
        const profileImage = document.querySelector('.bg-cover.rounded-full')
        
        if (profileName) {
            profileName.innerText = "Charlie Fontaine";
            obs.disconnect(); 
        } else {
            console.log("ERROR: Could not find the element on this page.");
        }

        if (profileImage) {
            newImageUrl = "https://cdn.intra.42.fr/users/f2d318c2f453ddf4a3a55e236861f717/chafonta.jpeg";
            profileImage.style.backgroundImage = `url("${newImageUrl}")`;
            obs.disconnect(); 
        } else {
            console.log("ERROR: Could not find the element on this page.");
        }
    });


    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

applyChanges();
