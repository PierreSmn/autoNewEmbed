(function() {
  console.log('Embed script loaded');

  window.MyVideoCarouselConfig = window.MyVideoCarouselConfig || {
    playButtonColor: '#0000FF',
    integrationId: null, // Default value, should be set by the customer
    numVideos: 5 // Default value
  };

  const supabaseUrl = 'https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/integrations';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInBpZmN4bHF3ZmZkcnFjd2dnb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMyNjY2NTYsImV4cCI6MTk4ODg0MjY1Nn0.lha9G8j7lPLVGv0IU1sAT4SzrJb0I87LfhhvQV8Tc2Q';

  async function fetchVideoIds(integrationId, numVideos) {
    try {
      const response = await fetch(`${supabaseUrl}?id=eq.${integrationId}`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.length > 0) {
        const integrationData = data[0];
        const videoIds = [];
        for (let i = 1; i <= numVideos; i++) {
          if (integrationData[`vid${i}`]) {
            videoIds.push(integrationData[`vid${i}`]);
          }
        }

        window.MyVideoCarouselConfig.desiredOrder = videoIds;
        initializeCarousel();
      } else {
        console.error('No data found for the specified integration ID');
      }
    } catch (error) {
      console.error('Error fetching video IDs:', error);
    }
  }

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initializeCarousel() {
    loadScript('https://cdn.jsdelivr.net/npm/@mux/mux-player', function() {
      console.log('Mux Player script loaded');
      checkIfAllLoaded();
    });

    loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js', function() {
      console.log('Supabase script loaded');
      checkIfAllLoaded();
    });

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://auto-new-embed.vercel.app/styles.css';
    document.head.appendChild(link);

    var customScript = document.createElement('script');
    customScript.src = 'https://auto-new-embed.vercel.app/script.js';
    customScript.async = true;
    customScript.onload = function() {
      console.log('Custom script loaded');
      if (typeof initializeVideoCarousel === 'function') {
        initializeVideoCarousel(window.MyVideoCarouselConfig);
      }
    };
    document.head.appendChild(customScript);

    var container = document.createElement('div');
    container.id = 'carousel-container';
    document.body.appendChild(container);

    var overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.id = 'fullscreen-overlay';
    document.body.appendChild(overlay);

    overlay.style.display = 'none';

    var scriptsLoaded = 0;
    function checkIfAllLoaded() {
      scriptsLoaded++;
      if (scriptsLoaded === 2) {
        initializeVideoCarousel(window.MyVideoCarouselConfig);
      }
    }
  }

  const integrationId = window.MyVideoCarouselConfig.integrationId;
  const numVideos = window.MyVideoCarouselConfig.numVideos;
  if (integrationId) {
    fetchVideoIds(integrationId, numVideos);
  } else {
    console.error('Integration ID is not specified in the configuration');
  }
})();
