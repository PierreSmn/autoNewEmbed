async function initializeVideoCarousel(config) {
  console.log("Initializing Video Carousel with config:", config);

  const supabaseUrl = `https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/hostedSubs?id=in.(${config.desiredOrder.join(',')})&select=*`;
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmN4bHF3ZmZkcnFjd2dnb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMyNjY2NTYsImV4cCI6MTk4ODg0MjY1Nn0.lha9G8j7lPLVGv0IU1sAT4SzrJb0I87LfhhvQV8Tc2Q';

  let data = [];

  try {
    const response = await fetch(supabaseUrl, {
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

    data = await response.json();
    console.log('Fetched data:', data);

    data.sort((a, b) => config.desiredOrder.indexOf(a.id) - config.desiredOrder.indexOf(b.id));

    const carouselContainer = document.getElementById('carousel-container');
    carouselContainer.innerHTML = '';

    updateCarousel();

    function preloadVideo(data, index) {
      const videoContainer = document.createElement('div');
      videoContainer.className = 'fullscreen-video-container';
      videoContainer.innerHTML = `
        <mux-player
          class="fullscreen-video"
          playback-id="${data[index].playback_id}"
          metadata-video-title="${data[index].title}"
          metadata-viewer-user-id="user"
        ></mux-player>`;
      overlay.appendChild(videoContainer);
    }

    function openOverlay(startIndex) {
      const overlay = document.getElementById('fullscreen-overlay');
      overlay.innerHTML = ''; // Clear previous videos
      overlay.style.display = 'flex';

      // Preload the current and next video
      preloadVideo(data, startIndex);
      if (startIndex < data.length - 1) {
        preloadVideo(data, startIndex + 1);
      }

      setupScrollHandler(data, startIndex);
    }

    function setupScrollHandler(data, startIndex) {
      const overlay = document.getElementById('fullscreen-overlay');
      let currentIndex = startIndex;
      let isThrottled = false;

      overlay.addEventListener('scroll', () => {
        if (isThrottled) return;
        isThrottled = true;

        setTimeout(() => {
          const currentVideo = overlay.children[0];
          const nextVideo = overlay.children[1];
          const previousVideo = overlay.children[0];
          
          if (currentVideo && nextVideo) {
            const rect = nextVideo.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2) {
              overlay.scrollTop = 0;
              overlay.removeChild(currentVideo);
              currentIndex++;
              if (currentIndex < data.length) {
                preloadVideo(data, currentIndex + 1);
              }
            }
          }
          
          if (currentVideo && previousVideo) {
            const rect = previousVideo.getBoundingClientRect();
            if (rect.bottom >= window.innerHeight / 2) {
              overlay.scrollTop = overlay.offsetHeight;
              overlay.removeChild(nextVideo);
              currentIndex--;
              if (currentIndex > 0) {
                preloadVideo(data, currentIndex - 1);
              }
            }
          }

          isThrottled = false;
        }, 300);
      });
    }

    function updateCarousel() {
      carouselContainer.innerHTML = '';
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.innerHTML = `
          <img src="${item.thumbnail}" alt="Thumbnail">
          <div class="play-button-overlay" style="background-color: rgba(0, 0, 0, 0.5)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${config.playButtonColor}" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8 5v14l11-7-11-7z"/>
            </svg>
          </div>`;
        carouselContainer.appendChild(carouselItem);

        carouselItem.addEventListener('click', function () {
          openOverlay(i);
        });
      }
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('carousel-container').innerHTML = 'Failed to load data.';
  }

  const overlay = document.getElementById('fullscreen-overlay');
  overlay.style.display = 'none';

  const closeButton = document.querySelector('.close-button');
  closeButton.addEventListener('click', function () {
    overlay.style.display = 'none';
  });
}
