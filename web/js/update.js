import { app } from "/scripts/app.js";

// 定义全局常量，方便统一修改
const MAX_PARAM_COUN = 20;
const INPUT_PREFIX = "param";
const OUTPUT_PREFIX = "result";

// 注册插件
app.registerExtension({
    name: 'ZnPyCode: dynamic slot',
    async beforeRegisterNodeDef(nodeType, nodeData, appInstance) {
        // 只对类名以'ZnPyCode:'开头的节点应用此逻辑
        if (!nodeType.comfyClass.startsWith('ZnPyCode:')) {
            return;
        }
        const originalOnConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function(slotType, slotIndex, links) {
            if (originalOnConnectionsChange) {
                originalOnConnectionsChange.call(this, slotType, slotIndex, links);
            }
            
            const isInput = typeof slotType == 'number' ? slotType === 1 : slotType === 'input';
            const prefix = isInput ? INPUT_PREFIX : OUTPUT_PREFIX;
            let currentSlots = isInput ? this.inputs : this.outputs;
            let hiddenSlots = isInput ? this.hiddenInputs : this.hiddenOutputs;

            // 计算应该显示的插槽数量
            const displayCount = this.getDisplayCount(currentSlots, prefix, isInput);
            // 更新插槽显示
            this.updateSlotVisibility(currentSlots, hiddenSlots, prefix, displayCount, isInput);
            
            if (this.graph) {
                this.graph.setDirtyCanvas(true);
            }
        };

        const originalOnAdded = nodeType.prototype.onAdded;
        nodeType.prototype.onAdded = function(graph){
            if (originalOnAdded) {
                originalOnAdded.call(this, graph);
            }
            this.hiddenInputs = [];
            this.hiddenOutputs = [];
            this.updateSlotVisibility(this.inputs, this.hiddenInputs, INPUT_PREFIX, this.getDisplayCount(this.inputs, INPUT_PREFIX));
            this.updateSlotVisibility(this.outputs, this.hiddenOutputs, OUTPUT_PREFIX, this.getDisplayCount(this.outputs, OUTPUT_PREFIX));
        }

        const originalOnRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function(){
            for(let i = 1; i <= MAX_PARAM_COUN; i++){
                this.moveSlot(this.inputs, this.hiddenInputs, `${INPUT_PREFIX}${i}`, this.inputs);
                this.moveSlot(this.outputs, this.hiddenOutputs, `${OUTPUT_PREFIX}${i}`, this.outputs);
            }
            if (originalOnRemoved) {
                originalOnRemoved.call(this);
            }
        }
        
        // 从1开始顺序遍历，直到遇到无连接的插槽或达到最大值
        nodeType.prototype.getDisplayCount = function(slots, prefix, isInput) {
            for (let i = 1; i <= MAX_PARAM_COUN; i++) {
                const slotName = `${prefix}${i}`;
                // 返回第一个不存在或者未连接的插槽所在位置
                const slot = slots.find(s => s.name === slotName);
                if (slot == null || slot == undefined ||
                    !isInput && (slot.links == null || slot.links == undefined || slot.links.length === 0) ||
                    isInput && (slot.link == null || slot.link == undefined)) {
                    return i;
                }
            }
            return MAX_PARAM_COUN;
        };

        // 将name名称的插槽从两个srcSlots中移动到distSlots中去
        nodeType.prototype.moveSlot = function(srcSlots1, srcSlots2, name, distSlots){
            let index = srcSlots1.findIndex(s => s?.name === name);
            let slot = undefined
            if (index == -1){
                index = srcSlots2.findIndex(s => s?.name === name);
                slot = srcSlots2.splice(index, 1)[0];
            }
            else
            {
                slot = srcSlots1.splice(index, 1)[0];
            }
            if (slot == undefined){
                return;
            }
            distSlots.push(slot);
        }
        
        // 更新插槽显示
        nodeType.prototype.updateSlotVisibility = function(currentSlots, hiddenSlots, prefix, displayCount, isInput) {
            for (let i = 1; i <= MAX_PARAM_COUN; i++){
                const slotName = `${prefix}${i}`;
                if (i <= displayCount){
                    this.moveSlot(currentSlots, hiddenSlots, slotName, currentSlots);
                }
                else{
                    if (isInput){
                        this.disconnectInput(slotName, true)
                    }
                    else{
                        this.disconnectOutput(slotName)
                    }
                    this.moveSlot(currentSlots, hiddenSlots, slotName, hiddenSlots);
                }
            }
        };
    }
});