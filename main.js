const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const DAY_SECONDS = 180;
const TOTAL_SECONDS = DAY_SECONDS * 3;
const STORAGE_KEY = "beerSimulatorMvpSave";

const scenes = [
  { key: "supermarket", name: "超市货架", shelf: "shelf_supermarket.png", bg: 0xf6d78a, wall: 0xf9edcf, floor: 0x718f94, cool: false },
  { key: "fridge", name: "超市冰柜", shelf: "shelf_fridge.png", bg: 0xb9e8f0, wall: 0xe7fbff, floor: 0x9fb6c8, cool: true },
  { key: "convenience", name: "便利店冷藏柜", shelf: "shelf_convenience.png", bg: 0xf7c36d, wall: 0xfff4db, floor: 0x7f8a80, cool: true },
  { key: "bar", name: "酒吧后厨", shelf: "shelf_bar.png", bg: 0xd09b61, wall: 0x50433a, floor: 0x6a5a4b, cool: false },
  { key: "gas", name: "加油站商店", shelf: "shelf_gas_station.png", bg: 0xa7c7e7, wall: 0xe8f1f6, floor: 0x6c7888, cool: false },
];

const traits = [
  { key: "cheap", name: "便宜", color: 0xffc857, asset: "beer_normal.png" },
  { key: "traditional", name: "传统", color: 0x8a5a28, asset: "beer_traditional.png" },
  { key: "fancy", name: "花哨", color: 0xff4fa3, asset: "beer_fancy.png" },
  { key: "craft", name: "精酿", color: 0x4c956c, asset: "beer_craft.png" },
  { key: "discount", name: "打折", color: 0xe63946, asset: "beer_discount.png" },
  { key: "alcoholFree", name: "无酒精", color: 0x3a86ff, asset: "beer_alcohol_free.png" },
];

const labelStates = [
  { name: "正面朝外", short: "正面", multiplier: 1.28 },
  { name: "侧面朝外", short: "侧面", multiplier: 1 },
  { name: "背面朝外", short: "背面", multiplier: 0.72 },
];

const laneNames = ["后排", "中排", "前排", "边缘"];
const layerNames = ["最上层", "中层", "底层"];

const customers = [
  { key: "drunk", name: "醉鬼", emoji: "醉鬼", avatar: "醉", assets: ["cust_zuihan"], likes: traits.map((trait) => trait.key), base: 0.29, random: 0.19, quotes: ["来点酒。", "今天必须喝。"] },
  { key: "tourist", name: "游客", emoji: "游客", avatar: "游", assets: ["cust_youkenan"], likes: ["fancy", "craft"], base: 0.13, random: 0.05, quotes: ["这个包装挺有意思。", "带回去做纪念。"] },
  { key: "student", name: "大学生", emoji: "学生", avatar: "学", assets: ["cust_daxuesheng"], likes: ["cheap", "discount"], base: 0.1, random: 0.04, quotes: ["有打折吗？", "预算不多。"] },
  { key: "oldMan", name: "大爷", emoji: "大爷", avatar: "爷", assets: ["cust_daye"], likes: ["traditional", "craft", "discount"], base: 0.1, random: 0.035, quotes: ["这个有老味儿。", "打折我看看。"] },
  { key: "worker", name: "社畜", emoji: "社畜", avatar: "命", assets: [], likes: traits.map((trait) => trait.key), base: 0.12, random: 0.1, quotes: ["今天真累。", "随便买点吧。"] },
  { key: "demon", name: "魔王", emoji: "魔王", avatar: "魔", assets: [], likes: traits.map((trait) => trait.key), base: 0.04, random: 0.02, quotes: ["哪里有啤酒？", "露出来的都归我。"] },
];

const touristAssetVariants = [
  ["cust_youkenan"],
  ["cust_youkenv"],
  ["cust_youkenan", "cust_youkenv"],
  ["cust_youkenan", "cust_youkenan"],
  ["cust_youkenv", "cust_youkenv"],
];

const sceneCustomerWeights = {
  supermarket: { student: 15, oldMan: 25, worker: 20, demon: 10, tourist: 15, drunk: 15 },
  fridge: { student: 20, oldMan: 15, worker: 20, demon: 15, tourist: 10, drunk: 20 },
  convenience: { student: 20, oldMan: 20, worker: 25, demon: 10, tourist: 10, drunk: 15 },
  bar: { student: 30, oldMan: 5, worker: 10, demon: 15, tourist: 10, drunk: 30 },
  gas: { student: 10, oldMan: 15, worker: 15, demon: 20, tourist: 20, drunk: 20 },
};

const customerPreferenceWeights = {
  student: { cheap: 25, traditional: 5, fancy: 20, craft: 10, discount: 35, alcoholFree: 5 },
  oldMan: { cheap: 5, traditional: 45, fancy: 5, craft: 35, discount: 5, alcoholFree: 5 },
  tourist: { cheap: 5, traditional: 15, fancy: 40, craft: 20, discount: 5, alcoholFree: 15 },
  drunk: { cheap: 20, traditional: 20, fancy: 10, craft: 20, discount: 20, alcoholFree: 10 },
  worker: { cheap: 15, traditional: 20, fancy: 10, craft: 25, discount: 20, alcoholFree: 10 },
};

const demonTypes = {
  normal: {
    name: "普通魔王",
    baseFind: 0.25,
    preference: { cheap: 10, traditional: 10, fancy: 25, craft: 25, discount: 10, alcoholFree: 20 },
  },
  strong: {
    name: "强力魔王",
    baseFind: 0.45,
    preference: { cheap: 5, traditional: 10, fancy: 30, craft: 30, discount: 5, alcoholFree: 20 },
  },
};

const randomEvents = [
  { key: "child", text: "熊孩子乱碰货架，整排酒开始集体怀疑人生。", impulse: 1.15 },
  { key: "restock", text: "员工补货，货架震了一下，你被顺手往外挤了挤。", impulse: 0.9 },
  { key: "pickup", text: "顾客拿起你看标签，又把你放回原地。标签角度变了。", pickup: true },
  { key: "drinkFall", text: "旁边饮料倒下，给了你一个不太礼貌的侧撞。", impulse: 1.45 },
  { key: "fridgeSlam", text: "冰柜门被重重关上，冷气和震动一起糊脸。", impulse: 1.0 },
  { key: "promo", text: "打折促销开始，顾客数量增加。", promo: true },
  { key: "cleaning", text: "货架清理，前排商品更容易被拿走。", cleaning: true },
  { key: "spotlight", text: "灯光刚好照到你，瓶身开始营业。", spotlight: true },
];

const ui = {
  loading: document.getElementById("loadingScreen"),
  menu: document.getElementById("menuScreen"),
  hud: document.getElementById("hud"),
  result: document.getElementById("resultScreen"),
  points: document.getElementById("pointsScreen"),
  settings: document.getElementById("settingsScreen"),
  startButton: document.getElementById("startButton"),
  pointsButton: document.getElementById("pointsButton"),
  shopAdButton: document.getElementById("shopAdButton"),
  settingsButton: document.getElementById("settingsButton"),
  tiltButton: document.getElementById("tiltButton"),
  resetButton: document.getElementById("resetButton"),
  reviveButton: document.getElementById("reviveButton"),
  nextButton: document.getElementById("nextButton"),
  menuButton: document.getElementById("menuButton"),
  viewLeftButton: document.getElementById("viewLeftButton"),
  viewCenterButton: document.getElementById("viewCenterButton"),
  viewRightButton: document.getElementById("viewRightButton"),
  statWins: document.getElementById("statWins"),
  statBreaks: document.getElementById("statBreaks"),
  statExpired: document.getElementById("statExpired"),
  statBestScore: document.getElementById("statBestScore"),
  statTotalPoints: document.getElementById("statTotalPoints"),
  statBestStreak: document.getElementById("statBestStreak"),
  pointsTotal: document.getElementById("pointsTotal"),
  pointsBest: document.getElementById("pointsBest"),
  pointsBestStreak: document.getElementById("pointsBestStreak"),
  pointsWins: document.getElementById("pointsWins"),
  pointsFailures: document.getElementById("pointsFailures"),
  pointsAdUses: document.getElementById("pointsAdUses"),
  pointsBackButton: document.getElementById("pointsBackButton"),
  settingsPlatform: document.getElementById("settingsPlatform"),
  settingsTilt: document.getElementById("settingsTilt"),
  settingsBackButton: document.getElementById("settingsBackButton"),
  dressButton: document.getElementById("dressButton"),
  hudDay: document.getElementById("hudDay"),
  hudTime: document.getElementById("hudTime"),
  hudScene: document.getElementById("hudScene"),
  hudLane: document.getElementById("hudLane"),
  hudLabel: document.getElementById("hudLabel"),
  hudTrait: document.getElementById("hudTrait"),
  hudIntegrity: document.getElementById("hudIntegrity"),
  hudRunPoints: document.getElementById("hudRunPoints"),
  hudTotalPoints: document.getElementById("hudTotalPoints"),
  hudStreak: document.getElementById("hudStreak"),
  hudWaits: document.getElementById("hudWaits"),
  hudMessage: document.getElementById("hudMessage"),
  exposureFill: document.getElementById("exposureFill"),
  integrityFill: document.getElementById("integrityFill"),
  dangerFill: document.getElementById("dangerFill"),
  stealthButton: document.getElementById("stealthButton"),
  adStickerButton: document.getElementById("adStickerButton"),
  demonWarning: document.getElementById("demonWarning"),
  customerCard: document.getElementById("customerCard"),
  customerEmoji: document.getElementById("customerEmoji"),
  customerName: document.getElementById("customerName"),
  customerAction: document.getElementById("customerAction"),
  customerPoints: document.getElementById("customerPoints"),
  resultKicker: document.getElementById("resultKicker"),
  resultTitle: document.getElementById("resultTitle"),
  resultEnding: document.getElementById("resultEnding"),
  resultDays: document.getElementById("resultDays"),
  resultBuyer: document.getElementById("resultBuyer"),
  resultMatch: document.getElementById("resultMatch"),
  resultRevive: document.getElementById("resultRevive"),
  resultSalePoints: document.getElementById("resultSalePoints"),
  resultDemonPoints: document.getElementById("resultDemonPoints"),
  resultWaitPoints: document.getElementById("resultWaitPoints"),
  resultStreakMultiplier: document.getElementById("resultStreakMultiplier"),
  resultScore: document.getElementById("resultScore"),
  resultDoubleAd: document.getElementById("resultDoubleAd"),
  resultTotalPoints: document.getElementById("resultTotalPoints"),
  doubleScoreButton: document.getElementById("doubleScoreButton"),
  dress: document.getElementById("dressScreen"),
  dressTargetSelect: document.getElementById("dressTargetSelect"),
  dressCategoryField: document.getElementById("dressCategoryField"),
  dressCategorySelect: document.getElementById("dressCategorySelect"),
  dressDecorationSelect: document.getElementById("dressDecorationSelect"),
  dressCanvas: document.getElementById("dressCanvas"),
  dressScale: document.getElementById("dressScale"),
  dressRotation: document.getElementById("dressRotation"),
  dressAddButton: document.getElementById("dressAddButton"),
  dressDeleteButton: document.getElementById("dressDeleteButton"),
  dressSaveButton: document.getElementById("dressSaveButton"),
  dressResetButton: document.getElementById("dressResetButton"),
  dressBackButton: document.getElementById("dressBackButton"),
};

let gameScene = null;
let save = loadSave();
let tilt = { enabled: false, x: 0, y: 0, betaBase: null };
let decorationConfig = { decorations: [] };
let dressState = { target: "beer", selected: null, items: [] };
const dressBaseImages = {
  student: "assets/customers/daxuesheng.png",
  oldMan: "assets/customers/daye.png",
  drunk: "assets/customers/zuihan.png",
  tourist: "assets/customers/youkenan.png",
};

class BeerScene extends Phaser.Scene {
  constructor() {
    super("BeerScene");
  }

  preload() {
    this.load.image("cust_zuihan", "assets/customers/zuihan.png");
    this.load.image("cust_youkenan", "assets/customers/youkenan.png");
    this.load.image("cust_youkenv", "assets/customers/youkenv.png");
    this.load.image("cust_daxuesheng", "assets/customers/daxuesheng.png");
    this.load.image("cust_daye", "assets/customers/daye.png");
    for (let i = 1; i <= 7; i += 1) {
      const id = `deco_${String(i).padStart(3, "0")}`;
      this.load.image(`deco_image_${id}`, `assets/decorations/${id}.png`);
    }
  }

  create() {
    gameScene = this;
    this.mode = "menu";
    this.viewIndex = 1;
    this.rng = new Phaser.Math.RandomDataGenerator([String(Date.now())]);
    this.keys = this.input.keyboard.addKeys("A,D,W,S,SPACE,ONE,TWO,THREE");
    this.bg = this.add.graphics();
    this.shelf = this.add.graphics();
    this.shadow = this.add.graphics();
    this.items = [];
    this.floaters = [];
    this.createBeer();
    this.createCustomerActor();
    this.input.on("pointerdown", () => {
      if (this.mode === "playing") this.rotateLabel();
    });
    this.drawIdle();
    updateStatsUi();
    hide(ui.loading);
    const params = new URLSearchParams(window.location.search);
    if (params.has("autostart") || params.has("scene") || params.has("customer")) {
      this.time.delayedCall(100, () => this.startRun());
    }
  }

  loadDecorationTextures(onComplete = null) {
    const decorations = (decorationConfig.decorations || []).filter((deco) => deco.image);
    let queued = 0;
    decorations.forEach((deco) => {
      const key = getDecorationTextureKey(deco);
      if (!this.textures.exists(key)) {
        this.load.image(key, `assets/decorations/${deco.image}`);
        queued += 1;
      }
    });
    if (queued === 0) {
      if (onComplete) onComplete();
      return;
    }
    this.load.once("complete", () => {
      if (onComplete) onComplete();
    });
    this.load.start();
  }

  refreshAllDress() {
    this.loadDecorationTextures(() => {
      this.applyBeerDress();
      this.customerActors.forEach((actor) => {
        if (actor.activeCustomer && actor.activeCustomerKey) {
          this.applyCustomerDress(actor, actor.activeCustomerKey);
        }
      });
    });
  }

  createBeer() {
    this.beer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.beerBody = this.add.graphics();
    this.beerLabel = this.add.text(0, 8, "正", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "24px",
      fontStyle: "900",
      color: "#172029",
      align: "center",
    }).setOrigin(0.5);
    this.beer.add([this.beerBody, this.beerLabel]);
    this.beerDressItems = [];
    this.beer.setDepth(20);
  }

  createCustomerActor() {
    this.customerActors = [];
    for (let i = 0; i < 2; i += 1) {
      const actor = this.add.container(GAME_WIDTH + 90, 392);
      const shadow = this.add.graphics();
      const sprite = this.add.image(0, 0, "cust_zuihan").setOrigin(0.5, 1);
      const fallback = this.add.graphics();
      const fallbackText = this.add.text(0, -70, "大命", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        fontStyle: "900",
        color: "#172029",
      }).setOrigin(0.5);
      const bubble = this.add.graphics();
      const bubbleText = this.add.text(0, -152, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "900",
        color: "#172029",
        align: "center",
      }).setOrigin(0.5);
      actor.add([shadow, sprite, fallback, fallbackText, bubble, bubbleText]);
      actor.parts = { shadow, sprite, fallback, fallbackText, bubble, bubbleText };
      actor.baseY = 392;
      actor.setDepth(60 + i);
      actor.setVisible(false);
      this.customerActors.push(actor);
    }
    this.customerActor = this.customerActors[0];
  }

  startRun() {
    this.mode = "playing";
    const params = new URLSearchParams(window.location.search);
    const forcedScene = scenes.find((scene) => scene.key === params.get("scene"));
    const pickedScene = forcedScene || Phaser.Utils.Array.GetRandom(scenes);
    const isFreezerPile = pickedScene.key === "fridge";
    this.run = {
      scene: pickedScene,
      trait: Phaser.Utils.Array.GetRandom(traits),
      elapsed: 0,
      x: isFreezerPile ? this.rng.realInRange(-0.38, 0.28) : this.rng.realInRange(-0.22, 0.18),
      lane: isFreezerPile ? this.rng.realInRange(0.15, 1.1) : 1,
      layer: isFreezerPile ? this.rng.between(1, 2) : 0,
      visibility: isFreezerPile ? 0.12 : 1,
      integrity: 100,
      vx: 0,
      vlane: 0,
      label: 0,
      usedRevive: false,
      statsApplied: false,
      buyer: null,
      match: false,
      finalEnding: null,
      score: 0,
      scoreBreakdown: {
        saleBase: 0,
        demonDodge: 0,
        wait: 0,
        streakMultiplier: getStreakMultiplier(save.currentStreak || 0),
        final: 0,
        doubled: false,
        awarded: false,
      },
      waitStreak: 0,
      eventText: "你出生在货架中排，标签还挺自信。",
      eventTimer: this.rng.realInRange(8, 14),
      customerTimer: new URLSearchParams(window.location.search).has("customer") ? 0.4 : this.rng.realInRange(4, 8),
      customer: null,
      customerPhase: 0,
      promoTimer: 0,
      spotlightTimer: 0,
      cleaningTimer: 0,
      dangerFlash: 0,
      shelfShake: 0,
      collisionCooldown: 1.1,
      otherBroken: 0,
      exposureBonus: 0,
      stealthStickers: 1,
      stealthTimer: 0,
      pendingCustomer: null,
      demonWarningTimer: 0,
      demonWarningActive: false,
      messageTimer: 4,
      level: 1,
    };
    this.populateShelf();
    unlockCodex("beers", this.run.trait.key);
    unlockCodex("scenes", this.run.scene.key);
    this.drawScene();
    this.updateBeerArt();
    this.applyBeerDress();
    this.hideCustomer();
    hide(ui.demonWarning);
    show(ui.hud);
    hide(ui.menu);
    hide(ui.result);
    if (this.isFreezerPile()) {
      this.setMessage(`${this.run.scene.name}：你被埋在${layerNames[this.run.layer]}，像一个冷柜盲盒。慢慢挤上去。`);
    } else {
      this.setMessage(`${this.run.scene.name}：轻轻滚到前排，正面标签朝外时更容易被看见。`);
    }
    this.updateHud();
  }

  reviveRun() {
    if (!this.run || this.run.usedRevive) return;
    this.mode = "playing";
    this.run.usedRevive = true;
    this.run.finalEnding = null;
    this.run.score = 0;
    this.run.scoreBreakdown.final = 0;
    this.run.x = 0;
    this.run.lane = 1;
    this.run.layer = this.isFreezerPile() ? 1 : 0;
    this.run.visibility = this.isFreezerPile() ? 0.45 : 1;
    this.run.integrity = Math.max(this.run.integrity, 55);
    this.run.vx = 0;
    this.run.vlane = 0;
    this.run.dangerFlash = 0;
    this.run.customer = null;
    this.run.customerTimer = this.rng.realInRange(3, 7);
    this.run.pendingCustomer = null;
    this.run.demonWarningTimer = 0;
    this.run.demonWarningActive = false;
    this.run.eventText = "广告播放完毕。你奇迹般回到中排，保质期没有重置。";
    this.run.messageTimer = 4;
    this.beer.setVisible(true);
    this.customerActors.forEach((actor) => {
      actor.setVisible(false);
      actor.activeCustomer = false;
    });
    hide(ui.demonWarning);
    this.updateBeerArt();
    this.applyBeerDress();
    this.updateHud();
    hide(ui.result);
    show(ui.hud);
  }

  populateShelf() {
    this.items.forEach((item) => item.destroy());
    this.items = [];
    if (this.isFreezerPile()) {
      this.populateFreezerPile();
      return;
    }
    const colors = [0xf4a261, 0x2a9d8f, 0xe76f51, 0x9b5de5, 0x90be6d, 0x577590];
    for (let lane = 0; lane < 3; lane += 1) {
      for (let i = 0; i < 11; i += 1) {
        const x = -0.9 + i * 0.18 + this.rng.realInRange(-0.02, 0.02);
        if (Math.abs(x) < 0.22 && lane === 1) continue;
        const item = this.add.container();
        const g = this.add.graphics();
        const label = this.add.text(0, 3, lane === 2 ? "饮" : "啤", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          fontStyle: "900",
          color: "#20303c",
        }).setOrigin(0.5);
        item.add([g, label]);
        item.meta = { x, lane, layer: 0, vx: 0, vlane: 0, color: Phaser.Utils.Array.GetRandom(colors), removed: false };
        item.setDepth(6 + lane);
        this.items.push(item);
      }
    }
  }

  populateFreezerPile() {
    const colors = [0x58c4dd, 0xf4a261, 0xe76f51, 0x2a9d8f, 0x90be6d, 0xffc857, 0x9b5de5, 0xef476f];
    const counts = [16, 18, 20];
    for (let layer = 2; layer >= 0; layer -= 1) {
      for (let i = 0; i < counts[layer]; i += 1) {
        const item = this.add.container();
        const g = this.add.graphics();
        const label = this.add.text(0, 3, this.rng.frac() > 0.42 ? "饮" : "啤", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "900",
          color: "#20303c",
        }).setOrigin(0.5);
        item.add([g, label]);
        item.meta = {
          x: this.rng.realInRange(-0.8, 0.8),
          lane: this.rng.realInRange(0.05, 2.66),
          layer,
          vx: 0,
          vlane: 0,
          color: Phaser.Utils.Array.GetRandom(colors),
          removed: false,
        };
        this.items.push(item);
      }
    }
  }

  update(time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.04);
    if (!this.run || this.mode !== "playing") {
      this.animateIdle(time);
      return;
    }

    this.updateTimers(dt);
    this.updateInput(dt);
    this.updatePhysics(dt);
    this.updateCustomer(dt);
    this.updateLayout();
    this.updateHud();

    if (this.run.elapsed >= TOTAL_SECONDS) {
      this.endRun("expired", false);
    }
  }

  updateTimers(dt) {
    const run = this.run;
    const timeScale = run.waitStreak >= 5 ? 1.5 : 1;
    run.elapsed += dt * timeScale;
    run.eventTimer -= dt * (run.waitStreak >= 4 ? 1.1 : 1);
    run.customerTimer -= dt;
    run.messageTimer = Math.max(0, run.messageTimer - dt);
    run.promoTimer = Math.max(0, run.promoTimer - dt);
    run.spotlightTimer = Math.max(0, run.spotlightTimer - dt);
    run.cleaningTimer = Math.max(0, run.cleaningTimer - dt);
    run.dangerFlash = Math.max(0, run.dangerFlash - dt);
    run.shelfShake = Math.max(0, run.shelfShake - dt * 1.8);
    run.collisionCooldown = Math.max(0, run.collisionCooldown - dt);
    run.stealthTimer = Math.max(0, run.stealthTimer - dt);
    if (run.demonWarningTimer > 0) {
      run.demonWarningTimer = Math.max(0, run.demonWarningTimer - dt);
      if (run.demonWarningTimer <= 0 && run.pendingCustomer) {
        const pending = run.pendingCustomer;
        run.pendingCustomer = null;
        run.demonWarningActive = false;
        hide(ui.demonWarning);
        this.spawnCustomer(pending);
      }
    }

    if (run.eventTimer <= 0) {
      this.triggerRandomEvent();
      run.eventTimer = this.rng.realInRange(11, 21);
    }

    if (!run.customer && !run.pendingCustomer && run.customerTimer <= 0) {
      const nextCustomer = this.chooseCustomer();
      if (nextCustomer.key === "demon") {
        this.startDemonWarning(nextCustomer);
      } else {
        this.spawnCustomer(nextCustomer);
      }
    }
  }

  updateInput(dt) {
    const run = this.run;
    let inputX = tilt.enabled ? tilt.x : 0;
    let inputLane = tilt.enabled ? tilt.y : 0;

    if (this.keys.A.isDown) inputX -= 1;
    if (this.keys.D.isDown) inputX += 1;
    if (this.keys.W.isDown) inputLane += 1;
    if (this.keys.S.isDown) inputLane -= 1;

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.rotateLabel();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.setView(0);
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) this.setView(1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) this.setView(2);

    run.vx += Phaser.Math.Clamp(inputX, -1.5, 1.5) * 1.55 * dt;
    run.vlane += Phaser.Math.Clamp(inputLane, -1.5, 1.5) * 1.08 * dt;
  }

  updatePhysics(dt) {
    const run = this.run;
    run.x += run.vx * dt;
    run.lane += run.vlane * dt;
    this.updateItemPhysics(dt);
    this.resolveBottleCollisions(dt);
    this.updateBurialState(dt);
    run.vx *= Math.pow(0.68, dt);
    run.vlane *= Math.pow(0.64, dt);

    if (run.lane < 0) {
      run.lane = 0;
      run.vlane *= -0.22;
    }

    const edgeDanger = this.getDanger();
    const speed = Math.hypot(run.vx, run.vlane);
    if (run.lane > 3.12 || (Math.abs(run.x) > 1.08 && run.lane > 2.52)) {
      this.endRun("broken", true);
      return;
    }

    if (speed > 2.45 && edgeDanger > 0.62) {
      this.endRun("broken", true);
      return;
    }

    if (run.integrity <= 0) {
      this.endRun("broken", true);
      return;
    }

    run.x = Phaser.Math.Clamp(run.x, -1.16, 1.16);
    run.lane = Phaser.Math.Clamp(run.lane, 0, 3.2);
  }

  updateItemPhysics(dt) {
    this.items.forEach((item) => {
      if (item.meta.removed) return;
      item.meta.x += item.meta.vx * dt;
      item.meta.lane += item.meta.vlane * dt;
      item.meta.vx *= Math.pow(0.42, dt);
      item.meta.vlane *= Math.pow(0.42, dt);
      const projected = this.project(item.meta.x, item.meta.lane);
      const shelfBounds = this.isFreezerPile()
        ? { left: 108, right: 852, top: 146, bottom: 390, radius: 23 }
        : { left: 98, right: 862, top: 128, bottom: 396, radius: 20 };
      const visualRadius = shelfBounds.radius * projected.scale;
      const movingHard = Math.hypot(item.meta.vx, item.meta.vlane) > 0.12;
      const visualFallX = projected.x - visualRadius < shelfBounds.left || projected.x + visualRadius > shelfBounds.right;
      const visualFallLane = projected.y + visualRadius > shelfBounds.bottom || projected.y - visualRadius < shelfBounds.top - 10;
      const visuallyOffShelf = visualFallX || visualFallLane;
      item.meta.edgeTimer = visuallyOffShelf ? (item.meta.edgeTimer || 0) + dt : 0;
      const fallX = Math.abs(item.meta.x) > 1.18 || (visualFallX && (movingHard || item.meta.edgeTimer > 0.18));
      const fallLane =
        item.meta.lane > (this.isFreezerPile() ? 2.86 : 2.94) ||
        item.meta.lane < -0.16 ||
        (visualFallLane && (movingHard || item.meta.edgeTimer > 0.18));
      if (fallX || fallLane) {
        this.shatterOtherDrink(item, "edge");
        return;
      }
      item.meta.x = Phaser.Math.Clamp(item.meta.x, -1.12, 1.12);
      item.meta.lane = Phaser.Math.Clamp(item.meta.lane, -0.06, this.isFreezerPile() ? 2.78 : 2.86);
    });
  }

  resolveBottleCollisions(dt) {
    const run = this.run;
    const playerLayer = run.layer || 0;
    const radius = this.isFreezerPile() ? 0.18 : 0.15;
    let collisionCount = 0;

    this.items.forEach((item) => {
      if (item.meta.removed) return;
      const layerGap = Math.abs((item.meta.layer || 0) - playerLayer);
      const layerReach = this.isFreezerPile() ? 0.08 * layerGap : 0;
      const dx = run.x - item.meta.x;
      const dy = (run.lane - item.meta.lane) * 0.86;
      const dist = Math.max(0.001, Math.hypot(dx, dy));
      const minDist = radius + layerReach;
      if (dist > minDist) return;

      collisionCount += 1;
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;
      const speed = Math.hypot(run.vx - item.meta.vx, run.vlane - item.meta.vlane);
      const squeeze = this.isFreezerPile() ? (2 - Math.min(2, playerLayer)) * 0.08 : 0;
      const impact = speed + overlap * 3.4 + squeeze + collisionCount * 0.04;
      const canHurt = run.elapsed > 0.8;

      run.x += nx * overlap * 0.46;
      run.lane += ny * overlap * 0.42;
      run.vx += nx * impact * 0.08;
      run.vlane += ny * impact * 0.07;
      item.meta.vx -= nx * impact * 0.32;
      item.meta.vlane -= ny * impact * 0.26;
      run.shelfShake = Math.min(1, run.shelfShake + impact * 0.16);
      run.dangerFlash = Math.min(1, run.dangerFlash + impact * 0.08);

      const squeezeOutChance = Phaser.Math.Clamp((impact - 1.05) * 0.28, 0, 0.42);
      if (canHurt && impact >= 1.08 && this.rng.frac() < squeezeOutChance) {
        this.shatterOtherDrink(item, "squeezed");
        return;
      }

      if (canHurt && impact >= 1.72) {
        this.damageBeer(999, "强烈挤压！你用玻璃之躯向现实发起挑战。");
        return;
      }

      if (canHurt && impact >= 0.95 && run.collisionCooldown <= 0) {
        this.damageBeer(10, "中等碰撞：完整度 -10。旁边饮料也被你撞得开始反思货架管理。");
        run.collisionCooldown = 0.42;
      } else if (impact >= 0.42 && run.messageTimer <= 0.2) {
        this.setMessage("轻微碰撞：你被旁边瓶子顶开了一点。");
      }
    });
  }

  damageBeer(amount, message) {
    const run = this.run;
    run.integrity = Math.max(0, run.integrity - amount);
    run.dangerFlash = 1;
    this.setMessage(message);
  }

  spawnBottleHalves(x, y, color, options = {}) {
    const scale = options.scale || 1;
    const labelColor = options.labelColor || 0xf6f0d8;
    const depth = options.depth || 58;
    const pieces = [];
    for (let i = 0; i < 2; i += 1) {
      const piece = this.add.graphics();
      piece.setDepth(depth);
      piece.x = x;
      piece.y = y;
      piece.rotation = (i === 0 ? -0.35 : 0.35) + this.rng.realInRange(-0.2, 0.2);
      piece.fillStyle(0x111827, 0.18);
      piece.fillEllipse(0, 22 * scale, 30 * scale, 8 * scale);
      piece.fillStyle(color, 1);
      if (i === 0) {
        piece.fillRoundedRect(-10 * scale, -36 * scale, 20 * scale, 44 * scale, 6 * scale);
        piece.fillStyle(0x3d2f25, 1);
        piece.fillRect(-6 * scale, -46 * scale, 12 * scale, 12 * scale);
        piece.lineStyle(3 * scale, 0xd8f3ff, 0.9);
        piece.lineBetween(-11 * scale, 7 * scale, 11 * scale, -2 * scale);
      } else {
        piece.fillRoundedRect(-11 * scale, -4 * scale, 22 * scale, 44 * scale, 6 * scale);
        piece.fillStyle(labelColor, 0.95);
        piece.fillRoundedRect(-8 * scale, 8 * scale, 16 * scale, 16 * scale, 3 * scale);
        piece.lineStyle(3 * scale, 0xd8f3ff, 0.9);
        piece.lineBetween(-12 * scale, -4 * scale, 12 * scale, 7 * scale);
      }
      pieces.push(piece);
      this.tweens.add({
        targets: piece,
        x: x + (i === 0 ? -42 : 42) * scale + this.rng.realInRange(-12, 12),
        y: y + 52 * scale + this.rng.realInRange(-4, 16),
        rotation: piece.rotation + (i === 0 ? -1.25 : 1.25),
        duration: 520,
        ease: "Back.out",
      });
      this.tweens.add({
        targets: piece,
        alpha: 0,
        duration: 950,
        delay: 1250,
        onComplete: () => piece.destroy(),
      });
    }
    return pieces;
  }

  shatterOtherDrink(item, reason = "squeezed") {
    const run = this.run;
    if (!run || item.meta.removed) return;
    item.meta.removed = true;
    run.otherBroken += 1;
    run.exposureBonus = Math.min(0.42, run.exposureBonus + 0.055);
    run.shelfShake = 1;
    run.dangerFlash = Math.min(1, run.dangerFlash + 0.28);
    const p = this.project(item.meta.x, item.meta.lane);
    const breakX = Phaser.Math.Clamp(p.x, 36, GAME_WIDTH - 36);
    const breakY = 430 + this.rng.realInRange(-8, 10);
    this.spawnBottleHalves(breakX, breakY - 36, item.meta.color, { scale: 0.72, depth: 57 });
    const glass = this.add.graphics();
    glass.setDepth(55);
    glass.x = breakX;
    glass.y = breakY;
    glass.lineStyle(3, 0xd8f3ff, 0.9);
    for (let i = 0; i < 6; i += 1) {
      const x = this.rng.realInRange(-26, 26);
      const y = this.rng.realInRange(-10, 10);
      glass.lineBetween(x, y, x + this.rng.realInRange(-14, 14), y + this.rng.realInRange(-8, 8));
    }
    this.tweens.add({
      targets: item,
      x: glass.x,
      y: glass.y - 16,
      alpha: 0,
      rotation: item.rotation + this.rng.realInRange(-1.2, 1.2),
      duration: 300,
      ease: "Quad.in",
      onComplete: () => item.destroy(),
    });
    this.tweens.add({
      targets: glass,
      alpha: 0,
      y: glass.y + 12,
      duration: 950,
      delay: 420,
      onComplete: () => glass.destroy(),
    });

    const throwChance = Math.min(0.95, run.otherBroken * 0.07);
    if (this.rng.frac() < throwChance) {
      this.setMessage(`第${run.otherBroken}瓶饮料碎了，店主忍无可忍。`);
      this.time.delayedCall(360, () => this.endRun("free", false));
      return;
    }

    const reasonText = reason === "edge" ? "被你挤下货架，啪地碎了" : "被你挤走，落地碎了";
    this.setMessage(`${reasonText}。碎瓶 ${run.otherBroken}，店主扔你出店概率 ${(throwChance * 100).toFixed(0)}%。曝光增加。`);
  }

  updateBurialState() {
    const run = this.run;
    if (!this.isFreezerPile()) {
      run.visibility = 1;
      return;
    }

    const blockers = this.getNearbyBlockers();
    if (run.layer > 0 && run.lane > 1.35 && blockers <= 3 && Math.hypot(run.vx, run.vlane) < 1.25) {
      run.layer -= 1;
      run.lane = Math.max(0.65, run.lane - 0.22);
      this.setMessage(`${run.scene.name}：你从${layerNames[run.layer + 1]}挤到了${layerNames[run.layer]}，露头成功。`);
    }

    if (run.layer < 2 && blockers >= 5 && Math.hypot(run.vx, run.vlane) > 1.55) {
      run.layer += 1;
      this.damageBeer(10, `${run.scene.name}：用力过猛，被饮料山重新按回${layerNames[run.layer]}，完整度 -10。`);
    }

    run.visibility = this.calculateFreezerVisibility();
  }

  triggerRandomEvent() {
    const run = this.run;
    const options = randomEvents.filter((event) => run.scene.cool || event.key !== "fridgeSlam");
    const event = Phaser.Utils.Array.GetRandom(options);
    run.eventText = event.text;
    run.messageTimer = 4;

    if (event.impulse) {
      const lanePush = this.rng.realInRange(0.4, 1.2) * event.impulse;
      run.vx += this.rng.realInRange(-0.85, 0.85) * event.impulse;
      run.vlane += lanePush;
      run.dangerFlash = Math.min(1, run.dangerFlash + event.impulse * 0.22);
      if (event.impulse > 1.25 && Math.hypot(run.vx, run.vlane) > 2.35 && this.getDanger() > 0.46) {
        this.damageBeer(999, "强烈撞击！你和货架达成了不可逆的玻璃协议。");
      } else if (event.impulse > 1 && this.rng.frac() < 0.34) {
        this.damageBeer(10, "货架晃动造成中等碰撞：完整度 -10。");
      }
    }

    if (event.pickup) {
      run.label = this.rng.between(0, 2);
      run.lane = Phaser.Math.Clamp(run.lane + this.rng.realInRange(-0.35, 0.2), 0, 2.75);
      this.updateBeerArt();
    }

    if (event.promo) run.promoTimer = 28;
    if (event.cleaning) {
      run.cleaningTimer = 22;
      if (this.isFreezerPile()) this.removeTopDrink("customer");
    }
    if (event.spotlight) run.spotlightTimer = 20;
  }

  chooseCustomer() {
    const forced = new URLSearchParams(window.location.search).get("customer");
    const forcedCustomer = customers.find((customer) => customer.key === forced);
    if (forcedCustomer) return forcedCustomer;
    const weights = { ...(sceneCustomerWeights[this.run.scene.key] || sceneCustomerWeights.supermarket) };
    if (this.run.waitStreak === 2) weights.demon += 5;
    if (this.run.waitStreak >= 3) weights.demon += 10;
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
    let roll = this.rng.realInRange(0, total);
    for (const [key, weight] of Object.entries(weights)) {
      roll -= weight;
      if (roll <= 0) return customers.find((customer) => customer.key === key) || customers[0];
    }
    return customers[0];
  }

  getCustomerAssets(customer) {
    if (customer.key === "tourist") return Phaser.Utils.Array.GetRandom(touristAssetVariants);
    return customer.assets || [];
  }

  startDemonWarning(customer) {
    const run = this.run;
    const demonTypeKey = this.rng.frac() < 0.32 ? "strong" : "normal";
    const demon = { ...customer, demonTypeKey, demonType: demonTypes[demonTypeKey] };
    if (demonTypeKey === "strong") {
      demon.name = "强力魔王";
      demon.emoji = "强魔";
      demon.quotes = ["强力魔王出现！", "闻到精酿味了。"];
    }
    run.pendingCustomer = demon;
    run.demonWarningTimer = 3;
    run.demonWarningActive = true;
    run.customerTimer = this.rng.realInRange(8, 14);
    this.setMessage(demonTypeKey === "strong" ? "强力魔王出现！快躲起来，或者贴隐身贴纸。" : "危险！魔王即将进入商店！");
    ui.demonWarning.querySelector("strong").textContent = demonTypeKey === "strong" ? "强力魔王出现！" : "危险！魔王即将进入商店！";
    show(ui.demonWarning);
    this.playDemonTone(demonTypeKey === "strong");
  }

  playDemonTone(strong = false) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioCtx = this.audioCtx || new AudioContext();
      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 3; i += 1) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(strong ? 92 : 116, now + i * 0.22);
        gain.gain.setValueAtTime(0.0001, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(strong ? 0.08 : 0.05, now + i * 0.22 + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.16);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.22);
        osc.stop(now + i * 0.22 + 0.18);
      }
    } catch (error) {
      // Some browsers block WebAudio until a user gesture; visual warning still carries the mechanic.
    }
  }

  setupCustomerBillboards(customer, assets, quote, side) {
    const startX = side === "left" ? -110 : GAME_WIDTH + 110;
    const targetX = side === "left" ? 168 : GAME_WIDTH - 168;
    this.customerActors.forEach((actor, index) => {
      const asset = assets[index] || null;
      const hasAssetTexture = !!asset && this.textures.exists(asset);
      const isActive = index < Math.max(1, assets.length || 1);
      actor.setVisible(isActive);
      actor.activeCustomer = isActive;
      actor.activeCustomerKey = isActive ? customer.key : null;
      actor.baseY = 396 + index * 4;
      actor.x = startX + index * (side === "left" ? -34 : 34);
      actor.y = actor.baseY;
      actor.rotation = 0;
      actor.setAlpha(1);
      actor.setScale(1);
      actor.parts.shadow.clear();
      actor.parts.shadow.fillStyle(0x0f172a, 0.22);
      actor.parts.shadow.fillEllipse(0, 4, 84, 18);
      actor.parts.sprite.setVisible(hasAssetTexture);
      actor.parts.fallback.setVisible(!hasAssetTexture);
      actor.parts.fallbackText.setVisible(!hasAssetTexture);
      if (hasAssetTexture) {
        actor.parts.sprite.setTexture(asset);
        const targetHeight = customer.key === "drunk" ? 170 : 158;
        actor.parts.sprite.setScale(targetHeight / actor.parts.sprite.height);
      } else {
        this.drawFallbackCustomer(actor, customer);
      }
      this.applyCustomerDress(actor, customer.key);
      this.drawSpeechBubble(actor, index === 0 ? quote : "");
      this.tweens.add({
        targets: actor,
        x: targetX + (index - (assets.length - 1) / 2) * 70,
        duration: 1450 + index * 180,
        ease: "Sine.out",
      });
    });
  }

  drawSpeechBubble(actor, quote) {
    const { bubble, bubbleText } = actor.parts;
    bubble.clear();
    bubbleText.setText(quote);
    bubble.setVisible(!!quote);
    bubbleText.setVisible(!!quote);
    if (!quote) return;
    bubble.fillStyle(0xffffff, 0.94);
    bubble.lineStyle(2, 0x172029, 0.75);
    bubble.fillRoundedRect(-84, -184, 168, 42, 8);
    bubble.strokeRoundedRect(-84, -184, 168, 42, 8);
    bubble.fillTriangle(-12, -142, 8, -142, -2, -130);
  }

  applyCustomerDress(actor, customerKey) {
    if (actor.dressItems) actor.dressItems.forEach((item) => item.destroy());
    actor.dressItems = [];
    const outfit = (save.outfits || {})[customerKey] || [];
    outfit.forEach((record) => {
      const deco = getDecorationById(record.decorationId);
      if (!deco) return;
      const text = this.add.text(record.x || 0, record.y || -70, deco.emoji || "★", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "30px",
      }).setOrigin(0.5);
      text.setScale(record.scale || 1);
      text.setRotation(Phaser.Math.DegToRad(record.rotation || 0));
      actor.add(text);
      actor.dressItems.push(text);
    });
  }

  applyCustomerDress(actor, customerKey) {
    if (actor.dressItems) actor.dressItems.forEach((item) => item.destroy());
    actor.dressItems = [];
    const outfit = (save.outfits || {})[customerKey] || [];
    outfit.forEach((record) => {
      const deco = getDecorationById(record.decorationId);
      if (!deco) return;
      let dressItem;
      let baseScale = 1;
      if (deco.image && this.textures.exists(getDecorationTextureKey(deco))) {
        dressItem = this.add.image(record.x || 0, record.y || -70, getDecorationTextureKey(deco)).setOrigin(0.5);
        baseScale = 72 / Math.max(dressItem.width, dressItem.height);
      } else {
        dressItem = this.add.text(record.x || 0, record.y || -70, deco.emoji || "★", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "30px",
        }).setOrigin(0.5);
      }
      dressItem.setScale(baseScale * (record.scale || 1));
      dressItem.setRotation(Phaser.Math.DegToRad(record.rotation || 0));
      actor.add(dressItem);
      actor.bringToTop(dressItem);
      actor.dressItems.push(dressItem);
    });
  }

  drawFallbackCustomer(actor, customer) {
    if (customer.key === "demon") {
      this.drawDemonFallback(actor, customer);
      return;
    }
    this.drawWorkerFallback(actor);
  }

  drawDemonFallback(actor, customer) {
    const g = actor.parts.fallback;
    const strong = customer.demonTypeKey === "strong";
    g.clear();
    g.fillStyle(strong ? 0x7f1d1d : 0xb91c1c, 1);
    g.lineStyle(4, 0x172029, 1);
    g.fillRoundedRect(-36, -138, 72, 126, 10);
    g.strokeRoundedRect(-36, -138, 72, 126, 10);
    g.fillStyle(strong ? 0xff3b30 : 0x7f1d1d, 1);
    g.fillTriangle(-30, -132, -58, -178, -10, -146);
    g.fillTriangle(30, -132, 58, -178, 10, -146);
    g.lineStyle(4, 0x172029, 1);
    g.strokeTriangle(-30, -132, -58, -178, -10, -146);
    g.strokeTriangle(30, -132, 58, -178, 10, -146);
    g.fillStyle(0xfff1f2, 1);
    g.fillCircle(-13, -101, 5);
    g.fillCircle(13, -101, 5);
    g.lineStyle(4, 0x172029, 1);
    g.lineBetween(-18, -78, 18, -84);
    g.lineBetween(-20, -12, -40, 24);
    g.lineBetween(20, -12, 40, 24);
    actor.parts.fallbackText.setText(strong ? "强" : "魔");
    actor.parts.fallbackText.setColor("#ffffff");
    actor.parts.fallbackText.setFontSize("28px");
  }

  drawWorkerFallback(actor) {
    const g = actor.parts.fallback;
    g.clear();
    g.fillStyle(0xf7f7f7, 1);
    g.lineStyle(4, 0x172029, 1);
    g.fillRoundedRect(-34, -138, 68, 128, 8);
    g.strokeRoundedRect(-34, -138, 68, 128, 8);
    g.lineStyle(3, 0x172029, 1);
    g.strokeCircle(-12, -102, 3);
    g.strokeCircle(12, -102, 3);
    g.lineBetween(-16, -82, 16, -82);
    g.lineBetween(-20, -10, -32, 24);
    g.lineBetween(20, -10, 32, 24);
    actor.parts.fallbackText.setText("大命");
    actor.parts.fallbackText.setColor("#172029");
    actor.parts.fallbackText.setFontSize("22px");
  }

  spawnCustomer(forcedCustomer = null) {
    const run = this.run;
    const customer = forcedCustomer || this.chooseCustomer();
    const assets = this.getCustomerAssets(customer);
    const quote = Phaser.Utils.Array.GetRandom(customer.quotes || ["看看。"]);
    const side = this.rng.frac() > 0.5 ? "left" : "right";
    run.customer = customer;
    unlockCodex(customer.key === "demon" ? "demons" : "customers", customer.key);
    run.customerAssets = assets;
    run.customerQuote = quote;
    run.customerPhase = 0;
    run.customerDecisionAt = customer.key === "demon" ? this.rng.realInRange(5, 10) : this.rng.realInRange(3, 8);
    run.customerTimer = (run.promoTimer > 0 ? this.rng.realInRange(4, 8) : this.rng.realInRange(7, 13));
    ui.customerEmoji.textContent = customer.emoji;
    ui.customerName.textContent = customer.name;
    ui.customerAction.textContent = `${quote} 正在观察${run.scene.name}...`;
    ui.customerPoints.textContent = customer.key === "demon"
      ? "危险！不要被买走！"
      : `如果被他买走：预计获得${this.getSaleScore(customer)}分`;
    show(ui.customerCard);
    if (customer.key !== "demon") hide(ui.demonWarning);
    this.setupCustomerBillboards(customer, assets, quote, side);
  }

  updateCustomer(dt) {
    const run = this.run;
    if (!run.customer) return;
    run.customerPhase += dt;
    this.customerActors.forEach((actor, index) => {
      if (!actor.activeCustomer) return;
      actor.y = actor.baseY + Math.sin(this.time.now * 0.004 + index) * 5;
      actor.rotation = Math.sin(this.time.now * 0.003 + index * 0.8) * 0.025;
    });

    if (run.customerPhase >= run.customerDecisionAt) {
      this.resolveCustomer(run.customer);
    }
  }

  resolveCustomer(customer) {
    const run = this.run;
    const probability = this.getPurchaseProbability(customer);
    const roll = this.rng.frac();
    const matched = customer.likes.includes(run.trait.key);

    if (roll < probability) {
      run.buyer = customer;
      run.match = matched;
      if (customer.key !== "demon") {
        run.scoreBreakdown.saleBase = this.getSaleScore(customer);
      }
      this.endRun(customer.key === "demon" ? "demon" : "sold", false);
      return;
    }

    if (customer.key === "demon") {
      this.setMessage("你躲过了魔王。");
      ui.customerAction.textContent = "没有发现玩家";
      run.scoreBreakdown.demonDodge += customer.demonTypeKey === "strong" ? 300 : 150;
      save.demonDodges = (save.demonDodges || 0) + 1;
      saveGame();
      this.hideCustomer(950);
      hide(ui.demonWarning);
      run.customer = null;
      return;
    }

    if (roll < probability + 0.16) {
      this.addWaitReward();
      run.label = this.rng.between(0, 2);
      run.lane = Phaser.Math.Clamp(run.lane - this.rng.realInRange(0.1, 0.45), 0, 2.5);
      this.setMessage(customer.key === "demon" ? "魔王闻到酒味但没看清你。你差点进魔王城冰箱。" : `${customer.name}拿起你看了一眼：嗯，再考虑考虑。`);
      ui.customerAction.textContent = customer.key === "demon" ? "差点发现玩家" : "拿起玩家看一眼又放回去";
      this.updateBeerArt();
    } else if (roll < probability + 0.44) {
      this.addWaitReward();
      this.setMessage(customer.key === "demon" ? "魔王买走了旁边的饮料。你躲过一劫。" : `${customer.name}买走了旁边的饮料，你假装不在意。`);
      ui.customerAction.textContent = customer.key === "demon" ? "买走旁边饮料" : "买走旁边的饮料";
      if (this.removeTopDrink("customer")) {
        this.run.vlane += 0.08;
      }
    } else {
      this.addWaitReward();
      this.setMessage(customer.key === "demon" ? "魔王没看到你，骂骂咧咧地走了。" : `${customer.name}什么都没买，空气突然很安静。`);
      ui.customerAction.textContent = customer.key === "demon" ? "没看到玩家" : "什么都不买";
    }

    this.hideCustomer(950);
    run.customer = null;
  }

  addWaitReward() {
    const run = this.run;
    run.waitStreak += 1;
    if (run.waitStreak <= 5) {
      run.scoreBreakdown.wait += 30;
    }
  }

  getSaleScore(customer) {
    const table = customerPreferenceWeights[customer.key];
    const pref = table ? (table[this.run.trait.key] || 10) : 20;
    const base = Phaser.Math.Clamp(100 * 100 / pref, 150, 1500);
    return Math.round(base * getStreakMultiplier(save.currentStreak || 0));
  }

  hideCustomer(delay = 0) {
    const doHide = () => {
      hide(ui.customerCard);
      this.customerActors.forEach((actor, index) => {
        if (!actor.visible) return;
        this.tweens.add({
          targets: actor,
          x: actor.x < GAME_WIDTH / 2 ? -130 - index * 60 : GAME_WIDTH + 130 + index * 60,
          alpha: 0,
          duration: 520,
          ease: "Sine.in",
          onComplete: () => {
            actor.setVisible(false);
            actor.activeCustomer = false;
            actor.setAlpha(1);
          },
        });
      });
    };
    if (delay > 0) {
      this.time.delayedCall(delay, doHide);
    } else {
      doHide();
    }
  }

  rotateLabel() {
    if (!this.run || this.mode !== "playing") return;
    this.run.label = (this.run.label + 1) % labelStates.length;
    this.run.vx += this.rng.realInRange(-0.08, 0.08);
    if (this.isFreezerPile() && this.removeTopDrink("tap")) {
      this.run.vlane += 0.12;
    } else {
      this.setMessage(`标签转到：${labelStates[this.run.label].name}`);
    }
    this.updateBeerArt();
  }

  setView(index) {
    this.viewIndex = Phaser.Math.Clamp(index, 0, 2);
    this.drawScene();
    this.updateLayout();
  }

  setMessage(text) {
    if (!this.run) return;
    this.run.eventText = text;
    this.run.messageTimer = 4;
  }

  getLaneIndex() {
    return Phaser.Math.Clamp(Math.round(this.run.lane), 0, 3);
  }

  isFreezerPile() {
    return !!this.run && this.run.scene.key === "fridge";
  }

  getNearbyBlockers() {
    if (!this.isFreezerPile()) return 0;
    const run = this.run;
    return this.items.filter((item) => {
      if (item.meta.removed) return false;
      if ((item.meta.layer || 0) > run.layer) return false;
      const dx = Math.abs(item.meta.x - run.x);
      const dy = Math.abs(item.meta.lane - run.lane);
      return dx < 0.33 && dy < 0.48;
    }).length;
  }

  calculateFreezerVisibility() {
    const run = this.run;
    const layerBase = [0.86, 0.34, 0.045][run.layer] || 0.1;
    const laneBonus = Phaser.Math.Clamp(run.lane / 2.7, 0, 1) * 0.22;
    const labelBonus = [0.08, 0.03, 0][run.label];
    const blockerPenalty = Math.min(0.62, this.getNearbyBlockers() * 0.075);
    const eventBoost = (run.spotlightTimer > 0 ? 0.1 : 0) + (run.cleaningTimer > 0 ? 0.08 : 0);
    return Phaser.Math.Clamp(layerBase + laneBonus + labelBonus + eventBoost + run.exposureBonus - blockerPenalty, 0.01, 1);
  }

  removeTopDrink(reason = "top") {
    if (!this.isFreezerPile()) return false;
    const active = this.items
      .filter((item) => !item.meta.removed)
      .sort((a, b) => (a.meta.layer - b.meta.layer) || (b.meta.lane - a.meta.lane));
    const item = active[0];
    if (!item) return false;
    item.meta.removed = true;
    this.run.exposureBonus = Math.min(0.42, this.run.exposureBonus + 0.035);
    this.tweens.add({
      targets: item,
      alpha: 0,
      y: item.y - 70,
      scaleX: item.scaleX * 0.55,
      scaleY: item.scaleY * 0.55,
      duration: 320,
      ease: "Sine.in",
      onComplete: () => item.destroy(),
    });
    this.run.visibility = this.calculateFreezerVisibility();
    if (reason === "tap") {
      this.setMessage(`${this.run.scene.name}：你蹭开了一瓶上层饮料，露出度变高了一点。`);
    }
    return true;
  }

  getExposure() {
    const run = this.run;
    if (this.isFreezerPile()) return run.visibility;
    const laneFactor = Phaser.Math.Clamp(run.lane / 3, 0, 1);
    const labelFactor = [1, 0.68, 0.38][run.label];
    const boost = (run.spotlightTimer > 0 ? 0.16 : 0) + (run.promoTimer > 0 ? 0.1 : 0);
    return Phaser.Math.Clamp(laneFactor * 0.58 + labelFactor * 0.28 + boost + run.exposureBonus, 0, 1);
  }

  getDanger() {
    const run = this.run;
    const edge = Phaser.Math.Clamp((run.lane - 2.05) / 1.05, 0, 1);
    const side = Phaser.Math.Clamp((Math.abs(run.x) - 0.78) / 0.35, 0, 1);
    const speed = Phaser.Math.Clamp(Math.hypot(run.vx, run.vlane) / 2.4, 0, 1);
    const cracked = Phaser.Math.Clamp((100 - run.integrity) / 100, 0, 1);
    return Phaser.Math.Clamp(edge * 0.48 + side * 0.22 + speed * 0.16 + run.dangerFlash * 0.18 + run.shelfShake * 0.18 + cracked * 0.18, 0, 1);
  }

  getPurchaseProbability(customer) {
    const run = this.run;
    const lane = Phaser.Math.Clamp(run.lane, 0, 3);
    const label = labelStates[run.label];
    const matched = customer.likes.includes(run.trait.key);
    if (customer.key === "demon") {
      return this.getDemonFindProbability(customer);
    }
    let chance = customer.base + customer.random * this.rng.frac();
    chance += lane * 0.065;
    chance *= label.multiplier;
    chance *= this.getPreferenceMultiplier(customer.key, run.trait.key);
    if (matched) chance += 0.08;
    if (run.trait.key === "discount" || run.promoTimer > 0) chance += 0.11;
    if (run.cleaningTimer > 0 && lane >= 2) chance += 0.11;
    if (run.spotlightTimer > 0) chance += 0.09;
    if (customer.key === "drunk") chance += this.rng.realInRange(0.04, 0.14);
    if (this.isFreezerPile()) {
      chance *= Phaser.Math.Clamp(run.visibility, 0.01, 1);
      if (run.visibility < 0.08) chance = Math.min(chance, 0.012);
      if (run.layer === 0) chance += 0.05;
    }
    return Phaser.Math.Clamp(chance, this.isFreezerPile() ? 0.001 : 0.02, 0.88);
  }

  getPreferenceMultiplier(customerKey, traitKey) {
    const table = customerPreferenceWeights[customerKey];
    if (!table) return 1;
    const weight = table[traitKey] || 10;
    return Phaser.Math.Clamp(0.68 + weight / 40, 0.72, 1.75);
  }

  getDemonPreferenceMultiplier(customer, traitKey) {
    const table = (customer.demonType || demonTypes.normal).preference;
    const weight = table[traitKey] || 10;
    return Phaser.Math.Clamp(0.65 + weight / 25, 0.7, 1.9);
  }

  getDemonFindProbability(customer) {
    const run = this.run;
    const buried = this.isFreezerPile() && (run.layer >= 2 || run.visibility < 0.09);
    const laneIndex = buried ? -1 : this.getLaneIndex();
    const positionMultipliers = { "-1": 0.05, 0: 0.25, 1: 0.75, 2: 1.3, 3: 1.5 };
    const labelMultipliers = [1.4, 0.8, 0.3];
    const stealthMultiplier = run.stealthTimer > 0 ? 0.05 : 1;
    const demonType = customer.demonType || demonTypes.normal;
    const chance = demonType.baseFind
      * (positionMultipliers[String(laneIndex)] || 0.75)
      * (labelMultipliers[run.label] || 0.8)
      * this.getDemonPreferenceMultiplier(customer, run.trait.key)
      * stealthMultiplier;
    return Phaser.Math.Clamp(chance, 0, 0.9);
  }

  endRun(ending, fromBreak) {
    if (!this.run || this.mode === "ended") return;
    const run = this.run;
    this.mode = "ended";
    run.finalEnding = ending;
    run.score = this.calculateScore(ending);
    run.demonWarningActive = false;
    hide(ui.demonWarning);
    if (ending === "broken") {
      const color = run.trait ? run.trait.color : 0x8a5a28;
      this.spawnBottleHalves(this.beer.x, this.beer.y + 36 * this.beer.scaleY, color, {
        scale: Math.max(0.8, this.beer.scaleX || 1),
        labelColor: run.trait ? run.trait.color : 0xf6f0d8,
        depth: 70,
      });
    }
    this.beer.setVisible(ending !== "broken" && ending !== "free" && ending !== "demon");
    this.hideCustomer();

    const canRevive = ending === "broken" && fromBreak && !run.usedRevive;
    if (!canRevive) {
      applyFinalStats(run);
      run.statsApplied = true;
      updateStatsUi();
    }

    this.showResult(canRevive);
  }

  calculateScore(ending) {
    const run = this.run;
    const breakdown = run.scoreBreakdown;
    if (ending === "sold") {
      breakdown.final = Math.round(breakdown.saleBase + breakdown.demonDodge + breakdown.wait);
      return breakdown.final;
    }
    breakdown.saleBase = 0;
    breakdown.final = Math.round((breakdown.demonDodge + breakdown.wait) * 0.2);
    return breakdown.final;
  }

  showResult(canRevive) {
    const run = this.run;
    const endingText = {
      sold: "被普通顾客买走",
      broken: "摔碎",
      expired: "过期",
      free: "被店主扔出店外",
      demon: "被魔王买走",
    }[run.finalEnding];
    const titleText = {
      sold: "恭喜！你终于被买走了！",
      broken: canRevive ? "你摔碎了，但广告医学很发达" : "你摔碎了",
      expired: "你过期了，被员工处理掉了。",
      free: "我免费了！",
      demon: "你被魔王买走了，没人知道你后来发生了什么。",
    }[run.finalEnding];

    ui.resultKicker.textContent = canRevive ? "临时失败" : "本局结算";
    ui.resultTitle.textContent = titleText;
    ui.resultEnding.textContent = endingText;
    ui.resultDays.textContent = getPurchaseTimeText(run);
    ui.resultBuyer.textContent = run.finalEnding === "free" ? "店主" : (run.buyer ? run.buyer.name : "无");
    ui.resultMatch.textContent = run.buyer ? (run.match ? "是" : "否") : "无";
    ui.resultRevive.textContent = run.usedRevive ? "是" : "否";
    ui.resultSalePoints.textContent = String(run.scoreBreakdown.saleBase);
    ui.resultDemonPoints.textContent = String(run.scoreBreakdown.demonDodge);
    ui.resultWaitPoints.textContent = String(run.scoreBreakdown.wait);
    ui.resultStreakMultiplier.textContent = `x${run.scoreBreakdown.streakMultiplier.toFixed(1)}`;
    ui.resultScore.textContent = String(run.score);
    ui.resultDoubleAd.textContent = run.scoreBreakdown.doubled ? "是" : "否";
    ui.resultTotalPoints.textContent = String(save.totalPoints || 0);
    toggle(ui.doubleScoreButton, !canRevive && !run.scoreBreakdown.doubled && run.score > 0);
    toggle(ui.reviveButton, canRevive);
    ui.nextButton.textContent = run.finalEnding === "sold" ? "进入下一关" : "再来一局";
    show(ui.result);
    hide(ui.hud);
  }

  updateHud() {
    const run = this.run;
    const day = Math.min(3, Math.floor(run.elapsed / DAY_SECONDS) + 1);
    const dayLeft = Math.max(0, DAY_SECONDS - (run.elapsed % DAY_SECONDS));
    const laneIndex = this.getLaneIndex();
    ui.hudDay.textContent = `Day ${day}`;
    ui.hudTime.textContent = formatTime(dayLeft);
    ui.hudScene.textContent = run.scene.name;
    ui.hudLane.textContent = this.isFreezerPile() ? `${laneNames[laneIndex]} / ${layerNames[run.layer]}` : laneNames[laneIndex];
    ui.hudLabel.textContent = labelStates[run.label].name;
    ui.hudTrait.textContent = run.trait.name;
    ui.hudIntegrity.textContent = `${Math.ceil(run.integrity)}`;
    ui.hudRunPoints.textContent = String(Math.round(run.scoreBreakdown.saleBase + run.scoreBreakdown.demonDodge + run.scoreBreakdown.wait));
    ui.hudTotalPoints.textContent = String(save.totalPoints || 0);
    ui.hudStreak.textContent = String(save.currentStreak || 0);
    ui.hudWaits.textContent = String(run.waitStreak);
    ui.hudMessage.textContent = run.messageTimer > 0 ? run.eventText : (this.isFreezerPile() ? "冰柜堆叠中，露出面积越大越容易被看见。用力太猛会被挤碎。" : "顾客会随机出现。越靠前越显眼，也越接近地板。");
    ui.exposureFill.style.transform = `scaleX(${this.getExposure().toFixed(3)})`;
    ui.integrityFill.style.transform = `scaleX(${Phaser.Math.Clamp(run.integrity / 100, 0, 1).toFixed(3)})`;
    ui.dangerFill.style.transform = `scaleX(${this.getDanger().toFixed(3)})`;
    if (run.stealthTimer > 0) {
      ui.stealthButton.textContent = `隐身中 ${Math.ceil(run.stealthTimer)}秒`;
      ui.stealthButton.classList.add("active");
    } else {
      ui.stealthButton.textContent = `使用隐身贴纸 x${run.stealthStickers}`;
      ui.stealthButton.classList.remove("active");
    }
    toggle(ui.demonWarning, run.demonWarningActive);
  }

  drawIdle() {
    this.bg.clear();
    this.bg.fillStyle(0xf7efe1, 1);
    this.bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.bg.fillStyle(0x2e6f95, 1);
    this.bg.fillRect(0, 390, GAME_WIDTH, 150);
    this.shelf.clear();
    this.shelf.fillStyle(0x7b4d2a, 1);
    this.shelf.fillRoundedRect(92, 155, 776, 210, 10);
    this.shelf.fillStyle(0xf2b544, 1);
    this.shelf.fillRect(118, 196, 724, 16);
    this.shelf.fillRect(118, 270, 724, 16);
    this.shelf.fillRect(118, 344, 724, 16);
    this.updateBeerArt();
    this.applyBeerDress();
    this.beer.setVisible(true);
    this.beer.setPosition(GAME_WIDTH / 2, 250);
    this.beer.setScale(1);
  }

  animateIdle(time) {
    if (this.mode !== "menu") return;
    this.beer.rotation = Math.sin(time * 0.002) * 0.08;
  }

  drawScene() {
    if (!this.run) return;
    const scene = this.run.scene;
    this.bg.clear();
    this.bg.fillStyle(scene.wall, 1);
    this.bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.bg.fillStyle(scene.bg, 1);
    this.bg.fillRect(0, 0, GAME_WIDTH, 116);
    this.bg.fillStyle(0xffffff, scene.cool ? 0.34 : 0.14);
    this.bg.fillRect(0, 116, GAME_WIDTH, 36);
    this.bg.fillStyle(scene.floor, 1);
    this.bg.fillRect(0, 405, GAME_WIDTH, 135);
    this.bg.fillStyle(0x101820, 0.18);
    this.bg.fillRect(0, 405, GAME_WIDTH, 12);

    this.shelf.clear();
    if (this.isFreezerPile()) {
      this.shelf.fillStyle(0x5b8799, 1);
      this.shelf.fillRoundedRect(88, 132, 784, 264, 12);
      this.shelf.fillStyle(0xe9fbff, 1);
      this.shelf.fillRoundedRect(108, 146, 744, 230, 10);
      this.shelf.fillStyle(0x8cc7d8, 0.45);
      this.shelf.fillRoundedRect(132, 170, 696, 184, 8);
      this.shelf.lineStyle(5, 0xffffff, 0.78);
      this.shelf.strokeRoundedRect(108, 146, 744, 230, 10);
      this.shelf.lineStyle(2, 0x2e6f95, 0.55);
      this.shelf.strokeRoundedRect(88, 132, 784, 264, 12);
      this.updateLayout();
      return;
    }
    const view = this.viewIndex - 1;
    const left = 92 + view * 24;
    const right = 868 + view * 24;
    const top = 128;
    const bottom = 392;
    this.shelf.fillStyle(0x5f3c24, 1);
    this.shelf.fillPoints([
      new Phaser.Geom.Point(left + view * 32, top),
      new Phaser.Geom.Point(right + view * 32, top),
      new Phaser.Geom.Point(right - view * 18, bottom),
      new Phaser.Geom.Point(left - view * 18, bottom),
    ], true);

    for (let i = 0; i < 4; i += 1) {
      const y = 158 + i * 68;
      this.shelf.fillStyle(i === 3 ? 0x3c2b22 : 0xd6984a, 1);
      this.shelf.fillPoints([
        new Phaser.Geom.Point(left - 6 + view * (34 - i * 8), y),
        new Phaser.Geom.Point(right + 6 + view * (34 - i * 8), y),
        new Phaser.Geom.Point(right - 10 - view * (12 + i * 4), y + 18),
        new Phaser.Geom.Point(left + 10 - view * (12 + i * 4), y + 18),
      ], true);
    }

    this.shelf.lineStyle(3, 0xf5d08a, 0.7);
    this.shelf.strokeRect(100, 118, 760, 284);
    this.updateLayout();
  }

  updateLayout() {
    if (!this.run) return;
    this.items.forEach((item) => {
      if (item.meta.removed) return;
      const layer = item.meta.layer || 0;
      const p = this.project(item.meta.x, item.meta.lane + 0.18 - (this.isFreezerPile() ? layer * 0.04 : 0));
      item.setPosition(p.x, p.y);
      item.setScale(p.scale * (this.isFreezerPile() ? 0.66 + (2 - layer) * 0.035 : 0.72));
      item.setAlpha(this.isFreezerPile() ? [1, 0.86, 0.72][layer] : 1);
      item.setRotation(this.isFreezerPile() ? (item.meta.x * 0.38 + layer * 0.12) : 0);
      item.setDepth(this.isFreezerPile() ? 23 - layer * 4 + item.meta.lane : 8 + item.meta.lane);
      const g = item.list[0];
      g.clear();
      g.fillStyle(0x111827, 0.22);
      g.fillEllipse(0, 30, 34, 12);
      g.fillStyle(item.meta.color, 1);
      g.fillRoundedRect(-13, -36, 26, this.isFreezerPile() ? 70 : 64, 8);
      g.fillStyle(0xf6f0d8, 1);
      g.fillRoundedRect(-10, -12, 20, 24, 4);
      g.fillStyle(0x3d2f25, 1);
      g.fillRect(-7, -45, 14, 10);
      if (this.isFreezerPile() && layer === 0) {
        g.lineStyle(2, 0xffffff, 0.72);
        g.strokeRoundedRect(-14, -37, 28, 72, 8);
      }
    });

    const beerPoint = this.project(this.run.x, this.run.lane);
    this.shadow.clear();
    this.shadow.fillStyle(0x0f172a, 0.24);
    this.shadow.fillEllipse(beerPoint.x, beerPoint.y + 35 * beerPoint.scale, 64 * beerPoint.scale, 16 * beerPoint.scale);
    this.beer.setPosition(beerPoint.x, beerPoint.y);
    this.beer.setScale(beerPoint.scale);
    const baseAlpha = this.isFreezerPile() ? Phaser.Math.Clamp(0.32 + this.run.visibility * 0.78, 0.3, 1) : 1;
    this.beer.setAlpha(this.run.stealthTimer > 0 ? Math.min(baseAlpha, 0.38) : baseAlpha);
    this.beer.setDepth(this.isFreezerPile() ? 22 - this.run.layer * 4 + this.run.lane : 14 + Math.floor(this.run.lane));
    this.beer.rotation = this.run.x * 0.22 + this.run.vx * 0.14 + Math.sin(this.time.now * 0.006) * 0.025;
  }

  project(x, lane) {
    const view = this.viewIndex - 1;
    const y = 166 + lane * 68;
    const scale = 0.72 + lane * 0.12;
    const spread = 315 + lane * 34;
    const skew = view * (lane - 1.4) * 42;
    return {
      x: GAME_WIDTH / 2 + x * spread + skew,
      y,
      scale,
    };
  }

  updateBeerArt() {
    const trait = this.run ? this.run.trait : traits[0];
    const label = this.run ? this.run.label : 0;
    this.beerBody.clear();
    this.beerBody.fillStyle(0x111827, 0.22);
    this.beerBody.fillEllipse(0, 50, 68, 16);
    this.beerBody.fillStyle(0x2d241a, 1);
    this.beerBody.fillRoundedRect(-19, -62, 38, 106, 16);
    this.beerBody.fillStyle(0x5f3a20, 1);
    this.beerBody.fillRoundedRect(-13, -92, 26, 42, 9);
    this.beerBody.fillStyle(0xf7d382, 0.5);
    this.beerBody.fillRoundedRect(-11, -54, 8, 86, 6);
    this.beerBody.fillStyle(trait.color, 1);

    if (label === 0) {
      this.beerBody.fillRoundedRect(-24, -25, 48, 42, 7);
      this.beerLabel.setText(trait.name.slice(0, 2));
      this.beerLabel.setAlpha(1);
      this.beerLabel.setScale(0.88);
    } else if (label === 1) {
      this.beerBody.fillRoundedRect(-8, -24, 16, 40, 5);
      this.beerLabel.setText("侧");
      this.beerLabel.setAlpha(0.78);
      this.beerLabel.setScale(0.82);
    } else {
      this.beerBody.fillRoundedRect(-19, -21, 38, 34, 6);
      this.beerLabel.setText("配料");
      this.beerLabel.setAlpha(0.55);
      this.beerLabel.setScale(0.66);
    }

    this.beerBody.lineStyle(3, 0xfdf4c9, 0.65);
    this.beerBody.strokeRoundedRect(-19, -62, 38, 106, 16);
  }

  applyBeerDress() {
    this.beerDressItems.forEach((item) => item.destroy());
    this.beerDressItems = [];
    const outfit = (save.outfits || {}).beer || [];
    outfit.forEach((record) => {
      const deco = getDecorationById(record.decorationId);
      if (!deco) return;
      const text = this.add.text(record.x || 0, record.y || 0, deco.emoji || "★", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "28px",
      }).setOrigin(0.5);
      text.setScale(record.scale || 1);
      text.setRotation(Phaser.Math.DegToRad(record.rotation || 0));
      text.setDepth(80 + (record.layer || 0));
      this.beer.add(text);
      this.beerDressItems.push(text);
    });
  }

  applyBeerDress() {
    this.beerDressItems.forEach((item) => item.destroy());
    this.beerDressItems = [];
    const outfit = (save.outfits || {}).beer || [];
    outfit.forEach((record) => {
      const deco = getDecorationById(record.decorationId);
      if (!deco) return;
      let dressItem;
      let baseScale = 1;
      if (deco.image && this.textures.exists(getDecorationTextureKey(deco))) {
        dressItem = this.add.image(record.x || 0, record.y || 0, getDecorationTextureKey(deco)).setOrigin(0.5);
        baseScale = 72 / Math.max(dressItem.width, dressItem.height);
      } else {
        dressItem = this.add.text(record.x || 0, record.y || 0, deco.emoji || "★", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "28px",
        }).setOrigin(0.5);
      }
      dressItem.setScale(baseScale * (record.scale || 1));
      dressItem.setRotation(Phaser.Math.DegToRad(record.rotation || 0));
      dressItem.setDepth(80 + (record.layer || 0));
      this.beer.add(dressItem);
      this.beerDressItems.push(dressItem);
    });
  }
}

function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      wins: parsed.wins || 0,
      breaks: parsed.breaks || 0,
      expired: parsed.expired || 0,
      bestScore: parsed.bestScore || 0,
      totalPoints: parsed.totalPoints || 0,
      bestRunPoints: parsed.bestRunPoints || parsed.bestScore || 0,
      currentStreak: parsed.currentStreak || 0,
      bestStreak: parsed.bestStreak || 0,
      failures: parsed.failures || 0,
      demonDodges: parsed.demonDodges || 0,
      doubleAdUses: parsed.doubleAdUses || 0,
      shopAdUses: parsed.shopAdUses || 0,
      codex: parsed.codex || { beers: {}, customers: {}, demons: {}, scenes: {} },
      outfits: parsed.outfits || {},
      customerPurchases: parsed.customerPurchases || {},
    };
  } catch (error) {
    return { wins: 0, breaks: 0, expired: 0, bestScore: 0, totalPoints: 0, bestRunPoints: 0, currentStreak: 0, bestStreak: 0, failures: 0, demonDodges: 0, doubleAdUses: 0, shopAdUses: 0, customerPurchases: {}, codex: { beers: {}, customers: {}, demons: {}, scenes: {} }, outfits: {} };
  }
}

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function unlockCodex(kind, id) {
  save.codex = save.codex || { beers: {}, customers: {}, demons: {}, scenes: {} };
  save.codex[kind] = save.codex[kind] || {};
  save.codex[kind][id] = true;
  saveGame();
}

function applyFinalStats(run) {
  if (!run.scoreBreakdown.awarded) {
    save.totalPoints = (save.totalPoints || 0) + (run.score || 0);
    run.scoreBreakdown.awarded = true;
  }
  if (run.finalEnding === "sold") {
    save.wins += 1;
    save.currentStreak = (save.currentStreak || 0) + 1;
    save.bestStreak = Math.max(save.bestStreak || 0, save.currentStreak);
    const key = run.buyer ? run.buyer.key : "unknown";
    save.customerPurchases[key] = (save.customerPurchases[key] || 0) + 1;
  } else if (run.finalEnding === "broken") {
    save.breaks += 1;
    save.failures = (save.failures || 0) + 1;
    save.currentStreak = 0;
  } else if (run.finalEnding === "expired") {
    save.expired += 1;
    save.failures = (save.failures || 0) + 1;
    save.currentStreak = 0;
  } else {
    save.failures = (save.failures || 0) + 1;
    save.currentStreak = 0;
  }
  save.bestScore = Math.max(save.bestScore || 0, run.score || 0);
  save.bestRunPoints = Math.max(save.bestRunPoints || 0, run.score || 0);
  saveGame();
}

function updateStatsUi() {
  ui.statWins.textContent = String(save.wins || 0);
  ui.statBreaks.textContent = String(save.breaks || 0);
  ui.statExpired.textContent = String(save.expired || 0);
  ui.statBestScore.textContent = String(save.bestScore || 0);
  ui.statTotalPoints.textContent = String(save.totalPoints || 0);
  ui.statBestStreak.textContent = String(save.bestStreak || 0);
  if (ui.pointsTotal) ui.pointsTotal.textContent = String(save.totalPoints || 0);
  if (ui.pointsBest) ui.pointsBest.textContent = String(save.bestRunPoints || save.bestScore || 0);
  if (ui.pointsBestStreak) ui.pointsBestStreak.textContent = String(save.bestStreak || 0);
  if (ui.pointsWins) ui.pointsWins.textContent = String(save.wins || 0);
  if (ui.pointsFailures) ui.pointsFailures.textContent = String(save.failures || 0);
  if (ui.pointsAdUses) ui.pointsAdUses.textContent = String(save.shopAdUses || 0);
  if (ui.settingsPlatform) ui.settingsPlatform.textContent = window.BeerPlatform ? window.BeerPlatform.getEnvironmentHint() : "Web";
  if (ui.settingsTilt) {
    const supportsTilt = window.BeerPlatform ? window.BeerPlatform.supportsTilt : "DeviceOrientationEvent" in window;
    ui.settingsTilt.textContent = supportsTilt ? "可手动启用" : "当前浏览器不支持";
  }
}

function formatTime(seconds) {
  const total = Math.ceil(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getStreakMultiplier(currentStreak) {
  const nextLevel = (currentStreak || 0) + 1;
  if (nextLevel <= 1) return 1;
  if (nextLevel === 2) return 1.2;
  if (nextLevel === 3) return 1.5;
  if (nextLevel === 4) return 2;
  return 3;
}

function getPurchaseTimeText(run) {
  if (run.finalEnding === "sold") {
    return formatDurationText(run.elapsed);
  }
  if (run.finalEnding === "free") return "我免费了！";
  if (run.finalEnding === "demon") return "躲失败了";
  if (run.finalEnding === "broken") return "敬大地";
  return "无人在意";
}

function formatDurationText(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}分${rest}秒` : `${rest}秒`;
}

function show(element) {
  element.classList.remove("hidden");
}

function hide(element) {
  element.classList.add("hidden");
}

function toggle(element, visible) {
  if (visible) show(element);
  else hide(element);
}

function runMockAd(placement, button) {
  if (window.BeerPlatform && window.BeerPlatform.showRewardedAd) {
    return window.BeerPlatform.showRewardedAd(placement, button);
  }
  const originalText = button ? button.textContent : "";
  if (button) {
    button.disabled = true;
    button.textContent = "广告播放中...";
  }
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      resolve({ ok: true, placement, mocked: true });
    }, 1000);
  });
}

function resetSave() {
  save = { wins: 0, breaks: 0, expired: 0, bestScore: 0, totalPoints: 0, bestRunPoints: 0, currentStreak: 0, bestStreak: 0, failures: 0, demonDodges: 0, doubleAdUses: 0, shopAdUses: 0, customerPurchases: {}, codex: { beers: {}, customers: {}, demons: {}, scenes: {} }, outfits: {} };
  saveGame();
  updateStatsUi();
}

function finalizeUncountedRun() {
  if (!gameScene || !gameScene.run) return;
  const run = gameScene.run;
  if (!run.finalEnding || run.statsApplied) return;
  applyFinalStats(run);
  run.statsApplied = true;
  updateStatsUi();
}

function enableTilt() {
  const attach = () => {
    window.addEventListener("deviceorientation", (event) => {
      if (typeof event.gamma !== "number" || typeof event.beta !== "number") return;
      if (tilt.betaBase === null) tilt.betaBase = event.beta;
      tilt.x = Phaser.Math.Clamp(event.gamma / 24, -1, 1);
      tilt.y = Phaser.Math.Clamp((event.beta - tilt.betaBase) / 22, -1, 1);
    });
    tilt.enabled = true;
    ui.tiltButton.textContent = "手机倾斜已启用";
  };

  if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === "function") {
    window.DeviceOrientationEvent.requestPermission()
      .then((permission) => {
        if (permission === "granted") attach();
        else ui.tiltButton.textContent = "倾斜权限未开启";
      })
      .catch(() => {
        ui.tiltButton.textContent = "倾斜权限不可用";
      });
  } else if (window.DeviceOrientationEvent) {
    attach();
  } else {
    ui.tiltButton.textContent = "当前设备不支持倾斜";
  }
}

function getDecorationById(id) {
  return (decorationConfig.decorations || []).find((deco) => deco.id === id);
}

function getDecorationTextureKey(deco) {
  return `deco_image_${deco.id}`;
}

function initDressEditor() {
  const targets = [
    ["beer", "啤酒"],
    ["student", "大学生"],
    ["oldMan", "大爷"],
    ["drunk", "醉汉"],
    ["demon", "魔王"],
    ["tourist", "游客"],
    ["worker", "社畜"],
  ];
  ui.dressTargetSelect.innerHTML = targets.map(([id, name]) => `<option value="${id}">${name}</option>`).join("");
  ui.dressDecorationSelect.innerHTML = (decorationConfig.decorations || [])
    .map((deco) => `<option value="${deco.id}">${deco.name} / ${deco.category}</option>`)
    .join("");
  ui.dressTargetSelect.value = dressState.target;
  renderDressCanvas();
}

function renderDressCanvas() {
  dressState.target = ui.dressTargetSelect.value || "beer";
  dressState.items = JSON.parse(JSON.stringify((save.outfits || {})[dressState.target] || []));
  dressState.selected = null;
  ui.dressCanvas.innerHTML = `<div class="dress-base">${getDressBaseLabel(dressState.target)}</div>`;
  dressState.items.forEach((item, index) => addDressDomItem(item, index));
}

function getDressBaseLabel(target) {
  const map = { beer: "🍺", student: "大学生", oldMan: "大爷", drunk: "醉汉", demon: "魔王", tourist: "游客", worker: "社畜" };
  return map[target] || target;
}

function addDressDomItem(record, index) {
  const deco = getDecorationById(record.decorationId);
  if (!deco) return;
  const el = document.createElement("div");
  el.className = "dress-item";
  el.textContent = deco.emoji || "★";
  el.dataset.index = String(index);
  ui.dressCanvas.appendChild(el);
  updateDressDomItem(el, record);
  el.addEventListener("pointerdown", (event) => {
    dressState.selected = Number(el.dataset.index);
    ui.dressCanvas.querySelectorAll(".dress-item").forEach((node) => node.classList.remove("selected"));
    el.classList.add("selected");
    ui.dressScale.value = String(record.scale || 1);
    ui.dressRotation.value = String(record.rotation || 0);
    el.setPointerCapture(event.pointerId);
  });
  el.addEventListener("pointermove", (event) => {
    if (dressState.selected !== index || event.buttons === 0) return;
    const rect = ui.dressCanvas.getBoundingClientRect();
    record.x = event.clientX - rect.left - rect.width / 2;
    record.y = event.clientY - rect.top - rect.height / 2;
    updateDressDomItem(el, record);
  });
}

function updateDressDomItem(el, record) {
  el.style.transform = `translate(calc(-50% + ${record.x || 0}px), calc(-50% + ${record.y || 0}px)) scale(${record.scale || 1}) rotate(${record.rotation || 0}deg)`;
  el.style.zIndex = String(10 + (record.layer || 0));
}

function addDressItem() {
  const deco = getDecorationById(ui.dressDecorationSelect.value);
  if (!deco) return;
  const targetKind = dressState.target === "beer" ? "beer" : "customer";
  if (deco.allowedTargets !== "all" && deco.allowedTargets !== targetKind) return;
  const record = {
    decorationId: deco.id,
    targetObjectId: dressState.target,
    x: 0,
    y: dressState.target === "beer" ? -18 : -76,
    scale: 1,
    rotation: 0,
    layer: dressState.items.length,
  };
  dressState.items.push(record);
  addDressDomItem(record, dressState.items.length - 1);
}

function saveDressItems() {
  save.outfits = save.outfits || {};
  save.outfits[dressState.target] = dressState.items;
  saveGame();
  if (gameScene) gameScene.refreshAllDress();
}

function initDressEditor() {
  const targets = [
    ["beer", "啤酒"],
    ["student", "大学生"],
    ["oldMan", "大爷"],
    ["drunk", "醉汉"],
    ["demon", "魔王"],
    ["tourist", "游客"],
    ["worker", "社畜"],
  ];
  ui.dressTargetSelect.innerHTML = targets.map(([id, name]) => `<option value="${id}">${name}</option>`).join("");
  const requestedTarget = new URLSearchParams(window.location.search).get("dressTarget");
  if (targets.some(([id]) => id === requestedTarget)) dressState.target = requestedTarget;
  ui.dressTargetSelect.value = dressState.target;
  updateDressCategoryOptions();
  updateDressDecorationOptions();
  renderDressCanvas();
}

function renderDressCanvas() {
  dressState.target = ui.dressTargetSelect.value || "beer";
  dressState.items = JSON.parse(JSON.stringify((save.outfits || {})[dressState.target] || []));
  dressState.selected = null;
  ui.dressCanvas.innerHTML = getDressBaseHtml(dressState.target);
  dressState.items.forEach((item, index) => addDressDomItem(item, index));
}

function getDressBaseHtml(target) {
  const img = dressBaseImages[target];
  if (img) return `<img class="dress-base dress-base-image" src="${img}" alt="${getDressBaseLabel(target)}" />`;
  if (target === "beer") return `<div class="dress-base dress-base-beer">🍺</div>`;
  return `<div class="dress-base">${getDressBaseLabel(target)}</div>`;
}

function getDressBaseLabel(target) {
  const map = { beer: "啤酒", student: "大学生", oldMan: "大爷", drunk: "醉汉", demon: "魔王", tourist: "游客", worker: "社畜" };
  return map[target] || target;
}

function updateDressCategoryOptions() {
  const isBeer = ui.dressTargetSelect.value === "beer";
  toggle(ui.dressCategoryField, !isBeer);
  if (isBeer) return;
  const categories = ["头部", "服装", "裤子", "手持物", "鞋子"];
  ui.dressCategorySelect.innerHTML = categories.map((category) => `<option value="${category}">${category}</option>`).join("");
}

function updateDressDecorationOptions() {
  const target = ui.dressTargetSelect.value || "beer";
  const targetKind = target === "beer" ? "beer" : "customer";
  const category = ui.dressCategorySelect.value;
  const list = (decorationConfig.decorations || []).filter((deco) => {
    const allowed = deco.allowedTargets === "all" || deco.allowedTargets === targetKind;
    if (!allowed) return false;
    return target === "beer" || deco.category === category;
  });
  ui.dressDecorationSelect.innerHTML = list.map((deco) => `<option value="${deco.id}">${deco.name}</option>`).join("");
}

function addDressDomItem(record, index) {
  const deco = getDecorationById(record.decorationId);
  if (!deco) return;
  const el = document.createElement("div");
  el.className = "dress-item";
  if (deco.image) {
    el.innerHTML = `<img src="assets/decorations/${deco.image}" alt="${deco.name}" />`;
  } else {
    el.textContent = deco.emoji || "★";
  }
  el.dataset.index = String(index);
  ui.dressCanvas.appendChild(el);
  updateDressDomItem(el, record);
  el.addEventListener("pointerdown", (event) => {
    dressState.selected = Number(el.dataset.index);
    ui.dressCanvas.querySelectorAll(".dress-item").forEach((node) => node.classList.remove("selected"));
    el.classList.add("selected");
    ui.dressScale.value = String(record.scale || 1);
    ui.dressRotation.value = String(record.rotation || 0);
    el.setPointerCapture(event.pointerId);
  });
  el.addEventListener("pointermove", (event) => {
    if (dressState.selected !== index || event.buttons === 0) return;
    const rect = ui.dressCanvas.getBoundingClientRect();
    record.x = event.clientX - rect.left - rect.width / 2;
    record.y = event.clientY - rect.top - rect.height / 2;
    updateDressDomItem(el, record);
  });
}

function addDressItem() {
  const deco = getDecorationById(ui.dressDecorationSelect.value);
  if (!deco) return;
  const targetKind = dressState.target === "beer" ? "beer" : "customer";
  if (deco.allowedTargets !== "all" && deco.allowedTargets !== targetKind) return;
  const record = {
    decorationId: deco.id,
    targetObjectId: dressState.target,
    x: 0,
    y: dressState.target === "beer" ? -18 : -76,
    scale: 1,
    rotation: 0,
    layer: dressState.items.length,
  };
  dressState.items.push(record);
  addDressDomItem(record, dressState.items.length - 1);
}

function deleteSelectedDressItem() {
  if (dressState.selected === null || !dressState.items[dressState.selected]) return;
  dressState.items.splice(dressState.selected, 1);
  dressState.items.forEach((item, index) => {
    item.layer = index;
  });
  dressState.selected = null;
  save.outfits = save.outfits || {};
  save.outfits[dressState.target] = JSON.parse(JSON.stringify(dressState.items));
  saveGame();
  renderDressCanvas();
  if (gameScene) gameScene.refreshAllDress();
}

fetch("assets/decorations/decorations.json")
  .then((response) => response.json())
  .then((config) => {
    decorationConfig = config;
    initDressEditor();
    if (gameScene) gameScene.refreshAllDress();
    if (new URLSearchParams(window.location.search).has("dress") || new URLSearchParams(window.location.search).has("dressTarget")) {
      hide(ui.menu);
      show(ui.dress);
    }
  })
  .catch(() => {
    decorationConfig = { decorations: [] };
    initDressEditor();
    if (gameScene) gameScene.refreshAllDress();
    if (new URLSearchParams(window.location.search).has("dress") || new URLSearchParams(window.location.search).has("dressTarget")) {
      hide(ui.menu);
      show(ui.dress);
    }
  });

ui.startButton.addEventListener("click", () => gameScene && gameScene.startRun());
ui.dressButton.addEventListener("click", () => {
  initDressEditor();
  hide(ui.menu);
  show(ui.dress);
});
ui.pointsButton.addEventListener("click", () => {
  updateStatsUi();
  hide(ui.menu);
  show(ui.points);
});
ui.pointsBackButton.addEventListener("click", () => {
  hide(ui.points);
  show(ui.menu);
});
ui.settingsButton.addEventListener("click", () => {
  updateStatsUi();
  hide(ui.menu);
  show(ui.settings);
});
ui.settingsBackButton.addEventListener("click", () => {
  hide(ui.settings);
  show(ui.menu);
});
ui.shopAdButton.addEventListener("click", async () => {
  await runMockAd("shop_points", ui.shopAdButton);
  const reward = 120;
  save.totalPoints = (save.totalPoints || 0) + reward;
  save.shopAdUses = (save.shopAdUses || 0) + 1;
  saveGame();
  updateStatsUi();
  if (gameScene) gameScene.setMessage(`广告模拟播放完毕，获得 ${reward} 积分。`);
});
ui.dressBackButton.addEventListener("click", () => {
  hide(ui.dress);
  show(ui.menu);
});
ui.dressTargetSelect.addEventListener("change", () => {
  updateDressCategoryOptions();
  updateDressDecorationOptions();
  renderDressCanvas();
});
ui.dressCategorySelect.addEventListener("change", updateDressDecorationOptions);
ui.dressAddButton.addEventListener("click", addDressItem);
ui.dressDeleteButton.addEventListener("click", deleteSelectedDressItem);
ui.dressSaveButton.addEventListener("click", saveDressItems);
ui.dressResetButton.addEventListener("click", () => {
  dressState.items = [];
  save.outfits = save.outfits || {};
  save.outfits[dressState.target] = [];
  saveGame();
  renderDressCanvas();
  if (gameScene) gameScene.refreshAllDress();
});
ui.dressScale.addEventListener("input", () => {
  if (dressState.selected === null) return;
  const record = dressState.items[dressState.selected];
  record.scale = Number(ui.dressScale.value);
  const el = ui.dressCanvas.querySelector(`[data-index="${dressState.selected}"]`);
  if (el) updateDressDomItem(el, record);
});
ui.dressRotation.addEventListener("input", () => {
  if (dressState.selected === null) return;
  const record = dressState.items[dressState.selected];
  record.rotation = Number(ui.dressRotation.value);
  const el = ui.dressCanvas.querySelector(`[data-index="${dressState.selected}"]`);
  if (el) updateDressDomItem(el, record);
});
ui.nextButton.addEventListener("click", () => {
  finalizeUncountedRun();
  if (gameScene) gameScene.startRun();
});
ui.menuButton.addEventListener("click", () => {
  if (!gameScene) return;
  finalizeUncountedRun();
  gameScene.mode = "menu";
  gameScene.run = null;
  gameScene.drawIdle();
  updateStatsUi();
  hide(ui.result);
  hide(ui.hud);
  show(ui.menu);
});
ui.reviveButton.addEventListener("click", async () => {
  if (!gameScene) return;
  await runMockAd("revive", ui.reviveButton);
  gameScene.reviveRun();
});
ui.doubleScoreButton.addEventListener("click", async () => {
  if (!gameScene || !gameScene.run) return;
  const run = gameScene.run;
  if (run.scoreBreakdown.doubled || !run.scoreBreakdown.awarded || run.score <= 0) return;
  await runMockAd("double_score", ui.doubleScoreButton);
  save.totalPoints = (save.totalPoints || 0) + run.score;
  save.doubleAdUses = (save.doubleAdUses || 0) + 1;
  run.scoreBreakdown.doubled = true;
  run.score *= 2;
  run.scoreBreakdown.final = run.score;
  save.bestScore = Math.max(save.bestScore || 0, run.score);
  save.bestRunPoints = Math.max(save.bestRunPoints || 0, run.score);
  saveGame();
  updateStatsUi();
  gameScene.showResult(false);
});
ui.resetButton.addEventListener("click", resetSave);
ui.tiltButton.addEventListener("click", enableTilt);
ui.stealthButton.addEventListener("click", () => {
  if (!gameScene || !gameScene.run || gameScene.mode !== "playing") return;
  const run = gameScene.run;
  if (run.stealthTimer > 0) {
    gameScene.setMessage("隐身贴纸正在生效，别浪费，继续装不存在。");
    return;
  }
  if (run.stealthStickers <= 0) {
    gameScene.setMessage("没有隐身贴纸了，可以看广告模拟获得 1 个。");
    return;
  }
  run.stealthStickers -= 1;
  run.stealthTimer = 10;
  gameScene.setMessage("隐身贴纸生效 10 秒。你现在是一瓶低调到离谱的啤酒。");
  gameScene.updateHud();
});
ui.adStickerButton.addEventListener("click", async () => {
  if (!gameScene || !gameScene.run || gameScene.mode !== "playing") return;
  await runMockAd("stealth_sticker", ui.adStickerButton);
  gameScene.run.stealthStickers += 1;
  gameScene.setMessage("广告模拟播放完毕，获得 1 个隐身贴纸。");
  gameScene.updateHud();
});
ui.viewLeftButton.addEventListener("click", () => gameScene && gameScene.setView(0));
ui.viewCenterButton.addEventListener("click", () => gameScene && gameScene.setView(1));
ui.viewRightButton.addEventListener("click", () => gameScene && gameScene.setView(2));

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "gameHost",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#101820",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
  scene: BeerScene,
});
