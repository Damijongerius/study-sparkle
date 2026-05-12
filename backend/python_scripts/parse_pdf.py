import sys
import json
import logging
import fitz  # PyMuPDF
import torch  # For CUDA detection
from pathlib import Path
import os
import time
import traceback

# Docling
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, AcceleratorDevice, AcceleratorOptions
from pypdf import PdfReader

# Configure logging to stderr
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

# Detect Device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"DEBUG: Using hardware accelerator: {device}", file=sys.stderr)

def report_progress(percent, message, phase):
    """Prints a formatted progress report for the Node.js caller."""
    # Matches the 'PROGRESS:percent:message:phase' format expected by doclingParser.js
    print(f"PROGRESS:{percent}:{message}:{phase}", flush=True)

def report_error(err_msg):
    """Prints a JSON error report and exits."""
    print(json.dumps({"error": err_msg, "status": "error"}), flush=True)
    sys.exit(1)

def get_detailed_style(doc_fitz, page_num, bbox):
    """Extract color, font size, and weight info for a specific bounding box."""
    try:
        page = doc_fitz[page_num - 1]
        # Add a small padding to the rect to ensure we capture the text spans
        rect = fitz.Rect(bbox['left'] - 2, bbox['top'] - 2, bbox['right'] + 2, bbox['bottom'] + 2)
        
        # Get text spans in this area using "dict" format
        text_dict = page.get_text("dict", clip=rect)
        
        styles = {
            "is_bold": False,
            "color": [0, 0, 0],
            "font_name": "unknown",
            "font_size": 12
        }
        
        # We search for the most "representative" span in the block
        all_spans = []
        for block in text_dict.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    all_spans.append(span)

        if not all_spans:
            return styles

        # Find the span with the most text or just the first one
        main_span = max(all_spans, key=lambda s: len(s.get("text", "")))
        
        font = main_span.get("font", "").lower()
        styles["is_bold"] = any(x in font for x in ["bold", "heavy", "black", "semibold"])
        styles["font_size"] = round(main_span.get("size", 12), 1)
        styles["font_name"] = main_span.get("font", "unknown")
        
        # Extract RGB color
        c = main_span.get("color", 0)
        styles["color"] = [(c >> 16) & 255, (c >> 8) & 255, c & 255]
        
        return styles
    except Exception as e:
        return {"is_bold": False, "color": [0, 0, 0], "font_name": f"err", "font_size": 12}

def parse_pdf(file_path, output_dir):
    path = Path(file_path)
    if not path.exists():
        return {"error": f"File not found: {file_path}", "status": "not_found"}
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    try:
        report_progress(5, "Analyzing PDF structure", "metadata")
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)
        
        report_progress(10, "Initializing AI models", "conversion")
        pipeline_options = PdfPipelineOptions()
        pipeline_options.generate_picture_images = True
        
        if device == "cuda":
            pipeline_options.accelerator_options = AcceleratorOptions(num_threads=8, device=AcceleratorDevice.CUDA)
        
        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
            }
        )
        
        report_progress(15, f"Starting full conversion...", "conversion")
        result = converter.convert(str(path))
        
        doc = result.document
        doc_fitz = fitz.open(str(path))
        
        report_progress(75, "Structuring elements...", "finalizing")
        items = list(doc.iterate_items())
        total_items = len(items)
        
        all_blocks = []
        images_metadata = []

        # We'll collect 'left' values to determine indentation levels
        left_margins = []

        for i, (item, level) in enumerate(items):
            page_num = item.prov[0].page_no if hasattr(item, "prov") and item.prov else 1
            label = str(getattr(item, "label", "text")).lower()
            
            block_type = "text"
            content = ""
            
            # Basic classification
            if "heading" in label or "title" in label or "section_header" in label:
                block_type = "heading"
                content = item.text if hasattr(item, "text") else ""
            elif "picture" in label:
                block_type = "image"
                if hasattr(item, "image") and item.image:
                    img_name = f"img_{path.stem}_{len(images_metadata)}.png"
                    item.image.pil_image.save(str(output_path / img_name))
                    content = f"/scanned_images/{img_name}"
                    images_metadata.append({"name": img_name, "path": content, "page": page_num})
            elif "table" in label:
                block_type = "table"
                try: content = item.export_to_dataframe().to_markdown()
                except: content = item.text if hasattr(item, "text") else "[Table]"
            else:
                content = item.text if hasattr(item, "text") else ""

            if content.strip() or block_type == "image":
                meta = {"label": label, "page": page_num, "is_bullet": "list_item" in label}
                
                if hasattr(item, "prov") and item.prov:
                    prov = item.prov[0]
                    left, top, right, bottom = prov.bbox.l, prov.bbox.t, prov.bbox.r, prov.bbox.b
                    
                    # --- Coordinate Translation ---
                    # Docling often uses BOTTOMLEFT, PyMuPDF uses TOPLEFT
                    page_rect = doc_fitz[page_num - 1].rect
                    page_height = page_rect.height
                    
                    # Flip Y if origin is bottom-left
                    if "bottomleft" in str(prov.bbox.coord_origin).lower():
                        fitz_top = page_height - bottom
                        fitz_bottom = page_height - top
                    else:
                        fitz_top = top
                        fitz_bottom = bottom

                    # Store left margin for indentation calculation
                    if block_type == "text" or block_type == "heading":
                        left_margins.append(left)

                    # Use translated coordinates for style extraction
                    styles = get_detailed_style(doc_fitz, page_num, {
                        "left": left, 
                        "top": fitz_top, 
                        "right": right, 
                        "bottom": fitz_bottom
                    })
                    
                    meta["visual_metrics"] = {
                        "left": round(left, 2),
                        "top": round(top, 2),
                        "font_size": styles["font_size"],
                        "color": styles["color"],
                        "is_bold": styles["is_bold"] or "heading" in block_type,
                        "font_name": styles["font_name"]
                    }

                all_blocks.append({"type": block_type, "content": content, "metadata": meta, "page": page_num})

        # --- Indentation Normalization ---
        # Find common margins to create logical levels
        if left_margins:
            # Round margins to ignore sub-pixel differences
            rounded_margins = [round(m, 0) for m in left_margins]
            unique_margins = sorted(list(set(rounded_margins)))
            
            # Identify the most frequent margins (levels)
            from collections import Counter
            counts = Counter(rounded_margins)
            # Filter to margins that appear at least twice or are the minimum
            significant_margins = sorted([m for m, count in counts.items() if count > 1 or m == min(unique_margins)])
            
            # Map each margin to a level based on unique significant margins
            margin_to_level = {}
            if significant_margins:
                base = significant_margins[0]
                levels = []
                last_m = -999
                for m in significant_margins:
                    if m - last_m > 10: # New level if > 10 units apart
                        levels.append(m)
                        last_m = m
                
                for m in unique_margins:
                    # Find closest level
                    closest_level = min(range(len(levels)), key=lambda i: abs(levels[i] - m))
                    margin_to_level[m] = closest_level

            for b in all_blocks:
                if "visual_metrics" in b["metadata"]:
                    current_left = round(b["metadata"]["visual_metrics"]["left"], 0)
                    b["metadata"]["visual_metrics"]["indent_level"] = margin_to_level.get(current_left, 0)

        doc_fitz.close()
        return {
            "blocks": all_blocks,
            "images": images_metadata,
            "status": "success",
            "metadata": {"page_count": total_pages, "source": "docling-smart"}
        }
    except Exception as e:
        logger.exception("Conversion failed")
        return {"error": str(e), "status": "error"}

if __name__ == "__main__":
    try:
        if len(sys.argv) < 3:
            report_error("Usage: parse_pdf.py <file_path> <output_dir>")
        
        file_path = sys.argv[1]
        output_dir = sys.argv[2]
        
        result = parse_pdf(file_path, output_dir)
        print(json.dumps(result))
        report_progress(100, "Scan finished", "complete")
    except Exception as fatal_e:
        report_error(str(fatal_e))
