using System;
using System.Collections.Generic;
using System.Linq;
using Autodesk.Navisworks.Api;
using Autodesk.Navisworks.Api.DocumentParts;
using NOUFAL.NavisworksPlugin.Models;

namespace NOUFAL.NavisworksPlugin.Services
{
    /// <summary>
    /// Service for extracting model data from Navisworks Document
    /// </summary>
    public class ModelExtractor
    {
        private readonly GeometryExtractor _geometryExtractor;

        public ModelExtractor()
        {
            _geometryExtractor = new GeometryExtractor();
        }

        /// <summary>
        /// Extract complete model data from Navisworks document
        /// </summary>
        public ModelData ExtractModelData(
            Document document,
            bool exportSelection = false,
            bool includeGeometry = false,
            bool includeProperties = true,
            Action<int, string> progressCallback = null)
        {
            if (document == null)
                throw new ArgumentNullException(nameof(document));

            var modelData = new ModelData();
            var startTime = DateTime.Now;

            try
            {
                progressCallback?.Invoke(5, "جاري جمع معلومات الملف...");

                // Extract file information
                ExtractFileInfo(document, modelData);

                progressCallback?.Invoke(10, "جاري جمع معلومات النموذج...");

                // Extract bounding box
                modelData.BoundingBox = ExtractBoundingBox(document);

                // Get elements to export
                ModelItemCollection itemsToExport = exportSelection
                    ? document.CurrentSelection.SelectedItems
                    : document.Models.RootItems.DescendantsAndSelf;

                if (itemsToExport == null || itemsToExport.Count == 0)
                {
                    throw new InvalidOperationException("No elements to export");
                }

                int totalItems = itemsToExport.Count();
                int processedItems = 0;

                progressCallback?.Invoke(15, $"جاري معالجة {totalItems} عنصر...");

                // Extract elements
                foreach (ModelItem item in itemsToExport)
                {
                    try
                    {
                        var elementData = ExtractElementData(
                            item, 
                            includeGeometry, 
                            includeProperties);

                        if (elementData != null)
                        {
                            modelData.Elements.Add(elementData);
                            modelData.Statistics.TotalElements++;

                            if (elementData.Geometry != null && elementData.Geometry.IsValid())
                                modelData.Statistics.ElementsWithGeometry++;

                            if (elementData.Properties != null && elementData.Properties.Count > 0)
                                modelData.Statistics.ElementsWithProperties++;

                            // Track by category
                            if (!string.IsNullOrEmpty(elementData.Category))
                            {
                                if (modelData.Statistics.ElementsByCategory.ContainsKey(elementData.Category))
                                    modelData.Statistics.ElementsByCategory[elementData.Category]++;
                                else
                                    modelData.Statistics.ElementsByCategory[elementData.Category] = 1;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue processing
                        System.Diagnostics.Debug.WriteLine($"Error processing element: {ex.Message}");
                    }

                    processedItems++;
                    if (processedItems % 100 == 0 || processedItems == totalItems)
                    {
                        int progress = 15 + (int)((processedItems / (double)totalItems) * 80);
                        progressCallback?.Invoke(progress, $"تمت معالجة {processedItems} من {totalItems} عنصر");
                    }
                }

                // Finalize statistics
                modelData.Statistics.ExportEndTime = DateTime.Now;

                progressCallback?.Invoke(98, "جاري إكمال البيانات...");

                // Add metadata
                modelData.Metadata["ExportDate"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                modelData.Metadata["NavisworksVersion"] = Autodesk.Navisworks.Api.Application.Version.ToString();
                modelData.Metadata["IncludeGeometry"] = includeGeometry.ToString();
                modelData.Metadata["IncludeProperties"] = includeProperties.ToString();
                modelData.Metadata["ExportSelection"] = exportSelection.ToString();

                progressCallback?.Invoke(100, "اكتمل التصدير بنجاح!");

                return modelData;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to extract model data: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Extract file information
        /// </summary>
        private void ExtractFileInfo(Document document, ModelData modelData)
        {
            modelData.FileName = document.FileName ?? "Unnamed";
            modelData.Title = document.Title ?? System.IO.Path.GetFileNameWithoutExtension(document.FileName);
            modelData.Units = document.Units?.ToString() ?? "Unknown";
            modelData.Author = document.Author;
            
            // Get file info
            if (!string.IsNullOrEmpty(document.FileName) && System.IO.File.Exists(document.FileName))
            {
                var fileInfo = new System.IO.FileInfo(document.FileName);
                modelData.LastModified = fileInfo.LastWriteTime;
                modelData.FileSize = FormatFileSize(fileInfo.Length);
            }
        }

        /// <summary>
        /// Extract bounding box from document
        /// </summary>
        private BoundingBoxData ExtractBoundingBox(Document document)
        {
            try
            {
                // Get bounding box from all models
                BoundingBox3D bbox = null;

                foreach (Model model in document.Models)
                {
                    if (model.BoundingBox != null)
                    {
                        if (bbox == null)
                            bbox = model.BoundingBox;
                        else
                        {
                            // Merge bounding boxes
                            Point3D min = bbox.Min;
                            Point3D max = bbox.Max;
                            Point3D modelMin = model.BoundingBox.Min;
                            Point3D modelMax = model.BoundingBox.Max;

                            double minX = Math.Min(min.X, modelMin.X);
                            double minY = Math.Min(min.Y, modelMin.Y);
                            double minZ = Math.Min(min.Z, modelMin.Z);
                            double maxX = Math.Max(max.X, modelMax.X);
                            double maxY = Math.Max(max.Y, modelMax.Y);
                            double maxZ = Math.Max(max.Z, modelMax.Z);

                            bbox = new BoundingBox3D(
                                new Point3D(minX, minY, minZ),
                                new Point3D(maxX, maxY, maxZ)
                            );
                        }
                    }
                }

                if (bbox != null)
                {
                    return new BoundingBoxData
                    {
                        MinX = bbox.Min.X,
                        MinY = bbox.Min.Y,
                        MinZ = bbox.Min.Z,
                        MaxX = bbox.Max.X,
                        MaxY = bbox.Max.Y,
                        MaxZ = bbox.Max.Z
                    };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error extracting bounding box: {ex.Message}");
            }

            // Return default bounding box if extraction fails
            return new BoundingBoxData
            {
                MinX = 0, MinY = 0, MinZ = 0,
                MaxX = 100, MaxY = 100, MaxZ = 100
            };
        }

        /// <summary>
        /// Extract data from a single element
        /// </summary>
        private ElementData ExtractElementData(
            ModelItem item,
            bool includeGeometry,
            bool includeProperties)
        {
            try
            {
                var elementData = new ElementData
                {
                    Id = item.InstanceGuid.ToString(),
                    Name = item.DisplayName ?? "Unnamed",
                    Category = GetCategory(item),
                    Path = GetPath(item),
                    BoundingBox = ExtractElementBoundingBox(item),
                    Metadata = new ElementMetadata
                    {
                        Guid = item.InstanceGuid.ToString(),
                        IsVisible = item.IsVisible,
                        IsHidden = item.IsHidden,
                        Layer = item.PropertyCategories.FindPropertyByDisplayName("LcOaNode", "LcOaSceneLayerName")?.Value.ToDisplayString()
                    }
                };

                // Extract properties
                if (includeProperties)
                {
                    elementData.Properties = ExtractProperties(item);
                }

                // Extract geometry
                if (includeGeometry && item.HasGeometry)
                {
                    elementData.Geometry = _geometryExtractor.ExtractGeometry(item);
                }

                // Extract material/color
                elementData.Material = ExtractMaterial(item);

                return elementData;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error extracting element data: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Extract all properties from element
        /// </summary>
        private Dictionary<string, Dictionary<string, PropertyValue>> ExtractProperties(ModelItem item)
        {
            var properties = new Dictionary<string, Dictionary<string, PropertyValue>>();

            try
            {
                foreach (PropertyCategory category in item.PropertyCategories)
                {
                    var categoryProps = new Dictionary<string, PropertyValue>();

                    foreach (DataProperty prop in category.Properties)
                    {
                        try
                        {
                            var propValue = new PropertyValue
                            {
                                DisplayName = prop.DisplayName,
                                Value = prop.Value.ToDisplayString(),
                                Type = prop.Value.DataType.ToString()
                            };

                            categoryProps[prop.Name] = propValue;
                        }
                        catch { }
                    }

                    if (categoryProps.Count > 0)
                    {
                        properties[category.DisplayName] = categoryProps;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error extracting properties: {ex.Message}");
            }

            return properties;
        }

        /// <summary>
        /// Extract element bounding box
        /// </summary>
        private BoundingBoxData ExtractElementBoundingBox(ModelItem item)
        {
            try
            {
                if (item.BoundingBox() != null)
                {
                    var bbox = item.BoundingBox();
                    return new BoundingBoxData
                    {
                        MinX = bbox.Min.X,
                        MinY = bbox.Min.Y,
                        MinZ = bbox.Min.Z,
                        MaxX = bbox.Max.X,
                        MaxY = bbox.Max.Y,
                        MaxZ = bbox.Max.Z
                    };
                }
            }
            catch { }

            return null;
        }

        /// <summary>
        /// Extract material information
        /// </summary>
        private MaterialData ExtractMaterial(ModelItem item)
        {
            try
            {
                var material = new MaterialData();

                // Try to get color from properties
                var colorProp = item.PropertyCategories.FindPropertyByDisplayName("LcOaNode", "LcOaSceneMaterial");
                if (colorProp != null)
                {
                    material.Name = colorProp.Value.ToDisplayString();
                }

                // Default color (gray)
                material.DiffuseColor = new ColorData(0.7, 0.7, 0.7, 1.0);

                return material;
            }
            catch
            {
                return new MaterialData();
            }
        }

        /// <summary>
        /// Get element category
        /// </summary>
        private string GetCategory(ModelItem item)
        {
            try
            {
                // Try to get category from class name
                var classProp = item.PropertyCategories.FindPropertyByDisplayName("Element", "Category");
                if (classProp != null)
                    return classProp.Value.ToDisplayString();

                // Try to get from type
                var typeProp = item.PropertyCategories.FindPropertyByDisplayName("Item", "Type");
                if (typeProp != null)
                    return typeProp.Value.ToDisplayString();

                // Default category based on name
                string name = item.DisplayName?.ToLower() ?? "";
                if (name.Contains("wall")) return "Wall";
                if (name.Contains("door")) return "Door";
                if (name.Contains("window")) return "Window";
                if (name.Contains("column")) return "Column";
                if (name.Contains("beam")) return "Beam";
                if (name.Contains("slab") || name.Contains("floor")) return "Slab";
                if (name.Contains("roof")) return "Roof";

                return "Unknown";
            }
            catch
            {
                return "Unknown";
            }
        }

        /// <summary>
        /// Get element path in hierarchy
        /// </summary>
        private string GetPath(ModelItem item)
        {
            try
            {
                var path = new List<string>();
                var current = item;

                while (current != null)
                {
                    path.Insert(0, current.DisplayName ?? "Unnamed");
                    current = current.Parent;
                }

                return string.Join(" / ", path);
            }
            catch
            {
                return item.DisplayName ?? "Unknown";
            }
        }

        /// <summary>
        /// Format file size
        /// </summary>
        private string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }
}
