const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const scenarios = require('./data/scenarios');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── In-memory state ────────────────────────────────────────────────────────

const responses = [];
const connectedParticipants = new Map(); // pid → socketId
let currentState = { scenarioId: null, optionId: null, scenario: null, option: null };

// ── REST routes ────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/host', (req, res) => res.sendFile(path.join(__dirname, 'public', 'host.html')));
app.get('/participant', (req, res) => res.sendFile(path.join(__dirname, 'public', 'participant.html')));

app.get('/api/scenarios', (req, res) => res.json(scenarios));
app.get('/api/responses', (req, res) => res.json(responses));

app.get('/export/json', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="gaia-responses.json"');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(responses);
});

app.get('/export/csv', (req, res) => {
  const headers = [
    'timestamp', 'participantId', 'scenarioId', 'scenarioTitle',
    'optionId', 'optionTitle', 'helpfulness', 'interventionLevel',
    'activationMode', 'detailRequest', 'comment'
  ];

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = responses.map(r => headers.map(h => escape(r[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\r\n');

  res.setHeader('Content-Disposition', 'attachment; filename="gaia-responses.csv"');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send('﻿' + csv); // BOM for Excel UTF-8
});

// ── Socket.IO ──────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  const { role, pid } = socket.handshake.query;

  if (role === 'participant') {
    const participantId = pid || `guest-${socket.id.slice(0, 4)}`;
    connectedParticipants.set(participantId, socket.id);
    socket.join('participants');

    io.emit('participant-count', connectedParticipants.size);

    // Send current state so a late-joining participant sees what's active
    if (currentState.scenarioId) {
      socket.emit('show-ui', currentState);
    }

    socket.on('disconnect', () => {
      connectedParticipants.delete(participantId);
      io.emit('participant-count', connectedParticipants.size);
    });
  }

  if (role === 'host') {
    socket.join('hosts');
    socket.emit('participant-count', connectedParticipants.size);
    socket.emit('initial-responses', responses);
    socket.emit('current-state', currentState);
  }

  // Host: show a UI option to all participants
  socket.on('show-ui', (data) => {
    currentState = data;
    io.to('participants').emit('show-ui', data);
    io.to('hosts').emit('current-state', currentState);
  });

  // Host: reset participant screen
  socket.on('reset', () => {
    currentState = { scenarioId: null, optionId: null, scenario: null, option: null };
    io.to('participants').emit('reset');
    io.to('hosts').emit('current-state', currentState);
  });

  // Participant: submit full response
  socket.on('submit-response', (data) => {
    const response = { ...data, timestamp: new Date().toISOString() };
    responses.push(response);
    io.to('hosts').emit('new-response', response);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\nGAIA Workshop server running at http://localhost:${PORT}`);
  console.log(`  Host screen:        http://localhost:${PORT}/host`);
  console.log(`  Participant (P1):   http://localhost:${PORT}/participant?pid=P1`);
  console.log(`  Participant (P2):   http://localhost:${PORT}/participant?pid=P2\n`);
});
