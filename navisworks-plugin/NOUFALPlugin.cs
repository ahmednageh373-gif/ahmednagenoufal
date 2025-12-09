using System;
using System.Windows.Forms;
using System.Threading.Tasks;
using Autodesk.Navisworks.Api;
using Autodesk.Navisworks.Api.Plugins;
using NOUFAL.NavisworksPlugin.Services;
using NOUFAL.NavisworksPlugin.UI;

namespace NOUFAL.NavisworksPlugin
{
    /// <summary>
    /// Main NOUFAL plugin class for Navisworks
    /// Exports model data to NOUFAL platform
    /// </summary>
    [Plugin("NOUFAL.Integration",
            "NOUFAL",
            ToolTip = "Export model data to NOUFAL project management platform",
            DisplayName = "Export to NOUFAL")]
    [AddInPlugin(AddInLocation.AddIn)]
    public class NOUFALPlugin : AddInPlugin
    {
        private ApiService apiService;
        private ModelExtractor modelExtractor;

        public NOUFALPlugin()
        {
            apiService = new ApiService();
            modelExtractor = new ModelExtractor();
        }

        /// <summary>
        /// Execute the plugin
        /// </summary>
        public override int Execute(params string[] parameters)
        {
            try
            {
                // Get active document
                Document doc = Autodesk.Navisworks.Api.Application.ActiveDocument;

                if (doc == null)
                {
                    MessageBox.Show(
                        "No active Navisworks document found.\nPlease open a model first.",
                        "NOUFAL Export",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    return 1;
                }

                // Check if document has models
                if (doc.Models == null || doc.Models.Count == 0)
                {
                    MessageBox.Show(
                        "The document contains no models.\nPlease open a valid model file.",
                        "NOUFAL Export",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    return 1;
                }

                // Show export dialog
                ShowExportDialog(doc);

                return 0;
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"An error occurred:\n\n{ex.Message}\n\nStack Trace:\n{ex.StackTrace}",
                    "NOUFAL Export Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return 1;
            }
        }

        /// <summary>
        /// Show export configuration dialog
        /// </summary>
        private void ShowExportDialog(Document doc)
        {
            using (var exportDialog = new ExportDialog())
            {
                var result = exportDialog.ShowDialog();

                if (result == DialogResult.OK)
                {
                    // Get export settings
                    string projectId = exportDialog.ProjectId;
                    string apiUrl = exportDialog.ApiUrl;
                    string apiKey = exportDialog.ApiKey;
                    bool exportSelection = exportDialog.ExportSelectionOnly;
                    bool includeGeometry = exportDialog.IncludeGeometry;
                    bool includeProperties = exportDialog.IncludeProperties;

                    // Configure API service
                    apiService.Configure(apiUrl, apiKey);

                    // Start export process
                    ExportToNOUFAL(
                        doc,
                        projectId,
                        exportSelection,
                        includeGeometry,
                        includeProperties
                    );
                }
            }
        }

        /// <summary>
        /// Export model data to NOUFAL platform
        /// </summary>
        private async void ExportToNOUFAL(
            Document doc,
            string projectId,
            bool exportSelection,
            bool includeGeometry,
            bool includeProperties)
        {
            ProgressDialog progressDialog = null;

            try
            {
                // Show progress dialog
                progressDialog = new ProgressDialog();
                progressDialog.Show();
                progressDialog.UpdateProgress(0, "Starting export...");

                // Extract model data
                progressDialog.UpdateProgress(10, "Extracting model data...");
                var modelData = await Task.Run(() =>
                    modelExtractor.ExtractModelData(
                        doc,
                        exportSelection,
                        includeGeometry,
                        includeProperties,
                        (progress, message) =>
                        {
                            progressDialog.BeginInvoke((Action)(() =>
                            {
                                progressDialog.UpdateProgress(10 + (int)(progress * 0.6), message);
                            }));
                        }
                    )
                );

                // Upload to NOUFAL API
                progressDialog.UpdateProgress(70, "Uploading to NOUFAL...");
                var response = await apiService.UploadModelDataAsync(projectId, modelData);

                progressDialog.UpdateProgress(100, "Export complete!");

                // Close progress and show success
                progressDialog.Close();

                MessageBox.Show(
                    $"Model exported successfully!\n\n" +
                    $"Project ID: {projectId}\n" +
                    $"Elements: {modelData.Elements.Count}\n" +
                    $"File: {modelData.FileName}",
                    "Export Success",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
            catch (Exception ex)
            {
                if (progressDialog != null && !progressDialog.IsDisposed)
                {
                    progressDialog.Close();
                }

                MessageBox.Show(
                    $"Export failed:\n\n{ex.Message}",
                    "Export Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }

    /// <summary>
    /// Ribbon button plugin to add NOUFAL button to Navisworks ribbon
    /// </summary>
    [Plugin("NOUFAL.RibbonButton",
            "NOUFAL",
            ToolTip = "Export to NOUFAL",
            DisplayName = "NOUFAL Export")]
    [RibbonLayout("NOUFAL.RibbonButton.xaml")]
    [RibbonTab("NOUFAL")]
    public class NOUFALRibbonPlugin : CommandHandlerPlugin
    {
        public override int ExecuteCommand(string commandId, params string[] parameters)
        {
            switch (commandId)
            {
                case "NOUFAL_Export":
                    // Execute main plugin
                    var plugin = new NOUFALPlugin();
                    return plugin.Execute(parameters);

                case "NOUFAL_Settings":
                    MessageBox.Show("NOUFAL Settings - Coming soon!", "Settings");
                    return 0;

                case "NOUFAL_Help":
                    System.Diagnostics.Process.Start("https://ahmednagenoufal.com/docs/navisworks");
                    return 0;

                default:
                    return 0;
            }
        }
    }
}
