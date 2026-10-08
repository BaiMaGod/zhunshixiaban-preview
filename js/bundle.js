"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/game/Config.ts
  var DESIGN_WIDTH = 1280;
  var DESIGN_HEIGHT = 720;
  var PLAYER_BASE_SPEED = 230;
  var PLAYER_SPRINT_MULTIPLIER = 1.52;
  var PLAYER_CROUCH_MULTIPLIER = 0.72;
  var PLAYER_RADIUS = 15;
  var PREP_SECONDS = 45;
  var WEAPONS = {
    folder: {
      id: "folder",
      name: "加厚文件夹",
      range: 80,
      cooldown: 0.34,
      knockdown: 1,
      noiseRadius: 90,
      ranged: false,
      color: "#5ba6ff"
    },
    stapler: {
      id: "stapler",
      name: "订书机",
      range: 280,
      cooldown: 0.3,
      knockdown: 1,
      noiseRadius: 130,
      ranged: true,
      color: "#ffc857"
    },
    keyboard: {
      id: "keyboard",
      name: "机械键盘",
      range: 108,
      cooldown: 0.48,
      knockdown: 1,
      noiseRadius: 150,
      ranged: false,
      color: "#be7cff"
    },
    extinguisher: {
      id: "extinguisher",
      name: "灭火器",
      range: 150,
      cooldown: 0.7,
      knockdown: 2,
      noiseRadius: 240,
      ranged: false,
      color: "#ff6b6b"
    }
  };
  var UPGRADES = [
    { id: "fastWalk", name: "健步如飞", desc: "移动速度 +15%", category: "general", repeatable: true },
    { id: "catStep", name: "猫步", desc: "冲刺与移动脚步噪音 -45%", category: "stealth" },
    { id: "bossKiller", name: "老板克星", desc: "对主管/老板攻击击倒 +1", category: "combat" },
    { id: "quickHands", name: "我赶时间", desc: "武器攻击冷却 -20%", category: "combat", repeatable: true },
    { id: "officeInstinct", name: "下班本能", desc: "朝电梯方向移动时速度 +12%", category: "general" },
    { id: "silentHit", name: "工伤保险", desc: "击倒敌人后 2.2 秒脚步静音", category: "stealth" },
    { id: "panicRun", name: "开会迟到", desc: "出现警觉时获得 18% 移速加成", category: "general" },
    { id: "oldHand", name: "职场老油条", desc: "敌人的发现积累速度降低 12%", category: "stealth" },
    { id: "heavyFolder", name: "板砖文件", desc: "文件夹击倒 +1，但攻击噪音提高", category: "weapon", weapon: "folder" },
    { id: "doubleStaple", name: "双持订书机", desc: "每次攻击连续射出两枚订书钉", category: "weapon", weapon: "stapler" },
    { id: "steadyAim", name: "穿透装订", desc: "订书机可以同时命中前方两个目标", category: "weapon", weapon: "stapler" },
    { id: "rgbRage", name: "RGB 狂怒", desc: "机械键盘攻击范围 +28%，冷却 -15%", category: "weapon", weapon: "keyboard" },
    { id: "whiteFog", name: "白雾掩护", desc: "灭火器攻击后生成 1.8 秒遮挡烟雾", category: "weapon", weapon: "extinguisher" },
    { id: "quietExtinguisher", name: "静音灭火器", desc: "灭火器噪音半径降低 45%", category: "weapon", weapon: "extinguisher" }
  ];

  // src/game/Geometry.ts
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  __name(clamp, "clamp");
  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  __name(distance, "distance");
  function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len < 1e-4) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
  }
  __name(normalize, "normalize");
  function pointInRect(p, r) {
    return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
  }
  __name(pointInRect, "pointInRect");
  function circleIntersectsRect(cx, cy, radius, r) {
    const nx = clamp(cx, r.x, r.x + r.width);
    const ny = clamp(cy, r.y, r.y + r.height);
    const dx = cx - nx;
    const dy = cy - ny;
    return dx * dx + dy * dy < radius * radius;
  }
  __name(circleIntersectsRect, "circleIntersectsRect");
  function segmentBlocked(a, b, obstacles) {
    const steps = Math.max(8, Math.ceil(distance(a, b) / 18));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      for (const r of obstacles) {
        if (pointInRect(p, r)) return true;
      }
    }
    return false;
  }
  __name(segmentBlocked, "segmentBlocked");
  function angleTo(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }
  __name(angleTo, "angleTo");
  function shortestAngleDelta(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }
  __name(shortestAngleDelta, "shortestAngleDelta");

  // src/game/Enemy.ts
  var PRESETS = {
    coworker: { name: "同事", color: "#7ec8ff", speed: 74, vision: 170, fov: 66, detect: 1.35, endurance: 1 },
    hr: { name: "HR", color: "#ff9ec8", speed: 68, vision: 190, fov: 70, detect: 1.1, endurance: 1 },
    manager: { name: "项目经理", color: "#ffb15c", speed: 88, vision: 215, fov: 80, detect: 0.85, endurance: 2 },
    supervisor: { name: "主管", color: "#cf88ff", speed: 80, vision: 225, fov: 82, detect: 0.9, endurance: 2 },
    boss: { name: "老板", color: "#ff5f5f", speed: 70, vision: 245, fov: 88, detect: 0.82, endurance: 2 }
  };
  var _Enemy = class _Enemy {
    constructor(root, kind, x, y, patrol) {
      this.kind = kind;
      this.patrol = patrol;
      this.sprite = new Laya.Sprite();
      this.cone = new Laya.Sprite();
      this.body = new Laya.Sprite();
      this.label = new Laya.Text();
      this.alert = new Laya.Text();
      this.detectBarBg = new Laya.Sprite();
      this.detectBar = new Laya.Sprite();
      this.shadow = new Laya.Sprite();
      this.stateRing = new Laya.Sprite();
      this.endurancePips = new Laya.Sprite();
      this.roleBadge = new Laya.Sprite();
      this.visualTime = 0;
      this.direction = 0;
      this.detection = 0;
      this.knockedOut = false;
      this.stunnedUntil = 0;
      this.state = "patrol";
      this.waypoint = 0;
      this.investigating = null;
      this.investigationUntil = 0;
      this.lastSeen = null;
      const p = PRESETS[kind];
      this.name = p.name;
      this.visionRange = p.vision;
      this.fovRad = p.fov * Math.PI / 180;
      this.detectSeconds = p.detect;
      this.speed = p.speed;
      this.endurance = p.endurance;
      this.maxEndurance = p.endurance;
      this.x = x;
      this.y = y;
      this.sprite.name = `Enemy_${kind}`;
      this.shadow.graphics.drawEllipse(-19, -7, 38, 14, "#000000");
      this.shadow.alpha = 0.25;
      this.shadow.pos(0, 15);
      this.cone.alpha = 0.16;
      const half = Math.tan(this.fovRad / 2) * this.visionRange;
      this.cone.graphics.drawPoly(0, 0, [0, 0, this.visionRange, -half, this.visionRange, half], p.color);
      const radius = kind === "boss" ? 19 : 16;
      this.body.graphics.drawCircle(0, 0, radius, p.color);
      this.body.graphics.drawCircle(0, 0, radius - 6, "#1a2029");
      this.body.graphics.drawCircle(-5, -4, 3, "#ffffff");
      const badgeText = kind === "boss" ? "B" : kind === "supervisor" ? "管" : kind === "manager" ? "PM" : kind === "hr" ? "HR" : "同";
      const badge = new Laya.Text();
      badge.text = badgeText;
      badge.color = "#ffffff";
      badge.fontSize = kind === "boss" ? 13 : kind === "manager" || kind === "hr" ? 9 : 11;
      badge.bold = true;
      badge.align = "center";
      badge.width = 30;
      badge.pos(-15, -7);
      this.roleBadge.addChild(badge);
      if (kind === "boss") {
        this.roleBadge.graphics.drawRoundRect(-24, -24, 48, 48, 9, "#6c252b");
        this.roleBadge.alpha = 1;
      } else if (kind === "supervisor") {
        this.roleBadge.graphics.drawRoundRect(-21, -21, 42, 42, 8, "#5d3471");
        this.roleBadge.alpha = 1;
      } else if (kind === "hr") {
        this.roleBadge.graphics.drawRoundRect(-19, -19, 38, 38, 8, "#803f5f");
        this.roleBadge.alpha = 1;
      } else {
        this.roleBadge.alpha = 1;
      }
      this.stateRing.alpha = 0;
      this.stateRing.graphics.drawCircle(0, 0, kind === "boss" ? 27 : 24, p.color);
      this.drawEndurancePips();
      this.label.text = p.name;
      this.label.color = "#e8edf2";
      this.label.fontSize = 14;
      this.label.align = "center";
      this.label.width = 110;
      this.label.pos(-55, 22);
      this.alert.text = "!";
      this.alert.color = "#ff4747";
      this.alert.fontSize = 34;
      this.alert.bold = true;
      this.alert.align = "center";
      this.alert.width = 40;
      this.alert.pos(-20, -54);
      this.alert.visible = false;
      this.detectBarBg.graphics.drawRect(-30, -31, 60, 6, "#32191d");
      this.detectBar.visible = false;
      this.detectBarBg.visible = false;
      this.sprite.addChild(this.cone);
      this.sprite.addChild(this.shadow);
      this.sprite.addChild(this.stateRing);
      this.sprite.addChild(this.body);
      this.sprite.addChild(this.roleBadge);
      this.sprite.addChild(this.endurancePips);
      this.sprite.addChild(this.label);
      this.sprite.addChild(this.alert);
      this.sprite.addChild(this.detectBarBg);
      this.sprite.addChild(this.detectBar);
      this.sprite.pos(x, y);
      root.addChild(this.sprite);
    }
    update(dt, now, player, obstacles, fogs, detectionMultiplier = 1) {
      this.visualTime += dt;
      if (this.knockedOut) {
        this.state = "down";
        return false;
      }
      if (now < this.stunnedUntil) {
        this.state = "stunned";
        this.detection = Math.max(0, this.detection - dt * 2.8);
        this.updateDetectionUi();
        this.updateStateLabel();
        return false;
      }
      const sees = this.canSeePlayer(player, obstacles, fogs, now);
      if (sees) {
        this.lastSeen = { x: player.x, y: player.y };
        this.investigating = this.lastSeen;
        this.investigationUntil = now + 2.6;
        this.state = "alert";
        this.detection += dt / this.detectSeconds * detectionMultiplier;
      } else {
        this.detection = Math.max(0, this.detection - dt * 2.7);
        if (this.investigating && now < this.investigationUntil) {
          this.state = "investigate";
        } else {
          this.investigating = null;
          this.state = "patrol";
        }
      }
      this.move(dt, now, obstacles);
      this.renderOccludedCone(obstacles);
      this.updateVisualMotion();
      this.updateDetectionUi();
      this.updateStateLabel();
      return this.detection >= 1;
    }
    hearNoise(source, radius, now) {
      if (this.knockedOut || now < this.stunnedUntil) return;
      if (distance(this, source) <= radius) {
        this.investigating = __spreadValues({}, source);
        this.investigationUntil = now + 2.7;
        if (this.state !== "alert") this.state = "investigate";
      }
    }
    takeHit(value, now) {
      if (this.knockedOut) return false;
      this.endurance -= value;
      this.stunnedUntil = now + 0.5;
      this.playHitFlash();
      this.state = "stunned";
      this.detection = Math.max(0, this.detection - 0.72);
      if (this.endurance <= 0) {
        this.knockedOut = true;
        this.state = "down";
        this.cone.visible = false;
        this.alert.visible = false;
        this.detectBar.visible = false;
        this.detectBarBg.visible = false;
        this.body.alpha = 0.38;
        this.shadow.alpha = 0.12;
        this.stateRing.visible = false;
        this.roleBadge.alpha = 0.35;
        this.endurancePips.visible = false;
        this.label.text = `${this.name} · 倒地`;
        this.sprite.rotation = 88;
        return true;
      }
      this.drawEndurancePips();
      this.updateStateLabel();
      return false;
    }
    get dangerRatio() {
      return Math.max(0, Math.min(1, this.detection));
    }
    move(dt, now, obstacles) {
      let target = null;
      let speed = this.speed;
      if (this.investigating && now < this.investigationUntil) {
        target = this.investigating;
        speed *= this.state === "alert" ? 1.32 : 1.15;
      } else if (this.patrol.length > 0) {
        target = this.patrol[this.waypoint];
      }
      if (!target) return;
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 8) {
        if (this.investigating && now < this.investigationUntil) {
          if (this.state !== "alert") {
            this.investigating = null;
            this.investigationUntil = 0;
            this.state = "patrol";
          }
        } else if (this.patrol.length > 0) {
          this.waypoint = (this.waypoint + 1) % this.patrol.length;
        }
        return;
      }
      const dir = normalize(dx, dy);
      const nx = this.x + dir.x * speed * dt;
      const ny = this.y + dir.y * speed * dt;
      const radius = this.kind === "boss" ? 18 : 15;
      if (!this.collides(nx, this.y, radius, obstacles)) this.x = nx;
      if (!this.collides(this.x, ny, radius, obstacles)) this.y = ny;
      this.direction = Math.atan2(dir.y, dir.x);
      this.sprite.pos(this.x, this.y);
      this.cone.rotation = this.direction * 180 / Math.PI;
    }
    collides(x, y, radius, obstacles) {
      for (const obstacle of obstacles) {
        if (circleIntersectsRect(x, y, radius, obstacle)) return true;
      }
      return false;
    }
    canSeePlayer(player, obstacles, fogs, now) {
      const d = distance(this, player);
      if (d > this.visionRange) return false;
      const targetAngle = angleTo(this, player);
      if (Math.abs(shortestAngleDelta(this.direction, targetAngle)) > this.fovRad / 2) return false;
      if (segmentBlocked(this, player, obstacles)) return false;
      for (const fog of fogs) {
        if (now > fog.until) continue;
        const mid = { x: (this.x + player.x) / 2, y: (this.y + player.y) / 2 };
        if (distance(mid, fog) <= fog.radius) return false;
      }
      return true;
    }
    /**
     * Clip the visible cone with analytic ray/AABB intersections.
     * This replaces 12px marching (hundreds of point/rectangle tests per ray)
     * without touching the underlying detection or collision rules.
     */
    renderOccludedCone(obstacles) {
      const vertices = [0, 0];
      const rays = 14;
      for (let i = 0; i <= rays; i++) {
        const localAngle = -this.fovRad / 2 + this.fovRad * i / rays;
        const worldAngle = this.direction + localAngle;
        const dx = Math.cos(worldAngle);
        const dy = Math.sin(worldAngle);
        let nearest = this.visionRange;
        for (const rect of obstacles) {
          const left = rect.x - this.x;
          const right = rect.x + rect.width - this.x;
          const top = rect.y - this.y;
          const bottom = rect.y + rect.height - this.y;
          const tx0 = Math.abs(dx) < 1e-5 ? left <= 0 && right >= 0 ? -Infinity : Infinity : Math.min(left / dx, right / dx);
          const tx1 = Math.abs(dx) < 1e-5 ? left <= 0 && right >= 0 ? Infinity : -Infinity : Math.max(left / dx, right / dx);
          const ty0 = Math.abs(dy) < 1e-5 ? top <= 0 && bottom >= 0 ? -Infinity : Infinity : Math.min(top / dy, bottom / dy);
          const ty1 = Math.abs(dy) < 1e-5 ? top <= 0 && bottom >= 0 ? Infinity : -Infinity : Math.max(top / dy, bottom / dy);
          const entry = Math.max(tx0, ty0);
          const exit = Math.min(tx1, ty1);
          if (entry <= exit && exit >= 0 && entry < nearest) {
            nearest = Math.max(0, entry);
          }
        }
        vertices.push(Math.cos(localAngle) * nearest, Math.sin(localAngle) * nearest);
      }
      this.cone.graphics.clear();
      this.cone.graphics.drawPoly(0, 0, vertices, PRESETS[this.kind].color);
    }
    playHitFlash() {
      this.body.alpha = 0.25;
      this.body.scale(1.35, 0.78);
      Laya.timer.once(90, this, () => {
        if (this.sprite.destroyed || this.knockedOut) return;
        this.body.alpha = 1;
        this.body.scale(1, 1);
      });
    }
    drawEndurancePips() {
      this.endurancePips.graphics.clear();
      if (this.maxEndurance <= 1) {
        this.endurancePips.visible = false;
        return;
      }
      this.endurancePips.visible = !this.knockedOut;
      const width = 9;
      const gap = 3;
      const total = this.maxEndurance * width + (this.maxEndurance - 1) * gap;
      const startX = -total / 2;
      for (let i = 0; i < this.maxEndurance; i++) {
        const active = i < Math.max(0, this.endurance);
        this.endurancePips.graphics.drawRoundRect(
          startX + i * (width + gap),
          -43,
          width,
          5,
          2,
          active ? "#ffffff" : "#394550"
        );
      }
    }
    updateVisualMotion() {
      const moving = this.state === "patrol" || this.state === "investigate" || this.state === "alert";
      const bob = moving ? Math.sin(this.visualTime * (this.state === "alert" ? 16 : 10)) * 1.4 : 0;
      this.body.y = bob;
      this.endurancePips.y = bob;
      this.shadow.scaleX = moving ? 1 + Math.abs(Math.sin(this.visualTime * 10)) * 0.08 : 1;
      if (this.state === "alert") {
        const pulse = 0.72 + Math.abs(Math.sin(this.visualTime * 11)) * 0.28;
        this.stateRing.visible = true;
        this.stateRing.alpha = 0.18 * pulse;
        this.stateRing.scale(pulse, pulse);
      } else if (this.state === "investigate") {
        this.stateRing.visible = true;
        this.stateRing.alpha = 0.1;
        this.stateRing.scale(0.92, 0.92);
      } else {
        this.stateRing.alpha = 0;
      }
    }
    updateDetectionUi() {
      const active = this.detection > 0.01 && !this.knockedOut;
      this.alert.visible = active;
      this.detectBarBg.visible = active;
      this.detectBar.visible = active;
      this.detectBar.graphics.clear();
      this.detectBar.graphics.drawRect(-30, -31, 60 * Math.min(1, this.detection), 6, "#ff4747");
      this.cone.alpha = this.state === "alert" ? 0.36 : this.state === "investigate" ? 0.24 : 0.16;
    }
    updateStateLabel() {
      if (this.knockedOut) return;
      const suffix = this.state === "alert" ? " · 发现!" : this.state === "investigate" ? " · 调查" : this.state === "stunned" ? " · 硬直" : "";
      this.label.text = `${this.name}${suffix}`;
      this.label.color = this.state === "alert" ? "#ff8a8a" : this.state === "investigate" ? "#ffd27a" : "#e8edf2";
    }
  };
  __name(_Enemy, "Enemy");
  var Enemy = _Enemy;

  // src/game/Player.ts
  var _Player = class _Player {
    constructor(root) {
      this.root = root;
      this.sprite = new Laya.Sprite();
      this.body = new Laya.Sprite();
      this.facingMarker = new Laya.Sprite();
      this.shadow = new Laya.Sprite();
      this.weaponHand = new Laya.Sprite();
      this.animTime = 0;
      this.x = 160;
      this.y = 360;
      this.facingX = 1;
      this.facingY = 0;
      this.weapon = null;
      this.speedMultiplier = 1;
      this.cooldownMultiplier = 1;
      this.noiseMultiplier = 1;
      this.detectionMultiplier = 1;
      this.bossBonus = 0;
      this.weaponBonus = 0;
      this.attackRangeMultiplier = 1;
      this.weaponNoiseMultiplier = 1;
      this.silentUntil = 0;
      this.hasWhiteFog = false;
      this.doubleStaple = false;
      this.penetratingStaple = false;
      this.silentAfterKnockdown = false;
      this.officeInstinct = false;
      this.panicRun = false;
      this.isSprinting = false;
      this.isCrouching = false;
      this.isMoving = false;
      this.isAlerted = false;
      this.attackCooldown = 0;
      this.sprite.name = "Player";
      this.shadow.graphics.drawEllipse(-18, -7, 36, 14, "#000000");
      this.shadow.alpha = 0.28;
      this.shadow.pos(0, 15);
      this.body.graphics.drawCircle(0, 0, PLAYER_RADIUS, "#59e391");
      this.body.graphics.drawCircle(0, 0, PLAYER_RADIUS - 5, "#17232c");
      this.body.graphics.drawCircle(-5, -4, 3, "#d9fff0");
      const me = new Laya.Text();
      me.text = "我";
      me.color = "#d9fff0";
      me.fontSize = 11;
      me.bold = true;
      me.align = "center";
      me.width = 24;
      me.pos(-12, -7);
      this.body.addChild(me);
      this.facingMarker.graphics.drawRect(10, -3, 15, 6, "#ffffff");
      this.weaponHand.pos(12, 0);
      this.sprite.addChild(this.shadow);
      this.sprite.addChild(this.body);
      this.sprite.addChild(this.weaponHand);
      this.sprite.addChild(this.facingMarker);
      this.sprite.pos(this.x, this.y);
      this.root.addChild(this.sprite);
    }
    update(dt, keys, obstacles, elevatorX, virtual) {
      var _a, _b;
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.animTime += dt;
      let dx = (_a = virtual == null ? void 0 : virtual.moveX) != null ? _a : 0;
      let dy = (_b = virtual == null ? void 0 : virtual.moveY) != null ? _b : 0;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) dx -= 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
      if (keys.has("KeyW") || keys.has("ArrowUp")) dy -= 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) dy += 1;
      const dir = normalize(dx, dy);
      this.isMoving = dir.x !== 0 || dir.y !== 0;
      if (this.isMoving) {
        this.facingX = dir.x;
        this.facingY = dir.y;
      }
      this.isCrouching = keys.has("ControlLeft") || keys.has("ControlRight") || keys.has("KeyC") || !!(virtual == null ? void 0 : virtual.crouch);
      this.isSprinting = !this.isCrouching && (keys.has("ShiftLeft") || keys.has("ShiftRight") || !!(virtual == null ? void 0 : virtual.sprint));
      let speed = PLAYER_BASE_SPEED * this.speedMultiplier;
      if (this.isSprinting) speed *= PLAYER_SPRINT_MULTIPLIER;
      if (this.isCrouching) speed *= PLAYER_CROUCH_MULTIPLIER;
      if (this.officeInstinct && this.x < elevatorX && dir.x > 0.35) speed *= 1.12;
      if (this.panicRun && this.isAlerted) speed *= 1.18;
      const nx = this.x + dir.x * speed * dt;
      const ny = this.y + dir.y * speed * dt;
      if (!this.collides(nx, this.y, obstacles)) this.x = nx;
      if (!this.collides(this.x, ny, obstacles)) this.y = ny;
      this.x = Math.max(42, Math.min(1238, this.x));
      this.y = Math.max(84, Math.min(678, this.y));
      this.sprite.pos(this.x, this.y);
      this.sprite.scale(1, this.isCrouching ? 0.72 : 1);
      const bobSpeed = this.isSprinting ? 18 : 11;
      const bobAmount = this.isMoving ? this.isSprinting ? 2.8 : 1.5 : 0;
      this.body.y = Math.sin(this.animTime * bobSpeed) * bobAmount;
      this.weaponHand.y = this.body.y;
      this.shadow.scaleX = this.isMoving ? 1 + Math.abs(Math.sin(this.animTime * bobSpeed)) * 0.1 : 1;
      this.shadow.alpha = this.isCrouching ? 0.2 : 0.28;
      const facingDegrees = Math.atan2(this.facingY, this.facingX) * 180 / Math.PI;
      this.facingMarker.rotation = facingDegrees;
      this.weaponHand.rotation = facingDegrees;
    }
    // Aimed clicks make the ranged stapler usable without having to walk toward a target.
    aimAt(worldX, worldY) {
      const dir = normalize(worldX - this.x, worldY - this.y);
      if (dir.x === 0 && dir.y === 0) return;
      this.facingX = dir.x;
      this.facingY = dir.y;
      const degrees = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
      this.facingMarker.rotation = degrees;
      this.weaponHand.rotation = degrees;
    }
    canAttack() {
      return !!this.weapon && this.attackCooldown <= 0;
    }
    beginAttack() {
      if (!this.weapon) return;
      const spec = WEAPONS[this.weapon];
      this.attackCooldown = spec.cooldown * this.cooldownMultiplier;
    }
    pickup(id) {
      this.weapon = id;
      this.drawWeaponHand();
    }
    applyUpgrade(id) {
      switch (id) {
        case "fastWalk":
          this.speedMultiplier *= 1.15;
          break;
        case "catStep":
          this.noiseMultiplier *= 0.55;
          break;
        case "bossKiller":
          this.bossBonus += 1;
          break;
        case "quickHands":
          this.cooldownMultiplier *= 0.8;
          break;
        case "officeInstinct":
          this.officeInstinct = true;
          break;
        case "silentHit":
          this.silentAfterKnockdown = true;
          break;
        case "panicRun":
          this.panicRun = true;
          break;
        case "oldHand":
          this.detectionMultiplier *= 0.88;
          break;
        case "doubleStaple":
          this.doubleStaple = true;
          break;
        case "steadyAim":
          this.penetratingStaple = true;
          break;
        case "heavyFolder":
          this.weaponBonus += 1;
          this.weaponNoiseMultiplier *= 1.35;
          break;
        case "whiteFog":
          this.hasWhiteFog = true;
          break;
        case "quietExtinguisher":
          this.weaponNoiseMultiplier *= 0.55;
          break;
        case "rgbRage":
          this.attackRangeMultiplier *= 1.28;
          this.cooldownMultiplier *= 0.85;
          break;
      }
    }
    isSilent(now) {
      return now < this.silentUntil;
    }
    onKnockdown(now) {
      if (this.silentAfterKnockdown) {
        this.silentUntil = Math.max(this.silentUntil, now + 2.2);
      }
    }
    pulseAttack() {
      this.body.scale(1.2, 0.86);
      Laya.timer.once(70, this, () => {
        if (!this.sprite.destroyed) this.body.scale(1, 1);
      });
    }
    drawWeaponHand() {
      this.weaponHand.graphics.clear();
      if (!this.weapon) return;
      const spec = WEAPONS[this.weapon];
      if (this.weapon === "folder") {
        this.weaponHand.graphics.drawRect(0, -6, 24, 12, spec.color);
      } else if (this.weapon === "stapler") {
        this.weaponHand.graphics.drawRoundRect(0, -5, 23, 10, 4, spec.color);
        this.weaponHand.graphics.drawRect(16, -2, 10, 4, "#eef4f7");
      } else if (this.weapon === "keyboard") {
        this.weaponHand.graphics.drawRect(0, -7, 30, 14, spec.color);
        this.weaponHand.graphics.drawLine(5, -3, 25, -3, "#ffffff", 1);
        this.weaponHand.graphics.drawLine(5, 2, 25, 2, "#ffffff", 1);
      } else {
        this.weaponHand.graphics.drawRoundRect(0, -8, 27, 16, 6, spec.color);
        this.weaponHand.graphics.drawRect(22, -3, 13, 6, "#dfe9ee");
      }
    }
    collides(x, y, obstacles) {
      for (const r of obstacles) {
        if (circleIntersectsRect(x, y, PLAYER_RADIUS, r)) return true;
      }
      return false;
    }
  };
  __name(_Player, "Player");
  var Player = _Player;

  // src/game/UpgradeSystem.ts
  var _UpgradeSystem = class _UpgradeSystem {
    constructor(root) {
      this.root = root;
      this.layer = new Laya.Sprite();
      this.choices = [];
      this.callback = null;
      this.layer.zOrder = 1e3;
      this.layer.visible = false;
      this.root.addChild(this.layer);
    }
    open(weapon, owned, onChoose) {
      this.callback = onChoose;
      this.choices = this.pickThree(weapon, owned);
      this.render();
      this.layer.visible = true;
    }
    close() {
      this.layer.visible = false;
      this.layer.removeChildren();
      this.callback = null;
    }
    handleKey(code) {
      if (!this.layer.visible) return false;
      const index = code === "Digit1" ? 0 : code === "Digit2" ? 1 : code === "Digit3" ? 2 : -1;
      if (index < 0 || !this.choices[index]) return true;
      this.choose(index);
      return true;
    }
    get isOpen() {
      return this.layer.visible;
    }
    choose(index) {
      const selected = this.choices[index];
      if (!selected) return;
      const cb = this.callback;
      this.close();
      cb == null ? void 0 : cb(selected);
    }
    pickThree(weapon, owned) {
      const eligible = UPGRADES.filter((u) => {
        if (u.weapon && u.weapon !== weapon) return false;
        if (!u.repeatable && owned.has(u.id)) return false;
        return true;
      });
      const weaponPool = eligible.filter((u) => !!u.weapon);
      const stealthPool = eligible.filter((u) => u.category === "stealth");
      const result = [];
      if (weapon && weaponPool.length > 0) result.push(this.takeRandom(weaponPool));
      if (stealthPool.length > 0 && result.length < 3) result.push(this.takeRandom(stealthPool));
      const remaining = eligible.filter((u) => !result.some((r) => r.id === u.id));
      while (result.length < 3 && remaining.length > 0) {
        result.push(this.takeRandom(remaining));
      }
      return this.shuffle(result);
    }
    takeRandom(list) {
      const i = Math.floor(Math.random() * list.length);
      return list.splice(i, 1)[0];
    }
    shuffle(list) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }
    render() {
      this.layer.removeChildren();
      const bg = new Laya.Sprite();
      bg.graphics.drawRect(0, 0, 1280, 720, "#000000");
      bg.alpha = 0.82;
      this.layer.addChild(bg);
      const title = new Laya.Text();
      title.text = "摸鱼时间 · 下班秘籍三选一";
      title.color = "#ffffff";
      title.fontSize = 34;
      title.bold = true;
      title.align = "center";
      title.width = 1280;
      title.pos(0, 128);
      this.layer.addChild(title);
      const sub = new Laya.Text();
      sub.text = "当前时间暂停 · 选择一个强化继续逃离";
      sub.color = "#9fb0bf";
      sub.fontSize = 17;
      sub.align = "center";
      sub.width = 1280;
      sub.pos(0, 176);
      this.layer.addChild(sub);
      this.choices.forEach((choice, i) => {
        const card = new Laya.Sprite();
        const x = 175 + i * 330;
        card.pos(x, 230);
        card.graphics.drawRoundRect(0, 0, 270, 250, 16, "#192531");
        const accent = choice.weapon ? "#79dcff" : choice.category === "stealth" ? "#88e6bc" : choice.category === "combat" ? "#ffa56e" : "#e6cf83";
        card.graphics.drawRoundRect(8, 8, 254, 234, 13, choice.weapon ? "#304252" : "#243544");
        card.graphics.drawRoundRect(14, 13, 242, 7, 3, accent);
        card.graphics.drawRoundRect(23, 189, 224, 34, 9, "#334858");
        card.on(Laya.Event.CLICK, this, () => this.choose(i));
        const num = new Laya.Text();
        num.text = `${i + 1}`;
        num.color = "#ffc857";
        num.fontSize = 28;
        num.bold = true;
        num.pos(20, 18);
        card.addChild(num);
        const tag = new Laya.Text();
        tag.text = choice.weapon ? "武器专属" : choice.category === "stealth" ? "潜行" : choice.category === "combat" ? "战斗" : "通用";
        tag.color = accent;
        tag.fontSize = 14;
        tag.align = "right";
        tag.width = 100;
        tag.pos(145, 23);
        card.addChild(tag);
        const name = new Laya.Text();
        name.text = choice.name;
        name.color = "#ffffff";
        name.fontSize = 27;
        name.bold = true;
        name.align = "center";
        name.width = 230;
        name.pos(20, 64);
        card.addChild(name);
        const desc = new Laya.Text();
        desc.text = choice.desc;
        desc.color = "#cbd5df";
        desc.fontSize = 19;
        desc.wordWrap = true;
        desc.align = "center";
        desc.width = 220;
        desc.height = 88;
        desc.pos(25, 118);
        card.addChild(desc);
        const click = new Laya.Text();
        click.text = "选它 →";
        click.color = "#e3f4ff";
        click.fontSize = 14;
        click.align = "center";
        click.width = 220;
        click.pos(25, 198);
        card.addChild(click);
        this.layer.addChild(card);
      });
      const hint = new Laya.Text();
      hint.text = "点击卡片，或按 1 / 2 / 3";
      hint.color = "#94a6b8";
      hint.fontSize = 18;
      hint.align = "center";
      hint.width = 1280;
      hint.pos(0, 535);
      this.layer.addChild(hint);
    }
  };
  __name(_UpgradeSystem, "UpgradeSystem");
  var UpgradeSystem = _UpgradeSystem;

  // src/game/OfficeArt.ts
  var _OfficeArt = class _OfficeArt {
    static desk(width = 180, height = 40, variant = 0) {
      const s = new Laya.Sprite();
      const top = variant % 2 === 0 ? "#6f8391" : "#647886";
      const edge = variant % 2 === 0 ? "#435766" : "#3d5260";
      s.graphics.drawRoundRect(3, 7, width, height, 7, "#111820");
      s.graphics.drawRoundRect(0, 0, width, height, 7, edge);
      s.graphics.drawRoundRect(5, 4, width - 10, height - 10, 5, top);
      s.graphics.drawRoundRect(width * 0.6, -13, 40, 16, 6, "#344a59");
      s.graphics.drawRoundRect(7, height - 7, width - 14, 4, 2, "#8d9da4");
      s.graphics.drawRoundRect(20, 7, 34, 20, 4, "#16222b");
      s.graphics.drawRect(35, 26, 4, 7, "#23333e");
      s.graphics.drawRect(27, 32, 20, 3, "#23333e");
      s.graphics.drawRect(25, 10, 24, 13, variant % 3 === 0 ? "#4bc0ff" : "#8ad66d");
      s.graphics.drawRect(26, 12, 12, 2, "#c4efff");
      s.graphics.drawCircle(45, 23, 2, "#80f7c3");
      s.graphics.drawRoundRect(65, 20, 45, 10, 3, "#d4dce2");
      s.graphics.drawRoundRect(width - 30, 8, 14, 17, 5, "#f1c45c");
      s.graphics.drawRect(width - 22, 4, 3, 6, "#dde6ed");
      if (width >= 160) {
        s.graphics.drawRect(118, 8, 28, 4, "#d8e0e7");
        s.graphics.drawRect(122, 14, 24, 4, "#aebac3");
      }
      return s;
    }
    static divider(width, height) {
      const s = new Laya.Sprite();
      s.graphics.drawRoundRect(3, 5, width, height, 5, "#10161c");
      s.graphics.drawRoundRect(0, 0, width, height, 5, "#526975");
      s.graphics.drawRect(4, 4, Math.max(2, width - 8), Math.max(2, height - 8), "#6f858f");
      return s;
    }
    static plant() {
      const s = new Laya.Sprite();
      s.graphics.drawEllipse(-19, 14, 38, 13, "#111820");
      s.graphics.drawRoundRect(-12, 4, 24, 24, 5, "#9b6a49");
      s.graphics.drawCircle(-12, -8, 16, "#4fa66d");
      s.graphics.drawCircle(0, -18, 18, "#5fbf78");
      s.graphics.drawCircle(13, -8, 15, "#43985e");
      s.graphics.drawCircle(-2, -5, 17, "#67c782");
      return s;
    }
    static cabinet(width = 120, height = 90) {
      const s = new Laya.Sprite();
      s.graphics.drawRoundRect(4, 6, width, height, 6, "#111820");
      s.graphics.drawRoundRect(0, 0, width, height, 6, "#506471");
      s.graphics.drawLine(width / 2, 7, width / 2, height - 7, "#344753", 2);
      s.graphics.drawCircle(width / 2 - 8, height / 2, 2, "#dbe3e9");
      s.graphics.drawCircle(width / 2 + 8, height / 2, 2, "#dbe3e9");
      return s;
    }
    static prop(kind) {
      const s = new Laya.Sprite();
      s.graphics.drawEllipse(-30, 18, 60, 14, "#121a21");
      if (kind === "printer") {
        s.graphics.drawRoundRect(-26, -18, 52, 40, 7, "#c7d2d9");
        s.graphics.drawRoundRect(-18, -11, 36, 16, 4, "#25343e");
        s.graphics.drawRect(-12, 8, 24, 10, "#eff3f5");
        s.graphics.drawRect(11, -13, 5, 5, "#65e2a3");
      } else if (kind === "water") {
        s.graphics.drawRoundRect(-18, -5, 36, 32, 7, "#dfe9ee");
        s.graphics.drawRoundRect(-15, -32, 30, 32, 13, "#78ccff");
        s.graphics.drawCircle(-5, 7, 3, "#4aa8e6");
        s.graphics.drawCircle(6, 7, 3, "#ff6f6f");
        s.graphics.drawRect(-8, 15, 16, 7, "#758692");
      } else {
        s.graphics.drawRoundRect(-24, -13, 48, 26, 8, "#efc25b");
        s.graphics.drawRoundRect(-14, -23, 28, 13, 7, "#ffe69b");
        s.graphics.drawCircle(0, 1, 7, "#9d7a2d");
        for (let i = 0; i < 6; i++) {
          const a = Math.PI * 2 * i / 6;
          s.graphics.drawCircle(Math.cos(a) * 8, Math.sin(a) * 8 + 1, 1.5, "#f7efd4");
        }
      }
      const key = new Laya.Text();
      key.text = "E";
      key.color = "#17212a";
      key.fontSize = 12;
      key.bold = true;
      key.align = "center";
      key.width = 20;
      key.pos(-10, -7);
      s.addChild(key);
      return s;
    }
    static rewardBeacon() {
      const s = new Laya.Sprite();
      s.name = "RewardBeacon";
      s.graphics.drawEllipse(-37, 19, 74, 24, "#132229");
      s.graphics.drawCircle(0, 0, 35, "#473366");
      s.graphics.drawCircle(0, 0, 29, "#8855cb");
      s.graphics.drawCircle(0, 0, 23, "#33244a");
      s.graphics.drawPoly(0, 0, [0, -21, 7, -8, 21, 0, 7, 8, 0, 21, -7, 8, -21, 0, -7, -8], "#e9ba68");
      s.graphics.drawCircle(0, 0, 6, "#ffffff");
      const name = new Laya.Text();
      name.text = "下班秘籍";
      name.color = "#e8ccff";
      name.fontSize = 14;
      name.bold = true;
      name.align = "center";
      name.width = 110;
      name.pos(-55, -54);
      s.addChild(name);
      const action = new Laya.Text();
      action.text = "E 领取";
      action.color = "#fff1b5";
      action.fontSize = 12;
      action.bold = true;
      action.align = "center";
      action.width = 100;
      action.pos(-50, 40);
      s.addChild(action);
      return s;
    }
    static weaponPickup(id) {
      const s = new Laya.Sprite();
      const spec = WEAPONS[id];
      s.graphics.drawCircle(0, 0, 26, "#15212a");
      s.graphics.drawCircle(0, 0, 21, spec.color);
      s.graphics.drawCircle(0, 0, 17, "#1a242e");
      if (id === "folder") {
        s.graphics.drawRoundRect(-12, -8, 24, 16, 3, spec.color);
        s.graphics.drawRect(-8, -4, 16, 2, "#e9f4ff");
      } else if (id === "stapler") {
        s.graphics.drawRoundRect(-13, -6, 26, 12, 5, spec.color);
        s.graphics.drawRect(5, -2, 10, 4, "#f6f6f6");
      } else if (id === "keyboard") {
        s.graphics.drawRoundRect(-15, -9, 30, 18, 3, spec.color);
        for (let y = -4; y <= 4; y += 4) {
          s.graphics.drawLine(-10, y, 10, y, "#f4edff", 1);
        }
      } else {
        s.graphics.drawRoundRect(-9, -14, 18, 28, 7, spec.color);
        s.graphics.drawRect(7, -4, 11, 8, "#e5edf1");
      }
      const key = new Laya.Text();
      key.text = "E";
      key.color = "#ffffff";
      key.fontSize = 11;
      key.bold = true;
      key.align = "center";
      key.width = 22;
      key.pos(-11, -7);
      s.addChild(key);
      return s;
    }
    static elevator(active = false) {
      const frame = new Laya.Sprite();
      frame.graphics.drawRoundRect(0, 0, 114, 250, 12, active ? "#4ecf8a" : "#465763");
      frame.graphics.drawRoundRect(7, 7, 100, 236, 10, active ? "#264d3e" : "#283640");
      const door = new Laya.Sprite();
      door.graphics.drawRect(0, 0, 104, 236, "#17212a");
      door.graphics.drawRect(51, 0, 2, 236, "#657681");
      door.graphics.drawLine(8, 12, 8, 224, "#2f3f49", 2);
      door.graphics.drawLine(96, 12, 96, 224, "#2f3f49", 2);
      door.graphics.drawRect(12, 18, 27, 4, "#334651");
      door.graphics.drawRect(65, 18, 27, 4, "#334651");
      door.graphics.drawRect(12, 206, 27, 4, "#334651");
      door.graphics.drawRect(65, 206, 27, 4, "#334651");
      door.graphics.drawRoundRect(84, 102, 8, 22, 3, "#657e8d");
      door.graphics.drawCircle(88, 109, 2.5, "#ffc857");
      const light = new Laya.Sprite();
      light.graphics.drawRoundRect(37, -20, 40, 12, 4, "#1b262e");
      light.graphics.drawCircle(57, -14, 4, active ? "#5bf0a5" : "#6f7b83");
      return { frame, door, light };
    }
  };
  __name(_OfficeArt, "OfficeArt");
  var OfficeArt = _OfficeArt;

  // src/game/SoundSystem.ts
  var _SoundSystem = class _SoundSystem {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }
    unlock() {
      if (!this.enabled) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        this.enabled = false;
        return;
      }
      if (!this.ctx) this.ctx = new Ctx();
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => void 0);
      }
    }
    pickup() {
      this.tone(620, 0.06, "triangle", 0.045, 820);
    }
    upgrade() {
      this.sequence([
        [520, 0.06],
        [660, 0.06],
        [880, 0.1]
      ], "triangle", 0.038);
    }
    alert(level = 1) {
      const f = level > 0.75 ? 250 : 330;
      this.tone(f, 0.055, "square", 0.025, f * 0.8);
    }
    attack(kind) {
      if (kind === "stapler") {
        this.tone(760, 0.035, "square", 0.032, 520);
      } else if (kind === "extinguisher") {
        this.noise(0.1, 0.035);
        this.tone(170, 0.1, "sawtooth", 0.02, 100);
      } else if (kind === "keyboard") {
        this.tone(150, 0.055, "square", 0.035, 95);
      } else {
        this.tone(210, 0.045, "triangle", 0.035, 130);
      }
    }
    hit(strong = false) {
      this.tone(strong ? 95 : 135, strong ? 0.12 : 0.07, "square", strong ? 0.055 : 0.04, 60);
    }
    interact() {
      this.tone(430, 0.05, "sine", 0.025, 360);
    }
    elevatorOpen() {
      this.sequence([
        [740, 0.08],
        [980, 0.15]
      ], "sine", 0.045);
    }
    elevatorClose() {
      this.sequence([
        [520, 0.06],
        [390, 0.11]
      ], "triangle", 0.04);
    }
    fail() {
      this.sequence([
        [310, 0.11],
        [230, 0.13],
        [150, 0.18]
      ], "sawtooth", 0.04);
    }
    tone(frequency, duration, type, gainValue, endFrequency, delay = 0) {
      this.unlock();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + delay;
      const end = start + duration;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);
      if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), end);
      gain.gain.setValueAtTime(1e-4, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(2e-4, gainValue), start + 8e-3);
      gain.gain.exponentialRampToValueAtTime(1e-4, end);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
    sequence(notes, type, gain = 0.03) {
      let delay = 0;
      for (const [frequency, duration] of notes) {
        this.tone(frequency, duration, type, gain, void 0, delay);
        delay += duration * 0.82;
      }
    }
    noise(duration, gainValue) {
      this.unlock();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buffer;
      gain.gain.value = gainValue;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    }
  };
  __name(_SoundSystem, "SoundSystem");
  var SoundSystem = _SoundSystem;

  // src/game/MobileControls.ts
  var _MobileControls = class _MobileControls {
    constructor(root, onAttack, onInteract, visibleInitially) {
      this.root = root;
      this.onAttack = onAttack;
      this.onInteract = onInteract;
      this.layer = new Laya.Sprite();
      this.base = new Laya.Sprite();
      this.knob = new Laya.Sprite();
      this.attackButton = new Laya.Sprite();
      this.interactButton = new Laya.Sprite();
      this.crouchButton = new Laya.Sprite();
      this.sprintButton = new Laya.Sprite();
      this.dragging = false;
      this.joystickPointer = null;
      this.sprintToggled = false;
      this.crouchToggled = false;
      this._visible = false;
      this.moveX = 0;
      this.moveY = 0;
      this.layer.zOrder = 900;
      this.layer.size(1280, 720);
      this.root.addChild(this.layer);
      this.buildJoystick();
      this.buildButtons();
      Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onStageMove);
      Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onStageUp);
      this.setVisible(visibleInitially);
    }
    get visible() {
      return this._visible;
    }
    get state() {
      return {
        moveX: this.moveX,
        moveY: this.moveY,
        sprint: this.sprintToggled,
        crouch: this.crouchToggled
      };
    }
    setVisible(value) {
      this._visible = value;
      this.layer.visible = value;
      if (!value) this.resetTransientInput();
    }
    toggle() {
      this.setVisible(!this._visible);
    }
    destroy() {
      Laya.timer.clearAll(this);
      Laya.stage.offAllCaller(this);
      this.layer.destroy(true);
    }
    buildJoystick() {
      this.base.graphics.drawCircle(0, 0, 74, "#0a1117");
      this.base.graphics.drawCircle(0, 0, 69, "#334652");
      this.base.graphics.drawCircle(0, 0, 53, "#263640");
      this.base.alpha = 0.72;
      this.base.pos(132, 560);
      const label = new Laya.Text();
      label.text = "移动";
      label.color = "#b8c8d2";
      label.fontSize = 14;
      label.bold = true;
      label.align = "center";
      label.width = 90;
      label.pos(-45, 82);
      this.base.addChild(label);
      this.knob.graphics.drawCircle(0, 0, 34, "#d8e4ea");
      this.knob.graphics.drawCircle(0, 0, 27, "#5f7684");
      this.knob.alpha = 0.92;
      this.base.addChild(this.knob);
      this.base.on(Laya.Event.MOUSE_DOWN, this, this.onJoystickDown);
      this.layer.addChild(this.base);
    }
    buildButtons() {
      this.buildButton(this.attackButton, 1135, 505, 52, "攻击", "#ff6b6b");
      this.buildButton(this.interactButton, 1025, 575, 43, "互动", "#ffc857");
      this.buildButton(this.crouchButton, 1120, 625, 37, "蹲伏", "#79c8ff");
      this.buildButton(this.sprintButton, 1205, 605, 37, "冲刺", "#5bf0a5");
      this.attackButton.on(Laya.Event.MOUSE_DOWN, this, () => {
        if (!this._visible) return;
        this.pulse(this.attackButton, 1.12);
        this.onAttack();
      });
      this.interactButton.on(Laya.Event.MOUSE_DOWN, this, () => {
        if (!this._visible) return;
        this.pulse(this.interactButton, 1.1);
        this.onInteract();
      });
      this.crouchButton.on(Laya.Event.MOUSE_DOWN, this, () => {
        if (!this._visible) return;
        this.crouchToggled = !this.crouchToggled;
        if (this.crouchToggled) this.sprintToggled = false;
        this.renderToggleState();
      });
      this.sprintButton.on(Laya.Event.MOUSE_DOWN, this, () => {
        if (!this._visible) return;
        this.sprintToggled = !this.sprintToggled;
        if (this.sprintToggled) this.crouchToggled = false;
        this.renderToggleState();
      });
    }
    buildButton(button, x, y, radius, text, color) {
      button.graphics.drawCircle(0, 0, radius + 4, "#0a1117");
      button.graphics.drawCircle(0, 0, radius, color);
      button.graphics.drawCircle(0, 0, Math.max(12, radius - 8), "#1d2a33");
      button.alpha = 0.78;
      button.pos(x, y);
      const label = new Laya.Text();
      label.text = text;
      label.color = "#ffffff";
      label.fontSize = radius >= 45 ? 18 : 15;
      label.bold = true;
      label.align = "center";
      label.width = radius * 2;
      label.pos(-radius, -10);
      button.addChild(label);
      this.layer.addChild(button);
    }
    onJoystickDown(e) {
      if (!this._visible) return;
      this.dragging = true;
      this.joystickPointer = this.pointerId(e);
      this.updateJoystick(e.stageX, e.stageY);
    }
    onStageMove(e) {
      if (!this._visible || !this.dragging) return;
      if (this.pointerId(e) !== this.joystickPointer) return;
      this.updateJoystick(e.stageX, e.stageY);
    }
    onStageUp(e) {
      if (!this.dragging) return;
      if (this.pointerId(e) !== this.joystickPointer) return;
      this.dragging = false;
      this.joystickPointer = null;
      this.moveX = 0;
      this.moveY = 0;
      this.knob.pos(0, 0);
      this.renderToggleState();
    }
    updateJoystick(stageX, stageY) {
      const cx = 132;
      const cy = 560;
      let dx = stageX - cx;
      let dy = stageY - cy;
      const distance2 = Math.sqrt(dx * dx + dy * dy);
      const max = 52;
      if (distance2 > max && distance2 > 0) {
        dx = dx / distance2 * max;
        dy = dy / distance2 * max;
      }
      this.knob.pos(dx, dy);
      this.moveX = dx / max;
      this.moveY = dy / max;
      if (Math.abs(this.moveX) < 0.1) this.moveX = 0;
      if (Math.abs(this.moveY) < 0.1) this.moveY = 0;
    }
    renderToggleState() {
      this.crouchButton.alpha = this.crouchToggled ? 1 : 0.78;
      this.crouchButton.scale(this.crouchToggled ? 1.08 : 1, this.crouchToggled ? 1.08 : 1);
      this.sprintButton.alpha = this.sprintToggled ? 1 : 0.78;
      this.sprintButton.scale(this.sprintToggled ? 1.08 : 1, this.sprintToggled ? 1.08 : 1);
    }
    resetTransientInput() {
      this.dragging = false;
      this.joystickPointer = null;
      this.moveX = 0;
      this.moveY = 0;
      this.knob.pos(0, 0);
      this.renderToggleState();
    }
    pointerId(e) {
      var _a, _b, _c, _d, _e;
      const anyEvent = e;
      return (_e = (_d = (_b = anyEvent.touchId) != null ? _b : (_a = anyEvent.nativeEvent) == null ? void 0 : _a.pointerId) != null ? _d : (_c = anyEvent.nativeEvent) == null ? void 0 : _c.identifier) != null ? _e : "mouse";
    }
    pulse(button, scale) {
      button.scale(scale, scale);
      Laya.timer.once(80, this, () => {
        if (!button.destroyed) button.scale(1, 1);
      });
    }
  };
  __name(_MobileControls, "MobileControls");
  var MobileControls = _MobileControls;

  // src/game/DebugOverlay.ts
  var _DebugOverlay = class _DebugOverlay {
    constructor(root) {
      this.root = root;
      this.layer = new Laya.Sprite();
      this.text = new Laya.Text();
      this._visible = false;
      this.layer.zOrder = 1800;
      this.layer.graphics.drawRoundRect(0, 0, 330, 190, 10, "#071017");
      this.layer.alpha = 0.92;
      this.layer.pos(18, 88);
      this.text.color = "#b9f6d2";
      this.text.fontSize = 14;
      this.text.bold = true;
      this.text.width = 310;
      this.text.height = 170;
      this.text.pos(12, 10);
      this.layer.addChild(this.text);
      this.root.addChild(this.layer);
      this.setVisible(false);
    }
    get visible() {
      return this._visible;
    }
    toggle() {
      this.setVisible(!this._visible);
    }
    setVisible(value) {
      this._visible = value;
      this.layer.visible = value;
    }
    update(s) {
      if (!this._visible) return;
      this.text.text = `DEBUG F2
FPS: ${s.fps.toFixed(0)}
Player: ${s.playerX.toFixed(0)}, ${s.playerY.toFixed(0)}
Danger: ${Math.round(s.danger * 100)}%
State: ${s.state}
Enemy: ${s.enemyAlive} alive / ${s.enemyAlerted} alert
Weapon: ${s.weapon}
Mobile UI: ${s.mobile ? "ON" : "OFF"}
Elapsed: ${s.elapsed.toFixed(1)}s`;
    }
  };
  __name(_DebugOverlay, "DebugOverlay");
  var DebugOverlay = _DebugOverlay;

  // src/game/TutorialSystem.ts
  var _TutorialSystem = class _TutorialSystem {
    constructor(root) {
      this.root = root;
      this.layer = new Laya.Sprite();
      this.title = new Laya.Text();
      this.body = new Laya.Text();
      this.current = null;
      this.dismissed = /* @__PURE__ */ new Set();
      this.shown = /* @__PURE__ */ new Set();
      this.hideTimer = 0;
      this.layer.zOrder = 850;
      this.layer.graphics.drawRoundRect(0, 0, 420, 82, 12, "#0b141b");
      this.layer.alpha = 0.92;
      this.layer.pos(430, 90);
      this.title.color = "#ffffff";
      this.title.fontSize = 18;
      this.title.bold = true;
      this.title.width = 390;
      this.title.pos(15, 11);
      this.layer.addChild(this.title);
      this.body.color = "#b9c8d2";
      this.body.fontSize = 14;
      this.body.width = 390;
      this.body.wordWrap = true;
      this.body.pos(15, 39);
      this.layer.addChild(this.body);
      this.root.addChild(this.layer);
      this.layer.visible = false;
    }
    show(step, mobile, now, duration = 4.2) {
      if (this.dismissed.has(step) || this.shown.has(step) || this.current === step) return;
      this.shown.add(step);
      this.current = step;
      this.hideTimer = now + duration;
      const copy = this.copy(step, mobile);
      this.title.text = copy.title;
      this.body.text = copy.body;
      this.layer.visible = true;
    }
    complete(step) {
      this.dismissed.add(step);
      this.shown.add(step);
      if (this.current === step) {
        this.current = null;
        this.layer.visible = false;
      }
    }
    update(now) {
      if (!this.layer.visible || this.hideTimer <= 0) return;
      if (now >= this.hideTimer) {
        this.layer.visible = false;
        this.current = null;
      }
    }
    copy(step, mobile) {
      const move = mobile ? "拖动左下摇杆移动；冲刺会制造更大声音。" : "WASD 移动；Shift 冲刺会制造更大声音。";
      const stealth = mobile ? "点“蹲伏”降低噪音与被发现速度。" : "按 C / Ctrl 蹲伏，降低噪音与被发现速度。";
      const interact = mobile ? "靠近发光物品后点“互动”。" : "靠近发光物品后按 E。";
      switch (step) {
        case "move":
          return { title: "先离开工位", body: move };
        case "weapon":
          return { title: "先拿一件办公室武器", body: interact + " 武器能在敌人完全发现你前反杀。" };
        case "stealth":
          return { title: "红色 ! 代表正在被发现", body: stealth + " 躲回遮挡物后警觉会下降。" };
        case "interact":
          return { title: "办公室设备也是机关", body: interact + " 打印机、电话和饮水机可以把附近的人引开。" };
        case "upgrade":
          return { title: "下班秘籍 · 三选一", body: "优先围绕当前武器构筑，专属强化会明显改变打法。" };
        case "elevator":
          return { title: "18:00，电梯已开放", body: "现在的唯一目标：活着到达右侧电梯。" };
      }
    }
  };
  __name(_TutorialSystem, "TutorialSystem");
  var TutorialSystem = _TutorialSystem;

  // src/game/GamePanels.ts
  var _GamePanels = class _GamePanels {
    constructor(root) {
      this.root = root;
      this.layer = new Laya.Sprite();
      this.layer.name = "GamePanels";
      this.layer.zOrder = 2e3;
      this.layer.size(1280, 720);
      this.root.addChild(this.layer);
      this.hide();
    }
    hide() {
      this.layer.visible = false;
      this.layer.removeChildren();
    }
    showHome(onStart, mobile = false) {
      this.beginPanel("#70f3b5");
      this.text("下班！下班！", 56, "#f5fcff", true, 0, 163, 1280);
      this.text("第一关   /   准点下班", 22, "#70f3b5", true, 0, 244, 1280);
      this.text("17:55 开始行动，18:00 电梯开放。躲开领导视线，或用办公室武器突围。", 19, "#bfd3df", false, 280, 310, 720);
      this.text("被发现即失败  ·  武器 + 三选一强化  ·  固定关卡多条路线", 17, "#9bafc0", false, 280, 359, 720);
      this.button("开始下班  →", 490, 417, 300, "#51dba1", "#122b27", onStart);
      this.text(
        mobile ? "左侧摇杆移动  ·  右侧攻击 / 互动 / 蹲伏 / 冲刺  ·  顶部暂停" : "WASD 移动   E 互动   空格攻击   Shift 冲刺   C 蹲伏   Esc 暂停",
        15,
        "#8ca7ba",
        false,
        0,
        551,
        1280
      );
    }
    showPause(onResume, onRestart) {
      this.beginPanel("#79c8ff");
      this.text("摸鱼时间", 52, "#f4fbff", true, 0, 181, 1280);
      this.text("游戏已暂停 · 巡逻和倒计时均暂时停止", 21, "#bbd1df", false, 0, 258, 1280);
      this.button("继续逃离", 365, 359, 255, "#72e8ba", "#18312c", onResume);
      this.button("重新开局", 661, 359, 255, "#314858", "#e3f3ff", onRestart);
      this.text("按 Esc / P 也可以继续", 17, "#91aabd", false, 0, 481, 1280);
    }
    showEnd(title, detail, stats, victory, onRestart) {
      const accent = victory ? "#76f4b5" : "#ff8e91";
      this.beginPanel(accent);
      this.text(victory ? "打卡成功  /  LEVEL CLEAR" : "下班失败  /  GAME OVER", 16, accent, true, 0, 156, 1280);
      this.text(title, 46, "#f7fbff", true, 0, 210, 1280);
      this.text(detail, 22, "#d5e5ec", false, 285, 287, 710, 76);
      this.text(stats, 17, "#a5beca", false, 295, 366, 690, 61);
      this.button("再试一次  →", 490, 444, 300, accent, "#162b2c", onRestart);
      this.text("按 R 可以快速重新开局", 16, "#8eabb9", false, 0, 526, 1280);
    }
    beginPanel(accent) {
      this.layer.removeChildren();
      this.layer.visible = true;
      const scrim = new Laya.Sprite();
      scrim.graphics.drawRect(0, 0, 1280, 720, "#070e16");
      scrim.alpha = 0.93;
      this.layer.addChild(scrim);
      const frame = new Laya.Sprite();
      frame.graphics.drawRoundRect(237, 111, 806, 500, 28, "#0c1925");
      frame.graphics.drawRoundRect(246, 120, 788, 482, 23, "#172937");
      frame.graphics.drawRoundRect(260, 133, 760, 3, 1.5, accent);
      frame.graphics.drawRoundRect(269, 150, 170, 27, 13, "#294454");
      frame.graphics.drawCircle(287, 163, 5, accent);
      frame.graphics.drawCircle(305, 163, 5, "#7ea1b2");
      frame.graphics.drawCircle(323, 163, 5, "#7ea1b2");
      frame.graphics.drawRoundRect(285, 574, 710, 1, 0.5, "#385260");
      this.layer.addChild(frame);
    }
    text(value, size, color, bold, x, y, width, height = 55) {
      const t = new Laya.Text();
      t.text = value;
      t.fontSize = size;
      t.color = color;
      t.bold = bold;
      t.align = "center";
      t.width = width;
      t.height = height;
      t.wordWrap = true;
      t.pos(x, y);
      this.layer.addChild(t);
    }
    button(label, x, y, width, fill, ink, onClick) {
      const b = new Laya.Sprite();
      b.name = label;
      b.graphics.drawRoundRect(0, 5, width, 59, 15, "#0b1922");
      b.graphics.drawRoundRect(0, 0, width, 58, 15, fill);
      b.size(width, 64);
      b.pos(x, y);
      const t = new Laya.Text();
      t.text = label;
      t.fontSize = 23;
      t.bold = true;
      t.color = ink;
      t.align = "center";
      t.width = width;
      t.height = 38;
      t.pos(0, 14);
      b.addChild(t);
      b.on(Laya.Event.CLICK, this, onClick);
      this.layer.addChild(b);
    }
  };
  __name(_GamePanels, "GamePanels");
  var GamePanels = _GamePanels;

  // src/game/LevelOnePrototype.ts
  var _LevelOnePrototype = class _LevelOnePrototype {
    constructor() {
      this.root = new Laya.Sprite();
      this.world = new Laya.Sprite();
      this.ui = new Laya.Sprite();
      this.fx = new Laya.Sprite();
      this.keys = /* @__PURE__ */ new Set();
      this.obstacles = [];
      this.enemies = [];
      this.pickups = [];
      this.fogs = [];
      this.transientFx = [];
      this.interactables = [];
      this.rewardStations = [];
      this.exitTrail = new Laya.Sprite();
      this.progressBar = new Laya.Sprite();
      this.exitSign = new Laya.Text();
      this.chosenUpgrades = /* @__PURE__ */ new Set();
      this.sound = new SoundSystem();
      this.pauseMobileVisible = false;
      this.elapsed = 0;
      this.now = 0;
      this.lastFrame = 0;
      this.state = "menu";
      this.elevatorActive = false;
      this.elevatorArtActivated = false;
      this.flashSerial = 0;
      this.shakeUntil = 0;
      this.shakePower = 0;
      this.attackFlashUntil = 0;
      this.footstepNoiseCooldown = 0;
      this.firstWeaponUpgradeGranted = false;
      this.nearMissReady = true;
      this.knockdowns = 0;
      this.interactions = 0;
      this.attacks = 0;
      this.upgradesTaken = 0;
      this.nearMisses = 0;
      this.maxDetection = 0;
      this.lastKnockdownAt = -999;
      this.knockdownCombo = 0;
      this.currentDanger = 0;
      this.lastAlertSfxAt = -999;
      this.firstInteractHintShown = false;
      this.firstDangerHintShown = false;
      this.update = /* @__PURE__ */ __name(() => {
        const current = Laya.timer.currTimer;
        const dt = Math.min(0.033, Math.max(0, (current - this.lastFrame) / 1e3));
        this.lastFrame = current;
        this.now = current / 1e3;
        if (this.state === "escaping") {
          this.cleanupFogs();
          this.updateFx();
          return;
        }
        if (this.state !== "playing" || this.upgradeSystem.isOpen) {
          this.cleanupFogs();
          return;
        }
        this.elapsed += dt;
        this.updateClock();
        this.player.update(
          dt,
          this.keys,
          this.obstacles,
          1170,
          this.mobileControls.visible ? this.mobileControls.state : void 0
        );
        if (this.tryEnterElevator()) {
          this.cleanupFogs();
          this.updateFx();
          return;
        }
        this.updateTutorial();
        this.updateFootstepNoise(dt);
        this.updatePickups();
        this.updateRewardStations();
        this.updateEnemies(dt);
        this.updateElevator();
        this.updateInteractables();
        this.updateHud();
        this.tutorial.update(this.now);
        this.updateDebug(dt);
        this.cleanupFogs();
        this.updateFx();
      }, "update");
    }
    start() {
      this.root.size(DESIGN_WIDTH, DESIGN_HEIGHT);
      this.world.size(DESIGN_WIDTH, DESIGN_HEIGHT);
      this.ui.size(DESIGN_WIDTH, DESIGN_HEIGHT);
      this.fx.size(DESIGN_WIDTH, DESIGN_HEIGHT);
      this.root.addChild(this.world);
      this.root.addChild(this.fx);
      this.root.addChild(this.ui);
      Laya.stage.addChild(this.root);
      this.drawOffice();
      this.spawnPlayer();
      this.spawnEnemies();
      this.spawnWeapons();
      this.buildUi();
      this.upgradeSystem = new UpgradeSystem(this.root);
      this.mobileControls = new MobileControls(
        this.root,
        () => this.attack(),
        () => this.interact(),
        this.isTouchDevice()
      );
      this.debugOverlay = new DebugOverlay(this.root);
      this.tutorial = new TutorialSystem(this.root);
      this.refreshControlHint();
      this.panels = new GamePanels(this.root);
      this.panels.showHome(() => this.beginPlaying(), this.mobileControls.visible);
      this.pauseButton.visible = false;
      Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
      Laya.stage.on(Laya.Event.KEY_UP, this, this.onKeyUp);
      Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
      this.lastFrame = Laya.timer.currTimer;
      Laya.timer.frameLoop(1, this, this.update);
    }
    beginPlaying() {
      if (this.state !== "menu") return;
      this.state = "playing";
      this.panels.hide();
      this.pauseButton.visible = true;
      this.lastFrame = Laya.timer.currTimer;
      this.tutorial.show("move", this.mobileControls.visible, this.now, 5.5);
      this.flashMessage("17:55 · 找武器、看巡逻路线，准备下班", "#8fd5ff", 1500);
    }
    togglePause() {
      if (this.state === "playing" && !this.upgradeSystem.isOpen) {
        this.state = "paused";
        this.keys.clear();
        this.pauseMobileVisible = this.mobileControls.visible;
        this.mobileControls.setVisible(false);
        this.pauseButton.visible = false;
        this.panels.showPause(() => this.togglePause(), () => this.restart());
      } else if (this.state === "paused") {
        this.state = "playing";
        this.panels.hide();
        this.pauseButton.visible = true;
        this.mobileControls.setVisible(this.pauseMobileVisible);
        this.lastFrame = Laya.timer.currTimer;
      }
    }
    drawOffice() {
      const bg = new Laya.Sprite();
      bg.graphics.drawRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, "#111820");
      this.world.addChild(bg);
      const floor = new Laya.Sprite();
      floor.graphics.drawRect(28, 70, 1224, 620, "#202b35");
      floor.graphics.drawRect(34, 76, 1212, 608, "#26343f");
      floor.graphics.drawRect(40, 82, 255, 596, "#25313b");
      floor.graphics.drawRect(300, 82, 285, 596, "#293843");
      floor.graphics.drawRect(600, 82, 220, 596, "#29363f");
      floor.graphics.drawRect(860, 82, 190, 596, "#2a3741");
      floor.graphics.drawRect(1105, 82, 135, 596, "#25313a");
      this.world.addChild(floor);
      this.exitTrail.alpha = 0;
      this.world.addChild(this.exitTrail);
      for (let x = 65; x < 1230; x += 78) {
        floor.graphics.drawLine(x, 83, x, 681, "#30414a", 1);
      }
      for (let y = 105; y < 678; y += 70) {
        floor.graphics.drawLine(40, y, 1240, y, "#30414a", 1);
      }
      floor.graphics.drawRoundRect(42, 319, 247, 112, 8, "#293b44");
      floor.graphics.drawRoundRect(1120, 566, 118, 78, 8, "#1e3740");
      this.addZoneLabel("你的工位", 90, 92);
      this.addZoneLabel("开放办公区", 360, 92);
      this.addZoneLabel("打印 / 茶水区", 655, 92);
      this.addZoneLabel("前台 / 打卡区", 890, 92);
      this.addZoneLabel("电梯厅", 1120, 92);
      this.addDeskObstacle(70, 160, 180, 40, 0);
      this.addDeskObstacle(70, 250, 180, 40, 1);
      this.addDeskObstacle(70, 440, 180, 40, 2);
      this.addDeskObstacle(70, 530, 180, 40, 3);
      this.addDeskObstacle(330, 160, 170, 42, 4);
      this.addDeskObstacle(330, 270, 170, 42, 5);
      this.addDeskObstacle(330, 455, 170, 42, 6);
      this.addDeskObstacle(330, 565, 170, 42, 7);
      this.addDividerObstacle(560, 210, 36, 320);
      this.addCabinetObstacle(635, 170, 150, 74);
      this.addCabinetObstacle(650, 500, 120, 90);
      this.addDividerObstacle(820, 250, 34, 315);
      this.addCabinetObstacle(900, 175, 125, 58);
      this.addCabinetObstacle(900, 505, 125, 58);
      this.addDividerObstacle(1065, 300, 35, 250);
      const printer = this.makeProp("printer", "打印机", 680, 186);
      const water = this.makeProp("water", "饮水机", 705, 545);
      const phone = this.makeProp("phone", "电话", 950, 205);
      this.addPlantDecor(610, 610);
      this.addPlantDecor(875, 132);
      this.addPlantDecor(1090, 610);
      this.addRewardStation(430, 380);
      this.addRewardStation(680, 373);
      this.addRewardStation(930, 363);
      this.addRewardStation(1136, 626);
      this.interactables.push(
        { id: "printer", name: "制造打印机卡纸", x: 680, y: 186, cooldownUntil: 0, sprite: printer },
        { id: "water", name: "推倒饮水机", x: 705, y: 545, cooldownUntil: 0, sprite: water },
        { id: "phone", name: "拨打办公电话", x: 950, y: 205, cooldownUntil: 0, sprite: phone }
      );
      const checkpoint = new Laya.Sprite();
      checkpoint.graphics.drawRoundRect(0, 0, 42, 70, 8, "#101820");
      checkpoint.graphics.drawRoundRect(8, 8, 26, 26, 5, "#5bf0a5");
      checkpoint.pos(1020, 355);
      this.world.addChild(checkpoint);
      this.obstacles.push({ x: 1020, y: 355, width: 42, height: 70 });
      const checkpointText = new Laya.Text();
      checkpointText.text = "打卡";
      checkpointText.color = "#9edbbd";
      checkpointText.fontSize = 12;
      checkpointText.align = "center";
      checkpointText.width = 50;
      checkpointText.pos(1016, 432);
      this.world.addChild(checkpointText);
      const elevator = OfficeArt.elevator(false);
      this.elevatorGlow = elevator.frame;
      this.elevatorGlow.pos(1134, 300);
      this.world.addChild(this.elevatorGlow);
      this.elevatorDoor = elevator.door;
      this.elevatorDoor.pos(1139, 307);
      this.world.addChild(this.elevatorDoor);
      this.elevatorLight = elevator.light;
      this.elevatorLight.pos(1134, 300);
      this.world.addChild(this.elevatorLight);
      const eText = new Laya.Text();
      eText.text = "电梯 · 18:00 开放";
      eText.color = "#e7edf2";
      eText.fontSize = 17;
      eText.align = "center";
      eText.width = 140;
      eText.pos(1120, 560);
      this.world.addChild(eText);
      this.exitSign.text = "● 电梯未开放";
      this.exitSign.fontSize = 17;
      this.exitSign.bold = true;
      this.exitSign.color = "#a3b1ba";
      this.exitSign.align = "center";
      this.exitSign.width = 190;
      this.exitSign.pos(1092, 262);
      this.world.addChild(this.exitSign);
    }
    spawnPlayer() {
      this.player = new Player(this.world);
    }
    spawnEnemies() {
      this.addEnemy("coworker", 380, 225, [
        { x: 380, y: 225 },
        { x: 480, y: 225 },
        { x: 480, y: 360 },
        { x: 380, y: 360 }
      ]);
      this.addEnemy("coworker", 440, 515, [
        { x: 440, y: 515 },
        { x: 520, y: 610 },
        { x: 360, y: 610 }
      ]);
      this.addEnemy("coworker", 710, 330, [
        { x: 710, y: 330 },
        { x: 785, y: 330 },
        { x: 785, y: 430 },
        { x: 690, y: 430 }
      ]);
      this.addEnemy("coworker", 910, 430, [
        { x: 910, y: 430 },
        { x: 1010, y: 430 },
        { x: 1010, y: 600 },
        { x: 900, y: 600 }
      ]);
      this.addEnemy("hr", 995, 315, [{ x: 995, y: 315 }, { x: 995, y: 470 }]);
      this.addEnemy("supervisor", 765, 615, [
        { x: 765, y: 615 },
        { x: 880, y: 615 },
        { x: 880, y: 130 },
        { x: 720, y: 130 }
      ]);
      this.addEnemy("boss", 1120, 225, [
        { x: 1120, y: 225 },
        { x: 1190, y: 225 },
        { x: 1190, y: 590 },
        { x: 1115, y: 590 }
      ]);
    }
    spawnWeapons() {
      const ids = ["folder", "stapler", "keyboard", "extinguisher"];
      this.shuffle(ids);
      const sockets = [
        { x: 235, y: 330 },
        { x: 155, y: 580 },
        { x: 735, y: 640 }
      ];
      sockets.forEach((p, i) => this.addWeaponPickup(ids[i], p.x, p.y));
    }
    buildUi() {
      const topBar = new Laya.Sprite();
      topBar.graphics.drawRect(0, 0, DESIGN_WIDTH, 68, "#0b1117");
      topBar.alpha = 0.94;
      this.ui.addChild(topBar);
      this.timeLabel = this.makeText("17:55:00", 32, "#ffffff", true);
      this.timeLabel.pos(36, 18);
      this.ui.addChild(this.timeLabel);
      this.objectiveLabel = this.makeText("目标：准备下班，18:00 后进入电梯", 19, "#dbe6ef", false);
      this.objectiveLabel.pos(210, 25);
      this.objectiveLabel.width = 520;
      this.ui.addChild(this.objectiveLabel);
      this.progressBar.pos(210, 62);
      this.ui.addChild(this.progressBar);
      this.dangerLabel = this.makeText("安全", 18, "#5bf0a5", true);
      this.dangerLabel.align = "center";
      this.dangerLabel.width = 150;
      this.dangerLabel.pos(760, 25);
      this.ui.addChild(this.dangerLabel);
      this.weaponLabel = this.makeText("武器：无", 18, "#ffc857", true);
      this.weaponLabel.align = "right";
      this.weaponLabel.width = 200;
      this.weaponLabel.pos(930, 25);
      this.ui.addChild(this.weaponLabel);
      this.pauseButton = new Laya.Sprite();
      this.pauseButton.name = "PauseButton";
      this.pauseButton.graphics.drawRoundRect(0, 0, 90, 42, 10, "#314956");
      this.pauseButton.pos(1152, 13);
      const pauseText = this.makeText("Ⅱ 暂停", 17, "#e8f7ff", true);
      pauseText.align = "center";
      pauseText.width = 90;
      pauseText.pos(0, 11);
      this.pauseButton.addChild(pauseText);
      this.pauseButton.on(Laya.Event.CLICK, this, () => this.togglePause());
      this.ui.addChild(this.pauseButton);
      const bottomBar = new Laya.Sprite();
      bottomBar.graphics.drawRect(0, 646, DESIGN_WIDTH, 74, "#0b1117");
      bottomBar.alpha = 0.92;
      this.ui.addChild(bottomBar);
      this.buildLabel = this.makeText("秘籍 0 · 击倒 0", 16, "#b8c5d0", true);
      this.buildLabel.pos(28, 654);
      this.ui.addChild(this.buildLabel);
      this.movementLabel = this.makeText("行动：步行", 16, "#a9d9bf", true);
      this.movementLabel.align = "right";
      this.movementLabel.width = 220;
      this.movementLabel.pos(1030, 654);
      this.ui.addChild(this.movementLabel);
      this.hintLabel = this.makeText(
        "WASD/方向键移动 · Shift冲刺（有噪音） · C/Ctrl蹲伏 · E互动 · 空格/点击攻击 · R重开",
        15,
        "#9fb0bf",
        false
      );
      this.hintLabel.align = "center";
      this.hintLabel.width = DESIGN_WIDTH;
      this.hintLabel.pos(0, 687);
      this.ui.addChild(this.hintLabel);
      this.dangerOverlay = new Laya.Sprite();
      this.dangerOverlay.graphics.drawRect(0, 0, DESIGN_WIDTH, 16, "#ff4d5a");
      this.dangerOverlay.graphics.drawRect(0, DESIGN_HEIGHT - 16, DESIGN_WIDTH, 16, "#ff4d5a");
      this.dangerOverlay.graphics.drawRect(0, 0, 16, DESIGN_HEIGHT, "#ff4d5a");
      this.dangerOverlay.graphics.drawRect(DESIGN_WIDTH - 16, 0, 16, DESIGN_HEIGHT, "#ff4d5a");
      this.dangerOverlay.alpha = 0;
      this.ui.addChild(this.dangerOverlay);
      this.statusLabel = this.makeText("", 19, "#ffffff", true);
      this.statusLabel.align = "center";
      this.statusLabel.wordWrap = true;
      this.statusLabel.width = 385;
      this.statusLabel.height = 78;
      this.statusLabel.pos(855, 84);
      this.ui.addChild(this.statusLabel);
    }
    updateClock() {
      if (!this.elevatorActive && this.elapsed >= PREP_SECONDS) {
        this.elevatorActive = true;
        this.sound.elevatorOpen();
        this.tutorial.show("elevator", this.mobileControls.visible, this.now, 5);
        this.flashMessage("18:00！下班！！！电梯已开放", "#5bf0a5", 1600);
      }
      this.progressBar.graphics.clear();
      this.progressBar.graphics.drawRoundRect(0, 0, 520, 4, 2, "#32414a");
      this.progressBar.graphics.drawRoundRect(0, 0, Math.max(1, 520 * Math.min(1, this.elapsed / PREP_SECONDS)), 4, 2, this.elevatorActive ? "#5bf0a5" : "#ffc857");
      if (!this.elevatorActive) {
        const ratio = Math.min(1, this.elapsed / PREP_SECONDS);
        const totalSeconds = Math.floor(ratio * 5 * 60);
        const minute = 55 + Math.floor(totalSeconds / 60);
        const second = totalSeconds % 60;
        this.timeLabel.text = `17:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
      } else {
        const post = Math.max(0, Math.floor(this.elapsed - PREP_SECONDS));
        const minute = Math.floor(post / 60);
        const second = post % 60;
        this.timeLabel.text = `18:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
      }
    }
    tryEnterElevator() {
      if (!this.elevatorActive || this.state !== "playing") return false;
      const insideElevator = this.player.x >= 1148 && this.player.x <= 1238 && this.player.y >= 320 && this.player.y <= 535;
      if (!insideElevator) return false;
      this.tutorial.complete("elevator");
      this.win();
      return true;
    }
    updateFootstepNoise(dt) {
      this.footstepNoiseCooldown = Math.max(0, this.footstepNoiseCooldown - dt);
      if (!this.player.isMoving || this.player.isSilent(this.now) || this.footstepNoiseCooldown > 0) return;
      let radius = 44;
      let cadence = 0.62;
      if (this.player.isCrouching) {
        radius = 0;
        cadence = 0.8;
      } else if (this.player.isSprinting) {
        radius = 125;
        cadence = 0.3;
      }
      this.footstepNoiseCooldown = cadence;
      radius *= this.player.noiseMultiplier;
      if (radius <= 1) return;
      for (const enemy of this.enemies) enemy.hearNoise(this.player, radius, this.now);
    }
    updateEnemies(dt) {
      let currentMax = 0;
      let anyAlert = false;
      const detectMultiplier = this.player.detectionMultiplier * (this.player.isCrouching ? 0.82 : 1);
      for (const enemy of this.enemies) {
        if (enemy.update(dt, this.now, this.player, this.obstacles, this.fogs, detectMultiplier)) {
          this.maxDetection = 1;
          this.fail(`${enemy.name}发现了你：
“你先别走！”`);
          return;
        }
        currentMax = Math.max(currentMax, enemy.dangerRatio);
        anyAlert = anyAlert || enemy.dangerRatio > 0.01;
        if (!enemy.knockedOut && distance(enemy, this.player) < 24 && enemy.detection > 0.12) {
          this.maxDetection = Math.max(this.maxDetection, enemy.dangerRatio);
          this.fail(`${enemy.name}抓住了你。`);
          return;
        }
      }
      this.player.isAlerted = anyAlert;
      if (currentMax > 0.12 && !this.firstDangerHintShown) {
        this.firstDangerHintShown = true;
        this.tutorial.show("stealth", this.mobileControls.visible, this.now, 5.2);
      }
      if (currentMax > 0.18 && this.now - this.lastAlertSfxAt > (currentMax > 0.72 ? 0.28 : 0.55)) {
        this.lastAlertSfxAt = this.now;
        this.sound.alert(currentMax);
      }
      this.currentDanger = currentMax;
      this.maxDetection = Math.max(this.maxDetection, currentMax);
      if (currentMax >= 0.78 && this.nearMissReady) {
        this.nearMisses += 1;
        this.nearMissReady = false;
      } else if (currentMax < 0.18) {
        this.nearMissReady = true;
      }
      if (currentMax <= 0.01) {
        this.dangerLabel.text = "安全";
        this.dangerLabel.color = "#5bf0a5";
      } else {
        const percent = Math.round(currentMax * 100);
        this.dangerLabel.text = `警觉 ${percent}%`;
        this.dangerLabel.color = percent >= 75 ? "#ff6868" : "#ffc857";
      }
    }
    updatePickups() {
      for (const pickup of this.pickups) {
        if (!pickup.active) continue;
        pickup.sprite.alpha = distance(pickup, this.player) < 46 ? 1 : 0.7;
      }
      const near = this.pickups.find((p) => p.active && distance(p, this.player) < 46);
      const nearProp = this.interactables.find((p) => distance(p, this.player) < 60 && this.now >= p.cooldownUntil);
      const nearReward = this.rewardStations.find((p) => !p.claimed && distance(p, this.player) < 52);
      if (nearProp && !this.firstInteractHintShown) {
        this.firstInteractHintShown = true;
        this.tutorial.show("interact", this.mobileControls.visible, this.now, 4.6);
      }
      if (near) {
        this.objectiveLabel.text = `E 拾取 ${WEAPONS[near.id].name}`;
      } else if (nearReward) {
        this.objectiveLabel.text = this.player.weapon ? "E 领取下班秘籍 · 三选一" : "先找一把武器，再领取这里的秘籍";
      } else if (nearProp) {
        this.objectiveLabel.text = `E ${nearProp.name}`;
      } else if (this.elevatorActive) {
        this.objectiveLabel.text = `→ 电梯已开放！距出口 ${Math.round(distance(this.player, { x: 1188, y: 425 }))} 步`;
      } else {
        this.objectiveLabel.text = "目标：准备下班，18:00 后进入电梯";
      }
    }
    updateRewardStations() {
      for (const station of this.rewardStations) {
        if (station.claimed) continue;
        const glow = 0.8 + Math.abs(Math.sin(this.now * 3 + station.x)) * 0.2;
        station.sprite.alpha = glow;
        const pulse = 1 + Math.sin(this.now * 3 + station.x) * 0.06;
        station.sprite.scale(pulse, pulse);
      }
    }
    updateElevator() {
      if (this.elevatorActive && !this.elevatorArtActivated) {
        this.elevatorArtActivated = true;
        this.elevatorGlow.graphics.clear();
        this.elevatorGlow.graphics.drawRoundRect(0, 0, 114, 250, 12, "#4ecf8a");
        this.elevatorGlow.graphics.drawRoundRect(7, 7, 100, 236, 10, "#23483a");
        this.elevatorLight.graphics.clear();
        this.elevatorLight.graphics.drawRoundRect(37, -20, 40, 12, 4, "#1b262e");
        this.elevatorLight.graphics.drawCircle(57, -14, 5, "#5bf0a5");
        this.exitSign.text = "↓ EXIT · 下班出口";
        this.exitSign.color = "#70ffb9";
        this.exitTrail.graphics.clear();
        this.exitTrail.graphics.drawLine(1115, 620, 1188, 560, "#5bf0a5", 8);
        this.exitTrail.graphics.drawLine(1188, 560, 1188, 484, "#5bf0a5", 8);
        for (let i = 0; i < 4; i++) {
          this.exitTrail.graphics.drawCircle(1188, 552 - i * 24, 8, "#a8ffd6");
        }
      }
      this.elevatorGlow.alpha = this.elevatorActive ? 0.86 + Math.abs(Math.sin(this.now * 4)) * 0.12 : 0.36;
      this.elevatorDoor.alpha = this.elevatorActive ? 0.28 : 1;
      this.exitTrail.alpha = this.elevatorActive ? 0.23 + 0.1 * Math.abs(Math.sin(this.now * 3)) : 0;
      this.elevatorLight.alpha = this.elevatorActive ? 0.76 + 0.24 * Math.abs(Math.sin(this.now * 6)) : 1;
    }
    updateInteractables() {
      for (const prop of this.interactables) {
        const ready = this.now >= prop.cooldownUntil;
        const nearby = distance(prop, this.player) < 60;
        prop.sprite.alpha = ready ? nearby ? 1 : 0.88 : 0.4;
      }
    }
    updateHud() {
      const movement = this.player.isCrouching ? "蹲伏 · 低噪音" : this.player.isSprinting ? "冲刺 · 高噪音" : "步行";
      this.movementLabel.text = `行动：${movement}`;
      this.movementLabel.color = this.player.isSprinting ? "#ffc857" : this.player.isCrouching ? "#79c8ff" : "#a9d9bf";
      this.buildLabel.text = `秘籍 ${this.upgradesTaken} · 补给 ${this.rewardStations.filter((s) => s.claimed).length}/4 · 击倒 ${this.knockdowns} · 机关 ${this.interactions}`;
      this.weaponLabel.text = `武器：${this.player.weapon ? WEAPONS[this.player.weapon].name : "无"}`;
      const dangerPulse = 0.35 + Math.abs(Math.sin(this.now * 10)) * 0.65;
      this.dangerOverlay.alpha = this.currentDanger > 0.05 ? Math.min(0.34, this.currentDanger * 0.3 * dangerPulse) : 0;
    }
    onKeyDown(e) {
      var _a, _b;
      this.sound.unlock();
      const code = ((_a = e.nativeEvent) == null ? void 0 : _a.code) || e.code || "";
      if (this.state === "menu") {
        if (code === "Enter" || code === "Space") this.beginPlaying();
        return;
      }
      if (code === "Escape" || code === "KeyP") {
        this.togglePause();
        return;
      }
      if (code === "KeyR") {
        this.restart();
        return;
      }
      if (this.state !== "playing") return;
      if ((_b = this.upgradeSystem) == null ? void 0 : _b.handleKey(code)) return;
      this.keys.add(code);
      if (code === "Space") this.attack();
      if (code === "KeyE") this.interact();
      if (code === "KeyT") this.elapsed = Math.max(this.elapsed, PREP_SECONDS);
      if (code === "KeyM") {
        this.mobileControls.toggle();
        this.refreshControlHint();
        this.flashMessage(this.mobileControls.visible ? "移动端控制已开启" : "移动端控制已关闭", "#79c8ff", 700);
      }
      if (code === "F2") this.debugOverlay.toggle();
    }
    onKeyUp(e) {
      var _a;
      const code = ((_a = e.nativeEvent) == null ? void 0 : _a.code) || e.code || "";
      this.keys.delete(code);
    }
    onMouseDown() {
      this.sound.unlock();
      if (this.mobileControls.visible || this.state !== "playing" || this.upgradeSystem.isOpen) return;
      if (Laya.stage.mouseY < 70 || Laya.stage.mouseY > 646) return;
      if (this.player.weapon === "stapler") {
        this.player.aimAt(Laya.stage.mouseX, Laya.stage.mouseY);
      }
      this.attack();
    }
    interact() {
      if (this.state !== "playing" || this.upgradeSystem.isOpen) return;
      const near = this.pickups.find((p) => p.active && distance(p, this.player) < 46);
      if (near) {
        this.player.pickup(near.id);
        this.tutorial.complete("weapon");
        this.tutorial.complete("move");
        this.sound.pickup();
        near.active = false;
        near.sprite.visible = false;
        this.flashMessage(`拿到 ${WEAPONS[near.id].name}`, WEAPONS[near.id].color, 900);
        if (!this.firstWeaponUpgradeGranted) {
          this.firstWeaponUpgradeGranted = true;
          this.tutorial.show("upgrade", this.mobileControls.visible, this.now, 3.2);
          Laya.timer.once(160, this, () => {
            if (this.state === "playing" && !this.upgradeSystem.isOpen) this.openUpgrade();
          });
        }
        return;
      }
      const station = this.rewardStations.find((p) => !p.claimed && distance(p, this.player) < 52);
      if (station) {
        if (!this.player.weapon) {
          this.flashMessage("先拿武器，再来领取强化", "#ffc857", 1e3);
          return;
        }
        station.claimed = true;
        station.sprite.visible = false;
        this.spawnHitBurst(station.x, station.y, "#b98aff", true);
        this.sound.pickup();
        this.openUpgrade();
        return;
      }
      const prop = this.interactables.find((p) => distance(p, this.player) < 60 && this.now >= p.cooldownUntil);
      if (prop) {
        prop.cooldownUntil = this.now + 6;
        this.interactions += 1;
        this.sound.interact();
        const radius = prop.id === "water" ? 340 : prop.id === "printer" ? 280 : 250;
        for (const enemy of this.enemies) enemy.hearNoise(prop, radius, this.now);
        this.spawnNoiseRing(prop.x, prop.y, prop.id === "water" ? "#79c8ff" : "#ffc857");
        const msg = prop.id === "printer" ? "打印机卡纸！附近的人被引过去了" : prop.id === "phone" ? "电话响了！附近的人去查看" : "饮水机倒了！巨大的声响吸引了附近的人";
        this.flashMessage(msg, "#ffc857", 1100);
        return;
      }
      if (!this.elevatorActive && distance(this.player, { x: 1188, y: 425 }) < 90) {
        this.flashMessage("还没到 18:00，继续准备。", "#ffc857", 900);
      }
    }
    attack() {
      if (this.state !== "playing" || this.upgradeSystem.isOpen || !this.player.canAttack() || !this.player.weapon) return;
      this.player.beginAttack();
      this.player.pulseAttack();
      this.sound.attack(this.player.weapon);
      this.attacks += 1;
      const spec = WEAPONS[this.player.weapon];
      const range = spec.range * this.player.attackRangeMultiplier;
      const noise = spec.noiseRadius * this.player.noiseMultiplier * this.player.weaponNoiseMultiplier;
      if (!this.player.isSilent(this.now)) {
        for (const enemy of this.enemies) enemy.hearNoise(this.player, noise, this.now);
        if (noise > 110) this.spawnNoiseRing(this.player.x, this.player.y, spec.color);
      }
      this.drawAttackFx(range, spec.color, spec.ranged);
      const hits = this.findAttackTargets(range, spec.ranged);
      if (this.player.weapon === "stapler") {
        const targetCount = this.player.penetratingStaple ? 2 : 1;
        const shotCount = this.player.doubleStaple ? 2 : 1;
        for (let shot = 0; shot < shotCount; shot++) {
          for (const enemy of hits.slice(0, targetCount)) this.resolveHit(enemy, spec);
        }
      } else if (this.player.weapon === "keyboard") {
        for (const enemy of hits.slice(0, 3)) this.resolveHit(enemy, spec);
      } else if (this.player.weapon === "extinguisher") {
        for (const enemy of hits.slice(0, 4)) this.resolveHit(enemy, spec);
      } else {
        const enemy = hits[0];
        if (enemy) this.resolveHit(enemy, spec);
      }
      if (this.player.weapon === "extinguisher" && this.player.hasWhiteFog) {
        this.spawnFog(
          this.player.x + this.player.facingX * 88,
          this.player.y + this.player.facingY * 88
        );
      }
    }
    resolveHit(enemy, spec) {
      if (enemy.knockedOut) return;
      let value = spec.knockdown;
      if (this.player.weapon === "folder") value += this.player.weaponBonus;
      if ((enemy.kind === "boss" || enemy.kind === "supervisor") && this.player.bossBonus > 0) {
        value += this.player.bossBonus;
      }
      const knocked = enemy.takeHit(value, this.now);
      this.sound.hit(knocked);
      this.spawnHitBurst(enemy.x, enemy.y, spec.color, knocked);
      this.shakeWorld(knocked ? 8 : 4);
      if (knocked) {
        this.knockdowns += 1;
        this.knockdownCombo = this.now - this.lastKnockdownAt < 4 ? this.knockdownCombo + 1 : 1;
        this.lastKnockdownAt = this.now;
        this.player.onKnockdown(this.now);
        this.spawnComboPopup(enemy.x, enemy.y, this.knockdownCombo);
        this.flashMessage(this.knockdownCombo >= 2 ? `连续击倒 ×${this.knockdownCombo} · ${enemy.name}倒了！` : `击倒 ${enemy.name}！`, this.knockdownCombo >= 2 ? "#ffd479" : "#5bf0a5", 650);
      }
    }
    findAttackTargets(range, ranged) {
      const candidates = this.enemies.filter((e) => !e.knockedOut).map((e) => {
        const dx = e.x - this.player.x;
        const dy = e.y - this.player.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const forward = d > 0 ? dx / d * this.player.facingX + dy / d * this.player.facingY : 1;
        return { enemy: e, d, forward };
      });
      return candidates.filter((x) => x.d <= range && x.forward >= (ranged ? 0.87 : 0.3)).filter((x) => !ranged || !segmentBlocked(this.player, x.enemy, this.obstacles)).sort((a, b) => a.d - b.d).map((x) => x.enemy);
    }
    openUpgrade() {
      this.keys.clear();
      const restoreMobile = this.mobileControls.visible;
      if (restoreMobile) this.mobileControls.setVisible(false);
      this.upgradeSystem.open(this.player.weapon, this.chosenUpgrades, (choice) => {
        this.player.applyUpgrade(choice.id);
        this.chosenUpgrades.add(choice.id);
        this.upgradesTaken += 1;
        this.sound.upgrade();
        if (restoreMobile && this.state === "playing") {
          this.mobileControls.setVisible(true);
          this.refreshControlHint();
        }
        this.flashMessage(`获得：${choice.name}`, "#ffc857", 1e3);
      });
    }
    fail(reason) {
      if (this.state !== "playing") return;
      this.state = "failed";
      this.keys.clear();
      this.mobileControls.setVisible(false);
      this.pauseButton.visible = false;
      this.tutorial.layer.visible = false;
      this.sound.fail();
      this.showEndOverlay("下班失败", reason, "#ff6464");
    }
    win() {
      if (this.state !== "playing") return;
      this.state = "escaping";
      this.keys.clear();
      this.mobileControls.setVisible(false);
      this.pauseButton.visible = false;
      this.tutorial.layer.visible = false;
      this.currentDanger = 0;
      this.dangerOverlay.alpha = 0;
      this.statusLabel.text = "叮——！";
      this.statusLabel.color = "#5bf0a5";
      const startX = this.player.x;
      const startY = this.player.y;
      const targetX = 1188;
      const targetY = 425;
      let frame = 0;
      this.elevatorDoor.alpha = 0.22;
      this.sound.elevatorOpen();
      this.spawnHitBurst(targetX, targetY, "#5bf0a5", true);
      const animate = /* @__PURE__ */ __name(() => {
        frame += 1;
        const t = Math.min(1, frame / 22);
        const ease = 1 - Math.pow(1 - t, 2);
        this.player.x = startX + (targetX - startX) * ease;
        this.player.y = startY + (targetY - startY) * ease;
        this.player.sprite.pos(this.player.x, this.player.y);
        this.player.sprite.alpha = 1 - Math.max(0, (t - 0.58) / 0.42);
        if (t >= 0.55) {
          this.elevatorDoor.alpha = Math.min(1, 0.22 + (t - 0.55) * 1.8);
        }
        if (t >= 1) {
          Laya.timer.clear(this, animate);
          this.player.sprite.visible = false;
          this.elevatorDoor.alpha = 1;
          this.sound.elevatorClose();
          this.statusLabel.text = "电梯门已关闭 · 成功逃离公司";
          Laya.timer.once(420, this, () => this.finishWin());
        }
      }, "animate");
      Laya.timer.frameLoop(1, this, animate);
    }
    finishWin() {
      if (this.state !== "escaping") return;
      this.state = "won";
      const post = Math.max(0, Math.floor(this.elapsed - PREP_SECONDS));
      const minute = Math.floor(post / 60);
      const second = post % 60;
      const rank = post <= 45 ? "下班之神" : post <= 120 ? "职场老油条" : "准时下班";
      const bossDown = this.enemies.some((e) => e.kind === "boss" && e.knockedOut);
      const approach = bossDown ? "老板克星" : this.knockdowns >= 4 ? "办公室战神" : this.knockdowns === 0 && this.maxDetection < 0.35 ? "无声下班" : this.interactions >= 2 ? "机关大师" : "自由下班";
      this.showEndOverlay(
        "叮——下班成功！",
        `18:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")} · ${rank} · ${approach}`,
        "#5bf0a5"
      );
    }
    showEndOverlay(titleText, subText, color) {
      const stats = `击倒 ${this.knockdowns}    机关 ${this.interactions}    秘籍 ${this.upgradesTaken}
最高警觉 ${Math.round(this.maxDetection * 100)}%    极限脱险 ${this.nearMisses}`;
      this.panels.showEnd(titleText, subText, stats, color !== "#ff6464", () => this.restart());
    }
    restart() {
      var _a;
      Laya.timer.clearAll(this);
      Laya.stage.offAllCaller(this);
      (_a = this.mobileControls) == null ? void 0 : _a.destroy();
      this.root.destroy(true);
      const next = new _LevelOnePrototype();
      next.start();
      if (typeof window !== "undefined" && window.__gameQA === this) {
        window.__gameQA = next;
      }
    }
    drawAttackFx(range, color, ranged) {
      this.fx.graphics.clear();
      const x2 = this.player.x + this.player.facingX * range;
      const y2 = this.player.y + this.player.facingY * range;
      this.fx.graphics.drawLine(
        this.player.x,
        this.player.y,
        x2,
        y2,
        color,
        ranged ? 4 : this.player.weapon === "extinguisher" ? 18 : 10
      );
      this.attackFlashUntil = this.now + 0.09;
    }
    updateFx() {
      if (this.attackFlashUntil > 0 && this.now > this.attackFlashUntil) {
        this.fx.graphics.clear();
        this.attackFlashUntil = 0;
      }
      const remainingShake = Math.max(0, this.shakeUntil - this.now);
      const wobble = remainingShake / 0.11 * this.shakePower;
      const ox = remainingShake > 0 ? Math.sin(this.now * 155) * wobble : 0;
      const oy = remainingShake > 0 ? Math.cos(this.now * 145) * wobble * 0.55 : 0;
      this.world.pos(ox, oy);
      this.fx.pos(ox, oy);
      if (remainingShake <= 0) this.shakePower = 0;
      for (let i = this.transientFx.length - 1; i >= 0; i--) {
        const item = this.transientFx[i];
        const duration = Math.max(0.01, item.until - item.born);
        const t = Math.max(0, Math.min(1, (this.now - item.born) / duration));
        const scale = 1 + t * item.grow;
        item.sprite.scale(scale, scale);
        item.sprite.alpha = 1 - t;
        if (this.now >= item.until) {
          item.sprite.destroy();
          this.transientFx.splice(i, 1);
        }
      }
    }
    spawnHitBurst(x, y, color, strong) {
      const burst = new Laya.Sprite();
      const radius = strong ? 28 : 18;
      burst.graphics.drawCircle(0, 0, radius, color);
      burst.graphics.drawCircle(0, 0, Math.max(4, radius - 7), "#ffffff");
      burst.pos(x, y);
      burst.alpha = 0.88;
      this.fx.addChild(burst);
      this.transientFx.push({
        sprite: burst,
        born: this.now,
        until: this.now + (strong ? 0.26 : 0.16),
        grow: strong ? 1.6 : 1
      });
      for (let i = 0; i < (strong ? 7 : 4); i++) {
        const p = new Laya.Sprite();
        const angle = Math.PI * 2 * i / (strong ? 7 : 4);
        const px = x + Math.cos(angle) * (strong ? 34 : 25);
        const py = y + Math.sin(angle) * (strong ? 34 : 25);
        p.graphics.drawRect(-3, -3, 6, 6, color);
        p.rotation = angle * 180 / Math.PI;
        p.pos(px, py);
        this.fx.addChild(p);
        this.transientFx.push({
          sprite: p,
          born: this.now,
          until: this.now + 0.22,
          grow: 0.5
        });
      }
    }
    spawnComboPopup(x, y, combo) {
      if (combo < 2) return;
      const pop = new Laya.Sprite();
      const txt = this.makeText(`连击 ×${combo}`, Math.min(34, 22 + combo * 2), "#ffe08a", true);
      txt.width = 160;
      txt.align = "center";
      txt.pos(-80, -57);
      pop.addChild(txt);
      pop.pos(x, y);
      this.fx.addChild(pop);
      this.transientFx.push({ sprite: pop, born: this.now, until: this.now + 0.72, grow: 0.65 });
    }
    spawnNoiseRing(x, y, color) {
      const ring = new Laya.Sprite();
      ring.graphics.drawCircle(0, 0, 34, color);
      ring.graphics.drawCircle(0, 0, 27, "#26343f");
      ring.pos(x, y);
      ring.alpha = 0.3;
      this.fx.addChild(ring);
      this.transientFx.push({
        sprite: ring,
        born: this.now,
        until: this.now + 0.38,
        grow: 2.7
      });
    }
    shakeWorld(power) {
      this.shakePower = Math.min(8, Math.max(this.shakePower, power));
      this.shakeUntil = this.now + 0.11;
    }
    spawnFog(x, y) {
      const sprite = new Laya.Sprite();
      sprite.graphics.drawCircle(0, 0, 84, "#dfe9ee");
      sprite.graphics.drawCircle(-28, 12, 54, "#eef5f7");
      sprite.graphics.drawCircle(34, -10, 58, "#d8e4e9");
      sprite.alpha = 0.4;
      sprite.pos(x, y);
      this.fx.addChild(sprite);
      this.fogs.push({ x, y, radius: 94, until: this.now + 1.8, sprite });
    }
    cleanupFogs() {
      for (let i = this.fogs.length - 1; i >= 0; i--) {
        if (this.now > this.fogs[i].until) {
          this.fogs[i].sprite.destroy();
          this.fogs.splice(i, 1);
        }
      }
    }
    flashMessage(text, color = "#ffffff", duration = 900) {
      const serial = ++this.flashSerial;
      this.statusLabel.text = text;
      this.statusLabel.color = color;
      Laya.timer.once(duration, this, () => {
        if (serial === this.flashSerial && this.state === "playing" && !this.upgradeSystem.isOpen) {
          this.statusLabel.text = "";
        }
      });
    }
    addRewardStation(x, y) {
      const sprite = OfficeArt.rewardBeacon();
      sprite.pos(x, y);
      this.world.addChild(sprite);
      this.rewardStations.push({ x, y, sprite, claimed: false });
    }
    addEnemy(kind, x, y, patrol) {
      this.enemies.push(new Enemy(this.world, kind, x, y, patrol));
    }
    addWeaponPickup(id, x, y) {
      const spec = WEAPONS[id];
      const s = OfficeArt.weaponPickup(id);
      const t = new Laya.Text();
      t.text = spec.name;
      t.color = "#f5f7fa";
      t.fontSize = 13;
      t.bold = true;
      t.align = "center";
      t.width = 110;
      t.pos(-55, 31);
      s.addChild(t);
      s.pos(x, y);
      this.world.addChild(s);
      this.pickups.push({ id, x, y, sprite: s, active: true });
    }
    addDeskObstacle(x, y, width, height, variant) {
      const s = OfficeArt.desk(width, height, variant);
      s.pos(x, y);
      this.world.addChild(s);
      this.obstacles.push({ x, y, width, height });
    }
    addDividerObstacle(x, y, width, height) {
      const s = OfficeArt.divider(width, height);
      s.pos(x, y);
      this.world.addChild(s);
      this.obstacles.push({ x, y, width, height });
    }
    addCabinetObstacle(x, y, width, height) {
      const s = OfficeArt.cabinet(width, height);
      s.pos(x, y);
      this.world.addChild(s);
      this.obstacles.push({ x, y, width, height });
    }
    addPlantDecor(x, y) {
      const s = OfficeArt.plant();
      s.pos(x, y);
      this.world.addChild(s);
    }
    makeProp(kind, name, x, y) {
      const s = OfficeArt.prop(kind);
      s.pos(x, y);
      const t = new Laya.Text();
      t.text = name;
      t.color = "#dbe5ec";
      t.fontSize = 12;
      t.align = "center";
      t.width = 80;
      t.pos(-40, 28);
      s.addChild(t);
      this.world.addChild(s);
      return s;
    }
    isTouchDevice() {
      if (typeof window === "undefined") return false;
      return "ontouchstart" in window || typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
    }
    refreshControlHint() {
      var _a, _b;
      if (!this.hintLabel || !this.movementLabel || !this.buildLabel) return;
      const mobile = (_b = (_a = this.mobileControls) == null ? void 0 : _a.visible) != null ? _b : false;
      this.hintLabel.visible = !mobile;
      this.movementLabel.visible = !mobile;
      this.buildLabel.pos(28, mobile ? 92 : 654);
    }
    updateTutorial() {
      if (this.player.x > 205) {
        this.tutorial.complete("move");
        if (!this.player.weapon) {
          this.tutorial.show("weapon", this.mobileControls.visible, this.now, 5);
        }
      }
    }
    updateDebug(dt) {
      if (!this.debugOverlay.visible) return;
      let enemyAlive = 0;
      let enemyAlerted = 0;
      for (const enemy of this.enemies) {
        if (!enemy.knockedOut) enemyAlive += 1;
        if (!enemy.knockedOut && enemy.dangerRatio > 0.01) enemyAlerted += 1;
      }
      this.debugOverlay.update({
        fps: dt > 0 ? 1 / dt : 0,
        playerX: this.player.x,
        playerY: this.player.y,
        danger: this.currentDanger,
        state: this.state,
        enemyAlive,
        enemyAlerted,
        weapon: this.player.weapon ? WEAPONS[this.player.weapon].name : "无",
        mobile: this.mobileControls.visible,
        elapsed: this.elapsed
      });
    }
    addZoneLabel(text, x, y) {
      const t = this.makeText(text, 15, "#8396a6", true);
      t.pos(x, y);
      this.world.addChild(t);
    }
    makeText(text, size, color, bold) {
      const t = new Laya.Text();
      t.text = text;
      t.fontSize = size;
      t.color = color;
      t.bold = bold;
      return t;
    }
    shuffle(list) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }
  };
  __name(_LevelOnePrototype, "LevelOnePrototype");
  var LevelOnePrototype = _LevelOnePrototype;

  // src/game/RoundRectCompat.ts
  function installRoundRectCompat() {
    var _a;
    const graphicsPrototype = (_a = Laya.Graphics) == null ? void 0 : _a.prototype;
    if (!graphicsPrototype) return;
    graphicsPrototype.drawRoundRect = function(x, y, width, height, radius, color) {
      if (width <= 0 || height <= 0) return;
      const r = Math.max(0, Math.min(radius || 0, width / 2, height / 2));
      if (r < 0.5) {
        this.drawRect(x, y, width, height, color);
        return;
      }
      const segments = r < 5 ? 2 : 5;
      const corners = [
        [width - r, r, -Math.PI / 2],
        [width - r, height - r, 0],
        [r, height - r, Math.PI / 2],
        [r, r, Math.PI]
      ];
      const points = [];
      for (const [cx, cy, start] of corners) {
        for (let k = 0; k <= segments; k++) {
          const angle = start + Math.PI / 2 * k / segments;
          points.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
      }
      this.drawPoly(x, y, points, color);
    };
  }
  __name(installRoundRectCompat, "installRoundRectCompat");

  // src/game/OrientationHint.ts
  function installPortraitOrientationHint() {
    var _a;
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const touch = "ontouchstart" in window || ((_a = navigator == null ? void 0 : navigator.maxTouchPoints) != null ? _a : 0) > 0;
    if (!touch) return;
    const panel = document.createElement("aside");
    panel.id = "landscape-advice";
    panel.setAttribute("role", "note");
    panel.setAttribute("aria-label", "手机屏幕方向提示");
    panel.style.cssText = [
      "display:none",
      "position:fixed",
      "z-index:90000",
      "left:8vw",
      "top:calc(100vw * 0.58 + 20px)",
      "width:84vw",
      "box-sizing:border-box",
      "padding:18px 16px",
      "color:#d5f7e8",
      "background:#162c36",
      "border:1px solid #3c7e75",
      "border-radius:14px",
      "font:500 16px/1.6 system-ui,sans-serif",
      "text-align:center",
      "box-shadow:0 9px 32px rgba(0,0,0,.25)",
      "pointer-events:none"
    ].join(";");
    panel.textContent = "↻  建议横屏游玩｜横屏时地图、视野和操作按钮会更清楚";
    document.body.appendChild(panel);
    const update = /* @__PURE__ */ __name(() => {
      panel.style.display = window.innerHeight > window.innerWidth ? "block" : "none";
    }, "update");
    update();
    window.addEventListener("resize", update);
  }
  __name(installPortraitOrientationHint, "installPortraitOrientationHint");

  // src/Entry.ts
  function main() {
    return __async(this, null, function* () {
      installRoundRectCompat();
      Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO || "fixedauto";
      Laya.stage.alignH = Laya.Stage.ALIGN_CENTER || "center";
      Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE || "middle";
      Laya.stage.bgColor = "#10161d";
      Laya.stage.width = DESIGN_WIDTH;
      Laya.stage.height = DESIGN_HEIGHT;
      const game = new LevelOnePrototype();
      game.start();
      installPortraitOrientationHint();
      if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("qa") === "1") {
        window.__gameQA = game;
      }
    });
  }
  __name(main, "main");

  // INDEX:bundle.js
  window.$_main_ = main;
})();
