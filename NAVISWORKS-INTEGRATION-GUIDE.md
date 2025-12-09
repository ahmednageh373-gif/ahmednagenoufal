# 🏗️ Navisworks Integration Guide for NOUFAL

## 📋 Overview

This guide explains how to integrate Autodesk Navisworks with the NOUFAL project management platform using the Navisworks .NET API and COM API.

---

## 🎯 Integration Objectives

### What We Want to Achieve:

1. **4D BIM Visualization** - Display Navisworks models in NOUFAL
2. **Schedule Synchronization** - Link project schedules with 4D timeline
3. **Clash Detection Integration** - Import clash reports
4. **Model Data Extraction** - Extract quantities, properties, and metadata
5. **Automated Workflows** - Automate file conversions and updates

---

## 🛠️ Development Environment Setup

### Prerequisites:

```
✅ Autodesk Navisworks Manage/Simulate (2020+)
✅ Microsoft Visual Studio 2019/2022
✅ .NET Framework 4.8 or .NET 6+
✅ Node.js 18+ (for NOUFAL backend)
✅ Python 3.10+ (for automation scripts)
```

### Installation Steps:

#### 1. Navisworks API Location:

```
Default Installation Path:
C:\Program Files\Autodesk\Navisworks Manage 2024\api\

Key Files:
- Autodesk.Navisworks.Api.dll
- Autodesk.Navisworks.Automation.dll
- Autodesk.Navisworks.Interop.ComApi.dll
- Developer's Guide (PDF)
- Reference Guide (CHM)
```

#### 2. Visual Studio Configuration:

```csharp
// Add references to your C# project:
References > Add Reference > Browse

Required DLLs:
1. Autodesk.Navisworks.Api.dll
2. Autodesk.Navisworks.Automation.dll
3. Autodesk.Navisworks.Interop.ComApi.dll

Set "Copy Local" to False for all references
```

---

## 🔌 Integration Architecture

### High-Level Architecture:

```
┌─────────────────────────────────────────────────────┐
│                  NOUFAL Frontend                    │
│             (React + TypeScript)                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│              NOUFAL Backend API                      │
│            (Node.js / Python FastAPI)                │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                  ↓
┌──────────────┐  ┌──────────────────┐
│   .NET API   │  │   Python Bridge   │
│   Bridge     │  │   (ifcopenshell)  │
└──────┬───────┘  └──────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│     Navisworks Automation API        │
│  (File Processing & Data Extraction) │
└──────────────────────────────────────┘
```

---

## 💻 Implementation: NOUFAL Plugin for Navisworks

### 1. Basic Plugin Structure

Create a new C# Class Library project named `NOUFAL.NavisworksPlugin`:

```csharp
// NOUFAL.NavisworksPlugin/NOUFALPlugin.cs

using System;
using System.Windows.Forms;
using Autodesk.Navisworks.Api;
using Autodesk.Navisworks.Api.Plugins;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace NOUFAL.NavisworksPlugin
{
    [Plugin("NOUFAL.Integration",
            "NOUFAL",
            ToolTip = "Export model data to NOUFAL platform",
            DisplayName = "Export to NOUFAL")]
    [AddInPlugin(AddInLocation.AddIn)]
    public class NOUFALPlugin : AddInPlugin
    {
        private static readonly HttpClient client = new HttpClient();
        private const string API_BASE_URL = "https://ahmednagenoufal.com/api";

        public override int Execute(params string[] parameters)
        {
            try
            {
                // Get active document
                Document doc = Application.ActiveDocument;
                
                if (doc == null || !doc.IsClear)
                {
                    MessageBox.Show("Please open a Navisworks document first.");
                    return 1;
                }

                // Show export dialog
                var exportDialog = new ExportDialog();
                if (exportDialog.ShowDialog() == DialogResult.OK)
                {
                    ExportToNOUFAL(doc, exportDialog.ProjectId);
                }

                return 0;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "NOUFAL Export Error");
                return 1;
            }
        }

        private async void ExportToNOUFAL(Document doc, string projectId)
        {
            try
            {
                // Extract model data
                var modelData = ExtractModelData(doc);
                
                // Convert to JSON
                var json = JsonConvert.SerializeObject(modelData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Send to NOUFAL API
                var response = await client.PostAsync(
                    $"{API_BASE_URL}/projects/{projectId}/navisworks/import",
                    content
                );

                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Model data exported to NOUFAL successfully!");
                }
                else
                {
                    MessageBox.Show($"Export failed: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Export error: {ex.Message}");
            }
        }

        private ModelData ExtractModelData(Document doc)
        {
            var modelData = new ModelData
            {
                FileName = doc.FileName,
                Title = doc.Title,
                Units = doc.Units.ToString(),
                BoundingBox = ExtractBoundingBox(doc),
                Elements = new List<ElementData>()
            };

            // Extract selection or all visible items
            ModelItemCollection items = doc.CurrentSelection.SelectedItems.Count > 0
                ? doc.CurrentSelection.SelectedItems
                : doc.Models.RootItems.DescendantsAndSelf;

            foreach (ModelItem item in items)
            {
                var element = ExtractElementData(item);
                if (element != null)
                {
                    modelData.Elements.Add(element);
                }
            }

            return modelData;
        }

        private ElementData ExtractElementData(ModelItem item)
        {
            if (item.IsHidden || item.Geometry == null)
                return null;

            var element = new ElementData
            {
                Id = item.InstanceGuid.ToString(),
                DisplayName = item.DisplayName,
                ClassDisplayName = item.ClassDisplayName,
                Category = item.ClassDisplayName,
                Properties = new Dictionary<string, string>()
            };

            // Extract properties
            foreach (PropertyCategory category in item.PropertyCategories)
            {
                foreach (DataProperty prop in category.Properties)
                {
                    element.Properties[$"{category.DisplayName}.{prop.DisplayName}"] = 
                        prop.Value.ToDisplayString();
                }
            }

            // Extract geometry bounds
            if (item.BoundingBox().IsValid)
            {
                var bbox = item.BoundingBox();
                element.BoundingBox = new BoundingBoxData
                {
                    MinX = bbox.Min.X,
                    MinY = bbox.Min.Y,
                    MinZ = bbox.Min.Z,
                    MaxX = bbox.Max.X,
                    MaxY = bbox.Max.Y,
                    MaxZ = bbox.Max.Z
                };
            }

            return element;
        }

        private BoundingBoxData ExtractBoundingBox(Document doc)
        {
            var bbox = doc.Models.First.BoundingBox();
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

    // Data classes
    public class ModelData
    {
        public string FileName { get; set; }
        public string Title { get; set; }
        public string Units { get; set; }
        public BoundingBoxData BoundingBox { get; set; }
        public List<ElementData> Elements { get; set; }
    }

    public class ElementData
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string ClassDisplayName { get; set; }
        public string Category { get; set; }
        public Dictionary<string, string> Properties { get; set; }
        public BoundingBoxData BoundingBox { get; set; }
    }

    public class BoundingBoxData
    {
        public double MinX { get; set; }
        public double MinY { get; set; }
        public double MinZ { get; set; }
        public double MaxX { get; set; }
        public double MaxY { get; set; }
        public double MaxZ { get; set; }
    }
}
```

---

## 🤖 Automation: Batch Processing

### 2. Navisworks Automation for File Conversion

Create a console application `NOUFAL.NavisworksAutomation`:

```csharp
// NOUFAL.NavisworksAutomation/Program.cs

using System;
using System.IO;
using Autodesk.Navisworks.Api.Automation;

namespace NOUFAL.NavisworksAutomation
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 2)
            {
                Console.WriteLine("Usage: NOUFAL.NavisworksAutomation <input-folder> <output-folder>");
                return;
            }

            string inputFolder = args[0];
            string outputFolder = args[1];

            ProcessFiles(inputFolder, outputFolder);
        }

        static void ProcessFiles(string inputFolder, string outputFolder)
        {
            NavisworksApplication app = null;
            
            try
            {
                app = new NavisworksApplication();
                app.DisableProgress();

                // Supported file extensions
                string[] extensions = { "*.rvt", "*.dwg", "*.ifc", "*.nwd", "*.nwc" };

                foreach (string ext in extensions)
                {
                    string[] files = Directory.GetFiles(inputFolder, ext, SearchOption.AllDirectories);
                    
                    foreach (string file in files)
                    {
                        ProcessFile(app, file, outputFolder);
                    }
                }

                app.EnableProgress();
                Console.WriteLine("Processing complete!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            finally
            {
                if (app != null)
                {
                    app.Dispose();
                }
            }
        }

        static void ProcessFile(NavisworksApplication app, string inputFile, string outputFolder)
        {
            try
            {
                Console.WriteLine($"Processing: {inputFile}");

                // Open file
                app.OpenFile(inputFile);

                // Generate output filename
                string fileName = Path.GetFileNameWithoutExtension(inputFile);
                string outputFile = Path.Combine(outputFolder, fileName + ".nwd");

                // Save as NWD
                app.SaveFile(outputFile);

                // Also export to NWF (for federation)
                string nwfFile = Path.Combine(outputFolder, fileName + ".nwf");
                app.SaveFile(nwfFile);

                Console.WriteLine($"  → Saved: {outputFile}");
                Console.WriteLine($"  → Saved: {nwfFile}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  ✗ Failed: {ex.Message}");
            }
        }
    }
}
```

---

## 🐍 Python Bridge for Advanced Processing

### 3. Python Script for IFC Integration

```python
# scripts/navisworks_integration.py

import ifcopenshell
import ifcopenshell.geom
import json
import requests
from pathlib import Path

class NavisworksNOUFALBridge:
    """Bridge between Navisworks/IFC files and NOUFAL platform"""
    
    def __init__(self, api_base_url="https://ahmednagenoufal.com/api"):
        self.api_base_url = api_base_url
        
    def process_ifc_file(self, ifc_path: str, project_id: str):
        """Process IFC file and export to NOUFAL"""
        print(f"Processing IFC file: {ifc_path}")
        
        # Open IFC file
        ifc_file = ifcopenshell.open(ifc_path)
        
        # Extract model data
        model_data = {
            "fileName": Path(ifc_path).name,
            "title": ifc_file.by_type("IfcProject")[0].Name if ifc_file.by_type("IfcProject") else "Unnamed",
            "schema": ifc_file.schema,
            "elements": []
        }
        
        # Extract elements
        settings = ifcopenshell.geom.settings()
        settings.set(settings.USE_WORLD_COORDS, True)
        
        for product in ifc_file.by_type("IfcProduct"):
            element_data = self.extract_element_data(product, settings)
            if element_data:
                model_data["elements"].append(element_data)
        
        # Send to NOUFAL API
        self.send_to_noufal(model_data, project_id)
        
    def extract_element_data(self, product, settings):
        """Extract element data from IFC product"""
        try:
            element = {
                "id": product.GlobalId,
                "displayName": product.Name or "Unnamed",
                "type": product.is_a(),
                "properties": {}
            }
            
            # Extract properties
            for definition in product.IsDefinedBy:
                if definition.is_a('IfcRelDefinesByProperties'):
                    property_set = definition.RelatingPropertyDefinition
                    if property_set.is_a('IfcPropertySet'):
                        for prop in property_set.HasProperties:
                            if prop.is_a('IfcPropertySingleValue'):
                                element["properties"][prop.Name] = str(prop.NominalValue.wrappedValue) if prop.NominalValue else None
            
            # Extract geometry if available
            if product.Representation:
                shape = ifcopenshell.geom.create_shape(settings, product)
                vertices = shape.geometry.verts
                
                # Calculate bounding box
                element["boundingBox"] = {
                    "minX": min(vertices[::3]),
                    "minY": min(vertices[1::3]),
                    "minZ": min(vertices[2::3]),
                    "maxX": max(vertices[::3]),
                    "maxY": max(vertices[1::3]),
                    "maxZ": max(vertices[2::3])
                }
            
            return element
            
        except Exception as e:
            print(f"Error extracting element {product.GlobalId}: {e}")
            return None
    
    def send_to_noufal(self, model_data: dict, project_id: str):
        """Send extracted data to NOUFAL API"""
        url = f"{self.api_base_url}/projects/{project_id}/navisworks/import"
        
        try:
            response = requests.post(
                url,
                json=model_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"✅ Successfully exported to NOUFAL project {project_id}")
            else:
                print(f"❌ Export failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ API request failed: {e}")

# Usage example
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python navisworks_integration.py <ifc-file> <project-id>")
        sys.exit(1)
    
    ifc_file = sys.argv[1]
    project_id = sys.argv[2]
    
    bridge = NavisworksNOUFALBridge()
    bridge.process_ifc_file(ifc_file, project_id)
```

---

## 🌐 NOUFAL Backend API Integration

### 4. Node.js API Endpoint

```typescript
// src/api/routes/navisworks.ts

import express, { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { NavisworksService } from '../services/navisworks.service';

const router: Router = express.Router();
const navisworksService = new NavisworksService();

/**
 * POST /api/projects/:projectId/navisworks/import
 * Import Navisworks model data
 */
router.post(
  '/projects/:projectId/navisworks/import',
  [
    param('projectId').isString().notEmpty(),
    body('fileName').isString().notEmpty(),
    body('title').isString().optional(),
    body('elements').isArray()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { projectId } = req.params;
      const modelData = req.body;

      // Process and store model data
      const result = await navisworksService.importModelData(projectId, modelData);

      res.json({
        success: true,
        message: 'Model data imported successfully',
        data: result
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import model data',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/projects/:projectId/navisworks/models
 * Get all Navisworks models for a project
 */
router.get(
  '/projects/:projectId/navisworks/models',
  [param('projectId').isString().notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const models = await navisworksService.getProjectModels(projectId);

      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      console.error('Get models error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve models',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/projects/:projectId/navisworks/models/:modelId/elements
 * Get elements from a specific model
 */
router.get(
  '/projects/:projectId/navisworks/models/:modelId/elements',
  [
    param('projectId').isString().notEmpty(),
    param('modelId').isString().notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const { projectId, modelId } = req.params;
      const { category, search } = req.query;

      const elements = await navisworksService.getModelElements(
        projectId,
        modelId,
        {
          category: category as string,
          search: search as string
        }
      );

      res.json({
        success: true,
        data: elements
      });
    } catch (error) {
      console.error('Get elements error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve elements',
        error: error.message
      });
    }
  }
);

export default router;
```

---

## 📊 Data Storage Schema

### 5. Database Schema for Navisworks Data

```typescript
// src/models/navisworks.model.ts

import { Schema, model, Document } from 'mongoose';

// NavisworksModel interface
export interface INavisworksModel extends Document {
  projectId: string;
  fileName: string;
  title: string;
  units: string;
  schema?: string;
  boundingBox: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
  uploadedAt: Date;
  uploadedBy: string;
  fileSize: number;
  elementCount: number;
}

const NavisworksModelSchema = new Schema<INavisworksModel>({
  projectId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  title: { type: String },
  units: { type: String },
  schema: { type: String },
  boundingBox: {
    minX: Number,
    minY: Number,
    minZ: Number,
    maxX: Number,
    maxY: Number,
    maxZ: Number
  },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
  fileSize: { type: Number },
  elementCount: { type: Number }
});

export const NavisworksModel = model<INavisworksModel>('NavisworksModel', NavisworksModelSchema);

// ModelElement interface
export interface IModelElement extends Document {
  modelId: string;
  projectId: string;
  elementId: string;
  displayName: string;
  type: string;
  category: string;
  properties: Map<string, string>;
  boundingBox?: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
}

const ModelElementSchema = new Schema<IModelElement>({
  modelId: { type: String, required: true, index: true },
  projectId: { type: String, required: true, index: true },
  elementId: { type: String, required: true, unique: true },
  displayName: { type: String },
  type: { type: String },
  category: { type: String, index: true },
  properties: { type: Map, of: String },
  boundingBox: {
    minX: Number,
    minY: Number,
    minZ: Number,
    maxX: Number,
    maxY: Number,
    maxZ: Number
  }
});

export const ModelElement = model<IModelElement>('ModelElement', ModelElementSchema);
```

---

## 🎨 Frontend Integration

### 6. React Component for 4D Viewer

```typescript
// src/components/Navisworks4DViewer.tsx

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Navisworks4DViewerProps {
  projectId: string;
  modelId: string;
}

export const Navisworks4DViewer: React.FC<Navisworks4DViewerProps> = ({
  projectId,
  modelId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(100, 100, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Load model data
    loadModelData(projectId, modelId, scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      controls.dispose();
    };
  }, [projectId, modelId]);

  const loadModelData = async (
    projectId: string,
    modelId: string,
    scene: THREE.Scene
  ) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `/api/projects/${projectId}/navisworks/models/${modelId}/elements`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load model data');
      }

      const { data: elements } = await response.json();

      // Create geometry for each element
      elements.forEach((element: any) => {
        if (element.boundingBox) {
          const bbox = element.boundingBox;
          const width = bbox.maxX - bbox.minX;
          const height = bbox.maxY - bbox.minY;
          const depth = bbox.maxZ - bbox.minZ;

          const geometry = new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff,
            transparent: true,
            opacity: 0.8
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(
            (bbox.minX + bbox.maxX) / 2,
            (bbox.minY + bbox.maxY) / 2,
            (bbox.minZ + bbox.maxZ) / 2
          );

          mesh.userData = element;
          scene.add(mesh);
        }
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p>Error loading model: {error}</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
};
```

---

## 🚀 Deployment & Installation

### 7. Plugin Installation Guide

```markdown
# Installing NOUFAL Plugin for Navisworks

## Step 1: Build the Plugin

1. Open `NOUFAL.NavisworksPlugin.sln` in Visual Studio
2. Set build configuration to "Release"
3. Build the solution (Ctrl+Shift+B)

## Step 2: Deploy the Plugin

Copy these files to Navisworks plugins folder:

```
Source: bin\Release\
Destination: C:\ProgramData\Autodesk\ApplicationPlugins\NOUFAL.bundle\

Files:
- NOUFAL.NavisworksPlugin.dll
- Newtonsoft.Json.dll
- PackageContents.xml
```

## Step 3: PackageContents.xml

Create `PackageContents.xml` in the bundle folder:

```xml
<?xml version="1.0" encoding="utf-8"?>
<ApplicationPackage 
  SchemaVersion="1.0" 
  ProductType="Application"
  Name="NOUFAL Integration" 
  Description="Export Navisworks models to NOUFAL platform"
  Author="NOUFAL Team"
  AppVersion="1.0.0"
  ProductCode="{YOUR-GUID-HERE}">
  
  <CompanyDetails 
    Name="NOUFAL" 
    Url="https://ahmednagenoufal.com" 
    Email="support@ahmednagenoufal.com"/>
  
  <Components Description="NOUFAL Plugin">
    <RuntimeRequirements 
      OS="Win64" 
      Platform="Navisworks" 
      SeriesMin="2020" 
      SeriesMax="2024"/>
    
    <ComponentEntry 
      AppName="NOUFAL" 
      ModuleName="./NOUFAL.NavisworksPlugin.dll" 
      AppDescription="NOUFAL Integration Plugin" 
      LoadOnCommandInvocation="True" 
      LoadOnRevitStartup="True"/>
  </Components>
</ApplicationPackage>
```

## Step 4: Verify Installation

1. Restart Navisworks
2. Go to: Add-Ins → External Tools
3. You should see "Export to NOUFAL" option
```

---

## 📚 Additional Resources

### Documentation:
- **Navisworks API**: https://aps.autodesk.com/developer/overview/navisworks
- **IFCOpenShell**: https://ifcopenshell.org/docs/
- **Three.js**: https://threejs.org/docs/

### Sample Projects:
- Located in: `examples/navisworks-integration/`

### Support:
- GitHub Issues: https://github.com/ahmednageh373-gif/ahmednagenoufal/issues
- Documentation: Inside project `/docs/navisworks/`

---

**Status**: 🚧 Implementation Guide\
**Last Updated**: 2024-11-12\
**Version**: 1.0.0
