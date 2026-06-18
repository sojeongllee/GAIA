const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const data = require('./data/scenarios');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── In-memory state ─────────────────────────────────────────────────────────

const responses = [];          // submitted response objects
const events    = [];          // detailed interaction event log
const notes     = {};          // { 'scenarioId:optionId': string }
const connectedParticipants = new Map();
let currentState = { scenarioId: null, optionId: null, scenario: null, option: null };

// ── REST routes ──────────────────────────────────────────────────────────────

app.get('/',           (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/host',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'host.html')));
app.get('/participant',(req, res) => res.sendFile(path.join(__dirname, 'public', 'participant.html')));

app.get('/api/scenarios', (req, res) => res.json(data));

// Export: submitted responses as CSV
app.get('/export/responses-csv', (req, res) => {
  const headers = [
    'timestamp','participantId','scenarioId','scenarioTitle',
    'optionId','optionTitle','helpfulness','interventionLevel',
    'activationMode','detailRequest','comment'
  ];
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = responses.map(r => headers.map(h => escape(r[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Disposition', 'attachment; filename="gaia-responses.csv"');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send('﻿' + csv);
});

// Export: submitted responses as JSON
app.get('/export/responses-json', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="gaia-responses.json"');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(responses);
});

// Export: detailed interaction event log as JSON
app.get('/export/events-json', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="gaia-events.json"');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(events);
});

// ── Socket.IO ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  const { role, pid } = socket.handshake.query;

  // ── Participant ────────────────────────────────────────────────────────────
  if (role === 'participant') {
    const participantId = pid || `guest-${socket.id.slice(0, 4)}`;
    connectedParticipants.set(participantId, socket.id);
    socket.join('participants');

    io.emit('participant-count', connectedParticipants.size);

    if (currentState.scenarioId) socket.emit('show-ui', currentState);

    socket.on('disconnect', () => {
      connectedParticipants.delete(participantId);
      io.emit('participant-count', connectedParticipants.size);
    });
  }

  // ── Host ───────────────────────────────────────────────────────────────────
  if (role === 'host') {
    socket.join('hosts');
    socket.emit('participant-count', connectedParticipants.size);
    socket.emit('initial-responses', responses);
    socket.emit('current-state', currentState);
    socket.emit('all-notes', notes);
  }

  // ── Shared events ──────────────────────────────────────────────────────────

  socket.on('show-ui', (d) => {
    currentState = d;
    io.to('participants').emit('show-ui', d);
    io.to('hosts').emit('current-state', currentState);
  });

  socket.on('reset', () => {
    currentState = { scenarioId: null, optionId: null, scenario: null, option: null };
    io.to('participants').emit('reset');
    io.to('hosts').emit('current-state', currentState);
  });

  // Participant submits a full response
  socket.on('submit-response', (d) => {
    const response = { ...d, timestamp: new Date().toISOString() };
    responses.push(response);
    io.to('hosts').emit('new-response', response);
  });

  // Participant logs a fine-grained interaction event
  socket.on('log-event', (d) => {
    const event = { ...d, timestamp: new Date().toISOString() };
    events.push(event);
    io.to('hosts').emit('new-event', event);
  });

  // Host updates a note for a scenario/option
  socket.on('update-note', ({ key, text }) => {
    notes[key] = text;
    socket.to('hosts').emit('note-updated', { key, text }); // broadcast to OTHER hosts
  });
});

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\nGAIA Workshop server  →  http://localhost:${PORT}`);
  console.log(`  Host:        http://localhost:${PORT}/host`);
  console.log(`  Participant: http://localhost:${PORT}/participant?pid=P1\n`);
});
