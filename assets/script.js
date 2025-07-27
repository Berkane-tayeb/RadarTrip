/**
 * Aventura - Travel Activities Website
 * Bilingual (FR/EN) JavaScript File
 */

document.addEventListener('DOMContentLoaded', async function() {
    // ======================
    // LANGUAGE CONFIGURATION
    // ======================
    const currentLang = document.documentElement.lang || 'fr';
    const translations = {
        activitiesAvailable: {
            fr: "Activités disponibles à",
            en: "Available activities in"
        },
        detectedLocation: {
            fr: "Nous avons détecté que vous cherchez des activités à",
            en: "We detected you're looking for activities in"
        },
        searchPlaceholder: {
            fr: "Ex: Paris, New York...",
            en: "E.g.: Paris, New York..."
        },
        searchLabel: {
            fr: "Recherchez votre destination :",
            en: "Search your destination:"
        }
    };

    // Chargement des données des villes
    let cityData = [];
    try {
        const response = await fetch('../assets/cityData.json');
        if (!response.ok) throw new Error('Erreur de chargement des données');
        cityData = await response.json();
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        // Vous pourriez mettre ici un fallback ou un message d'erreur
        cityData = []; // Tableau vide en cas d'erreur
    }

    // =================
    // MOBILE MENU TOGGLE
    // =================
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ================
    // SMOOTH SCROLLING
    // ================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =============
    // STICKY HEADER
    // =============
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        }
    });

    // =====================
    // CITY SEARCH SYSTEM
    // =====================

    // Initialize city search system
    function initCitySearch() {
    const searchInput = document.getElementById('city-search');
    const datalist = document.getElementById('city-options');
    const selectedCityDisplay = document.getElementById('selected-city');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput || !datalist || !selectedCityDisplay || !searchBtn) return;

    // Set localized placeholder and label
    searchInput.placeholder = translations.searchPlaceholder[currentLang];
    const label = document.querySelector('.city-selector label');
    if (label) {
        label.textContent = translations.searchLabel[currentLang];
    }

    // Remplir la datalist
    cityData.forEach(city => {
        const option = document.createElement('option');
        option.value = city.name[currentLang] || city.name.fr;
        option.dataset.id = city.id;
        datalist.appendChild(option);
    });

    // Afficher la ville correspondante au fur et à mesure (optionnel)
    searchInput.addEventListener('input', function () {
        const inputValue = this.value.trim().toLowerCase();
        const matchedCity = findCityMatch(inputValue);
        if (matchedCity) {
        const cityName = matchedCity.name[currentLang] || matchedCity.name.fr;
        selectedCityDisplay.textContent = `${translations.activitiesAvailable[currentLang]} ${cityName}`;
        } else {
        selectedCityDisplay.textContent = '';
        }
    });

    // Lancer la recherche uniquement au clic sur le bouton
    searchBtn.addEventListener('click', () => {
        const inputValue = searchInput.value.trim().toLowerCase();
        const matchedCity = findCityMatch(inputValue);
        if (matchedCity) {
        loadActivitiesForCity(matchedCity);
        } else {
        selectedCityDisplay.textContent = translations.cityNotFound[currentLang] || "City not found.";
        }
    });

    detectFromURL();
    }

    // Find city match based on search input
    function findCityMatch(query) {
        const lowerQuery = query.toLowerCase();
        
        return cityData.find(city => 
            // Recherche dans les noms
            city.name.fr.toLowerCase().includes(lowerQuery) || 
            city.name.en.toLowerCase().includes(lowerQuery) ||
            
            // Recherche dans les mots-clés français/anglais
            city.keywords.fr.some(kw => kw.includes(lowerQuery)) ||
            city.keywords.en.some(kw => kw.includes(lowerQuery)) ||
            
            // Recherche dans les codes postaux
            (city.keywords.postal && city.keywords.postal.some(cp => cp.includes(lowerQuery)))
        );
    }

    // Detect city from URL parameters
    function detectFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q') || urlParams.get('city') || urlParams.get('destination');
        
        if (searchQuery) {
            const matchedCity = findCityMatch(searchQuery);
            if (matchedCity) {
                const searchInput = document.getElementById('city-search');
                const selectedCityDisplay = document.getElementById('selected-city');
                
                if (searchInput && selectedCityDisplay) {
                    const cityName = matchedCity.name[currentLang] || matchedCity.name.fr;
                    searchInput.value = cityName;
                    selectedCityDisplay.textContent = 
                        `${translations.detectedLocation[currentLang]} ${cityName}`;
                    
                    loadActivitiesForCity(matchedCity);
                }
            }
        }
    }

   function loadActivitiesForCity(city) {
        console.log(`Loading activities for city: ${city} (${currentLang})`);
        // URL du widget à insérer (tu peux en avoir différentes selon la ville)
        const cityId = city.cityId;
        insertBookingWidget(cityId);
    }

    // Fonction qui insère dynamiquement le widget
    function insertBookingWidget(cityId) {
        const widgetUrl = `https://tpwgt.com/content?currency=EUR&trs=424715&shmarker=638937.638937&language=${currentLang}&locale=${cityId}&layout=responsive&cards=14&powered_by=true&campaign_id=89&promo_id=3947`;
        // 1. Sélectionner la div existante
        const container = document.querySelector('.booking-widget');
        if (!container) return;

        // 2. Nettoyer son contenu et retirer la classe visible pour relancer l'effet
        container.innerHTML = '';
        container.classList.remove('visible');

        // 3. Créer le script
        const scriptElement = document.createElement('script');
        scriptElement.async = true;
        scriptElement.src = widgetUrl;
        scriptElement.charset = 'utf-8';

        // 4. Ajouter le script dans la div
        container.appendChild(scriptElement);

        // 5. Déclencher l'effet d'apparition après un reflow
        void container.offsetWidth; // force le reflow pour réinitialiser la transition

        // 6. Ajouter la classe pour déclencher le fade-in
        container.classList.add('visible');
    }

    // =============
    // INITIALIZATION
    // =============
    initCitySearch();

    // Analytics event tracking
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function() {
            console.log(`CTA clicked: ${this.textContent.trim()}`);
            // In production: send to analytics (Google Analytics, etc.)
        });
    });
});