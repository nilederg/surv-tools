let item = Items.thorium;
var button, container;
const ui = require("ui-lib/library");

const DROP_KEY = "R";
const FILL_KEY = "B";

Events.on(ClientLoadEvent, event => {
    input_handler()
})

function grab(item) {
    const unit = Vars.player.unit();
    if (unit && unit.type) {
        const core = unit.closestCore();
        if (core == null) return
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

let gun_only = true; // probably dont want to deploy into thorium reactors kekw

function filler() {
    Groups.build.each(b => {
        if (gun_only && !(b instanceof Turret.TurretBuild)) return;
        drop(b);
    })
}


function input_handler() {
    Core.scene.addListener((event) => {
        if (event instanceof InputEvent && !Vars.ui.chatfrag.shown() && !Vars.ui.schematics.isShown()) {
            if (event.type == "keyDown") {
                if (event.keyCode == DROP_KEY) grab(item);
                if (event.keyCode == FILL_KEY) filler(); // up
            }
        }
        return true
    });
}

let debug = false

Events.on(TapEvent, event => {
    const tile = event.tile;
    if (!tile) return;
    const build = tile.build;
    if (!build) return;
    if (!tile.block()) return;
    if (debug) Log.info("tile: " + tile + "; block: " + tile.block().name, "; build: " + build);
    drop(build);
});

// ui
function set() {
    container.visible = !container.visible;
    if (container.visible) {
        Sounds.click.play();

        container.clear();
        ItemSelection.buildTable(container, Vars.content.items(), () => item, i => {
            if (i) {
                item = i
            }
            container.visible = false;
            button.style.imageUp.region = item.icon(Cicon.full);
        });
        container.pack();
        // TODO: keep this on-screen
        container.setPosition(button.x + button.width / 2 - container.width / 2,
            button.y - container.height);

        // Scale it like block config
        container.transform = true;
        container.actions(Actions.scaleTo(0, 1), Actions.visible(true),
            Actions.scaleTo(1, 1, 0.07, Interp.pow3Out));
    }
};
ui.addButton("surv-tools-grabe", item, null, cell => {
    container = new Table();
    Vars.ui.hudGroup.addChild(container);
    button = cell.get();
    button.clicked(() => {
        if (debug) Log.info("clik")
        set()
    });
})
// ui