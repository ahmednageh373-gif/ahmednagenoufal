"""
Advanced Construction Systems Cost Database
============================================
Specialized systems for commercial and industrial projects.

Categories:
- Advanced Plumbing & Drainage
- Electrical Distribution Systems
- Fire Protection (ESFR, FM-200)
- Curtain Wall & Facades
- Heavy Steel Structure
- Industrial Flooring
- Thermal Insulation (Rock Wool)
- Glass Balustrades
- Helical Piles
- Precast Structural Elements

Version: 1.0.0
Updated: 2025-11-07
"""

from dataclasses import dataclass
from typing import Dict, List

@dataclass
class AdvancedCostItem:
    """Cost item for advanced construction systems"""
    code: str
    name_ar: str
    name_en: str
    unit: str
    material_cost: float
    installation_cost: float
    productivity_min: float
    productivity_max: float
    remarks: str = ""
    
    @property
    def total_cost_min(self) -> float:
        """Minimum total installed cost"""
        return self.material_cost + (self.installation_cost * 0.9)
    
    @property
    def total_cost_max(self) -> float:
        """Maximum total installed cost"""
        return self.material_cost + (self.installation_cost * 1.1)
    
    @property
    def productivity_avg(self) -> float:
        """Average productivity"""
        return (self.productivity_min + self.productivity_max) / 2


# ==============================================================================
# ADVANCED PLUMBING & DRAINAGE
# ==============================================================================

ADVANCED_PLUMBING = {
    'UPVC_110': AdvancedCostItem(
        code='PLUMB-ADV-001',
        name_ar='UPVC عادي 110 mm',
        name_en='UPVC Standard 110 mm',
        unit='m',
        material_cost=40.0,
        installation_cost=22.5,
        productivity_min=80,
        productivity_max=100,
        remarks='Soil/waste pipe, standard grade'
    ),
    'UPVC_160': AdvancedCostItem(
        code='PLUMB-ADV-002',
        name_ar='UPVC عادي 160 mm',
        name_en='UPVC Standard 160 mm',
        unit='m',
        material_cost=67.5,
        installation_cost=32.5,
        productivity_min=60,
        productivity_max=80,
        remarks='Large diameter drainage'
    ),
    'HDPE_200_GALV': AdvancedCostItem(
        code='PLUMB-ADV-003',
        name_ar='HDPE مجلفن 200 mm',
        name_en='HDPE Galvanized 200 mm',
        unit='m',
        material_cost=115.0,
        installation_cost=40.0,
        productivity_min=50,
        productivity_max=70,
        remarks='High pressure rated'
    ),
    'HDPE_250_GALV': AdvancedCostItem(
        code='PLUMB-ADV-004',
        name_ar='HDPE مجلفن 250 mm',
        name_en='HDPE Galvanized 250 mm',
        unit='m',
        material_cost=167.5,
        installation_cost=50.0,
        productivity_min=40,
        productivity_max=60,
        remarks='Heavy duty, industrial grade'
    ),
    'MANHOLE_PVC_600': AdvancedCostItem(
        code='PLUMB-ADV-005',
        name_ar='Manhole PVC 600 mm',
        name_en='PVC Manhole 600 mm',
        unit='وحدة',
        material_cost=675.0,
        installation_cost=625.0,
        productivity_min=3,
        productivity_max=4,
        remarks='Complete with cover and frame'
    ),
}


# ==============================================================================
# ELECTRICAL DISTRIBUTION SYSTEMS
# ==============================================================================

ELECTRICAL_ADVANCED = {
    'OUTLET_16A_METAL': AdvancedCostItem(
        code='ELEC-ADV-001',
        name_ar='قابس 16 A معدني',
        name_en='Power Outlet 16A Metal',
        unit='وحدة',
        material_cost=65.0,
        installation_cost=155.0,
        productivity_min=18,
        productivity_max=20,
        remarks='Industrial grade, metal housing'
    ),
    'LED_SPOT_7W': AdvancedCostItem(
        code='ELEC-ADV-002',
        name_ar='سبوت LED 7 W',
        name_en='LED Spot Light 7W',
        unit='وحدة',
        material_cost=45.0,
        installation_cost=65.0,
        productivity_min=25,
        productivity_max=30,
        remarks='Recessed downlight, warm white'
    ),
    'DIST_BOARD_24WAY': AdvancedCostItem(
        code='ELEC-ADV-003',
        name_ar='لوحة فرعية 24-way',
        name_en='Sub-distribution Board 24-way',
        unit='وحدة',
        material_cost=1850.0,
        installation_cost=1500.0,
        productivity_min=1,
        productivity_max=2,
        remarks='MCB type, IP65 rated'
    ),
    'CABLE_CU_4X25': AdvancedCostItem(
        code='ELEC-ADV-004',
        name_ar='كابل Cu 4×25 mm²',
        name_en='Copper Cable 4×25 mm²',
        unit='م',
        material_cost=145.0,
        installation_cost=25.0,
        productivity_min=80,
        productivity_max=100,
        remarks='Pulling only, tray/conduit extra'
    ),
    'CABLE_TRAY_300X50': AdvancedCostItem(
        code='ELEC-ADV-005',
        name_ar='Tray 300×50 mm',
        name_en='Cable Tray 300×50 mm',
        unit='م',
        material_cost=85.0,
        installation_cost=47.5,
        productivity_min=40,
        productivity_max=50,
        remarks='Galvanized steel, perforated'
    ),
}


# ==============================================================================
# FIRE PROTECTION SYSTEMS
# ==============================================================================

FIRE_PROTECTION = {
    'ESFR_SPRINKLER': AdvancedCostItem(
        code='FIRE-001',
        name_ar='رأس ESFR pendent',
        name_en='ESFR Sprinkler Head Pendent',
        unit='وحدة',
        material_cost=380.0,
        installation_cost=220.0,
        productivity_min=20,
        productivity_max=25,
        remarks='Early Suppression Fast Response, warehouse grade'
    ),
    'FIRE_PIPE_SCH40_6': AdvancedCostItem(
        code='FIRE-002',
        name_ar='Pipe sch-40 6"',
        name_en='Fire Pipe Schedule-40 6 inch',
        unit='م',
        material_cost=155.0,
        installation_cost=82.5,
        productivity_min=25,
        productivity_max=30,
        remarks='Black steel, grooved ends'
    ),
    'ZONE_CONTROL_VALVE': AdvancedCostItem(
        code='FIRE-003',
        name_ar='Zone control valve',
        name_en='Zone Control Valve Assembly',
        unit='وحدة',
        material_cost=3500.0,
        installation_cost=2600.0,
        productivity_min=0.5,
        productivity_max=1,
        remarks='Complete with alarm, test & drain'
    ),
    'FM200_CYLINDER_200LB': AdvancedCostItem(
        code='FIRE-004',
        name_ar='FM-200 cylinder 200 lb',
        name_en='FM-200 Clean Agent Cylinder 200 lb',
        unit='وحدة',
        material_cost=42000.0,
        installation_cost=25500.0,
        productivity_min=0.3,
        productivity_max=0.5,
        remarks='Including pressurization and discharge nozzles'
    ),
}


# ==============================================================================
# CURTAIN WALL & FACADES
# ==============================================================================

CURTAIN_WALL = {
    'UNITIZED_CW_DG2': AdvancedCostItem(
        code='FACADE-001',
        name_ar='Unitized curtain wall DG-2',
        name_en='Unitized Curtain Wall Double Glazed',
        unit='m²',
        material_cost=1850.0,
        installation_cost=625.0,
        productivity_min=4,
        productivity_max=6,
        remarks='Thermally broken aluminum, Low-E glass'
    ),
    'ALU_CLAD_WINDOW': AdvancedCostItem(
        code='FACADE-002',
        name_ar='Alu-clad window 1.2×1.2 m',
        name_en='Aluminum Clad Window 1.2×1.2 m',
        unit='وحدة',
        material_cost=1350.0,
        installation_cost=475.0,
        productivity_min=3,
        productivity_max=4,
        remarks='Fixed/casement, double glazed'
    ),
    'LOUVER_BLADE_100': AdvancedCostItem(
        code='FACADE-003',
        name_ar='Louver blade 100 mm',
        name_en='Aluminum Louver Blade 100 mm',
        unit='م',
        material_cost=190.0,
        installation_cost=110.0,
        productivity_min=25,
        productivity_max=35,
        remarks='Extruded aluminum, powder coated'
    ),
}


# ==============================================================================
# HEAVY STEEL STRUCTURE
# ==============================================================================

HEAVY_STEEL = {
    'HOT_ROLLED_S355': AdvancedCostItem(
        code='STEEL-HVY-001',
        name_ar='Hot-rolled frame (S355)',
        name_en='Hot-Rolled Steel Frame S355',
        unit='طن',
        material_cost=3900.0,
        installation_cost=2300.0,
        productivity_min=4,
        productivity_max=5,
        remarks='Grade S355, crane 50t required, paint extra'
    ),
    'LIGHT_GAUGE_PURLINS': AdvancedCostItem(
        code='STEEL-HVY-002',
        name_ar='Light-gauge purlins',
        name_en='Light Gauge Steel Purlins',
        unit='طن',
        material_cost=4100.0,
        installation_cost=2750.0,
        productivity_min=6,
        productivity_max=7,
        remarks='C/Z sections, galvanized'
    ),
    'METAL_DECK_1_2': AdvancedCostItem(
        code='STEEL-HVY-003',
        name_ar='Metal deck 1.2 mm',
        name_en='Metal Deck Profiled 1.2 mm',
        unit='m²',
        material_cost=42.0,
        installation_cost=25.0,
        productivity_min=400,
        productivity_max=500,
        remarks='Composite floor deck, galvanized'
    ),
}


# ==============================================================================
# INDUSTRIAL FLOORING
# ==============================================================================

INDUSTRIAL_FLOORING = {
    'EPOXY_SELF_LEVEL_2MM': AdvancedCostItem(
        code='FLOOR-IND-001',
        name_ar='Self-levelling epoxy 2 mm',
        name_en='Self-Levelling Epoxy 2 mm',
        unit='m²',
        material_cost=52.0,
        installation_cost=25.5,
        productivity_min=600,
        productivity_max=800,
        remarks='Smooth finish, light traffic'
    ),
    'PU_ANTI_STATIC_3MM': AdvancedCostItem(
        code='FLOOR-IND-002',
        name_ar='PU anti-static 3 mm',
        name_en='Polyurethane Anti-Static 3 mm',
        unit='m²',
        material_cost=95.0,
        installation_cost=45.0,
        productivity_min=400,
        productivity_max=500,
        remarks='ESD safe, cleanroom grade'
    ),
    'EPDM_RUBBER_13MM_IND': AdvancedCostItem(
        code='FLOOR-IND-003',
        name_ar='EPDM rubber 13 mm (صناعي)',
        name_en='EPDM Rubber 13 mm Industrial',
        unit='m²',
        material_cost=150.0,
        installation_cost=85.0,
        productivity_min=450,
        productivity_max=600,
        remarks='Heavy duty, slip resistant'
    ),
}


# ==============================================================================
# THERMAL INSULATION - ROCK WOOL
# ==============================================================================

ROCK_WOOL_INSULATION = {
    'ROCKWOOL_30KG_50MM': AdvancedCostItem(
        code='INSUL-001',
        name_ar='Rock wool 30 kg/m³ - 50 mm',
        name_en='Rock Wool 30 kg/m³ Density - 50 mm',
        unit='m²',
        material_cost=18.0,
        installation_cost=12.0,
        productivity_min=1200,
        productivity_max=1200,
        remarks='Walls, non-loadbearing'
    ),
    'ROCKWOOL_35KG_80MM': AdvancedCostItem(
        code='INSUL-002',
        name_ar='Rock wool 35 kg/m³ - 80 mm',
        name_en='Rock Wool 35 kg/m³ Density - 80 mm',
        unit='m²',
        material_cost=28.0,
        installation_cost=16.5,
        productivity_min=900,
        productivity_max=900,
        remarks='Enhanced thermal/acoustic performance'
    ),
}


# ==============================================================================
# GLASS BALUSTRADES
# ==============================================================================

GLASS_BALUSTRADES = {
    'GLASS_BAL_1_2M': AdvancedCostItem(
        code='GLASS-BAL-001',
        name_ar='بلكونة زجاج 1.2 m',
        name_en='Glass Balustrade 1.2 m Height',
        unit='m',
        material_cost=320.0,
        installation_cost=180.0,
        productivity_min=120,
        productivity_max=120,
        remarks='12mm tempered glass, stainless posts'
    ),
    'GLASS_BAL_1_8M': AdvancedCostItem(
        code='GLASS-BAL-002',
        name_ar='بلكونة زجاج 1.8 m',
        name_en='Glass Balustrade 1.8 m Height',
        unit='m',
        material_cost=480.0,
        installation_cost=195.0,
        productivity_min=100,
        productivity_max=100,
        remarks='15mm tempered glass, full height'
    ),
}


# ==============================================================================
# HELICAL PILES
# ==============================================================================

HELICAL_PILES = {
    'HELICAL_PILE_89MM': AdvancedCostItem(
        code='PILE-HEL-001',
        name_ar='Helical steel 89 mm',
        name_en='Helical Steel Pile 89 mm',
        unit='م',
        material_cost=180.0,
        installation_cost=155.0,
        productivity_min=15,
        productivity_max=18,
        remarks='Lead section with helix, light loads'
    ),
    'HELICAL_EXT_2M': AdvancedCostItem(
        code='PILE-HEL-002',
        name_ar='Extension 2 m',
        name_en='Helical Pile Extension 2 m',
        unit='وحدة',
        material_cost=360.0,
        installation_cost=180.0,
        productivity_min=8,
        productivity_max=10,
        remarks='Plain shaft extension'
    ),
    'HELICAL_CAP_PLATE': AdvancedCostItem(
        code='PILE-HEL-003',
        name_ar='Steel cap plate',
        name_en='Steel Cap Plate for Helical Pile',
        unit='وحدة',
        material_cost=190.0,
        installation_cost=115.0,
        productivity_min=12,
        productivity_max=15,
        remarks='Welded connection to pile'
    ),
}


# ==============================================================================
# PRECAST STRUCTURAL ELEMENTS
# ==============================================================================

PRECAST_ELEMENTS = {
    'PRECAST_I_BEAM_24M': AdvancedCostItem(
        code='PRECAST-001',
        name_ar='I-beam 24 m (600×1,200)',
        name_en='Precast I-Beam 24 m (600×1200 mm)',
        unit='وحدة',
        material_cost=42000.0,
        installation_cost=16000.0,
        productivity_min=0.5,
        productivity_max=1,
        remarks='Prestressed concrete, crane 150t, grout extra'
    ),
    'HOLLOW_CORE_SLAB_200MM': AdvancedCostItem(
        code='PRECAST-002',
        name_ar='Hollow-core slab 200 mm',
        name_en='Hollow-Core Precast Slab 200 mm',
        unit='m²',
        material_cost=165.0,
        installation_cost=57.0,
        productivity_min=35,
        productivity_max=45,
        remarks='Prestressed, 1.2m width panels'
    ),
}


# ==============================================================================
# SUMMARY STATISTICS
# ==============================================================================

def get_all_advanced_items() -> Dict[str, Dict]:
    """Get all advanced cost items grouped by category"""
    return {
        'Advanced Plumbing': ADVANCED_PLUMBING,
        'Electrical Advanced': ELECTRICAL_ADVANCED,
        'Fire Protection': FIRE_PROTECTION,
        'Curtain Wall': CURTAIN_WALL,
        'Heavy Steel': HEAVY_STEEL,
        'Industrial Flooring': INDUSTRIAL_FLOORING,
        'Rock Wool Insulation': ROCK_WOOL_INSULATION,
        'Glass Balustrades': GLASS_BALUSTRADES,
        'Helical Piles': HELICAL_PILES,
        'Precast Elements': PRECAST_ELEMENTS,
    }


def print_summary():
    """Print summary of all advanced systems"""
    all_items = get_all_advanced_items()
    
    print("=" * 80)
    print("🏗️  ADVANCED CONSTRUCTION SYSTEMS COST DATABASE")
    print("=" * 80)
    print()
    
    total_items = 0
    for category, items in all_items.items():
        count = len(items)
        total_items += count
        print(f"📦 {category}: {count} items")
    
    print()
    print(f"📊 Total Items: {total_items}")
    print("=" * 80)
    print()
    
    # Sample items from each category
    print("💡 Sample Items:")
    print("-" * 80)
    for category, items in list(all_items.items())[:3]:
        print(f"\n{category}:")
        for key, item in list(items.items())[:2]:
            print(f"  • {item.name_ar} ({item.name_en})")
            print(f"    Material: {item.material_cost:.2f} SAR/{item.unit}")
            print(f"    Installed: {item.total_cost_min:.0f}-{item.total_cost_max:.0f} SAR/{item.unit}")
            print(f"    Productivity: {item.productivity_min}-{item.productivity_max} {item.unit}/day")
    print()
    print("=" * 80)


if __name__ == "__main__":
    print_summary()
