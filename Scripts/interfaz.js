const requestTripForm = document.getElementById('requestTripForm');
const tripMessage = document.getElementById('tripMessage');
const costMessage = document.getElementById('costMessage');
const startNodeInput = document.getElementById('startNode');
const endNodeInput = document.getElementById('endNode');
const svg = document.getElementById('mapSVG');
const movil = document.getElementById('movil');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

// Coordenadas de los nodos en el SVG
const nodeCoords = {
  A: { x: 40, y: 30 },
  B: { x: 220, y: 30 },
  C: { x: 130, y: 70 },
  D: { x: 40, y: 120 },
  E: { x: 220, y: 120 },
  F: { x: 255, y: 95 }
};

// Cambia color de nodos seleccionados
function updateNodeColors() {
  ['A','B','C','D','E','F'].forEach(n => {
    const node = svg.getElementById('node'+n);
    node.setAttribute('fill', '#fff');
    node.setAttribute('stroke', '#232526');
  });
  const start = startNodeInput.value;
  const end = endNodeInput.value;
  if (start && svg.getElementById('node'+start)) {
    svg.getElementById('node'+start).setAttribute('fill', '#43e97b');
    svg.getElementById('node'+start).setAttribute('stroke', '#43e97b');
  }
  if (end && svg.getElementById('node'+end)) {
    svg.getElementById('node'+end).setAttribute('fill', '#e63946');
    svg.getElementById('node'+end).setAttribute('stroke', '#e63946');
  }
}

// Listeners para selects
startNodeInput.addEventListener('change', updateNodeColors);
endNodeInput.addEventListener('change', updateNodeColors);

function clearRoute() {
  // Elimina rutas previas
  Array.from(svg.querySelectorAll('.route-line')).forEach(el => el.remove());
  updateNodeColors();
}

requestTripForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearRoute();
  tripMessage.textContent = '';
  costMessage.textContent = '';
  movil.style.display = 'none';

  const startNode = startNodeInput.value;
  const endNode = endNodeInput.value;

  if (!startNode || !endNode || startNode === endNode) {
    tripMessage.textContent = 'Select different origin and destination.';
    tripMessage.style.color = 'red';
    return;
  }

  // --- Aquí deberías llamar a tu backend con fetch para obtener la ruta real ---
  // Simulación de backend (puedes cambiar por tu fetch real)
  let path = [startNode, endNode];
  let weights = [2];
  let distance = 2;
  if (startNode === "A" && endNode === "E") {
    path = ["A", "C", "E"];
    weights = [2, 3];
    distance = 5;
  }

  tripMessage.textContent = `Route: ${path.join(' → ')}. Time: ${distance} s.`;
  tripMessage.style.color = 'green';
  drawRoute(path);
  animateMovil(path, weights, distance);
});

function drawRoute(path) {
  for (let i = 0; i < path.length - 1; i++) {
    const from = nodeCoords[path[i]];
    const to = nodeCoords[path[i + 1]];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('stroke', '#e63946');
    line.setAttribute('stroke-width', '4');
    line.setAttribute('class', 'route-line');
    svg.appendChild(line);
  }
  // Resalta nodos de la ruta
  path.forEach(n => {
    svg.getElementById('node'+n).setAttribute('fill', '#FFD700');
    svg.getElementById('node'+n).setAttribute('stroke', '#FFD700');
  });
}

function animateMovil(path, weights, totalTime) {
  let i = 0;
  movil.style.display = '';
  moveToNode(path[0]);
  progressBar.style.display = 'block';
  progressFill.style.width = '0%';

  function step() {
    if (i >= path.length - 1) {
      setTimeout(() => {
        movil.style.display = 'none';
        progressBar.style.display = 'none';
        costMessage.textContent = `Trip cost: $${(totalTime * 0.5).toFixed(2)}. Total time: ${totalTime} s.`;
        setTimeout(() => {
          clearRoute();
          startNodeInput.value = "";
          endNodeInput.value = "";
          updateNodeColors();
          costMessage.textContent = "";
          tripMessage.textContent = "";
        }, 2000);
      }, 600);
      return;
    }
    const from = nodeCoords[path[i]];
    const to = nodeCoords[path[i + 1]];
    const duration = (weights[i] || 1) * 1000;
    animateMove(from, to, duration, () => {
      progressFill.style.width = `${((i + 1) / (path.length - 1)) * 100}%`;
      i++;
      step();
    });
  }
  step();
}

function moveToNode(node) {
  movil.setAttribute('cx', nodeCoords[node].x);
  movil.setAttribute('cy', nodeCoords[node].y);
}

function animateMove(from, to, duration, callback) {
  const start = { x: from.x, y: from.y };
  const end = { x: to.x, y: to.y };
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1);
    movil.setAttribute('cx', start.x + (end.x - start.x) * t);
    movil.setAttribute('cy', start.y + (end.y - start.y) * t);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      callback();
    }
  }
  requestAnimationFrame(animate);
}