import { app } from "/scripts/app.js";

const MAX_PARAM_COUN = 20;
const INPUT_PREFIX = "param";
const OUTPUT_PREFIX = "result";

app.registerExtension({
    name: 'ZnPyCode: dynamic slot',
    async beforeRegisterNodeDef(nodeType, nodeData, appInstance) {
        if (!nodeType.comfyClass.startsWith('ZnPyCode:')) {
            return;
        }
        const originalOnConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function(slotType, slotIndex, links) {
            if (originalOnConnectionsChange) {
                originalOnConnectionsChange.call(this, slotType, slotIndex, links);
            }
            if (!this.hiddenInputs){
                this.hiddenInputs = [];
            }
            if (!this.hiddenOutputs){
                this.hiddenOutputs = [];
            }
            const isInput = typeof slotType == 'number' ? slotType === 1 : slotType === 'input';
            const prefix = isInput ? INPUT_PREFIX : OUTPUT_PREFIX;
            let currentSlots = isInput ? this.inputs : this.outputs;
            let hiddenSlots = isInput ? this.hiddenInputs : this.hiddenOutputs;

            const displayCount = this.getDisplayCount(currentSlots, prefix, isInput);
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
            if (!this.hiddenInputs){
                this.hiddenInputs = [];
            }
            if (!this.hiddenOutputs){
                this.hiddenOutputs = [];
            }
            this.updateSlotVisibility(this.inputs, this.hiddenInputs, INPUT_PREFIX, this.getDisplayCount(this.inputs, INPUT_PREFIX, true), true);
            this.updateSlotVisibility(this.outputs, this.hiddenOutputs, OUTPUT_PREFIX, this.getDisplayCount(this.outputs, OUTPUT_PREFIX, false), false);
        }

        const originalOnRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function(){
            this.restorHidden();
            if (originalOnRemoved) {
                originalOnRemoved.call(this);
            }
        }
        const originalClone = nodeType.prototype.clone;
        nodeType.prototype.clone = function(){
            if (!originalClone){
                return null;
            }
            this.restorHidden();
            const node = originalClone.call(this);
            this.updateSlotVisibility(this.inputs, this.hiddenInputs, INPUT_PREFIX, this.getDisplayCount(this.inputs, INPUT_PREFIX, true), true);
            this.updateSlotVisibility(this.outputs, this.hiddenOutputs, OUTPUT_PREFIX, this.getDisplayCount(this.outputs, OUTPUT_PREFIX, false), false);
            return node;
        };

        nodeType.prototype.restorHidden = function(){
            for(let i = 1; i <= MAX_PARAM_COUN; i++){
                this.moveSlot(this.inputs, this.hiddenInputs, `${INPUT_PREFIX}${i}`, this.inputs);
                this.moveSlot(this.outputs, this.hiddenOutputs, `${OUTPUT_PREFIX}${i}`, this.outputs);
            }
        }

        nodeType.prototype.getDisplayCount = function(slots, prefix, isInput) {
            for (let i = 1; i <= MAX_PARAM_COUN; i++) {
                const slotName = `${prefix}${i}`;
                const slot = slots.find(s => s.name === slotName);
                if (slot == null || slot == undefined ||
                    !isInput && (slot.links == null || slot.links == undefined || slot.links.length === 0) ||
                    isInput && (slot.link == null || slot.link == undefined)) {
                    return i;
                }
            }
            return MAX_PARAM_COUN;
        };

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
        
        nodeType.prototype.updateSlotVisibility = function(currentSlots, hiddenSlots, prefix, displayCount, isInput) {
            for (let i = 1; i <= MAX_PARAM_COUN; i++){
                const slotName = `${prefix}${i}`;
                if (i <= displayCount){
                    this.moveSlot(currentSlots, hiddenSlots, slotName, currentSlots);
                }
                else if (this.graph != null && this.graph != undefined){
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