$(function() {
  // importing SETTINGS, getAllSettings, updateSettings, resetSettings
  // from settings.js

  // Applies all settings to the UI.
  function applySettings(settings) {
    var visibility = settings['balance_column_visibility'];
    for (var id in visibility) {
      $(".visibility#" + id).prop("checked", visibility[id]);
    }
  }

  // Load and apply all settings to the UI.
  getAllSettings(applySettings);

  // Apply tab functionality.
  $('.nav-tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show');
  });

  // Save settings as they change.
  $(".visibility").change(function() {
    var id = $(this).attr("id");
    var checked = $(this).is(":checked");
    SETTINGS['balance_column_visibility'][id] = checked;
    updateSettings();
  })

  // Apply reset settings event.
  $("#reset_settings").click(function() {
    resetSettings(applySettings);
  })
})

