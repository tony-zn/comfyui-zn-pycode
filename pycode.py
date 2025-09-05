import sys,io

MAX_PARAM_NUM = 20

class AlwaysEqual(str):
    def __ne__(self, _):
        return False

any_type = AlwaysEqual("*")

class CustomCode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        inputs = {
            "required": {
                "code": ("STRING", {"multiline": True, "default": """result1 = param1\nprint(f"result1 = {result1}")"""}),
            },
            "optional": {
            },
        }
        for i in range(MAX_PARAM_NUM):
            inputs["optional"][f"param{i + 1}"] = (any_type,)
        return inputs

    RETURN_TYPES = tuple(["STRING"] + [any_type] * MAX_PARAM_NUM)
    RETURN_NAMES = tuple(["output"] + [f"result{i + 1}" for i in range(MAX_PARAM_NUM)])
    FUNCTION = "excute"
    CATEGORY = "ZnPyCode/Custom Python Code"

    def excute(self, **kwargs):
        local_values = {f"param{i + 1}":kwargs.get(f"param{i + 1}", None) for i in range(MAX_PARAM_NUM)}
        output_capture = io.StringIO()
        sys.stdout = output_capture
        try:
            exec(kwargs["code"], {}, local_values)
            output = output_capture.getvalue()
        except Exception as e:
            output = str(e)
        sys.stdout = sys.__stdout__
        return tuple([output] + [local_values.get(f"result{i + 1}", None) for i in range(MAX_PARAM_NUM)])
    