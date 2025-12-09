using System;
using System.Collections.Generic;

namespace NOUFAL.NavisworksPlugin.Models
{
    /// <summary>
    /// Represents a single element (node) from the Navisworks model
    /// </summary>
    public class ElementData
    {
        /// <summary>
        /// Unique identifier for this element
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Display name of the element
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Element type/category (e.g., "Wall", "Door", "Column")
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Parent element ID (for hierarchical structure)
        /// </summary>
        public string ParentId { get; set; }

        /// <summary>
        /// Path in the model hierarchy
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// Element bounding box
        /// </summary>
        public BoundingBoxData BoundingBox { get; set; }

        /// <summary>
        /// All properties from Navisworks (PropertyCategories)
        /// </summary>
        public Dictionary<string, Dictionary<string, PropertyValue>> Properties { get; set; }

        /// <summary>
        /// Geometry data (if requested)
        /// </summary>
        public GeometryData Geometry { get; set; }

        /// <summary>
        /// Material information
        /// </summary>
        public MaterialData Material { get; set; }

        /// <summary>
        /// Additional metadata
        /// </summary>
        public ElementMetadata Metadata { get; set; }

        public ElementData()
        {
            Properties = new Dictionary<string, Dictionary<string, PropertyValue>>();
        }
    }

    /// <summary>
    /// Property value with type information
    /// </summary>
    public class PropertyValue
    {
        public string DisplayName { get; set; }
        public object Value { get; set; }
        public string Type { get; set; }
        public string Units { get; set; }

        public PropertyValue() { }

        public PropertyValue(string displayName, object value, string type = "String", string units = null)
        {
            DisplayName = displayName;
            Value = value;
            Type = type;
            Units = units;
        }

        public override string ToString()
        {
            if (Value == null) return string.Empty;
            return Units != null ? $"{Value} {Units}" : Value.ToString();
        }
    }

    /// <summary>
    /// Geometry data for an element
    /// </summary>
    public class GeometryData
    {
        /// <summary>
        /// Triangulated mesh vertices (flat array: x1,y1,z1,x2,y2,z2,...)
        /// </summary>
        public List<double> Vertices { get; set; }

        /// <summary>
        /// Triangle indices (every 3 indices form a triangle)
        /// </summary>
        public List<int> Indices { get; set; }

        /// <summary>
        /// Vertex normals (same length as Vertices)
        /// </summary>
        public List<double> Normals { get; set; }

        /// <summary>
        /// UV coordinates for texture mapping (optional)
        /// </summary>
        public List<double> UVs { get; set; }

        /// <summary>
        /// Number of triangles in this geometry
        /// </summary>
        public int TriangleCount => Indices?.Count / 3 ?? 0;

        /// <summary>
        /// Number of vertices
        /// </summary>
        public int VertexCount => Vertices?.Count / 3 ?? 0;

        /// <summary>
        /// Transformation matrix (4x4, row-major)
        /// </summary>
        public double[] Transform { get; set; }

        public GeometryData()
        {
            Vertices = new List<double>();
            Indices = new List<int>();
            Normals = new List<double>();
            UVs = new List<double>();
            Transform = new double[16] { 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 }; // Identity matrix
        }

        /// <summary>
        /// Checks if geometry data is valid
        /// </summary>
        public bool IsValid()
        {
            return Vertices != null && Vertices.Count > 0 &&
                   Indices != null && Indices.Count > 0 &&
                   Vertices.Count % 3 == 0 &&
                   Indices.Count % 3 == 0;
        }
    }

    /// <summary>
    /// Material/appearance data
    /// </summary>
    public class MaterialData
    {
        public string Name { get; set; }
        public ColorData DiffuseColor { get; set; }
        public ColorData AmbientColor { get; set; }
        public ColorData SpecularColor { get; set; }
        public double Transparency { get; set; }
        public double Shininess { get; set; }
        public string TexturePath { get; set; }

        public MaterialData()
        {
            Transparency = 0.0;
            Shininess = 0.5;
        }
    }

    /// <summary>
    /// Color data (RGB + Alpha)
    /// </summary>
    public class ColorData
    {
        public double R { get; set; } // 0.0 to 1.0
        public double G { get; set; }
        public double B { get; set; }
        public double A { get; set; } // Alpha/Opacity

        public ColorData()
        {
            R = G = B = 0.5;
            A = 1.0;
        }

        public ColorData(double r, double g, double b, double a = 1.0)
        {
            R = r;
            G = g;
            B = b;
            A = a;
        }

        /// <summary>
        /// Convert to hex color string (#RRGGBB)
        /// </summary>
        public string ToHex()
        {
            int ri = (int)(R * 255);
            int gi = (int)(G * 255);
            int bi = (int)(B * 255);
            return $"#{ri:X2}{gi:X2}{bi:X2}";
        }

        /// <summary>
        /// Convert to RGBA string
        /// </summary>
        public string ToRGBA()
        {
            return $"rgba({(int)(R * 255)}, {(int)(G * 255)}, {(int)(B * 255)}, {A})";
        }
    }

    /// <summary>
    /// Additional element metadata
    /// </summary>
    public class ElementMetadata
    {
        /// <summary>
        /// Element GUID (if available)
        /// </summary>
        public string Guid { get; set; }

        /// <summary>
        /// IFC entity type (if from IFC)
        /// </summary>
        public string IfcType { get; set; }

        /// <summary>
        /// Layer/Level information
        /// </summary>
        public string Layer { get; set; }

        /// <summary>
        /// Is this element visible?
        /// </summary>
        public bool IsVisible { get; set; }

        /// <summary>
        /// Is this element hidden?
        /// </summary>
        public bool IsHidden { get; set; }

        /// <summary>
        /// Element state (Selected, Required, Hidden, etc.)
        /// </summary>
        public string State { get; set; }

        /// <summary>
        /// File path where this element originated
        /// </summary>
        public string SourceFile { get; set; }

        /// <summary>
        /// Creation timestamp
        /// </summary>
        public DateTime? CreatedDate { get; set; }

        /// <summary>
        /// Last modified timestamp
        /// </summary>
        public DateTime? ModifiedDate { get; set; }

        /// <summary>
        /// Custom metadata fields
        /// </summary>
        public Dictionary<string, string> CustomFields { get; set; }

        public ElementMetadata()
        {
            IsVisible = true;
            IsHidden = false;
            CustomFields = new Dictionary<string, string>();
        }
    }
}
