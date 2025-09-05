# comfyui-zn-pycode
自定义ComfyUI节点，用于执行自定义Python代码来进行灵活的数据处理，最大可支持20个输入参数和输出结果，并且会根据参数和结果使用情况自动对不使用的插槽进行显隐。  
A custom ComfyUI node for running your own Python code to handle data flexibly. It supports up to 20 input parameters and 20 output results, and will automatically show or hide unused slots based on whether the parameters and results are being used.

# Features
* 输入参数和输出结果都支持任意类型
* Both input parameters and output results support any data type.
* 根据插槽连接情况自动隐藏不使用的插槽
* Unused slots are automatically hidden based on the slot connection status.
* 支持打印标准流输出方便测试
* Standard stream output is supported for easy testing.
![使用示例](example.png)
