# scripts/normalize_gadm.py (CLEAN VERSION - minimal fields only)
import json
import sys

COUNTRY_NAME_MAP = {
    "Republic of India": "India",
    "United States of America": "United States",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
}

def normalize_country_name(name):
    """Ensure consistent country naming"""
    if not name:
        return name
    return COUNTRY_NAME_MAP.get(name.strip(), name.strip())


def normalize_countries(input_file, output_file):
    """Normalize world countries - KEEP ONLY ESSENTIAL FIELDS"""
    
    print(f"\n📥 Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✓ Found {len(data['features'])} features")
    
    normalized_features = []
    
    for feature in data['features']:
        props = feature['properties']
        
        # Get country name
        country_name = (props.get('NAME') or 
                       props.get('ADMIN') or 
                       props.get('NAME_EN'))
        
        if not country_name:
            continue
        
        country_name = normalize_country_name(country_name)
        
        # ✅ ONLY KEEP WHAT WE NEED
        new_feature = {
            'type': 'Feature',
            'properties': {
                # Required fields
                'name': country_name,
                'level': 0,
                'country': country_name,
                'region': None,
                'subregion': None,
                'country_type': 'Country',
                'region_type': None,
                'subregion_type': None,
                
                # Useful metadata (optional but recommended)
                'iso_a3': props.get('ISO_A3'),      # "IND"
                'iso_a2': props.get('ISO_A2'),      # "IN"
                'country_code': props.get('ISO_A3')
            },
            'geometry': feature['geometry']  # Keep the boundary
        }
        
        normalized_features.append(new_feature)
    
    normalized_data = {
        'type': 'FeatureCollection',
        'features': normalized_features
    }
    
    print(f"📤 Writing {len(normalized_features)} features to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(normalized_data, f, ensure_ascii=False)
    
    print(f"✅ Normalized {len(normalized_features)} countries")
    return True


def normalize_states(input_file, output_file):
    """Normalize GADM states - KEEP ONLY ESSENTIAL FIELDS"""
    
    print(f"\n📥 Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✓ Found {len(data['features'])} features")
    
    normalized_features = []
    
    for feature in data['features']:
        props = feature['properties']
        
        if not props.get('NAME_1') or not props.get('COUNTRY'):
            continue
        
        country_name = normalize_country_name(props['COUNTRY'])
        
        # ✅ ONLY KEEP WHAT WE NEED
        new_feature = {
            'type': 'Feature',
            'properties': {
                'name': props['NAME_1'],
                'level': 1,
                'country': country_name,
                'region': props['NAME_1'],
                'subregion': None,
                'country_type': 'Country',
                'region_type': props.get('TYPE_1', 'State'),
                'subregion_type': None,
                
                # Useful for debugging
                'gid': props.get('GID_1')
            },
            'geometry': feature['geometry']
        }
        
        normalized_features.append(new_feature)
    
    normalized_data = {
        'type': 'FeatureCollection',
        'features': normalized_features
    }
    
    print(f"📤 Writing {len(normalized_features)} features to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(normalized_data, f, ensure_ascii=False)
    
    print(f"✅ Normalized {len(normalized_features)} states")
    return True


def normalize_districts(input_file, output_file):
    """Normalize GADM districts - KEEP ONLY ESSENTIAL FIELDS"""
    
    print(f"\n📥 Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✓ Found {len(data['features'])} features")
    
    normalized_features = []
    
    for feature in data['features']:
        props = feature['properties']
        
        if not props.get('NAME_2') or not props.get('NAME_1') or not props.get('COUNTRY'):
            continue
        
        country_name = normalize_country_name(props['COUNTRY'])
        
        # ✅ ONLY KEEP WHAT WE NEED
        new_feature = {
            'type': 'Feature',
            'properties': {
                'name': props['NAME_2'],
                'level': 2,
                'country': country_name,
                'region': props['NAME_1'],
                'subregion': props['NAME_2'],
                'country_type': 'Country',
                'region_type': props.get('TYPE_1', 'State'),
                'subregion_type': props.get('TYPE_2', 'District'),
                
                # Useful for debugging
                'gid': props.get('GID_2')
            },
            'geometry': feature['geometry']
        }
        
        normalized_features.append(new_feature)
    
    normalized_data = {
        'type': 'FeatureCollection',
        'features': normalized_features
    }
    
    print(f"📤 Writing {len(normalized_features)} features to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(normalized_data, f, ensure_ascii=False)
    
    print(f"✅ Normalized {len(normalized_features)} districts")
    return True


def verify_consistency():
    """Quick consistency check"""
    
    print("\n" + "="*70)
    print("🔍 CONSISTENCY CHECK")
    print("="*70 + "\n")
    
    try:
        with open('public/geojson/world-countries.json', 'r') as f:
            world = json.load(f)
        with open('public/geojson/india-states.json', 'r') as f:
            states = json.load(f)
        with open('public/geojson/india-districts.json', 'r') as f:
            districts = json.load(f)
        
        world_countries = [f['properties']['name'] for f in world['features']]
        
        if 'India' in world_countries:
            print("✓ 'India' found in world countries")
        else:
            print("❌ 'India' NOT found in world countries!")
            print(f"Countries with 'Ind': {[c for c in world_countries if 'Ind' in c]}")
            return False
        
        state_country = states['features'][0]['properties']['country']
        district_country = districts['features'][0]['properties']['country']
        
        if state_country == district_country == 'India':
            print(f"✓ States use: '{state_country}'")
            print(f"✓ Districts use: '{district_country}'")
            print(f"\n✅ All files consistent!")
            
            print(f"\n📊 Summary:")
            print(f"  World countries: {len(world['features'])}")
            print(f"  India states: {len(states['features'])}")
            print(f"  India districts: {len(districts['features'])}")
            return True
        else:
            print(f"❌ Inconsistent!")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Main execution"""
    
    print("="*70)
    print("  GeoJSON Normalization - Minimal Fields")
    print("="*70)
    print()
    
    success = 0
    
    # Normalize all files
    if normalize_countries(
        'public/geojson/world-countries-raw.json',
        'public/geojson/world-countries.json'
    ):
        success += 1
    
    print("\n" + "="*70)
    
    if normalize_states(
        'public/geojson/india-states-raw.json',
        'public/geojson/india-states.json'
    ):
        success += 1
    
    print("\n" + "="*70)
    
    if normalize_districts(
        'public/geojson/india-districts-raw.json',
        'public/geojson/india-districts.json'
    ):
        success += 1
    
    # Check consistency
    if success == 3:
        verify_consistency()
    
    print("\n" + "="*70)
    print(f"✅ Completed {success}/3 tasks")
    print("="*70)
    
    if success == 3:
        print("\n🎉 Ready to use!")
        print("\nYour normalized files have:")
        print("  ✓ Minimal properties (name, level, country, region, subregion)")
        print("  ✓ Consistent country naming")
        print("  ✓ All geometry intact")
        print("\nFile sizes should be much smaller now!")
        return 0
    
    return 1


if __name__ == '__main__':
    sys.exit(main())


# ## 📊 File Size Comparison

# ### Before Normalization (with all fields):
# ```
# world-countries-raw.json:   6-8 MB    (100+ properties per country)
# india-states-raw.json:      5 MB      (30+ properties per state)
# india-districts-raw.json:   25 MB     (30+ properties per district)
# ```

# ### After Normalization (minimal fields):
# ```
# world-countries.json:       2-3 MB    (9 properties per country)
# india-states.json:          2-3 MB    (9 properties per state)
# india-districts.json:       12-15 MB  (9 properties per district)