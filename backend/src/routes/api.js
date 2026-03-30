const express = require('express');

const incidentsRouter = express.Router();
const assetsRouter = express.Router();
const locationsRouter = express.Router();
const usersRouter = express.Router();
const checklistsRouter = express.Router();
const messagesRouter = express.Router();
const dashboardRouter = express.Router();

incidentsRouter.get('/health', (req, res) => res.json({ status: 'incidents ok' }));
assetsRouter.get('/health', (req, res) => res.json({ status: 'assets ok' }));
locationsRouter.get('/health', (req, res) => res.json({ status: 'locations ok' }));
usersRouter.get('/health', (req, res) => res.json({ status: 'users ok' }));
checklistsRouter.get('/health', (req, res) => res.json({ status: 'checklists ok' }));
messagesRouter.get('/health', (req, res) => res.json({ status: 'messages ok' }));
dashboardRouter.get('/health', (req, res) => res.json({ status: 'dashboard ok' }));

module.exports = {
  incidentsRouter, assetsRouter, locationsRouter,
  usersRouter, checklistsRouter, messagesRouter, dashboardRouter
};