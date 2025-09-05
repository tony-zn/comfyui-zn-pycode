from .pycode import CustomCode

NODE_CLASS_MAPPINGS = {
    "ZnPyCode: CustomCode": CustomCode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ZnPyCode: CustomCode": "Custom Python Code"
}

WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]