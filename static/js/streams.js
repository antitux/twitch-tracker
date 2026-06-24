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

let currentStreams = new Set(window.STREAM_DATA.usernames);
let countdown = 60;
let countdownInterval;

function calculateGrid(streamCount) {
  if (streamCount === 0) return { cols: 1, rows: 1 };
  if (streamCount === 1) return { cols: 1, rows: 1 };
  if (streamCount === 2) return { cols: 2, rows: 1 };
  if (streamCount === 3) return { cols: 3, rows: 1 };
  if (streamCount === 4) return { cols: 2, rows: 2 };
  if (streamCount <= 6) return { cols: 3, rows: 2 };
  if (streamCount <= 9) return { cols: 3, rows: 3 };
  if (streamCount <= 12) return { cols: 4, rows: 3 };
  if (streamCount <= 16) return { cols: 4, rows: 4 };
  if (streamCount <= 20) return { cols: 5, rows: 4 };
  if (streamCount <= 25) return { cols: 5, rows: 5 };
  if (streamCount <= 30) return { cols: 6, rows: 5 };
  if (streamCount <= 36) return { cols: 6, rows: 6 };

  const cols = Math.ceil(Math.sqrt(streamCount));
  const rows = Math.ceil(streamCount / cols);
  return { cols, rows };
}

function applyCenteredGrid(streamCount, cols, rows) {
  const container = document.getElementById('streams-container');
  const streams = container.querySelectorAll('.stream');

  streams.forEach((stream) => {
    stream.style.gridColumn = '';
    stream.style.gridRow = '';
  });

  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  if (rows > 1 && streamCount % cols !== 0) {
    const itemsInLastRow = streamCount % cols;
    const totalEmptyCellsInLastRow = cols - itemsInLastRow;
    const offsetFromStart = Math.floor(totalEmptyCellsInLastRow / 2) + 1;
    const startIndexForLastRow = (rows - 1) * cols;

    for (let i = 0; i < itemsInLastRow; i++) {
      const currentStreamIndex = startIndexForLastRow + i;
      if (streams[currentStreamIndex]) {
        streams[currentStreamIndex].style.gridColumnStart =
          `${offsetFromStart + i}`;
      }
    }
  }
}

function updateGridLayout() {
  const streamCount = window.STREAM_DATA.count;
  const grid = calculateGrid(streamCount);
  applyCenteredGrid(streamCount, grid.cols, grid.rows);
}

function forceReload() {
  // Add timestamp to force cache bypass
  const url = new URL(window.location.href);
  url.searchParams.set('_t', Date.now());
  window.location.href = url.toString();
}

async function checkStreams() {
  const statusEl = document.getElementById('status');

  if (!window.STREAM_DATA.hideHeader) {
    statusEl.className = 'status checking';
    statusEl.innerHTML = '<span class="spinner"></span>Checking...';
  }

  try {
    // Add cache-busting parameter to API call
    const response = await fetch(`/api/live-streams?_t=${Date.now()}`);
    const data = await response.json();

    const newStreams = new Set(data.usernames);

    const streamsChanged =
      currentStreams.size !== newStreams.size ||
      [...currentStreams].some((s) => !newStreams.has(s)) ||
      [...newStreams].some((s) => !currentStreams.has(s));

    if (streamsChanged) {
      console.log('Streams changed, reloading...');
      forceReload();
    } else {
      if (!window.STREAM_DATA.hideHeader) {
        statusEl.className = 'status';
      }
      resetCountdown();
    }
  } catch (error) {
    console.error('Error checking streams:', error);
    if (!window.STREAM_DATA.hideHeader) {
      statusEl.className = 'status';
    }
    resetCountdown();
  }
}

function resetCountdown() {
  countdown = 60;
  updateCountdownDisplay();
}

function updateCountdownDisplay() {
  if (!window.STREAM_DATA.hideHeader) {
    const statusEl = document.getElementById('status');
    statusEl.innerHTML = `Next check in <span id="timer">${countdown}</span>s`;
  }
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

updateGridLayout();
window.addEventListener('resize', updateGridLayout);
startCountdown();