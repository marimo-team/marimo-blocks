import type { PyodideInterface } from "pyodide";

export async function initUtils(pyodide: PyodideInterface) {
	pyodide.FS.mkdir("/marimo");
	pyodide.FS.writeFile("/marimo/mime_utils.py", mime_utils);

	// Add python to Python path
	await pyodide.runPythonAsync(`
        import sys
        if "/marimo" not in sys.path:
            sys.path.append("/marimo")
    `);
}

const mime_utils = `
import base64
import json
from io import BytesIO
from typing import Any, Optional, Tuple


def guess_mime_type(obj: Any) -> str:
    """Guess the MIME type of a Python object."""

    # Check if object is already a MIME tuple
    if isinstance(obj, tuple) and len(obj) == 2:
        mime_type, _ = obj
        if isinstance(mime_type, str) and mime_type.count('/') == 1:
            return mime_type

    # Check for marimo _mime_ method first
    if hasattr(obj, "_mime_"):
        try:
            mime_type, _ = obj._mime_()
            return mime_type
        except Exception:
            pass

    # Check for IPython display methods
    if hasattr(obj, "_repr_html_"):
        return "text/html"
    if hasattr(obj, "_repr_markdown_"):
        return "text/markdown"
    if hasattr(obj, "_repr_svg_"):
        return "image/svg+xml"
    if hasattr(obj, "_repr_png_"):
        return "image/png"
    if hasattr(obj, "_repr_jpeg_"):
        return "image/jpeg"
    if hasattr(obj, "_repr_latex_"):
        return "text/latex"
    if hasattr(obj, "_repr_json_"):
        return "application/json"

    # Handle None
    if obj is None:
        return "text/plain"

    # Handle basic types
    if isinstance(obj, (str, int, float, bool)):
        return "text/plain"

    # Handle dict/list - use JSON
    if isinstance(obj, (dict, list)):
        return "application/json"

    # Handle bytes/bytearrays
    if isinstance(obj, (bytes, bytearray)):
        # Try to detect common image formats
        if obj.startswith(b"\\x89PNG\\r\\n\\x1a\\n"):
            return "image/png"
        if obj.startswith(b"\\xff\\xd8"):
            return "image/jpeg"
        if obj.startswith(b"GIF87a") or obj.startswith(b"GIF89a"):
            return "image/gif"
        # Add more magic number checks as needed

        return "application/octet-stream"

    # Handle common libraries
    try:
        # NumPy arrays
        import numpy as np

        if isinstance(obj, np.ndarray):
            return "application/json"
    except ImportError:
        pass

    try:
        # PIL Images
        from PIL import Image

        if isinstance(obj, Image.Image):
            return "image/png"  # Convert PIL images to PNG
    except ImportError:
        pass

    try:
        # Matplotlib figures
        import matplotlib.figure

        if isinstance(obj, matplotlib.figure.Figure):
            return "image/png"
    except ImportError:
        pass

    # Default to plain text
    return "text/plain"

def handle_bytes(mime_type: str, obj: Any) -> Tuple[str, Any]:
    """Handle bytes/bytearray objects by converting to data URI."""
    if isinstance(obj, (bytes, bytearray)):
        img_str = base64.b64encode(obj).decode()
        return mime_type, f"data:{mime_type};base64,{img_str}"

    return mime_type, obj

def convert_to_mime_data(obj: Any, mime_type: Optional[str] = None) -> Tuple[str, Any]:
    """Convert a Python object to MIME data."""

    # If object is already a MIME tuple, return it directly
    if isinstance(obj, tuple) and len(obj) == 2:
        potential_mime, data = obj
        if isinstance(potential_mime, str) and potential_mime.count('/') == 1:
            return handle_bytes(potential_mime, data)

    if mime_type is None:
        mime_type = guess_mime_type(obj)

    # At this point mime_type is guaranteed to be a string due to guess_mime_type
    assert mime_type is not None

    # Handle marimo _mime_ method first
    if hasattr(obj, "_mime_"):
        try:
            return obj._mime_()
        except Exception:
            pass

    # Handle IPython display methods
    if mime_type == "text/html" and hasattr(obj, "_repr_html_"):
        return mime_type, obj._repr_html_()
    if mime_type == "text/markdown" and hasattr(obj, "_repr_markdown_"):
        return mime_type, obj._repr_markdown_()
    if mime_type == "image/svg+xml" and hasattr(obj, "_repr_svg_"):
        return mime_type, obj._repr_svg_()
    if mime_type == "image/png" and hasattr(obj, "_repr_png_"):
        return mime_type, f"data:image/png;base64,{obj._repr_png_()}"
    if mime_type == "image/jpeg" and hasattr(obj, "_repr_jpeg_"):
        return mime_type, f"data:image/jpeg;base64,{obj._repr_jpeg_()}"
    if mime_type == "text/latex" and hasattr(obj, "_repr_latex_"):
        return mime_type, obj._repr_latex_()
    if mime_type == "application/json" and hasattr(obj, "_repr_json_"):
        return mime_type, obj._repr_json_()

    if mime_type == "text/plain":
        return mime_type, str(obj)

    if mime_type == "application/json":
        if hasattr(obj, "tolist"):  # Handle NumPy arrays
            obj = obj.tolist()
        return mime_type, json.dumps(obj)

    # Handle any bytes/bytearray objects by converting to data URI
    if isinstance(obj, (bytes, bytearray)):
        return handle_bytes(mime_type, obj)

    if mime_type.startswith("image/"):
        try:
            # Handle PIL Images
            from PIL import Image

            if isinstance(obj, Image.Image):
                buffer = BytesIO()
                obj.save(buffer, format="PNG")
                img_str = base64.b64encode(buffer.getvalue()).decode()
                return "image/png", f"data:image/png;base64,{img_str}"
        except ImportError:
            pass

        try:
            # Handle Matplotlib figures
            import matplotlib.figure

            if isinstance(obj, matplotlib.figure.Figure):
                buffer = BytesIO()
                obj.savefig(buffer, format="png", bbox_inches="tight")
                img_str = base64.b64encode(buffer.getvalue()).decode()
                return "image/png", f"data:image/png;base64,{img_str}"
        except ImportError:
            pass

    return mime_type, str(obj)  # Fallback to string representation
`.trim();
