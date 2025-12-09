using System;
using System.Collections.Generic;
using Autodesk.Navisworks.Api;
using Autodesk.Navisworks.Api.Interop.ComApi;
using NOUFAL.NavisworksPlugin.Models;
using ComApi = Autodesk.Navisworks.Api.Interop.ComApi;
using ComApiBridge = Autodesk.Navisworks.Api.ComApi;

namespace NOUFAL.NavisworksPlugin.Services
{
    /// <summary>
    /// Service for extracting geometry data using COM API
    /// </summary>
    public class GeometryExtractor
    {
        /// <summary>
        /// Extract geometry from a ModelItem
        /// </summary>
        public GeometryData ExtractGeometry(ModelItem item)
        {
            if (item == null || !item.HasGeometry)
                return null;

            try
            {
                var geometryData = new GeometryData();

                // Convert to COM object to access geometry
                var comState = ComApiBridge.ComApiBridge.State;
                var comItem = ComApiBridge.ComApiBridge.ToInwOaPath(item);

                if (comItem == null)
                    return null;

                // Create geometry walker to traverse fragments
                var walker = new GeometryWalker();
                walker.ProcessItem(comItem, geometryData);

                // Validate geometry
                if (geometryData.IsValid())
                    return geometryData;

                return null;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error extracting geometry: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Helper class to walk through geometry fragments
        /// </summary>
        private class GeometryWalker
        {
            private int _vertexOffset = 0;

            public void ProcessItem(InwOaPath path, GeometryData geometryData)
            {
                try
                {
                    // Get fragments from path
                    var fragments = path as InwOaFragments;
                    if (fragments == null) return;

                    // Process each fragment
                    foreach (InwOaFragment3 fragment in fragments)
                    {
                        ProcessFragment(fragment, geometryData);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error processing item: {ex.Message}");
                }
            }

            private void ProcessFragment(InwOaFragment3 fragment, GeometryData geometryData)
            {
                try
                {
                    // Get geometry from fragment
                    var geometry = fragment.Geometry;
                    if (geometry == null) return;

                    // Get primitives (triangles, lines, etc.)
                    var primitives = geometry.Primitives();
                    if (primitives == null) return;

                    // Process each primitive
                    foreach (InwOaPrimitive primitive in primitives)
                    {
                        ProcessPrimitive(primitive, geometryData);
                    }

                    // Get transformation matrix
                    var transform = fragment.GetLocalToWorldMatrix();
                    if (transform != null)
                    {
                        geometryData.Transform = MatrixToArray(transform);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error processing fragment: {ex.Message}");
                }
            }

            private void ProcessPrimitive(InwOaPrimitive primitive, GeometryData geometryData)
            {
                try
                {
                    // Check if it's a triangle primitive
                    var triangles = primitive as InwOaPrimitiveTriangles;
                    if (triangles == null) return;

                    // Get vertices
                    var vertices = triangles.Vertices();
                    if (vertices == null) return;

                    int vertexCount = vertices.Count;
                    var startOffset = _vertexOffset;

                    // Extract vertex data
                    for (int i = 0; i < vertexCount; i++)
                    {
                        var vertex = vertices[i + 1]; // COM arrays are 1-based
                        
                        // Position
                        geometryData.Vertices.Add(vertex.coord1);
                        geometryData.Vertices.Add(vertex.coord2);
                        geometryData.Vertices.Add(vertex.coord3);

                        // Normal (if available)
                        if (vertex.normal1 != 0 || vertex.normal2 != 0 || vertex.normal3 != 0)
                        {
                            geometryData.Normals.Add(vertex.normal1);
                            geometryData.Normals.Add(vertex.normal2);
                            geometryData.Normals.Add(vertex.normal3);
                        }

                        // UV coordinates (if available)
                        if (vertex.tex_coord1 != 0 || vertex.tex_coord2 != 0)
                        {
                            geometryData.UVs.Add(vertex.tex_coord1);
                            geometryData.UVs.Add(vertex.tex_coord2);
                        }
                    }

                    // Get indices (triangle strip or list)
                    var triangleCount = vertexCount / 3;
                    for (int i = 0; i < triangleCount; i++)
                    {
                        int baseIndex = startOffset + (i * 3);
                        geometryData.Indices.Add(baseIndex);
                        geometryData.Indices.Add(baseIndex + 1);
                        geometryData.Indices.Add(baseIndex + 2);
                    }

                    _vertexOffset += vertexCount;
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error processing primitive: {ex.Message}");
                }
            }

            /// <summary>
            /// Convert COM matrix to array
            /// </summary>
            private double[] MatrixToArray(InwLTransform3f transform)
            {
                try
                {
                    var matrix = new double[16];
                    var data = transform.Matrix;

                    // COM matrix is row-major 4x4
                    for (int i = 0; i < 16; i++)
                    {
                        matrix[i] = data[i + 1]; // COM arrays are 1-based
                    }

                    return matrix;
                }
                catch
                {
                    // Return identity matrix on error
                    return new double[16] { 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 };
                }
            }
        }

        /// <summary>
        /// Simplify geometry by reducing triangle count (optional optimization)
        /// </summary>
        public GeometryData SimplifyGeometry(GeometryData geometry, double tolerance = 0.01)
        {
            if (geometry == null || !geometry.IsValid())
                return geometry;

            try
            {
                // Simple decimation algorithm
                // In production, you might want to use a more sophisticated algorithm
                // like edge collapse or vertex clustering

                var simplified = new GeometryData
                {
                    Transform = geometry.Transform
                };

                // For now, just copy the geometry
                // TODO: Implement actual simplification algorithm
                simplified.Vertices = new List<double>(geometry.Vertices);
                simplified.Indices = new List<int>(geometry.Indices);
                simplified.Normals = new List<double>(geometry.Normals);
                simplified.UVs = new List<double>(geometry.UVs);

                return simplified;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error simplifying geometry: {ex.Message}");
                return geometry;
            }
        }

        /// <summary>
        /// Calculate normals if missing
        /// </summary>
        public void CalculateNormals(GeometryData geometry)
        {
            if (geometry == null || !geometry.IsValid())
                return;

            try
            {
                // Clear existing normals
                geometry.Normals.Clear();

                // Calculate per-vertex normals
                int vertexCount = geometry.VertexCount;
                var normals = new List<Vector3>(vertexCount);

                // Initialize with zero vectors
                for (int i = 0; i < vertexCount; i++)
                {
                    normals.Add(new Vector3(0, 0, 0));
                }

                // Calculate face normals and accumulate
                for (int i = 0; i < geometry.Indices.Count; i += 3)
                {
                    int i0 = geometry.Indices[i];
                    int i1 = geometry.Indices[i + 1];
                    int i2 = geometry.Indices[i + 2];

                    var v0 = GetVertex(geometry, i0);
                    var v1 = GetVertex(geometry, i1);
                    var v2 = GetVertex(geometry, i2);

                    var edge1 = v1 - v0;
                    var edge2 = v2 - v0;
                    var normal = Vector3.Cross(edge1, edge2);

                    normals[i0] += normal;
                    normals[i1] += normal;
                    normals[i2] += normal;
                }

                // Normalize and add to geometry
                foreach (var normal in normals)
                {
                    var normalized = Vector3.Normalize(normal);
                    geometry.Normals.Add(normalized.X);
                    geometry.Normals.Add(normalized.Y);
                    geometry.Normals.Add(normalized.Z);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error calculating normals: {ex.Message}");
            }
        }

        private Vector3 GetVertex(GeometryData geometry, int index)
        {
            int offset = index * 3;
            return new Vector3(
                geometry.Vertices[offset],
                geometry.Vertices[offset + 1],
                geometry.Vertices[offset + 2]
            );
        }

        /// <summary>
        /// Simple 3D vector for calculations
        /// </summary>
        private struct Vector3
        {
            public double X, Y, Z;

            public Vector3(double x, double y, double z)
            {
                X = x;
                Y = y;
                Z = z;
            }

            public static Vector3 operator +(Vector3 a, Vector3 b)
            {
                return new Vector3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
            }

            public static Vector3 operator -(Vector3 a, Vector3 b)
            {
                return new Vector3(a.X - b.X, a.Y - b.Y, a.Z - b.Z);
            }

            public static Vector3 Cross(Vector3 a, Vector3 b)
            {
                return new Vector3(
                    a.Y * b.Z - a.Z * b.Y,
                    a.Z * b.X - a.X * b.Z,
                    a.X * b.Y - a.Y * b.X
                );
            }

            public static Vector3 Normalize(Vector3 v)
            {
                double length = Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);
                if (length < 0.0001) return new Vector3(0, 0, 1);
                return new Vector3(v.X / length, v.Y / length, v.Z / length);
            }
        }
    }
}
