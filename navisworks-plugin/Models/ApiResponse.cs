using System;
using System.Collections.Generic;

namespace NOUFAL.NavisworksPlugin.Models
{
    /// <summary>
    /// Generic API response wrapper
    /// </summary>
    /// <typeparam name="T">Type of the data payload</typeparam>
    public class ApiResponse<T>
    {
        /// <summary>
        /// Indicates if the request was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Response data
        /// </summary>
        public T Data { get; set; }

        /// <summary>
        /// Error message (if Success = false)
        /// </summary>
        public string Error { get; set; }

        /// <summary>
        /// Detailed error messages
        /// </summary>
        public List<string> Errors { get; set; }

        /// <summary>
        /// Response metadata
        /// </summary>
        public ResponseMetadata Metadata { get; set; }

        /// <summary>
        /// HTTP status code
        /// </summary>
        public int StatusCode { get; set; }

        /// <summary>
        /// Server timestamp
        /// </summary>
        public DateTime Timestamp { get; set; }

        public ApiResponse()
        {
            Errors = new List<string>();
            Timestamp = DateTime.UtcNow;
        }

        /// <summary>
        /// Create a success response
        /// </summary>
        public static ApiResponse<T> CreateSuccess(T data, string message = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                StatusCode = 200,
                Metadata = new ResponseMetadata
                {
                    Message = message ?? "Operation completed successfully"
                }
            };
        }

        /// <summary>
        /// Create an error response
        /// </summary>
        public static ApiResponse<T> CreateError(string error, int statusCode = 400)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Error = error,
                StatusCode = statusCode,
                Errors = new List<string> { error }
            };
        }

        /// <summary>
        /// Create an error response with multiple errors
        /// </summary>
        public static ApiResponse<T> CreateError(List<string> errors, int statusCode = 400)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Error = errors.Count > 0 ? errors[0] : "Unknown error",
                Errors = errors,
                StatusCode = statusCode
            };
        }
    }

    /// <summary>
    /// Response metadata
    /// </summary>
    public class ResponseMetadata
    {
        public string Message { get; set; }
        public string RequestId { get; set; }
        public string Version { get; set; }
        public Dictionary<string, object> AdditionalInfo { get; set; }

        public ResponseMetadata()
        {
            AdditionalInfo = new Dictionary<string, object>();
        }
    }

    /// <summary>
    /// Upload progress response
    /// </summary>
    public class UploadProgressResponse
    {
        public string UploadId { get; set; }
        public string Status { get; set; }
        public int Progress { get; set; } // 0-100
        public string Message { get; set; }
        public long BytesUploaded { get; set; }
        public long TotalBytes { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EstimatedCompletion { get; set; }
    }

    /// <summary>
    /// Model import response from NOUFAL API
    /// </summary>
    public class ModelImportResponse
    {
        public string ModelId { get; set; }
        public string ProjectId { get; set; }
        public string FileName { get; set; }
        public int ElementsImported { get; set; }
        public long FileSizeBytes { get; set; }
        public DateTime ImportedAt { get; set; }
        public ImportStatistics Statistics { get; set; }
        public string ViewerUrl { get; set; }
        public List<ImportWarning> Warnings { get; set; }

        public ModelImportResponse()
        {
            Warnings = new List<ImportWarning>();
        }
    }

    /// <summary>
    /// Statistics from model import
    /// </summary>
    public class ImportStatistics
    {
        public int TotalElements { get; set; }
        public int ElementsWithGeometry { get; set; }
        public int ElementsWithProperties { get; set; }
        public Dictionary<string, int> ElementsByCategory { get; set; }
        public TimeSpan ProcessingTime { get; set; }
        public long DataSizeBytes { get; set; }

        public ImportStatistics()
        {
            ElementsByCategory = new Dictionary<string, int>();
        }
    }

    /// <summary>
    /// Import warning message
    /// </summary>
    public class ImportWarning
    {
        public string Severity { get; set; } // "Info", "Warning", "Error"
        public string Message { get; set; }
        public string ElementId { get; set; }
        public string ElementName { get; set; }
        public string Code { get; set; }

        public ImportWarning() { }

        public ImportWarning(string severity, string message, string elementId = null)
        {
            Severity = severity;
            Message = message;
            ElementId = elementId;
        }
    }

    /// <summary>
    /// Authentication response
    /// </summary>
    public class AuthResponse
    {
        public bool Authenticated { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public UserInfo User { get; set; }
    }

    /// <summary>
    /// User information
    /// </summary>
    public class UserInfo
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public List<string> Permissions { get; set; }

        public UserInfo()
        {
            Permissions = new List<string>();
        }
    }

    /// <summary>
    /// Project list response
    /// </summary>
    public class ProjectListResponse
    {
        public List<ProjectInfo> Projects { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }

        public ProjectListResponse()
        {
            Projects = new List<ProjectInfo>();
        }
    }

    /// <summary>
    /// Project information
    /// </summary>
    public class ProjectInfo
    {
        public string ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ModelCount { get; set; }
        public string ThumbnailUrl { get; set; }
    }

    /// <summary>
    /// Validation result
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationError> Errors { get; set; }

        public ValidationResult()
        {
            IsValid = true;
            Errors = new List<ValidationError>();
        }

        public void AddError(string field, string message)
        {
            IsValid = false;
            Errors.Add(new ValidationError { Field = field, Message = message });
        }
    }

    /// <summary>
    /// Validation error
    /// </summary>
    public class ValidationError
    {
        public string Field { get; set; }
        public string Message { get; set; }
        public string Code { get; set; }
    }
}
