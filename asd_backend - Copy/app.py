import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import xgboost as xgb
import pandas as pd
import json
import io

# Import STATIC_DIR directly from config
from core.config import MODEL_PATH, TEMP_DIR, BASE_DIR, STATIC_DIR, EXPECTED_COLS_3D
from services.pose_extraction import get_skeletal_data
from services.feature_engineering import prepare_inference_data
from services.inference import run_diagnosis

app = FastAPI(title="ASD Screening API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static folder so React can access BOTH videos and Excel files via URL
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

print("🚀 Loading Spatiotemporal XGBoost Model (91% Accuracy)...")
model = xgb.XGBClassifier()
model.load_model(MODEL_PATH)
print("✅ Server is ready!")

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    temp_input = os.path.join(TEMP_DIR, f"temp_{file.filename}")
    
    output_filename = f"skeletal_{file.filename.split('.')[0]}.webm"
    output_path = os.path.join(STATIC_DIR, output_filename)
    
    try:
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Extract Raw Frames AND Save the Output Video
        raw_df = get_skeletal_data(temp_input, output_path)
        
        if raw_df is None or raw_df.empty:
            return {"status": "error", "message": "Backend returned empty data. No person detected."}

        # 2. Apply Outlier Shield & Extract Features
        windowed_data = prepare_inference_data(raw_df)
        if not windowed_data:
            return {"status": "error", "message": "Video could not be processed."}

        # 3. Predict (FIXED: Added file.filename so the Excel file can be named properly)
        result = run_diagnosis(windowed_data, model, file.filename)
        
        # 4. Inject the Video URL into the JSON
        result["video_url"] = f"http://127.0.0.1:8000/static/{output_filename}"
        
        return result

    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        if os.path.exists(temp_input):
            os.remove(temp_input)

@app.post("/analyze-csv")
async def analyze_csv(file: UploadFile = File(...)):
    """
    Accept CSV files containing skeletal data (75 columns: 25 joints * 3 dimensions).
    Skips pose extraction and goes directly to feature engineering and inference.
    """
    temp_input = os.path.join(TEMP_DIR, f"temp_{file.filename}")
    
    try:
        # 1. Save uploaded CSV file
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Read and validate CSV
        raw_df = pd.read_csv(temp_input)
        
        # 3. Validate column structure
        missing_cols = set(EXPECTED_COLS_3D) - set(raw_df.columns)
        if missing_cols:
            return {
                "status": "error", 
                "message": f"CSV is missing required columns: {', '.join(list(missing_cols)[:5])}... (Total: {len(missing_cols)} missing)"
            }
        
        # 4. Ensure only expected columns in correct order
        raw_df = raw_df[EXPECTED_COLS_3D]
        
        # 5. Validate data is not empty
        if raw_df.empty:
            return {"status": "error", "message": "CSV file is empty."}
        
        # 6. Apply Outlier Shield & Extract Features (same as video path)
        windowed_data = prepare_inference_data(raw_df)
        if not windowed_data:
            return {"status": "error", "message": "CSV data could not be processed."}
        
        # 7. Predict
        result = run_diagnosis(windowed_data, model, file.filename)
        
        # 8. Add indicator that this came from CSV (no video URL)
        result["source"] = "csv"
        result["video_url"] = None
        
        return result
        
    except pd.errors.ParserError:
        return {"status": "error", "message": "Invalid CSV format. Please ensure it's a valid CSV file."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        if os.path.exists(temp_input):
            os.remove(temp_input)

@app.post("/analyze-json")
async def analyze_json(file: UploadFile = File(...)):
    """
    Accept JSON files containing skeletal data in 'csv_data' field (TSV format).
    Extracts the csv_data field, parses TSV, and processes through inference.
    """
    temp_input = os.path.join(TEMP_DIR, f"temp_{file.filename}")
    
    try:
        # 1. Save uploaded JSON file
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Load JSON
        with open(temp_input, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        # 3. Extract csv_data field (TSV format)
        csv_data_str = None
        
        # Handle different JSON structures
        if isinstance(json_data, dict):
            # MongoDB change stream format
            if 'fullDocument' in json_data:
                csv_data_str = json_data['fullDocument'].get('csv_data')
            # Direct document format
            elif 'csv_data' in json_data:
                csv_data_str = json_data.get('csv_data')
        
        if not csv_data_str:
            return {
                "status": "error",
                "message": "JSON must contain 'csv_data' field with TSV formatted skeletal data."
            }
        
        # 4. Parse TSV data from string
        try:
            df = pd.read_csv(io.StringIO(csv_data_str), sep='\t')
        except Exception as e:
            return {
                "status": "error",
                "message": f"Could not parse TSV data from JSON: {str(e)}"
            }
        
        # 5. Map column names from TSV format to expected format
        # TSV uses underscore (e.g., WristLeft_X) but expected format uses hyphen (e.g., WristLeft-x)
        column_mapping = {}
        for col in df.columns:
            if col == 'H:M:S:MS':
                continue  # Skip timestamp column
            # Convert WristLeft_X to WristLeft-x (lowercase last component)
            parts = col.split('_')
            if len(parts) == 2:
                joint, coord = parts
                mapped_col = f"{joint}-{coord.lower()}"
                if mapped_col in EXPECTED_COLS_3D:
                    column_mapping[col] = mapped_col
        
        # 6. Rename columns
        df = df.rename(columns=column_mapping)
        
        # 7. Select only expected columns
        available_cols = [col for col in EXPECTED_COLS_3D if col in df.columns]
        if len(available_cols) < len(EXPECTED_COLS_3D) / 2:
            return {
                "status": "error",
                "message": f"JSON data is missing most required columns. Found {len(available_cols)}/{len(EXPECTED_COLS_3D)}."
            }
        
        # 8. Reorder to expected columns, fill missing with 0
        raw_df = pd.DataFrame(index=df.index)
        for col in EXPECTED_COLS_3D:
            raw_df[col] = df.get(col, 0.0)
        
        # 9. Validate data is not empty
        if raw_df.empty:
            return {"status": "error", "message": "JSON contains no data rows."}
        
        # 10. Apply Outlier Shield & Extract Features
        windowed_data = prepare_inference_data(raw_df)
        if not windowed_data:
            return {"status": "error", "message": "JSON data could not be processed."}
        
        # 11. Predict
        result = run_diagnosis(windowed_data, model, file.filename)
        
        # 12. Add indicator that this came from JSON (no video URL)
        result["source"] = "json"
        result["video_url"] = None
        
        return result
        
    except json.JSONDecodeError:
        return {"status": "error", "message": "Invalid JSON format. Please upload a valid JSON file."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        if os.path.exists(temp_input):
            os.remove(temp_input)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)