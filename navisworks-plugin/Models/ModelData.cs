using System;
using System.Collections.Generic;

namespace NOUFAL.NavisworksPlugin.Models
{
    /// <summary>
    /// Represents complete model data for export
    /// </summary>
    public class ModelData
    {
        public string FileName { get; set; }
        public string Title { get; set; }
        public string Units { get; set; }
        public string Author { get; set; }
        public DateTime? LastModified { get; set; }
        public string FileSize { get; set; }
        public BoundingBoxData BoundingBox { get; set; }
        public List<ElementData> Elements { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
        public ExportStatistics Statistics { get; set; }

        public ModelData()
        {
            Elements = new List<ElementData>();
            Metadata = new Dictionary<string, string>();
            Statistics = new ExportStatistics();
        }
    }

    /// <summary>
    /// 3D bounding box data
    /// </summary>
    public class BoundingBoxData
    {
        public double MinX { get; set; }
        public double MinY { get; set; }
        public double MinZ { get; set; }
        public double MaxX { get; set; }
        public double MaxY { get; set; }
        public double MaxZ { get; set; }

        public double Width => MaxX - MinX;
        public double Height => MaxY - MinY;
        public double Depth => MaxZ - MinZ;

        public bool IsValid => Width > 0 && Height > 0 && Depth > 0;
    }

    /// <summary>
    /// Export statistics
    /// </summary>
    public class ExportStatistics
    {
        public int TotalElements { get; set; }
        public int ElementsWithGeometry { get; set; }
        public int ElementsWithProperties { get; set; }
        public Dictionary<string, int> ElementsByCategory { get; set; }
        public DateTime ExportStartTime { get; set; }
        public DateTime ExportEndTime { get; set; }
        public TimeSpan Duration => ExportEndTime - ExportStartTime;

        public ExportStatistics()
        {
            ElementsByCategory = new Dictionary<string, int>();
            ExportStartTime = DateTime.Now;
        }
    }
}
