import sys
import json
import logging
from pathlib import Path
import os
import time
import traceback

# Configure logging to stderr
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

def report_progress(percent, message="", stage=""):
    try:
        payload = f"PROGRESS:{percent}"
        if message:
            payload += f":{message}"
        if stage:
            payload += f":{stage}"
        # Print to stderr for Docker console visibility
        print(f"[STAGE: {stage}] {message} ({percent}%)", file=sys.stderr)
        print(payload, flush=True)
    except:
        pass

def report_error(error_msg, status="error"):
    err_obj = {
        "error": error_msg,
        "status": status,
        "traceback": traceback.format_exc()
    }
    print(json.dumps(err_obj))
    sys.exit(1)

try:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling_core.types.doc import DocItemLabel
    from pypdf import PdfReader
except ImportError as e:
    report_error(f"Import error: {str(e)}. Make sure to run 'pip install pypdf docling'")

def parse_pdf(file_path, output_dir):
    path = Path(file_path)
    if not path.exists():
        return {"error": f"File not found: {file_path}", "status": "not_found"}
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    try:
        # Stage 1: Metadata
        report_progress(5, "Analyzing PDF structure", "metadata")
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)
        print(f"DEBUG: Found {total_pages} pages in {file_path}", file=sys.stderr)
        
        # Stage 2: OCR / Conversion
        report_progress(10, "Initializing AI models", "conversion")
        
        pipeline_options = PdfPipelineOptions()
        pipeline_options.generate_picture_images = True
        
        converter = DocumentConverter(
            format_options={
                "pdf": PdfFormatOption(pipeline_options=pipeline_options)
            }
        )
        
        all_blocks = []
        images_metadata = []
        
        start_time = time.time()
        report_progress(15, f"Starting full conversion of {total_pages} pages...", "conversion")
        
        result = converter.convert(str(path))
        
        mid_time = time.time()
        report_progress(70, f"Conversion complete in {round(mid_time - start_time, 2)}s. Structuring elements...", "conversion")
        
        doc = result.document
        
        # Stage 3: Structuring
        report_progress(75, "Analyzing extracted items", "finalizing")
        
        items = list(doc.iterate_items())
        total_items = len(items)
        print(f"DEBUG: Extracted {total_items} items from document", file=sys.stderr)
        
        # Define heading labels safely
        heading_labels = ["title", "section_header", "heading_level_1", "heading_level_2", "heading_level_3"]
        if DocItemLabel:
            # Add enum members if they exist
            for attr in ["TITLE", "SECTION_HEADER", "HEADING_LEVEL_1", "HEADING_LEVEL_2", "HEADING_LEVEL_3"]:
                if hasattr(DocItemLabel, attr):
                    heading_labels.append(getattr(DocItemLabel, attr))

        for i, (item, level) in enumerate(items):
            current_percent = 75 + int((i / max(1, total_items)) * 23)
            
            page_num = "?"
            if hasattr(item, "prov") and item.prov and len(item.prov) > 0:
                page_num = item.prov[0].page_no
            
            if i % 25 == 0 or i == total_items - 1:
                report_progress(current_percent, f"Processing Element {i}/{total_items} (Page {page_num})", "finalizing")

            block_type = "text"
            content = ""
            label = getattr(item, "label", "")
            
            # Check for heading
            is_heading = str(label).lower() in [str(hl).lower() for hl in heading_labels]

            if is_heading:
                block_type = "heading"
                content = item.text if hasattr(item, "text") else ""
            elif str(label).lower() == "picture" or (DocItemLabel and label == DocItemLabel.PICTURE):
                block_type = "image"
                if hasattr(item, "image") and item.image:
                    img_name = f"img_{path.stem}_{len(images_metadata)}.png"
                    img_full_path = output_path / img_name
                    item.image.pil_image.save(str(img_full_path))
                    
                    content = f"/scanned_images/{img_name}"
                    images_metadata.append({
                        "name": img_name,
                        "path": content,
                        "page": page_num
                    })
            elif str(label).lower() == "table" or (DocItemLabel and label == DocItemLabel.TABLE):
                block_type = "table"
                if hasattr(item, 'export_to_dataframe'):
                    try:
                        content = item.export_to_dataframe().to_markdown()
                    except:
                        content = item.text if hasattr(item, "text") else "[Table]"
                else:
                    content = item.text if hasattr(item, "text") else "[Table]"
            else:
                content = item.text if hasattr(item, "text") else ""
            
            if content.strip() or block_type == "image":
                all_blocks.append({
                    "type": block_type,
                    "content": content,
                    "label": str(label),
                    "page": page_num
                })
        
        end_time = time.time()
        
        return {
            "blocks": all_blocks,
            "images": images_metadata,
            "status": "success",
            "metadata": {
                "page_count": total_pages,
                "element_count": total_items,
                "processing_time": round(end_time - start_time, 2),
                "source": "docling-full"
            }
        }
            
    except Exception as e:
        logger.exception("Error during conversion")
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
