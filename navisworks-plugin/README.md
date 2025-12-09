# NOUFAL Navisworks Plugin

Plugin for Autodesk Navisworks to export model data to NOUFAL project management platform.

## Features

- ✅ Export complete model or selected elements
- ✅ Extract geometry data (triangulated meshes)
- ✅ Extract all properties from elements
- ✅ Calculate bounding boxes
- ✅ Extract materials and colors
- ✅ Progress tracking with cancellation support
- ✅ Direct upload to NOUFAL API
- ✅ Arabic UI support

## Requirements

### Development Requirements
- **Visual Studio 2019 or 2022** (Community, Professional, or Enterprise)
- **.NET Framework 4.8**
- **Autodesk Navisworks Manage 2024** (or 2023, 2022, 2021)
  - Free trial: https://www.autodesk.com/products/navisworks/free-trial
  - Educational license: https://www.autodesk.com/education/home

### NuGet Packages
- `Newtonsoft.Json` (v13.0.3) - Automatically installed

## Installation

### 1. Install Prerequisites
```bash
# Install Visual Studio 2019/2022 with:
# - .NET desktop development workload
# - .NET Framework 4.8 targeting pack

# Install Navisworks Manage 2024
# Default installation path: C:\Program Files\Autodesk\Navisworks Manage 2024\
```

### 2. Clone/Download Project
```bash
git clone <repository-url>
cd navisworks-plugin
```

### 3. Open in Visual Studio
1. Open `NOUFAL.NavisworksPlugin.sln` in Visual Studio
2. Restore NuGet packages (right-click solution → Restore NuGet Packages)
3. Build solution (Ctrl+Shift+B)

### 4. Install Plugin in Navisworks

#### Option A: Manual Copy
```bash
# Copy the built DLL to Navisworks plugins folder
copy bin\Release\NOUFAL.NavisworksPlugin.dll "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"
```

#### Option B: Use Post-Build Event (Recommended)
The project includes a post-build event that automatically copies the plugin:

```xml
<!-- Already configured in .csproj -->
<PostBuildEvent>
  xcopy "$(TargetPath)" "$(AppData)\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\" /Y /I
</PostBuildEvent>
```

### 5. Verify Installation
1. Open Navisworks Manage
2. Go to **Add-Ins** tab → **External Tools** panel
3. You should see **"Export to NOUFAL"** button

## Usage

### Export Model to NOUFAL

1. **Open Model in Navisworks**
   - Open any .nwf, .nwd, .nwc, or source format file (Revit, IFC, etc.)

2. **Configure Export**
   - Click **Add-Ins → External Tools → Export to NOUFAL**
   - Enter **API URL** (default: https://api.noufal.com)
   - Enter **Project ID** from NOUFAL platform

3. **Select Export Options**
   - ☑️ **Export selected elements only**: Export only current selection
   - ☑️ **Include Geometry**: Export 3D mesh data (triangles)
   - ☑️ **Include Properties**: Export all element properties

4. **Start Export**
   - Click **Export** button
   - Monitor progress in the progress dialog
   - Wait for completion message

### API Configuration

The plugin uses NOUFAL API endpoint:
```
POST /api/projects/{projectId}/navisworks/import
```

**Request Body:**
```json
{
  "FileName": "Building.nwf",
  "Title": "Main Building",
  "Units": "Meters",
  "BoundingBox": {
    "MinX": 0, "MinY": 0, "MinZ": 0,
    "MaxX": 100, "MaxY": 100, "MaxZ": 50
  },
  "Elements": [
    {
      "Id": "guid-123",
      "Name": "Wall-001",
      "Category": "Wall",
      "Properties": { ... },
      "Geometry": { ... }
    }
  ],
  "Statistics": { ... }
}
```

## Development

### Project Structure
```
navisworks-plugin/
├── NOUFAL.NavisworksPlugin.csproj   # Visual Studio project
├── NOUFALPlugin.cs                   # Main plugin entry point
├── Models/
│   ├── ModelData.cs                  # Model data structures
│   ├── ElementData.cs                # Element data structures
│   └── ApiResponse.cs                # API response models
├── Services/
│   ├── ApiService.cs                 # HTTP API client
│   ├── ModelExtractor.cs             # Extract data from Navisworks
│   └── GeometryExtractor.cs          # Extract geometry using COM API
├── UI/
│   ├── ExportDialog.cs               # Export configuration dialog
│   └── ProgressDialog.cs             # Progress feedback dialog
├── Properties/
│   └── AssemblyInfo.cs               # Assembly metadata
├── packages.config                    # NuGet packages
└── README.md                          # This file
```

### Build Configurations

#### Debug Build
```bash
# Build with debug symbols
msbuild NOUFAL.NavisworksPlugin.csproj /p:Configuration=Debug
```

#### Release Build
```bash
# Build optimized release
msbuild NOUFAL.NavisworksPlugin.csproj /p:Configuration=Release
```

### Debugging

1. **Set Navisworks as Startup Program**
   - Right-click project → Properties
   - Debug tab → Start external program
   - Browse to: `C:\Program Files\Autodesk\Navisworks Manage 2024\Roamer.exe`

2. **Set Breakpoints**
   - Add breakpoints in Visual Studio code

3. **Start Debugging**
   - Press F5 to start Navisworks with debugger attached
   - Use plugin and breakpoints will trigger

### Updating Navisworks API References

If targeting a different Navisworks version:

1. **Edit .csproj file**
2. **Update HintPath** for API references:
```xml
<Reference Include="Autodesk.Navisworks.Api">
  <HintPath>C:\Program Files\Autodesk\Navisworks Manage 2023\api\NET\Autodesk.Navisworks.Api.dll</HintPath>
</Reference>
```

3. **Rebuild solution**

## Troubleshooting

### Plugin Not Appearing in Navisworks

**Check plugin location:**
```bash
dir "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"
```

**Check Navisworks Application Plugins:**
- In Navisworks: **Options → Interface → Developer**
- Enable **"Show application plugins"**
- Check **Plugins** window for errors

### Build Errors

**Error: Cannot find Navisworks API DLLs**
- Verify Navisworks is installed
- Update `HintPath` in .csproj to match your installation path

**Error: .NET Framework 4.8 not found**
- Install .NET Framework 4.8 Developer Pack
- Download: https://dotnet.microsoft.com/download/dotnet-framework/net48

### Runtime Errors

**Error: API connection failed**
- Verify API URL is correct
- Check internet connection
- Verify API server is running

**Error: Export timeout**
- Model may be too large
- Try exporting without geometry first
- Or export selection instead of entire model

## API Integration

### Authentication
```csharp
var apiService = new ApiService("https://api.noufal.com");
var authResponse = await apiService.AuthenticateAsync(email, password);
if (authResponse.Success)
{
    // Token is automatically stored
}
```

### Upload Model
```csharp
var modelData = modelExtractor.ExtractModelData(document);
var response = await apiService.UploadModelDataAsync(projectId, modelData);
if (response.Success)
{
    MessageBox.Show($"Uploaded {response.Data.ElementsImported} elements");
}
```

## Performance Tips

1. **Large Models**
   - Export selection instead of entire model
   - Disable geometry export if not needed
   - Use progress callback for feedback

2. **Geometry Optimization**
   - Geometry is triangulated automatically
   - Consider implementing LOD (Level of Detail) for very large models
   - Use geometry simplification for preview models

3. **API Upload**
   - Large models may take time to upload
   - Consider implementing chunked upload for models > 100MB
   - Enable compression in API client

## License

Copyright © NOUFAL 2024. All rights reserved.

## Support

For issues and support:
- Email: support@noufal.com
- Documentation: https://docs.noufal.com/navisworks-plugin

## Version History

### v1.0.0 (2024-11-14)
- Initial release
- Model data extraction
- Geometry extraction using COM API
- Properties extraction
- Direct API upload
- Progress tracking
- Arabic UI support
