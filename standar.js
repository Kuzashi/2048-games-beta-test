let board = Array.from({ length: 4 }, () => Array(4).fill(0));
let touchStartX = 0, touchStartY = 0;
let touchEndX = 0, touchEndY = 0;

let user;

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
      user = u;
      restartGame();
      updateAbilitiesUI();
      updateRubelDisplay();
      addTouchControls();
    } else {
      location.replace("login.html");
    }
  });
});

document.addEventListener("touchstart", function(e) {
    const target = e.target;

    // Cegah swipe hanya pada area selain tombol dan elemen yang perlu diinteraksikan
    if (target.closest("button") || target.closest(".allow-touch")) {
        // Biarkan interaksi tombol tetap berjalan
        return;
    }

    // Hentikan default browser behavior (misal swipe)
    e.preventDefault();
}, { passive: false });

// Fungsi buat detect swipe
function addTouchControls() {
    document.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });

    document.addEventListener("touchend", (event) => {
        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;
        handleSwipe();
    });
}

function handleSwipe() {
    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;
    let moved = false;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        moved = deltaX > 50 ? moveRight() : deltaX < -50 ? moveLeft() : false;
    } else {
        moved = deltaY > 50 ? moveDown() : deltaY < -50 ? moveUp() : false;
    }
    
if (moved) {
  console.log("Tile baru ditambahkan!");
  animateSwipe(deltaX, deltaY);
  const startTime = performance.now();
  setTimeout(() => {
    const endTime = performance.now();
    console.log(`Waktu yang dibutuhkan: ${endTime - startTime} milidetik`);
    addRandomTile();
    updateBoard(); // Update tampilan papan setelah tile baru muncul
  }, 5); // Atur waktu munculnya tile baru (dalam milidetik)
}
}

// Fungsi buat animasi swipe
function animateSwipe(deltaX, deltaY) {
  let cells = document.querySelectorAll(".cell");
  let dx = deltaX > 0 ? "30px" : deltaX < 0 ? "-30px" : "0px";
  let dy = deltaY > 0 ? "30px" : deltaY < 0 ? "-30px" : "0px";

  cells.forEach((cell) => {
    if (cell.textContent !== "") {
      cell.style.transition = "transform 100ms ease-in-out";
      cell.style.transform = `translate(${dx}, ${dy})`;
      setTimeout(() => {
        cell.style.transform = "";
      }, 5);
    }
  });
}

function addRandomTile() {
  let emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }
  if (emptyCells.length === 0) return;

  let highestTile = Math.max(...board.flat());
  let tileValues, probabilities;
  if (highestTile < 16) {
    tileValues = [2, 4];
    probabilities = [0.8, 0.2];
  } else if (highestTile < 128) {
  tileValues = [2, 4, 8, 16, 32];
  probabilities = [0.35, 0.3, 0.2, 0.1, 0.05];
} else if (highestTile < 512) {
  tileValues = [4, 8, 16, 32, 64, 128];
  probabilities = [0.25, 0.2, 0.2, 0.15, 0.1, 0.1];
} else if (highestTile < 1024) {
  tileValues = [4, 8, 16, 32, 64, 128, 256];
  probabilities = [0.2, 0.2, 0.2, 0.15, 0.1, 0.1, 0.05];
} else if (highestTile < 2048) {
  tileValues = [8, 16, 32, 64, 128, 256, 512];
  probabilities = [0.15, 0.2, 0.2, 0.15, 0.15, 0.1, 0.05];
} else {
  tileValues = [16, 32, 64, 128, 256, 512, 1024];
  probabilities = [0.15, 0.2, 0.2, 0.15, 0.15, 0.1, 0.05];
}

  function getRandomTile() {
    let rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < tileValues.length; i++) {
      cumulative += probabilities[i];
      if (rand < cumulative) return tileValues[i];
    }
    return tileValues[tileValues.length - 1];
let randomValue = Math.random();
if (randomValue < 0.8) {
  // 80% kemungkinan
  let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = 2;
} else {
  // 20% kemungkinan
  let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = 4;
}
  }

  let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = getRandomTile();

  // Tambahkan efek animasi pada tile baru
  setTimeout(() => {
    let tileElement = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (tileElement) {
      tileElement.classList.add('new-tile');
      setTimeout(() => {
        tileElement.classList.remove('new-tile');
      }, 200);
    }
  }, 5); // Delay sedikit biar tile-nya udah muncul dulu
}

function updateBoard() {
  let grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (board[r][c] !== 0) {
        cell.textContent = board[r][c];
        cell.setAttribute("data-value", board[r][c]);
      }
      grid.appendChild(cell);
    }
  }
  
  updateScore();
  
  if (isGameOver()) document.getElementById("game-over").style.display = "block";
}

const ambien = document.getElementById("ambien");

function tryPlayAmbien() {
    ambien.volume = 0.8;
    ambien.play().then(() => {
        console.log("Ambien diputar");
        // Hapus event listener biar gak play terus-terusan
        document.removeEventListener("click", tryPlayAmbien);
        document.removeEventListener("touchend", tryPlayAmbien);
        document.removeEventListener("keydown", tryPlayAmbien);
    }).catch(e => {
        console.log("Autoplay masih diblokir: ", e);
    });
}

// Tambahkan listener interaksi user
document.addEventListener("click", tryPlayAmbien);
document.addEventListener("touchend", tryPlayAmbien);
document.addEventListener("keydown", tryPlayAmbien);

function kembali() {
  efekTekan();
  location.replace("menu.html");
}

function balik() {
  efekTekan();
  location.replace("difficult.html");
}

const naudio = new Audio ("efekGeser.mp3");

function efekGeser() {
  let sound = naudio;
  sound.currentTime = 0;
  sound.volume = 0.7;
  sound.play();
}

function moveLeft() {
  efekGeser();
  let moved = false;
  let animations = [];
  let rubelEarned = 0;
  
  firebase.database().ref('users/' + user.uid + '/rubel').once('value').then((snapshot) => {
    let rubel = snapshot.val() || 0;
    
    for (let r = 0; r < 4; r++) {
      let newRow = board[r].filter(val => val !== 0);
      let positions = newRow.map((_, i) => i);
      
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          rubelEarned += newRow[i]; // Tambah ke rubelEarned
          newRow.splice(i + 1, 1);
          newRow.push(0);
          animations.push({ row: r, from: positions[i + 1], to: i, merge: true });
        }
      }
      
      while (newRow.length < 4) newRow.push(0);
      
      for (let c = 0; c < 4; c++) {
        if (board[r][c] !== newRow[c]) {
          moved = true;
          animations.push({ row: r, from: c, to: newRow.indexOf(board[r][c]), merge: false });
        }
        board[r][c] = newRow[c];
      }
    }
    
    if (rubelEarned > 0) {
      rubel += rubelEarned;
      firebase.database().ref('users/' + user.uid).update({
        rubel: rubel
      }).then(() => {
        updateRubelDisplay();
      }).catch((error) => {
        console.error("Error updating rubel:", error);
      });
    }
    
    checkWin();
    if (moved) playAnimation(animations, updateBoard);
  });
  
  return moved; // Karena Firebase async, return moved tidak bisa diandalkan secara sinkron
}

function moveRight() {
  efekGeser();
  let moved = false;
  let animations = [];
  let rubelEarned = 0;
  
  firebase.database().ref('users/' + user.uid + '/rubel').once('value').then((snapshot) => {
    let rubel = snapshot.val() || 0;
    
    for (let r = 0; r < 4; r++) {
      let newRow = board[r].filter(val => val !== 0).reverse();
      let positions = newRow.map((_, i) => 3 - i);
      
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          rubelEarned += newRow[i];
          newRow.splice(i + 1, 1);
          newRow.push(0);
          animations.push({ row: r, from: positions[i + 1], to: 3 - i, merge: true });
        }
      }
      
      while (newRow.length < 4) newRow.push(0);
      newRow.reverse();
      
      for (let c = 0; c < 4; c++) {
        if (board[r][c] !== newRow[c]) {
          moved = true;
          animations.push({ row: r, from: c, to: 3 - newRow.indexOf(board[r][c]), merge: false });
        }
        board[r][c] = newRow[c];
      }
    }
    
    if (rubelEarned > 0) {
      rubel += rubelEarned;
      firebase.database().ref('users/' + user.uid).update({ rubel }).then(updateRubelDisplay);
    }
    
    checkWin();
    if (moved) playAnimation(animations, updateBoard);
  });
  
  return moved;
}

function moveUp() {
  efekGeser();
  let moved = false;
  let animations = [];
  let rubelEarned = 0;
  
  firebase.database().ref('users/' + user.uid + '/rubel').once('value').then((snapshot) => {
    let rubel = snapshot.val() || 0;
    
    for (let c = 0; c < 4; c++) {
      let newCol = [];
      for (let r = 0; r < 4; r++) {
        if (board[r][c] !== 0) newCol.push(board[r][c]);
      }
      
      for (let i = 0; i < newCol.length - 1; i++) {
        if (newCol[i] === newCol[i + 1]) {
          newCol[i] *= 2;
          rubelEarned += newCol[i];
          newCol.splice(i + 1, 1);
          newCol.push(0);
          animations.push({ col: c, from: i + 1, to: i, merge: true });
        }
      }
      
      while (newCol.length < 4) newCol.push(0);
      
      for (let r = 0; r < 4; r++) {
        if (board[r][c] !== newCol[r]) {
          moved = true;
          animations.push({ col: c, from: r, to: newCol.indexOf(board[r][c]), merge: false });
        }
        board[r][c] = newCol[r];
      }
    }
    
    if (rubelEarned > 0) {
      rubel += rubelEarned;
      firebase.database().ref('users/' + user.uid).update({ rubel }).then(updateRubelDisplay);
    }
    
    checkWin();
    if (moved) playAnimation(animations, updateBoard);
  });
  
  return moved;
}

function moveDown() {
  efekGeser();
  let moved = false;
  let animations = [];
  let rubelEarned = 0;
  
  firebase.database().ref('users/' + user.uid + '/rubel').once('value').then((snapshot) => {
    let rubel = snapshot.val() || 0;
    
    for (let c = 0; c < 4; c++) {
      let newCol = [];
      for (let r = 3; r >= 0; r--) {
        if (board[r][c] !== 0) newCol.push(board[r][c]);
      }
      
      for (let i = 0; i < newCol.length - 1; i++) {
        if (newCol[i] === newCol[i + 1]) {
          newCol[i] *= 2;
          rubelEarned += newCol[i];
          newCol.splice(i + 1, 1);
          newCol.push(0);
          animations.push({ col: c, from: 3 - (i + 1), to: 3 - i, merge: true });
        }
      }
      
      while (newCol.length < 4) newCol.push(0);
      
      for (let r = 3; r >= 0; r--) {
        let newValue = newCol[3 - r];
        if (board[r][c] !== newValue) {
          moved = true;
          animations.push({ col: c, from: r, to: 3 - newCol.indexOf(board[r][c]), merge: false });
        }
        board[r][c] = newValue;
      }
    }
    
    if (rubelEarned > 0) {
      rubel += rubelEarned;
      firebase.database().ref('users/' + user.uid).update({ rubel }).then(updateRubelDisplay);
    }
    
    checkWin();
    if (moved) playAnimation(animations, updateBoard);
  });
  
  return moved;
}

function playAnimation(animations, callback) {
    let tiles = document.querySelectorAll(".tile");

    animations.forEach(({ row, from, to }) => {
        let tile = tiles[row * 4 + from]; // Cari tile yang mau dipindahkan
        if (tile) {
            let distance = (to - from) * 100; // 100px per grid
            tile.style.transform = `translateX(${distance}px)`;
            setTimeout(() => {
                tile.style.transform = "translateX(0)"; // Balikin setelah animasi
            }, 200);
        }
    });

    setTimeout(callback, 5); // Pastikan updateBoard() dipanggil setelah animasi selesai
}

function isGameOver() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
    }
  }
  bgMusic.pause();
musicBtn.innerText = "🔇";
  updateScore();
  triggerLightningRepeat();
  return true;
}

let highestTile = 0; // Simpan skor tertinggi

function checkWin() {
  let foundWin = false;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 2048) {
        foundWin = true;
        break; // keluar dari loop kolom
      }
    }
    if (foundWin) break; // keluar dari loop baris
  }

  if (foundWin) {
    document.getElementById("win-message").style.display = "block";
    console.log("user menang!");
    bgMusic.pause();
    musicBtn.innerText = "🔇";
    return true;
  }

  return false;
}

const efekAudio = new Audio("efekTekan.mp3");

function efekTekan() {
  let sound = efekAudio;
  sound.currentTime = 0;
  sound.volume = 1;
  sound.play();
}

function updateScore() {
  console.log("score tertinggi diperbarui");
  let maxTile = Math.max(...board.flat()); // Cari angka terbesar di board
  highestTile = Math.max(highestTile, maxTile); // Update kalau lebih besar
  
  document.getElementById("score").innerText = `Blok Tertinggi: ${highestTile}`;
}



// Fungsi untuk restart game
function restartGame() {
  efekTekan();
    board = Array(4).fill().map(() => Array(4).fill(0));
    addRandomTile();
    addRandomTile(); // Pastikan ada dua angka awal
    updateBoard();
    updateScore();
    updateRubelDisplay();
    updateAbilitiesUI();
    document.getElementById("win-message").style.display = "none";
    document.getElementById("game-over").style.display = "none";

    // Reset musik agar bisa dimainkan lagi
    bgMusic.currentTime = 0;
    musicBtn.innerText = "🔊";
    bgMusic.play();
}

// Pastikan game mulai dengan angka awal
document.addEventListener("DOMContentLoaded", () => {
    restartGame();
    updateRubelDisplay();
    updateAbilitiesUI();
    updateScore();
    
    addTouchControls(); // Tambahin kontrol swipe buat Android
});

function updateRubelDisplay() {
  firebase.database().ref('users/' + user.uid + '/rubel').once('value').then((snapshot) => {
    const rubel = snapshot.val() || 0;
    document.getElementById("rubel-display").textContent = rubel;
  });
}

updateRubelDisplay();

let abilities = {
  rocket: 0,
  horizontal: 0,
  vertical: 0,
  bomb: 0
};

firebase.database().ref('users/' + user.uid + '/abilities').once('value').then(snapshot => {
  const data = snapshot.val();
  if (data) {
    abilities = data;
  }
  updateAbilitiesUI();
});

function saveAbilitiesToFirebase() {
  firebase.database().ref('users/' + user.uid + '/abilities').set(abilities);
}

function updateAbilitiesUI() {
  for (let ability in abilities) {
    document.getElementById(`stock-${ability}`).textContent = abilities[ability];
  }
}

/* Fungsi ROCKET */
function activateRocket() {
  efekTekan();
  let count = countNonEmptyTiles();
  
  if (count <= 4) {
    alert("Tidak bisa menggunakan ability, karena jumlah tile yang tidak kosong sama atau kurang dari 4!");
    return;
  }
  
  if (abilities.rocket > 0) {
    abilities.rocket--;
    saveAbilitiesToFirebase();
    updateAbilitiesUI();
    useRocket();
  } else {
    alert("Kamu tidak punya Rocket! Beli dulu di shop.");
  }
}

function useRocket() {
  let count = 0;
  let maxAttempts = 50;
  let tilesToRemove = 4;
  let nonEmptyTiles = 0;
  const tilesToAnimate = [];
  
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== 0 && board[r][c] < 128) nonEmptyTiles++;
    }
  }
  
  tilesToRemove = Math.min(tilesToRemove, nonEmptyTiles);
  
  while (count < tilesToRemove && maxAttempts > 0) {
    let r = Math.floor(Math.random() * board.length);
    let c = Math.floor(Math.random() * board[0].length);
    if (board[r][c] !== 0 && board[r][c] < 128) {
      const tileElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      if (tileElement && !tileElement.classList.contains("shrink-out")) {
        tileElement.classList.add("shrink-out");
        tilesToAnimate.push({ r, c });
        count++;
      }
    }
    maxAttempts--;
  }
  
  setTimeout(() => {
    for (let { r, c } of tilesToAnimate) {
      board[r][c] = 0;
    }
    
    tilesToAnimate.forEach(({ r, c }) => {
      const tileElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      if (tileElement) tileElement.classList.remove("shrink-out");
    });
    
    updateBoard();
  }, 350);
}

/* Fungsi HORIZONTAL BLAST */
function activateHorizontal() {
  efekTekan();
  let count = countNonEmptyTiles();
  
  if (count <= 4) {
    alert("Tile di board terlalu sedikit untuk menggunakan Horizontal Blast!");
    return;
  }
  
  if (abilities.horizontal > 0) {
    abilities.horizontal--;
    saveAbilitiesToFirebase();
    updateAbilitiesUI();
    useHorizontal();
  } else {
    alert("Kamu tidak punya Horizontal Blast! Beli dulu di shop ya.");
  }
}

function useHorizontal() {
  alert("Pilih baris mana saja untuk menghancurkan seluruh baris!");
  document.getElementById('game-container').addEventListener('touchend', horizontal);
}

function horizontal(event) {
  let tile = event.target.closest('.cell');
  if (tile) {
    let selectedRow = parseInt(tile.dataset.row);
    
    for (let c = 0; c < 4; c++) {
      const tileElement = document.querySelector(`.cell[data-row="${selectedRow}"][data-col="${c}"]`);
      if (tileElement) tileElement.classList.add("shrink-out");
    }
    
    setTimeout(() => {
      for (let c = 0; c < 4; c++) {
        board[selectedRow][c] = 0;
      }
      updateBoard();
    }, 300);
    
    document.getElementById('game-container').removeEventListener('touchend', horizontal);
  }
}

/* Fungsi VERTICAL BLAST */
function activateVertical() {
  efekTekan();
  let count = countNonEmptyTiles();
  
  if (count < 4) {
    alert("Tile di board terlalu sedikit untuk menggunakan Vertical Blast!");
    return;
  }
  
  if (abilities.vertical > 0) {
    abilities.vertical--;
    saveAbilitiesToFirebase();
    updateAbilitiesUI();
    useVertical();
  } else {
    alert("Kamu tidak punya Vertical Blast! Beli dulu di shop ya.");
  }
}

function useVertical() {
  alert("Pilih kolom mana saja untuk menghancurkan seluruh kolom!");
  document.getElementById('game-container').addEventListener('touchend', vertical);
}

function vertical(event) {
  let tile = event.target.closest('.cell');
  if (tile) {
    let selectedCol = parseInt(tile.dataset.col);
    
    for (let r = 0; r < 4; r++) {
      const tileElement = document.querySelector(`.cell[data-row="${r}"][data-col="${selectedCol}"]`);
      if (tileElement) tileElement.classList.add("shrink-out");
    }
    
    setTimeout(() => {
      for (let r = 0; r < 4; r++) {
        board[r][selectedCol] = 0;
      }
      updateBoard();
    }, 300);
    
    document.getElementById('game-container').removeEventListener('touchend', vertical);
  }
}

/* Fungsi BOMB */
function activateBomb() {
  efekTekan();
  let count = countNonEmptyTiles();
  
  if (count <= 4) {
    alert("Tile di board terlalu sedikit untuk menggunakan Bomb!");
    return;
  }
  
  if (abilities.bomb > 0) {
    abilities.bomb--;
    saveAbilitiesToFirebase();
    updateAbilitiesUI();
    useBomb();
  } else {
    alert("Kamu tidak punya bomb! Beli dulu di shop.");
  }
}

function useBomb() {
  alert("Pilih lokasi board untuk menggunakan bomb!");
  document.getElementById('game-container').addEventListener('touchend', bombClickHandler);
}

function bombClickHandler(event) {
  let tile = event.target.closest('.cell');
  if (tile) {
    let selectedRow = parseInt(tile.dataset.row);
    let selectedCol = parseInt(tile.dataset.col);
    
    for (let r = Math.max(0, selectedRow); r <= Math.min(3, selectedRow + 1); r++) {
      for (let c = Math.max(0, selectedCol); c <= Math.min(3, selectedCol + 1); c++) {
        const tileElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (tileElement) tileElement.classList.add("shrink-out");
      }
    }
    
    setTimeout(() => {
      for (let r = Math.max(0, selectedRow); r <= Math.min(3, selectedRow + 1); r++) {
        for (let c = Math.max(0, selectedCol); c <= Math.min(3, selectedCol + 1); c++) {
          board[r][c] = 0;
        }
      }
      updateBoard();
    }, 300);
    
    document.getElementById('game-container').removeEventListener('touchend', bombClickHandler);
  }
}

/* Helper */
function countNonEmptyTiles() {
  let count = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== 0) count++;
    }
  }
  return count;
}

const restartBtn = document.getElementById("restartBtn"); // Ambil tombol restart
const gameBoard = document.getElementById("game-container"); // Ambil elemen permainan

restartBtn.addEventListener("touchend", () => {
    resetGame();
});

function resetGame() {
  efekTekan();
board = Array(4).fill().map(() => Array(4).fill(0));
    addRandomTile();
    addRandomTile(); // Pastikan ada dua angka awal
    updateBoard();
    updateScore();
    document.getElementById("game-over").style.display = "none";

musicBtn.innerHTML = "🔊";
bgMusic.currentTime = 0;
bgMusic.play();
    startGame();
}

function startGame() {
    console.log("Game dimulai ulang!");
    updateRubelDisplay();
    updateAbilitiesUI();
addRandomTile();
addRandomTile();

bgMusic.currentTime = 0;
}

const bgMusic = document.getElementById("bg-music");
const musicBtn = document.getElementById("musicBtn");

// Fungsi untuk memutar musik setelah interaksi pertama
function playMusic() {
  bgMusic.play().then(() => {
    console.log("Musik diputar otomatis setelah interaksi.");
    document.removeEventListener("click", playMusic);
    document.removeEventListener("keydown", playMusic);
    document.removeEventListener("touchstart", playMusic);
  }).catch(err => {
    console.error("Gagal memutar musik:", err);
  });
}

// Tambahkan event listener untuk menangkap interaksi pertama
document.addEventListener("click", playMusic);
document.addEventListener("keydown", playMusic);
document.addEventListener("touchstart", playMusic);

// Loop musik saat selesai
bgMusic.addEventListener("ended", () => {
  bgMusic.currentTime = 0; // Kembali ke awal
  bgMusic.play(); // Mainkan lagi
});

// Fungsi tombol musik
musicBtn.addEventListener("touchend", () => {
  efekTekan();
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.innerText = "🔊";
  } else {
    bgMusic.pause();
    musicBtn.innerText = "🔇";
  }
});

function efekTekan() {
  let sound = efekAudio;
  sound.currentTime = 0;
  sound.volume = 1;
  sound.play();
}

function exit() {
  efekTekan();
  location.replace("difficult.html");
}

const canvas = document.getElementById("games");
const ctx = canvas.getContext("2d");

// Atur ukuran canvas sesuai layar
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const numStars = 50;
let flashOpacity = 0;
let flashing = false;

// Inisialisasi bintang
for (let i = 0; i < numStars; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: Math.random() * 0.5
    });
}

// Load suara petir
const thunderSounds = [
    new Audio("thunder1.mp3"),
    new Audio("thunder2.mp3"),
];

// Fungsi untuk memainkan suara petir secara acak
function playThunderSoundShort() {
    let sound = thunderSounds[0];
    sound.currentTime = 0; // Restart suara dari awal
    sound.volume = 0.5;
    sound.play();
}

function playThunderSoundLong() {
    let sound = thunderSounds[1];
    sound.currentTime = 0; // Restart suara dari awal
    sound.volume = 0.5;
    sound.play();
}

// Fungsi petir cepat
function triggerLightning() {
    if (!flashing) {
      playThunderSoundShort(); // Mainkan suara petir
        flashing = true;
        flashOpacity = 0.7;

        let fadeOut = setInterval(() => {
            flashOpacity -= 0.1;
            if (flashOpacity <= 0) {
                flashOpacity = 0;
                flashing = false;
                clearInterval(fadeOut);
            }
        }, 50);
    }
}

// Fungsi petir berulang
function triggerLightningRepeat() {
    if (!flashing) {
        flashing = true;
        let sequence = [0.8, 0.3, 1, 0.6, 0];
        let index = 0;

        playThunderSoundLong(); // Mainkan suara petir

        let interval = setInterval(() => {
            flashOpacity = sequence[index++];
            if (index >= sequence.length) {
                flashing = false;
                clearInterval(interval);
            }
        }, 150);
    }
}

// Animasi bintang dan efek petir
function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }

    // Efek petir
    if (flashing) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(animateStars);
}

// Jalankan animasi
animateStars();

// Jadwal acak petir
setInterval(() => {
    let rand = Math.random();
    if (rand > 0.8) triggerLightningRepeat();
    else if (rand > 0.6) triggerLightning();
}, 8000);
