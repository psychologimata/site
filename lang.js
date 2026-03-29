(function(){
  const supportedLanguages = new Set(['el', 'en']);

  function normalizeLanguage(language){
    return supportedLanguages.has(language) ? language : 'el';
  }

  function getCurrentLanguage(){
    const url = new URL(window.location.href);
    return normalizeLanguage(url.searchParams.get('lang'));
  }

  function buildCurrentUrl(language){
    const url = new URL(window.location.href);
    if(language === 'el'){
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', language);
    }
    return url.toString();
  }

  function buildLocalizedHref(rawHref, language){
    if(!rawHref || rawHref.startsWith('#')){
      return rawHref;
    }

    const isExternalLink =
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('http://') ||
      rawHref.startsWith('https://') ||
      rawHref.startsWith('//');

    if(isExternalLink){
      return rawHref;
    }

    const [pathAndQuery, hash = ''] = rawHref.split('#');
    const [path, query = ''] = pathAndQuery.split('?');
    const searchParams = new URLSearchParams(query);

    if(language === 'el'){
      searchParams.delete('lang');
    } else {
      searchParams.set('lang', language);
    }

    const nextQuery = searchParams.toString();
    const nextHash = hash ? `#${hash}` : '';
    return `${path}${nextQuery ? `?${nextQuery}` : ''}${nextHash}`;
  }

  function updateLocalizedLinks(language){
    document.querySelectorAll('a[href]').forEach((link) => {
      const rawHref = link.getAttribute('href');
      const localizedHref = buildLocalizedHref(rawHref, language);
      if(localizedHref){
        link.setAttribute('href', localizedHref);
      }
    });
  }

  function updateSwitcherState(language){
    document.querySelectorAll('[data-lang-switcher]').forEach((switcher) => {
      switcher.querySelectorAll('[data-lang]').forEach((button) => {
        const isActive = button.dataset.lang === language;
        button.setAttribute('aria-pressed', String(isActive));
        button.classList.toggle('is-active', isActive);
      });
    });
  }

  function createLanguageController(applyLanguage){
    let currentLanguage = getCurrentLanguage();

    function setLanguage(language, options = {}){
      const nextLanguage = normalizeLanguage(language);
      const shouldUpdateUrl = options.updateUrl !== false;

      currentLanguage = nextLanguage;
      document.documentElement.lang = nextLanguage === 'en' ? 'en-GB' : 'el';
      document.documentElement.dataset.language = nextLanguage;

      if(shouldUpdateUrl){
        window.history.replaceState({}, '', buildCurrentUrl(nextLanguage));
      }

      updateLocalizedLinks(nextLanguage);
      updateSwitcherState(nextLanguage);
      applyLanguage(nextLanguage);
    }

    document.querySelectorAll('[data-lang-switcher] [data-lang]').forEach((button) => {
      button.addEventListener('click', () => {
        setLanguage(button.dataset.lang);
      });
    });

    setLanguage(currentLanguage, { updateUrl:false });

    return {
      getLanguage(){
        return currentLanguage;
      },
      setLanguage
    };
  }

  window.SiteLanguage = {
    createLanguageController
  };
})();
