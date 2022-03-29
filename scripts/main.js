Events.on(ClientLoadEvent, event => {
    input_handler()
})

function grab(item) {
    const unit = Vars.player.unit();
    if (unit && unit.type) {
        const core = unit.closestCore();
        if (unit.within(core, unit.type.range)) {
            Call.requestItem(Vars.player, core, item, 2500);
        }
    }
};

function drop(block_to_drop) {
    const unit = Vars.player.unit();
    if (unit && unit.type) {
        if (unit.within(block_to_drop, unit.type.range)) {
            if (block_to_drop.acceptStack(unit.stack.item, unit.stack.amount, unit) > 0) {
                Call.transferInventory(Vars.player, block_to_drop);
            }
        }
    }
}


function input_handler() {
    Core.scene.addListener((event) => {
        if (event instanceof InputEvent && !Vars.ui.chatfrag.shown() && !Vars.ui.schematics.isShown()) {
            if (event.type == "keyDown") {
                if (event.keyCode == "R") grab(Items.thorium);
            }
        }
        return true
    });
}

const thorium_blocks = ['salvo', 'spectre', 'vault', 'container', 'fuse'];

Events.on(TapEvent, event => {
    const tile = event.tile;
    if (!tile) return;
    const build = tile.build;
    if (!build) return;
    if (!tile.block()) return;
    if (thorium_blocks.includes(tile.block().name)) drop(build);
});