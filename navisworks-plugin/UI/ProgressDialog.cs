using System;
using System.Windows.Forms;
using System.Drawing;

namespace NOUFAL.NavisworksPlugin.UI
{
    /// <summary>
    /// Progress dialog for long-running operations
    /// </summary>
    public partial class ProgressDialog : Form
    {
        private ProgressBar progressBar;
        private Label lblStatus;
        private Label lblPercentage;
        private Button btnCancel;
        private bool _cancellationRequested = false;

        public bool CancellationRequested => _cancellationRequested;

        public ProgressDialog(string title = "Processing...")
        {
            InitializeComponent();
            this.Text = title;
        }

        private void InitializeComponent()
        {
            this.Size = new Size(500, 180);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.ControlBox = false;

            var mainPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 1,
                RowCount = 4,
                Padding = new Padding(20)
            };

            // Status label
            lblStatus = new Label
            {
                Text = "جاري التحضير...",
                Dock = DockStyle.Fill,
                Font = new Font("Segoe UI", 10),
                TextAlign = ContentAlignment.MiddleLeft,
                AutoSize = false,
                Height = 30
            };
            mainPanel.Controls.Add(lblStatus);

            // Progress bar
            progressBar = new ProgressBar
            {
                Dock = DockStyle.Fill,
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100,
                Value = 0,
                Height = 30
            };
            mainPanel.Controls.Add(progressBar);

            // Percentage label
            lblPercentage = new Label
            {
                Text = "0%",
                Dock = DockStyle.Fill,
                Font = new Font("Segoe UI", 12, FontStyle.Bold),
                TextAlign = ContentAlignment.MiddleCenter,
                AutoSize = false,
                Height = 30
            };
            mainPanel.Controls.Add(lblPercentage);

            // Cancel button
            var buttonPanel = new FlowLayoutPanel
            {
                Dock = DockStyle.Fill,
                FlowDirection = FlowDirection.RightToLeft,
                Height = 40
            };

            btnCancel = new Button
            {
                Text = "إلغاء",
                Size = new Size(100, 30)
            };
            btnCancel.Click += BtnCancel_Click;
            buttonPanel.Controls.Add(btnCancel);

            mainPanel.Controls.Add(buttonPanel);
            this.Controls.Add(mainPanel);
        }

        /// <summary>
        /// Update progress (0-100)
        /// </summary>
        public void UpdateProgress(int percentage, string statusMessage = null)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => UpdateProgress(percentage, statusMessage)));
                return;
            }

            percentage = Math.Max(0, Math.Min(100, percentage));
            progressBar.Value = percentage;
            lblPercentage.Text = $"{percentage}%";

            if (!string.IsNullOrEmpty(statusMessage))
            {
                lblStatus.Text = statusMessage;
            }

            this.Refresh();
        }

        /// <summary>
        /// Show completion message
        /// </summary>
        public void ShowCompletion(string message, bool success = true)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => ShowCompletion(message, success)));
                return;
            }

            lblStatus.Text = message;
            lblStatus.ForeColor = success ? Color.Green : Color.Red;
            progressBar.Value = 100;
            lblPercentage.Text = "100%";
            btnCancel.Text = "إغلاق";
            btnCancel.DialogResult = DialogResult.OK;
        }

        /// <summary>
        /// Show error message
        /// </summary>
        public void ShowError(string errorMessage)
        {
            ShowCompletion(errorMessage, false);
        }

        private void BtnCancel_Click(object sender, EventArgs e)
        {
            if (btnCancel.Text == "إغلاق")
            {
                this.DialogResult = DialogResult.OK;
                this.Close();
            }
            else
            {
                var result = MessageBox.Show(
                    "هل تريد حقاً إلغاء العملية؟",
                    "تأكيد الإلغاء",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question);

                if (result == DialogResult.Yes)
                {
                    _cancellationRequested = true;
                    btnCancel.Enabled = false;
                    lblStatus.Text = "جاري الإلغاء...";
                }
            }
        }

        /// <summary>
        /// Enable/disable cancel button
        /// </summary>
        public void SetCancelable(bool cancelable)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => SetCancelable(cancelable)));
                return;
            }

            btnCancel.Visible = cancelable;
        }
    }
}
