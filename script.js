async function initializeVideoCarousel(config) {
  console.log("Initializing Video Carousel with config:", config);

  const supabaseUrl = `https://pifcxlqwffdrqcwggoqb.supabase.co/rest/v1/hostedSubs?id=in.(${config.desiredOrder.join(',')})&select=*`;
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmN4bHF3ZmZkcnFjd2dnb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMyNjY2NTYsImV4cCI6MTk4ODg0MjY1Nn0.lha9G8j7lPLVGv0IU1sAT4SzrJb0I87LfhhvQV8Tc2Q';

  let data = [];
  let currentIndex = 0;

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

    function createVideoContainer(index) {
      const container = document.createElement('div');
      container.className = 'fullscreen-video-container';
      container.innerHTML = `
        <mux-player
          class="fullscreen-video"
          playback-id="${data[index].playback_id}"
          metadata-video-title="${data[index].title}"
          metadata-viewer-user-id="user"
        ></mux-player>`;
      return container;
    }

    function playCurrentVideo() {
      const videos = document.querySelectorAll('.fullscreen-video');
      videos.forEach((video, index) => {
        if (index === currentIndex) {
          video.play();
        } else {
          video.pause();
        }
      });
    }

    function openOverlay(index) {
      const overlay = document.getElementById('fullscreen-overlay');
      overlay.innerHTML = ''; // Clear previous videos
      overlay.style.display = 'flex';

      const currentContainer = createVideoContainer(index);
      overlay.appendChild(currentContainer);

      if (index < data.length - 1) {
        const nextContainer = createVideoContainer(index + 1);
        overlay.appendChild(nextContainer);
      }

      if (index > 0) {
        const prevContainer = createVideoContainer(index - 1);
        overlay.insertBefore(prevContainer, currentContainer);
      }

      overlay.scrollTop = window.innerHeight; // Start at the current video
      playCurrentVideo();
      setupScrollHandler(data, index);
    }

    function setupScrollHandler(data, startIndex) {
      const overlay = document.getElementById('fullscreen-overlay');
      currentIndex = startIndex;

      const handleScroll = () => {
        const scrollTop = overlay.scrollTop;
        const windowHeight = window.innerHeight;

        if (scrollTop >= windowHeight) {
          currentIndex++;
          if (currentIndex < data.length) {
            overlay.scrollTop = 0; // Reset scroll position
            playCurrentVideo();
          } else {
            currentIndex = data.length - 1;
          }
        } else if (scrollTop <= 0) {
          currentIndex--;
          if (currentIndex >= 0) {
            overlay.scrollTop = windowHeight; // Reset scroll position
            playCurrentVideo();
          } else {
            currentIndex = 0;
          }
        }
      };

      overlay.addEventListener('scroll', handleScroll);
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

  const closeButton = document.createElement('div');
  closeButton.className = 'close-button';
  closeButton.innerHTML = `
    <span class="close-button-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0002 10.586L4.70718 3.29297L3.29297 4.70718L10.586 12.0002L3.29297 19.2933L4.70718 20.7075L12.0002 13.4145L19.2933 20.7075L20.7075 19.2933L13.4145 12.0002L20.7075 4.70723L19.2933 3.29302L12.0002 10.586Z" fill="white"></path>
      </svg>
    </span>`;
  overlay.appendChild(closeButton);

  closeButton.addEventListener('click', function () {
    overlay.style.display = 'none';
  });
}
