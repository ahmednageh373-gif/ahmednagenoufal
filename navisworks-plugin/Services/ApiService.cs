using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using NOUFAL.NavisworksPlugin.Models;

namespace NOUFAL.NavisworksPlugin.Services
{
    /// <summary>
    /// Service for communicating with NOUFAL API
    /// </summary>
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private string _apiBaseUrl;
        private string _authToken;

        public ApiService(string apiBaseUrl = null)
        {
            _apiBaseUrl = apiBaseUrl ?? "https://api.noufal.com"; // Default API URL
            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromMinutes(10) // Long timeout for large uploads
            };
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        /// Set the API base URL
        /// </summary>
        public void SetApiBaseUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("API URL cannot be empty", nameof(url));

            _apiBaseUrl = url.TrimEnd('/');
        }

        /// <summary>
        /// Set authentication token
        /// </summary>
        public void SetAuthToken(string token)
        {
            _authToken = token;
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new AuthenticationHeaderValue("Bearer", token);
            }
            else
            {
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        /// <summary>
        /// Authenticate with NOUFAL API
        /// </summary>
        public async Task<ApiResponse<AuthResponse>> AuthenticateAsync(string email, string password)
        {
            try
            {
                var loginData = new { email, password };
                var response = await PostAsync<AuthResponse>("/api/auth/login", loginData);

                if (response.Success && response.Data != null)
                {
                    SetAuthToken(response.Data.Token);
                }

                return response;
            }
            catch (Exception ex)
            {
                return ApiResponse<AuthResponse>.CreateError($"Authentication failed: {ex.Message}", 401);
            }
        }

        /// <summary>
        /// Get list of projects
        /// </summary>
        public async Task<ApiResponse<ProjectListResponse>> GetProjectsAsync(int page = 1, int pageSize = 20)
        {
            try
            {
                return await GetAsync<ProjectListResponse>($"/api/projects?page={page}&pageSize={pageSize}");
            }
            catch (Exception ex)
            {
                return ApiResponse<ProjectListResponse>.CreateError($"Failed to get projects: {ex.Message}");
            }
        }

        /// <summary>
        /// Upload model data to NOUFAL API
        /// </summary>
        public async Task<ApiResponse<ModelImportResponse>> UploadModelDataAsync(
            string projectId, 
            ModelData modelData,
            IProgress<int> progress = null)
        {
            try
            {
                if (string.IsNullOrEmpty(projectId))
                    return ApiResponse<ModelImportResponse>.CreateError("Project ID is required");

                if (modelData == null)
                    return ApiResponse<ModelImportResponse>.CreateError("Model data is required");

                // Validate model data
                var validation = ValidateModelData(modelData);
                if (!validation.IsValid)
                {
                    var errors = validation.Errors.ConvertAll(e => $"{e.Field}: {e.Message}");
                    return ApiResponse<ModelImportResponse>.CreateError(errors);
                }

                progress?.Report(10);

                // Serialize model data
                string json = JsonConvert.SerializeObject(modelData, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore,
                    Formatting = Formatting.None
                });

                progress?.Report(30);

                // Create HTTP content
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                progress?.Report(50);

                // Send POST request
                var endpoint = $"/api/projects/{projectId}/navisworks/import";
                var response = await _httpClient.PostAsync(_apiBaseUrl + endpoint, content);

                progress?.Report(80);

                // Parse response
                var responseText = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<ApiResponse<ModelImportResponse>>(responseText);

                progress?.Report(100);

                return result;
            }
            catch (HttpRequestException ex)
            {
                return ApiResponse<ModelImportResponse>.CreateError(
                    $"Network error: {ex.Message}. Please check your connection and API URL.", 500);
            }
            catch (TaskCanceledException)
            {
                return ApiResponse<ModelImportResponse>.CreateError(
                    "Upload timeout. The model may be too large.", 408);
            }
            catch (Exception ex)
            {
                return ApiResponse<ModelImportResponse>.CreateError(
                    $"Upload failed: {ex.Message}", 500);
            }
        }

        /// <summary>
        /// Generic GET request
        /// </summary>
        private async Task<ApiResponse<T>> GetAsync<T>(string endpoint)
        {
            try
            {
                var response = await _httpClient.GetAsync(_apiBaseUrl + endpoint);
                var responseText = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var result = JsonConvert.DeserializeObject<ApiResponse<T>>(responseText);
                    return result;
                }
                else
                {
                    return ApiResponse<T>.CreateError(
                        $"API error: {response.StatusCode}", 
                        (int)response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                return ApiResponse<T>.CreateError($"Request failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Generic POST request
        /// </summary>
        private async Task<ApiResponse<T>> PostAsync<T>(string endpoint, object data)
        {
            try
            {
                var json = JsonConvert.SerializeObject(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(_apiBaseUrl + endpoint, content);
                var responseText = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var result = JsonConvert.DeserializeObject<ApiResponse<T>>(responseText);
                    return result;
                }
                else
                {
                    return ApiResponse<T>.CreateError(
                        $"API error: {response.StatusCode}", 
                        (int)response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                return ApiResponse<T>.CreateError($"Request failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Validate model data before upload
        /// </summary>
        private ValidationResult ValidateModelData(ModelData modelData)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(modelData.FileName))
                result.AddError("FileName", "File name is required");

            if (modelData.Elements == null || modelData.Elements.Count == 0)
                result.AddError("Elements", "Model must contain at least one element");

            if (modelData.BoundingBox == null || !modelData.BoundingBox.IsValid)
                result.AddError("BoundingBox", "Invalid bounding box");

            return result;
        }

        /// <summary>
        /// Test API connectivity
        /// </summary>
        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync(_apiBaseUrl + "/api/health");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Dispose resources
        /// </summary>
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}
