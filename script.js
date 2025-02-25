// Constants
const SAVED_IMAGES_KEY = 'savedImages';
const RANDOM_PROMPTS = [
    'A magical forest with glowing mushrooms and fairy lights',
    'A futuristic cyberpunk city at night with neon lights',
    'A serene Japanese garden with cherry blossoms',
    'An underwater city with bioluminescent creatures',
    'A steampunk airship flying through clouds at sunset',
    'A cosmic scene with colorful nebulas and galaxies',
    'A mystical ancient temple hidden in mountains',
    'A surreal floating island with waterfalls',
    'A crystal cave with magical gemstones',
    'An enchanted library with floating books'
];

// Load saved images from local storage
const loadSavedImages = () => {
    try {
        return JSON.parse(localStorage.getItem(SAVED_IMAGES_KEY)) || [];
    } catch (error) {
        console.error('Error loading saved images:', error);
        return [];
    }
};

// Delete image from saved images
const deleteImage = (imageUrl) => {
    try {
        const savedImages = loadSavedImages();
        const updatedImages = savedImages.filter(img => img.url !== imageUrl);
        localStorage.setItem(SAVED_IMAGES_KEY, JSON.stringify(updatedImages));
        renderSavedImages();
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

// Render saved images section
const renderSavedImages = () => {
    const galleryGrid = document.querySelector('#gallery-grid');
    if (!galleryGrid) return;

    const savedImages = loadSavedImages();
    galleryGrid.innerHTML = '';

    savedImages.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.prompt || 'Generated image';

        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.onclick = () => deleteImage(image.url);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '💾 Download';
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `generated-image-${Date.now()}.png`;
            link.click();
        };

        overlay.appendChild(deleteBtn);
        overlay.appendChild(downloadBtn);
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        galleryGrid.appendChild(galleryItem);
    });
};

// Save image to local storage
const saveImageToStorage = (imageUrl, prompt) => {
    try {
        const savedImages = loadSavedImages();
        savedImages.unshift({ url: imageUrl, prompt, timestamp: Date.now() });
        localStorage.setItem(SAVED_IMAGES_KEY, JSON.stringify(savedImages));
        renderSavedImages();
    } catch (error) {
        console.error('Error saving image:', error);
    }
};

// Function to get random prompt
const getRandomPrompt = () => {
    return RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
};

// Function to generate image URL
const generateImageUrl = (prompt) => {
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}`;
};

// Function to create gallery item
const createGalleryItem = (imageUrl, prompt, timestamp) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item loading';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = prompt;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    // Add prompt text display
    const promptText = document.createElement('div');
    promptText.className = 'prompt-text';
    promptText.textContent = prompt;

    // Add watermark
    const watermark = document.createElement('div');
    watermark.className = 'watermark';
    watermark.textContent = 'Creativ';

    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '<i class="ri-save-line"></i> Save';
    saveBtn.onclick = () => saveImageToStorage(imageUrl, prompt);

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '<i class="ri-delete-bin-line"></i> Remove';
    removeBtn.onclick = () => deleteImage(imageUrl);

    overlay.appendChild(saveBtn);
    galleryItem.appendChild(img);
    galleryItem.appendChild(promptText);
    galleryItem.appendChild(watermark);
    galleryItem.appendChild(overlay);

    img.onload = () => {
        galleryItem.classList.remove('loading');
        // Auto-save the image when it's generated
        saveImageToStorage(imageUrl, prompt);
    };

    return galleryItem;
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const galleryGrid = document.getElementById('gallery-grid');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        // Close menu when clicking on a link
        const navLinksElements = navLinks.querySelectorAll('a');
        navLinksElements.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    if (promptInput && generateBtn && galleryGrid) {
        // Add random prompt button first
        const randomBtn = document.createElement('button');
        randomBtn.className = 'add-btn';
        randomBtn.textContent = 'Random';
        randomBtn.style.marginLeft = '0.5rem';
        generateBtn.parentNode.insertBefore(randomBtn, generateBtn.nextSibling);

        // Update generate button icon based on input state
        const updateGenerateButton = () => {
            const hasInput = promptInput.value.trim().length > 0;
            generateBtn.innerHTML = hasInput ? '<i class="ri-magic-line"></i> Generate' : '<i class="ri-image-add-line"></i> Generate';
            randomBtn.style.display = hasInput ? 'none' : 'inline-block';
        };

        promptInput.addEventListener('input', updateGenerateButton);
        updateGenerateButton(); // Initial state

        // Function to generate image
        const generateImage = () => {
            const prompt = promptInput.value.trim();
            if (!prompt) {
                alert('Please enter a prompt to generate an image');
                return;
            }
        
            const imageUrl = generateImageUrl(prompt);
            const galleryItem = createGalleryItem(imageUrl, prompt);
        
            // Add loading spinner
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading-spinner';
            galleryItem.appendChild(loadingSpinner);
        
            // Insert the new image at the beginning of the gallery
            galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
        
            // Clear the input
            promptInput.value = '';
            updateGenerateButton(); // Update button state after clearing input
        };

        // Event listeners
        randomBtn.addEventListener('click', () => {
            promptInput.value = getRandomPrompt();
            updateGenerateButton(); // Update button state after setting random prompt
        });

        generateBtn.addEventListener('click', generateImage);

        // Load saved images
        renderSavedImages();
    }
});