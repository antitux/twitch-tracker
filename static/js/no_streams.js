/*
* Copyright (C) 2026 Antitux Networks LLC <me@antitux.dev>
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published
* by the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://gnu.org>.
*/

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