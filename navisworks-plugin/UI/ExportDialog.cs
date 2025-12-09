using System;
using System.Windows.Forms;
using Autodesk.Navisworks.Api;

namespace NOUFAL.NavisworksPlugin.UI
{
    /// <summary>
    /// Export configuration dialog
    /// </summary>
    public partial class ExportDialog : Form
    {
        public string ProjectId { get; private set; }
        public bool ExportSelection { get; private set; }
        public bool IncludeGeometry { get; private set; }
        public bool IncludeProperties { get; private set; }
        public string ApiUrl { get; private set; }

        private Document _document;

        public ExportDialog(Document document)
        {
            _document = document;
            InitializeComponent();
            LoadSettings();
        }

        private void InitializeComponent()
        {
            this.Text = "Export to NOUFAL";
            this.Size = new System.Drawing.Size(500, 400);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;

            // Main panel
            var mainPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 1,
                RowCount = 6,
                Padding = new Padding(20)
            };

            // Title label
            var titleLabel = new Label
            {
                Text = "تصدير النموذج إلى NOUFAL",
                Font = new System.Drawing.Font("Segoe UI", 14, System.Drawing.FontStyle.Bold),
                AutoSize = true,
                TextAlign = System.Drawing.ContentAlignment.MiddleCenter,
                Dock = DockStyle.Fill
            };
            mainPanel.Controls.Add(titleLabel);

            // API URL section
            var apiPanel = new Panel { Dock = DockStyle.Fill, Height = 60 };
            var apiLabel = new Label
            {
                Text = "API URL:",
                Location = new System.Drawing.Point(0, 5),
                AutoSize = true
            };
            txtApiUrl = new TextBox
            {
                Location = new System.Drawing.Point(0, 25),
                Width = 440,
                Text = "https://api.noufal.com"
            };
            apiPanel.Controls.AddRange(new Control[] { apiLabel, txtApiUrl });
            mainPanel.Controls.Add(apiPanel);

            // Project ID section
            var projectPanel = new Panel { Dock = DockStyle.Fill, Height = 60 };
            var projectLabel = new Label
            {
                Text = "Project ID:",
                Location = new System.Drawing.Point(0, 5),
                AutoSize = true
            };
            txtProjectId = new TextBox
            {
                Location = new System.Drawing.Point(0, 25),
                Width = 440
            };
            projectPanel.Controls.AddRange(new Control[] { projectLabel, txtProjectId });
            mainPanel.Controls.Add(projectPanel);

            // Options group
            var optionsGroup = new GroupBox
            {
                Text = "خيارات التصدير",
                Dock = DockStyle.Fill,
                Height = 120
            };

            chkExportSelection = new CheckBox
            {
                Text = "تصدير العناصر المحددة فقط",
                Location = new System.Drawing.Point(20, 25),
                AutoSize = true,
                RightToLeft = RightToLeft.Yes
            };

            chkIncludeGeometry = new CheckBox
            {
                Text = "تضمين الأشكال الهندسية (Geometry)",
                Location = new System.Drawing.Point(20, 50),
                AutoSize = true,
                Checked = true,
                RightToLeft = RightToLeft.Yes
            };

            chkIncludeProperties = new CheckBox
            {
                Text = "تضمين الخصائص (Properties)",
                Location = new System.Drawing.Point(20, 75),
                AutoSize = true,
                Checked = true,
                RightToLeft = RightToLeft.Yes
            };

            optionsGroup.Controls.AddRange(new Control[] { 
                chkExportSelection, 
                chkIncludeGeometry, 
                chkIncludeProperties 
            });
            mainPanel.Controls.Add(optionsGroup);

            // Info label
            lblInfo = new Label
            {
                Text = GetInfoText(),
                Dock = DockStyle.Fill,
                AutoSize = true,
                ForeColor = System.Drawing.Color.Gray
            };
            mainPanel.Controls.Add(lblInfo);

            // Buttons panel
            var buttonPanel = new FlowLayoutPanel
            {
                Dock = DockStyle.Fill,
                FlowDirection = FlowDirection.RightToLeft,
                Height = 40
            };

            btnExport = new Button
            {
                Text = "تصدير",
                Size = new System.Drawing.Size(100, 30),
                DialogResult = DialogResult.OK
            };
            btnExport.Click += BtnExport_Click;

            btnCancel = new Button
            {
                Text = "إلغاء",
                Size = new System.Drawing.Size(100, 30),
                DialogResult = DialogResult.Cancel
            };

            buttonPanel.Controls.AddRange(new Control[] { btnExport, btnCancel });
            mainPanel.Controls.Add(buttonPanel);

            this.Controls.Add(mainPanel);
            this.AcceptButton = btnExport;
            this.CancelButton = btnCancel;

            // Event handlers
            chkExportSelection.CheckedChanged += (s, e) => UpdateInfoLabel();
        }

        private TextBox txtApiUrl;
        private TextBox txtProjectId;
        private CheckBox chkExportSelection;
        private CheckBox chkIncludeGeometry;
        private CheckBox chkIncludeProperties;
        private Label lblInfo;
        private Button btnExport;
        private Button btnCancel;

        private void LoadSettings()
        {
            try
            {
                // Load saved settings from registry or config file
                // TODO: Implement settings persistence
            }
            catch { }
        }

        private void SaveSettings()
        {
            try
            {
                // Save settings to registry or config file
                // TODO: Implement settings persistence
            }
            catch { }
        }

        private string GetInfoText()
        {
            if (_document == null)
                return "لا يوجد نموذج مفتوح";

            int itemCount = chkExportSelection.Checked && _document.CurrentSelection != null
                ? _document.CurrentSelection.SelectedItems.Count
                : _document.Models.RootItems.DescendantsAndSelf.Count();

            return $"سيتم تصدير {itemCount} عنصر";
        }

        private void UpdateInfoLabel()
        {
            lblInfo.Text = GetInfoText();
        }

        private void BtnExport_Click(object sender, EventArgs e)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(txtProjectId.Text))
            {
                MessageBox.Show("الرجاء إدخال Project ID", "خطأ", 
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                txtProjectId.Focus();
                this.DialogResult = DialogResult.None;
                return;
            }

            if (string.IsNullOrWhiteSpace(txtApiUrl.Text))
            {
                MessageBox.Show("الرجاء إدخال API URL", "خطأ", 
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                txtApiUrl.Focus();
                this.DialogResult = DialogResult.None;
                return;
            }

            // Check if selection export is requested but nothing is selected
            if (chkExportSelection.Checked && 
                (_document.CurrentSelection == null || 
                 _document.CurrentSelection.SelectedItems.Count == 0))
            {
                MessageBox.Show("لا يوجد عناصر محددة. الرجاء تحديد عناصر أو إلغاء تحديد خيار 'تصدير العناصر المحددة فقط'", 
                    "خطأ", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                this.DialogResult = DialogResult.None;
                return;
            }

            // Store values
            ProjectId = txtProjectId.Text.Trim();
            ExportSelection = chkExportSelection.Checked;
            IncludeGeometry = chkIncludeGeometry.Checked;
            IncludeProperties = chkIncludeProperties.Checked;
            ApiUrl = txtApiUrl.Text.Trim();

            // Save settings
            SaveSettings();

            this.DialogResult = DialogResult.OK;
        }
    }
}
