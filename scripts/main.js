/*jshint esversion: 6 */
let item = Items.thorium;
var button, container;
const ui = require("ui-lib/library");
const kk = Packages.arc.input.KeyCode;
const DROP_KEY = "R";
const FILL_KEY = "B";

let enabled = true;
let itemList = [];

Events.on(ClientLoadEvent, (event) => {
  itemList = itemlist();
  Log.info(itemList);
  add_quickchat();
  input_handler();
});

function grab(item) {
  if (!enabled) return;
  const unit = Vars.player.unit();
  if (unit && unit.type) {
    const core = unit.closestCore();
    if (core == null) return;
    if (unit.within(core, unit.type.range)) {
      Call.requestItem(Vars.player, core, item, 2500);
    }
  }
}

function drop(block_to_drop) {
  if (!enabled) return;
  const unit = Vars.player.unit();
  if (unit && unit.type) {
    if (unit.within(block_to_drop, unit.type.range)) {
      if (unit.stack.amount <= 0) return;
      if (
        block_to_drop.acceptStack(unit.stack.item, unit.stack.amount, unit) > 0
      ) {
        Call.transferInventory(Vars.player, block_to_drop);
      }
    }
  }
}

function filler(guns_only) {
  if (!enabled) return;
  Groups.build.each((b) => {
    if (guns_only && !(b instanceof Turret.TurretBuild)) return;
    drop(b); // drop() does all the other checks
  });
}

function input_handler() {
  Core.scene.addListener((event) => {
    if (
      event instanceof InputEvent &&
      !Vars.ui.chatfrag.shown() &&
      !Vars.ui.schematics.isShown()
    ) {
      if (event.type == "keyDown") {
        if (event.keyCode == DROP_KEY) grab(item);
        if (event.keyCode == FILL_KEY) filler(true); // up
      }
    }
    return true; // this is necessary
  });
}

let debug = false;

Events.on(TapEvent, (event) => {
  if (!enabled) return;
  const tile = event.tile;
  if (!tile) return;
  const build = tile.build;
  if (!build) return;
  if (!tile.block()) return;
  if (debug)
    Log.info(
      "tile: " + tile + "; block: " + tile.block().name,
      "; build: " + build
    );
  drop(build);
});

// ui
function set() {
  container.visible = !container.visible;
  if (container.visible) {
    Sounds.click.play();

    container.clear();
    ItemSelection.buildTable(
      container,
      Vars.content.items(),
      () => item,
      (i) => {
        if (i) {
          item = i;
        }
        container.visible = false;
        button.style.imageUp.region = item.icon(Cicon.full);
      }
    );
    container.pack();
    // TODO: keep this on-screen
    container.setPosition(
      button.x + button.width / 2 - container.width / 2,
      button.y - container.height
    );

    // Scale it like block config
    container.transform = true;
    container.actions(
      Actions.scaleTo(0, 1),
      Actions.visible(true),
      Actions.scaleTo(1, 1, 0.07, Interp.pow3Out)
    );
  }
}
ui.addButton("surv-tools-grabe", item, null, (cell) => {
  container = new Table();
  Vars.ui.hudGroup.addChild(container);
  button = cell.get();
  button.clicked(() => {
    if (debug) Log.info("clik");
    set();
  });
  button.clicked(kk.mouseRight, () => {
    if (debug) Log.info("clik");
    enabled = !enabled;
    Log.info("enabled: " + enabled);
    let text = enabled ? "turned on itemgrabbing" : "turned off itemgrabbing";
    Vars.ui.hudfrag.showToast(text);
  });
});

function add_quickchat() {
  let buttons = new Table(Styles.black3);
  buttons.top().right();
  buttons.setPosition(1620, 420);
  let nestedButtons = buttons.table().margin(3).get();
  nestedButtons.labelWrap("quickchat").pad(2).row();
  for (let i = 0; i < 4; i++) {
    nestedButtons.labelWrap("").pad(2).row();
    for (let j = 0; j < 4; j++) {
      nestedButtons
        .button(itemList[i][j], Styles.defaultt, () => {
          produce(i, j);
        })
        .height(45)
        .width(45)
        .pad(1);
    }
  }
  buttons.pack();
  Vars.ui.hudGroup.addChild(buttons);
}

function itemlist() {
  let list = [
    [
      Items.copper.emoji(),
      Items.lead.emoji(),
      Items.metaglass.emoji(),
      Items.graphite.emoji(),
    ],
    [
      Items.sand.emoji(),
      Items.coal.emoji(),
      Items.titanium.emoji(),
      Items.thorium.emoji(),
    ],
    [
      Items.silicon.emoji(),
      Items.plastanium.emoji(),
      Items.phaseFabric.emoji(),
      Items.surgeAlloy.emoji(),
    ],
    ["", Items.blastCompound.emoji(), Items.pyratite.emoji(), ""],
  ];
  return list;
}

function produce(i, j) {
  let itemList = itemlist();
  let string = itemList[i - 1][j - 1];
  Log.info(string);
  if (string) {
    Call.sendChatMessage("/t Producing " + string);
  } else {
    Log.info(itemList[i - 1]);
  }
}

// ui
