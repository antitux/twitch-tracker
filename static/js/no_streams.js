let countdown = 60;
let countdownInterval;

function forceReload() {
  // Add timestamp to force cache bypass
  const url = new URL(window.location.href);
  url.searchParams.set('_t', Date.now());
  window.location.href = url.toString();
}

async function checkStreams() {
  try {
    // Add cache-busting parameter to API call
    const response = await fetch(`/api/live-streams?_t=${Date.now()}`);
    const data = await response.json();

    if (data.usernames.length > 0) {
      console.log('Streams found, reloading...');
      forceReload();
    } else {
      resetCountdown();
    }
  } catch (error) {
    console.error('Error checking streams:', error);
    resetCountdown();
  }
}

function resetCountdown() {
  countdown = 60;
  updateCountdownDisplay();
}

function updateCountdownDisplay() {
  document.getElementById('timer').textContent = countdown;
}

function startCountdown() {
  countdownInterval = setInterval(() => {
    countdown--;
    updateCountdownDisplay();

    if (countdown <= 0) {
      checkStreams();
    }
  }, 1000);
}

checkStreams();
startCountdown();