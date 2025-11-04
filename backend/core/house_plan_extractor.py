"""
House Plan Data Extraction System - نظام استخراج بيانات المخططات المنزلية
=============================================================================

Extracts structured data from house plans (web scraping + AI vision)
Integrates with Quick Estimator for automatic cost estimation

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

import re
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import json


@dataclass
class LandData:
    """بيانات الأرض"""
    total_area: Dict[str, any]  # {'value': 1188, 'unit': 'sq ft', 'alternate': '110.4 sq m'}
    width: Dict[str, any]
    length: Dict[str, any]
    shape: str = 'rectangular'


@dataclass
class BuildingData:
    """بيانات المبنى"""
    width: Dict[str, any]
    length: Dict[str, any]
    total_area: Optional[Dict[str, any]] = None
    building_type: str = 'residential'
    design_style: str = 'modern'


@dataclass
class RoomData:
    """بيانات الغرفة"""
    name: str
    type: str  # bedroom, kitchen, hall, bathroom, etc.
    dimensions: Dict[str, any]  # {'length': 12, 'width': 10, 'unit': 'ft'}
    area: Dict[str, any]  # {'value': 120, 'unit': 'sq ft'}


@dataclass
class StructureData:
    """البيانات الإنشائية"""
    columns: Optional[Dict[str, any]] = None  # {'count': 24, 'spacing': 10}
    concrete: Optional[Dict[str, any]] = None  # {'grade': 'M20', 'type': 'RCC'}
    rebar: Optional[Dict[str, any]] = None  # {'grade': 'Fe 500', 'diameter': 16}
    beams: Optional[List[str]] = None


@dataclass
class HousePlanData:
    """البيانات الكاملة للمخطط"""
    plan_id: str
    title: str
    description: Optional[str]
    url: str
    image_url: Optional[str]
    bhk: Optional[int]  # Number of bedrooms (e.g., 3 for 3BHK)
    square_feet: Optional[int]
    orientation: Optional[str]  # EAST, WEST, NORTH, SOUTH
    land: LandData
    building: BuildingData
    rooms: List[RoomData]
    structure: StructureData
    extracted_at: datetime
    confidence: float  # 0.0 to 1.0


class TableDataExtractor:
    """استخراج البيانات من جداول HTML"""
    
    @staticmethod
    def extract_table_data(soup: BeautifulSoup, table_index: int = 0) -> Dict[str, str]:
        """استخراج البيانات من جدول"""
        data = {}
        tables = soup.find_all('table')
        
        if table_index < len(tables):
            table = tables[table_index]
            rows = table.find_all('tr')
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    key = cells[0].get_text(strip=True)
                    value = cells[1].get_text(strip=True)
                    if key and value:
                        data[key] = value
        
        return data
    
    @staticmethod
    def parse_dimension(text: str) -> Dict[str, any]:
        """
        تحليل الأبعاد من النص
        مثال: "27 ft / 8.2 m" → {'value': 27, 'unit': 'ft', 'alternate': '8.2 m'}
        """
        match = re.match(r'(\d+(?:\.\d+)?)\s*([a-zA-Z\s]+?)(?:\s*/\s*(\d+(?:\.\d+)?)\s*([a-zA-Z\s]+?))?', text)
        
        if match:
            value = float(match.group(1))
            unit = match.group(2).strip()
            alternate = None
            
            if match.group(3):
                alternate = f"{match.group(3)} {match.group(4).strip()}"
            
            return {
                'value': value,
                'unit': unit,
                'alternate': alternate
            }
        
        return {'value': 0, 'unit': 'unknown', 'alternate': None}
    
    @staticmethod
    def extract_land_data(table_data: Dict[str, str]) -> LandData:
        """استخراج بيانات الأرض"""
        return LandData(
            total_area=TableDataExtractor.parse_dimension(
                table_data.get('Total Area of Land', '0')
            ),
            width=TableDataExtractor.parse_dimension(
                table_data.get('Width of Land', '0')
            ),
            length=TableDataExtractor.parse_dimension(
                table_data.get('Length of Land', '0')
            ),
            shape='rectangular'
        )
    
    @staticmethod
    def extract_building_data(table_data: Dict[str, str]) -> BuildingData:
        """استخراج بيانات المبنى"""
        return BuildingData(
            width=TableDataExtractor.parse_dimension(
                table_data.get('Width of House', '0')
            ),
            length=TableDataExtractor.parse_dimension(
                table_data.get('Length of House', '0')
            ),
            building_type=table_data.get('Types of House', 'residential'),
            design_style=table_data.get('Design', 'modern')
        )
    
    @staticmethod
    def extract_rooms_data(table_data: Dict[str, str]) -> List[RoomData]:
        """استخراج بيانات الغرف"""
        rooms = []
        
        room_types = {
            'Bed Room': 'bedroom',
            'Kitchen': 'kitchen',
            'Hall': 'hall',
            'Living': 'living',
            'Dining': 'dining',
            'Toilet': 'bathroom',
            'Bathroom': 'bathroom',
            'Staircase': 'staircase',
            'Porch': 'porch',
            'Passage': 'passage',
            'Store-room': 'storage',
            'Store Room': 'storage',
            'Balcony': 'balcony',
            'Terrace': 'terrace'
        }
        
        for key, value in table_data.items():
            for room_type_name, room_type in room_types.items():
                if room_type_name.lower() in key.lower():
                    # Parse dimensions: "12 x 10 ft" or "12'x10'"
                    dim_match = re.match(
                        r"(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([a-zA-Z'\"]+)",
                        value,
                        re.IGNORECASE
                    )
                    
                    if dim_match:
                        length = float(dim_match.group(1))
                        width = float(dim_match.group(2))
                        unit = dim_match.group(3).strip().replace("'", "ft").replace('"', 'in')
                        
                        if unit not in ['ft', 'in', 'm', 'cm']:
                            unit = 'ft'  # default
                        
                        area = length * width
                        
                        rooms.append(RoomData(
                            name=key,
                            type=room_type,
                            dimensions={
                                'length': length,
                                'width': width,
                                'unit': unit
                            },
                            area={
                                'value': area,
                                'unit': f'{unit}²'
                            }
                        ))
                    break
        
        return rooms
    
    @staticmethod
    def extract_structure_data(table_data: Dict[str, str]) -> StructureData:
        """استخراج البيانات الإنشائية"""
        columns = None
        if 'No. of Column' in table_data:
            col_match = re.search(r'(\d+)', table_data['No. of Column'])
            if col_match:
                columns = {'count': int(col_match.group(1))}
        
        concrete = None
        if 'Grade of Concrete' in table_data:
            concrete = {
                'grade': table_data['Grade of Concrete'],
                'type': 'RCC'
            }
        
        rebar = None
        if 'Rebar' in table_data:
            rebar = {'grade': table_data['Rebar']}
        
        beams = None
        if 'Beam Provided for Estimation' in table_data:
            beams = [b.strip() for b in table_data['Beam Provided for Estimation'].split(',')]
        
        return StructureData(
            columns=columns,
            concrete=concrete,
            rebar=rebar,
            beams=beams
        )


class TextDataExtractor:
    """استخراج البيانات من النصوص"""
    
    @staticmethod
    def extract_from_text(text: str) -> Dict[str, any]:
        """استخراج البيانات من النص"""
        data = {}
        
        # Extract BHK (e.g., "3BHK")
        bhk_match = re.search(r'(\d)\s*BHK', text, re.IGNORECASE)
        if bhk_match:
            data['bhk'] = int(bhk_match.group(1))
        
        # Extract square feet
        sqft_match = re.search(r'(\d+)\s*(?:sq|square)\s*(?:ft|feet)', text, re.IGNORECASE)
        if sqft_match:
            data['square_feet'] = int(sqft_match.group(1))
        
        # Extract orientation
        orientations = ['east', 'west', 'north', 'south']
        for orientation in orientations:
            if re.search(rf'{orientation}\s+facing', text, re.IGNORECASE):
                data['orientation'] = orientation.upper()
                break
        
        return data


class HousePlanScraper:
    """معالج Web Scraping للمخططات"""
    
    USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    
    @staticmethod
    def scrape_plan(url: str) -> Optional[HousePlanData]:
        """
        استخراج بيانات مخطط واحد
        
        Args:
            url: رابط المخطط
            
        Returns:
            HousePlanData or None
        """
        try:
            print(f"🔍 Extracting data from: {url}")
            
            response = requests.get(url, headers={'User-Agent': HousePlanScraper.USER_AGENT})
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title_tag = soup.find(['h1', 'h2'])
            title = title_tag.get_text(strip=True) if title_tag else 'Unknown Plan'
            
            # Extract image
            image_tag = soup.find('img', alt=re.compile('house plan|home plan', re.IGNORECASE))
            image_url = image_tag.get('src') if image_tag else None
            
            # Extract tables
            land_data = None
            building_data = None
            rooms_data = []
            structure_data = None
            
            tables = soup.find_all('table')
            
            if len(tables) >= 1:
                table_data_0 = TableDataExtractor.extract_table_data(soup, 0)
                land_data = TableDataExtractor.extract_land_data(table_data_0)
            
            if len(tables) >= 2:
                table_data_1 = TableDataExtractor.extract_table_data(soup, 1)
                building_data = TableDataExtractor.extract_building_data(table_data_1)
                rooms_data = TableDataExtractor.extract_rooms_data(table_data_1)
            
            if len(tables) >= 3:
                table_data_2 = TableDataExtractor.extract_table_data(soup, 2)
                structure_data = TableDataExtractor.extract_structure_data(table_data_2)
            
            # Extract from text
            page_text = soup.get_text()
            text_data = TextDataExtractor.extract_from_text(page_text)
            
            # Fallback defaults
            if not land_data:
                land_data = LandData(
                    total_area={'value': 0, 'unit': 'unknown', 'alternate': None},
                    width={'value': 0, 'unit': 'unknown', 'alternate': None},
                    length={'value': 0, 'unit': 'unknown', 'alternate': None}
                )
            
            if not building_data:
                building_data = BuildingData(
                    width={'value': 0, 'unit': 'unknown', 'alternate': None},
                    length={'value': 0, 'unit': 'unknown', 'alternate': None}
                )
            
            if not structure_data:
                structure_data = StructureData()
            
            # Create plan data
            plan_data = HousePlanData(
                plan_id=HousePlanScraper._generate_plan_id(title),
                title=title,
                description=None,
                url=url,
                image_url=image_url,
                bhk=text_data.get('bhk'),
                square_feet=text_data.get('square_feet'),
                orientation=text_data.get('orientation'),
                land=land_data,
                building=building_data,
                rooms=rooms_data,
                structure=structure_data,
                extracted_at=datetime.now(),
                confidence=HousePlanScraper._calculate_confidence(
                    land_data, building_data, rooms_data
                )
            )
            
            print(f"✅ Successfully extracted data (confidence: {plan_data.confidence:.2f})")
            return plan_data
            
        except Exception as e:
            print(f"❌ Error extracting plan: {e}")
            return None
    
    @staticmethod
    def scrape_plan_list(url: str) -> List[str]:
        """
        استخراج قائمة روابط المخططات من صفحة القائمة
        
        Args:
            url: رابط صفحة القائمة
            
        Returns:
            List of plan URLs
        """
        try:
            print(f"🔍 Extracting plan list from: {url}")
            
            response = requests.get(url, headers={'User-Agent': HousePlanScraper.USER_AGENT})
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            plan_urls = set()
            
            # Find links containing "house-plan" or "home-plan"
            for link in soup.find_all('a', href=True):
                href = link['href']
                if 'house-plan' in href or 'home-plan' in href:
                    # Make absolute URL
                    if href.startswith('http'):
                        plan_urls.add(href)
                    elif href.startswith('/'):
                        base_url = '/'.join(url.split('/')[:3])
                        plan_urls.add(base_url + href)
            
            print(f"✅ Found {len(plan_urls)} plan URLs")
            return list(plan_urls)
            
        except Exception as e:
            print(f"❌ Error extracting plan list: {e}")
            return []
    
    @staticmethod
    def _generate_plan_id(title: str) -> str:
        """Generate unique plan ID from title"""
        return re.sub(r'[^a-z0-9]+', '_', title.lower())[:50].strip('_')
    
    @staticmethod
    def _calculate_confidence(
        land: LandData,
        building: BuildingData,
        rooms: List[RoomData]
    ) -> float:
        """Calculate confidence score"""
        confidence = 0.5
        
        if land.total_area['value'] > 0 and land.width['value'] > 0 and land.length['value'] > 0:
            confidence += 0.2
        
        if building.width['value'] > 0 and building.length['value'] > 0:
            confidence += 0.15
        
        if len(rooms) > 0:
            confidence += 0.15
        
        return min(confidence, 1.0)


class HousePlanAnalyzer:
    """تحليل ومقارنة المخططات"""
    
    @staticmethod
    def compare_plans(plan1: HousePlanData, plan2: HousePlanData) -> Dict[str, any]:
        """مقارنة مخططين"""
        land1_area = plan1.land.total_area['value']
        land2_area = plan2.land.total_area['value']
        
        diff = abs(land1_area - land2_area)
        pct_diff = (diff / land1_area * 100) if land1_area > 0 else 0
        
        return {
            'titles': [plan1.title, plan2.title],
            'land_area_difference': {
                'plan1': land1_area,
                'plan2': land2_area,
                'difference': diff,
                'percentage_difference': round(pct_diff, 2)
            },
            'building_dimensions': {
                'plan1': {
                    'width': plan1.building.width['value'],
                    'length': plan1.building.length['value']
                },
                'plan2': {
                    'width': plan2.building.width['value'],
                    'length': plan2.building.length['value']
                }
            },
            'room_count': {
                'plan1': len(plan1.rooms),
                'plan2': len(plan2.rooms)
            },
            'bhk_comparison': {
                'plan1': plan1.bhk or 'unknown',
                'plan2': plan2.bhk or 'unknown'
            }
        }
    
    @staticmethod
    def calculate_statistics(plan: HousePlanData) -> Dict[str, any]:
        """حساب إحصائيات المخطط"""
        total_room_area = sum(room.area['value'] for room in plan.rooms)
        avg_room_area = total_room_area / len(plan.rooms) if plan.rooms else 0
        
        building_area = plan.building.width['value'] * plan.building.length['value']
        
        room_types = {}
        for room in plan.rooms:
            room_types[room.type] = room_types.get(room.type, 0) + 1
        
        return {
            'total_room_area': round(total_room_area, 2),
            'average_room_area': round(avg_room_area, 2),
            'room_count': len(plan.rooms),
            'land_area': plan.land.total_area['value'],
            'building_area': round(building_area, 2),
            'room_types': room_types
        }
    
    @staticmethod
    def to_dict(plan: HousePlanData) -> Dict[str, any]:
        """Convert HousePlanData to dictionary"""
        result = asdict(plan)
        result['extracted_at'] = plan.extracted_at.isoformat()
        return result


# Example usage
if __name__ == '__main__':
    # Test scraping
    url = 'https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/'
    plan = HousePlanScraper.scrape_plan(url)
    
    if plan:
        print("\n" + "="*80)
        print("HOUSE PLAN DATA")
        print("="*80)
        print(f"Title: {plan.title}")
        print(f"Plan ID: {plan.plan_id}")
        print(f"BHK: {plan.bhk}")
        print(f"Square Feet: {plan.square_feet}")
        print(f"Land Area: {plan.land.total_area['value']} {plan.land.total_area['unit']}")
        print(f"Building: {plan.building.width['value']} x {plan.building.length['value']} {plan.building.width['unit']}")
        print(f"Rooms: {len(plan.rooms)}")
        print(f"Confidence: {plan.confidence:.2%}")
        
        stats = HousePlanAnalyzer.calculate_statistics(plan)
        print("\nStatistics:")
        print(json.dumps(stats, indent=2))
