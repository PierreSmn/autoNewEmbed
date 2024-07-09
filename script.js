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
      return videoContainer;
    }

    function openOverlay(startIndex) {
      const overlay = document.getElementById('fullscreen-overlay');
      overlay.innerHTML = ''; // Clear previous videos
      overlay.style.display = 'flex';

      const currentVideo = preloadVideo(data, startIndex);
      overlay.appendChild(currentVideo);

      if (startIndex < data.length - 1) {
        const nextVideo = preloadVideo(data, startIndex + 1);
        nextVideo.style.display = 'none';
        overlay.appendChild(nextVideo);
      }

      setupScrollHandler(data, startIndex);
    }

    function setupScrollHandler(data, startIndex) {
      const overlay = document.getElementById('fullscreen-overlay');
      let currentIndex = startIndex;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const nextVideoIndex = Array.from(overlay.children).indexOf(entry.target) + 1;
            if (nextVideoIndex < overlay.children.length) {
              overlay.children[nextVideoIndex].style.display = 'flex';
              overlay.children[nextVideoIndex].scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      }, {
        root: overlay,
        threshold: 0.5
      });

      Array.from(overlay.children).forEach(child => observer.observe(child));

      overlay.addEventListener('scroll', () => {
        const scrollPosition = overlay.scrollTop;
        const overlayHeight = overlay.offsetHeight;

        if (scrollPosition >= overlayHeight) {
          currentIndex++;
          if (currentIndex < data.length) {
            overlay.innerHTML = '';
            const currentVideo = preloadVideo(data, currentIndex);
            overlay.appendChild(currentVideo);

            if (currentIndex < data.length - 1) {
              const nextVideo = preloadVideo(data, currentIndex + 1);
              nextVideo.style.display = 'none';
              overlay.appendChild(nextVideo);
            }
          }
          overlay.scrollTop = 0;
        } else if (scrollPosition <= 0 && currentIndex > 0) {
          currentIndex--;
          overlay.innerHTML = '';
          const currentVideo = preloadVideo(data, currentIndex);
          overlay.appendChild(currentVideo);

          if (currentIndex < data.length - 1) {
            const nextVideo = preloadVideo(data, currentIndex + 1);
            nextVideo.style.display = 'none';
            overlay.appendChild(nextVideo);
          }
          overlay.scrollTop = overlayHeight;
        }
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
