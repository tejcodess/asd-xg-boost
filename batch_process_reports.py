"""
Production-ready script to process all JSON report files and generate a consolidated CSV.
Flattens nested JSON structures and converts arrays to JSON strings.
"""

import os
import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any
import sys


def flatten_dict(d: Dict, parent_key: str = '') -> Dict:
    """
    Recursively flatten nested dictionaries.
    Uses underscore naming convention for nested keys.
    Arrays and complex objects are converted to JSON strings.
    """
    items = []
    
    for k, v in d.items():
        new_key = f"{parent_key}_{k}" if parent_key else k
        
        # Skip None values
        if v is None:
            items.append((new_key, None))
        # Handle dictionaries - recurse
        elif isinstance(v, dict):
            items.extend(flatten_dict(v, new_key).items())
        # Handle lists - convert to JSON string
        elif isinstance(v, list):
            items.append((new_key, json.dumps(v, ensure_ascii=False)))
        # Handle other types - keep as is
        else:
            items.append((new_key, v))
    
    return dict(items)


def process_json_file(file_path: str) -> Dict[str, Any]:
    """
    Process a single JSON file and flatten its structure.
    Returns a flattened dictionary, or None if processing fails.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Start with top-level fields
        flattened = {
            'json_filename': os.path.basename(file_path),
            'subject_name': data.get('subject_name', ''),
            'folder_path': data.get('folder_path', ''),
            'processed_timestamp': data.get('processed_timestamp', ''),
        }
        
        # Flatten analysis_results if present
        if 'analysis_results' in data and isinstance(data['analysis_results'], dict):
            analysis = data['analysis_results']
            flattened['analysis_results_status'] = analysis.get('status', '')
            
            # Flatten clinical_summary
            if 'clinical_summary' in analysis and isinstance(analysis['clinical_summary'], dict):
                clinical = analysis['clinical_summary']
                flattened['clinical_summary_diagnosis'] = clinical.get('diagnosis', '')
                flattened['clinical_summary_severity_level'] = clinical.get('severity_level', '')
                flattened['clinical_summary_overall_confidence'] = clinical.get('overall_confidence', '')
                flattened['clinical_summary_total_atypical_windows'] = clinical.get('total_atypical_windows', '')
                flattened['clinical_summary_narrative'] = clinical.get('narrative', '')
            
            # Flatten regional_breakdown
            if 'regional_breakdown' in analysis and isinstance(analysis['regional_breakdown'], dict):
                regional = analysis['regional_breakdown']
                
                # Upper body kinematics
                if 'upper_body_kinematics' in regional and isinstance(regional['upper_body_kinematics'], dict):
                    upper = regional['upper_body_kinematics']
                    flattened['regional_breakdown_upper_body_kinematics_risk_status'] = upper.get('risk_status', '')
                    flattened['regional_breakdown_upper_body_kinematics_markers'] = json.dumps(
                        upper.get('markers', []), ensure_ascii=False
                    )
                
                # Lower body kinematics
                if 'lower_body_kinematics' in regional and isinstance(regional['lower_body_kinematics'], dict):
                    lower = regional['lower_body_kinematics']
                    flattened['regional_breakdown_lower_body_kinematics_risk_status'] = lower.get('risk_status', '')
                    flattened['regional_breakdown_lower_body_kinematics_markers'] = json.dumps(
                        lower.get('markers', []), ensure_ascii=False
                    )
                
                # Spatial symmetry
                if 'spatial_symmetry' in regional and isinstance(regional['spatial_symmetry'], dict):
                    spatial = regional['spatial_symmetry']
                    flattened['regional_breakdown_spatial_symmetry_risk_status'] = spatial.get('risk_status', '')
                    flattened['regional_breakdown_spatial_symmetry_markers'] = json.dumps(
                        spatial.get('markers', []), ensure_ascii=False
                    )
            
            # Store analysis_timeline as JSON string (entire array)
            if 'analysis_timeline' in analysis:
                flattened['analysis_timeline'] = json.dumps(
                    analysis['analysis_timeline'], ensure_ascii=False
                )
            
            # Capture excel_url and video_url if present
            flattened['analysis_results_excel_url'] = analysis.get('excel_url', '')
            flattened['analysis_results_video_url'] = analysis.get('video_url', '')
            flattened['analysis_results_source'] = analysis.get('source', '')
        
        return flattened
    
    except json.JSONDecodeError as e:
        print(f"⚠️  WARNING: Invalid JSON in '{os.path.basename(file_path)}': {str(e)}")
        return None
    except Exception as e:
        print(f"⚠️  WARNING: Error processing '{os.path.basename(file_path)}': {str(e)}")
        return None


def process_all_reports(folder_path: str) -> pd.DataFrame:
    """
    Process all JSON files in the specified folder.
    Returns a pandas DataFrame with all flattened records.
    """
    # Ensure folder exists
    if not os.path.isdir(folder_path):
        print(f"❌ ERROR: Folder '{folder_path}' does not exist.")
        return None
    
    # Get all JSON files
    json_files = list(Path(folder_path).glob('*.json'))
    
    if not json_files:
        print(f"❌ ERROR: No JSON files found in '{folder_path}'")
        return None
    
    print(f"📂 Found {len(json_files)} JSON files")
    
    # Process files
    records = []
    successful = 0
    failed = 0
    
    for json_file in json_files:
        record = process_json_file(str(json_file))
        if record is not None:
            records.append(record)
            successful += 1
        else:
            failed += 1
    
    # Create DataFrame
    if records:
        df = pd.DataFrame(records)
        # Ensure UTF-8 compatibility
        for col in df.select_dtypes(include=['object']).columns:
            try:
                df[col] = df[col].astype(str)
            except Exception:
                pass
        
        return df, successful, failed
    else:
        print("❌ ERROR: No records could be processed.")
        return None, 0, failed


def save_csv(df: pd.DataFrame, output_folder: str, filename: str = 'all_reports_summary.csv'):
    """
    Save the DataFrame to a CSV file with UTF-8 encoding.
    """
    try:
        output_path = os.path.join(output_folder, filename)
        df.to_csv(output_path, index=False, encoding='utf-8')
        return output_path
    except Exception as e:
        print(f"❌ ERROR: Failed to save CSV: {str(e)}")
        return None


def main():
    """
    Main execution function.
    """
    # Define the folder path
    folder_path = r"c:\Users\Ramtej\Downloads\all reports generated"
    
    print("=" * 70)
    print("📊 Processing JSON Reports to CSV")
    print("=" * 70)
    
    # Process all reports
    result = process_all_reports(folder_path)
    
    if result is None or len(result) == 2 and result[0] is None:
        print("\n❌ Processing failed. Exiting.")
        sys.exit(1)
    
    df, successful, failed = result
    total_files = successful + failed
    
    # Save CSV
    output_csv_path = save_csv(df, folder_path)
    
    # Print summary
    print("\n" + "=" * 70)
    print("✅ PROCESSING COMPLETE")
    print("=" * 70)
    print(f"📈 Total files processed: {total_files}")
    print(f"✓  Successful: {successful}")
    print(f"✗  Failed: {failed}")
    print(f"\n📊 Columns in CSV: {len(df.columns)}")
    print(f"📋 Rows in CSV: {len(df)}")
    print(f"\n💾 Output CSV saved to:")
    print(f"   {output_csv_path}")
    print("=" * 70)


if __name__ == "__main__":
    main()
