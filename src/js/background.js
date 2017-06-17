// from settings.js import loadSettings, createContextMenu.

// Load current state of settings and create the context menu.
loadSettings(function(settings) {
  createContextMenu(null, null, settings);
});
